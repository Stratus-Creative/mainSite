import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustStrip } from "@/components/trust-strip";
import { SITE_SETTINGS } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "About — Stratus Creative",
  description:
    "Stratus Creative is a one-person studio building websites, workflows, and online presence for businesses that want to look bigger than they are.",
  alternates: { canonical: "https://stratus-creative.com/about" },
};

const PRINCIPLES = [
  {
    number: "01",
    title: "Productized for simple work, custom for everything else.",
    body: "Most agencies make every job custom because it pads the bill. Most production work is repeatable. We made the repeatable parts cheap and predictable, so we can charge fair rates on the parts that actually need engineering.",
  },
  {
    number: "02",
    title: "Transparent pricing, especially on AI.",
    body: "AI workflows have ongoing costs — model API calls, third-party APIs, vector storage. Most agencies hide them, then surprise-bill when usage spikes. We show every line of every quote in writing before you commit. The cost estimator is public so anyone can run the math themselves.",
  },
  {
    number: "03",
    title: "Engineering, not theater.",
    body: "We came up through industrial IT — building MES systems across eight international sites, automating multi-day deployments down to thirty minutes, running Kafka in production. We brought that operational discipline to web and AI work. No demos that fall apart, no \"we'll figure it out at the next meeting.\"",
  },
  {
    number: "04",
    title: "AI-native, not AI-hyped.",
    body: "We use AI tools daily in our own work. We've shipped AI products to real users, including Spark Analyzer (300+ users, reduced per-analysis cost from $5–7 to cents through orchestration). When we build an AI workflow for you, we know what it actually costs to run.",
  },
];

export default function AboutPage() {
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
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">About</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
              A small studio with{" "}
              <span className="text-accent">production-grade habits.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Stratus Creative is run by James Farmer from SC. We build
              websites, workflows, and online presence for businesses that
              want a real digital presence without the marketing-firm markup.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Background</p>
                {/* Founder photo */}
                <div className="mt-8 aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card">
                  {SITE_SETTINGS.founderPhoto ? (
                    <Image
                      src={SITE_SETTINGS.founderPhoto}
                      alt="James Farmer, founder of Stratus Creative"
                      width={400}
                      height={500}
                      className="h-full w-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
                      <div className="size-16 rounded-full bg-border" />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        James Farmer
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        Photo placeholder · drop /public/founder.jpg
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Founder · writes the code on every project
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="space-y-6 text-base text-muted-foreground sm:text-lg">
                  <p>
                    Before Stratus, James spent four years as an Industrial IT
                    Specialist at Michelin North America — leading MES system
                    deployments across eight international sites, running
                    Kafka and Oracle in production, and writing the PowerShell
                    automation that turned multi-day deployments into
                    thirty-minute runs (now the standard across all sites).
                  </p>
                  <p>
                    On the side, he built{" "}
                    <a
                      href="https://sparkanalyzer.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-hover text-foreground"
                    >
                      Spark Analyzer
                    </a>{" "}
                    — an AI-powered Minecraft server diagnostics tool that has
                    served 300+ registered users and processed 400+ reports.
                    Through orchestration architecture and a smart pre-processing
                    pipeline, the cost per analysis dropped from{" "}
                    <span className="text-accent">$5–7 to cents</span>.
                  </p>
                  <p>
                    Stratus exists because most agencies don&apos;t actually
                    know how AI workflows are priced — and they don&apos;t
                    know how to run anything in production. We bring industrial
                    IT discipline to the kind of work most freelancers can&apos;t
                    handle and most agencies overcharge for.
                  </p>
                  <p className="serif-accent mt-10 text-3xl text-accent">
                    — James
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Principles</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl">
                  How we work.{" "}
                  <span className="text-accent">In four lines.</span>
                </h2>
              </div>
            </div>

            <div className="grid gap-px bg-border/60 sm:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <article
                  key={p.number}
                  className="flex flex-col gap-4 bg-background p-8 lg:p-10"
                >
                  <span className="font-mono text-xs tracking-widest text-accent">
                    {p.number}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <TrustStrip variant="stack" />
          </div>
        </section>

        {/* Clients placeholder */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <TrustStrip variant="clients" />
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-5xl sm:text-6xl lg:text-7xl">
                  Want to work with us?
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  Tell us what you&apos;re trying to build. Reply within one
                  business day, no auto-responders.
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
                  href="/services"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  See services
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
