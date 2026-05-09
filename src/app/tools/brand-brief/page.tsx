import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrandBriefForm } from "@/components/brand-brief-form";

export const metadata: Metadata = {
  title: "Brand Brief Generator — Stratus Creative",
  description:
    "Auto-generate a discovery brief for your project — business overview, audience, voice, success criteria. Edit, refine, submit. Free, no signup.",
  alternates: {
    canonical: "https://stratus-creative.com/tools/brand-brief",
  },
  openGraph: {
    title: "Brand Brief Generator — Stratus Creative",
    description:
      "Auto-generate a discovery brief for your project. Edit, refine, submit with your inquiry. Free, no signup.",
    url: "https://stratus-creative.com/tools/brand-brief",
    siteName: "Stratus Creative",
    type: "website",
  },
  keywords: [
    "brand brief generator",
    "creative brief",
    "discovery brief",
    "website brief",
    "AI brand strategy",
    "marketing brief template",
  ],
};

export default function BrandBriefPage() {
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
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Brand Brief</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
              A discovery brief in{" "}
              <span className="text-accent">five minutes.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              A brief is the one-pager that aligns everyone before a project
              starts — what the business does, who it&apos;s for, how it
              should sound, and what winning looks like. Describe your
              business in a few sentences and we&apos;ll draft a structured
              brief you can edit, refine, and send with your inquiry. The
              clearer the brief, the faster we can scope.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Free. No signup. Your description never leaves the request that
              generates the brief.
            </p>
          </div>
        </section>

        {/* Generator */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <BrandBriefForm />
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How it works</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  Five minutes, six sections.
                </h2>
              </div>
              <div className="space-y-8 text-sm text-muted-foreground lg:col-span-8">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Step 1 — describe your business
                  </h3>
                  <p className="mt-2">
                    Two to four sentences in plain English. What you do, who
                    you serve, what&apos;s special about it. The model uses
                    this as a seed — quality in, quality out.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Step 2 — six structured sections
                  </h3>
                  <p className="mt-2">
                    We expand your seed into business overview, target
                    audience, brand voice, success criteria, existing assets,
                    and inspiration sites. Each one is a starting point — you
                    edit, refine, regenerate.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Step 3 — copy or send
                  </h3>
                  <p className="mt-2">
                    Copy the brief as Markdown for your records, or attach it
                    to an inquiry and James picks up the conversation already
                    knowing where you&apos;re trying to go.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    What this isn&apos;t
                  </h3>
                  <p className="mt-2">
                    A finished brand strategy. It&apos;s a discovery starter
                    that saves the first hour of every project — the
                    &quot;tell me about your business&quot; conversation gets
                    skipped because you already wrote it down.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Already have a brief?</p>
                <h2 className="display-heading mt-8 text-4xl sm:text-5xl lg:text-6xl">
                  Send it with your inquiry.
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  If you&apos;ve already done the thinking, skip the
                  generator. Start a project and paste your brief into the
                  message field — we&apos;ll pick it up from there and reply
                  within two business days.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Start a project
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  See more tools
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
