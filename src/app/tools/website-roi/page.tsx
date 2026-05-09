import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WebsiteRoiForm } from "@/components/website-roi-form";

export const metadata: Metadata = {
  title: "Website ROI Calculator — Stratus Creative",
  description:
    "See what a real website would actually be worth to your business. Plug in your numbers, see expected revenue lift, payback period, and 3-year value. Free, no signup.",
  alternates: {
    canonical: "https://stratus-creative.com/tools/website-roi",
  },
  openGraph: {
    title: "Website ROI Calculator — Stratus Creative",
    description:
      "See what a real website would actually be worth to your business. Plug in your numbers, see expected revenue lift, payback period, and 3-year value.",
    url: "https://stratus-creative.com/tools/website-roi",
    siteName: "Stratus Creative",
    type: "website",
  },
  keywords: [
    "website ROI calculator",
    "web design ROI",
    "conversion rate calculator",
    "website redesign value",
    "small business website ROI",
    "site payback period",
  ],
};

export default function WebsiteRoiPage() {
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
            <p className="section-label">Website ROI</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
              How much is your{" "}
              <span className="text-accent">site worth?</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              A website isn&apos;t a brochure — it&apos;s a revenue line. Plug
              in your numbers and see what a real redesign would actually be
              worth: monthly lift, payback period, and three-year value.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Math runs in your browser. We never see your numbers unless you
              send them to us.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <WebsiteRoiForm />
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How it works</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  The math, in plain English.
                </h2>
              </div>
              <div className="space-y-8 text-sm text-muted-foreground lg:col-span-8">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Monthly revenue lift
                  </h3>
                  <p className="mt-2">
                    <span className="font-mono text-accent">
                      visitors × (target − current conversion %) × average sale
                    </span>
                    . If you 2× the conversion rate on the same traffic, you
                    2× monthly revenue. That&apos;s the entire argument for a
                    redesign.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Payback period
                  </h3>
                  <p className="mt-2">
                    Starter cost ($1,495) ÷ monthly lift, in months.
                    &quot;Immediate&quot; if the first month already covers it.
                    &quot;12+ months&quot; if the lift is too small to justify
                    the build — at which point the answer is to fix copy and
                    offers, not the site.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    3-year value
                  </h3>
                  <p className="mt-2">
                    Annual lift × 3 minus the build cost. Typical lifespan of
                    a site refresh before it starts to look dated. Anything
                    above zero means the redesign pays for itself.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    What this isn&apos;t
                  </h3>
                  <p className="mt-2">
                    A guarantee. Conversion lift depends on copy, design,
                    trust signals, and offer — not just the build. We use
                    these numbers to argue whether a redesign is worth doing.
                    The actual lift is what we work toward together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="section-label">Next</p>
                <h2 className="display-heading mt-8 text-4xl sm:text-5xl lg:text-6xl">
                  Bring your numbers.
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  If the math says a redesign pays for itself, the next step
                  is a real conversation. Tell us about the business and the
                  goal — we&apos;ll send a firm proposal within two business
                  days.
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
                  href="/pricing"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base font-medium text-foreground transition-all hover:border-foreground"
                >
                  See full pricing
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
