import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SeoAuditForm } from "@/components/seo-audit-form";

export const metadata: Metadata = {
  title: "Local SEO Audit — Stratus Creative",
  description:
    "Drop in your business name, city, and website. Get an honest one-page audit of what's working, what's broken, and the highest-impact fixes. Free, no signup.",
  alternates: {
    canonical: "https://stratus-creative.com/tools/seo-audit",
  },
  openGraph: {
    title: "Local SEO Audit — Stratus Creative",
    description:
      "Drop in your business name, city, and website. Get an honest one-page audit of what's working, what's broken, and the highest-impact fixes. Free, no signup.",
    url: "https://stratus-creative.com/tools/seo-audit",
    siteName: "Stratus Creative",
    type: "website",
  },
  keywords: [
    "local SEO audit",
    "free SEO audit",
    "small business SEO",
    "local SEO checklist",
    "SEO heuristic audit",
    "Google Business Profile audit",
  ],
};

export default function SeoAuditPage() {
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
            <p className="section-label">Local SEO</p>
            <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">
              An honest{" "}
              <span className="text-accent">SEO audit.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              This is a heuristic audit — we read your page&apos;s HTML and
              check the fundamentals. It&apos;s not a live ranking check; we
              don&apos;t pretend to know what Google&apos;s actually doing on
              any given day.
            </p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Drop in your business name, city, and website URL. We&apos;ll
              read the homepage, run the checks, and hand back a one-page
              checklist of what&apos;s working, what&apos;s broken, and what to
              fix first.
            </p>
          </div>
        </section>

        {/* Audit form */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
            <SeoAuditForm />
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">How it works</p>
                <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
                  What we actually check.
                </h2>
              </div>
              <div className="space-y-8 text-sm text-muted-foreground lg:col-span-8">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    What we read
                  </h3>
                  <p className="mt-2">
                    Your homepage HTML, fetched server-side. We pull{" "}
                    <span className="font-mono text-accent">
                      title, meta, H1, structured data, click-to-call, alt
                      text, body copy
                    </span>{" "}
                    and check whether your business name and city show up
                    where Google expects them.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Five categories
                  </h3>
                  <p className="mt-2">
                    Page basics, local signals, content & structure,
                    technical, and local SEO opportunities. Each finding is
                    flagged pass / needs work / critical with a one-line fix
                    you can act on without us.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    AI-assessed, not AI-invented
                  </h3>
                  <p className="mt-2">
                    The audit reads real signals from your real HTML. The
                    model classifies severity and writes the fix language —
                    it doesn&apos;t make up findings about pages it
                    can&apos;t see.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    What this isn&apos;t
                  </h3>
                  <p className="mt-2">
                    A live ranking check. We don&apos;t query Google&apos;s
                    index, run Lighthouse, test mobile rendering, or audit
                    your inbound links. Treat this as a clarity tool — what
                    Google sees on page one of your site, and whether the
                    fundamentals are in order.
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
                  Want it fixed?
                </h2>
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                  Audits are easy. Implementation is the work. If you want the
                  fixes done — schema markup, on-page rewrites, Google
                  Business Profile cleanup, local landing pages — bring the
                  audit to a discovery call.
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
