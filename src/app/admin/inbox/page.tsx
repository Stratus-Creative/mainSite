import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Inbox — Stratus Admin",
  robots: { index: false, follow: false },
};

type SubmissionRow = {
  id: string;
  created_at: string;
  status: string;
  source: string | null;
  owner_name: string | null;
  business_name: string | null;
  email: string | null;
  next_followup_at: string | null;
  snoozed_until: string | null;
  quoted_at: string | null;
  quoted_amount: number | null;
};

type ConversationRow = {
  id: string;
  page_url: string | null;
  created_at: string;
  flagged: boolean | null;
  starred: boolean | null;
  messages: { id: string }[] | null;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function relativeFromNow(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function displayName(s: SubmissionRow): string {
  return s.business_name ?? s.owner_name ?? "—";
}

function SectionCard({
  label,
  count,
  emptyMessage,
  children,
  isEmpty,
}: {
  label: string;
  count: number;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="mt-2">
        {isEmpty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="divide-y divide-border/60">{children}</div>
        )}
      </div>
    </section>
  );
}

export default async function InboxPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = createServerClient();
  const nowIso = new Date().toISOString();
  const twoDaysAgoIso = new Date(
    Date.now() - 2 * 24 * 60 * 60 * 1000
  ).toISOString();
  const sevenDaysAgoIso = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // 2. Triage queue: status = received, not snoozed
  const triageQuery = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, email, next_followup_at, snoozed_until, quoted_at, quoted_amount"
    )
    .eq("status", "received")
    .or(`snoozed_until.is.null,snoozed_until.lte.${nowIso}`)
    .order("created_at", { ascending: true });
  const triage = (triageQuery.data as SubmissionRow[] | null) ?? [];

  // 3. Stalled: reviewing > 2 days, not snoozed
  const stalledQuery = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, email, next_followup_at, snoozed_until, quoted_at, quoted_amount"
    )
    .eq("status", "reviewing")
    .lt("created_at", twoDaysAgoIso)
    .or(`snoozed_until.is.null,snoozed_until.lte.${nowIso}`)
    .order("created_at", { ascending: true });
  const stalled = (stalledQuery.data as SubmissionRow[] | null) ?? [];

  // 4. Follow-ups due: next_followup_at <= now, not accepted/closed
  const followupsQuery = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, email, next_followup_at, snoozed_until, quoted_at, quoted_amount"
    )
    .lte("next_followup_at", nowIso)
    .not("status", "in", "(accepted,closed)")
    .order("next_followup_at", { ascending: true });
  const followups = (followupsQuery.data as SubmissionRow[] | null) ?? [];

  // 5. Quotes outstanding > 7 days
  const quotesQuery = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, email, next_followup_at, snoozed_until, quoted_at, quoted_amount"
    )
    .eq("status", "quoted")
    .lt("quoted_at", sevenDaysAgoIso)
    .order("quoted_at", { ascending: true });
  const quotes = (quotesQuery.data as SubmissionRow[] | null) ?? [];

  // 6. Flagged conversations
  const flaggedQuery = await supabase
    .from("conversations")
    .select("id, page_url, created_at, flagged, starred, messages(id)")
    .eq("flagged", true)
    .order("created_at", { ascending: false })
    .limit(10);
  const flagged = (flaggedQuery.data as ConversationRow[] | null) ?? [];

  // 7. Snoozed
  const snoozedQuery = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, email, next_followup_at, snoozed_until, quoted_at, quoted_amount"
    )
    .gt("snoozed_until", nowIso)
    .order("snoozed_until", { ascending: true });
  const snoozed = (snoozedQuery.data as SubmissionRow[] | null) ?? [];

  // Total actionable: sections 2-6 (deduplicate submission ids; conversations counted separately)
  const actionableSubmissionIds = new Set<string>();
  for (const s of triage) actionableSubmissionIds.add(s.id);
  for (const s of stalled) actionableSubmissionIds.add(s.id);
  for (const s of followups) actionableSubmissionIds.add(s.id);
  for (const s of quotes) actionableSubmissionIds.add(s.id);
  const totalActionable = actionableSubmissionIds.size + flagged.length;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Tab nav */}
        <nav className="mb-8 flex items-center gap-6 border-b border-border/60 pb-4">
          <Link
            href="/admin/inbox"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
          >
            Inbox
          </Link>
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Submissions
          </Link>
          <Link
            href="/admin/chats"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Chats
          </Link>
          <Link
            href="/admin/subscribers"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Subscribers
          </Link>
          <span className="ml-auto">
            <Link
              href="/admin"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Admin
            </Link>
          </span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {todayLabel} ·{" "}
            <span className="text-foreground">
              {totalActionable} total {totalActionable === 1 ? "item" : "items"}{" "}
              needing attention
            </span>
          </p>
        </header>

        <div className="space-y-6">
          {/* Triage */}
          <SectionCard
            label="Triage queue · new & untouched"
            count={triage.length}
            emptyMessage="Nothing new — you're caught up here."
            isEmpty={triage.length === 0}
          >
            {triage.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className="group flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {displayName(s)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.email ?? "—"}
                  </p>
                </div>
                <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
                  {s.source === "audit-request" ? "Audit" : s.source ?? "—"}
                </p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(s.created_at)}
                </p>
                <span
                  aria-hidden
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </SectionCard>

          {/* Stalled */}
          <SectionCard
            label="Stalled · reviewing > 2 days"
            count={stalled.length}
            emptyMessage="Nothing stalled."
            isEmpty={stalled.length === 0}
          >
            {stalled.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className="group flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {displayName(s)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.email ?? "—"}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-amber-400">
                  {relativeTime(s.created_at)}
                </p>
                <span
                  aria-hidden
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </SectionCard>

          {/* Follow-ups due */}
          <SectionCard
            label="Follow-ups due"
            count={followups.length}
            emptyMessage="No follow-ups due."
            isEmpty={followups.length === 0}
          >
            {followups.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className="group flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {displayName(s)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.email ?? "—"}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Due
                  </p>
                  <p className="text-xs text-amber-400">
                    {s.next_followup_at
                      ? `${formatDateTime(
                          s.next_followup_at
                        )} (${relativeTime(s.next_followup_at)})`
                      : "—"}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </SectionCard>

          {/* Quotes outstanding */}
          <SectionCard
            label="Quotes outstanding > 1 week"
            count={quotes.length}
            emptyMessage="All quotes are fresh."
            isEmpty={quotes.length === 0}
          >
            {quotes.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className="group flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {displayName(s)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.email ?? "—"}
                  </p>
                </div>
                <p className="hidden shrink-0 text-sm text-foreground sm:block">
                  {formatCurrency(s.quoted_amount)}
                </p>
                <p className="shrink-0 text-xs text-amber-400">
                  {s.quoted_at ? relativeTime(s.quoted_at) : "—"}
                </p>
                <span
                  aria-hidden
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </SectionCard>

          {/* Flagged chats */}
          <SectionCard
            label="Flagged chats"
            count={flagged.length}
            emptyMessage="No flagged chats."
            isEmpty={flagged.length === 0}
          >
            {flagged.map((c) => (
              <Link
                key={c.id}
                href={`/admin/chats/${c.id}`}
                className="group flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {c.page_url ?? "—"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {relativeTime(c.created_at)}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {(c.messages?.length ?? 0)}{" "}
                  {(c.messages?.length ?? 0) === 1 ? "msg" : "msgs"}
                </p>
                <span
                  aria-hidden
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            ))}
          </SectionCard>

          {/* Snoozed (collapsed) */}
          <details className="rounded-xl border border-border bg-card p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Snoozed ({snoozed.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  hidden by design — click to expand
                </span>
              </div>
            </summary>
            <div className="mt-4 border-t border-border/60 pt-2">
              {snoozed.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nothing snoozed.
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {snoozed.map((s) => (
                    <Link
                      key={s.id}
                      href={`/admin/${s.id}`}
                      className="group flex items-center gap-4 py-3 transition-colors hover:bg-background/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {displayName(s)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.email ?? "—"}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        wakes up{" "}
                        {s.snoozed_until
                          ? relativeFromNow(s.snoozed_until)
                          : "—"}
                      </p>
                      <span
                        aria-hidden
                        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}
