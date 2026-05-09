import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortalLoginForm } from "@/components/portal-login-form";

export const metadata: Metadata = {
  title: "Sign in to your project portal — Stratus Creative",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function PortalLoginPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="editorial-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl px-6 py-20 lg:px-10 lg:py-28">
            <p className="section-label">Client portal</p>
            <h1 className="display-heading mt-8 text-4xl sm:text-5xl lg:text-6xl">
              Sign in to your project portal.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Enter the email you used to submit your project. We'll send you a
              sign-in link — no password to remember.
            </p>

            <div className="mt-12">
              <PortalLoginForm />
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Lost your link or trouble signing in? Email{" "}
              <a
                href="mailto:business@stratus-creative.com"
                className="text-foreground underline-hover"
              >
                business@stratus-creative.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
