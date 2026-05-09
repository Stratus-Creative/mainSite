import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { buildTotpSetup } from "@/lib/totp";

export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // If 2FA is already enabled, refuse — they need to disable first.
  const { data: existing } = await supabase
    .from("admin_2fa_secrets")
    .select("user_id, enabled")
    .eq("user_id", admin.id)
    .maybeSingle();

  if (existing?.enabled) {
    return NextResponse.json(
      { error: "2FA is already enabled. Disable it first to re-enroll." },
      { status: 409 }
    );
  }

  const setup = await buildTotpSetup(admin.email);

  // Upsert pending (enabled=false) secret with recovery codes. The secret
  // and recovery codes only become trusted when the user confirms.
  const { error } = await supabase
    .from("admin_2fa_secrets")
    .upsert(
      {
        user_id: admin.id,
        totp_secret: setup.secret,
        enabled: false,
        recovery_codes: setup.recoveryCodes,
        enabled_at: null,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("2FA setup upsert failed:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }

  return NextResponse.json({
    secret: setup.secret,
    otpauth_url: setup.otpauthUrl,
    qrCodeDataUrl: setup.qrCodeDataUrl,
    recoveryCodes: setup.recoveryCodes,
  });
}
