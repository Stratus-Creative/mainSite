import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { ChatSearch } from "./chat-search";

export const metadata: Metadata = {
  title: "Bot stats — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FALLBACK_PREFIX = "I don't have a documented answer for that.";

type ConversationRow = {
  id: string;
  page_url: string | null;
  created_at: string;
  flagged: boolean | null;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: string;
  content: string | null;
  created_at: string;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatLatencyMs(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)} s`;
  return `${Math.round(sec / 60)} min`;
}

function truncate(text: string, max = 80): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + "…";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BotStatsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();

  const [convosRes, messagesRes] = await Promise.all([
    supabase
      .from("conversations")
      .select("id, page_url, created_at, flagged")
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("id, conversation_id, role, content, created_at")
      .order("created_at", { ascending: true }),
  ]);

  const conversations = (convosRes.data ?? []) as ConversationRow[];
  const messages = (messagesRes.data ?? []) as MessageRow[];

  // ─── Top metrics ─────────────────────────────────────────────────
  const totalConversations = conversations.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const conversationsLast7 = conversations.filter(
    (c) => new Date(c.created_at).getTime() >= sevenDaysAgo
  ).length;
  const totalMessages = messages.length;
  const avgMessagesPerConvo =
    totalConversations > 0
      ? Math.round((totalMessages / totalConversations) * 10) / 10
      : 0;

  // Median assistant response time: per conversation, walk messages chronologically
  // and pair each user message with the next assistant message.
  const messagesByConvo = new Map<string, MessageRow[]>();
  for (const m of messages) {
    if (!messagesByConvo.has(m.conversation_id)) {
      messagesByConvo.set(m.conversation_id, []);
    }
    messagesByConvo.get(m.conversation_id)!.push(m);
  }

  const latencyMs: number[] = [];
  for (const convoMessages of messagesByConvo.values()) {
    // Already sorted ascending by created_at from the query.
    for (let i = 0; i < convoMessages.length - 1; i++) {
      const cur = convoMessages[i];
      if (cur.role !== "user") continue;
      // Find next assistant message after this user message.
      for (let j = i + 1; j < convoMessages.length; j++) {
        const next = convoMessages[j];
        if (next.role === "assistant") {
          const delta =
            new Date(next.created_at).getTime() -
            new Date(cur.created_at).getTime();
          if (delta >= 0) latencyMs.push(delta);
          break;
        }
        if (next.role === "user") break; // user sent another message before any reply
      }
    }
  }
  const medianLatency = median(latencyMs);

  // Fallback rate
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const fallbackCount = assistantMessages.filter((m) =>
    (m.content ?? "").trim().startsWith(FALLBACK_PREFIX)
  ).length;
  const fallbackRate =
    assistantMessages.length > 0
      ? Math.round((fallbackCount / assistantMessages.length) * 1000) / 10
      : 0;

  const tiles = [
    { label: "Conversations", value: String(totalConversations), tone: "text-foreground" },
    { label: "Last 7 days", value: String(conversationsLast7), tone: "text-accent" },
    { label: "Total messages", value: String(totalMessages), tone: "text-foreground" },
    { label: "Avg msgs / convo", value: String(avgMessagesPerConvo), tone: "text-muted-foreground" },
    {
      label: "Median latency",
      value: formatLatencyMs(medianLatency),
      tone: "text-foreground",
    },
    {
      label: "Fallback rate",
      value: `${fallbackRate.toFixed(1)}%`,
      tone: fallbackRate > 15 ? "text-amber-400" : "text-emerald-400",
    },
  ];

  // ─── Top user questions (last 30 days) ───────────────────────────
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentUserMessages = messages.filter(
    (m) =>
      m.role === "user" &&
      new Date(m.created_at).getTime() >= thirtyDaysAgo &&
      (m.content ?? "").trim().length > 0
  );

  const questionGroups = new Map<
    string,
    { count: number; original: string; conversation_id: string }
  >();
  for (const m of recentUserMessages) {
    const key = (m.content ?? "").trim().toLowerCase();
    if (!key) continue;
    const existing = questionGroups.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      questionGroups.set(key, {
        count: 1,
        original: (m.content ?? "").trim(),
        conversation_id: m.conversation_id,
      });
    }
  }
  const topQuestions = [...questionGroups.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ─── Flagged conversations (latest 20) ───────────────────────────
  const flaggedConvos = conversations
    .filter((c) => c.flagged === true)
    .slice(0, 20)
    .map((c) => ({
      id: c.id,
      page_url: c.page_url,
      created_at: c.created_at,
      message_count: messagesByConvo.get(c.id)?.length ?? 0,
    }));

  // ─── Conversations by page (top 10) ──────────────────────────────
  const pageCounts = new Map<string, number>();
  for (const c of conversations) {
    const key = c.page_url ?? "—";
    pageCounts.set(key, (pageCounts.get(key) ?? 0) + 1);
  }
  const topPages = [...pageCounts.entries()]
    .map(([page_url, count]) => ({ page_url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const maxPageCount = topPages[0]?.count ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Back */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Admin
        </Link>

        {/* Top metrics */}
        <div className="mt-6 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="bg-background px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.label}
              </p>
              <p
                className={`mt-2 text-2xl font-semibold tracking-tight lg:text-3xl ${t.tone}`}
              >
                {t.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="mt-10 flex flex-wrap items-center gap-6 border-b border-border/60 pb-3">
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Submissions
          </Link>
          <Link
            href="/admin/inbox"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Inbox
          </Link>
          <Link
            href="/admin/chats"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Chats
          </Link>
          <Link
            href="/admin/bot-stats"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
          >
            Bot stats
          </Link>
          <Link
            href="/admin/subscribers"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Subscribers
          </Link>
        </div>

        {/* Search */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Search messages
          </p>
          <ChatSearch />
        </section>

        {/* Top user questions */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Top user questions (last 30 days)
          </p>
          {topQuestions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No user questions in the last 30 days.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {topQuestions.map((q, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {q.count}×
                  </span>
                  <Link
                    href={`/admin/chats/${q.conversation_id}`}
                    className="min-w-0 flex-1 truncate text-sm text-foreground transition-colors hover:text-accent"
                  >
                    {truncate(q.original, 110)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Flagged conversations */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Flagged conversations
          </p>
          {flaggedConvos.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing flagged. The bot is keeping up.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {flaggedConvos.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/chats/${c.id}`}
                    className="flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
                  >
                    <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.message_count} msg
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {c.page_url ?? "—"}
                    </p>
                    <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                      {formatDate(c.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Conversations by page */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Conversations by page
          </p>
          {topPages.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No data yet.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {topPages.map((p) => {
                const pct =
                  maxPageCount > 0 ? (p.count / maxPageCount) * 100 : 0;
                return (
                  <li key={p.page_url} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="min-w-0 truncate text-foreground">
                        {p.page_url}
                      </span>
                      <span className="shrink-0 font-mono uppercase tracking-widest text-muted-foreground">
                        {p.count}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-background">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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
