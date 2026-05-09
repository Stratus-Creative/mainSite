import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "AI usage & cost — Stratus Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const RANGES = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null as number | null },
] as const;

type RangeValue = (typeof RANGES)[number]["value"];

type AiUsageRow = {
  id: string;
  feature: string;
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | string | null;
  created_at: string;
};

function pickRange(raw: string | undefined): RangeValue {
  if (!raw) return "30d";
  const match = RANGES.find((r) => r.value === raw);
  return match ? match.value : "30d";
}

function rangeStart(value: RangeValue): Date | null {
  const range = RANGES.find((r) => r.value === value);
  if (!range || range.days == null) return null;
  const d = new Date();
  d.setDate(d.getDate() - range.days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return "$0.00";
  if (Math.abs(n) >= 1) return `$${n.toFixed(2)}`;
  if (Math.abs(n) >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US");
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export default async function AiCostsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const range = pickRange(params.range);
  const start = rangeStart(range);

  const supabase = createServerClient();

  let query = supabase
    .from("ai_usage")
    .select("id, feature, model, input_tokens, output_tokens, cost_usd, created_at")
    .order("created_at", { ascending: false });

  if (start) {
    query = query.gte("created_at", start.toISOString());
  }

  const [{ data: usageData }, { count: subsInWindow }] = await Promise.all([
    query.limit(50_000),
    (async () => {
      let q = supabase
        .from("submissions")
        .select("id", { count: "exact", head: true });
      if (start) q = q.gte("created_at", start.toISOString());
      return q;
    })(),
  ]);

  const rows = (usageData ?? []) as AiUsageRow[];

  // Aggregates
  let totalCost = 0;
  let totalInput = 0;
  let totalOutput = 0;
  const byFeature = new Map<string, { cost: number; calls: number }>();
  const byModel = new Map<string, { cost: number; calls: number; input: number; output: number }>();
  const byDay = new Map<string, number>();

  for (const r of rows) {
    const cost = num(r.cost_usd);
    const inTok = num(r.input_tokens);
    const outTok = num(r.output_tokens);
    totalCost += cost;
    totalInput += inTok;
    totalOutput += outTok;

    const f = byFeature.get(r.feature) ?? { cost: 0, calls: 0 };
    f.cost += cost;
    f.calls += 1;
    byFeature.set(r.feature, f);

    const m = byModel.get(r.model) ?? { cost: 0, calls: 0, input: 0, output: 0 };
    m.cost += cost;
    m.calls += 1;
    m.input += inTok;
    m.output += outTok;
    byModel.set(r.model, m);

    const k = dayKey(r.created_at);
    byDay.set(k, (byDay.get(k) ?? 0) + cost);
  }

  const featureRows = [...byFeature.entries()]
    .map(([feature, agg]) => ({
      feature,
      cost: agg.cost,
      calls: agg.calls,
      avg: agg.calls > 0 ? agg.cost / agg.calls : 0,
      share: totalCost > 0 ? agg.cost / totalCost : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  const modelRows = [...byModel.entries()]
    .map(([model, agg]) => ({
      model,
      cost: agg.cost,
      calls: agg.calls,
      input: agg.input,
      output: agg.output,
      avg: agg.calls > 0 ? agg.cost / agg.calls : 0,
      share: totalCost > 0 ? agg.cost / totalCost : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Time series for last 30 days regardless of selected range, per spec.
  const seriesDays = 30;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const series: { day: string; label: string; cost: number }[] = [];
  for (let i = seriesDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({
      day: key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cost: byDay.get(key) ?? 0,
    });
  }
  const seriesMax = series.reduce((m, p) => Math.max(m, p.cost), 0);

  const totalCalls = rows.length;
  const submissions = subsInWindow ?? 0;
  const costPerSubmission =
    submissions > 0 ? totalCost / submissions : 0;

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <nav className="mb-8 flex items-center gap-6 border-b border-border/60 pb-4">
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to admin
          </Link>
          <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Range:
            {RANGES.map((r) => (
              <Link
                key={r.value}
                href={`/admin/ai-costs?range=${r.value}`}
                className={
                  r.value === range
                    ? "rounded border border-border bg-card px-2 py-1 text-foreground"
                    : "rounded border border-transparent px-2 py-1 transition-colors hover:text-foreground"
                }
              >
                {r.label}
              </Link>
            ))}
          </span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">AI usage & cost</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every Anthropic call recorded into <span className="font-mono">ai_usage</span>.
            Costs computed from per-token pricing at call time.
          </p>
        </header>

        {/* Top tile row */}
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-5">
          {[
            { label: "Total cost", value: fmtUsd(totalCost), tone: "text-foreground" },
            { label: "Input tokens", value: fmtInt(totalInput), tone: "text-foreground" },
            { label: "Output tokens", value: fmtInt(totalOutput), tone: "text-foreground" },
            { label: "Calls", value: fmtInt(totalCalls), tone: "text-accent" },
            {
              label: "Cost / submission",
              value: submissions > 0 ? fmtUsd(costPerSubmission) : "—",
              tone: "text-emerald-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-background px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
              <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* By feature */}
        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-semibold tracking-tight">Cost by feature</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {featureRows.length} features
            </span>
          </div>

          {featureRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No usage recorded in this range.
            </p>
          ) : (
            <>
              {/* Stacked bar */}
              <div className="mt-5 flex h-3 w-full overflow-hidden rounded bg-border/30">
                {featureRows.map((f, idx) => (
                  <div
                    key={f.feature}
                    className="bg-accent"
                    style={{
                      width: `${f.share * 100}%`,
                      opacity: 1 - idx * 0.15,
                    }}
                    title={`${f.feature}: ${fmtUsd(f.cost)}`}
                  />
                ))}
              </div>

              <ul className="mt-5 divide-y divide-border/60">
                {featureRows.map((f) => (
                  <li key={f.feature} className="grid grid-cols-12 gap-3 py-3 text-sm">
                    <span className="col-span-4 truncate font-mono text-xs">{f.feature}</span>
                    <span className="col-span-3 text-right font-semibold">{fmtUsd(f.cost)}</span>
                    <span className="col-span-2 text-right text-muted-foreground">
                      {fmtInt(f.calls)} calls
                    </span>
                    <span className="col-span-3 text-right font-mono text-xs text-muted-foreground">
                      avg {fmtUsd(f.avg)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* By model */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-semibold tracking-tight">Cost by model</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {modelRows.length} models
            </span>
          </div>

          {modelRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No data.</p>
          ) : (
            <>
              <div className="mt-5 flex h-3 w-full overflow-hidden rounded bg-border/30">
                {modelRows.map((m, idx) => (
                  <div
                    key={m.model}
                    className="bg-accent"
                    style={{
                      width: `${m.share * 100}%`,
                      opacity: 1 - idx * 0.2,
                    }}
                    title={`${m.model}: ${fmtUsd(m.cost)}`}
                  />
                ))}
              </div>
              <ul className="mt-5 divide-y divide-border/60">
                {modelRows.map((m) => (
                  <li key={m.model} className="grid grid-cols-12 gap-3 py-3 text-sm">
                    <span className="col-span-5 truncate font-mono text-xs">{m.model}</span>
                    <span className="col-span-2 text-right font-semibold">{fmtUsd(m.cost)}</span>
                    <span className="col-span-2 text-right text-muted-foreground">
                      {fmtInt(m.calls)} calls
                    </span>
                    <span className="col-span-3 text-right font-mono text-xs text-muted-foreground">
                      {fmtInt(m.input)} in / {fmtInt(m.output)} out
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Time series */}
        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-semibold tracking-tight">Daily cost — last 30 days</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              peak {fmtUsd(seriesMax)}
            </span>
          </div>

          <div className="mt-6 flex h-32 items-end gap-px">
            {series.map((d) => {
              const h = seriesMax > 0 ? Math.max(2, (d.cost / seriesMax) * 100) : 2;
              return (
                <div
                  key={d.day}
                  className="flex-1"
                  title={`${d.label}: ${fmtUsd(d.cost)}`}
                >
                  <div
                    className="w-full rounded-sm bg-accent/80"
                    style={{ height: `${h}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>{series[0]?.label}</span>
            <span>{series[series.length - 1]?.label}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
