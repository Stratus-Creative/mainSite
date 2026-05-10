import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn } from "@/components/motion";

export const metadata = {
  title: "Privacy Policy — Stratus Creative",
  description:
    "What Stratus Creative collects, why we collect it, who we share it with, and how to get it out of our systems.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <FadeIn>
            <p className="section-label">Legal</p>
            <h1 className="display-heading mt-6 text-4xl sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Last updated · May 9, 2026
            </p>
          </FadeIn>

          {/* TL;DR card */}
          <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              TL;DR
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground sm:text-base">
              <li>
                <strong>What we collect:</strong> what you type into our forms
                and chat, basic browser/device info, and which pages you
                visit. Stripe handles payment cards — we never see them.
              </li>
              <li>
                <strong>Why:</strong> to reply to you, build your project,
                send receipts and the occasional newsletter, and figure out
                which pages are working.
              </li>
              <li>
                <strong>Who we share it with:</strong> Vercel (hosting),
                Supabase (database), Resend (email), Stripe (payments),
                Anthropic (AI chat replies), Microsoft Clarity (session
                replay). That&apos;s the whole list.
              </li>
              <li>
                <strong>What we don&apos;t do:</strong> sell your data, run
                ad-tracking pixels, or share your info with anyone outside
                that list.
              </li>
              <li>
                <strong>Your move:</strong> email{" "}
                <a
                  href="mailto:business@stratus-creative.com"
                  className="underline-hover text-foreground"
                >
                  business@stratus-creative.com
                </a>{" "}
                to access, correct, or delete anything we have on you.
              </li>
            </ul>
          </div>

          <Section title="1. Who we are">
            <p>
              Stratus Creative is a sole-proprietor design and development
              studio operated by James Farmer out of Simpsonville, South
              Carolina, USA. The studio is the data controller for everything
              described on this page.
            </p>
            <p>
              Reach the studio directly at{" "}
              <a
                href="mailto:business@stratus-creative.com"
                className="underline-hover text-foreground"
              >
                business@stratus-creative.com
              </a>
              . Privacy questions go to the same inbox — there&apos;s no
              dedicated privacy desk because there is no department.
            </p>
          </Section>

          <Section title="2. What we collect">
            <p className="font-semibold text-foreground">
              Information you give us
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Contact and project form fields: name, business name, email,
                phone, project type, budget, contact preference, website URL,
                and the body of your message.
              </li>
              <li>
                Newsletter signups: your email address.
              </li>
              <li>
                Support requests: anything you write in the support form.
              </li>
              <li>
                AI chat messages: the text you send the in-page chat
                assistant, plus a randomly generated session ID and the URL
                of the page you opened the chat from.
              </li>
              <li>
                Cost estimator inputs: only stored if you click &ldquo;email
                me this estimate&rdquo; — otherwise they live in your browser
                and are gone when you close the tab.
              </li>
              <li>
                Payment details: handled entirely by Stripe. We receive a
                record of the transaction (plan, amount, customer email,
                Stripe customer/subscription ID) but never your card number,
                CVV, or billing address.
              </li>
            </ul>

            <p className="mt-6 font-semibold text-foreground">
              Information collected automatically
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Standard server logs from our host (Vercel): IP address, user
                agent, request path, timestamp.
              </li>
              <li>
                Pageview pings written to our database, including page URL,
                referrer, and UTM parameters where present, tied to a
                random visitor session ID stored in your browser.
              </li>
              <li>
                Aggregate analytics from Vercel Analytics and Vercel Speed
                Insights: pageview counts, performance metrics, no
                cross-site tracking.
              </li>
              <li>
                Session recordings, click heatmaps, and scroll behavior via
                Microsoft Clarity. Clarity masks form input by default; we
                have not turned masking off.
              </li>
            </ul>
          </Section>

          <Section title="3. Why we collect it">
            <ul className="list-disc space-y-1 pl-5">
              <li>To reply to you and scope your project.</li>
              <li>To deliver the website, workflow, or hosting you bought.</li>
              <li>To process payment and send receipts via Stripe.</li>
              <li>
                To send transactional email (project updates, payment
                confirmations) and the newsletter you opted in to.
              </li>
              <li>
                To run the in-page AI chat assistant — your message has to
                reach an AI provider for the assistant to answer.
              </li>
              <li>
                To prevent abuse: rate limiting, IP throttling, and
                deduplicating spam submissions.
              </li>
              <li>
                To figure out which pages work and which don&apos;t —
                aggregate analytics and session replay.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell personal information. We do not run advertising
              pixels. We do not build profiles for anyone but ourselves, and
              the only thing we do with that profile is decide what to ship
              you next.
            </p>
          </Section>

          <Section title="4. Who we share it with">
            <p>
              We use a small set of subprocessors to run the studio. Each one
              receives only the data it needs to do its job.
            </p>
            <ul className="mt-4 space-y-4 pl-0">
              <li>
                <strong>Vercel</strong> — hosting, edge runtime, Vercel
                Analytics, Speed Insights. Receives all HTTP traffic to the
                site (IPs, request paths, user agents) and aggregate
                performance/pageview data.{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Vercel privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Supabase</strong> — Postgres database hosted on AWS
                (US region). Stores your form submissions, chat
                conversations, pageview records, and admin data.{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Supabase privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> — sends transactional email and
                stores newsletter subscriber lists. Receives recipient email
                addresses and message contents.{" "}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Resend privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Stripe</strong> — processes payments when checkout
                is enabled. Receives your card details, name, billing
                address, and email directly. We never see the card.{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Stripe privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Anthropic</strong> — generates AI chat responses
                using Claude. Receives your chat messages and the system
                prompt. Also receives a redacted summary of new project
                submissions for an internal lead-scoring step.{" "}
                <a
                  href="https://www.anthropic.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Anthropic privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Microsoft Clarity</strong> — captures session
                recordings, click heatmaps, and behavioral analytics. Sets
                its own cookies. Form input is masked by default.{" "}
                <a
                  href="https://privacy.microsoft.com/privacystatement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-hover text-foreground"
                >
                  Microsoft privacy statement
                </a>
                .
              </li>
            </ul>
            <p className="mt-4">
              We may also disclose information when legally required —
              subpoena, court order, or to protect rights and safety. If that
              ever happens we&apos;ll narrow the disclosure as much as the
              law allows.
            </p>
          </Section>

          <Section title="5. AI chat and cost estimator">
            <p>
              The chat widget is powered by Anthropic&apos;s Claude. When you
              send a message, the conversation history for that session is
              forwarded to Anthropic to generate the reply. We also store the
              full transcript in our Supabase database, tied to a randomly
              generated session ID, so we can review unanswered questions and
              improve the bot. Anthropic&apos;s own retention is governed by{" "}
              <a
                href="https://www.anthropic.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-hover text-foreground"
              >
                their privacy policy
              </a>
              .
            </p>
            <p className="mt-3">
              When you submit a project inquiry, a redacted version of your
              submission is sent to Anthropic for a fire-and-forget lead
              scoring step. The score is stored alongside your submission;
              the prompt isn&apos;t retained on our side.
            </p>
            <p className="mt-3">
              The cost estimator runs entirely in your browser. Your inputs
              are not stored on our servers unless you explicitly click the
              button to email yourself the estimate — at which point the
              numbers are passed to Resend so the email can be sent, and
              business@stratus-creative.com is BCC&apos;d so the studio
              knows someone ran the math.
            </p>
          </Section>

          <Section title="6. How long we keep it">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Project submissions and client records:</strong> kept
                for the life of the engagement. After project close, retained
                for up to 7 years to satisfy US tax and accounting
                obligations, then deleted or anonymized.
              </li>
              <li>
                <strong>Newsletter subscribers:</strong> kept until you
                unsubscribe. Every email has a one-click unsubscribe link.
              </li>
              <li>
                <strong>Chat conversations:</strong> retained for up to 90
                days, then deleted. Anthropic&apos;s retention runs on
                their own schedule.
              </li>
              <li>
                <strong>Pageview records:</strong> retained for up to 12
                months, then aggregated and pruned.
              </li>
              <li>
                <strong>Session recordings (Clarity):</strong> kept per
                Clarity&apos;s default retention, currently up to 13
                months.
              </li>
              <li>
                <strong>Stripe records:</strong> retained on Stripe per their
                financial-record policies; we keep transaction summaries for
                the 7-year tax window.
              </li>
            </ul>
            <p className="mt-3">
              Want it gone sooner? Email{" "}
              <a
                href="mailto:business@stratus-creative.com"
                className="underline-hover text-foreground"
              >
                business@stratus-creative.com
              </a>
              .
            </p>
          </Section>

          <Section title="7. Your rights">
            <p className="font-semibold text-foreground">Everyone</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong>Access:</strong> ask for a copy of what we hold on
                you.
              </li>
              <li>
                <strong>Correction:</strong> ask us to fix anything wrong.
              </li>
              <li>
                <strong>Deletion:</strong> ask us to remove your data, with
                limited exceptions for tax records and active project
                obligations.
              </li>
              <li>
                <strong>Opt-out of marketing:</strong> unsubscribe link in
                every newsletter, or email us.
              </li>
            </ul>

            <p className="mt-6 font-semibold text-foreground">
              California residents (CCPA / CPRA)
            </p>
            <p className="mt-3">
              You have the right to know what we collect, request deletion,
              and opt out of the sale or sharing of personal information.
              Stratus does not sell personal information and does not share
              it for cross-context behavioral advertising.
            </p>

            <p className="mt-6 font-semibold text-foreground">
              EU / UK residents (GDPR / UK GDPR)
            </p>
            <p className="mt-3">
              Our legal bases for processing are: performance of a contract
              (delivering services you bought), legitimate interest
              (responding to inquiries, preventing abuse, basic analytics),
              and consent (newsletter signups). You have the right to
              access, rectify, erase, restrict processing, port your data,
              object to processing, and withdraw consent at any time without
              affecting the lawfulness of processing already done.
            </p>

            <p className="mt-6 font-semibold text-foreground">Children</p>
            <p className="mt-3">
              The site is not intended for anyone under 13. We don&apos;t
              knowingly collect data from children. If you think a child has
              submitted information, email us and we&apos;ll delete it.
            </p>
          </Section>

          <Section title="8. Cookies and similar tech">
            <p>
              The marketing site uses a small number of cookies and
              browser-storage entries:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                <strong>admin-session</strong> — first-party, httpOnly,
                7-day expiry, set only when an authorized admin signs in to
                the <code>/admin</code> area. You will never see this cookie
                as a normal visitor.
              </li>
              <li>
                <strong>Microsoft Clarity</strong> — third-party analytics
                cookies (<code>_clck</code>, <code>_clsk</code>, plus
                related local storage) used to stitch together session
                recordings and heatmaps.
              </li>
              <li>
                <strong>Vercel Analytics</strong> — uses local storage to
                generate an anonymous pageview ID. No third-party cookies.
              </li>
              <li>
                <strong>Stratus visitor session ID</strong> — a random ID
                stored in your browser&apos;s local storage so we can stitch
                pageviews together for attribution. Not shared with anyone.
              </li>
              <li>
                <strong>Stripe</strong> — sets its own cookies on the
                Stripe-hosted checkout page if you go through payment.
              </li>
            </ul>
            <p className="mt-3">
              You can clear cookies and local storage in your browser
              settings, install an ad/tracker blocker, or use Do Not Track
              and Global Privacy Control headers — we honor GPC for
              California opt-out signals. Blocking analytics will not break
              the site.
            </p>
          </Section>

          <Section title="9. Security">
            <p>
              All traffic is served over HTTPS. Data sits in Supabase
              Postgres with row-level security; the admin area is gated by
              password and a server-validated session cookie. Payment data
              never touches our servers — Stripe handles it. We rate-limit
              every public endpoint to make abuse expensive.
            </p>
            <p className="mt-3">
              No system is unbreakable. If we discover a breach affecting
              your data we&apos;ll tell you in plain English, fast.
            </p>
          </Section>

          <Section title="10. International transfers">
            <p>
              Stratus operates from the United States and stores data with
              US-based providers (Vercel, Supabase on AWS US, Resend,
              Stripe, Anthropic, Microsoft). If you&apos;re visiting from
              the EU, UK, or anywhere outside the US, your data is
              transferred to and processed in the United States. We rely on
              the standard contractual clauses our subprocessors maintain
              for cross-border transfers.
            </p>
          </Section>

          <Section title="11. Changes to this policy">
            <p>
              When we make material changes we&apos;ll update the
              &ldquo;Last updated&rdquo; date at the top of this page and
              email active clients. Small wording cleanups go in without
              notice.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Questions, requests, or complaints — same address either way:{" "}
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
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
