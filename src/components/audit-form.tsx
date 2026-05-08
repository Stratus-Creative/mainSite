"use client";

import { useState } from "react";

const CONCERNS = [
  { value: "performance", label: "Site is slow" },
  { value: "seo", label: "Not ranking on Google" },
  { value: "conversion", label: "Visitors don't convert" },
  { value: "design", label: "Looks dated" },
  { value: "all", label: "All of the above" },
  { value: "other", label: "Something else" },
];

export function AuditForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [concern, setConcern] = useState("all");

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/5 p-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
          Audit requested
        </p>
        <h3 className="display-heading mt-6 text-2xl sm:text-3xl">
          Got it — your audit is in the queue.
        </h3>
        <p className="mt-4 text-base text-muted-foreground">
          We respond within 1–3 business days with a Loom link reviewing
          your site. Check your inbox (and spam folder, just in case).
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.currentTarget;
        const data = new FormData(form);
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...Object.fromEntries(data),
            category: "audit-request",
            city: "not-specified",
            source: "free-website-audit",
          }),
        })
          .then(() => setSubmitted(true))
          .catch(() => setSubmitting(false));
      }}
      className="space-y-8"
    >
      <div className="grid gap-px bg-border/60 sm:grid-cols-2">
        <Field
          id="ownerName"
          name="ownerName"
          label="Your name"
          placeholder="Jane Doe"
          required
        />
        <Field
          id="businessName"
          name="businessName"
          label="Business name"
          placeholder="Doe & Co."
          required
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="jane@doeco.com"
          required
        />
        <Field
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          label="Your website URL"
          placeholder="https://your-site.com"
          required
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Biggest concern
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CONCERNS.map((opt) => {
            const active = concern === opt.value;
            return (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="concern"
                  value={opt.value}
                  checked={active}
                  onChange={() => setConcern(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          Anything else we should know? (Optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="What you've tried, what's not working, your goals — anything that helps us focus the audit."
          className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/80 focus:border-foreground focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Free. One per business. Audit returned within 1–3 business days.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Request my audit"}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex flex-col gap-2 bg-background p-5"
    >
      <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/85">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
      />
    </label>
  );
}
