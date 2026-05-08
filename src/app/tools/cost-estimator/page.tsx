import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CostEstimatorForm } from "@/components/cost-estimator-form";
import { CostEstimatorJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "AI Workflow Cost Estimator — Stratus Creative",
  description:
    "Estimate the real monthly cost of an AI workflow — model API calls, third-party APIs, vector storage, and ongoing care. Free, transparent, no signup.",
  alternates: {
    canonical: "https://stratus-creative.com/tools/cost-estimator",
  },
  openGraph: {
    title: "AI Workflow Cost Estimator — Stratus Creative",
    description:
      "Estimate the real monthly cost of an AI workflow before you commit. Model API costs, third-party APIs, vector storage, and ongoing care — all in one calculator.",
    url: "https://stratus-creative.com/tools/cost-estimator",
    siteName: "Stratus Creative",
    type: "website",
  },
  keywords: [
    "AI workflow cost calculator",
    "AI agent pricing",
    "LLM API cost estimator",
    "AI automation pricing",
    "GPT-4 cost",
    "Claude API pricing",
    "AI chatbot cost",
    "RAG cost calculator",
  ],
};

export default function CostEstimatorPage() {
  return (
    <>
      <CostEstimatorJsonLd />
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Tools · Free</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
              AI Workflow Cost Estimator
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Most agencies hide the ongoing cost of AI. We don&apos;t.
              Pick a workflow, set the volume, see what it would actually cost
              to run per month — including LLM calls, third-party APIs, vector
              storage, and our Care fee.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Built for honest budgeting. Every estimate runs in your browser —
              we never see your numbers unless you send them to us.
            </p>
          </div>
        </section>

        {/* Estimator */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <CostEstimatorForm />
          </div>
        </section>

        {/* How this calculator works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How it works</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  The math behind the numbers.
                </h2>
              </div>
              <div className="space-y-8 text-sm text-muted-foreground lg:col-span-8">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    LLM API costs
                  </h3>
                  <p className="mt-2">
                    Calculated as{" "}
                    <span className="font-mono text-accent">
                      (volume × avg input tokens × $/M input)
                    </span>{" "}
                    +{" "}
                    <span className="font-mono text-accent">
                      (volume × avg output tokens × $/M output)
                    </span>
                    . Anthropic models include a prompt-cache slider — cached
                    input is roughly 90% cheaper than uncached.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Third-party API costs
                  </h3>
                  <p className="mt-2">
                    Per-request multipliers for things like VIN decoders, SMS,
                    voice, and transcription. RAG workflows include a fixed
                    monthly cost for vector database storage (Pinecone
                    serverless minimum is ~$70/mo).
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Care tier
                  </h3>
                  <p className="mt-2">
                    Recommended automatically based on workflow complexity,
                    volume, memory, and whether voice is involved. Care covers
                    Stratus&apos;s monitoring, prompt tuning, model upgrades,
                    and small fixes — distinct from API spend (which is always
                    pass-through).
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Safety buffer
                  </h3>
                  <p className="mt-2">
                    The high end of the monthly invoice adds a 30% buffer on
                    API spend. Most workflows run below the high end; this is
                    the ceiling we&apos;d quote in a real proposal so you
                    aren&apos;t surprised.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    What this isn&apos;t
                  </h3>
                  <p className="mt-2">
                    A binding quote. It&apos;s a directional tool. Your actual
                    quote depends on scope, integrations, and exact usage
                    patterns — which is what we figure out in the discovery
                    call. The estimator gets you 80% of the way there in five
                    minutes.
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
                  Bring your estimate to a discovery call. We&apos;ll pressure-test
                  the assumptions, scope the build, and send you a firm proposal
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
                  href="/pricing"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  See full pricing
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
