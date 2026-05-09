import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submissionId =
    typeof payload.submissionId === "string" ? payload.submissionId : "";
  const subject =
    typeof payload.subject === "string" ? payload.subject.trim() : "";
  const body = typeof payload.body === "string" ? payload.body : "";
  const category =
    typeof payload.category === "string" && payload.category.trim()
      ? payload.category.trim()
      : "manual";

  if (!submissionId || !subject || !body.trim()) {
    return NextResponse.json(
      { error: "submissionId, subject, and body are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data: submission, error: fetchErr } = await supabase
    .from("submissions")
    .select("id, email, owner_name, business_name")
    .eq("id", submissionId)
    .single();

  if (fetchErr || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (!submission.email) {
    return NextResponse.json(
      { error: "Submission has no recipient email" },
      { status: 400 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let messageId: string | null = null;
  try {
    const result = await resend.emails.send({
      from: "James at Stratus Creative <james@stratus-creative.com>",
      to: submission.email,
      replyTo: "business@stratus-creative.com",
      subject,
      text: body,
    });
    messageId = result.data?.id ?? null;
  } catch (err) {
    console.error("[send-email] Resend failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }

  const { error: insertErr } = await supabase.from("outbound_emails").insert({
    submission_id: submissionId,
    admin_id: admin.id,
    category,
    subject,
    body,
    recipient_email: submission.email,
    message_id: messageId,
  });

  if (insertErr) {
    console.error("[send-email] outbound_emails insert failed:", insertErr);
    // Email already sent — surface the inconsistency but don't fail the request.
  }

  await emitEvent(admin.id, "email.sent", {
    submissionId,
    category,
    subject,
  });

  return NextResponse.json({ ok: true });
}
