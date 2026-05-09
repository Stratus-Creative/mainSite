import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { createSession } from "@/lib/admin-auth";
import { verifyTotp } from "@/lib/totp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const PENDING_COOKIE = "admin-2fa-pending";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code: unknown = body?.code;
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const store = await cookies();
  const userId = store.get(PENDING_COOKIE)?.value;
  if (!userId) {
    return NextResponse.json(
      { error: "No 2FA challenge in progress. Sign in again." },
      { status: 401 }
    );
  }

  // Brute-force protection: 5 attempts per 5 minutes per pending userId.
  // After exceeding, force re-login by clearing the pending cookie.
  const rl = await checkRateLimit({
    bucket: `2fa-verify:${userId}`,
    max: 5,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.allowed) {
    store.delete(PENDING_COOKIE);
    return NextResponse.json(
      { error: "Too many attempts. Sign in again." },
      { status: 429 }
    );
  }

  const supabase = createServerClient();
  const { data: secretRow } = await supabase
    .from("admin_2fa_secrets")
    .select("user_id, totp_secret, enabled, recovery_codes")
    .eq("user_id", userId)
    .maybeSingle();

  if (!secretRow || !secretRow.enabled) {
    store.delete(PENDING_COOKIE);
    return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
  }

  const cleaned = code.replace(/\s+/g, "").trim();
  let ok = await verifyTotp(secretRow.totp_secret as string, cleaned);

  // Recovery code path: if TOTP fails, try matching a recovery code (case-insensitive).
  let usedRecovery = false;
  if (!ok && Array.isArray(secretRow.recovery_codes)) {
    const codes = secretRow.recovery_codes as string[];
    const upper = cleaned.toUpperCase();
    const idx = codes.findIndex((c) => c.toUpperCase() === upper);
    if (idx !== -1) {
      ok = true;
      usedRecovery = true;
      const remaining = codes.slice(0, idx).concat(codes.slice(idx + 1));
      await supabase
        .from("admin_2fa_secrets")
        .update({ recovery_codes: remaining })
        .eq("user_id", userId);
    }
  }

  if (!ok) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");
  await createSession(userId, { ip, userAgent });
  store.delete(PENDING_COOKIE);

  return NextResponse.json({ ok: true, usedRecovery });
}
