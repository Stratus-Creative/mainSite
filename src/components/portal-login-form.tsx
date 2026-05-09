"use client";

import { useState } from "react";

export function PortalLoginForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        setError("Something went wrong. Try again in a moment.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Check your inbox
        </p>
        <h2 className="display-heading mt-4 text-2xl sm:text-3xl">
          If we found a project for that email, we sent a sign-in link.
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          The link will work for the next hour. Check your inbox in the next few
          seconds. If nothing arrives, double-check the email you used to submit
          — that's the one we look for.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setEmail("");
          }}
          className="mt-6 inline-flex items-center gap-2 text-sm text-foreground"
        >
          <span className="underline-hover">Use a different email</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8">
      <label
        htmlFor="portal-email"
        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        Email
      </label>
      <input
        id="portal-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@business.com"
        className="mt-3 block w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-foreground"
      />
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send me a sign-in link"}
        <span aria-hidden="true">→</span>
      </button>
      <p className="mt-4 text-xs text-muted-foreground">
        We'll never send unrelated marketing here — this link is just for your
        project portal.
      </p>
    </form>
  );
}
