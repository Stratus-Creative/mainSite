import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminBar } from "@/components/admin-bar";

export const metadata: Metadata = {
  title: "Analytics — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Range = "7d" | "30d" | "90d" | "all";

const RANGE_LABELS: Record<Range, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "All time",
};

type SubmissionRow = {
  id: string;
  status: string;
  source: string | null;
  quoted_amount: number | null;
  lost_reason: string | null;
  lost_notes: string | null;
  created_at: string;
  quoted_at: string | null;
  attribution: AttributionShape | null;
};

type AttributionTouch = {
  page_url: string | null;
  referrer: string | null;
  utm: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    content: string | null;
    term: string | null;
  } | null;
  at: string | null;
};

type AttributionShape = {
  first_touch?: AttributionTouch | null;
  last_touch?: AttributionTouch | null;
  total_pages_viewed?: number | null;
} | null;

type PageViewRow = {
  page_url: string | null;
  created_at: string;
};

const KNOWN_SOURCES: Array<{ key: string; label: string }> = [
  { key: "free-website-audit", label: "Audit" },
  { key: "cost-estimator", label: "Cost estimator" },
  { key: "start-form", label: "Direct (start form)" },
  { key: "chat-widget", label: "Chat widget" },
];

function startForRange(range: Range): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtPct(num: number, denom: number): string {
  if (denom <= 0) return "—";
  return `${Math.round((num / denom) * 100)}%`;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function safeHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function parseRange(value: string | undefined): Range {
  if (value === "7d" || value === "30d" || value === "90d" || value === "all") {
    return value;
  }
  return "30d";
}

const PRICE_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "$0–2K", min: 0, max: 2000 },
  { label: "$2–5K", min: 2000, max: 5000 },
  { label: "$5–10K", min: 5000, max: 10000 },
  { label: "$10–20K", min: 10000, max: 20000 },
  { label: "$20K+", min: 20000, max: Infinity },
];

