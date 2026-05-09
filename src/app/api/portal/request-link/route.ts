import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { isEmail, clampString } from "@/lib/validate";
import { createPortalToken, PORTAL_TOKEN_TTL_HOUR } from "@/lib/portal-tokens";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Rate limit per IP — prevents email-bombing a victim with magic links
    // and bounds the cost of brute-force enumeration.
    const ip = getClientIp(request);
    const rl = await checkRateLimit({
      bucket: `portal-link:${ip}`,
      max: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.allowed) {
      // Maintain enum-safe response shape — return ok=true regardless.
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const rawEmail = clampString(body?.email, 254);
    if (!rawEmail || !isEmail(rawEmail)) {
      // Still return ok=true to avoid leaking enumeration via error shape.
      return NextResponse.json({ ok: true });
    }
    const email = rawEmail.toLowerCase();

    const supabase = createServerClient();

    // Case-insensitive match. submissions.email is stored as the user typed it,
    // so we lowercase both sides via ilike for safety.
    const { data: matches, error } = await supabase
      .from("submissions")
      .select("id, business_name, owner_name, project_type, status")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[portal/request-link] submissions lookup failed:", error);
      return NextResponse.json({ ok: true });
    }

    const submissions = matches ?? [];
    if (submissions.length === 0) {
      // Don't leak whether the email exists.
      return NextResponse.json({ ok: true });
    }

    // Generate a token per matching submission.
    const links: Array<{
      url: string;
      label: string;
    }> = [];
    for (const s of submissions) {
      const result = await createPortalToken(s.id, PORTAL_TOKEN_TTL_HOUR);
      if (!result) continue;
      const label =
        s.business_name ||
        s.owner_name ||
        (s.project_type ? `${s.project_type} project` : "Your project");
      links.push({ url: result.url, label });
    }

    if (links.length === 0) {
      return NextResponse.json({ ok: true });
    }

    // Send one email containing every link.
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const subject =
        links.length === 1
          ? "Your sign-in link for Stratus Creative"
          : "Your sign-in links for Stratus Creative";

      const linksHtml = links
        .map(
          (l) =>
            `<p style="margin:12px 0"><a href="${l.url}" style="color:#2057FF;text-decoration:underline">${escapeHtml(l.label)} →</a></p>`
        )
        .join("");
      const linksText = links
        .map((l) => `${l.label}: ${l.url}`)
        .join("\n");

      const html = `<!doctype html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#FAFAF7; color:#0A0A0A; padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #EAE8E2;border-radius:12px;padding:32px">
    <p style="font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6B6B6B;margin:0 0 16px">Stratus Creative · Portal</p>
    <h1 style="font-family:'Instrument Serif', Georgia, serif;font-size:28px;line-height:1.2;margin:0 0 16px">Your sign-in link${links.length > 1 ? "s" : ""}.</h1>
    <p style="font-size:15px;line-height:1.6;color:#0A0A0A;margin:0 0 8px">Click the link below to open your project portal. The link is good for the next hour.</p>
    ${linksHtml}
    <p style="font-size:13px;line-height:1.6;color:#6B6B6B;margin:24px 0 0">If you didn't request this, you can safely ignore this email — no action will be taken on your account.</p>
  </div>
</body></html>`;

      const text = `Your sign-in link${links.length > 1 ? "s" : ""} for Stratus Creative:

${linksText}

The link${links.length > 1 ? "s are" : " is"} good for the next hour. If you didn't request this, you can ignore this email.`;

      await resend.emails.send({
        from: "Stratus Creative <business@stratus-creative.com>",
        to: rawEmail,
        replyTo: "business@stratus-creative.com",
        subject,
        html,
        text,
      });
    } catch (err) {
      console.error("[portal/request-link] resend send failed:", err);
      // Still return ok=true — the user shouldn't be able to tell.
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/request-link]", err);
    return NextResponse.json({ ok: true });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
