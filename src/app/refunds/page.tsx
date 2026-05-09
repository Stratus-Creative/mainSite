import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Refund Policy — Stratus Creative",
  description:
    "Plain-language refund terms for Stratus Creative — Starter websites, Custom engagements, AI workflows, and care plans.",
};

export default function RefundsPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <p className="section-label">Legal</p>
          <h1 className="display-heading mt-6 text-4xl sm:text-5xl">
            Refund Policy
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Last updated · May 9, 2026
          </p>

          <p className="mt-10 text-base text-muted-foreground">
            We&rsquo;d rather build something you keep than haggle over a
            refund. This page tells you exactly when money comes back, when it
            doesn&rsquo;t, and how to ask. No fine print buried at the bottom.
          </p>

          <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-6">
            <p className="section-label text-accent">TL;DR</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Starter website</strong> —
                full money-back within 7 days of delivery, no questions asked.
                We&rsquo;ll ask why for our own learning, but it&rsquo;s not a
                gate.
              </li>
              <li>
                <strong className="text-foreground">Custom engagement</strong>{" "}
                — fixed-price, milestone-based. Refund of unbilled work if you
                cancel mid-build.
              </li>
              <li>
                <strong className="text-foreground">AI Care</strong> — cancel
                anytime by email. Service runs to the end of the paid month.
                No proration.
              </li>
              <li>
                <strong className="text-foreground">API costs</strong> are
                pass-through from Anthropic / OpenAI / etc., billed at-cost
                with no markup. Once spent on your behalf, never refundable.
              </li>
            </ul>
          </div>

          <Section title="1. Starter website ($1,495 flat)">
            <p>
              The 7-day money-back guarantee is real and load-bearing.
              Here&rsquo;s how it works:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Within <strong>7 days of delivery</strong>, ask for a full
                refund and you get one. No questions asked.
              </li>
              <li>
                We&rsquo;ll ask <em>why</em> so we can do better next time —
                but answering is optional, and it doesn&rsquo;t affect whether
                you get the refund.
              </li>
              <li>
                Refunds are returned to your original payment method via
                Stripe, typically within 5&ndash;10 business days depending on
                your bank.
              </li>
              <li>
                After day 7, the site is yours and the engagement is closed.
                No further refund eligibility — but you keep the code, the
                files, and the ability to take it anywhere.
              </li>
              <li>
                <strong>Domain registration is non-refundable.</strong> Once
                we&rsquo;ve registered your .com (within the $20 cap, or with
                your authorized pass-through difference for premium names),
                that fee is paid to the registrar and cannot be reversed. The
                domain stays in your name regardless of whether you keep the
                site.
              </li>
              <li>
                <strong>Renewal after year one is your responsibility.</strong>{" "}
                The registrar emails you directly before expiration. We do not
                auto-renew, do not monitor renewal dates, and are not
                responsible if the domain lapses — including the site going
                dark, the domain being lost to someone else, or any recovery
                costs. See the{" "}
                <a href="/terms" className="underline-hover text-foreground">
                  Terms of Service
                </a>{" "}
                for the full renewal terms.
              </li>
            </ul>
          </Section>

          <Section title="2. Custom engagement (from $5,000)">
            <p>
              Custom work is fixed-price and scoped per project, with no
              retainer. Refunds follow the milestone structure agreed in your
              proposal.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong>Pre-kickoff</strong> — if you cancel before work
                begins, any deposit is refunded in full.
              </li>
              <li>
                <strong>During build</strong> — refund of the unbilled portion
                only. Completed milestones (design approved, build shipped,
                etc.) are non-refundable because the work has already
                happened.
              </li>
              <li>
                <strong>Post-launch</strong> — there&rsquo;s a 30-day defect
                window. Bugs and broken features get fixed for free.
                That&rsquo;s a quality commitment, not a satisfaction refund.
              </li>
              <li>
                Anything specified in your individual proposal supersedes this
                default.
              </li>
            </ul>
          </Section>

          <Section title="3. AI workflows (Build + AI Care + API)">
            <p>AI engagements have three components, each refunded differently.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong>Build fee ($5K&ndash;$15K)</strong> — same
                milestone-based logic as Custom above. Unbilled work
                refundable, completed milestones not.
              </li>
              <li>
                <strong>AI Care subscription ($199 / $399 / $899 per
                month)</strong>{" "}
                — cancel anytime by emailing us. Service continues to the end
                of the paid month. No proration of partial months.
              </li>
              <li>
                <strong>API costs</strong> — pass-through from the model
                provider (Anthropic, OpenAI, etc.), billed at-cost with no
                markup. Once spent on your behalf, never refundable. We
                couldn&rsquo;t refund them if we wanted to — the money is
                already gone.
              </li>
              <li>
                You can resume Care anytime after cancelling. The rate at
                signup may differ from your original rate.
              </li>
            </ul>
          </Section>

          <Section title="4. Online presence services">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Google Business Profile setup ($250 one-time)</strong>{" "}
                — non-refundable once profile work begins. Once a profile is
                published, edited, or claimed on your behalf, we can&rsquo;t
                un-publish it.
              </li>
              <li>
                <strong>Reputation management ($149/mo)</strong> — cancel
                anytime, runs to the end of the billing period. No partial-
                month refunds.
              </li>
              <li>
                If we screw up — wrong information published, missed response
                window, etc. — refunds are handled case-by-case. Email us.
              </li>
            </ul>
          </Section>

          <Section title="5. Hosting & care plans">
            <ul className="list-disc space-y-1 pl-5">
              <li>Cancellable anytime. Service runs to the end of the current billing period.</li>
              <li>No partial-month refunds.</li>
              <li>
                Site export and migration support is included on
                cancellation — you leave with the working site, not a hostage
                situation.
              </li>
            </ul>
          </Section>

          <Section title="6. How to request a refund">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Email{" "}
                <a
                  href="mailto:business@stratus-creative.com"
                  className="underline-hover text-foreground"
                >
                  business@stratus-creative.com
                </a>{" "}
                with your reference ID — that&rsquo;s the ID at the end of
                your project tracker URL (
                <span className="font-mono text-xs">
                  stratus-creative.com/quote/&#123;id&#125;
                </span>
                ).
              </li>
              <li>We reply within 24 business hours.</li>
              <li>
                Approved refunds are processed via Stripe back to your
                original payment method.
              </li>
              <li>
                We don&rsquo;t ghost. If a refund is denied under the terms
                above, we&rsquo;ll tell you why in plain English.
              </li>
            </ol>
          </Section>

          <Section title="7. Disputes">
            <p>
              Talk to us first. Almost every dispute we&rsquo;ve seen
              resolves faster by email than through a chargeback or your
              bank&rsquo;s dispute process.
            </p>
            <p className="mt-3">
              Chargebacks initiated without contacting us first may forfeit
              the money-back guarantee. Not a punishment — just that the
              guarantee assumes a conversation happened.
            </p>
            <p className="mt-3">
              These terms are governed by the laws of the State of South
              Carolina, USA.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              Questions, refund requests, or just want to flag a concern:{" "}
              <a
                href="mailto:business@stratus-creative.com"
                className="underline-hover text-foreground"
              >
                business@stratus-creative.com
              </a>
              .
            </p>
          </Section>
        </article>
      </main>

      <SiteFooter />
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
    <section className="mt-12 border-t border-border/60 pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
