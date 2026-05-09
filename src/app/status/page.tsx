import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Status — Stratus Creative",
  description:
    "Studio status for Stratus Creative — website, forms, and email infrastructure.",
  alternates: { canonical: "https://stratus-creative.com/status" },
  robots: { index: true, follow: true },
};

const SERVICES = [
  {
    service: "Stratus Creative website",
    status: "Operational",
    note: "stratus-creative.com",
  },
  {
    service: "Email + forms",
    status: "Operational",
    note: "Resend + Supabase",
  },
];

export default function StatusPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            <p className="section-label">Status</p>
            <h1 className="display-heading mt-8 max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
              All systems <span className="text-accent">go.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground">
              Studio status for Stratus Creative. Per-client status pages
              will appear here once those engagements are live.
            </p>
          </div>
        </section>

        {/* Studio status */}
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="section-label">Studio status</p>
            <div className="mt-8 grid gap-px bg-border/60 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <article
                  key={s.service}
                  className="flex items-center justify-between bg-background p-5 lg:p-6"
                >
                  <div>
                    <p className="text-base font-medium">{s.service}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-accent"
                    />
                    {s.status}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
            <p className="section-label">Existing client?</p>
            <p className="mt-4 text-base text-muted-foreground">
              For incidents affecting your specific deployment, reach us at{" "}
              <a
                href="mailto:business@stratus-creative.com"
                className="underline-hover text-foreground"
              >
                business@stratus-creative.com
              </a>{" "}
              or via{" "}
              <Link
                href="/support"
                className="underline-hover text-foreground"
              >
                /support
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
