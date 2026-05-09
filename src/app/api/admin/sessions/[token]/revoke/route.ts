import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";

const SESSION_COOKIE = "admin-session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const store = await cookies();
  const currentToken = store.get(SESSION_COOKIE)?.value;
  if (token === currentToken) {
    return NextResponse.json(
      { error: "Cannot revoke the current session via this endpoint" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data: target } = await supabase
    .from("admin_sessions")
    .select("token, user_id")
    .eq("token", token)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Allow if owner OR current admin has admin role.
  if (target.user_id !== admin.id && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("admin_sessions").delete().eq("token", token);
  return NextResponse.json({ ok: true });
}
