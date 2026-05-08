"use client";

import { useState } from "react";

export function NewsletterSignup({
  variant = "default",
}: {
  variant?: "default" | "compact";
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

  if (submitted) {
    return (
      <div
        className={`rounded-2xl border border-accent/40 bg-accent/5 ${
          variant === "compact" ? "p-5" : "p-8"
        } text-center`}
      >
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
          Subscribed
        </p>
        <p className="mt-3 text-base text-foreground">
          You&apos;ll get one essay like this in your inbox each month. No
          sales pitch.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card ${
        variant === "compact" ? "p-5" : "p-8"
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
        Notes by email
      </p>
      <h3
        className={`mt-3 font-semibold tracking-tight ${
          variant === "compact" ? "text-lg" : "text-2xl"
        }`}
      >
        One essay like this. Once a month. No sales pitch.
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
