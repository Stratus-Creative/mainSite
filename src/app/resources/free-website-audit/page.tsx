import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuditForm } from "@/components/audit-form";

export const metadata: Metadata = {
  title: "Free 15-min website audit — Stratus Creative",
  description:
    "Send your URL. We'll record a free 15-minute Loom video reviewing your site — performance, SEO basics, conversion red flags, and three specific recommendations. No commitment.",
  alternates: {
    canonical: "https://stratus-creative.com/resources/free-website-audit",
  },
  openGraph: {
    title: "Free 15-min website audit — Stratus Creative",
    description:
      "Send your URL. We'll record a free 15-minute Loom video reviewing your site. No commitment.",
    type: "website",
  },
};

const WHAT_YOU_GET = [
  {
    label: "Performance review",
    detail: "Lighthouse + PageSpeed scores, your weakest metric, and the single highest-leverage fix.",
  },
  {
    label: "Local SEO check",
    detail: "Google Business Profile completeness, schema markup, citation consistency.",
  },
  {
    label: "Conversion red flags",
    detail: "What we'd change in your hero, your CTA, your forms — based on what's actually on your site.",
  },
  {
    label: "Three specific recommendations",
    detail: "Concrete, prioritized. Pick one and you'll see a difference. We'll tell you which to start with.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Submit your URL",
    detail: "Plus a few quick questions about your business and biggest concern.",
  },
  {
    step: "02",
    title: "We record a Loom",
    detail: "12–15 minutes, walking through your site live with audio commentary.",
  },
  {
    step: "03",
    title: "You get the link in 1–3 days",
    detail: "Watch on your own time. Forward to your team. Use it however you want.",
  },
  {
    step: "04",
    title: "No follow-up unless you want one",
    detail: "We won't put you on a drip list. If you want to hire us after, you'll know where to find us.",
  },
];

export default function FreeWebsiteAuditPage() {
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
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="section-label">Free · 15 minutes · No commitment</p>
            <h1 className="display-heading mt-8 max-w-5xl text-4xl sm:text-6xl lg:text-7xl">
              Free 15-minute{" "}
              <span className="text-accent">website audit.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Send us your URL. We&apos;ll record a Loom video reviewing your
              site — performance, SEO basics, conversion red flags, three
              specific recommendations. Free, no commitment, no sales pitch.
            </p>
          </div>
        </section>

        {/* What you get */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">What you get</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              A real review.{" "}
              <span className="text-accent">Not a sales call.</span>
            </h2>
            <ul className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2">
              {WHAT_YOU_GET.map((item) => (
                <li
                  key={item.label}
                  className="bg-background p-6 lg:p-8"
                >
                  <p className="text-lg font-semibold tracking-tight">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">How it works</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              Four steps.
            </h2>
            <div className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col gap-4 bg-background p-8"
                >
                  <span className="font-mono text-xs tracking-widest text-accent">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
            <p className="section-label">Request your audit</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              Submit your site.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              We respond within 1–3 business days with your Loom link.
            </p>
            <div className="mt-10">
              <AuditForm />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Already know you want to work with us?</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  Skip the audit and start.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:justify-self-end">
                <Link
                  href="/start"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  Start a project
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
