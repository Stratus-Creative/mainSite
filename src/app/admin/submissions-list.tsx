"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FadeIn, Stagger } from "@/components/motion";

const STATUS_STYLES: Record<string, string> = {
  received: "border-border text-muted-foreground",
  reviewing: "border-accent/40 text-accent",
  quoted: "border-amber-400/30 text-amber-400",
  accepted: "border-emerald-400/30 text-emerald-400",
  closed: "border-border text-muted-foreground",
};

export type LeadScoreShape = {
  intent?: number;
  budget?: number;
  fit?: number;
  summary?: string;
} | null;

export type SubmissionRow = {
  id: string;
  created_at: string;
  status: string;
  source: string | null;
  owner_name: string | null;
  business_name: string | null;
  project_type: string | null;
  budget: string | null;
  email: string | null;
  tags: string[] | null;
  snoozed_until: string | null;
  lead_score?: LeadScoreShape;
};

function intentToneClass(intent: number): string {
  if (intent >= 7) return "text-emerald-400";
  if (intent >= 4) return "text-amber-400";
  return "text-muted-foreground";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_OPTIONS = ["all", "received", "reviewing", "quoted", "accepted", "closed"] as const;
const SOURCE_OPTIONS = [
  "all",
  "direct",
  "cost-estimator",
  "free-website-audit",
  "chat-widget",
] as const;

export function SubmissionsList({ submissions }: { submissions: SubmissionRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [source, setSource] = useState<(typeof SOURCE_OPTIONS)[number]>("all");
  const [hideSnoozed, setHideSnoozed] = useState(true);

  const now = Date.now();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions
      .filter((s) => {
        if (status !== "all" && s.status !== status) return false;
        if (source !== "all" && s.source !== source) return false;
        if (hideSnoozed && s.snoozed_until && new Date(s.snoozed_until).getTime() > now) {
          return false;
        }
        if (q) {
          const hay = [s.owner_name, s.business_name, s.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aSnoozed = a.snoozed_until && new Date(a.snoozed_until).getTime() > now ? 1 : 0;
        const bSnoozed = b.snoozed_until && new Date(b.snoozed_until).getTime() > now ? 1 : 0;
        if (aSnoozed !== bSnoozed) return aSnoozed - bSnoozed;

        // When no filters are active, surface high-intent (>=7) "received" leads at the top.
        const noFilters = status === "all" && source === "all" && search.trim() === "";
        if (noFilters) {
          const aHigh =
            a.status === "received" && (a.lead_score?.intent ?? 0) >= 7 ? 1 : 0;
          const bHigh =
            b.status === "received" && (b.lead_score?.intent ?? 0) >= 7 ? 1 : 0;
          if (aHigh !== bHigh) return bHigh - aHigh;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [submissions, search, status, source, hideSnoozed, now]);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <h1 className="text-lg font-semibold tracking-tight">All submissions</h1>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "shown" : "shown"}
          </span>
          <a
            href="/api/admin/export"
            className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, business, email…"
          className="flex-1 min-w-[220px] rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as (typeof SOURCE_OPTIONS)[number])}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All sources" : s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={hideSnoozed}
            onChange={(e) => setHideSnoozed(e.target.checked)}
            className="accent-accent"
          />
          Hide snoozed
        </label>
      </div>

      {/* List */}
      <div className="mt-4 divide-y divide-border/60">
        <Stagger step={30}>
        {filtered.map((s) => {
          const isSnoozed = !!(s.snoozed_until && new Date(s.snoozed_until).getTime() > now);
          const tags = s.tags ?? [];
          const visibleTags = tags.slice(0, 3);
          const extraTags = tags.length - visibleTags.length;

          return (
            <FadeIn key={s.id}>
            <Link
              href={`/admin/${s.id}`}
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-card/30 sm:gap-6"
            >
              {isSnoozed && (
                <span
                  aria-label="Snoozed"
                  title="Snoozed"
                  className="shrink-0 text-muted-foreground/60"
                >
                  💤
                </span>
              )}

              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                  STATUS_STYLES[s.status] ?? STATUS_STYLES.received
                }`}
              >
                {s.status}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">
                    {s.business_name ?? s.owner_name ?? "—"}
                  </p>
                  {visibleTags.map((t) => (
                    <span
                      key={t}
                      className="shrink-0 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                  {extraTags > 0 && (
                    <span className="shrink-0 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                      +{extraTags}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{s.email}</p>
              </div>

              {typeof s.lead_score?.intent === "number" && (
                <span
                  title={`AI intent score${s.lead_score.summary ? ` — ${s.lead_score.summary}` : ""}`}
                  className={`hidden shrink-0 font-mono text-xs tabular-nums sm:inline ${intentToneClass(s.lead_score.intent)}`}
                >
                  {s.lead_score.intent}
                </span>
              )}

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-xs text-muted-foreground">
                  {s.source === "audit-request" ? "Audit" : s.project_type ?? s.source ?? "Inquiry"}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
              </div>

              <span
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            </FadeIn>
          );
        })}
        </Stagger>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No submissions match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
