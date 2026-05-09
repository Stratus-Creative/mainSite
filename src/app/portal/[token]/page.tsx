import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createServerClient } from "@/lib/supabase";
import { hashPortalToken } from "@/lib/portal-tokens";

export const metadata: Metadata = {
  title: "Project portal — Stratus Creative",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_CONFIG = {
  received: {
    label: "Received",
    description: "We have your submission and will review it shortly.",
    badge: "border-border bg-card text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  reviewing: {
    label: "Reviewing",
    description: "We're reviewing your project details.",
    badge: "border-accent/40 bg-accent/10 text-accent",
    dot: "bg-accent",
  },
  quoted: {
    label: "Quote sent",
    description: "Your quote is ready. Review the scope and accept when you're ready.",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400",
  },
  accepted: {
    label: "Confirmed",
    description: "Project is confirmed and in the queue.",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    description: "This project is closed.",
    badge: "border-border bg-card text-muted-foreground",
    dot: "bg-muted-foreground",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

const PUBLIC_EVENT_ACTIONS = new Set([
  "submission.status_changed",
  "quote.sent",
]);

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function timelineFor(projectType: string | null): string {
  if (projectType === "starter") return "Typically 5–7 business days from kickoff.";
  if (projectType === "custom") return "Typically 2–6 weeks depending on scope.";
  return "We'll confirm a timeline at kickoff.";
}

interface PortalParams {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: PortalParams) {
  const { token } = await params;

  // Reject anything that isn't a 64-char hex string before hitting the DB.
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return <ExpiredView />;
  }

  const supabase = createServerClient();
  const tokenHash = hashPortalToken(token);

  const { data: tokenRow, error: tokenError } = await supabase
    .from("portal_tokens")
    .select("submission_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    return <ExpiredView />;
  }

  const expiresAt = new Date(tokenRow.expires_at).getTime();
  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return <ExpiredView />;
  }

  // Best-effort: stamp used_at the first time, but allow re-use until expires_at.
  if (!tokenRow.used_at) {
    await supabase
      .from("portal_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token_hash", tokenHash);
  }

  // Allowlisted columns — never select internal_notes, lead_score, attribution.
  const { data: submission, error: subError } = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, email, project_type, quoted_amount, quoted_scope, quoted_at, stripe_payment_link, message"
    )
    .eq("id", tokenRow.submission_id)
    .single();

  if (subError || !submission) {
    return <ExpiredView />;
  }

  const status = (
    STATUS_CONFIG[submission.status as StatusKey] ? submission.status : "received"
  ) as StatusKey;
  const config = STATUS_CONFIG[status];

  // Outbound emails: deliberately do NOT select body. Admins may write internal
  // framing in email bodies that wasn't meant for client-facing display. Subject
  // + sent_at + recipient is enough to confirm "we sent you this".
  const [{ data: outboundRows }, { data: inboundRows }, { data: eventRows }] =
    await Promise.all([
      supabase
        .from("outbound_emails")
        .select("id, subject, sent_at, recipient_email")
        .eq("submission_id", submission.id)
        .order("sent_at", { ascending: false })
        .limit(10),
      supabase
        .from("inbound_emails")
        .select("id, from_email, subject, body_text, received_at")
        .eq("submission_id", submission.id)
        .order("received_at", { ascending: false })
        .limit(10),
      supabase
        .from("events")
        .select("id, action, metadata, created_at")
        .eq("resource_id", submission.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  type TimelineItem = {
    id: string;
    kind: "outbound" | "inbound" | "event";
    timestamp: string;
    title: string;
    sender: string;
    body?: string | null;
  };

  const timeline: TimelineItem[] = [];

  for (const o of outboundRows ?? []) {
    timeline.push({
      id: `out-${o.id}`,
      kind: "outbound",
      timestamp: o.sent_at,
      title: o.subject || "Email from Stratus Creative",
      sender: "Stratus Creative",
      // body intentionally omitted — see select() above
      body: null,
    });
  }

  for (const i of inboundRows ?? []) {
    timeline.push({
      id: `in-${i.id}`,
      kind: "inbound",
      timestamp: i.received_at,
      title: i.subject || "Your reply",
      sender: i.from_email || "You",
      body: i.body_text,
    });
  }

  for (const e of (eventRows ?? []) as Array<{
    id: string;
    action: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>) {
    if (!PUBLIC_EVENT_ACTIONS.has(e.action)) continue;
    let title = "Project update";
    if (e.action === "submission.status_changed") {
      const to = (e.metadata?.to as string | undefined) ?? null;
      title = to ? `Status changed to ${prettyStatus(to)}` : "Status changed";
    } else if (e.action === "quote.sent") {
      title = "Quote sent";
    }
    timeline.push({
      id: `evt-${e.id}`,
      kind: "event",
      timestamp: e.created_at,
      title,
      sender: "Stratus Creative",
    });
  }

  timeline.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const heroName =
    submission.business_name || submission.owner_name || "Your project";

  const formattedAmount = formatCurrency(submission.quoted_amount as number | null);

  const businessNameForMail = submission.business_name ?? "your project";
  const mailtoSubject = encodeURIComponent(
    `Re: ${businessNameForMail} (ref ${submission.id.slice(0, 8)})`
  );
  const mailtoBody = encodeURIComponent(
    `Hi James,\n\nA quick update on ${businessNameForMail}:\n\n`
  );
  const mailtoHref = `mailto:business@stratus-creative.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="section-label">Project portal</p>
            <h1 className="display-heading mt-8 max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
              {heroName}
            </h1>
            {submission.owner_name && submission.business_name && (
              <p className="mt-4 text-base text-muted-foreground">
                {submission.owner_name}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-sm ${config.badge}`}
              >
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${config.dot}`}
                />
                {config.label}
              </span>
              {submission.project_type && (
                <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {submission.project_type}
                </span>
              )}
            </div>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              {config.description}
            </p>
          </div>
        </section>

        {/* At a glance + Pay now */}
        <section className="border-b border-border/60">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-20">
            <div className="lg:col-span-7">
              <p className="section-label">Project at a glance</p>
              <div className="mt-6 grid gap-px bg-border/60 sm:grid-cols-2">
                <Detail
                  label="Submitted"
                  value={formatDateTime(submission.created_at)}
                />
                {submission.project_type && (
                  <Detail
                    label="Project type"
                    value={capitalize(submission.project_type)}
                  />
                )}
                {formattedAmount && (
                  <Detail label="Quoted investment" value={formattedAmount} />
                )}
                <Detail
                  label="Expected timeline"
                  value={timelineFor(submission.project_type)}
                />
              </div>

              {submission.quoted_scope && (
                <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Scope
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                    {submission.quoted_scope}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              {submission.stripe_payment_link &&
              typeof submission.stripe_payment_link === "string" &&
              submission.stripe_payment_link.startsWith("https://") &&
              submission.status === "quoted" ? (
                <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                    Ready to confirm?
                  </p>
                  <h2 className="mt-4 text-xl font-semibold text-foreground">
                    Lock this project in.
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Pay your deposit through our secure Stripe checkout. Once
                    you're in, we'll schedule the kickoff.
                  </p>
                  <a
                    href={submission.stripe_payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Pay deposit
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Reference
                  </p>
                  <p className="mt-3 break-all font-mono text-sm text-muted-foreground">
                    {submission.id}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Bookmark this page to come back at any time. Your sign-in
                    link is good for an hour — request a fresh one anytime from{" "}
                    <Link href="/portal/login" className="underline-hover text-foreground">
                      portal sign-in
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Communications timeline */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="section-label">Communications</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              Everything we've sent and heard back.
            </h2>

            {timeline.length === 0 ? (
              <p className="mt-8 text-base text-muted-foreground">
                Nothing here yet. As soon as we send your first update, it'll
                appear in this timeline.
              </p>
            ) : (
              <ul className="mt-10 divide-y divide-border/60">
                {timeline.map((item) => (
                  <li key={item.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-3">
                        <span
                          className={`inline-block size-2 rounded-full ${
                            item.kind === "outbound"
                              ? "bg-accent"
                              : item.kind === "inbound"
                                ? "bg-emerald-400"
                                : "bg-muted-foreground"
                          }`}
                          aria-hidden="true"
                        />
                        <p className="text-base font-medium text-foreground">
                          {item.title}
                        </p>
                      </div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {formatDateTime(item.timestamp)}
                      </p>
                    </div>
                    <p className="mt-2 pl-5 text-xs text-muted-foreground">
                      {item.kind === "inbound" ? "From" : "From"}: {item.sender}
                    </p>
                    {item.body && (
                      <details className="mt-3 pl-5">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                          View message
                        </summary>
                        <div className="mt-3 rounded-xl border border-border bg-card p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                            {stripHtml(item.body)}
                          </p>
                        </div>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Project files placeholder + send a note */}
        <section>
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-20">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Project files
              </p>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Files will appear here once we kick off.
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Mockups, deliverables, and shared docs will live in this card
                once your project is in flight.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Need to update something?
              </p>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Send a note to James.
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Quickest way to reach me — opens your mail client with the
                project reference prefilled.
              </p>
              <a
                href={mailtoHref}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
              >
                Email James
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base text-foreground">{value}</p>
    </div>
  );
}

function ExpiredView() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">Portal</p>
            <h1 className="display-heading mt-8 text-4xl sm:text-5xl">
              This sign-in link has expired.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Sign-in links are good for one hour. Request a fresh one and we'll
              send it to your inbox.
            </p>
            <Link
              href="/portal/login"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Request a new link
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function prettyStatus(s: string) {
  if (s === "quoted") return "Quote sent";
  return capitalize(s);
}

function stripHtml(s: string): string {
  // Outbound emails are stored as HTML; render plain-text view in the timeline
  // expander. This is a simple decode — not security-critical because we never
  // dangerouslySetInnerHTML the result.
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
