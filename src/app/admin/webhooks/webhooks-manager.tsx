"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Subscription = {
  id: string;
  url: string;
  label: string | null;
  events: string[];
  active: boolean;
  secret: string | null;
  created_at: string;
};

const EVENT_TYPES = [
  "submission.created",
  "submission.status_changed",
  "quote.sent",
  "chat.flagged",
  "subscriber.added",
] as const;

function genSecret(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const labelClass =
  "font-mono text-[10px] uppercase tracking-widest text-muted-foreground";
const inputClass =
  "rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-foreground focus:outline-none";
const btnPrimary =
  "rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-60";
const btnGhost =
  "rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:border-foreground disabled:opacity-60";
const btnDanger =
  "rounded-full border border-amber-400/40 bg-background px-4 py-2 text-xs font-medium text-amber-400 hover:border-amber-400 disabled:opacity-60";

export function WebhooksManager({
  initialSubscriptions,
}: {
  initialSubscriptions: Subscription[];
}) {
  const router = useRouter();
  const [subs, setSubs] = useState<Subscription[]>(initialSubscriptions);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<
    Record<string, string | null>
  >({});
  const [, startTransition] = useTransition();

  function toggleEvent(e: string) {
    setEvents((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!url) {
      setCreateError("URL is required");
      return;
    }
    if (events.length === 0) {
      setCreateError("Pick at least one event");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, label, events, secret }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCreateError(json.error || "Failed to create");
        return;
      }
      setSubs((prev) => [json.subscription, ...prev]);
      setLabel("");
      setUrl("");
      setSecret("");
      setEvents([]);
      startTransition(() => router.refresh());
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(sub: Subscription) {
    const next = !sub.active;
    setSubs((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, active: next } : s))
    );
    const res = await fetch(`/api/admin/webhooks/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      // revert
      setSubs((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, active: !next } : s))
      );
    }
  }

  async function deleteSub(sub: Subscription) {
    if (!confirm(`Delete webhook ${sub.label || sub.url}?`)) return;
    const res = await fetch(`/api/admin/webhooks/${sub.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSubs((prev) => prev.filter((s) => s.id !== sub.id));
    }
  }

  async function testSub(sub: Subscription) {
    setTestResult((p) => ({ ...p, [sub.id]: "Testing…" }));
    try {
      const res = await fetch(`/api/admin/webhooks/${sub.id}/test`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.ok) {
        setTestResult((p) => ({
          ...p,
          [sub.id]: `OK (${json.status}, ${json.latencyMs}ms)`,
        }));
      } else {
        setTestResult((p) => ({
          ...p,
          [sub.id]: `Failed: ${json.error || json.status}`,
        }));
      }
    } catch (err) {
      setTestResult((p) => ({
        ...p,
        [sub.id]: err instanceof Error ? err.message : "Failed",
      }));
    }
  }

  return (
    <div className="space-y-12">
      {/* Create form */}
      <section className="rounded-lg border border-border/60 bg-card p-6">
        <h2 className="text-base font-semibold tracking-tight">
          New webhook subscription
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick which events trigger a POST to your URL. Events are delivered
          fire-and-forget — failures are logged but not retried.
        </p>

        <form onSubmit={handleCreate} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="wh-label">
              Label
            </label>
            <input
              id="wh-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Slack #leads"
              className={inputClass}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="wh-url">
              URL <span className="text-amber-400">*</span>
            </label>
            <input
              id="wh-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
              className={inputClass}
            />
          </div>

          <div className="grid gap-2">
            <span className={labelClass}>Events</span>
            <div className="flex flex-wrap gap-3">
              {EVENT_TYPES.map((evt) => {
                const checked = events.includes(evt);
                return (
                  <label
                    key={evt}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      checked
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleEvent(evt)}
                    />
                    <span className="font-mono">{evt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className={labelClass} htmlFor="wh-secret">
              Signing secret (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="wh-secret"
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className={`flex-1 ${inputClass} font-mono`}
              />
              <button
                type="button"
                onClick={() => setSecret(genSecret())}
                className={btnGhost}
                title="Generate a random secret"
              >
                🎲 Generate
              </button>
            </div>
          </div>

          {createError ? (
            <p className="text-xs text-amber-400">{createError}</p>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={creating} className={btnPrimary}>
              {creating ? "Adding…" : "Add subscription"}
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section>
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <h2 className="text-base font-semibold tracking-tight">
            Active subscriptions
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {subs.length} total
          </span>
        </div>

        {subs.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No webhooks yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {subs.map((sub) => (
              <li key={sub.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">
                        {sub.label || (
                          <span className="text-muted-foreground">
                            (unlabeled)
                          </span>
                        )}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                          sub.active
                            ? "border-emerald-400/40 text-emerald-400"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {sub.active ? "active" : "paused"}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {sub.url}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sub.events.map((e) => (
                        <span
                          key={e}
                          className="rounded-full border border-border/60 bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                    {testResult[sub.id] ? (
                      <p className="mt-3 font-mono text-[10px] text-accent">
                        {testResult[sub.id]}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => testSub(sub)}
                      className={btnGhost}
                    >
                      Test
                    </button>
                    <button
                      onClick={() => toggleActive(sub)}
                      className={btnGhost}
                    >
                      {sub.active ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => deleteSub(sub)}
                      className={btnDanger}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
