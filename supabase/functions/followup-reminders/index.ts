// Supabase Edge Function: followup-reminders
// Triggered daily by pg_cron. Finds submissions with a due next_followup_at
// (where status is not accepted or closed), sends a digest email to James,
// then clears the reminders so they don't fire again.
//
// Auth: pg_cron sends `Authorization: Bearer <CRON_SECRET>`. The function
// rejects anything that doesn't match. Set CRON_SECRET as an Edge Function
// secret in the Supabase dashboard or via the CLI.
//
// Required env (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Required env (manual):
//   CRON_SECRET, RESEND_API_KEY

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function safeEqual(a: string | null, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req: Request) => {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("authorization");
  if (!cronSecret || !safeEqual(auth, `Bearer ${cronSecret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ── Setup ───────────────────────────────────────────────────────────────
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const resendKey = Deno.env.get("RESEND_API_KEY");

  // ── Find due follow-ups ─────────────────────────────────────────────────
  const { data: due, error: fetchErr } = await supabase
    .from("submissions")
    .select("id, business_name, owner_name, email, status, next_followup_at")
    .lte("next_followup_at", new Date().toISOString())
    .not("status", "in", "(accepted,closed)");

  if (fetchErr) {
    console.error("Failed to fetch follow-ups:", fetchErr);
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Send digest email ───────────────────────────────────────────────────
  if (resendKey) {
    const lines = due.map((s) => {
      const name = s.business_name ?? s.owner_name ?? "(no name)";
      return `• ${name} (${s.status}) — ${s.email ?? "(no email)"}\n  https://stratus-creative.com/admin/${s.id}`;
    });

    const body = [
      `${due.length} follow-up${due.length === 1 ? "" : "s"} due:`,
      "",
      lines.join("\n\n"),
      "",
      "These reminders have been cleared. Re-set them in the admin if needed.",
    ].join("\n");

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
          subject: `Follow-up reminders: ${due.length} submission${due.length === 1 ? "" : "s"} due`,
          text: body,
        }),
      });
      if (!res.ok) {
        console.error("Resend error:", res.status, await res.text());
        return new Response(JSON.stringify({ error: "email_failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.error("Email send failed:", err);
      return new Response(JSON.stringify({ error: "email_failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // ── Clear processed reminders ───────────────────────────────────────────
  const ids = due.map((s) => s.id);
  await supabase
    .from("submissions")
    .update({ next_followup_at: null })
    .in("id", ids);

  return new Response(
    JSON.stringify({ ok: true, processed: due.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
