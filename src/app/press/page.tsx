import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn, ScrollReveal, Stagger, ScrollType } from "@/components/motion";

export const metadata: Metadata = {
  title: "Press kit — Stratus Creative",
  description:
    "Logo files, brand colors, founder bio, photos, and contact info for press, podcasts, and partners.",
  alternates: { canonical: "https://stratus-creative.com/press" },
};

const COLORS = [
  { name: "Background", hex: "#181818", oklch: "oklch(0.18 0 0)", role: "Primary background" },
  { name: "Foreground", hex: "#FAFAFA", oklch: "oklch(0.98 0 0)", role: "Primary text" },
  { name: "Cobalt", hex: "#7894E8", oklch: "oklch(0.68 0.14 250)", role: "Accent / brand color" },
  { name: "Card", hex: "#2C2C2C", oklch: "oklch(0.22 0 0)", role: "Card surface" },
  { name: "Muted", hex: "#9F9F9F", oklch: "oklch(0.78 0 0)", role: "Secondary text" },
];

const QUICK_FACTS = [
  { label: "Founded", value: "2026" },
  { label: "Based in", value: "Simpsonville, SC, USA" },
  { label: "Team size", value: "Solo studio (founder-led)" },
  { label: "Stack", value: "Next.js, Tailwind CSS, Vercel, Supabase, Anthropic, OpenAI" },
  { label: "Specialties", value: "Websites, AI workflows, online presence" },
  { label: "Starter price", value: "$1,495 flat" },
  { label: "Custom range", value: "$5K – $20K typical" },
];

export default function PressKitPage() {
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
            <Stagger step={120}>
              <FadeIn variant="slide-left">
                <p className="section-label">Press · Brand · Partners</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
                  Press kit.
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  Everything you need to write about, reference, or partner with
                  Stratus Creative. For press inquiries, podcasts, or partnerships,
                  email{" "}
                  <a
                    href="mailto:business@stratus-creative.com"
                    className="underline-hover text-foreground"
                  >
                    business@stratus-creative.com
                  </a>
                  .
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Quick facts */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <ScrollReveal>
              <p className="section-label">Quick facts</p>
            </ScrollReveal>
            <div className="mt-8 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
              <Stagger step={70}>
              {QUICK_FACTS.map((f) => (
                <ScrollReveal key={f.label} className="bg-background p-6">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {f.label}
                  </p>
                  <p className="mt-2 text-base text-foreground">{f.value}</p>
                </ScrollReveal>
              ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <ScrollReveal>
              <p className="section-label">About Stratus Creative</p>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Stratus Creative is a one-person studio building websites,
                workflows, and online presence for businesses that want to
                look bigger than they are. Founded by James Farmer, an
                Industrial IT Specialist at Michelin North America who&apos;s
                spent four years deploying production systems across eight
                international sites.
              </p>
              <p>
                Stratus is differentiated by transparent pricing — particularly
                on AI workflows, where most agencies hide ongoing costs. Stratus
                publishes its prices, runs a free public AI workflow cost
                estimator, and breaks every quote into Build / Care / API as
                three explicit lines.
              </p>
              <p>
                Stratus uses modern infrastructure (Next.js, Tailwind CSS,
                Vercel, Anthropic, OpenAI) and AI-assisted development to ship fast at fair
                prices. The Starter — a productized website — is $1,495 flat and
                ships in 5–7 business days. Custom engagements (multi-page,
                automation, AI agents) start at $5,000.
              </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Founder */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <ScrollReveal>
              <p className="section-label">Founder</p>
            <h2>
              <ScrollType text="James Farmer" className="display-heading mt-6 text-3xl sm:text-4xl" />
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Founder, Stratus Creative · Industrial IT Specialist, Michelin
              North America
            </p>
            <div className="mt-6 space-y-4 text-base text-muted-foreground sm:text-lg">
              <p>
                James leads MES (Manufacturing Execution System) deployments
                across eight Michelin sites in North and South America. He
                built the PowerShell automation that reduced multi-day
                deployments to under 30 minutes — now the standard across all
                Michelin sites.
              </p>
              <p>
                On the side, James built{" "}
                <a
                  href="https://sparkanalyzer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Spark Analyzer
                </a>
                , an AI-powered Minecraft server diagnostics tool. Through
                orchestration architecture and a smart pre-processing
                pipeline, the cost per analysis dropped from $5–7 to cents.
                300+ users, 400+ reports processed.
              </p>
              <p>
                Stratus Creative is the studio for the same operational
                discipline applied to web and AI work for small businesses.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-2 text-sm">
              <a
                href="https://linkedin.com/in/ja-farmer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-hover"
              >
                LinkedIn — linkedin.com/in/ja-farmer
              </a>
              <a
                href="https://alecfarmer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-hover"
              >
                Personal site — alecfarmer.com
              </a>
            </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Brand colors */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <ScrollReveal>
              <p className="section-label">Brand colors</p>
              <h2>
                <ScrollType text="Color palette." className="display-heading mt-6 text-3xl sm:text-4xl" />
              </h2>
            </ScrollReveal>
            <div className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-5">
              <Stagger step={70}>
              {COLORS.map((c) => (
                <ScrollReveal
                  as="article"
                  key={c.name}
                  className="flex flex-col bg-background p-6"
                >
                  <div
                    className="h-24 w-full rounded-md border border-border"
                    style={{ background: c.hex }}
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-base font-medium">{c.name}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {c.hex}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {c.oklch}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">{c.role}</p>
                </ScrollReveal>
              ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* Logo placeholder */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <ScrollReveal>
              <p className="section-label">Logo</p>
              <h2>
                <ScrollType text="Marks & wordmark." className="display-heading mt-6 text-3xl sm:text-4xl" />
              </h2>
            </ScrollReveal>
            <ScrollReveal className="mt-12 rounded-2xl border border-dashed border-border/60 bg-card p-12 text-center">
              <p className="text-base text-muted-foreground">
                Logo files (SVG, PNG transparent, dark + light versions)
                available on request. Email{" "}
                <a
                  href="mailto:business@stratus-creative.com"
                  className="underline-hover text-foreground"
                >
                  business@stratus-creative.com
                </a>
                .
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Self-serve download will be added once the brand is finalized.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">For press</p>
                <h2>
                  <ScrollType text="Get in touch." className="display-heading mt-8 text-4xl sm:text-5xl" />
                </h2>
                <p className="mt-6 max-w-xl text-base text-muted-foreground">
                  We&apos;ll respond to press inquiries within one business
                  day.
                </p>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <a
                  href="mailto:business@stratus-creative.com"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Email us
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
