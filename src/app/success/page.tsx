import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function SuccessPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="section-label justify-center">Payment confirmed</p>
          <h1 className="display-heading mt-8 text-4xl sm:text-6xl">
            Welcome aboard.{" "}
            <span className="text-accent">Let&apos;s build it.</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground">
            Thank you for choosing Stratus Creative. We&apos;ll be in touch
            within one business day to kick off your project.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Questions? Email us at{" "}
            <a
              href="mailto:business@stratus-creative.com"
              className="underline-hover text-foreground"
            >
              business@stratus-creative.com
            </a>
          </p>
          <Link
            href="/"
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background"
          >
            Back to home
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
