import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { createSession } from "@/lib/admin-auth";
import { getClientIp } from "@/lib/rate-limit";

const THROTTLE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const THROTTLE_THRESHOLD = 10;

function clientIp(request: Request): string {
  return getClientIp(request);
}

function abbreviateUA(ua: string | null): string {
  if (!ua) return "unknown";
  return ua.length > 80 ? ua.slice(0, 80) + "…" : ua;
}

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const ip = clientIp(request);
  const userAgent = request.headers.get("user-agent");
  const supabase = createServerClient();

  // Throttle by IP: count failed_logins from this IP in the last window.
  if (ip) {
    const since = new Date(Date.now() - THROTTLE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("failed_logins")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= THROTTLE_THRESHOLD) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 5 minutes." },
        { status: 429 }
      );
    }
  }

  const normalizedEmail = email.toLowerCase().trim();
  const { data: user } = await supabase
    .from("admin_users")
    .select("id, email, password_hash")
    .eq("email", normalizedEmail)
    .maybeSingle();

  const recordFailure = async () => {
    try {
      await supabase.from("failed_logins").insert({
        ip,
        email_attempted: normalizedEmail,
        user_agent: userAgent,
      });
    } catch (err) {
      console.error("Failed to record failed_login:", err);
    }
  };

  if (!user) {
    await recordFailure();
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    await recordFailure();
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2FA gate: if this user has 2FA enabled, do NOT create a session yet.
  // Set a short-lived pending cookie holding the user id and ask the client
  // to call /api/admin/2fa/verify with the code from the authenticator app.
  const { data: twoFa } = await supabase
    .from("admin_2fa_secrets")
    .select("user_id, enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (twoFa?.enabled) {
    const store = await cookies();
    const pendingExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    store.set("admin-2fa-pending", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: pendingExpires,
      path: "/",
    });
    return NextResponse.json({ require2FA: true });
  }

  // Detect new-device BEFORE creating the new session so the just-created
  // session doesn't pollute the lookup. "New device" = no prior admin_sessions
  // for this user_id with the same ip.
  let isNewDevice = false;
  if (ip) {
    const { count: priorCount } = await supabase
      .from("admin_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("ip", ip);
    isNewDevice = (priorCount ?? 0) === 0;
  } else {
    // No IP available — treat as new-device to err on the side of notifying.
    isNewDevice = true;
  }

  await createSession(user.id, { ip, userAgent });

  // Best-effort: clear failed_logins for this IP on successful login.
  if (ip) {
    void (async () => {
      try {
        await supabase.from("failed_logins").delete().eq("ip", ip);
      } catch (err) {
        console.error("Failed to clear failed_logins:", err);
      }
    })();
  }

  // Best-effort new-device alert. Do not block the response on the email send.
  if (isNewDevice && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const timeET = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const ipDisplay = ip ?? "unknown";
    const uaDisplay = abbreviateUA(userAgent);

    const text = [
      `A new device just signed in to your Stratus Creative admin.`,
      ``,
      `Time: ${timeET} ET`,
      `IP: ${ipDisplay}`,
      `Browser: ${uaDisplay}`,
      ``,
      `If this was you, no action needed. If not, change your password immediately at https://stratus-creative.com/admin/account.`,
    ].join("\n");

    const html = `<p>A new device just signed in to your Stratus Creative admin.</p>
<p><strong>Time:</strong> ${timeET} ET<br/>
<strong>IP:</strong> ${ipDisplay}<br/>
<strong>Browser:</strong> ${uaDisplay}</p>
<p>If this was you, no action needed. If not, <a href="https://stratus-creative.com/admin/account">change your password immediately</a>.</p>`;

    void resend.emails
      .send({
        from: "Stratus Creative Security <security@stratus-creative.com>",
        to: user.email,
        subject: "New sign-in to your Stratus admin account",
        html,
        text,
      })
      .catch((err) => console.error("New-device alert email failed:", err));
  }

  return NextResponse.json({ ok: true });
}
