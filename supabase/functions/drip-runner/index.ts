// Supabase Edge Function: drip-runner
// Triggered daily by pg_cron (recommended: 0 14 * * * — one hour after
// followup-reminders). Picks up due drip-sequence steps, sends each next
// email via Resend, advances current_step, and either schedules the next
// step or marks the sequence completed.
//
// Auth: pg_cron sends `Authorization: Bearer <CRON_SECRET>`.
//
// Required env (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Required env (manual):
//   CRON_SECRET, RESEND_API_KEY

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Mirror of src/lib/drip-sequences.ts. Edge functions can't import from the
// Next.js source tree, so we duplicate the definitions here. Keep in sync.
type SubLite = {
  owner_name?: string | null;
  business_name?: string | null;
  project_type?: string | null;
};
type DripStep = {
  delayDays: number;
  subject: string;
  body: (sub: SubLite) => string;
};

function nameOrFallback(sub: SubLite): string {
  return sub.owner_name?.trim() || "there";
}

const SEQUENCES: Record<string, DripStep[]> = {
  "no-reply-followup": [
    {
      delayDays: 3,
      subject: "Following up",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nChecking in on the inquiry you sent over. Happy to answer questions, walk through scope, or set up a 15-minute call — whichever is easiest.\n\nReply when you have a moment.\n\n— James\nStratus Creative`,
    },
    {
      delayDays: 7,
      subject: "One more nudge",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nNot trying to pile on. If timing has shifted or the project is on hold, just say so and I'll close it out cleanly.\n\nIf it's still live, send back what you're thinking and I'll move it forward.\n\n— James`,
    },
    {
      delayDays: 14,
      subject: "Closing this out unless I hear back",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nGoing to close this inquiry on our end so it stops cluttering both our inboxes. Reopening is one reply away — no awkwardness if you come back in a few weeks or months.\n\n— James\nStratus Creative`,
    },
  ],
  "post-quote-followup": [
    {
      delayDays: 5,
      subject: "Did you have any questions about the quote?",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nWanted to check whether the quote made sense and whether anything in the scope needs adjusting. Common edits are timeline, payment split, or trimming a feature.\n\nLet me know what you're thinking.\n\n— James`,
    },
    {
      delayDays: 14,
      subject: "Still interested?",
      body: (sub) =>
        `Hi ${nameOrFallback(sub)},\n\nQuick check-in on the quote I sent. If the answer is "not right now," that's useful to know — I can hold the slot or release it.\n\nReply with a yes, no, or a question.\n\n— James`,
    },
  ],
};

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req: Request) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("authorization");
  if (!cronSecret || !safeEqual(auth, `Bearer ${cronSecret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const resendKey = Deno.env.get("RESEND_API_KEY");

  // Pull due sequences with the joined submission. Supabase nests the FK target.
  const { data: due, error: fetchErr } = await supabase
    .from("drip_sequences")
    .select(
      "id, submission_id, sequence_type, current_step, submissions:submission_id(id, status, email, owner_name, business_name, project_type)"
    )
    .lte("next_send_at", new Date().toISOString())
    .is("completed_at", null)
    .is("cancelled_at", null);

  if (fetchErr) {
    console.error("[drip-runner] fetch failed:", fetchErr);
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  let cancelled = 0;
  const nowIso = new Date().toISOString();

  for (const row of due ?? []) {
    const sub = Array.isArray(row.submissions)
      ? row.submissions[0]
      : row.submissions;
    if (!sub || !sub.email) {
      // No matching submission or missing email — cancel out.
      await supabase
        .from("drip_sequences")
        .update({ cancelled_at: nowIso })
        .eq("id", row.id);
      cancelled += 1;
      continue;
    }

    // If lead reached a terminal state, cancel and skip.
    if (sub.status === "accepted" || sub.status === "closed") {
      await supabase
        .from("drip_sequences")
        .update({ cancelled_at: nowIso })
        .eq("id", row.id);
      cancelled += 1;
      continue;
    }

    const sequence = SEQUENCES[row.sequence_type as string];
    if (!sequence) {
      console.error(
        `[drip-runner] unknown sequence_type ${row.sequence_type} on drip ${row.id}`
      );
      await supabase
        .from("drip_sequences")
        .update({ cancelled_at: nowIso })
        .eq("id", row.id);
      cancelled += 1;
      continue;
    }

    const stepIndex = row.current_step as number;
    const step = sequence[stepIndex];
    if (!step) {
      // Past the last step — mark completed.
      await supabase
        .from("drip_sequences")
        .update({ completed_at: nowIso })
        .eq("id", row.id);
      continue;
    }

    const body = step.body({
      owner_name: sub.owner_name ?? null,
      business_name: sub.business_name ?? null,
      project_type: sub.project_type ?? null,
    });

    if (!resendKey) {
      console.error("[drip-runner] RESEND_API_KEY missing — skipping send");
      continue;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "James at Stratus Creative <james@stratus-creative.com>",
          to: sub.email,
          reply_to: "business@stratus-creative.com",
          subject: step.subject,
          text: body,
        }),
      });
      if (!res.ok) {
        console.error(
          "[drip-runner] resend failed:",
          res.status,
          await res.text()
        );
        continue;
      }
    } catch (err) {
      console.error("[drip-runner] send threw:", err);
      continue;
    }

    sent += 1;

    // Log to outbound_emails (best effort).
    try {
      await supabase.from("outbound_emails").insert({
        submission_id: row.submission_id,
        recipient_email: sub.email,
        subject: step.subject,
        body,
        category: "drip",
      });
    } catch (err) {
      console.error("[drip-runner] outbound log failed:", err);
    }

    // Advance step. If we just sent the last one, mark completed.
    const nextIndex = stepIndex + 1;
    if (nextIndex >= sequence.length) {
      await supabase
        .from("drip_sequences")
        .update({ current_step: nextIndex, completed_at: nowIso })
        .eq("id", row.id);
    } else {
      const nextStep = sequence[nextIndex];
      const nextSendAt = new Date();
      nextSendAt.setUTCDate(nextSendAt.getUTCDate() + nextStep.delayDays);
      await supabase
        .from("drip_sequences")
        .update({
          current_step: nextIndex,
          next_send_at: nextSendAt.toISOString(),
        })
        .eq("id", row.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, cancelled }), {
    headers: { "Content-Type": "application/json" },
  });
});
