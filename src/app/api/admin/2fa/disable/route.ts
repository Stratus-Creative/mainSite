import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("admin_2fa_secrets")
    .delete()
    .eq("user_id", admin.id);

  if (error) {
    console.error("2FA disable failed:", error);
    return NextResponse.json({ error: "Disable failed" }, { status: 500 });
  }

  await emitEvent(admin.id, "team.2fa_disabled", {
    id: admin.id,
    email: admin.email,
  });

  return NextResponse.json({ ok: true });
}
