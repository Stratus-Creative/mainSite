import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckoutButton } from "@/components/checkout-button";
import { ServiceJsonLd, FaqJsonLd, BreadcrumbJsonLd } from "@/components/structured-data";
import { MiniEstimator } from "@/components/mini-estimator";
import { FadeIn, ScrollReveal, Stagger, AccentSweep, CountUp, ScrollType } from "@/components/motion";

export const metadata: Metadata = {
  title: "Pricing — Stratus Creative",
  description:
    "Two ways to start: a flat-priced Starter site or a custom engagement. Transparent pricing, no retainers, no fluff.",
};

const STARTER_INCLUDES = [
  "Single-page or compact multi-page site",
  "Custom design — no templates",
  "Mobile-first, fast, accessible",
  "Click-to-call & contact buttons",
  "Google Maps & Business Profile integration",
  "Live Google reviews on your site",
  "Basic on-page SEO + meta tags",
  "SSL certificate included",
  "1 .com domain (first year, registered in your name)",
  "Delivered in 5–7 business days",
];

const CUSTOM_INCLUDES = [
  "Multi-page sites & brand systems",
  "Internal process automation",
  "Marketing automation & CRM integration",
  "Customer-facing flows (booking, intake, quoting)",
  "AI tools, chatbots, and agents",
  "Reputation & reviews management",
  "Advanced SEO and local visibility",
  "Custom integrations with your existing tools",
  "Scoped per project · 2–6 weeks typical",
];

