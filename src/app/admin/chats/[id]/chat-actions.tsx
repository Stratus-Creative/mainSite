"use client";

import { useState } from "react";

export function ChatActions({
  conversationId,
  initialStarred,
  initialFlagged,
  initialTags,
}: {
  conversationId: string;
  initialStarred: boolean;
  initialFlagged: boolean;
  initialTags: string[];
}) {
  const [starred, setStarred] = useState(initialStarred);
  const [flagged, setFlagged] = useState(initialFlagged);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function flash(msg: string) {
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(null), 2500);
  }

  async function persist(updates: {
    starred?: boolean;
    flagged?: boolean;
    tags?: string[];
  }): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/chat-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conversationId, ...updates }),
      });
      setBusy(false);
      if (!res.ok) {
        flash("Save failed.");
        return false;
      }
      flash("Saved.");
      return true;
    } catch {
      setBusy(false);
      flash("Save failed.");
      return false;
    }
  }

  async function toggleStar() {
    const next = !starred;
    setStarred(next);
    const ok = await persist({ starred: next });
    if (!ok) setStarred(!next);
  }

  async function toggleFlag() {
    const next = !flagged;
    setFlagged(next);
    const ok = await persist({ flagged: next });
    if (!ok) setFlagged(!next);
  }

  function addTag(raw: string) {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) return;
    if (tags.includes(cleaned)) {
      setTagInput("");
      return;
    }
    const next = [...tags, cleaned];
    setTags(next);
    setTagInput("");
    void persist({ tags: next });
  }

  async function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    await persist({ tags: next });
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      void removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Triage
        </p>
        {statusMsg && (
          <span className="text-xs text-muted-foreground">{statusMsg}</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={toggleStar}
          disabled={busy}
          aria-pressed={starred}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
            starred
              ? "border-amber-400 bg-amber-400/10 text-amber-400"
              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          <span aria-hidden="true">{starred ? "★" : "☆"}</span>
          {starred ? "Starred" : "Star"}
        </button>

        <button
          onClick={toggleFlag}
          disabled={busy}
          aria-pressed={flagged}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${
            flagged
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          {flagged ? "Flagged ✓" : "Flag for review"}
        </button>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Tags
        </p>

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  aria-label={`Remove ${t}`}
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKeyDown}
          onBlur={() => tagInput.trim() && addTag(tagInput)}
          placeholder="press Enter or comma to add…"
          className="mt-3 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
