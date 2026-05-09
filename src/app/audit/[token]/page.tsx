import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createServerClient } from "@/lib/supabase";
import { hashPortalToken } from "@/lib/portal-tokens";

export const metadata: Metadata = {
  title: "Your audit — Stratus Creative",
  robots: { index: false, follow: false },
};

// Validates a magic-link token against Supabase at request time.
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ token: string }>;
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-destructive";
}

export default async function AuditPage({ params }: Params) {
  const { token } = await params;
  if (!/^[a-f0-9]{32,128}$/i.test(token)) notFound();

  const supabase = createServerClient();
  const { data: tokenRow } = await supabase
    .from("portal_tokens")
    .select("submission_id, expires_at")
    .eq("token_hash", hashPortalToken(token))
    .maybeSingle();

  if (!tokenRow) {
    return (
      <ExpiredOrInvalid message="This audit link is invalid." />
    );
  }
  if (new Date(tokenRow.expires_at) < new Date()) {
    return (
      <ExpiredOrInvalid message="This audit link has expired." />
    );
  }

  const { data: sub } = await supabase
    .from("submissions")
    .select(
      "id, owner_name, business_name, website_url, concern, audit_report, audit_summary, audit_score, audit_sent_at"
    )
    .eq("id", tokenRow.submission_id)
    .single();

  if (!sub || !sub.audit_report) notFound();

  const clientName = sub.business_name || sub.owner_name || "your site";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Website audit
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {clientName}
        </h1>
        {sub.website_url && (
          <p className="mt-2 text-sm text-muted-foreground">
            {sub.website_url}
          </p>
        )}

        {/* Score + summary band */}
        {(sub.audit_score !== null || sub.audit_summary) && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {sub.audit_score !== null && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Score
                </p>
                <p className={`mt-2 text-4xl font-semibold tracking-tight ${scoreColor(sub.audit_score)}`}>
                  {sub.audit_score}
                  <span className="text-lg text-muted-foreground"> / 10</span>
                </p>
              </div>
            )}
            {sub.audit_summary && (
              <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Takeaway
                </p>
                <p className="mt-2 text-base text-foreground">
                  {sub.audit_summary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Findings */}
        <article className="prose prose-invert mt-12 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent prose-strong:text-foreground prose-li:text-foreground/90 prose-p:text-foreground/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {sub.audit_report}
          </ReactMarkdown>
        </article>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            Want help fixing this?
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Turn this audit into a project
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We can rebuild the site as a Starter ($1,495 flat) or scope something custom.
          </p>
          <Link
            href="/start"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Start a project
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ExpiredOrInvalid({ message }: { message: string }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Audit link
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{message}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Need a fresh link? Reply to your last email from us, or reach out at{" "}
          <a
            href="mailto:business@stratus-creative.com"
            className="text-foreground underline"
          >
            business@stratus-creative.com
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
