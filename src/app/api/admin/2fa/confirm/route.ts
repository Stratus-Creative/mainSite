import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { verifyTotp } from "@/lib/totp";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code: unknown = body?.code;
  if (typeof code !== "string" || !code.trim()) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: row } = await supabase
    .from("admin_2fa_secrets")
    .select("user_id, totp_secret, enabled")
    .eq("user_id", admin.id)
    .maybeSingle();

  if (!row || !row.totp_secret) {
    return NextResponse.json({ error: "No 2FA setup in progress" }, { status: 404 });
  }
  if (row.enabled) {
    return NextResponse.json({ error: "2FA already enabled" }, { status: 409 });
  }

  if (!(await verifyTotp(row.totp_secret as string, code))) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const { error } = await supabase
    .from("admin_2fa_secrets")
    .update({ enabled: true, enabled_at: new Date().toISOString() })
    .eq("user_id", admin.id);

  if (error) {
    console.error("2FA confirm update failed:", error);
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 });
  }

  await emitEvent(admin.id, "team.2fa_enabled", {
    id: admin.id,
    email: admin.email,
  });

  return NextResponse.json({ ok: true });
}
