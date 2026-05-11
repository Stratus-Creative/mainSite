"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type ProjectType = "starter" | "ai-widget" | "workflow" | "online-presence" | "custom" | "unsure";
type Budget = "under-2k" | "2k-5k" | "5k-15k" | "15k-plus" | "unsure";
type ContactPref = "email" | "text" | "either";
type Timeline = "asap" | "1-3mo" | "3-6mo" | "exploring";
type ReferralSource = "google" | "referral" | "friend" | "social" | "other";

const PROJECT_TYPES: Array<{ value: ProjectType; label: string; hint: string }> = [
  { value: "starter",          label: "Starter Site",      hint: "$1,495 flat · 5–7 days" },
  { value: "ai-widget",        label: "AI Chat Widget",    hint: "$800 · trained on your business" },
  { value: "workflow",         label: "AI Workflow",       hint: "$5K–$20K custom build" },
  { value: "online-presence",  label: "Online Presence",   hint: "GBP · reviews · local SEO" },
  { value: "custom",           label: "Custom / Bundle",   hint: "Multiple services · complex scope" },
  { value: "unsure",           label: "Not sure",          hint: "Help me figure it out" },
];

const BUDGETS: Array<{ value: Budget; label: string }> = [
  { value: "under-2k", label: "Under $2K" },
  { value: "2k-5k", label: "$2K – $5K" },
  { value: "5k-15k", label: "$5K – $15K" },
  { value: "15k-plus", label: "$15K+" },
  { value: "unsure", label: "Unsure" },
];

const TIMELINES: Array<{ value: Timeline; label: string }> = [
  { value: "asap",      label: "As soon as possible" },
  { value: "1-3mo",     label: "1–3 months" },
  { value: "3-6mo",     label: "3–6 months" },
  { value: "exploring", label: "Just exploring" },
];

const REFERRAL_SOURCES: Array<{ value: ReferralSource; label: string }> = [
  { value: "google",   label: "Google search" },
  { value: "referral", label: "Referral" },
  { value: "friend",   label: "Friend or colleague" },
  { value: "social",   label: "Social media" },
  { value: "other",    label: "Other" },
];

const STORAGE_KEY = "stratus.start-form.v2";

interface StoredState {
  projectType?: ProjectType;
  budget?: Budget;
  timeline?: Timeline;
  referralSource?: ReferralSource;
  existingUrl?: string;
  contactPref?: ContactPref;
  smsConsent?: boolean;
  message?: string;
  ownerName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
}

const CONTACT_PREFS: Array<{ value: ContactPref; label: string }> = [
  { value: "email", label: "Email" },
  { value: "text", label: "Text" },
  { value: "either", label: "Either" },
];

