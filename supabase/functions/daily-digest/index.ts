// Supabase Edge Function: daily-digest
// Triggered daily by pg_cron (recommended: 0 13 * * *). Builds a plaintext
// digest of yesterday's activity and sends it to business@stratus-creative.com.
// If yesterday was quiet, send anyway with a one-liner.
//
// Auth: pg_cron sends `Authorization: Bearer <CRON_SECRET>`.
//
// Required env (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Required env (manual):
//   CRON_SECRET, RESEND_API_KEY

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function yesterdayWindow(): { start: string; end: string; label: string } {
  const now = new Date();
  // "Yesterday" in UTC — start at 00:00 UTC of (today - 1), end at 00:00 UTC of today.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 1);
  const label = start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return { start: start.toISOString(), end: end.toISOString(), label };
}

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

  const { start, end, label } = yesterdayWindow();

  // Run each query independently — none should block the others.
  const [
    submissionsRes,
    quotesRes,
    statusChangesRes,
    chatsRes,
    flaggedRes,
    subscribersRes,
    followupsRes,
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, business_name, owner_name, email, created_at")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true }),
    supabase
      .from("submissions")
      .select("id, business_name, owner_name, quoted_amount, quoted_at")
      .gte("quoted_at", start)
      .lt("quoted_at", end)
      .order("quoted_at", { ascending: true }),
    supabase
      .from("events")
      .select("resource_id, metadata, created_at")
      .eq("action", "submission.status_changed")
      .gte("created_at", start)
      .lt("created_at", end),
    supabase
      .from("conversations")
      .select("id, created_at")
      .gte("created_at", start)
      .lt("created_at", end),
    supabase
      .from("events")
      .select("resource_id, created_at")
      .eq("action", "chat.flagged")
      .gte("created_at", start)
      .lt("created_at", end),
    // Newsletter signups live in Resend's audience, but we emit a
    // 'subscriber.added' event each time. Count those as the local proxy.
    supabase
      .from("events")
      .select("id, metadata, created_at")
      .eq("action", "subscriber.added")
      .gte("created_at", start)
      .lt("created_at", end),
    // Pending follow-ups due today + tomorrow (window: now → +48h)
    supabase
      .from("submissions")
      .select("id, business_name, owner_name, next_followup_at, status")
      .gte("next_followup_at", new Date().toISOString())
      .lt(
        "next_followup_at",
        new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      )
      .not("status", "in", "(accepted,closed)")
      .order("next_followup_at", { ascending: true }),
  ]);

  const submissions = submissionsRes.data ?? [];
  const quotes = quotesRes.data ?? [];
  const statusChanges = statusChangesRes.data ?? [];
  const chats = chatsRes.data ?? [];
  const flagged = flaggedRes.data ?? [];
  const subscribers = subscribersRes.data ?? [];
  const followups = followupsRes.data ?? [];

  const total =
    submissions.length +
    quotes.length +
    statusChanges.length +
    chats.length +
    flagged.length +
    subscribers.length;

  function fmtMoney(n: number | null | undefined): string {
    if (n === null || n === undefined) return "—";
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  function fmtName(s: { business_name?: string | null; owner_name?: string | null }) {
    return s.business_name ?? s.owner_name ?? "(no name)";
  }

  const lines: string[] = [];
  lines.push(`Stratus daily digest — ${label}`);
  lines.push("");

  if (total === 0) {
    lines.push("Nothing happened yesterday — quiet day.");
  } else {
    if (submissions.length > 0) {
      lines.push(`New submissions (${submissions.length}):`);
      for (const s of submissions) {
        lines.push(`  • ${fmtName(s)} — ${s.email ?? "(no email)"}`);
      }
      lines.push("");
    }
    if (quotes.length > 0) {
      lines.push(`Quotes sent (${quotes.length}):`);
      for (const q of quotes) {
        lines.push(`  • ${fmtName(q)} — ${fmtMoney(q.quoted_amount as number)}`);
      }
      lines.push("");
    }
    if (statusChanges.length > 0) {
      lines.push(`Status changes (${statusChanges.length}):`);
      for (const e of statusChanges) {
        const m = (e.metadata ?? {}) as Record<string, unknown>;
        const name =
          (m.business_name as string | null) ??
          (m.owner_name as string | null) ??
          "(unknown)";
        lines.push(`  • ${name}: ${m.from ?? "?"} → ${m.to ?? "?"}`);
      }
      lines.push("");
    }
    if (chats.length > 0) {
      lines.push(`New chats: ${chats.length}`);
    }
    if (flagged.length > 0) {
      lines.push(`Flagged chats: ${flagged.length}`);
    }
    if (subscribers.length > 0) {
      lines.push(`Newsletter signups: ${subscribers.length}`);
    }
    if (chats.length > 0 || flagged.length > 0 || subscribers.length > 0) {
      lines.push("");
    }
  }

  if (followups.length > 0) {
    lines.push(`Follow-ups due in next 48h (${followups.length}):`);
    for (const f of followups) {
      const when = f.next_followup_at
        ? new Date(f.next_followup_at as string).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/New_York",
          })
        : "—";
      lines.push(`  • ${fmtName(f)} (${f.status}) — ${when}`);
    }
    lines.push("");
  }

  lines.push("https://stratus-creative.com/admin");

  const body = lines.join("\n");

  if (!resendKey) {
    console.error("[daily-digest] RESEND_API_KEY missing");
    return new Response(JSON.stringify({ error: "no_resend_key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Stratus Creative <notifications@stratus-creative.com>",
        to: "business@stratus-creative.com",
        subject: `Stratus daily digest — ${label}`,
        text: body,
      }),
    });
    if (!res.ok) {
      console.error("[daily-digest] resend failed:", res.status, await res.text());
      return new Response(JSON.stringify({ error: "email_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("[daily-digest] send threw:", err);
    return new Response(JSON.stringify({ error: "email_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      label,
      counts: {
        submissions: submissions.length,
        quotes: quotes.length,
        status_changes: statusChanges.length,
        chats: chats.length,
        flagged: flagged.length,
        subscribers: subscribers.length,
        upcoming_followups: followups.length,
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
