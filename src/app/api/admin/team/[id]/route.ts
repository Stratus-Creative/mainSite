import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("id, email, role")
    .eq("id", id)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Best effort: clear their sessions and 2FA secrets explicitly. CASCADE
  // should also handle this depending on migration, but we don't rely on it.
  await supabase.from("admin_sessions").delete().eq("user_id", id);
  await supabase.from("admin_2fa_secrets").delete().eq("user_id", id);

  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) {
    console.error("Team delete failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  await emitEvent(admin.id, "team.removed", {
    id: target.id,
    email: target.email,
    role: target.role,
  });

  return NextResponse.json({ ok: true });
}
