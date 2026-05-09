// Supabase Edge Function: publish-notes
// Triggered every 30 minutes by pg_cron. Finds notes where scheduled_at <= now()
// and published_at is null, marks them published, sends a Resend broadcast to the
// audience, then fires the Vercel deploy hook so the static site rebuilds.
//
// Auth: pg_cron sends `Authorization: Bearer <CRON_SECRET>`.
//
// Required env (auto-injected by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Required env (manual secrets):
//   CRON_SECRET, RESEND_API_KEY, RESEND_AUDIENCE_ID, VERCEL_DEPLOY_HOOK_URL

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = "https://stratus-creative.com";

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
  const audienceId = Deno.env.get("RESEND_AUDIENCE_ID");
  const deployHookUrl = Deno.env.get("VERCEL_DEPLOY_HOOK_URL");

  // ── Find due notes ──────────────────────────────────────────────────────
  const { data: due, error: fetchErr } = await supabase
    .from("notes")
    .select("id, slug, title, description")
    .lte("scheduled_at", new Date().toISOString())
    .is("published_at", null);

  if (fetchErr) {
    console.error("Failed to fetch due notes:", fetchErr);
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ ok: true, published: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Mark as published ───────────────────────────────────────────────────
  const ids = due.map((n: { id: string }) => n.id);
  const publishedAt = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("notes")
    .update({ published_at: publishedAt })
    .in("id", ids);

  if (updateErr) {
    console.error("Failed to mark notes published:", updateErr);
    return new Response(JSON.stringify({ error: "update_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Send Resend broadcast per article ───────────────────────────────────
  if (resendKey && audienceId) {
    for (const note of due as Array<{ id: string; slug: string; title: string; description: string }>) {
      const articleUrl = `${SITE_URL}/notes/${note.slug}`;

      const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
  <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin-bottom:24px;">
    Decoded — Stratus Creative
  </p>
  <h1 style="font-size:24px;font-weight:600;line-height:1.3;margin-bottom:16px;">${note.title}</h1>
  <p style="font-size:16px;line-height:1.6;color:#555;margin-bottom:24px;">${note.description}</p>
  <a href="${articleUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-size:14px;font-weight:500;">
    Read the article →
  </a>
  <p style="font-size:12px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
    You're receiving this because you subscribed to Decoded at stratus-creative.com.
  </p>
</div>`.trim();

      const text = `${note.title}\n\n${note.description}\n\nRead it here: ${articleUrl}`;

      try {
        // Create broadcast
        const createRes = await fetch("https://api.resend.com/broadcasts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audience_id: audienceId,
            from: "Stratus Creative <business@stratus-creative.com>",
            reply_to: "business@stratus-creative.com",
            subject: note.title,
            html,
            text,
          }),
        });

        if (!createRes.ok) {
          console.error(
            `Broadcast create failed for ${note.slug}:`,
            createRes.status,
            await createRes.text()
          );
          continue;
        }

        const { id: broadcastId } = await createRes.json();

        // Send broadcast
        const sendRes = await fetch(
          `https://api.resend.com/broadcasts/${broadcastId}/send`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}` },
          }
        );

        if (!sendRes.ok) {
          console.error(
            `Broadcast send failed for ${note.slug}:`,
            sendRes.status,
            await sendRes.text()
          );
        }
      } catch (err) {
        console.error(`Newsletter send error for ${note.slug}:`, err);
      }
    }
  }

  // ── Fire Vercel deploy hook ─────────────────────────────────────────────
  if (deployHookUrl) {
    try {
      const hookRes = await fetch(deployHookUrl, { method: "POST" });
      if (!hookRes.ok) {
        console.error("Deploy hook failed:", hookRes.status, await hookRes.text());
      }
    } catch (err) {
      console.error("Deploy hook error:", err);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, published: due.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
