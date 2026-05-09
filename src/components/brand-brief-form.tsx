"use client";

import { useMemo, useState } from "react";

type Brief = {
  businessOverview: string;
  targetAudience: string;
  brandVoice: string;
  successCriteria: string;
  existingAssets: string;
  inspirationSites: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

type SubmitStatus =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; id: string }
  | { kind: "error"; message: string };

const SECTIONS: Array<{ key: keyof Brief; label: string; help: string }> = [
  {
    key: "businessOverview",
    label: "Business overview",
    help: "What you do, in 2–3 plain sentences.",
  },
  {
    key: "targetAudience",
    label: "Target audience",
    help: "Who buys from you, and what's true about them when they need you.",
  },
  {
    key: "brandVoice",
    label: "Brand voice / personality",
    help: "How the brand should sound on the page.",
  },
  {
    key: "successCriteria",
    label: "Success criteria",
    help: "What does winning look like in concrete terms?",
  },
  {
    key: "existingAssets",
    label: "Existing assets / constraints",
    help: "What you already have, and anything we should work around.",
  },
  {
    key: "inspirationSites",
    label: "Inspiration sites",
    help: "Brands or sites that capture the vibe you want.",
  },
];

const LABEL_CLASS =
  "font-mono text-[10px] uppercase tracking-widest text-muted-foreground";

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus:border-foreground focus:outline-none";

const PRIMARY_BTN =
  "rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50";

const SECONDARY_BTN =
  "rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:opacity-50";

function briefToMarkdown(brief: Brief): string {
  const blocks = SECTIONS.map(({ key, label }) => {
    const body = (brief[key] ?? "").trim();
    return `## ${label}\n\n${body || "_(empty)_"}`;
  });
  return `# Brand Brief\n\n${blocks.join("\n\n")}\n`;
}

