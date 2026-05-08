import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Testimonials — Stratus Creative",
  description:
    "Real testimonials from Stratus Creative clients. Building this list as we ship.",
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
            <p className="section-label">Testimonials</p>
            <h1 className="display-heading mt-8 max-w-5xl text-4xl sm:text-6xl lg:text-7xl">
              Real words from{" "}
              <span className="text-accent">real clients.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              We&apos;d rather have a small list of clients we&apos;re proud
              of than a wall of stock-photo testimonials. This page fills up
              as projects ship.
            </p>
          </div>
        </section>

        {/* Empty state */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="rounded-2xl border border-dashed border-border/60 bg-card p-12 text-center lg:p-16">
              <p className="section-label justify-center">No testimonials yet</p>
              <h2 className="display-heading mt-8 text-3xl sm:text-4xl">
                Be the first.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
                Stratus is a young studio. As projects ship and clients agree
                to share their experience, we&apos;ll publish them here — with
                names, photos, and specifics. No fake testimonials, no stock
                avatars.
              </p>
              <Link
                href="/start"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
              >
                Start a project
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* What we'll show */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">When this fills up</p>
            <h2 className="display-heading mt-6 text-3xl sm:text-4xl">
              Each testimonial includes:
            </h2>
            <ul className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2">
              {[
                {
                  title: "Real name + business",
                  detail: "No initials, no stock photos. If we can't name them, we don't quote them.",
                },
                {
                  title: "Specific outcomes",
                  detail: "Not 'they did great work.' Real numbers — pages shipped, time-to-launch, conversion lift, cost savings.",
                },
                {
                  title: "What we built + scope",
                  detail: "Link to the live work, what was in scope, what we didn't do.",
                },
                {
                  title: "Honest tradeoffs",
                  detail: "What didn't work, what we'd do differently. We'd rather you trust us than think we're perfect.",
                },
              ].map((item) => (
                <li key={item.title} className="bg-background p-6 lg:p-8">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
