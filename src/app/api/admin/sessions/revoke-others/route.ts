import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

const SESSION_COOKIE = "admin-session";

export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await cookies();
  const currentToken = store.get(SESSION_COOKIE)?.value;
  if (!currentToken) {
    return NextResponse.json({ error: "No active session" }, { status: 400 });
  }

  const supabase = createServerClient();
  await supabase
    .from("admin_sessions")
    .delete()
    .eq("user_id", admin.id)
    .neq("token", currentToken);

  return NextResponse.json({ ok: true });
}
