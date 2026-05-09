"use client";

import { useState } from "react";

type VoiceIssue = {
  rule: string;
  severity: "warn" | "block";
  excerpt: string;
  message: string;
};

type VoiceResult = { issues: VoiceIssue[]; score: number };

export function AddToPrompt({
  defaultQuestion = "",
}: {
  defaultQuestion?: string;
}) {
  const [question, setQuestion] = useState(defaultQuestion);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [voice, setVoice] = useState<VoiceResult | null>(null);

  async function runVoiceCheck() {
    if (!answer.trim()) {
      setMsg("Write the answer first.");
      window.setTimeout(() => setMsg(null), 2500);
      return;
    }
    setChecking(true);
    setVoice(null);
    try {
      const res = await fetch("/api/admin/voice-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.issues)) {
        setVoice({ issues: json.issues, score: json.score ?? 0 });
      } else {
        setMsg(json.error ?? "Voice check failed.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setChecking(false);
      window.setTimeout(() => setMsg(null), 2500);
    }
  }

  async function save() {
    if (!question.trim() || !answer.trim()) {
      setMsg("Both question and answer are required.");
      window.setTimeout(() => setMsg(null), 2500);
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/prompts/append-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setMsg("Saved & activated. New prompt version live.");
        setQuestion("");
        setAnswer("");
        setVoice(null);
      } else {
        setMsg(json.error ?? "Save failed.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setMsg(null), 5000);
    }
  }

  function scoreColor(score: number): string {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }

  return (
    <details className="group rounded-xl border border-border bg-card p-6">
      <summary className="flex cursor-pointer items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Suggest a Q&amp;A for the prompt
          </p>
          <p className="mt-1 text-sm text-foreground">
            Saw something the bot missed? Add a canonical answer to the system prompt.
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-transform group-open:rotate-90">
          ▸
        </span>
      </summary>

      <div className="mt-6 space-y-5 border-t border-border/60 pt-5">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Question (paste or paraphrase)
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Do you offer hourly support after launch?"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Canonical answer (in James&apos;s voice)
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="Direct, specific, plain English…"
            className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
        </div>

        {voice && (
          <div className="rounded-lg border border-border/60 bg-background p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Voice score
              </p>
              <span
                className={`font-mono text-sm font-semibold ${scoreColor(voice.score)}`}
              >
                {voice.score}
              </span>
            </div>
            {voice.issues.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No issues found.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {voice.issues.map((iss, i) => (
                  <li key={i} className="text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {iss.rule}
                    </span>
                    <span className="ml-2 text-foreground/80">
                      {iss.message}
                    </span>
                    {iss.excerpt && (
                      <span className="ml-2 italic text-muted-foreground">
                        &ldquo;{iss.excerpt}&rdquo;
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={saving || !question.trim() || !answer.trim()}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save to prompt"}
            </button>
            <button
              onClick={runVoiceCheck}
              disabled={checking || !answer.trim()}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-60"
            >
              {checking ? "Checking…" : "Voice check"}
            </button>
          </div>
          {msg && (
            <span className="text-xs text-muted-foreground">{msg}</span>
          )}
        </div>
      </div>
    </details>
  );
}
