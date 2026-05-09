import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import StatusUpdateEmail, { type StatusKey } from "@/emails/status-update";
import { renderEmail } from "@/emails/render";
import { emitEvent } from "@/lib/webhook-dispatch";
import { createPortalToken, PORTAL_TOKEN_TTL_DAY } from "@/lib/portal-tokens";

type NotifiableStatus = StatusKey;

const SUBJECTS: Record<NotifiableStatus, string> = {
  reviewing: "We're reviewing your project",
  accepted: "Your project is confirmed — let's get started",
  closed: "Closing this project out",
};

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    id,
    status,
    internal_notes,
    next_followup_at,
    tags,
    snoozed_until,
    lost_reason,
    lost_notes,
    scoped_hours,
    actual_hours,
    audit_report,
    audit_summary,
    audit_score,
  } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch existing submission to detect status transition + grab client info
  const { data: existing, error: fetchError } = await supabase
    .from("submissions")
    .select(
      "status, email, business_name, owner_name, project_type, quoted_scope, quoted_amount"
    )
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const previousStatus = existing.status;

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (internal_notes !== undefined) updates.internal_notes = internal_notes;
  if (next_followup_at !== undefined) updates.next_followup_at = next_followup_at;
  if (tags !== undefined && Array.isArray(tags)) {
    updates.tags = tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
  }
  if (snoozed_until !== undefined) updates.snoozed_until = snoozed_until;
  if (lost_reason !== undefined) updates.lost_reason = lost_reason;
  if (lost_notes !== undefined) updates.lost_notes = lost_notes;
  if (scoped_hours !== undefined) updates.scoped_hours = scoped_hours;
  if (actual_hours !== undefined) updates.actual_hours = actual_hours;
  if (audit_report !== undefined) updates.audit_report = audit_report;
  if (audit_summary !== undefined) updates.audit_summary = audit_summary;
  if (audit_score !== undefined) updates.audit_score = audit_score;

  const { error } = await supabase
    .from("submissions")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (status !== undefined && status !== previousStatus) {
    await emitEvent(admin.id, "submission.status_changed", {
      id,
      from: previousStatus,
      to: status,
      business_name: existing.business_name,
      owner_name: existing.owner_name,
    });

    // Auto-cancel any active drip sequences when the deal terminates.
    if (status === "accepted" || status === "closed") {
      try {
        await supabase
          .from("drip_sequences")
          .update({ cancelled_at: new Date().toISOString() })
          .eq("submission_id", id)
          .is("cancelled_at", null)
          .is("completed_at", null);
      } catch (err) {
        console.error("[update-submission] drip auto-cancel failed:", err);
      }
    }
  }

  // Notify client on meaningful status transitions (skip "quoted" — handled by send-quote)
  const notifiable: NotifiableStatus[] = ["reviewing", "accepted", "closed"];
  if (
    status &&
    status !== previousStatus &&
    notifiable.includes(status) &&
    existing.email
  ) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const name = existing.owner_name || null;
      const statusKey = status as NotifiableStatus;

      // Generate a 24-hour portal magic link so the status email doubles as a
      // one-click sign-in. Best-effort — if it fails, the email still goes out
      // with the legacy /quote/{id} fallback.
      const portal = await createPortalToken(id, PORTAL_TOKEN_TTL_DAY);

      const { html, text } = await renderEmail(
        StatusUpdateEmail({
          status: statusKey,
          name,
          businessName: existing.business_name ?? null,
          projectType: existing.project_type ?? null,
          submissionId: id,
          scope: existing.quoted_scope ?? null,
          amount: existing.quoted_amount ?? null,
          portalUrl: portal?.url ?? null,
        })
      );
      await resend.emails.send({
        from: "Stratus Creative <business@stratus-creative.com>",
        to: existing.email,
        replyTo: "business@stratus-creative.com",
        subject: SUBJECTS[statusKey],
        html,
        text,
      });
    } catch (err) {
      console.error("Status transition email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