const TTQ_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "<4 hours", min: 0, max: 4 },
  { label: "4–24 hours", min: 4, max: 24 },
  { label: "1–3 days", min: 24, max: 72 },
  { label: "3+ days", min: 72, max: Infinity },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const range = parseRange(params.range);
  const rangeStart = startForRange(range);

  const supabase = createServerClient();

  const submissionsQuery = supabase
    .from("submissions")
    .select(
      "id, status, source, quoted_amount, lost_reason, lost_notes, created_at, quoted_at, attribution"
    )
    .order("created_at", { ascending: false });

  if (rangeStart) {
    submissionsQuery.gte("created_at", rangeStart.toISOString());
  }

  const pageViewsQuery = supabase
    .from("page_views")
    .select("page_url, created_at");
  if (rangeStart) {
    pageViewsQuery.gte("created_at", rangeStart.toISOString());
  }

  const [submissionsRes, pageViewsRes] = await Promise.all([
    submissionsQuery,
    pageViewsQuery,
  ]);

  const submissions = (submissionsRes.data ?? []) as SubmissionRow[];
  const pageViews = (pageViewsRes.error ? [] : pageViewsRes.data ?? []) as PageViewRow[];

  // Section 1 — overall win rate metrics
  const totalSubmissions = submissions.length;
  const quotedWithAmount = submissions.filter(
    (s) => s.quoted_amount != null && s.quoted_at != null
  );
  const accepted = submissions.filter((s) => s.status === "accepted");
  const winRatePct =
    quotedWithAmount.length > 0
      ? (accepted.length / quotedWithAmount.length) * 100
      : 0;

  const tiles = [
    { label: "Submissions", value: String(totalSubmissions) },
    { label: "Quoted", value: String(quotedWithAmount.length) },
    { label: "Accepted", value: String(accepted.length) },
    {
      label: "Win rate",
      value:
        quotedWithAmount.length > 0
          ? `${Math.round(winRatePct)}%`
          : "—",
    },
  ];

  // Section 1 — by source breakdown
  const winRateBySource = KNOWN_SOURCES.map((src) => {
    const inSource = submissions.filter((s) => s.source === src.key);
    const sourceQuoted = inSource.filter(
      (s) => s.quoted_amount != null && s.quoted_at != null
    );
    const sourceAccepted = inSource.filter((s) => s.status === "accepted");
    return {
      key: src.key,
      label: src.label,
      total: inSource.length,
      quoted: sourceQuoted.length,
      accepted: sourceAccepted.length,
      winRate:
        sourceQuoted.length > 0
          ? sourceAccepted.length / sourceQuoted.length
          : 0,
    };
  });

  // Section 2 — quote acceptance by price bucket
  const priceBucketStats = PRICE_BUCKETS.map((b) => {
    const rows = quotedWithAmount.filter((s) => {
      const amt = s.quoted_amount ?? 0;
      return amt >= b.min && amt < b.max;
    });
    const acc = rows.filter((s) => s.status === "accepted");
    return {
      label: b.label,
      total: rows.length,
      accepted: acc.length,
      rate: rows.length > 0 ? acc.length / rows.length : 0,
    };
  });

  const acceptedAmounts = accepted
    .map((s) => s.quoted_amount ?? 0)
    .filter((n) => n > 0);
  const rejectedAmounts = quotedWithAmount
    .filter((s) => s.status !== "accepted")
    .map((s) => s.quoted_amount ?? 0)
    .filter((n) => n > 0);
  const medianAccepted = median(acceptedAmounts);
  const medianRejected = median(rejectedAmounts);

  // Section 3 — time-to-quote distribution
  const ttqRows = quotedWithAmount.map((s) => {
    const created = new Date(s.created_at).getTime();
    const quotedAt = s.quoted_at ? new Date(s.quoted_at).getTime() : created;
    const hours = Math.max(0, (quotedAt - created) / 3_600_000);
    return { hours, accepted: s.status === "accepted" };
  });

  const ttqBucketStats = TTQ_BUCKETS.map((b) => {
    const rows = ttqRows.filter((r) => r.hours >= b.min && r.hours < b.max);
    const acc = rows.filter((r) => r.accepted);
    return {
      label: b.label,
      total: rows.length,
      accepted: acc.length,
      rate: rows.length > 0 ? acc.length / rows.length : 0,
    };
  });

  const fastRows = ttqRows.filter((r) => r.hours < 24);
  const slowRows = ttqRows.filter((r) => r.hours >= 24);
  const fastRate =
    fastRows.length > 0
      ? fastRows.filter((r) => r.accepted).length / fastRows.length
      : 0;
  const slowRate =
    slowRows.length > 0
      ? slowRows.filter((r) => r.accepted).length / slowRows.length
      : 0;
  const ttqDeltaPct = Math.round((fastRate - slowRate) * 100);

  // Section 4 — lost reasons
  const closedNotAccepted = submissions.filter(
    (s) => s.status === "closed"
  );
  const lostByReason = new Map<string, number>();
  for (const s of closedNotAccepted) {
    const key = s.lost_reason?.trim() || "(unspecified)";
    lostByReason.set(key, (lostByReason.get(key) ?? 0) + 1);
  }
  const lostReasonRows = Array.from(lostByReason.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
  const lostMaxCount = lostReasonRows.reduce(
    (m, r) => Math.max(m, r.count),
    0
  );
  const lostRevenue = closedNotAccepted
    .filter((s) => s.quoted_amount != null)
    .reduce((sum, s) => sum + (s.quoted_amount ?? 0), 0);

  // Section 5 — top sources of submissions (group by submissions.source)
  const sourceMap = new Map<
    string,
    { count: number; accepted: number; revenue: number }
  >();
  for (const s of submissions) {
    const key = s.source ?? "(unknown)";
    const cur = sourceMap.get(key) ?? { count: 0, accepted: 0, revenue: 0 };
    cur.count += 1;
    if (s.status === "accepted") {
      cur.accepted += 1;
      cur.revenue += s.quoted_amount ?? 0;
    }
    sourceMap.set(key, cur);
  }
  const sourceRows = Array.from(sourceMap.entries())
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.count - a.count);

  // Section 6 — top traffic sources from attribution
  type TrafficStat = { count: number; accepted: number; revenue: number };
  const utmSourceMap = new Map<string, TrafficStat>();
  const referrerMap = new Map<string, TrafficStat>();
  const submissionsWithAttribution = submissions.filter(
    (s) => s.attribution && s.attribution.first_touch
  );
  for (const s of submissionsWithAttribution) {
    const ft = s.attribution!.first_touch!;
    const utmSource = ft.utm?.source ?? null;
    if (utmSource) {
      const cur = utmSourceMap.get(utmSource) ?? {
        count: 0,
        accepted: 0,
        revenue: 0,
      };
      cur.count += 1;
      if (s.status === "accepted") {
        cur.accepted += 1;
        cur.revenue += s.quoted_amount ?? 0;
      }
      utmSourceMap.set(utmSource, cur);
    }
    const refHost = safeHostname(ft.referrer);
    if (refHost) {
      const cur = referrerMap.get(refHost) ?? {
        count: 0,
        accepted: 0,
        revenue: 0,
      };
      cur.count += 1;
      if (s.status === "accepted") {
        cur.accepted += 1;
        cur.revenue += s.quoted_amount ?? 0;
      }
      referrerMap.set(refHost, cur);
    }
  }
  const utmSourceRows = Array.from(utmSourceMap.entries())
    .map(([k, v]) => ({ source: k, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const referrerRows = Array.from(referrerMap.entries())
    .map(([k, v]) => ({ host: k, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Section 7 — page conversion (last_touch.page_url)
  const lastTouchMap = new Map<string, number>();
  for (const s of submissionsWithAttribution) {
    const url = s.attribution!.last_touch?.page_url ?? null;
    if (url) {
      lastTouchMap.set(url, (lastTouchMap.get(url) ?? 0) + 1);
    }
  }
  const pageViewCountByUrl = new Map<string, number>();
  for (const pv of pageViews) {
    if (pv.page_url) {
      pageViewCountByUrl.set(
        pv.page_url,
        (pageViewCountByUrl.get(pv.page_url) ?? 0) + 1
      );
    }
  }
  const pageConversionRows = Array.from(lastTouchMap.entries())
    .map(([url, submissionsCount]) => {
      const views = pageViewCountByUrl.get(url) ?? 0;
      const per1000 = views > 0 ? (submissionsCount / views) * 1000 : null;
      return { url, submissions: submissionsCount, views, per1000 };
    })
    .sort((a, b) => b.submissions - a.submissions)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Stratus admin
            </p>
            <h1 className="display-heading mt-2 text-4xl tracking-tight sm:text-5xl">
              Analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Range: {RANGE_LABELS[range]}
              {rangeStart && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-mono text-[11px]">
                    since {rangeStart.toISOString().slice(0, 10)}
                  </span>
                </>
              )}
            </p>
          </div>
          <RangeSelector current={range} />
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
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Chats
          </Link>
          <Link
            href="/admin/analytics"
            className="font-mono text-[10px] uppercase tracking-widest text-foreground"
          >
            Analytics
          </Link>
        </div>

        {/* Section 1 — Win rate */}
        <section className="mt-10">
          <SectionHeader
            label="01"
            title="Win rate"
            hint="Submissions → quoted → accepted across the selected range."
          />
          <div className="mt-5 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="bg-background px-6 py-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                  {t.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Win rate by source
            </p>
            <div className="mt-5 space-y-4">
              {winRateBySource.map((row) => {
                const widthPct = Math.round(row.winRate * 100);
                const insufficient = row.quoted < 5;
                return (
                  <div key={row.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-foreground/90">{row.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.accepted} of {row.quoted} quoted ·{" "}
                        {row.quoted > 0 ? `${widthPct}%` : "—"}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className={`h-full ${
                          insufficient ? "bg-muted-foreground/40" : "bg-accent"
                        }`}
                        style={{
                          width: `${row.quoted > 0 ? widthPct : 0}%`,
                        }}
                      />
                    </div>
                    {insufficient && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Insufficient data — fewer than 5 quoted submissions
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2 — Quote acceptance vs price */}
        <section className="mt-12">
          <SectionHeader
            label="02"
            title="Quote acceptance vs price"
            hint="Acceptance rate by quoted dollar bucket."
          />
          <div className="mt-5 rounded-xl border border-border bg-card p-6">
            <div className="space-y-4">
              {priceBucketStats.map((row) => {
                const widthPct = Math.round(row.rate * 100);
                const insufficient = row.total < 3;
                return (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-foreground/90">{row.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.accepted} of {row.total} ·{" "}
                        {row.total > 0 ? `${widthPct}%` : "—"}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className={`h-full ${
                          insufficient ? "bg-muted-foreground/40" : "bg-accent"
                        }`}
                        style={{
                          width: `${row.total > 0 ? widthPct : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 border-t border-border/60 pt-4 text-sm text-muted-foreground">
              Median accepted quote:{" "}
              <span className="font-mono text-foreground">
                {acceptedAmounts.length > 0 ? fmtCurrency(medianAccepted) : "—"}
              </span>
              {"  ·  "}
              Median rejected quote:{" "}
              <span className="font-mono text-foreground">
                {rejectedAmounts.length > 0 ? fmtCurrency(medianRejected) : "—"}
              </span>
            </p>
          </div>
        </section>

        {/* Section 3 — Time-to-quote distribution */}
        <section className="mt-12">
          <SectionHeader
            label="03"
            title="Time to quote"
            hint="From submission created to quoted_at."
          />
          <div className="mt-5 rounded-xl border border-border bg-card p-6">
            <div className="grid gap-px bg-border/60 sm:grid-cols-4">
              {ttqBucketStats.map((row) => (
                <div key={row.label} className="bg-card px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {row.total}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Win rate {row.total > 0 ? `${Math.round(row.rate * 100)}%` : "—"}
                  </p>
                </div>
              ))}
            </div>
            {ttqRows.length >= 5 && (
              <p className="mt-5 text-sm text-muted-foreground">
                Quotes sent within 24 hours win{" "}
                <span
                  className={`font-mono ${
                    ttqDeltaPct >= 0 ? "text-emerald-400" : "text-destructive"
                  }`}
                >
                  {ttqDeltaPct >= 0 ? "+" : ""}
                  {ttqDeltaPct} pts
                </span>{" "}
                more often than quotes sent later ({Math.round(fastRate * 100)}%
                vs {Math.round(slowRate * 100)}%).
              </p>
            )}
          </div>
        </section>

        {/* Section 4 — Lost reasons */}
        <section className="mt-12">
          <SectionHeader
            label="04"
            title="Lost reasons"
            hint="Closed deals that did not land. Sorted by count."
          />
          <div className="mt-5 rounded-xl border border-border bg-card p-6">
            {lostReasonRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No closed-lost deals in this range.
              </p>
            ) : (
              <div className="space-y-3">
                {lostReasonRows.map((row) => (
                  <div key={row.reason}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-foreground/90">{row.reason}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.count}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full bg-destructive/70"
                        style={{
                          width: `${
                            lostMaxCount > 0
                              ? Math.round((row.count / lostMaxCount) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 grid gap-px border-t border-border/60 bg-border/60 pt-6 sm:grid-cols-2">
              <div className="bg-card px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total lost deals
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {closedNotAccepted.length}
                </p>
              </div>
              <div className="bg-card px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Estimated lost revenue
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {fmtCurrency(lostRevenue)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Top sources of submissions */}
        <section className="mt-12">
          <SectionHeader
            label="05"
            title="Top sources"
            hint="Grouped by submissions.source."
          />
          <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <Th>Source</Th>
                  <Th>Submissions</Th>
                  <Th>Conversion</Th>
                  <Th>Revenue</Th>
                </tr>
              </thead>
              <tbody>
                {sourceRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                      No submissions in this range.
                    </td>
                  </tr>
                ) : (
                  sourceRows.map((row) => (
                    <tr
                      key={row.source}
                      className="border-b border-border/30 last:border-0"
                    >
                      <Td>{row.source}</Td>
                      <Td mono>{row.count}</Td>
                      <Td mono>{fmtPct(row.accepted, row.count)}</Td>
                      <Td mono>{fmtCurrency(row.revenue)}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6 — Top traffic sources from attribution */}
        <section className="mt-12">
          <SectionHeader
            label="06"
            title="Traffic attribution"
            hint="First-touch UTM source and referrer host from page_views."
          />
          {submissionsWithAttribution.length === 0 ? (
            <div className="mt-5 rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                No submissions yet have attribution data. Once the tracker
                collects page views and a visitor submits, this populates.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border/60 px-5 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    First-touch UTM source
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left">
                      <Th>Source</Th>
                      <Th>Subs</Th>
                      <Th>Conv.</Th>
                      <Th>Revenue</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {utmSourceRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                          No UTM-tagged traffic yet.
                        </td>
                      </tr>
                    ) : (
                      utmSourceRows.map((row) => (
                        <tr key={row.source} className="border-b border-border/30 last:border-0">
                          <Td>{row.source}</Td>
                          <Td mono>{row.count}</Td>
                          <Td mono>{fmtPct(row.accepted, row.count)}</Td>
                          <Td mono>{fmtCurrency(row.revenue)}</Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border/60 px-5 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    First-touch referrer host
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left">
                      <Th>Host</Th>
                      <Th>Subs</Th>
                      <Th>Conv.</Th>
                      <Th>Revenue</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrerRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                          No referrers recorded yet.
                        </td>
                      </tr>
                    ) : (
                      referrerRows.map((row) => (
                        <tr key={row.host} className="border-b border-border/30 last:border-0">
                          <Td>{row.host}</Td>
                          <Td mono>{row.count}</Td>
                          <Td mono>{fmtPct(row.accepted, row.count)}</Td>
                          <Td mono>{fmtCurrency(row.revenue)}</Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Section 7 — Page conversion */}
        <section className="mt-12 mb-16">
          <SectionHeader
            label="07"
            title="Page conversion"
            hint="Last-touch page on submission, cross-referenced with page_views."
          />
          {pageViews.length === 0 && pageConversionRows.length === 0 ? (
            <div className="mt-5 rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                No data yet — start collecting page views by deploying the
                tracker.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <Th>Page</Th>
                    <Th>Submissions</Th>
                    <Th>Page views</Th>
                    <Th>Per 1k views</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageConversionRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                        No submissions with attribution yet.
                      </td>
                    </tr>
                  ) : (
                    pageConversionRows.map((row) => {
                      const insufficient = row.views < 50;
                      return (
                        <tr
                          key={row.url}
                          className="border-b border-border/30 last:border-0"
                        >
                          <Td>
                            <span className="font-mono text-xs">
                              {row.url}
                            </span>
                          </Td>
                          <Td mono>{row.submissions}</Td>
                          <Td mono>{row.views || "—"}</Td>
                          <Td mono>
                            {row.per1000 == null
                              ? "—"
                              : insufficient
                              ? "Insufficient data"
                              : row.per1000.toFixed(1)}
                          </Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SectionHeader({
  label,
  title,
  hint,
}: {
  label: string;
  title: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Section {label}
      </p>
      <h2 className="display-heading mt-2 text-2xl tracking-tight sm:text-3xl">
        {title}
      </h2>
      {hint && (
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 font-mono text-[10px] font-normal uppercase tracking-widest text-muted-foreground">
      {children}
    </th>
  );
}

function Td({
  children,
  mono = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      className={`px-5 py-3 align-top ${
        mono ? "font-mono text-xs text-foreground/90" : "text-foreground/90"
      }`}
    >
      {children}
    </td>
  );
}

function RangeSelector({ current }: { current: Range }) {
  const ranges: Range[] = ["7d", "30d", "90d", "all"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ranges.map((r) => (
        <Link
          key={r}
          href={`/admin/analytics?range=${r}`}
          className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
            r === current
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          {RANGE_LABELS[r]}
        </Link>
      ))}
    </div>
  );
}
