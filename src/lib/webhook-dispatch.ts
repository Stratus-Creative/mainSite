import { createHmac } from "crypto";
import { createServerClient } from "./supabase";
import { validateOutboundUrl } from "./url-safety";

export const EVENT_TYPES = [
  "submission.created",
  "submission.status_changed",
  "quote.sent",
  "chat.flagged",
  "subscriber.added",
  "prompt.saved",
  "email.sent",
  "email.received",
  "drip.sent",
  "team.invited",
  "team.removed",
  "team.joined",
  "team.invite_revoked",
  "team.2fa_enabled",
  "team.2fa_disabled",
  "bot.tone_issue",
] as const;

export type WebhookEvent = (typeof EVENT_TYPES)[number];

type WebhookSubscription = {
  id: string;
  url: string;
  label: string | null;
  events: string[];
  active: boolean;
  secret: string | null;
};

/**
 * Insert a row into the `events` audit log. Errors are logged but never thrown —
 * audit log failures must not break the originating request.
 */
export async function recordEvent(
  actorId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("events").insert({
      actor_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
    if (error) {
      console.error("[webhook-dispatch] recordEvent failed:", error);
    }
  } catch (err) {
    console.error("[webhook-dispatch] recordEvent threw:", err);
  }
}

function sign(body: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Look up active webhook subscriptions for `event` and POST the payload to each.
 * One bad subscriber never blocks the others. Errors are logged but never thrown.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("webhook_subscriptions")
      .select("id, url, label, events, active, secret")
      .eq("active", true)
      .contains("events", [event]);

    if (error) {
      console.error("[webhook-dispatch] subscription query failed:", error);
      return;
    }

    const subs = (data ?? []) as WebhookSubscription[];
    if (subs.length === 0) return;

    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "User-Agent": "Stratus-Creative-Webhook/1",
        };
        if (sub.secret) {
          headers["X-Stratus-Signature"] = sign(body, sub.secret);
        }
        // SSRF guard: never POST to private/loopback addresses, even if a
        // subscription was inserted directly to the DB before validation existed.
        const urlError = validateOutboundUrl(sub.url);
        if (urlError) {
          throw new Error(
            `Webhook ${sub.id} (${sub.url}) blocked: ${urlError}`
          );
        }
        const res = await fetch(sub.url, {
          method: "POST",
          headers,
          body,
        });
        if (!res.ok) {
          throw new Error(
            `Webhook ${sub.id} (${sub.url}) returned ${res.status}`
          );
        }
        return { id: sub.id, status: res.status };
      })
    );

    for (const r of results) {
      if (r.status === "rejected") {
        console.error("[webhook-dispatch] delivery failed:", r.reason);
      }
    }
  } catch (err) {
    console.error("[webhook-dispatch] dispatchWebhook threw:", err);
  }
}

/**
 * Convenience: record the event in the audit log and dispatch to subscribers
 * in parallel. This is the call site most code should use. Fire-and-forget safe.
 */
export async function emitEvent(
  actorId: string | null,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  // Use resourceId from payload if available, falling back to a generated marker.
  const resourceId =
    typeof payload.id === "string" && payload.id.length > 0
      ? payload.id
      : "00000000-0000-0000-0000-000000000000";
  const resourceType = event.split(".")[0];

  await Promise.allSettled([
    recordEvent(actorId, event, resourceType, resourceId, payload),
    dispatchWebhook(event, payload),
  ]);
}