export function StartForm() {
  const searchParams = useSearchParams();
  const fromEstimator = searchParams.get("fromEstimator") === "1";
  const prefilledMessage = searchParams.get("summary") ?? "";
  const planParam = searchParams.get("plan");
  const nameParam = searchParams.get("name") ?? "";
  const businessParam = searchParams.get("business") ?? "";

  // Determine initial project type from query param, then estimator flag, then default.
  const VALID_PLANS: ProjectType[] = ["starter", "ai-widget", "workflow", "online-presence", "custom", "unsure"];
  const initialProjectType: ProjectType =
    VALID_PLANS.includes(planParam as ProjectType)
      ? (planParam as ProjectType)
      : fromEstimator
      ? "custom"
      : "unsure";

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<ProjectType>(initialProjectType);
  const [budget, setBudget] = useState<Budget>("unsure");
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [contactPref, setContactPref] = useState<ContactPref>("email");
  const [smsConsent, setSmsConsent] = useState(false);
  const [message, setMessage] = useState(prefilledMessage);
  const [restored, setRestored] = useState(false);
  const [ownerName, setOwnerName] = useState(nameParam);
  const [businessName, setBusinessName] = useState(businessParam);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  // Load saved progress on mount (only if not coming from estimator with prefilled message).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (fromEstimator && prefilledMessage) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: StoredState = JSON.parse(raw);
      if (saved.projectType && !planParam) setProjectType(saved.projectType);
      if (saved.budget) setBudget(saved.budget);
      if (saved.timeline) setTimeline(saved.timeline);
      if (saved.referralSource) setReferralSource(saved.referralSource);
      if (saved.existingUrl) setExistingUrl(saved.existingUrl);
      if (saved.contactPref) setContactPref(saved.contactPref);
      if (saved.smsConsent) setSmsConsent(saved.smsConsent);
      if (saved.message) {
        setMessage(saved.message);
        setRestored(true);
      }
      if (saved.ownerName && !nameParam) setOwnerName(saved.ownerName);
      if (saved.businessName && !businessParam) setBusinessName(saved.businessName);
      if (saved.email) setEmail(saved.email);
      if (saved.phone) setPhone(saved.phone);
    } catch {
      // Ignore corrupt state
    }
  }, [fromEstimator, prefilledMessage, planParam]);

  // Save on every change (debounced via state).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (submitted) return;
    const data: StoredState = {
      projectType,
      budget,
      timeline: timeline ?? undefined,
      referralSource: referralSource ?? undefined,
      existingUrl,
      contactPref,
      smsConsent,
      message,
      ownerName,
      businessName,
      email,
      phone,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage may be full or disabled — don't block UX
    }
  }, [
    projectType,
    budget,
    timeline,
    referralSource,
    existingUrl,
    contactPref,
    smsConsent,
    message,
    ownerName,
    businessName,
    email,
    phone,
    submitted,
  ]);

  // If the URL params update after mount, sync them.
  useEffect(() => {
    if (prefilledMessage) setMessage(prefilledMessage);
    if (nameParam) setOwnerName(nameParam);
    if (businessParam) setBusinessName(businessParam);
  }, [prefilledMessage, nameParam, businessParam]);

  function clearSaved() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10">
        <p className="section-label">Received</p>
        <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
          Thanks — we&apos;ll be in touch.
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Expect a reply within 4 hours during business hours. James reads
          every message himself — nothing goes to a queue.
        </p>
        {submissionId && (
          <div className="mt-8 rounded-xl border border-border bg-background p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Your submission ID
            </p>
            <p className="mt-2 font-mono text-sm text-foreground break-all">
              {submissionId}
            </p>
            <Link
              href={`/quote/${submissionId}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-foreground"
            >
              <span className="underline-hover">Track your quote status</span>
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              Bookmark that link — it shows where things stand at any time.
            </p>
          </div>
        )}
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
        const chatSessionId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("stratus_chat_session")
            : null;
        const visitorSessionId = readVisitorSessionId();
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...Object.fromEntries(data),
            chatSessionId,
            visitorSessionId,
          }),
        })
          .then(async (res) => {
            const json = await res.json().catch(() => ({}));
            clearSaved();
            setSubmissionId(json.id ?? null);
            setSubmitted(true);
          })
          .catch(() => setSubmitting(false));
      }}
      className="space-y-12"
    >
      {fromEstimator && (
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
            From your cost estimate
          </p>
          <p className="mt-2 text-sm text-foreground">
            Your estimate is pre-filled in the project details below. Edit
            anything you like before sending — we&apos;ll use it as the
            starting point on the discovery call.
          </p>
        </div>
      )}

      {restored && !fromEstimator && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            We restored your draft from earlier.
          </p>
          <button
            type="button"
            onClick={() => {
              clearSaved();
              setProjectType("unsure");
              setBudget("unsure");
              setTimeline(null);
              setReferralSource(null);
              setExistingUrl("");
              setMessage("");
              setOwnerName("");
              setBusinessName("");
              setEmail("");
              setPhone("");
              setRestored(false);
            }}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Start fresh
          </button>
        </div>
      )}

      {/* Project type */}
      <fieldset className="space-y-4">
        <legend className="section-label">01 — What kind of project</legend>
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3">
          {PROJECT_TYPES.map((opt) => {
            const active = projectType === opt.value;
            return (
              <label
                key={opt.value}
                className={`group flex cursor-pointer flex-col gap-2 bg-background p-5 transition-colors ${
                  active ? "ring-1 ring-inset ring-accent" : "hover:bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={opt.value}
                  checked={active}
                  onChange={() => setProjectType(opt.value)}
                  className="sr-only"
                />
                <span
                  className={`text-base font-medium ${
                    active ? "text-accent" : ""
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {opt.hint}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Budget */}
      <fieldset className="space-y-4">
        <legend className="section-label">02 — Rough budget</legend>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((opt) => {
            const active = budget === opt.value;
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
                  name="budget"
                  value={opt.value}
                  checked={active}
                  onChange={() => setBudget(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Existing URL + Timeline */}
      <fieldset className="space-y-6">
        <legend className="section-label">03 — A few more details</legend>

        {/* Existing website */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            Existing website URL <span className="normal-case tracking-normal">(optional)</span>
          </p>
          <input
            id="existingUrl"
            name="existingUrl"
            type="url"
            value={existingUrl}
            onChange={(e) => setExistingUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors focus:border-foreground focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Timeline */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            When do you want to start?
          </p>
          <div className="flex flex-wrap gap-2">
            {TIMELINES.map((opt) => {
              const active = timeline === opt.value;
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
                    name="timeline"
                    value={opt.value}
                    checked={active}
                    onChange={() => setTimeline(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Referral source */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            How did you find us?
          </p>
          <div className="flex flex-wrap gap-2">
            {REFERRAL_SOURCES.map((opt) => {
              const active = referralSource === opt.value;
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
                    name="referralSource"
                    value={opt.value}
                    checked={active}
                    onChange={() => setReferralSource(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* Contact details */}
      <fieldset className="space-y-6">
        <legend className="section-label">04 — Tell us about you</legend>
        <div className="grid gap-px bg-border/60 sm:grid-cols-2">
          <FormField
            id="ownerName"
            name="ownerName"
            label="Your name"
            placeholder="Jane Doe"
            required
            value={ownerName}
            onChange={setOwnerName}
          />
          <FormField
            id="businessName"
            name="businessName"
            label="Business name"
            placeholder="Doe & Co."
            required
            value={businessName}
            onChange={setBusinessName}
          />
          <FormField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="jane@doeco.com"
            required
            value={email}
            onChange={(v) => { setEmail(v); setEmailError(null); }}
            onBlur={(v) => {
              if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                setEmailError("Enter a valid email address.");
              }
            }}
            error={emailError ?? undefined}
          />
          <FormField
            id="phone"
            name="phone"
            type="tel"
            label="Phone (optional)"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={setPhone}
            onBlur={(v) => setPhone(formatPhone(v))}
          />
        </div>

        {/* Contact preference */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Reach you by
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONTACT_PREFS.map((opt) => {
              const active = contactPref === opt.value;
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
                    name="contactPref"
                    value={opt.value}
                    checked={active}
                    onChange={() => {
                      setContactPref(opt.value);
                      // Reset consent when switching back to email-only
                      if (opt.value === "email") setSmsConsent(false);
                    }}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Text replies require a phone number above.
          </p>

          {/* SMS opt-in (TCPA-compliant consent) */}
          {(contactPref === "text" || contactPref === "either") && (
            <label
              className={`mt-4 flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
                smsConsent
                  ? "border-accent bg-accent/10"
                  : "border-border bg-background hover:border-foreground/40"
              }`}
            >
              <input
                type="checkbox"
                name="smsConsent"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                required={contactPref === "text"}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[oklch(0.68_0.14_250)]"
              />
              <span className="text-muted-foreground">
                I agree to receive text messages from Stratus Creative at the
                phone number above for project communication. Message and data
                rates may apply. Reply STOP to opt out at any time.
              </span>
            </label>
          )}
        </div>
      </fieldset>

      {/* Project details */}
      <fieldset className="space-y-4">
        <legend className="section-label">05 — What are you trying to do?</legend>
        <textarea
          id="message"
          name="message"
          rows={fromEstimator ? 14 : 6}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A few sentences about your business and what you're trying to build. The more specific, the better."
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors focus:border-foreground focus:outline-none font-mono text-sm"
        />
        {fromEstimator && (
          <p className="text-xs text-muted-foreground">
            The estimate is at the top — your project description goes after
            the &quot;My project&quot; line.
          </p>
        )}
      </fieldset>

      {/* Hidden helper fields so the existing API gets values it expects */}
      <input type="hidden" name="category" value="custom-inquiry" />
      <input type="hidden" name="city" value="not-specified" />
      {fromEstimator && (
        <input type="hidden" name="source" value="cost-estimator" />
      )}

      <div className="flex flex-col gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          We read every message. Reply within 4 hours during business hours.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
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

function readVisitorSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("stratus_visitor_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown };
    return typeof parsed?.id === "string" && parsed.id.length > 0 ? parsed.id : null;
  } catch {
    return null;
  }
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return raw;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

function FormField({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  value,
  onChange,
  onBlur,
  error,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: (v: string) => void;
  error?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="group flex flex-col gap-2 bg-background p-5"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-foreground/85">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
      />
      {error && (
        <span className="font-mono text-[10px] text-destructive">{error}</span>
      )}
    </label>
  );
}
