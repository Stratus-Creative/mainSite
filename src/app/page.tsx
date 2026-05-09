import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrustStrip } from "@/components/trust-strip";
import { HomeHeroFaq } from "@/components/home-hero-faq";
import { SITE_SETTINGS } from "@/lib/site-settings";

const PILLARS = [
  {
    number: "01",
    title: "Websites",
    tagline: "Built to convert. Built to last.",
    description:
      "Marketing sites and brand presences that actually win business. Mobile-first, fast, and SEO-clean — no template heritage, no maintenance headaches.",
    capabilities: [
      "Marketing & brand sites",
      "Local-business builds",
      "Conversion-focused landing pages",
      "Lightweight CMS where it earns its keep",
    ],
  },
  {
    number: "02",
    title: "Workflows",
    tagline: "Stop doing things twice.",
    description:
      "We design and build the operational systems behind your business — from quote-to-invoice flows to AI agents that handle the work nobody wants to.",
    capabilities: [
      "Internal process automation",
      "Marketing automation & CRM",
      "Customer-facing flows (booking, intake)",
      "AI tools, chatbots, and agents",
    ],
  },
  {
    number: "03",
    title: "Online presence",
    tagline: "Show up where customers look.",
    description:
      "Google Business Profile optimization and reputation management — wired directly into your site so reviews, hours, and contact info stay in sync.",
    capabilities: [
      "Google Business Profile optimization",
      "Reputation & reviews management",
      "Live reviews on your website",
      "Local search visibility",
    ],
  },
];

