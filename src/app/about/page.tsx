import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustStrip } from "@/components/trust-strip";
import { SITE_SETTINGS } from "@/lib/site-settings";
import {
  FadeIn,
  ScrollReveal,
  Stagger,
  AccentSweep,
  Timeline,
  TimelineItem,
  ScrollType,
} from "@/components/motion";

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
            <Stagger step={120}>
              <FadeIn variant="slide-left">
                <p className="section-label">About</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
                  A small studio with{" "}
                  <span className="text-accent">
                    <AccentSweep>production-grade habits.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  Stratus Creative is run by James Farmer. We build
                  websites, workflows, and online presence for businesses that
                  want a real digital presence without the marketing-firm markup.
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Story */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12">
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
                    James didn&apos;t come up through an agency. He came up
                    through Michelin — running MES deployments across eight
                    international sites on three continents, managing Kafka and
                    Oracle in production, and writing the PowerShell automation
                    that compressed multi-day rollouts into thirty-minute runs.
                    That script became the standard across every site it touched.
                  </p>
                  <p>
                    While doing that, he built{" "}
                    <a
                      href="https://sparkanalyzer.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-hover text-foreground"
                    >
                      Spark Analyzer
                    </a>{" "}
                    from scratch — an AI diagnostics tool for Minecraft server
                    performance. Five hundred users. Four hundred reports
                    processed. Cost per analysis went from{" "}
                    <span className="text-accent">$5–7 to cents</span> through
                    orchestration architecture, not shortcuts.
                  </p>
                  <p>
                    Most agencies have never shipped a real product. Most
                    freelancers have never run anything at enterprise scale.
                    Stratus exists at that intersection: eight years of
                    production discipline, applied to web and AI work that
                    actually needs to hold up.
                  </p>
                  <p>
                    We don&apos;t demo things that fall apart. We don&apos;t
                    bill for &ldquo;strategy&rdquo; when the answer is
                    engineering.
                  </p>
                  <p className="serif-accent mt-10 text-3xl text-accent">
                    — James
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How we got here — timeline */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How we got here</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl">
                  Four years of production work,{" "}
                  <span className="text-accent">in four marks.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4" />
              <div className="lg:col-span-8">
                <Timeline>
                  <Stagger step={120}>
                    <ScrollReveal>
                      <TimelineItem year="2022 — 2026" title="Michelin · Industrial IT">
                        MES deployments across eight international sites. Kafka
                        in production. PowerShell automation that compressed
                        multi-day rollouts to thirty-minute runs — adopted as
                        the standard everywhere it touched.
                      </TimelineItem>
                    </ScrollReveal>
                    <ScrollReveal>
                      <TimelineItem year="2024" title="Spark Analyzer · launched">
                        AI diagnostics for Minecraft server performance. Grew
                        to 300+ users and 400+ reports processed. Per-analysis
                        cost reduced from $5–$7 to cents through orchestration
                        architecture.
                      </TimelineItem>
                    </ScrollReveal>
                    <ScrollReveal>
                      <TimelineItem year="2026" title="Stratus Creative · founded">
                        A studio at the intersection of enterprise discipline
                        and product taste. Productized for the straightforward,
                        custom for everything else.
                      </TimelineItem>
                    </ScrollReveal>
                    <ScrollReveal>
                      <TimelineItem year="Today" title="Building, in public">
                        Client work in flight. Public pricing. Public estimator.
                        Case studies as projects ship.
                      </TimelineItem>
                    </ScrollReveal>
                  </Stagger>
                </Timeline>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Principles</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl">
                  How we work.{" "}
                  <span className="text-accent">In four lines.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid gap-px bg-border/60 sm:grid-cols-2">
              <Stagger step={70}>
              {PRINCIPLES.map((p) => (
                <ScrollReveal
                  as="article"
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
                </ScrollReveal>
              ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal>
              <TrustStrip variant="stack" />
            </ScrollReveal>
          </div>
        </section>

        {/* Clients placeholder */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal>
              <TrustStrip variant="clients" />
            </ScrollReveal>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2>
                  <ScrollType text="Want to work with us?" className="display-heading mt-8 text-5xl sm:text-6xl lg:text-7xl" />
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
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