const FAQ = [
  {
    q: "What if my project is smaller than the Starter?",
    a: "Tell us anyway. If we can do it for less, we will. The Starter price is a ceiling for productized work, not a floor.",
  },
  {
    q: "Do I have to provide content, copy, or photos?",
    a: "Mostly no. We research your business using public info — Google reviews, business profile, existing materials. You approve. For custom engagements we'll work with what you have or write fresh.",
  },
  {
    q: "Do I own the website?",
    a: "Yes, fully. Once you've paid, the site is yours. Host it yourself, or let us handle it.",
  },
  {
    q: "What about ongoing changes?",
    a: "Minor changes are free for 30 days after launch. After that, our Hosting + Updates plan covers up to 2 changes per month, or we can do one-off updates as needed.",
  },
  {
    q: "Why not have three tiers like everyone else?",
    a: "Because three tiers is a sales tactic, not a pricing strategy. One flat price for productized work. Custom for everything else. If you fall in between, we talk.",
  },
  {
    q: "Can I cancel hosting?",
    a: "Anytime. Your site stays live for the rest of the billing period. After that you can move it elsewhere or we take it down.",
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader activePath="/pricing" />

      <ServiceJsonLd />
      <FaqJsonLd items={FAQ} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" },
        ]}
      />

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
                <p className="section-label">Pricing</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-4xl text-5xl sm:text-7xl lg:text-[6rem]">
                  Two paths.{" "}
                  <span className="text-accent">
                    <AccentSweep>One conversation.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  Productized for the straightforward. Custom for everything else.
                  No tier ladders, no &quot;starting from $X*&quot; with hidden
                  footnotes — just transparent pricing.
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Two pricing cards */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 max-w-3xl">
              <p className="section-label">Two pricing paths</p>
              <h2 className="display-heading mt-6 text-4xl sm:text-5xl">
                How much does a website from Stratus{" "}
                <span className="text-accent">cost?</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal className="grid gap-px bg-border/60 lg:grid-cols-2">
              {/* STARTER */}
              <article id="starter" className="scroll-mt-24 flex flex-col bg-background p-8 lg:p-12">
                <div className="flex items-center justify-between">
                  <p className="section-label">Starter</p>
                  <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Productized · Self-serve
                  </span>
                </div>

                <h2 className="display-heading mt-12 text-3xl sm:text-4xl">
                  A real website,
                  <br />
                  without the markup.
                </h2>

                <FadeIn variant="number" className="mt-10 flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-tight sm:text-7xl">
                    <data value="1495">
                      <CountUp value={1495} prefix="$" fallback="$1,495" />
                    </data>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    flat · one-time
                  </span>
                </FadeIn>
                <p className="mt-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  vs $5,000–$10,000 at typical agencies
                </p>

                <p className="mt-6 text-sm text-muted-foreground">
                  For solo operators, contractors, and local service businesses
                  who want a real site without the $10,000 marketing-firm
                  markup. Ships in 5–7 business days.
                </p>

                <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                  7-day money-back guarantee
                </p>

                <ul className="mt-10 space-y-3 border-t border-border/60 pt-8 text-sm">
                  {STARTER_INCLUDES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 lg:mt-auto lg:pt-12">
                  <Link
                    href="/start?plan=starter"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Get started — <data value="1495">$1,495</data>
                    <span aria-hidden="true">→</span>
                  </Link>
                  <p className="mt-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Quick form · Reply in 4 hours
                  </p>
                </div>
              </article>

              {/* CUSTOM */}
              <article id="custom" className="scroll-mt-24 flex flex-col bg-background p-8 lg:p-12">
                <div className="flex items-center justify-between">
                  <p className="section-label">Custom</p>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                    Scoped engagement
                  </span>
                </div>

                <h2 className="display-heading mt-12 text-3xl sm:text-4xl">
                  Built around what
                  <br />
                  <span className="text-accent">
                    your business actually needs.
                  </span>
                </h2>

                <FadeIn variant="number" className="mt-10 flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-tight sm:text-7xl">
                    From{" "}
                    <data value="5000">
                      <CountUp value={5000} prefix="$" fallback="$5,000" />
                    </data>
                  </span>
                </FadeIn>
                <p className="mt-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  vs $15,000–$50,000+ at full-service agencies
                </p>

                <p className="mt-6 text-sm text-muted-foreground">
                  Multi-page sites, automation, AI tools, online presence
                  systems. Quoted per project. Most engagements land between
                  $5,000–$15,000.
                </p>

                <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                  Fixed-price · No retainer
                </p>

                <ul className="mt-10 space-y-3 border-t border-border/60 pt-8 text-sm">
                  {CUSTOM_INCLUDES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 lg:mt-auto lg:pt-12">
                  <Link
                    href="/start"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    Get a custom quote
                    <span aria-hidden="true">→</span>
                  </Link>
                  <p className="mt-3 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Quote within 2 business days
                  </p>
                </div>
              </article>
            </ScrollReveal>

            {/* Capture path: doesn't fit either */}
            <ScrollReveal className="mt-px bg-border/60">
              <div className="bg-background p-8 lg:p-12">
                <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-8">
                    <p className="section-label">In between?</p>
                    <p className="mt-4 text-2xl tracking-tight sm:text-3xl">
                      You don&apos;t fit either path?{" "}
                      <span className="text-accent">
                        That&apos;s usually the most interesting kind of project.
                      </span>{" "}
                      <span className="text-muted-foreground">
                        Tell us what you&apos;re trying to do — we&apos;ll
                        figure out a fair way to price it.
                      </span>
                    </p>
                  </div>
                  <div className="lg:col-span-4 lg:justify-self-end">
                    <Link
                      href="/start"
                      className="group inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      Start the conversation
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
            </ScrollReveal>
          </div>
        </section>

        {/* Typical engagement ranges */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Typical ranges</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl">
                  What custom work{" "}
                  <span className="text-accent">usually lands at.</span>
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  Custom is custom — every quote is scoped to the project. But
                  here&apos;s where similar work has historically landed, so
                  you can budget honestly before we talk.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="grid gap-px bg-border/60 lg:grid-cols-2">
              {[
                {
                  pillar: "Websites",
                  scope: "Multi-page marketing or brand site",
                  range: "$3K – $7K",
                  detail: "Custom design, 4–8 pages, copywriting, basic SEO. 3–5 weeks.",
                },
                {
                  pillar: "Websites",
                  scope: "Brand system + multi-page site",
                  range: "$6K – $12K",
                  detail: "Logo refinement, full brand system, content-heavy site. 5–8 weeks.",
                },
                {
                  pillar: "Workflows",
                  scope: "Process automation project",
                  range: "$3K – $8K",
                  detail: "Quote-to-invoice, lead capture, intake forms, integrations. 2–4 weeks.",
                  ongoing: "+ $0 – $200/mo if AI is in the loop (pass-through API)",
                },
                {
                  pillar: "Workflows",
                  scope: "AI tools, agents, or chatbots",
                  range: "$5K – $15K",
                  detail: "Custom AI agent for support, sales, or internal ops. 3–6 weeks.",
                  ongoing: "+ AI Care from $199/mo + $50 – $500/mo API (pass-through)",
                },
                {
                  pillar: "Online presence",
                  scope: "Google Business Profile setup",
                  range: (
                    <>
                      <data value="250">$250</data> one-time
                    </>
                  ),
                  detail: "Profile build, optimization, photos, services, posts.",
                },
                {
                  pillar: "Online presence",
                  scope: "Reputation & reviews management",
                  range: (
                    <>
                      <data value="149">$149</data>/mo
                    </>
                  ),
                  detail: "Ongoing review requests, response, and on-site display.",
                },
              ].map((item) => (
                <div
                  key={`${item.pillar}-${item.scope}`}
                  className="bg-background p-8 lg:p-10"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
                      {item.pillar}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Typical
                    </span>
                  </div>
                  <p className="mt-6 text-xl font-medium tracking-tight">
                    {item.scope}
                  </p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight">
                    {item.range}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                  {"ongoing" in item && item.ongoing && (
                    <p className="mt-3 border-t border-border/60 pt-3 text-xs text-accent">
                      {item.ongoing}
                    </p>
                  )}
                </div>
              ))}
            </ScrollReveal>

            <ScrollReveal className="mt-12 flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-5">
                <span
                  aria-hidden="true"
                  className="hidden h-px w-12 bg-border sm:block"
                />
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  These are historical ranges, not contracts. Your quote
                  depends on scope.
                </p>
                <span
                  aria-hidden="true"
                  className="hidden h-px w-12 bg-border sm:block"
                />
              </div>
              <p className="text-base font-medium text-accent sm:text-lg">
                Ask for a real one — it&apos;s free.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Hosting add-ons */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Hosting & care</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl">
                  Optional. Useful.{" "}
                  <span className="text-accent">Cancel anytime.</span>
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  You can host the site yourself or let us handle it. Both
                  options run on Vercel, both include SSL, both are
                  month-to-month.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="grid gap-px bg-border/60 sm:grid-cols-2">
              <div className="bg-background p-8 lg:p-10">
                <p className="section-label">Basic Hosting</p>
                <p className="mt-8 text-5xl font-semibold tracking-tight">
                  $49
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <ul className="mt-8 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    Managed hosting on Vercel
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    SSL certificate renewal
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    Uptime monitoring
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    Security updates
                  </li>
                </ul>
                <CheckoutButton
                  plan="hosting_basic"
                  className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-60"
                >
                  Subscribe — $49/mo
                </CheckoutButton>
              </div>

              <div className="bg-background p-8 lg:p-10">
                <div className="flex items-center justify-between">
                  <p className="section-label">Hosting + Updates</p>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                    Best value
                  </span>
                </div>
                <p className="mt-8 text-5xl font-semibold tracking-tight">
                  $99
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <ul className="mt-8 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    Everything in Basic Hosting
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    Up to 2 content updates per month
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    New photos, services, or copy changes
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    Priority support
                  </li>
                </ul>
                <CheckoutButton
                  plan="hosting_plus"
                  className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
                >
                  Subscribe — $99/mo
                </CheckoutButton>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* AI Chat Widget — productized add-on */}
        <section id="ai-widget" className="scroll-mt-24 border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-px bg-border/60 lg:grid-cols-12">
              <article className="flex flex-col bg-background p-8 lg:col-span-12 lg:p-12">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                  <div>
                    <div className="flex items-center gap-4">
                      <p className="section-label">AI Chat Widget</p>
                      <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Productized · Add-on
                      </span>
                    </div>

                    <h2 className="display-heading mt-10 text-3xl sm:text-4xl">
                      The assistant you see
                      <br />
                      <span className="text-accent">on this site. Yours.</span>
                    </h2>

                    <FadeIn variant="number" className="mt-8 flex items-baseline gap-2">
                      <span className="text-6xl font-semibold tracking-tight sm:text-7xl">
                        <data value="800">
                          <CountUp value={800} prefix="$" fallback="$800" />
                        </data>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        flat · one-time
                      </span>
                    </FadeIn>

                    <p className="mt-6 text-sm text-muted-foreground">
                      A custom AI assistant, trained on your business and embedded on your site. The widget you&apos;re looking at in the corner of this page is exactly what you get — minus the Stratus branding. Ships in 3–5 business days.
                    </p>

                    <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                      No full workflow build required
                    </p>
                  </div>

                  <div className="flex flex-col justify-between gap-8">
                    <ul className="space-y-3 border-t border-border/60 pt-8 text-sm lg:border-t-0 lg:pt-0">
                      {[
                        "Custom AI assistant trained on your business",
                        "Streaming chat with page-context awareness",
                        "Proactive nudge on pricing and services pages",
                        "Full conversation logging — you see every chat",
                        "Session management + monthly cap protection",
                        "Plug into AI Care Light ($199/mo) for ongoing tuning",
                        "Pass-through API costs (~$5–$30/mo for most)",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-3">
                      <Link
                        href="/start?plan=ai-widget"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        Get the widget — <data value="800">$800</data>
                        <span aria-hidden="true">→</span>
                      </Link>
                      <p className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        Quick form · Reply in 4 hours
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </section>

        {/* AI Workflow Care — three tiers */}
        <section id="ai-care" className="scroll-mt-24 border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">AI Workflow Care</p>
              </div>
              <div className="lg:col-span-8">
                <h2 className="display-heading text-4xl sm:text-5xl">
                  How much does AI Care{" "}
                  <span className="text-accent">cost?</span>
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  AI workflows aren&apos;t set-and-forget. Models drift,
                  prompts need tuning, edge cases surface, costs need watching.
                  Care covers our time. API costs are always separate and
                  pass-through, so you only pay for what you use.
                </p>
                <Link
                  href="/tools/cost-estimator"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-foreground"
                >
                  <span className="underline-hover">
                    Estimate your AI workflow&apos;s monthly cost
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid gap-px bg-border/60 lg:grid-cols-3">
              <Stagger step={70}>
              {[
                {
                  name: "AI Care · Light",
                  price: "$199",
                  priceValue: 199,
                  hours: "Up to 3 hrs/mo",
                  description:
                    "Single-purpose AI workflow with light volume. Monitoring + small fixes + model upgrades.",
                  fits: [
                    "FAQ chatbot",
                    "Email triage / classification",
                    "Lead scoring",
                    "Document tagging",
                  ],
                  highlight: false,
                },
                {
                  name: "AI Care · Standard",
                  price: "$399",
                  priceValue: 399,
                  hours: "Up to 6 hrs/mo",
                  description:
                    "Multi-step workflows with memory, integrations, or moderate volume. Most clients land here.",
                  fits: [
                    "Customer support bot with memory",
                    "Quote / estimate generators",
                    "Lead qualification with research",
                    "Document Q&A with RAG",
                  ],
                  highlight: true,
                },
                {
                  name: "AI Care · Pro",
                  price: "$899",
                  priceValue: 899,
                  hours: "Up to 12 hrs/mo",
                  description:
                    "High-volume or complex multi-agent systems. White-glove monitoring + priority response.",
                  fits: [
                    "Voice AI agents (telephony + AI)",
                    "Multi-agent autonomous systems",
                    "High-volume real-time pipelines",
                    "Enterprise integrations",
                  ],
                  highlight: false,
                },
              ].map((tier) => (
                <ScrollReveal
                  as="article"
                  key={tier.name}
                  className="flex flex-col bg-background p-8 lg:p-10"
                >
                  <div className="flex items-center justify-between">
                    <p className="section-label">{tier.name.split("·")[1].trim()}</p>
                    {tier.highlight && (
                      <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                        Most common
                      </span>
                    )}
                  </div>

                  <FadeIn variant="number" as="p" className="mt-6 text-5xl font-semibold tracking-tight">
                    <data value={tier.priceValue}>
                      <CountUp
                        value={tier.priceValue}
                        prefix="$"
                        fallback={tier.price}
                      />
                    </data>
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      /month
                    </span>
                  </FadeIn>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tier.hours}
                  </p>

                  <p className="mt-6 text-sm text-muted-foreground">
                    {tier.description}
                  </p>

                  <ul className="mt-8 space-y-2.5 border-t border-border/60 pt-6 text-sm text-muted-foreground">
                    {tier.fits.map((fit) => (
                      <li key={fit} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                        />
                        {fit}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 lg:mt-auto lg:pt-10">
                    <Link
                      href="/start"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      Discuss {tier.name.split("·")[1].trim()}
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* How AI workflows are priced */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How AI workflows are priced</p>
                <h2 className="display-heading mt-6 text-4xl sm:text-5xl">
                  How does Stratus price{" "}
                  <span className="text-accent">AI workflows?</span>
                </h2>
                <p className="mt-6 text-sm text-muted-foreground">
                  Most agencies hide the ongoing cost of AI and surprise-bill
                  clients later. We don&apos;t. Every AI quote is broken into
                  these three components, in writing, before you commit.
                </p>
              </div>
              <div className="space-y-8 lg:col-span-8">
                <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">
                    01 — Build (one-time)
                  </p>
                  <p className="mt-3 text-xl font-semibold tracking-tight">
                    The engineering work to design, build, test, and deploy.
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Quoted firm in your proposal. Includes design,
                    implementation, integration testing, and a launch playbook.
                    For most AI workflows: $5K – $15K.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">
                    02 — AI Care (recurring, our time)
                  </p>
                  <p className="mt-3 text-xl font-semibold tracking-tight">
                    Monitoring, prompt tuning, model upgrades, and small fixes.
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Light <data value="199">$199</data>/mo · Standard{" "}
                    <data value="399">$399</data>/mo · Pro{" "}
                    <data value="899">$899</data>/mo. Tier
                    matched to your workflow&apos;s complexity. Includes the
                    observability stack — Sentry, LLM tracing, uptime
                    monitoring — so you don&apos;t pay for tools separately.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">
                    03 — API costs (recurring, pass-through)
                  </p>
                  <p className="mt-3 text-xl font-semibold tracking-tight">
                    LLM tokens, third-party APIs, vector storage.
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Always pass-through. You can use your own API keys (we
                    just consume them) or we manage the keys and bill you cost
                    + 15% admin. Light workflows: $0–$50/mo. Moderate (most):
                    $50–$500/mo. Heavy (voice, real-time): $500+/mo.
                  </p>
                  <Link
                    href="/tools/cost-estimator"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="underline-hover">
                      Estimate your specific workflow
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Mini estimator */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Try the estimator</p>
                <h2 className="display-heading mt-6 text-4xl sm:text-5xl">
                  See what your workflow{" "}
                  <span className="text-accent">costs.</span>
                </h2>
                <p className="mt-6 text-sm text-muted-foreground">
                  Pick your workflow type, volume, and model. Get a live cost
                  range before you talk to anyone. Need a full breakdown with
                  third-party APIs and latency? Use the detailed estimator.
                </p>
              </div>
              <div className="lg:col-span-8">
                <MiniEstimator />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <ScrollReveal className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Common questions</p>
                <h2>
                  <ScrollType text="Anything else?" className="display-heading mt-6 text-4xl sm:text-5xl" />
                </h2>
              </div>
              <div className="lg:col-span-8">
                <ul className="divide-y divide-border/60 border-y border-border/60">
                  {FAQ.map((item) => (
                    <li key={item.q} className="py-6 lg:py-8">
                      <p className="text-lg font-medium tracking-tight">
                        {item.q}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.a}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
