import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase";
import { adminUsersExist, createSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (await adminUsersExist()) {
    return NextResponse.json({ error: "Setup already complete" }, { status: 403 });
  }

  const { email, password } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json(
      { error: "Password must be at least 12 characters" },
      { status: 400 }
    );
  }

  const password_hash = await bcrypt.hash(password, 10);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      email: email.toLowerCase().trim(),
      password_hash,
      role: "admin",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Admin setup failed:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }

  await createSession(data.id);
  return NextResponse.json({ ok: true });
}