const PROCESS = [
  {
    step: "01",
    title: "We talk",
    description:
      "A short call to understand the business, the audience, and what success looks like. No questionnaires.",
  },
  {
    step: "02",
    title: "We propose",
    description:
      "A clear scope with a fixed price (Starter) or a transparent custom quote. Decide in a day, not a week.",
  },
  {
    step: "03",
    title: "We build",
    description:
      "Design, copy, and build — all in-house. Most Starter sites ship in 5–7 business days. Custom engagements run 2–6 weeks.",
  },
  {
    step: "04",
    title: "We launch",
    description:
      "Hand-off, training, and an optional hosting plan that keeps the lights on so you don't have to think about it.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader activePath="/" />

      <main className="flex-1">
        {/* HERO — full bleed, manifesto */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="editorial-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

          <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40">
            {/* Top meta line */}
            <div className="mb-16 flex items-center justify-between gap-6">
              <p className="section-label">Design + Engineering · Est. 2026</p>
              {SITE_SETTINGS.customSlotsThisQuarter !== null && (
                <p className="hidden items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent sm:inline-flex">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-accent"
                  />
                  {SITE_SETTINGS.customSlotsThisQuarter} Custom slots this quarter
                </p>
              )}
            </div>

            <h1 className="display-heading max-w-5xl text-5xl sm:text-7xl lg:text-[7.5rem]">
              The website you&apos;ve been putting off.
              <br />
              <span className="serif-accent text-accent">
                Done in seven days.
              </span>
            </h1>

            <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:items-end">
              <p className="max-w-xl text-base text-muted-foreground sm:text-lg lg:col-span-7">
                Custom-designed, mobile-first, search-ready.{" "}
                <span className="text-foreground">
                  <data value="1495">$1,495</data> flat. Yours the day it ships.
                </span>{" "}
                Workflows and AI when you need more, quoted firm from{" "}
                <data value="5000">$5K</data>. No retainer, no template tax.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                <Link
                  href="/start?plan=starter"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Get the <data value="1495">$1,495</data> Starter
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
                <Link
                  href="/work"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
                >
                  See selected work
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                7-day money-back
              </span>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                Fixed-price
              </span>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                No retainer
              </span>
            </div>

            {/* Inline FAQ — answers top 3 prospect questions before they scroll */}
            <div className="mt-20 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Quick answers</p>
              </div>
              <div className="lg:col-span-8">
                <HomeHeroFaq />
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS — three numbered services */}
        <section id="services" className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="mb-20 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">What we do</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl lg:text-6xl">
                  Three things, done seriously.
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  Most agencies stretch themselves across twenty services and do
                  none of them well. We do three. They&apos;re the three that move
                  the needle for the kind of businesses we work with.
                </p>
              </div>
            </div>

            <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map((pillar) => (
                <article
                  key={pillar.number}
                  className="group flex flex-col bg-background p-8 lg:p-10"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tracking-widest text-muted-foreground">
                      {pillar.number}
                    </span>
                    <span className="size-1.5 rounded-full bg-border transition-colors group-hover:bg-accent" />
                  </div>

                  <h3 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium uppercase tracking-wider text-accent">
                    {pillar.tagline}
                  </p>

                  <p className="mt-6 text-sm text-muted-foreground">
                    {pillar.description}
                  </p>

                  <ul className="mt-8 space-y-3 border-t border-border/60 pt-6 text-sm">
                    {pillar.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-start gap-3 text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                        />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/services"
                    className="mt-10 inline-flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="underline-hover">Explore the work</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FREE TOOLS CALLOUT */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="grid gap-px bg-border/60 lg:grid-cols-5">
              {/* Website audit — 3/5 */}
              <Link
                href="/resources/free-website-audit"
                className="group flex flex-col gap-6 bg-card p-8 transition-colors hover:bg-card/70 lg:col-span-3 lg:p-10"
              >
                <span className="inline-block self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                  Free · No commitment
                </span>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                    Free 15-minute website audit
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Send your URL. We record a Loom walking through your
                    site — performance, SEO gaps, conversion red flags, three
                    specific fixes. Returned in 1–3 days.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-accent">
                  <span className="underline-hover">Request your audit</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>

              {/* Cost estimator — 2/5 */}
              <Link
                href="/tools/cost-estimator"
                className="group flex flex-col gap-6 bg-card p-8 transition-colors hover:bg-card/70 lg:col-span-2 lg:p-10"
              >
                <span className="inline-block self-start rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Free tool · No signup
                </span>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    AI workflow cost estimator
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Pick a workflow, set the volume, see the real monthly cost —
                    LLM API, third-party APIs, all in one place.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-accent">
                  <span className="underline-hover">Try the estimator</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* MANIFESTO STRIP */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Why Stratus</p>
              </div>
              <div className="lg:col-span-8">
                <p className="text-2xl leading-snug tracking-tight sm:text-3xl lg:text-4xl">
                  The agencies charging $10,000 for a four-page website aren&apos;t
                  worth $10,000.{" "}
                  <span className="text-muted-foreground">
                    We build the same thing — often better — for a fraction of
                    the price, then layer on the automations and online presence
                    that turn a website into a working business asset.
                  </span>{" "}
                  <span className="text-accent">
                    No retainers, no fluff, no gatekeeping.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST STRIP */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <TrustStrip variant="stack" />
          </div>
        </section>

        {/* PROCESS */}
        <section id="how-it-works" className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="mb-20 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How we work</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl lg:text-6xl">
                  Four steps. <span className="text-accent">No fog.</span>
                </h2>
              </div>
            </div>

            <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col gap-6 bg-background p-8 lg:p-10"
                >
                  <span className="font-mono text-xs tracking-widest text-accent">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="section-label">Pricing</p>
                <h2 className="display-heading mt-6 text-4xl sm:text-5xl lg:text-6xl">
                  Two ways to start.
                  <br />
                  <span className="text-accent">One way to talk.</span>
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="text-base text-muted-foreground">
                  A flat-priced Starter for businesses who want a great site
                  without the agency drama, or a custom engagement for everything
                  else. Don&apos;t fit either? That&apos;s a conversation.
                </p>
                <Link
                  href="/pricing"
                  className="mt-8 inline-flex items-center gap-3 text-base text-foreground"
                >
                  <span className="underline-hover">See pricing</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-px bg-border/60 lg:grid-cols-3">
              <div className="bg-background p-8 lg:p-10">
                <p className="font-mono text-xs tracking-widest text-muted-foreground">
                  Starter
                </p>
                <p className="mt-6 text-5xl font-semibold tracking-tight">
                  <data value="1495">$1,495</data>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">flat, one-time</p>
                <p className="mt-6 text-sm text-muted-foreground">
                  Productized website for solo operators and local service
                  businesses. Ships in 5–7 days.
                </p>
              </div>
              <div className="bg-background p-8 lg:p-10">
                <p className="font-mono text-xs tracking-widest text-accent">
                  Custom
                </p>
                <p className="mt-6 text-5xl font-semibold tracking-tight">
                  From <data value="5000">$5,000</data>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">scoped engagement</p>
                <p className="mt-6 text-sm text-muted-foreground">
                  Multi-page sites, automation, AI tools, and online presence
                  systems. Quoted per project.
                </p>
              </div>
              <div className="bg-background p-8 lg:p-10">
                <p className="font-mono text-xs tracking-widest text-muted-foreground">
                  Somewhere between?
                </p>
                <p className="mt-6 text-3xl font-medium tracking-tight text-accent">
                  Let&apos;s just talk.
                </p>
                <p className="mt-6 text-sm text-muted-foreground">
                  If you don&apos;t fit either path, that&apos;s usually a sign of
                  an interesting problem. Tell us what you&apos;re trying to do.
                </p>
                <Link
                  href="/start"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-foreground"
                >
                  <span className="underline-hover">Start the conversation</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-40">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-9">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-5xl sm:text-7xl lg:text-[6rem]">
                  Tell us what you&apos;re
                  <br />
                  <span className="text-accent">trying to build.</span>
                </h2>
              </div>
              <div className="lg:col-span-3 lg:justify-self-end">
                <Link
                  href="/start"
                  className="group inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  Start a project
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
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
