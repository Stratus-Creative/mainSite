import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          <p className="section-label justify-center">404</p>
          <h1 className="display-heading mt-8 text-5xl sm:text-7xl">
            That page is{" "}
            <span className="text-accent">somewhere else.</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            The link you followed doesn&apos;t lead here — or it used to and
            we&apos;ve moved it. Try one of these instead.
          </p>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Link
              href="/"
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/40"
            >
              <p className="text-sm font-medium">Home</p>
              <p className="mt-1 text-xs text-muted-foreground">
                The main pitch in 30 seconds.
              </p>
            </Link>
            <Link
              href="/services"
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/40"
            >
              <p className="text-sm font-medium">Services</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Websites, workflows, online presence.
              </p>
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-foreground/40"
            >
              <p className="text-sm font-medium">Pricing</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Two paths + AI Care + typical ranges.
              </p>
            </Link>
            <Link
              href="/tools/cost-estimator"
              className="rounded-2xl border border-accent/40 bg-accent/5 p-5 text-left transition-colors hover:border-accent"
            >
              <p className="text-sm font-medium text-accent">Cost estimator</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Free tool. Estimate any AI workflow&apos;s monthly cost.
              </p>
            </Link>
          </div>

          <div className="mt-12">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 text-sm text-foreground"
            >
              <span className="underline-hover">
                Or just tell us what you were looking for
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
