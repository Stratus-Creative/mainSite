"use client";

import { useState } from "react";

const REQUEST_TYPES = [
  { value: "something-broken", label: "Something's broken" },
  { value: "content-update", label: "Update my content" },
  { value: "add-something", label: "Add something new" },
  { value: "billing", label: "Billing or invoicing" },
  { value: "other", label: "Other" },
];

const URGENCY_LEVELS = [
  { value: "normal", label: "Normal", sub: "I can wait a day or two" },
  { value: "urgent", label: "Urgent", sub: "It's affecting my business" },
  { value: "critical", label: "Critical", sub: "Site is down" },
];

type Status = "idle" | "submitting" | "success" | { error: string };

export function SupportForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [urgency, setUrgency] = useState("normal");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, urgency }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus({ error: "Something went wrong — try again or email us directly at business@stratus-creative.com." });
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 lg:p-10">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
          Request received
        </p>
        <p className="mt-4 text-xl font-semibold tracking-tight">
          We&apos;ll be in touch within 24–48 business hours.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          If your site is down or something is critically broken, email us
          directly at{" "}
          <a
            href="mailto:business@stratus-creative.com"
            className="text-foreground underline underline-offset-2"
          >
            business@stratus-creative.com
          </a>{" "}
          and put &ldquo;URGENT&rdquo; in the subject.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none transition-colors";
  const labelClass = "mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="websiteUrl" className={labelClass}>Your website URL</label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          placeholder="https://yoursite.com"
          required
          className={inputClass}
        />
      </div>

      {/* Request type */}
      <div>
        <label htmlFor="requestType" className={labelClass}>What do you need?</label>
        <select
          id="requestType"
          name="requestType"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>Select one</option>
          {REQUEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Urgency */}
      <div>
        <p className={labelClass}>How urgent is this?</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {URGENCY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setUrgency(level.value)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                urgency === level.value
                  ? "border-accent bg-accent/10"
                  : "border-border bg-card hover:border-foreground/30"
              }`}
            >
              <p className={`text-sm font-medium ${urgency === level.value ? "text-accent" : "text-foreground"}`}>
                {level.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{level.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>Describe what&apos;s happening</label>
        <textarea
          id="description"
          name="description"
          placeholder="The more detail the better — what did you expect, what actually happened, any error messages you saw."
          rows={5}
          required
          className={`${inputClass} resize-y`}
        />
      </div>

      {typeof status === "object" && (
        <p className="text-sm text-destructive">{status.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit request"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Existing clients only. We reply within 24–48 business hours.
      </p>
    </form>
  );
}
