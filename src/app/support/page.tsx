import { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportFaq } from "@/components/support-faq";
import { SupportForm } from "@/components/support-form";
import { FaqJsonLd } from "@/components/structured-data";
import { SUPPORT_FAQ } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "Support — Stratus Creative",
  description:
    "Get help with your Stratus Creative website. Browse common questions or submit a support request.",
};

export default function SupportPage() {
  return (
    <>
      <FaqJsonLd items={SUPPORT_FAQ} />
      <SiteHeader activePath="/support" />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <p className="section-label">Support</p>
            <h1 className="display-heading mt-8 max-w-4xl text-5xl sm:text-7xl lg:text-[6rem]">
              How can{" "}
              <span className="text-accent">we help?</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground">
              Browse common questions below, or submit a request — we reply
              within{" "}
              <span className="font-medium text-foreground">
                24–48 business hours
              </span>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Frequently asked</p>
                <h2 className="display-heading mt-6 text-4xl sm:text-5xl">
                  The questions we hear most.
                </h2>
              </div>
              <div className="lg:col-span-8">
                <SupportFaq />
              </div>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section id="contact" className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="section-label">Submit a request</p>
                <h2 className="display-heading mt-6 text-4xl sm:text-5xl">
                  Tell us what&apos;s going on.
                </h2>
                <p className="mt-6 text-sm text-muted-foreground">
                  For existing clients only.{" "}
                  <Link
                    href="/start"
                    className="underline-hover text-foreground"
                  >
                    Not a client yet?
                  </Link>
                </p>
              </div>
              <div className="lg:col-span-8">
                <SupportForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
