import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/inquiries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase";
import { emitEvent } from "@/lib/webhook-dispatch";
import { scoreSubmission } from "@/lib/lead-scoring";
import {
  isEmail,
  clampString,
  optionalString,
  safeSessionId,
} from "@/lib/validate";

const PER_IP_MAX = 5;
const PER_IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const IDEMPOTENCY_WINDOW_MS = 5 * 60 * 1000;

const FIELD_LIMITS = {
  name: 80,
  business: 120,
  phone: 32,
  email: 254,
  message: 5000,
  short: 64,
  url: 256,
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = await checkRateLimit({
      bucket: `contact:${ip}`,
      max: PER_IP_MAX,
      windowMs: PER_IP_WINDOW_MS,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));

    const email = clampString(body.email, FIELD_LIMITS.email);
    const message = clampString(body.message, FIELD_LIMITS.message);

    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "invalid_message" }, { status: 400 });
    }

    const ownerName = optionalString(body.ownerName, FIELD_LIMITS.name);
    const businessName = optionalString(body.businessName, FIELD_LIMITS.business);
    const phone = optionalString(body.phone, FIELD_LIMITS.phone);
    const projectType = optionalString(body.projectType, FIELD_LIMITS.short);
    const budget = optionalString(body.budget, FIELD_LIMITS.short);
    const contactPref = optionalString(body.contactPref, FIELD_LIMITS.short);
    const websiteUrl = optionalString(body.websiteUrl, FIELD_LIMITS.url);
    const concern = optionalString(body.concern, FIELD_LIMITS.message);
    const category = optionalString(body.category, FIELD_LIMITS.short);
    const city = optionalString(body.city, FIELD_LIMITS.short);
    const source =
      optionalString(body.source, FIELD_LIMITS.short) ?? category ?? "start-form";
    const sessionId = safeSessionId(body.sessionId);
    const chatSessionId =
      typeof body.chatSessionId === "string" && body.chatSessionId.trim()
        ? body.chatSessionId.trim().slice(0, 128)
        : null;
    const visitorSessionId =
      typeof body.visitorSessionId === "string" && body.visitorSessionId.trim()
        ? body.visitorSessionId.trim().replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 128)
        : null;

    // Idempotency: dedupe submissions from the same email within a short window.
    const supabase = createServerClient();
    const since = new Date(Date.now() - IDEMPOTENCY_WINDOW_MS).toISOString();
    const { data: recent } = await supabase
      .from("submissions")
      .select("id")
      .eq("email", email)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent) {
      return NextResponse.json({ success: true, id: recent.id, deduped: true });
    }

    const { id } = await createInquiry({
      source,
      ownerName,
      businessName,
      email,
      phone,
      projectType,
      budget,
      contactPref,
      smsConsent: body.smsConsent === "true" || body.smsConsent === true,
      websiteUrl,
      concern,
      message,
      category,
      city,
      ...(sessionId ? { sessionId } : {}),
    });

    console.log("New lead:", {
      source,
      hasEmail: true,
      submissionId: id,
    });

    // Best-effort: link this submission to a prior chat conversation,
    // if the visitor's browser carried a chat session ID.
    if (chatSessionId && id) {
      try {
        const { data: conv } = await supabase
          .from("conversations")
          .select("id")
          .eq("session_id", chatSessionId)
          .maybeSingle();
        if (conv?.id) {
          const { error: attribError } = await supabase
            .from("chat_attribution")
            .upsert(
              {
                conversation_id: conv.id as string,
                submission_id: id,
              },
              { onConflict: "conversation_id" }
            );
          if (attribError) {
            console.error(
              "[/api/contact] chat_attribution upsert failed:",
              attribError
            );
          }
        }
      } catch (err) {
        console.error("[/api/contact] chat attribution lookup threw:", err);
      }
    }

    // Best-effort: build attribution from page_views for this visitor session.
    if (visitorSessionId && id) {
      try {
        const { data: pageViewRows } = await supabase
          .from("page_views")
          .select(
            "page_url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, created_at"
          )
          .eq("session_id", visitorSessionId)
          .order("created_at", { ascending: true });

        const rows = pageViewRows ?? [];
        if (rows.length > 0) {
          const first = rows[0];
          const last = rows[rows.length - 1];
          const buildTouch = (r: typeof first) => ({
            page_url: r.page_url ?? null,
            referrer: r.referrer ?? null,
            utm: {
              source: r.utm_source ?? null,
              medium: r.utm_medium ?? null,
              campaign: r.utm_campaign ?? null,
              content: r.utm_content ?? null,
              term: r.utm_term ?? null,
            },
            at: r.created_at,
          });
          const attribution = {
            first_touch: buildTouch(first),
            last_touch: buildTouch(last),
            total_pages_viewed: rows.length,
          };
          const { error: attribErr } = await supabase
            .from("submissions")
            .update({ attribution })
            .eq("id", id);
          if (attribErr) {
            console.error("[/api/contact] attribution update failed:", attribErr);
          }
        }
      } catch (err) {
        console.error("[/api/contact] attribution lookup threw:", err);
      }
    }

    await emitEvent(null, "submission.created", {
      id,
      business_name: businessName ?? null,
      owner_name: ownerName ?? null,
      email,
      source,
      project_type: projectType ?? null,
    });

    // Fire-and-forget: score the lead via Anthropic and persist the result.
    // Don't await — never block the response on AI scoring.
    void scoreSubmission({
      owner_name: ownerName ?? null,
      business_name: businessName ?? null,
      email,
      source,
      project_type: projectType ?? null,
      budget: budget ?? null,
      message,
      website_url: websiteUrl ?? null,
      concern: concern ?? null,
    })
      .then(async (score) => {
        if (!score) return;
        const { error: scoreError } = await supabase
          .from("submissions")
          .update({ lead_score: score })
          .eq("id", id);
        if (scoreError) {
          console.error("[/api/contact] lead_score update failed:", scoreError);
        }
      })
      .catch((err) => console.error("[/api/contact] scoring threw:", err));

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
