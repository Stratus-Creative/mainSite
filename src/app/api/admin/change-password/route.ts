import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "Current and new password required" },
      { status: 400 }
    );
  }
  if (newPassword.length < 12) {
    return NextResponse.json(
      { error: "New password must be at least 12 characters" },
      { status: 400 }
    );
  }
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Verify current password
  const { data: user } = await supabase
    .from("admin_users")
    .select("password_hash")
    .eq("id", admin.id)
    .single();

  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  // Update with new hash
  const newHash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: newHash })
    .eq("id", admin.id);

  if (error) {
    console.error("Password update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Invalidate all OTHER sessions for this user — keep the current one alive.
  const store = await cookies();
  const currentToken = store.get("admin-session")?.value;
  if (currentToken) {
    await supabase
      .from("admin_sessions")
      .delete()
      .eq("user_id", admin.id)
      .neq("token", currentToken);
  }

  return NextResponse.json({ ok: true });
}
