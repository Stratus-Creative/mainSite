import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { emitEvent } from "@/lib/webhook-dispatch";
import { safeEqual } from "@/lib/timing-safe";

// Resend inbound parsing posts JSON when an email is received at a configured
// domain. We accept either a `?token=` query param OR the `X-Stratus-Token`
// header — both must match RESEND_INBOUND_SECRET.
//
// The handler is best-effort: if matching/insert fails, we log and still return
// 200 so Resend doesn't endlessly retry on our DB errors.

type ResendInboundPayload = {
  from?: { email?: string; name?: string } | string;
  to?: unknown;
  subject?: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  message_id?: string;
  [key: string]: unknown;
};

function extractFromEmail(payload: ResendInboundPayload): string | null {
  const f = payload.from;
  if (!f) return null;
  if (typeof f === "string") {
    const match = f.match(/<([^>]+)>/);
    return (match ? match[1] : f).trim().toLowerCase();
  }
  return f.email?.trim().toLowerCase() ?? null;
}

export async function POST(request: Request) {
  const expected = process.env.RESEND_INBOUND_SECRET;
  if (!expected) {
    console.error("[resend-inbound] RESEND_INBOUND_SECRET not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 401 });
  }

  const url = new URL(request.url);
  const tokenParam = url.searchParams.get("token");
  const tokenHeader = request.headers.get("x-stratus-token");
  if (!safeEqual(tokenParam, expected) && !safeEqual(tokenHeader, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: ResendInboundPayload;
  try {
    payload = (await request.json()) as ResendInboundPayload;
  } catch (err) {
    console.error("[resend-inbound] invalid JSON:", err);
    return NextResponse.json({ ok: true });
  }

  const fromEmail = extractFromEmail(payload);
  const subject = typeof payload.subject === "string" ? payload.subject : null;
  const bodyText = typeof payload.text === "string" ? payload.text : null;
  const bodyHtml = typeof payload.html === "string" ? payload.html : null;

  if (!fromEmail) {
    console.warn("[resend-inbound] no from email — ignoring");
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = createServerClient();

    // Find the most recent submission whose email matches (case-insensitive).
    const { data: matched } = await supabase
      .from("submissions")
      .select("id, status")
      .ilike("email", fromEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const submissionId = (matched?.id as string | undefined) ?? null;

    // Always record the inbound — even if unmatched (submissionId may be null).
    const { error: insertErr } = await supabase.from("inbound_emails").insert({
      submission_id: submissionId,
      from_email: fromEmail,
      subject,
      body_text: bodyText,
      body_html: bodyHtml,
      raw: payload as unknown as Record<string, unknown>,
    });

    if (insertErr) {
      console.error("[resend-inbound] insert failed:", insertErr);
    }

    if (submissionId) {
      // Auto-progress on first reply: received → reviewing.
      if (matched?.status === "received") {
        await supabase
          .from("submissions")
          .update({ status: "reviewing" })
          .eq("id", submissionId);
      }

      // Auto-cancel any active drip sequences for this lead.
      try {
        await supabase
          .from("drip_sequences")
          .update({ cancelled_at: new Date().toISOString() })
          .eq("submission_id", submissionId)
          .is("cancelled_at", null)
          .is("completed_at", null);
      } catch (err) {
        console.error("[resend-inbound] drip cancel failed:", err);
      }

      await emitEvent(null, "email.received", {
        submission_id: submissionId,
        from_email: fromEmail,
        subject,
      });
    } else {
      console.warn(`[resend-inbound] no submission match for ${fromEmail}`);
    }
  } catch (err) {
    console.error("[resend-inbound] handler threw:", err);
  }

  return NextResponse.json({ ok: true });
}
