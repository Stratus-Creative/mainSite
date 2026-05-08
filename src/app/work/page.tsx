import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Work — Stratus Creative",
  description:
    "Selected work, in-flight projects, and case studies from Stratus Creative.",
};

const IN_FLIGHT = [
  {
    label: "Local services",
    title: "A multi-trade contractor in the Upstate",
    description:
      "Single-page Starter build with auto-pulled Google reviews and a click-to-call hero. Currently in design.",
  },
  {
    label: "Internal tooling",
    title: "AI agent for inbound lead qualification",
    description:
      "A workflow-tier engagement: AI agent that reads inbound emails, scores them, and drafts replies. In build.",
  },
  {
    label: "Brand site",
    title: "Boutique consultancy refresh",
    description:
      "Custom multi-page brand site replacing a template-y Squarespace presence. Discovery phase.",
  },
];

export default function WorkPage() {
  return (
    <>
      <SiteHeader activePath="/work" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">Work</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
              Selected work,{" "}
              <span className="text-accent">coming soon.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Stratus is a young studio. We&apos;d rather show you a small
              number of projects we&apos;re proud of than a portfolio padded
              with template sites we built in 2019. Case studies arrive as
              projects ship.
            </p>
          </div>
        </section>

        {/* In flight */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">In flight</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl lg:text-6xl">
                  What we&apos;re building right now.
                </h2>
              </div>
            </div>

            <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
              {IN_FLIGHT.map((item) => (
                <article
                  key={item.title}
                  className="group flex flex-col bg-background p-8 lg:p-10"
                >
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md border border-border/60 bg-card">
                    <div className="editorial-grid h-full w-full opacity-60" />
                  </div>

                  <p className="mt-8 font-mono text-xs tracking-widest text-accent">
                    {item.label}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Case studies, eventually */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Case studies</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-3xl tracking-tight sm:text-4xl">
                  Coming as soon as projects ship.{" "}
                  <span className="text-muted-foreground">
                    Each one will document the problem, the approach, and the
                    measurable outcome — not just screenshots.
                  </span>{" "}
                  <span className="text-accent">
                    Want to be the first?
                  </span>
                </h2>
                <Link
                  href="/start"
                  className="mt-10 inline-flex items-center gap-3 text-base text-foreground"
                >
                  <span className="underline-hover">Tell us about your project</span>
                  <span aria-hidden="true">→</span>
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
