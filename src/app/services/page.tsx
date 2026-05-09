import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Services — Stratus Creative",
  description:
    "Websites, workflows, and online presence — three pillars built to make your business work harder for you.",
};

interface ServicePricingLink {
  label: string;
  href: string;
}

interface Service {
  number: string;
  title: string;
  tagline: string;
  body: string;
  deliverables: string[];
  starterFit: string | null;
  customFit: string;
  pricingLinks: ServicePricingLink[];
}

const SERVICES: Service[] = [
  {
    number: "01",
    title: "Websites",
    tagline: "Built to convert. Built to last.",
    body: "Most small business websites are templates with the wrong colors. We build what an actual brand deserves — fast, mobile-first, search-friendly sites that look like the kind of business people want to hire. No bloat, no maintenance trap.",
    deliverables: [
      "Marketing & brand sites",
      "Local-business websites",
      "Conversion-focused landing pages",
      "Custom design (no templates)",
      "Mobile-first, accessible, fast",
      "Lightweight CMS where it earns its keep",
      "Built on modern Next.js + Vercel",
    ],
    starterFit:
      "Single-page mobile-first website at $1,495 flat. Ships in 5–7 days.",
    customFit:
      "Multi-page marketing sites typically $4K–$8K. Brand system + multi-page sites $7K–$14K. 2–6 weeks.",
    pricingLinks: [
      { label: "See website pricing", href: "/pricing" },
      { label: "Buy a Starter", href: "/pricing#starter" },
    ],
  },
  {
    number: "02",
    title: "Workflows",
    tagline: "Stop doing things twice.",
    body: "Every business has the same hidden tax: doing the same operational work over and over because the systems behind the scenes don't talk to each other. We design, build, and wire up the workflows that take that tax off your plate.",
    deliverables: [
      "Quote-to-invoice automation",
      "Lead capture → CRM → follow-up sequences",
      "Booking, intake, and client onboarding flows",
      "AI-powered tools and chatbots",
      "Custom AI agents for support and sales",
      "Integration between the tools you already use",
      "Internal dashboards and admin panels",
    ],
    starterFit:
      "AI Chat Widget at $800 flat. A custom-trained AI assistant — live on your site in 3–5 days. Streaming chat, page-context awareness, proactive nudge, and full conversation logging. Ongoing care via AI Care Light ($199/mo) + pass-through API.",
    customFit:
      "Process automation $3K–$8K. AI tools, agents, or chatbots $5K–$15K build, plus AI Care from $199/mo and pass-through API costs.",
    pricingLinks: [
      { label: "See workflow pricing", href: "/pricing#ai-care" },
      { label: "Estimate your AI cost", href: "/tools/cost-estimator" },
    ],
  },
  {
    number: "03",
    title: "Online presence",
    tagline: "Show up where customers look.",
    body: "Your website is where people land. Your online presence is what brings them there. We get your Google Business Profile dialed, your reviews flowing, and your reputation working as the silent salesperson it should be.",
    deliverables: [
      "Google Business Profile setup & optimization",
      "Live Google reviews integrated on your website",
      "Reputation & reviews management",
      "Local SEO and search visibility",
      "Profile content, photos, and posting",
      "Hours, services, and contact info synced",
    ],
    starterFit:
      "Google Business Profile + live reviews on the site are included free with every Starter build.",
    customFit:
      "Standalone GBP setup $250 one-time. Ongoing reputation & reviews management $149/mo. Bundled into custom engagements at a discount.",
    pricingLinks: [
      { label: "See online presence pricing", href: "/pricing" },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader activePath="/services" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">Services</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
              Three pillars.{" "}
              <span className="text-accent">No filler.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Most agencies stretch themselves across twenty services and do
              none of them well. We do three. Together they cover what most
              businesses actually need to look bigger, work smarter, and grow.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex items-center gap-2 text-sm text-foreground"
            >
              <span className="underline-hover">See typical pricing</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* Pillars in long-form */}
        {SERVICES.map((service, idx) => (
          <section
            key={service.number}
            className={
              idx === SERVICES.length - 1
                ? ""
                : "border-b border-border/60"
            }
          >
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <div className="sticky top-32">
                    <span className="font-mono text-xs tracking-widest text-muted-foreground">
                      {service.number} / 03
                    </span>
                    <h2 className="display-heading mt-6 text-5xl sm:text-6xl lg:text-7xl">
                      {service.title}
                    </h2>
                    <p className="mt-4 text-sm font-medium uppercase tracking-wider text-accent">
                      {service.tagline}
                    </p>
                    <p className="mt-8 max-w-md text-base text-muted-foreground">
                      {service.body}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="border-t border-border/60 pt-8">
                    <p className="section-label">What&apos;s included</p>
                    <ul className="mt-6 divide-y divide-border/40">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-4 py-4 text-base"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    <p className="font-mono text-sm font-medium uppercase tracking-widest text-accent">
                      Pricing fit
                    </p>
                    <div className="mt-6 divide-y divide-border/60 border-y border-border/60">
                      {service.starterFit && (
                        <div className="grid gap-3 py-6 sm:grid-cols-12 sm:gap-8 lg:py-8">
                          <p className="section-label sm:col-span-3">
                            In Starter
                          </p>
                          <p className="text-base text-muted-foreground sm:col-span-9">
                            {service.starterFit}
                          </p>
                        </div>
                      )}
                      <div className="grid gap-3 py-6 sm:grid-cols-12 sm:gap-8 lg:py-8">
                        <p className="section-label sm:col-span-3">
                          In Custom
                        </p>
                        <p className="text-base text-muted-foreground sm:col-span-9">
                          {service.customFit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {service.pricingLinks.length > 0 && (
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {service.pricingLinks.map((link, i) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`inline-flex items-center gap-2 text-sm ${
                            i === 0 ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="underline-hover">{link.label}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* What we don't do — counterintuitive credibility section */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">What we don&apos;t do</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  Things we turn down.
                </h2>
                <p className="mt-6 text-sm text-muted-foreground">
                  Three pillars done seriously beats twenty done sideways.
                  These are the things we politely refer elsewhere — and
                  what we suggest instead.
                </p>
              </div>
              <div className="lg:col-span-8">
                <ul className="divide-y divide-border/60 border-y border-border/60">
                  {[
                    {
                      no: "Paid ads management (Google, Meta, etc.)",
                      why: "Ads is its own discipline. Specialists who run thousands of dollars per month in test spend will outperform us by a wide margin.",
                      instead: "We refer to specialist partners.",
                    },
                    {
                      no: "Social media management",
                      why: "Brand-voice posting at scale isn't something we do well, and faking it would hurt your business.",
                      instead: "Hire a social-media-first studio or in-house manager.",
                    },
                    {
                      no: "Content writing as an ongoing service",
                      why: "We write copy for the sites we build. Ongoing blog/SEO content is a different muscle that needs full-time attention.",
                      instead: "Content-led agencies or specialist writers.",
                    },
                    {
                      no: "Big-agency RFP responses",
                      why: "Multi-week RFP processes with 47 stakeholders are not how we work. We can scope a real project in a 30-minute call.",
                      instead: "Big-agency RFPs need big agencies.",
                    },
                    {
                      no: "Maintenance of sites we didn't build",
                      why: "Inheriting an unfamiliar codebase is risky for the client and us. We can rebuild faster than we can maintain inheriteds.",
                      instead: "Quote a fresh build at our Custom rate.",
                    },
                    {
                      no: "Promises we can't keep",
                      why: "We won't promise rankings, traffic numbers, or specific lead volume. Anyone who does is selling, not delivering.",
                      instead: "Honest milestones, real numbers in writing.",
                    },
                  ].map((item) => (
                    <li
                      key={item.no}
                      className="grid gap-2 py-6 lg:grid-cols-12 lg:gap-6 lg:py-8"
                    >
                      <p className="text-base font-medium tracking-tight lg:col-span-5">
                        {item.no}
                      </p>
                      <div className="text-sm text-muted-foreground lg:col-span-7">
                        <p>{item.why}</p>
                        <p className="mt-2 text-xs uppercase tracking-widest text-accent">
                          Instead → {item.instead}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-5xl sm:text-6xl lg:text-7xl">
                  Pick the pillar.
                  <br />
                  <span className="text-accent">
                    We&apos;ll figure out the rest.
                  </span>
                </h2>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                <Link
                  href="/start"
                  className="group inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Start a project
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  See pricing
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