export function BrandBriefForm() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [brief, setBrief] = useState<Brief | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Submit-with-inquiry state
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitName, setSubmitName] = useState("");
  const [submitEmail, setSubmitEmail] = useState("");
  const [submitBusiness, setSubmitBusiness] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({ kind: "idle" });

  const markdown = useMemo(
    () => (brief ? briefToMarkdown(brief) : ""),
    [brief]
  );

  async function generate() {
    if (description.trim().length < 30) {
      setStatus({
        kind: "error",
        message: "Add a few more sentences (30+ characters) so we have enough to work with.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/tools/brand-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          setStatus({
            kind: "error",
            message: "You've hit the hourly limit. Try again in an hour.",
          });
          return;
        }
        if (res.status === 400) {
          setStatus({
            kind: "error",
            message: "That description was too short or too long. Aim for 2–4 sentences.",
          });
          return;
        }
        setStatus({
          kind: "error",
          message: "Couldn't generate the brief. Try again in a moment.",
        });
        return;
      }
      const data: unknown = await res.json();
      if (
        data !== null &&
        typeof data === "object" &&
        "brief" in data &&
        (data as { brief: unknown }).brief
      ) {
        setBrief((data as { brief: Brief }).brief);
        setStatus({ kind: "idle" });
      } else {
        setStatus({
          kind: "error",
          message: "Got an unexpected response. Try again.",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Try again in a moment.",
      });
    }
  }

  function updateSection(key: keyof Brief, value: string) {
    if (!brief) return;
    setBrief({ ...brief, [key]: value });
  }

  function copyMarkdown() {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // ignore
      }
    );
  }

  async function submitWithInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!brief) return;
    if (!submitEmail || !submitEmail.includes("@")) {
      setSubmitStatus({ kind: "error", message: "Enter a valid email." });
      return;
    }
    if (!submitName.trim()) {
      setSubmitStatus({ kind: "error", message: "Add your name." });
      return;
    }
    setSubmitStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "brand-brief",
          ownerName: submitName.trim(),
          email: submitEmail.trim(),
          businessName: submitBusiness.trim() || undefined,
          message: markdown,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as Record<string, unknown>).error === "string"
            ? (data as Record<string, string>).error
            : "Couldn't send the brief. Try again.";
        setSubmitStatus({ kind: "error", message });
        return;
      }
      const id =
        data &&
        typeof data === "object" &&
        "id" in data &&
        typeof (data as Record<string, unknown>).id === "string"
          ? (data as Record<string, string>).id
          : "";
      setSubmitStatus({ kind: "sent", id });
    } catch {
      setSubmitStatus({
        kind: "error",
        message: "Network error. Try again in a moment.",
      });
    }
  }

  // ------- Step 1: prompt only -------
  if (!brief) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <label htmlFor="bb-description" className={LABEL_CLASS}>
          01 — Describe your business
        </label>
        <p className="mt-3 text-sm text-muted-foreground">
          Two to four sentences. What you do, who you serve, what&apos;s
          special about it. We&apos;ll turn it into a structured brief you
          can edit.
        </p>
        <textarea
          id="bb-description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (status.kind === "error") setStatus({ kind: "idle" });
          }}
          placeholder="We're a family-run HVAC company in upstate SC. We do residential repair and replacement — most of our jobs come from referrals and Google. We've been around since 1998."
          className={`${TEXTAREA_CLASS} mt-5 resize-y`}
        />

        <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-muted-foreground">
            {description.trim().length} / 30 min · 2000 max
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={status.kind === "loading"}
            className={PRIMARY_BTN}
          >
            {status.kind === "loading" ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Drafting your brief…
              </span>
            ) : (
              "Generate brief"
            )}
          </button>
        </div>

        {status.kind === "error" && (
          <p className="mt-4 text-sm text-red-500">{status.message}</p>
        )}
      </div>
    );
  }

  // ------- Step 2: editable brief -------
  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={LABEL_CLASS}>Your brief</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Edit anything below. When it reads right, copy it or send it with
            an inquiry.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={status.kind === "loading"}
          className={SECONDARY_BTN}
        >
          {status.kind === "loading" ? "Regenerating…" : "Regenerate"}
        </button>
      </div>

      {/* Original prompt (collapsible) */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className={LABEL_CLASS}>Original prompt</span>
          <span
            aria-hidden="true"
            className={`text-muted-foreground transition-transform ${
              showOriginal ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
        {showOriginal && (
          <div className="mt-4 space-y-3">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${TEXTAREA_CLASS} resize-y text-sm`}
            />
            <p className="text-xs text-muted-foreground">
              Edit and click Regenerate to redraft the brief from a new prompt.
            </p>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div
            key={section.key}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <label htmlFor={`bb-${section.key}`} className={LABEL_CLASS}>
              {section.label}
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              {section.help}
            </p>
            <textarea
              id={`bb-${section.key}`}
              rows={4}
              value={brief[section.key]}
              onChange={(e) => updateSection(section.key, e.target.value)}
              className={`${TEXTAREA_CLASS} mt-4 resize-y text-sm sm:text-base`}
            />
          </div>
        ))}
      </div>

      {status.kind === "error" && (
        <p className="text-sm text-red-500">{status.message}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={copyMarkdown}
          className={SECONDARY_BTN}
        >
          {copied ? "Copied ✓" : "Copy as Markdown"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowSubmit((v) => !v);
            setSubmitStatus({ kind: "idle" });
          }}
          className={PRIMARY_BTN}
        >
          {showSubmit ? "Hide submit form" : "Submit with my inquiry"}
        </button>
      </div>

      {/* Inline submit form */}
      {showSubmit && submitStatus.kind !== "sent" && (
        <form
          onSubmit={submitWithInquiry}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          <div>
            <p className={LABEL_CLASS}>Send brief with inquiry</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll attach your brief to a new inquiry and James will
              follow up by email.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                type="text"
                required
                value={submitName}
                onChange={(e) => setSubmitName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-base focus:border-foreground focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                required
                value={submitEmail}
                onChange={(e) => setSubmitEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-base focus:border-foreground focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">
              Business name <span className="text-muted-foreground">(optional)</span>
            </span>
            <input
              type="text"
              value={submitBusiness}
              onChange={(e) => setSubmitBusiness(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-base focus:border-foreground focus:outline-none"
            />
          </label>

          {submitStatus.kind === "error" && (
            <p className="text-sm text-red-500">{submitStatus.message}</p>
          )}

          <button
            type="submit"
            disabled={submitStatus.kind === "sending"}
            className={PRIMARY_BTN}
          >
            {submitStatus.kind === "sending" ? "Sending…" : "Send brief"}
          </button>
        </form>
      )}

      {submitStatus.kind === "sent" && (
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
          <p className={LABEL_CLASS}>Sent</p>
          <p className="mt-3 text-base text-foreground">
            Brief sent. James will follow up by email shortly.
          </p>
          {submitStatus.id && (
            <a
              href={`/quote/${submitStatus.id}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Track your inquiry →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 animate-spin rounded-full border-2 border-background/40 border-t-background"
    />
  );
}
