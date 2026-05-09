import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stratus-creative.com";
const INVITE_DAYS = 7;

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const rawEmail: unknown = body?.email;
  const role: unknown = body?.role;

  if (typeof rawEmail !== "string" || !rawEmail.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const email = rawEmail.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);

  const { error: insertErr } = await supabase.from("admin_invites").insert({
    token,
    email,
    role,
    invited_by: admin.id,
    expires_at: expires.toISOString(),
  });
  if (insertErr) {
    console.error("Invite insert failed:", insertErr);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  const acceptUrl = `${SITE_URL}/admin/accept-invite?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const text = [
        `${admin.email} invited you to join the Stratus Creative admin as ${role}.`,
        ``,
        `Accept this invite (expires in ${INVITE_DAYS} days):`,
        acceptUrl,
        ``,
        `If you weren't expecting this, you can ignore this email.`,
      ].join("\n");
      const html = `<p><strong>${admin.email}</strong> invited you to join the Stratus Creative admin as <strong>${role}</strong>.</p>
<p><a href="${acceptUrl}">Accept this invite</a> — expires in ${INVITE_DAYS} days.</p>
<p style="color:#888;font-size:12px">If you weren't expecting this, you can ignore this email.</p>`;
      await resend.emails.send({
        from: "Stratus Creative <business@stratus-creative.com>",
        to: email,
        subject: "You've been invited to Stratus Admin",
        html,
        text,
      });
    } catch (err) {
      console.error("Invite email send failed:", err);
      // Non-fatal: invite row is already created.
    }
  }

  await emitEvent(admin.id, "team.invited", {
    email,
    role,
    expires_at: expires.toISOString(),
  });

  return NextResponse.json({ ok: true });
}
