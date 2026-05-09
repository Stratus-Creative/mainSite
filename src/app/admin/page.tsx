import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";
import { SubmissionsList, type SubmissionRow } from "./submissions-list";
import { NewSubmissionWatcher } from "./new-submission-watcher";

export const metadata: Metadata = {
  title: "Admin — Stratus Creative",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type EventRow = {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type MetricsSubmission = {
  id: string;
  created_at: string;
  status: string;
  quoted_amount: number | null;
  quoted_at: string | null;
};

const CLOSED_STATES = new Set(["accepted", "closed"]);

const SECTION_GROUPS: Array<{
  label: string;
  items: Array<{ label: string; href: string; hint: string }>;
}> = [
  {
    label: "Pipeline",
    items: [
      { label: "Inbox", href: "/admin/inbox", hint: "Focus view" },
      { label: "Analytics", href: "/admin/analytics", hint: "Win rates" },
      { label: "Email templates", href: "/admin/email-templates", hint: "Reusable bodies" },
    ],
  },
  {
    label: "Chat & AI",
    items: [
      { label: "Chats", href: "/admin/chats", hint: "Transcripts" },
      { label: "Bot stats", href: "/admin/bot-stats", hint: "Performance" },
      { label: "Bot tone", href: "/admin/bot-tone", hint: "Voice flags" },
      { label: "Prompts", href: "/admin/prompts", hint: "Edit & version" },
      { label: "AI costs", href: "/admin/ai-costs", hint: "LLM spend" },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Subscribers", href: "/admin/subscribers", hint: "Newsletter" },
      { label: "Notes", href: "/admin/notes", hint: "Decoded essays" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Activity log", href: "/admin/activity", hint: "Audit trail" },
      { label: "Webhooks", href: "/admin/webhooks", hint: "Outbound" },
      { label: "System status", href: "/admin/status", hint: "Health" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Account", href: "/admin/account", hint: "Password & 2FA" },
      { label: "Team", href: "/admin/team", hint: "Invites" },
      { label: "Sessions", href: "/admin/sessions", hint: "Active devices" },
    ],
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

function eventLabel(ev: EventRow): string {
  const meta = ev.metadata ?? {};
  const business = typeof meta.business_name === "string" ? meta.business_name : null;
  const summary = typeof meta.summary === "string" ? meta.summary : null;
  const detail = business ?? summary ?? null;
  const resource = ev.resource_type ?? "item";
  return detail ? `${ev.action} ${resource} · ${detail}` : `${ev.action} ${resource}`;
}

type HeatmapCell = { date: string; count: number };

function buildHeatmap(submissions: { created_at: string }[]): HeatmapCell[][] {
  const days = 84; // 12 weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();
  for (const s of submissions) {
    const d = new Date(s.created_at);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  // Fill days oldest → newest
  const flat: HeatmapCell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    flat.push({ date: key, count: buckets.get(key) ?? 0 });
  }

  // Reshape to 7 rows x 12 cols (column-major weeks)
  const rows: HeatmapCell[][] = Array.from({ length: 7 }, () => []);
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row;
      rows[row].push(flat[idx]);
    }
  }
  return rows;
}

function intensityClass(count: number): string {
  if (count <= 0) return "bg-card border border-border/60";
  if (count <= 2) return "bg-accent/30";
  if (count <= 5) return "bg-accent/60";
  return "bg-accent";
}

export default async function AdminPage() {
  // Defense-in-depth auth check
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const supabase = createServerClient();

  const [submissionsRes, metricsRes, eventsRes] = await Promise.all([
    supabase
      .from("submissions")
      .select(
        "id, created_at, status, source, owner_name, business_name, project_type, budget, email, tags, snoozed_until"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("submissions")
      .select("id, created_at, status, quoted_amount, quoted_at"),
    supabase
      .from("events")
      .select("id, action, resource_type, resource_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const submissions = (submissionsRes.data ?? []) as SubmissionRow[];
  const metricsRows = (metricsRes.data ?? []) as MetricsSubmission[];
  // events table may not exist yet in some envs — swallow that case.
  const events = (eventsRes.error ? [] : (eventsRes.data ?? [])) as EventRow[];

  const monthStart = startOfMonth();

  // Metrics
  const pipelineValue = metricsRows
    .filter((s) => s.status === "quoted")
    .reduce((sum, s) => sum + (s.quoted_amount ?? 0), 0);

  const revenueThisMonth = metricsRows
    .filter(
      (s) =>
        s.status === "accepted" &&
        s.quoted_at &&
        new Date(s.quoted_at) >= monthStart
    )
    .reduce((sum, s) => sum + (s.quoted_amount ?? 0), 0);

  const revenueAllTime = metricsRows
    .filter((s) => s.status === "accepted")
    .reduce((sum, s) => sum + (s.quoted_amount ?? 0), 0);

  const acceptedCount = metricsRows.filter((s) => s.status === "accepted").length;
  const receivedTotal = metricsRows.filter((s) => !CLOSED_STATES.has(s.status)).length;
  const conversionRate =
    receivedTotal > 0 ? Math.round((acceptedCount / receivedTotal) * 100) : 0;

  const ttqHours = metricsRows
    .filter((s) => s.quoted_at)
    .map((s) => {
      const created = new Date(s.created_at).getTime();
      const quoted = new Date(s.quoted_at as string).getTime();
      return Math.max(0, (quoted - created) / 3_600_000);
    });
  const medianTTQ = Math.round(median(ttqHours));

  const submissionsThisMonth = metricsRows.filter(
    (s) => new Date(s.created_at) >= monthStart
  ).length;

  const tiles = [
    { label: "Pipeline", value: formatCurrency(pipelineValue), tone: "text-foreground" },
    {
      label: "Closed (mo)",
      value: formatCurrency(revenueThisMonth),
      tone: "text-emerald-400",
    },
    {
      label: "Closed (all)",
      value: formatCurrency(revenueAllTime),
      tone: "text-emerald-400",
    },
    { label: "Conversion", value: `${conversionRate}%`, tone: "text-accent" },
    {
      label: "Median TTQ",
      value: medianTTQ > 0 ? `${medianTTQ}h` : "—",
      tone: "text-foreground",
    },
    {
      label: "New (mo)",
      value: String(submissionsThisMonth),
      tone: "text-foreground",
    },
  ];

  const heatmap = buildHeatmap(metricsRows.map((s) => ({ created_at: s.created_at })));

  const latestCreatedAt =
    submissions.length > 0 ? submissions[0].created_at : new Date(0).toISOString();

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="bg-background px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t.label}
              </p>
              <p className={`mt-2 text-2xl font-semibold tracking-tight lg:text-3xl ${t.tone}`}>
                {t.value}
              </p>
            </div>
          ))}
        </div>

        {/* Command center — every admin destination */}
        <section className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Sections
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTION_GROUPS.map((group) => (
              <div
                key={group.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {group.label}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-baseline justify-between gap-3 text-sm transition-colors"
                      >
                        <span className="text-foreground transition-colors group-hover:text-accent">
                          {item.label}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                          {item.hint}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Activity strip — only if events exist */}
        {events.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Recent activity
              </p>
              <Link
                href="/admin/activity"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-border/30">
              {events
                .filter((ev) => ev.metadata && Object.keys(ev.metadata).length > 0)
                .map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="truncate text-foreground/90">{eventLabel(ev)}</span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {relativeTime(ev.created_at)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Tab nav */}
        <div className="mt-10 flex items-center gap-6 border-b border-border/60 pb-3">
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
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
        </div>

        {/* Submissions list (client) */}
        <SubmissionsList submissions={submissions} />

        {/* Heatmap */}
        <section className="mt-12">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Activity (last 12 weeks)
          </p>
          <div className="mt-3 inline-flex flex-col gap-1">
            {heatmap.map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date} · ${cell.count} submission${cell.count === 1 ? "" : "s"}`}
                    className={`h-3 w-3 rounded-sm ${intensityClass(cell.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-card border border-border/60" />
            <span className="h-3 w-3 rounded-sm bg-accent/30" />
            <span className="h-3 w-3 rounded-sm bg-accent/60" />
            <span className="h-3 w-3 rounded-sm bg-accent" />
            <span>More</span>
          </div>
        </section>
      </main>

      <NewSubmissionWatcher since={latestCreatedAt} />
    </div>
  );
}
