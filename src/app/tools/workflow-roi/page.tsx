import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorkflowRoiForm } from "@/components/workflow-roi-form";

export const metadata: Metadata = {
  title: "Workflow ROI Calculator — Stratus Creative",
  description:
    "Plug in your manual process — see how much time and money an AI workflow would save and how fast it pays back. Free, no signup.",
  alternates: {
    canonical: "https://stratus-creative.com/tools/workflow-roi",
  },
  openGraph: {
    title: "Workflow ROI Calculator — Stratus Creative",
    description:
      "Plug in your manual process — see how much time and money an AI workflow would save and how fast it pays back. Free, no signup.",
    url: "https://stratus-creative.com/tools/workflow-roi",
    siteName: "Stratus Creative",
    type: "website",
  },
  keywords: [
    "AI workflow ROI calculator",
    "automation payback period",
    "AI automation savings",
    "workflow automation ROI",
    "AI labor cost savings",
    "process automation calculator",
  ],
};

export default function WorkflowRoiPage() {
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
            <p className="section-label">Workflow ROI</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
              Is automation actually{" "}
              <span className="text-accent">worth it?</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Tell us about a manual process you&apos;re running today —
              hours, headcount, hourly cost. We&apos;ll show you the labor
              savings, monthly net after Stratus Care + API spend, and how
              many months it takes to pay back the build.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Pure browser math. We never see your numbers unless you send
              them to us.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <WorkflowRoiForm />
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How it works</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  The math, in plain English.
                </h2>
              </div>
              <div className="space-y-8 text-sm text-muted-foreground lg:col-span-8">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Hours saved per month
                  </h3>
                  <p className="mt-2">
                    <span className="font-mono text-accent">
                      hours/week × 4.33 × people × replacement %
                    </span>
                    . We use 4.33 weeks/month — slightly more accurate than 4.
                    Replacement % accounts for the review work you&apos;ll
                    still do; most workflows automate 70–90%, never 100%.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Net monthly savings
                  </h3>
                  <p className="mt-2">
                    Labor savings minus Care tier minus API pass-through.
                    Care is our recurring time; API is what LLMs and
                    third-party tools cost. We always show all three lines so
                    you know what&apos;s ours and what&apos;s pass-through.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Payback period
                  </h3>
                  <p className="mt-2">
                    Build cost ÷ net monthly savings. &quot;Already worth
                    it&quot; if month one covers the build. &quot;12+
                    months&quot; if the math is ugly — which usually means
                    the process isn&apos;t painful enough to automate yet.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    What this isn&apos;t
                  </h3>
                  <p className="mt-2">
                    A binding quote. It&apos;s a sanity check. Your real quote
                    depends on integrations, edge cases, and volume — which
                    is what discovery is for. Run the conservative scenario
                    first; if that pencils, the project is real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-4xl sm:text-5xl lg:text-6xl">
                  Get a real quote.
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  Bring your numbers to a discovery call. We&apos;ll
                  pressure-test the assumptions, scope the build, and send
                  you a firm proposal within two business days.
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
                  href="/tools/cost-estimator"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  Estimate the AI tokens
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
