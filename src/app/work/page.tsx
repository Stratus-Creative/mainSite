import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  FadeIn,
  ScrollReveal,
  Stagger,
  AccentSweep,
  RevealMask,
} from "@/components/motion";

export const metadata: Metadata = {
  title: "Work — Stratus Creative",
  description:
    "What we've built. Real artifacts, real numbers, no padded portfolio.",
};

const BUILDS = [
  {
    label: "Studio · in flight",
    title: "Stratus Creative client work",
    description:
      "In-flight client builds across local services, internal tooling, and brand sites. Case studies will be published as projects ship and clients give us permission to share specifics.",
    cta: { href: "/start", label: "Be the first published case", external: false },
  },
  {
    label: "Product · live",
    title: "Spark Analyzer",
    description:
      "AI-powered Minecraft server performance analysis. 300+ registered users. 400+ reports processed. Per-analysis cost reduced from $5–$7 to cents through orchestration architecture and a pre-processing pipeline. TypeScript, Next.js, AI integration.",
    cta: { href: "https://sparkanalyzer.com", label: "sparkanalyzer.com", external: true },
  },
  {
    label: "Enterprise · shipped",
    title: "Michelin MES automation",
    description:
      "Industrial PowerShell automation for multi-site MES deployment. Reduced multi-day rollouts to 30 minutes. Adopted as the standard process across 8 international sites including Mexico and Brazil. Kafka, Oracle SQL, VMware vSphere.",
    cta: null,
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
            <Stagger step={120}>
              <FadeIn variant="slide-left">
                <p className="section-label">Work</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
                  What I&apos;ve <span className="text-accent">
                    <AccentSweep>built.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  A studio is only as credible as what it ships. Here&apos;s
                  what we ship — client builds in flight, a live product with
                  real users, and enterprise automation running in production.
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Builds */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Selected builds</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl lg:text-6xl">
                  Real artifacts.{" "}
                  <span className="text-muted-foreground">
                    Real numbers. No padded portfolio.
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid gap-px bg-border/60 lg:grid-cols-3">
              <Stagger step={70}>
              {BUILDS.map((item) => (
                <RevealMask key={item.title} className="h-full">
                  <ScrollReveal
                    as="article"
                    className="group flex h-full flex-col bg-background p-8 lg:p-10"
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
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.cta && (
                      <div className="mt-6">
                        {item.cta.external ? (
                          <a
                            href={item.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-foreground"
                          >
                            <span className="underline-hover">{item.cta.label}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          <Link
                            href={item.cta.href}
                            className="inline-flex items-center gap-2 text-sm text-foreground"
                          >
                            <span className="underline-hover">{item.cta.label}</span>
                            <span aria-hidden="true">→</span>
                          </Link>
                        )}
                      </div>
                    )}
                  </ScrollReveal>
                </RevealMask>
              ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* Be the first */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Case studies</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-3xl tracking-tight sm:text-4xl">
                  Each one will document the problem, the approach, and the
                  measurable outcome — not just screenshots.{" "}
                  <span className="text-accent">
                    Want to be the first published case?
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
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
