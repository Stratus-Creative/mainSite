import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Chats — Stratus Admin",
  robots: { index: false, follow: false },
};

type RawMessage = {
  content: string | null;
  role: string | null;
  created_at: string;
};

type RawConversation = {
  id: string;
  session_id: string;
  page_url: string | null;
  created_at: string;
  messages: RawMessage[] | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text: string, max = 80) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + "…";
}

export default async function AdminChatsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const { data } = await supabase
    .from("conversations")
    .select(
      "id, session_id, page_url, created_at, messages(content, role, created_at)"
    )
    .order("created_at", { ascending: false });

  const conversations = (data as RawConversation[] | null) ?? [];

  const enriched = conversations.map((c) => {
    const messages = c.messages ?? [];
    const sortedAsc = [...messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const firstUser = sortedAsc.find((m) => m.role === "user");
    const lastMessage = sortedAsc[sortedAsc.length - 1];
    return {
      id: c.id,
      page_url: c.page_url,
      created_at: c.created_at,
      message_count: messages.length,
      first_user_message: firstUser?.content
        ? truncate(firstUser.content, 80)
        : null,
      last_message_at: lastMessage?.created_at ?? c.created_at,
    };
  });

  const totalMessages = enriched.reduce((sum, c) => sum + c.message_count, 0);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = enriched.filter(
    (c) => new Date(c.created_at).getTime() >= sevenDaysAgo
  ).length;
  const avgMessages =
    enriched.length > 0 ? Math.round(totalMessages / enriched.length) : 0;

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

        {/* Summary tiles */}
        <div className="mt-6 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
          {[
            {
              label: "Conversations",
              value: enriched.length,
              style: "text-foreground",
            },
            {
              label: "Total messages",
              value: totalMessages,
              style: "text-foreground",
            },
            {
              label: "Last 7 days",
              value: last7,
              style: "text-accent",
            },
            {
              label: "Avg msgs / convo",
              value: avgMessages,
              style: "text-muted-foreground",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-background px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-semibold ${stat.style}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="mt-10 flex items-center gap-6 border-b border-border/60 pb-3">
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Submissions
          </Link>
          <Link
            href="/admin/chats"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
          >
            Chats
          </Link>
        </div>

        {/* Conversations list */}
        <div className="mt-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h1 className="text-lg font-semibold tracking-tight">
              All conversations
            </h1>
            <span className="font-mono text-xs text-muted-foreground">
              {enriched.length} total
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {enriched.map((c) => (
              <Link
                key={c.id}
                href={`/admin/chats/${c.id}`}
                className="group flex items-center gap-4 py-4 transition-colors hover:bg-card/30 sm:gap-6"
              >
                <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.message_count} msg
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {c.first_user_message ?? (
                      <span className="text-muted-foreground">
                        (no user message yet)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.page_url ?? "—"}
                  </p>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-muted-foreground">
                    Last: {formatDate(c.last_message_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Started: {formatDate(c.created_at)}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}

            {enriched.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No conversations yet. The chat widget will populate this once
                visitors start using it.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
