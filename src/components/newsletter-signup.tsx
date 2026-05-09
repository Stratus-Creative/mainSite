"use client";

import { useState } from "react";

export function NewsletterSignup({
  variant = "default",
}: {
  variant?: "default" | "compact" | "inline";
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Subscribe failed");
      setSubmitted(true);
    } catch {
      setError("Couldn't subscribe — try again or email us directly.");
      setSubmitting(false);
    }
  }

  if (variant === "inline") {
    if (submitted) {
      return (
        <p className="font-mono text-sm text-accent">
          You&apos;re in. One decoded piece a month, no pitch.
        </p>
      );
    }
    return (
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Decoded by email
        </p>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-60 rounded-full border border-border bg-card px-5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
          >
            {submitting ? "…" : "Subscribe"}
          </button>
          <span className="text-sm text-muted-foreground">
            One decoded piece a month. No pitch.
          </span>
        </form>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  // Compact variant — quiet single-line treatment used in the site footer.
  if (variant === "compact") {
    if (submitted) {
      return (
        <p className="font-mono text-xs text-accent">
          Subscribed. One decoded piece a month. No pitch.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Decoded · one email a month, no pitch
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm items-center gap-2 sm:w-auto"
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border-b border-border bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none sm:w-56 sm:flex-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="text-sm font-medium text-foreground transition-colors hover:text-accent disabled:opacity-60"
          >
            {submitting ? "…" : "Subscribe →"}
          </button>
        </form>
        {error && (
          <p className="text-xs text-destructive sm:absolute">{error}</p>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/5 p-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
          Subscribed
        </p>
        <p className="mt-3 text-base text-foreground">
          One decoded piece in your inbox each month. No sales pitch.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
        Notes by email
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">
        One decoded piece. Once a month. No sales pitch.
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Practical writing on web, workflows, and AI cost transparency. Read
        and unsubscribe whenever.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
