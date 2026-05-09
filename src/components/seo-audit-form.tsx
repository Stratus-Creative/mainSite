"use client";

import { useState } from "react";
import Link from "next/link";

type Finding = {
  status: "pass" | "warn" | "critical";
  title: string;
  finding: string;
  fix: string;
};

type Category = {
  name: string;
  findings: Finding[];
};

type Audit = {
  overallScore: number;
  takeaway: string;
  categories: Category[];
};

type AuditResponse =
  | { ok: true; audit: Audit; fetchedAt: string }
  | { error: string; details?: string };

export function SeoAuditForm() {
  const [businessName, setBusinessName] = useState("");
  const [cityState, setCityState] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);

  function validate(): string | null {
    if (!businessName.trim()) return "Add your business name.";
    if (!cityState.trim()) return "Add your city and state.";
    const raw = websiteUrl.trim();
    if (!raw) return "Add your website URL.";
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return "URL must start with http:// or https://";
      }
    } catch {
      return "That URL doesn't look right — include https://";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setAudit(null);
    try {
      const res = await fetch("/api/tools/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          cityState: cityState.trim(),
          websiteUrl: websiteUrl.trim(),
        }),
      });
      const data: AuditResponse = await res.json();

      if (!res.ok) {
        if ("error" in data) {
          if (data.error === "rate_limited") {
            setError("You've used your audits for this hour. Try again later.");
          } else if (data.error === "invalid_url") {
            setError(data.details ?? "Include the full URL with https://");
          } else if (data.error === "missing_fields") {
            setError("Fill in all three fields.");
          } else if (data.error === "fields_too_long") {
            setError("One of those fields is unreasonably long.");
          } else if (data.error === "invalid_protocol") {
            setError("Only http and https URLs are supported.");
          } else {
            setError(data.details ?? "Something went wrong. Try again.");
          }
        } else {
          setError("Something went wrong. Try again.");
        }
        return;
      }

      if ("ok" in data && data.ok) {
        setAudit(data.audit);
      } else if ("error" in data) {
        setError(data.details ?? data.error);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAudit(null);
    setError(null);
  }

  return (
    <div className="grid gap-10">
      {/* Form */}
      {!audit && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Business name
              </span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme HVAC"
                disabled={loading}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                City + state
              </span>
              <input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Greenville, SC"
                disabled={loading}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Website URL
              </span>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus:border-foreground focus:outline-none disabled:opacity-50"
              />
            </label>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-3 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Reading your site… (~10 seconds)</span>
              </>
            ) : (
              <>
                <span>Run audit</span>
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Results */}
      {audit && (
        <div className="space-y-8">
          <ScoreBand audit={audit} />

          <div className="space-y-6">
            {audit.categories.map((cat) => (
              <CategoryCard key={cat.name} category={cat} />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              What this audit didn&apos;t do
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              We checked your homepage HTML and ran heuristic rules. We
              didn&apos;t query Google&apos;s index, run Lighthouse, or test
              mobile rendering. For a deep audit and remediation plan, talk to
              James.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/start"
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent"
            >
              Want this fixed? Get a quote →
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Run another audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Subcomponents ----------

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScoreBand({ audit }: { audit: Audit }) {
  const score = Math.max(0, Math.min(10, Math.round(audit.overallScore)));
  let scoreColor = "text-red-400";
  let bgColor = "bg-red-500/5 border-red-500/30";
  if (score >= 7) {
    scoreColor = "text-emerald-400";
    bgColor = "bg-emerald-500/5 border-emerald-500/30";
  } else if (score >= 4) {
    scoreColor = "text-amber-400";
    bgColor = "bg-amber-500/5 border-amber-500/30";
  }

  return (
    <div className={`rounded-2xl border ${bgColor} p-8`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Overall score
      </p>
      <p className={`mt-4 text-7xl font-semibold tracking-tight ${scoreColor}`}>
        {score}
        <span className="text-3xl text-muted-foreground"> / 10</span>
      </p>
      <p className="mt-4 max-w-2xl text-base text-foreground">
        {audit.takeaway}
      </p>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {category.name}
      </p>
      <ul className="mt-5 divide-y divide-border">
        {category.findings.map((f, i) => (
          <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <StatusIcon status={f.status} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.finding}</p>
              <p className="mt-2 text-xs italic text-muted-foreground/80">
                Fix: {f.fix}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusIcon({ status }: { status: Finding["status"] }) {
  if (status === "pass") {
    return (
      <span
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-400"
        aria-label="pass"
      >
        ✓
      </span>
    );
  }
  if (status === "warn") {
    return (
      <span
        className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-sm text-amber-400"
        aria-label="needs work"
      >
        !
      </span>
    );
  }
  return (
    <span
      className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-sm text-red-400"
      aria-label="critical"
    >
      ✕
    </span>
  );
}
