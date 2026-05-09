import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Acceptable Use Policy — Stratus Creative",
  description:
    "What you can and can't do with Stratus Creative services, free tools, and AI features.",
};

export default function AcceptableUsePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <p className="section-label">Legal</p>
          <h1 className="display-heading mt-6 text-4xl sm:text-5xl">
            Acceptable Use Policy
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Last updated · May 9, 2026
          </p>

          <p className="mt-10 text-base text-muted-foreground">
            This page covers what you can&rsquo;t use Stratus Creative for.
            Most of it is common sense. We keep it short on purpose.
          </p>

          <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-6">
            <p className="section-label text-accent">TL;DR</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Don&rsquo;t use our services for anything illegal.</li>
              <li>
                Don&rsquo;t abuse the AI features — no jailbreaks, no trying
                to generate harmful content through our chat widget.
              </li>
              <li>Don&rsquo;t resell our work as your own.</li>
              <li>
                Don&rsquo;t reverse-engineer our infrastructure to compete
                with us.
              </li>
            </ul>
          </div>

          <Section title="1. What's not allowed">
            <p>The list isn&rsquo;t exhaustive but it covers the obvious cases:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Illegal content or activity</strong> — CSAM,
                harassment, fraud, intellectual property infringement, malware
                distribution, anything else that&rsquo;s actually against the
                law.
              </li>
              <li>
                <strong>Spam</strong> — using forms, the newsletter, or the
                AI chat widget to send unsolicited mass communication, or as
                a relay for outbound spam.
              </li>
              <li>
                <strong>Abuse of free tools</strong> — automated scraping of
                the cost estimator, the free audit form, or the chat widget;
                rate-limit evasion; running benchmarks against our endpoints
                without asking.
              </li>
              <li>
                <strong>Jailbreaking AI safety</strong> — attempts to extract
                system prompts, generate disallowed content, or get the chat
                widget to behave in ways the underlying models are trained
                not to.
              </li>
              <li>
                <strong>Reselling Stratus work</strong> as your own without
                written consent — white-labelling, resyndicating, or
                presenting our deliverables as another studio&rsquo;s output.
              </li>
              <li>
                <strong>Reverse engineering paid features</strong> for
                competitive purposes — using our products to build a clone is
                not the kind of inspiration we&rsquo;re flattered by.
              </li>
            </ul>
          </Section>

          <Section title="2. Free tools (cost estimator, free audit, AI chat)">
            <p>
              The free tools — the AI cost estimator, the free website
              audit, the on-site chat widget — are provided in good faith
              for genuine prospects and customers.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Reasonable use limits apply. Abusive volume can be blocked
                without notice.
              </li>
              <li>
                We log requests for abuse prevention and capacity planning.
                That data is not sold or shared.
              </li>
              <li>
                If you have a legitimate need to hit these tools at higher
                volume — a research project, an agency evaluation, an
                integration test — email us first. The answer is usually
                yes.
              </li>
            </ul>
          </Section>

          <Section title="3. Reporting abuse">
            <p>
              See something off — a Stratus-built site hosting malware,
              someone using our chat widget to spam, an account behaving
              suspiciously? Email{" "}
              <a
                href="mailto:business@stratus-creative.com"
                className="underline-hover text-foreground"
              >
                business@stratus-creative.com
              </a>
              .
            </p>
            <p className="mt-3">We respond within 24 business hours.</p>
          </Section>

          <Section title="4. Consequences">
            <p>If you violate this policy, expect some combination of:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Account suspension or termination.</li>
              <li>
                Forfeiture of refund eligibility for actively malicious use —
                the money-back guarantee assumes a good-faith customer.
              </li>
              <li>
                Cooperation with law enforcement on illegal activity. We
                don&rsquo;t shield bad actors.
              </li>
            </ul>
          </Section>

          <Section title="5. Changes">
            <p>
              We update this page when we need to. Material changes get a
              new &ldquo;Last updated&rdquo; date at the top. Active
              customers get an email if a change affects them directly.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about what&rsquo;s allowed:{" "}
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
