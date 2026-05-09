import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createPortalToken } from "@/lib/portal-tokens";
import { emitEvent } from "@/lib/webhook-dispatch";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stratus-creative.com";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createServerClient();
  const { data: sub } = await supabase
    .from("submissions")
    .select(
      "id, source, email, owner_name, business_name, website_url, audit_report, audit_summary, audit_score"
    )
    .eq("id", id)
    .single();

  if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (!sub.email) {
    return NextResponse.json({ error: "Submission has no email" }, { status: 400 });
  }
  if (!sub.audit_report || sub.audit_report.trim().length < 20) {
    return NextResponse.json(
      { error: "Audit report is empty. Write at least one section before sending." },
      { status: 400 }
    );
  }

  // 14-day magic link token to view the audit page
  const token = await createPortalToken(id, 14 * 24 * 60 * 60 * 1000);
  const auditUrl = `${SITE_URL}/audit/${token}`;
  const clientName = sub.owner_name || sub.business_name || "there";

  const subject = sub.audit_summary
    ? `Your website audit — ${sub.audit_summary}`
    : `Your website audit from Stratus Creative`;

  const text = [
    `Hi ${clientName},`,
    "",
    `I've finished the audit of ${sub.website_url || "your site"}. The full write-up is here:`,
    "",
    auditUrl,
    "",
    sub.audit_summary ? `Quick takeaway: ${sub.audit_summary}` : null,
    "",
    "Reply to this email if anything needs clarifying or you want to talk through next steps.",
    "",
    "— James",
    "Stratus Creative",
    "business@stratus-creative.com",
  ]
    .filter(Boolean)
    .join("\n");

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const sent = await resend.emails.send({
      from: "James at Stratus Creative <james@stratus-creative.com>",
      to: sub.email,
      replyTo: "business@stratus-creative.com",
      subject,
      text,
    });

    await supabase.from("outbound_emails").insert({
      submission_id: id,
      admin_id: admin.id,
      category: "audit",
      subject,
      body: text,
      recipient_email: sub.email,
      message_id: sent.data?.id ?? null,
    });

    const nowIso = new Date().toISOString();
    await supabase
      .from("submissions")
      .update({ audit_sent_at: nowIso, status: "quoted" })
      .eq("id", id);

    void emitEvent(admin.id, "email.sent", {
      submissionId: id,
      category: "audit",
      subject,
      auditUrl,
    });

    return NextResponse.json({ ok: true, auditUrl });
  } catch (err) {
    console.error("[send-audit]", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
