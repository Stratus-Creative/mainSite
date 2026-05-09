import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Bot tone monitoring — Stratus Admin",
  robots: { index: false, follow: false },
};

type ToneIssue = {
  rule?: unknown;
  severity?: unknown;
  excerpt?: unknown;
  message?: unknown;
};

type ToneEventRow = {
  id: string;
  resource_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function getIssues(metadata: Record<string, unknown> | null): ToneIssue[] {
  if (!metadata || typeof metadata !== "object") return [];
  const raw = (metadata as { issues?: unknown }).issues;
  return Array.isArray(raw) ? (raw as ToneIssue[]) : [];
}

function getScore(metadata: Record<string, unknown> | null): number {
  if (!metadata) return 0;
  const s = (metadata as { score?: unknown }).score;
  return typeof s === "number" ? s : 0;
}

function getPreview(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "";
  const p = (metadata as { content_preview?: unknown }).content_preview;
  return typeof p === "string" ? p : "";
}

function getConversationId(
  metadata: Record<string, unknown> | null
): string | null {
  if (!metadata) return null;
  const c = (metadata as { conversationId?: unknown }).conversationId;
  return typeof c === "string" && c.length > 0 ? c : null;
}

export default async function BotTonePage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  // Total assistant replies in the last 30 days (denominator for sampling rate).
  const { count: totalAssistant } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "assistant")
    .gte("created_at", sinceIso);

  // All recent tone-issue events.
  const { data: eventRows } = await supabase
    .from("events")
    .select("id, resource_id, metadata, created_at")
    .eq("action", "bot.tone_issue")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(100);

  const events = (eventRows ?? []) as ToneEventRow[];

  // Aggregate stats.
  let totalScore = 0;
  let scoredCount = 0;
  const ruleCounts: Record<string, number> = {};
  for (const ev of events) {
    const score = getScore(ev.metadata);
    if (score > 0) {
      totalScore += score;
      scoredCount += 1;
    }
    for (const issue of getIssues(ev.metadata)) {
      const rule = typeof issue.rule === "string" ? issue.rule : "unknown";
      ruleCounts[rule] = (ruleCounts[rule] ?? 0) + 1;
    }
  }

  const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;
  const totalReplies = totalAssistant ?? 0;
  // Sampled rate is fixed at 5% — show actual events / (sampled subset estimate).
  // Cleaner: just show what fraction of all replies got flagged.
  const flaggedRate =
    totalReplies > 0
      ? ((events.length / totalReplies) * 100).toFixed(2)
      : "0.00";

  const topRule = Object.entries(ruleCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Admin
        </Link>

        <header className="mt-6 border-b border-border/60 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bot tone monitoring
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            5% of bot replies are sampled and run through the voice checker.
            Issues land here.
          </p>
        </header>

        {/* Tile row */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Replies (30d)
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {totalReplies.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ~5% sampled for tone
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Avg score
            </p>
            <p
              className={`mt-3 text-2xl font-semibold tracking-tight ${
                avgScore !== null ? scoreColor(avgScore) : "text-muted-foreground"
              }`}
            >
              {avgScore !== null ? avgScore : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              flagged events only
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Tone issues
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {events.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {flaggedRate}% of all replies
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Top rule
            </p>
            <p className="mt-3 text-sm font-mono text-foreground break-all">
              {topRule ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {topRule ? `${ruleCounts[topRule]} hits` : "no data"}
            </p>
          </div>
        </section>

        {/* Events list */}
        <section className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Recent flagged replies
          </p>

          {events.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No tone issues flagged. Either the bot&apos;s behaving or
              sampling hasn&apos;t found anything yet.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((ev) => {
                const score = getScore(ev.metadata);
                const issues = getIssues(ev.metadata);
                const preview = getPreview(ev.metadata);
                const conversationId = getConversationId(ev.metadata);
                return (
                  <li
                    key={ev.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`font-mono text-sm font-semibold ${scoreColor(score)}`}
                        >
                          {score}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {formatDateTime(ev.created_at)}
                        </span>
                      </div>
                      {conversationId && (
                        <Link
                          href={`/admin/chats/${conversationId}`}
                          className="text-xs text-accent transition-colors hover:underline"
                        >
                          View conversation →
                        </Link>
                      )}
                    </div>

                    {issues.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {issues.map((iss, idx) => {
                          const rule =
                            typeof iss.rule === "string" ? iss.rule : "rule";
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full border border-border/60 bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                            >
                              {rule}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {preview && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">
                        {preview}
                        {preview.length >= 200 && "…"}
                      </p>
                    )}

                    {issues.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                        {issues.map((iss, idx) => {
                          const message =
                            typeof iss.message === "string"
                              ? iss.message
                              : "";
                          const excerpt =
                            typeof iss.excerpt === "string"
                              ? iss.excerpt
                              : "";
                          return (
                            <li
                              key={idx}
                              className="text-xs text-muted-foreground"
                            >
                              <span className="text-foreground">{message}</span>
                              {excerpt && (
                                <>
                                  {" "}— <span className="italic">&ldquo;{excerpt}&rdquo;</span>
                                </>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
