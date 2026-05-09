import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Transparency — Stratus Creative",
  description:
    "Anonymized real-world cost and uptime data from Stratus Creative's hosted clients. Live once we have 5+ AI clients in production.",
  alternates: {
    canonical: "https://stratus-creative.com/transparency",
  },
};

export default function TransparencyPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">Transparency</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6rem]">
              Real numbers.{" "}
              <span className="text-accent">Real soon.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Most agencies talk about pricing in the abstract. Once we have
              real client data we&apos;re cleared to share, this page will
              show the actual monthly cost ranges, AI workflow API spend, and
              uptime numbers from our live deployments — anonymized.
            </p>
          </div>
        </section>

        {/* Placeholder structure */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">When this goes live</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              What will Stratus actually publish here?
            </h2>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              We&apos;ll publish this page once we have 5+ AI workflow clients
              in production. The data will be anonymized, aggregated, and
              updated monthly. Specifically:
            </p>
            <ul className="mt-8 grid gap-px bg-border/60 sm:grid-cols-2">
              {[
                {
                  title: "Median monthly invoice",
                  detail:
                    "What our clients actually pay us per month, including Care + API + hosting.",
                },
                {
                  title: "API spend distribution",
                  detail:
                    "Real AI API costs across our client base. Min, median, max.",
                },
                {
                  title: "Workflow type breakdown",
                  detail:
                    "Which AI workflows we run and what each costs to operate.",
                },
                {
                  title: "Uptime over the trailing 30 days",
                  detail:
                    "Real availability numbers for our hosted client sites.",
                },
                {
                  title: "Time-to-quote",
                  detail:
                    "Average time from inbound inquiry to firm proposal.",
                },
                {
                  title: "Client tenure distribution",
                  detail:
                    "How long clients stay with us and why they leave.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="bg-background p-6 lg:p-8"
                >
                  <h3 className="text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </article>
              ))}
            </ul>
          </div>
        </section>

        {/* Why */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
            <p className="section-label">Why publish this</p>
            <p className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl">
              Most agencies talk about pricing in glossy abstractions. We&apos;d
              rather show the real numbers. If we&apos;re proud of how our
              client deployments perform, this page is a competitive moat. If
              we&apos;re not, it&apos;s a forcing function for us to do better.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">In the meantime</p>
                <h2 className="display-heading mt-8 text-4xl sm:text-5xl">
                  How can I see real numbers today?
                </h2>
                <p className="mt-6 max-w-xl text-base text-muted-foreground">
                  We don&apos;t have client data yet, but we built a public
                  tool that uses the same math we run internally.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                <Link
                  href="/tools/cost-estimator"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Open the estimator
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  Start a project
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
