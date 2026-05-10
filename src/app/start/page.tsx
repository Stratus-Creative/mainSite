import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StartForm } from "@/components/start-form";
import { FadeIn, Stagger, AccentSweep } from "@/components/motion";

export const metadata: Metadata = {
  title: "Start a project — Stratus Creative",
  description:
    "Tell us what you're trying to build. We'll get back to you within one business day with next steps.",
};

const PROMISES = [
  {
    label: "Reply within 4 hours during business hours",
    description: "No queues, no auto-responders. James reads every message himself.",
  },
  {
    label: "No pressure, no follow-up spam",
    description:
      "If we're not the right fit we'll tell you, and we won't put you on a drip list.",
  },
  {
    label: "Free first scope conversation",
    description:
      "Whether it's the Starter or a custom build, the first conversation is always free.",
  },
];

export default function StartPage() {
  return (
    <>
      <SiteHeader activePath="/start" />

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
                <p className="section-label">Start a project</p>
              </FadeIn>
              <FadeIn>
                <h1 className="display-heading mt-8 max-w-5xl text-5xl sm:text-7xl lg:text-[6.5rem]">
                  Tell us what
                  <br />
                  you&apos;re{" "}
                  <span className="text-accent">
                    <AccentSweep>trying to build.</AccentSweep>
                  </span>
                </h1>
              </FadeIn>
              <FadeIn>
                <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
                  The more specific you can be, the more useful our reply will be.
                  Don&apos;t worry about getting it perfect — we&apos;ll fill in
                  the gaps on the call.
                </p>
              </FadeIn>
            </Stagger>
          </div>
        </section>

        {/* Form + side rail */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <div className="grid gap-16 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <Suspense
                  fallback={
                    <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                      Loading form…
                    </div>
                  }
                >
                  <StartForm />
                </Suspense>
              </div>

              <aside className="lg:col-span-4">
                <div className="sticky top-32 space-y-12">
                  <div>
                    <p className="section-label">What to expect</p>
                    <ul className="mt-8 space-y-6">
                      {PROMISES.map((p) => (
                        <li key={p.label}>
                          <p className="text-base font-medium tracking-tight">
                            {p.label}
                          </p>
                          <p className="mt-1.5 text-sm text-muted-foreground">
                            {p.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6">
                    <p className="section-label">Prefer email?</p>
                    <a
                      href="mailto:business@stratus-creative.com"
                      className="mt-4 block font-mono text-sm tracking-wider text-foreground"
                    >
                      business@stratus-creative.com
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
