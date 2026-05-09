import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { safeEqual } from "@/lib/timing-safe";

export const dynamic = "force-dynamic";

type ResendWebhookPayload = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[] | string;
    subject?: string;
    created_at?: string;
    [key: string]: unknown;
  };
};

const ALLOWED_EVENT_TYPES = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.opened",
  "email.clicked",
  "email.bounced",
  "email.complained",
  "email.failed",
]);

function authorize(req: NextRequest): boolean {
  const expected = process.env.RESEND_NEWSLETTER_SECRET;
  if (!expected) return false;
  const headerToken = req.headers.get("x-stratus-token");
  const queryToken = req.nextUrl.searchParams.get("token");
  return safeEqual(headerToken, expected) || safeEqual(queryToken, expected);
}

function firstRecipient(to: string[] | string | undefined): string | null {
  if (!to) return null;
  if (Array.isArray(to)) return to[0] ?? null;
  if (typeof to === "string") return to;
  return null;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = (await req.json()) as ResendWebhookPayload;
  } catch {
    // Always return 200 so Resend doesn't endlessly retry malformed bodies.
    return Response.json({ ok: true, ignored: "invalid_json" }, { status: 200 });
  }

  const eventType = payload.type;
  if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
    return Response.json({ ok: true, ignored: "unknown_type" }, { status: 200 });
  }

  const data = payload.data ?? {};
  const recipient = firstRecipient(data.to);
  if (!recipient) {
    return Response.json({ ok: true, ignored: "no_recipient" }, { status: 200 });
  }

  // Optional sender filter — only log events from our newsletter sender.
  const newsletterFrom = process.env.NEWSLETTER_FROM_EMAIL;
  if (newsletterFrom) {
    const senderField = typeof data.from === "string" ? data.from : "";
    if (senderField && !senderField.toLowerCase().includes(newsletterFrom.toLowerCase())) {
      return Response.json({ ok: true, ignored: "wrong_sender" }, { status: 200 });
    }
  }

  const occurredAt = data.created_at ?? payload.created_at ?? new Date().toISOString();

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("newsletter_events").insert({
      email: recipient,
      event_type: eventType,
      message_id: data.email_id ?? null,
      campaign_id: null,
      occurred_at: occurredAt,
      metadata: data,
    });
    if (error) {
      console.error("[resend-newsletter] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[resend-newsletter] handler threw:", err);
  }

  // Always 200 — webhooks should be best-effort and idempotent on the receiver.
  return Response.json({ ok: true }, { status: 200 });
}
