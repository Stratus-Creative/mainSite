import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: invite } = await supabase
    .from("admin_invites")
    .select("token, email, role")
    .eq("token", token)
    .maybeSingle();
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("admin_invites")
    .delete()
    .eq("token", token);
  if (error) {
    console.error("Invite delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  await emitEvent(admin.id, "team.invite_revoked", {
    email: invite.email,
    role: invite.role,
  });

  return NextResponse.json({ ok: true });
}
