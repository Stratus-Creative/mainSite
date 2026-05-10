import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn, ScrollReveal, Stagger, AccentSweep, ScrollType } from "@/components/motion";

export const metadata: Metadata = {
  title: "Testimonials — Stratus Creative",
  description:
    "We don't fake testimonials. Quietly building a real reputation.",
  alternates: { canonical: "https://stratus-creative.com/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <Stagger step={120}>
              <FadeIn variant="slide-left">
                <p className="section-label">Testimonials</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-5xl text-4xl sm:text-6xl lg:text-7xl">
                  Quietly building{" "}
                  <span className="text-accent">
                    <AccentSweep>reputation.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  We&apos;re early. We don&apos;t have a wall of testimonials and
                  we&apos;re not going to fake one.
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Honest body */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
            <ScrollReveal className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                What we have is the work — see{" "}
                <Link
                  href="/work"
                  className="text-foreground underline-hover"
                >
                  what I&apos;ve built
                </Link>{" "}
                — and a handful of in-flight client engagements whose
                feedback we&apos;ll publish here as projects ship and
                clients give us permission.
              </p>
              <p>
                If you&apos;re considering working with us and want a
                reference, ask. We&apos;ll connect you with someone real.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA card */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <ScrollReveal className="rounded-2xl border border-border bg-card p-12 lg:p-16">
              <p className="section-label">See how we work</p>
              <h2>
                <ScrollType text="Both work without any commitment." className="display-heading mt-6 text-3xl sm:text-4xl" />
              </h2>
              <p className="mt-6 max-w-2xl text-base text-muted-foreground">
                Want to see how we work before you talk to us? Try the{" "}
                <Link
                  href="/resources/free-website-audit"
                  className="text-foreground underline-hover"
                >
                  free 15-minute audit
                </Link>{" "}
                or{" "}
                <Link
                  href="/tools/cost-estimator"
                  className="text-foreground underline-hover"
                >
                  run the cost estimator
                </Link>
                .
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/resources/free-website-audit"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Free website audit
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/tools/cost-estimator"
                  className="inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-base text-foreground transition-colors hover:border-foreground"
                >
                  Cost estimator
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
