import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createPublicClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Quote status — Stratus Creative",
  robots: { index: false, follow: false },
};

const STATUS_CONFIG = {
  received: {
    label: "Received",
    description: "We have your submission and will review it shortly.",
    next: "Expect a reply within 4 hours during business hours.",
    badge: "border-border bg-card text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  reviewing: {
    label: "Reviewing",
    description: "We're reviewing your project details.",
    next: "We're putting together a proposal — expect an email soon.",
    badge: "border-accent/40 bg-accent/10 text-accent",
    dot: "bg-accent",
  },
  quoted: {
    label: "Quote sent",
    description: "Your quote is ready.",
    next: "Check your email — we've sent a full proposal. Reply with any questions.",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-400",
    dot: "bg-amber-400",
  },
  accepted: {
    label: "Confirmed",
    description: "Project is confirmed and in the queue.",
    next: "We'll reach out shortly to schedule the kickoff.",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    description: "This project is closed.",
    next: "Have something new in mind? Start a fresh project.",
    badge: "border-border bg-card text-muted-foreground",
    dot: "bg-muted-foreground",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface Params {
  params: Promise<{ id: string }>;
}

export default async function QuotePage({ params }: Params) {
  const { id } = await params;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, created_at, status, source, owner_name, business_name, project_type, budget, website_url, concern, message"
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const status = (STATUS_CONFIG[data.status as StatusKey]
    ? data.status
    : "received") as StatusKey;
  const config = STATUS_CONFIG[status];

  const isAudit = data.source === "free-website-audit";

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="editorial-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="section-label">Quote tracker</p>
            <h1 className="display-heading mt-8 max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
              {data.business_name ?? data.owner_name ?? "Your project"}
            </h1>
            <div className="mt-8">
              <span
                className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-sm ${config.badge}`}
              >
                <span aria-hidden="true" className={`size-2 rounded-full ${config.dot}`} />
                {config.label}
              </span>
            </div>
          </div>
        </section>

        {/* Status detail */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="section-label">Where things stand</p>
                <p className="mt-6 text-xl text-foreground">{config.description}</p>
                <p className="mt-4 text-base text-muted-foreground">{config.next}</p>
                {status === "closed" && (
                  <Link
                    href="/start"
                    className="mt-6 inline-flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="underline-hover">Start a new project</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>

              <div className="lg:col-span-7">
                <p className="section-label">What we received</p>
                <div className="mt-6 grid gap-px bg-border/60 sm:grid-cols-2">
                  {data.owner_name && (
                    <Detail label="Name" value={data.owner_name} />
                  )}
                  {data.business_name && (
                    <Detail label="Business" value={data.business_name} />
                  )}
                  {!isAudit && data.project_type && (
                    <Detail label="Project type" value={capitalize(data.project_type)} />
                  )}
                  {!isAudit && data.budget && (
                    <Detail label="Budget" value={formatBudget(data.budget)} />
                  )}
                  {isAudit && data.website_url && (
                    <Detail label="Website" value={data.website_url} />
                  )}
                  {isAudit && data.concern && (
                    <Detail label="Main concern" value={capitalize(data.concern)} />
                  )}
                  <Detail
                    label="Submitted"
                    value={formatDate(data.created_at)}
                  />
                  <Detail
                    label="Type"
                    value={isAudit ? "Free website audit" : "Project inquiry"}
                  />
                </div>

                {data.message && (
                  <div className="mt-px bg-background p-6">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Your message
                    </p>
                    <p className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap">
                      {data.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Reference + contact */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="section-label">Reference ID</p>
                <p className="mt-4 break-all font-mono text-sm text-muted-foreground">
                  {data.id}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Bookmark this page or save your ID to check back anytime.
                </p>
              </div>
              <div className="lg:col-span-6">
                <p className="section-label">Questions?</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Email us and include your reference ID above.
                </p>
                <a
                  href={`mailto:business@stratus-creative.com?subject=Re: quote ${data.id}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-foreground"
                >
                  <span className="underline-hover">business@stratus-creative.com</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
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
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base text-foreground">{value}</p>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function formatBudget(budget: string) {
  const map: Record<string, string> = {
    "under-2k": "Under $2K",
    "2k-5k": "$2K – $5K",
    "5k-15k": "$5K – $15K",
    "15k-plus": "$15K+",
    unsure: "Unsure",
  };
  return map[budget] ?? capitalize(budget);
}
