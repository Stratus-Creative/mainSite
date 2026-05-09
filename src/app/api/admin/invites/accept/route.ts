import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase";
import { createSession } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token: unknown = body?.token;
  const password: unknown = body?.password;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 12) {
    return NextResponse.json(
      { error: "Password must be at least 12 characters" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data: invite } = await supabase
    .from("admin_invites")
    .select("token, email, role, invited_by, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();

  if (
    !invite ||
    invite.used_at ||
    new Date(invite.expires_at as string) <= new Date()
  ) {
    return NextResponse.json(
      { error: "Invite is invalid or expired" },
      { status: 400 }
    );
  }

  const email = (invite.email as string).toLowerCase().trim();
  const role = invite.role as "admin" | "staff";

  // If a user already exists with this email, bail.
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "An account already exists for this email" },
      { status: 409 }
    );
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: created, error: insertErr } = await supabase
    .from("admin_users")
    .insert({ email, password_hash, role })
    .select("id, email, role")
    .single();

  if (insertErr || !created) {
    console.error("Accept-invite user insert failed:", insertErr);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }

  await supabase
    .from("admin_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token);

  await createSession(created.id);

  await emitEvent(created.id, "team.joined", {
    id: created.id,
    email: created.email,
    role: created.role,
  });

  return NextResponse.json({ ok: true });
}
