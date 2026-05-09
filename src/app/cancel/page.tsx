import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CancelPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="section-label justify-center">Payment cancelled</p>
          <h1 className="display-heading mt-8 text-4xl sm:text-6xl">
            No worries.{" "}
            <span className="text-accent">Take your time.</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            Your payment wasn&apos;t processed. Head back to pricing whenever
            you&apos;re ready, or reach out if there&apos;s something you
            wanted to ask first.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Questions? Reach us at{" "}
            <a
              href="mailto:business@stratus-creative.com"
              className="underline-hover text-foreground"
            >
              business@stratus-creative.com
            </a>
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Back to pricing
            </Link>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground"
            >
              Talk to us instead
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
