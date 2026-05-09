"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function EditForm({
  promptKey,
  initialContent,
}: {
  promptKey: string;
  initialContent: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [summary, setSummary] = useState("");
  const [pending, setPending] = useState<"save" | "activate" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(activate: boolean) {
    if (!content.trim()) {
      setErr("Content is required.");
      return;
    }
    if (!summary.trim()) {
      setErr("Summary is required.");
      return;
    }
    setErr(null);
    setPending(activate ? "activate" : "save");
    try {
      const res = await fetch("/api/admin/prompts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt_key: promptKey,
          content,
          summary,
          activate,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.push("/admin/prompts");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <label
          htmlFor="summary"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          What changed in this version?
        </label>
        <input
          id="summary"
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="e.g. Tightened pricing language, added /support reference"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="content"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          Prompt content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={28}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground focus:border-accent focus:outline-none"
        />
      </div>

      {err && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {err}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/prompts"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Cancel
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => submit(false)}
            disabled={pending !== null}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50"
          >
            {pending === "save" ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => submit(true)}
            disabled={pending !== null}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending === "activate" ? "Saving…" : "Save & activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
