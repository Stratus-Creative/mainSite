import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "What Your Website Should Actually Cost in 2026",
  description:
    "A free guide. The actual cost components of a small-business website in 2026 — design, development, hosting, ongoing maintenance, and AI workflows. No fluff. Saveable as PDF.",
  alternates: {
    canonical: "https://stratus-creative.com/resources/website-cost-guide",
  },
  openGraph: {
    title: "What Your Website Should Actually Cost in 2026",
    description:
      "A no-fluff cost breakdown for small-business websites in 2026. Free, saveable as PDF.",
    type: "article",
  },
};

export default function WebsiteCostGuidePage() {
  return (
    <>
      <div className="screen-only">
        <SiteHeader />
      </div>

      <main className="flex-1">
        {/* Print-only header */}
        <header className="print-only">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Stratus Creative · stratus-creative.com
          </p>
        </header>

        {/* Hero */}
        <section className="screen-only relative overflow-hidden border-b border-border/60">
          <div
            className="editorial-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <p className="section-label">Free guide · 2 pages · No email required</p>
            <h1 className="display-heading mt-8 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
              What your website should actually cost{" "}
              <span className="text-accent">in 2026.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              The honest math behind small-business websites — design, build,
              hosting, AI. No upsell, no email gate. Use the print button to
              save as PDF.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrintButton className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground print-only-hide">
                Save as PDF
                <span aria-hidden="true">↓</span>
              </PrintButton>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-foreground"
              >
                See our pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Guide body — also serves as the printable PDF */}
        <article className="mx-auto max-w-3xl px-6 py-16 lg:py-20 print:max-w-none print:py-4">
          <p className="section-label print:hidden">The guide</p>

          <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg print:text-base">
            Most small-business owners get one website quote in their life and
            assume the price is the price. It isn&apos;t. Here&apos;s what
            actually goes into a website in 2026, what each component
            reasonably costs, and where the markup hides.
          </p>

          <Section title="1. The four real cost components">
            <p>
              Every website is some combination of these four things. The
              quote you&apos;re looking at is the sum of them, plus whatever
              markup the agency adds for overhead and margin.
            </p>
            <table className="my-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="py-2 pr-4 font-semibold">Component</th>
                  <th className="py-2 pr-4 font-semibold">Reasonable range</th>
                  <th className="py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/40">
                  <td className="py-2 pr-4">Design (custom, not template)</td>
                  <td className="py-2 pr-4">$500–$2,500</td>
                  <td className="py-2">Single page → multi-page brand site</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2 pr-4">Development &amp; integrations</td>
                  <td className="py-2 pr-4">$500–$5,000</td>
                  <td className="py-2">Forms, CMS, integrations, AI</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2 pr-4">Content (copy + photos)</td>
                  <td className="py-2 pr-4">$0–$2,000</td>
                  <td className="py-2">$0 if sourced from reviews/existing</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Project management</td>
                  <td className="py-2 pr-4">$0–$2,000</td>
                  <td className="py-2">$0 for solo studios; $$ for big agencies</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="2. What ongoing actually costs">
            <p>
              Most agencies bury this. The truth is that a small-business
              website has real recurring costs — but they&apos;re smaller than
              you think.
            </p>
            <ul className="my-4 space-y-2 pl-5">
              <li className="list-disc">
                <strong>Hosting</strong>: $0–$25/mo (Vercel hobby is free,
                Pro is $20). Most businesses don&apos;t need more.
              </li>
              <li className="list-disc">
                <strong>SSL</strong>: free via Let&apos;s Encrypt. Anyone
                charging for SSL is overcharging.
              </li>
              <li className="list-disc">
                <strong>Domain</strong>: $12–$20/year for a .com.
              </li>
              <li className="list-disc">
                <strong>Maintenance</strong>: $30–$100/mo if you want managed
                hosting + light updates. Pure self-hosting is $0 but
                you&apos;re responsible for the headaches.
              </li>
              <li className="list-disc">
                <strong>CMS license</strong> (if applicable): $0 for headless
                CMS or static; $99–$300/year for premium WordPress themes.
              </li>
            </ul>
            <p className="mt-3">
              Total realistic ongoing for a small-business site:{" "}
              <strong className="text-accent">$30–$100/month.</strong> Not
              $500. Not $1,500.
            </p>
          </Section>

          <Section title="3. Where the markup hides">
            <p>
              When you see a $10,000 quote for a six-page WordPress site, the
              actual labor cost is closer to $1,500. The other $8,500 pays
              for:
            </p>
            <ul className="my-4 space-y-2 pl-5">
              <li className="list-disc">
                Account managers, project managers, and meeting overhead at
                bigger agencies (often 30–50% of the bill).
              </li>
              <li className="list-disc">
                Subcontractor margin — many regional firms outsource the
                build at 3–5x markup.
              </li>
              <li className="list-disc">
                &quot;Strategy&quot; deliverables that mostly recycle the
                same questionnaire across clients.
              </li>
              <li className="list-disc">
                Theme licensing and hosting bundled at 5–10x markup, locked
                into multi-year contracts.
              </li>
            </ul>
            <p className="mt-3">
              None of those are bad in principle. They&apos;re bad when nobody
              tells you the breakdown.
            </p>
          </Section>

          <Section title="4. AI workflows have a different cost shape">
            <p>
              If your project includes AI (chatbots, agents, automation), the
              cost structure splits in three:
            </p>
            <ul className="my-4 space-y-2 pl-5">
              <li className="list-disc">
                <strong>Build</strong>: one-time. $5K–$15K typical for a
                production AI workflow.
              </li>
              <li className="list-disc">
                <strong>Care/maintenance</strong>: monthly, covers your
                provider&apos;s time. $200–$900/mo depending on complexity.
              </li>
              <li className="list-disc">
                <strong>API costs</strong>: monthly, pass-through. $0–$500/mo
                for most workflows; $500+ for voice agents and high-volume
                pipelines.
              </li>
            </ul>
            <p className="mt-3">
              Any agency quoting AI work without breaking these three apart
              is hiding the ongoing cost. Demand the breakdown before you
              sign.
            </p>
          </Section>

          <Section title="5. What we actually charge">
            <p>
              We&apos;re Stratus Creative. We publish our prices because most
              agencies don&apos;t.
            </p>
            <ul className="my-4 space-y-2 pl-5">
              <li className="list-disc">
                <strong>Starter</strong> (productized website): $1,495 flat,
                ships in 5–7 days. Includes design, mobile-responsive build,
                Google Business Profile setup, click-to-call, basic SEO.
              </li>
              <li className="list-disc">
                <strong>Custom</strong> (multi-page, brand systems,
                automation, AI): from $5,000, scoped per project.
              </li>
              <li className="list-disc">
                <strong>Hosting</strong>: $49/mo (basic) or $99/mo (with
                monthly content updates).
              </li>
              <li className="list-disc">
                <strong>AI Care</strong>: $199 / $399 / $899 per month
                depending on workflow complexity.
              </li>
              <li className="list-disc">
                <strong>API costs</strong>: always pass-through, never
                bundled into our fees.
              </li>
            </ul>
            <p className="mt-3">
              You can run our{" "}
              <a
                href="https://stratus-creative.com/tools/cost-estimator"
                className="underline-hover text-foreground"
              >
                free AI workflow cost estimator
              </a>{" "}
              to model your specific project before talking to anyone.
            </p>
          </Section>

          <Section title="6. The questions to ask any agency">
            <ol className="my-4 space-y-2 pl-5">
              <li className="list-decimal">
                What&apos;s the line-item breakdown of this quote?
              </li>
              <li className="list-decimal">
                What does it cost monthly to host and maintain after launch?
              </li>
              <li className="list-decimal">
                Who actually does the work? In-house, freelance, or offshore?
              </li>
              <li className="list-decimal">
                Do I own the code, the design, the content, the domain — all
                of it — once I&apos;ve paid?
              </li>
              <li className="list-decimal">
                What&apos;s the delivery timeline in business days, with
                milestones?
              </li>
              <li className="list-decimal">
                If I leave you tomorrow, what do I keep and what do I lose?
              </li>
              <li className="list-decimal">
                For AI work: what are the build, Care, and API costs as
                separate line items?
              </li>
            </ol>
            <p className="mt-3">
              A serious agency answers all seven without flinching.
            </p>
          </Section>

          <div className="mt-12 border-t border-border/60 pt-8 text-sm text-muted-foreground">
            <p>
              Have questions about your project?{" "}
              <Link
                href="/start"
                className="underline-hover text-foreground"
              >
                Talk to us — reply within one business day
              </Link>
              .
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest">
              © 2026 Stratus Creative · stratus-creative.com · May 8, 2026
            </p>
          </div>
        </article>
      </main>

      <div className="screen-only">
        <SiteFooter />
      </div>

      {/* Print styles */}
      <style>{`
        .screen-only { display: block; }
        .print-only { display: none; }
        @media print {
          .screen-only { display: none !important; }
          .print-only { display: block !important; }
          .print-only-hide { display: none !important; }
          body { background: white !important; color: black !important; }
          main { color: black !important; }
          h1, h2, h3, h4, p, li, td, th { color: black !important; }
          .text-foreground, .text-muted-foreground { color: black !important; }
          .text-accent { color: #4a6cd6 !important; }
          .border-border\\/60, .border-border { border-color: #ccc !important; }
        }
      `}</style>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-border/60 pt-8 print:mt-6 print:pt-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground sm:text-base print:text-sm">
        {children}
      </div>
    </section>
  );
}
