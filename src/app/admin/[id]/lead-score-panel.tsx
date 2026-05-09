"use client";

import { useState } from "react";

export type LeadScoreValue = {
  intent?: number;
  budget?: number;
  fit?: number;
  summary?: string;
  scored_at?: string;
  model?: string;
} | null;

function dotColor(score: number): string {
  if (score >= 7) return "bg-emerald-400";
  if (score >= 4) return "bg-amber-400";
  return "bg-red-400";
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm">
      <span className={`h-2 w-2 rounded-full ${dotColor(value)}`} aria-hidden />
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </span>
  );
}

export function LeadScorePanel({
  submissionId,
  initialScore,
}: {
  submissionId: string;
  initialScore: LeadScoreValue;
}) {
  const [score, setScore] = useState<LeadScoreValue>(initialScore);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function runScore() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/score-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error ?? "Scoring failed.");
      } else {
        setScore(json.score as LeadScoreValue);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (
    score &&
    typeof score.intent === "number" &&
    typeof score.budget === "number" &&
    typeof score.fit === "number"
  ) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            AI score
          </p>
          <button
            onClick={runScore}
            disabled={loading}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            {loading ? "Rescoring…" : "Rescore"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label="Intent" value={score.intent} />
          <Chip label="Budget" value={score.budget} />
          <Chip label="Fit" value={score.fit} />
        </div>
        {score.summary && (
          <p className="text-sm italic text-muted-foreground">{score.summary}</p>
        )}
        {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        AI score
      </p>
      <p className="text-xs text-muted-foreground">
        No score yet. Generate one to see intent, budget fit, and project fit.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={runScore}
          disabled={loading}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {loading ? "Scoring…" : "Score this lead"}
        </button>
        {errorMsg && <span className="text-xs text-red-400">{errorMsg}</span>}
      </div>
    </div>
  );
}
