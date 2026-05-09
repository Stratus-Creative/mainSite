import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service — Stratus Creative",
  description:
    "The terms that govern engagements between Stratus Creative and its clients. Plain English, no surprises.",
  alternates: { canonical: "https://stratus-creative.com/terms" },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
          <p className="section-label">Legal</p>
          <h1 className="display-heading mt-6 text-4xl sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Last updated · May 9, 2026
          </p>

          <p className="mt-10 text-base text-muted-foreground leading-relaxed">
            These terms cover how Stratus Creative works with clients. They are
            written in plain English on purpose. If anything here is unclear,
            email{" "}
            <a
              href="mailto:business@stratus-creative.com"
              className="underline-hover text-foreground"
            >
              business@stratus-creative.com
            </a>{" "}
            and we will rewrite the offending sentence.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            1. Who we are
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Stratus Creative is a sole-proprietor design and engineering studio
            owned and operated by James Farmer in Simpsonville, South Carolina.
            In these terms, &ldquo;Stratus,&rdquo; &ldquo;we,&rdquo; and
            &ldquo;us&rdquo; mean the studio. &ldquo;You&rdquo; means the
            person or business that has hired us or signed up for one of our
            services.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            2. What we provide
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Stratus offers three lines of work:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Local-business websites.</strong>{" "}
              A productized Starter tier with fixed pricing and a 5–7 business
              day turnaround, and a Custom tier scoped per project with a
              fixed-price quote.
            </li>
            <li>
              <strong className="text-foreground">AI workflows and agents.</strong>{" "}
              One-time build engagements paired with an optional monthly AI
              Care subscription. Underlying API usage is billed at cost or run
              on your own keys.
            </li>
            <li>
              <strong className="text-foreground">Online presence.</strong>{" "}
              Google Business Profile setup, reputation and reviews
              management, and similar work, sold standalone or bundled into
              custom engagements.
            </li>
          </ul>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Current pricing for each tier lives on the public services pages
            and in your written quote. Posted prices change occasionally; the
            quote you accept is the price you pay.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            3. Engagements and quotes
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Engagements start one of two ways: you purchase a Starter package
            through the website, or you accept a written proposal from us for a
            custom engagement. Either way, the document that defines what you
            are paying for is the proposal or product description, not a
            verbal conversation.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Each quote spells out the deliverables, the price, the payment
            schedule, the timeline assumptions, and what is explicitly out of
            scope. Quotes are valid for 30 days from issue unless we wrote a
            different window into the proposal. After that we reserve the
            right to re-quote.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Scope changes are normal. If you ask for work outside the original
            scope, we will write a short change order with the additional cost
            and timeline impact and wait for your written approval before
            starting it. We will not silently expand the bill.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            4. Payment terms
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            All amounts are in US dollars. Payments are processed through
            Stripe; we do not store card numbers.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Starter websites</strong> are
              paid in full upfront. Work begins once payment clears and your
              intake materials are received.
            </li>
            <li>
              <strong className="text-foreground">Custom engagements</strong>{" "}
              are billed 50% on signature and 50% on launch, unless your
              proposal specifies a different schedule (larger projects are
              sometimes split into milestone payments).
            </li>
            <li>
              <strong className="text-foreground">Monthly subscriptions</strong>{" "}
              (hosting, AI Care, reputation management) renew automatically on
              the date of your initial signup until you cancel.
            </li>
            <li>
              <strong className="text-foreground">Pass-through API costs</strong>{" "}
              for AI workflows are billed monthly in arrears at cost, with no
              markup. You can also bring your own API keys, in which case those
              charges hit your account directly and we do not see them.
            </li>
          </ul>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Invoices are due on receipt. Anything more than 14 days overdue
            may pause active work and accrue a 1.5% monthly late fee on the
            outstanding balance.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            5. Delivery and timelines
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Starter websites ship in 5–7 business days from a clean intake. A
            clean intake means we have your content, brand assets, and any
            third-party access we need to do the work. Custom engagements run
            2–6 weeks depending on scope, with the actual window written into
            your proposal.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Timelines assume you respond to questions and review requests
            within a reasonable window — usually 2 business days. If responses
            stall, the schedule slides by the same amount. We will tell you
            when it happens, not after.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            6. Revisions and changes
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Starter packages include one round of revisions on the delivered
            site. Custom engagements include two rounds, or whatever your
            proposal specifies. A round means consolidated feedback in a
            single pass — not an open-ended back-and-forth.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            For 30 days after launch, we fix bugs and make minor copy or image
            swaps at no additional cost. Larger changes after that — new
            pages, new features, redesigns — are quoted separately at our
            standard rates.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            7. Intellectual property
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Once final payment clears, you own the deliverables: the website
            files, the page content we wrote together, the designs, the
            workflow configurations, and the prompts. The work product is
            yours to use, host elsewhere, modify, or kill.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Stratus retains ownership of the underlying tools, components,
            templates, libraries, and code patterns we reuse across projects.
            Nothing here grants you a license to those building blocks
            outside the deliverable they ship inside of.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            We reserve the right to display completed work in our portfolio
            and case studies. If a project is sensitive, tell us — we will
            redact business names, screenshots, or specifics on request, or
            keep the project off the portfolio entirely.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            8. Hosting and ongoing services
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Hosting and AI Care are month-to-month. There is no contract
            length and no cancellation fee. Cancel by emailing us; the service
            ends at the end of your current billing period and we do not
            issue partial-month refunds.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            On cancellation we provide reasonable migration support: the
            current site files and a handoff to the hosting provider of your
            choice, completed within 14 business days of your request. If you
            would rather just take it down, we will.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            8a. Domain registration (Starter only)
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Every Starter package includes one standard{" "}
            <strong className="text-foreground">.com</strong> domain registered
            in your name for the first year. We cover registration costs up to{" "}
            <strong className="text-foreground">$20 USD</strong>. The domain is
            yours from day one — registered in your account, with you as the
            legal owner. You can transfer it out at any time, free.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Two cases fall outside this inclusion:
          </p>
          <ul className="mt-4 space-y-2 text-base text-muted-foreground leading-relaxed list-disc pl-6">
            <li>
              <strong className="text-foreground">Premium .com names</strong>{" "}
              listed by registrars or aftermarket sellers above $20 — we will
              tell you the exact cost difference before we register; you can
              pay the pass-through difference (no markup) or pick a different
              .com.
            </li>
            <li>
              <strong className="text-foreground">Non-.com TLDs</strong> (.io,
              .co, .net, .ai, country codes, etc.) — not included; available
              at-cost as a pass-through.
            </li>
          </ul>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            <strong className="text-foreground">
              Renewal after year one is entirely your responsibility.
            </strong>{" "}
            The registrar will email you directly using the contact info on the
            domain account, typically 30–60 days before expiration. You can
            renew with them, transfer to a different registrar, or let it
            lapse — your choice. We do not auto-renew on your behalf, we do not
            charge a renewal fee, and we do not monitor renewal dates.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            <strong className="text-foreground">
              If you do not renew, Stratus Creative is not responsible
            </strong>{" "}
            for any consequences — including the site becoming unreachable, the
            domain entering grace period or redemption pricing, the domain
            being claimed by someone else after expiration, or the cost or
            effort of recovering it. Keeping the contact email on file with
            the registrar accurate, watching for renewal notices, and paying
            on time are all on you.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Custom engagements do not include a bundled domain — domains are
            quoted as part of the proposal because requirements (multiple TLDs,
            premium names, specific registrar, existing portfolios) vary.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            9. Refunds
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Starter packages carry a 7-day money-back guarantee, with the full
            mechanics — what qualifies, when work in progress affects the
            refund, how to request one — in our{" "}
            <a href="/refunds" className="underline-hover text-foreground">
              Refund Policy
            </a>
            . Subscriptions can be cancelled any time and stop billing at the
            end of the current period. Custom engagements follow the milestone
            schedule in their proposal.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            10. AI workflows
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            AI workflows have a few specifics worth calling out:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-muted-foreground leading-relaxed">
            <li>
              API costs are pass-through. We bill at cost or you run on your
              own keys. Either way, you are responsible for the usage your
              workflows generate.
            </li>
            <li>
              AI outputs are probabilistic. We design, test, and harden the
              workflows we build, but we do not warrant that any individual
              model output is accurate, complete, or free of hallucination.
              You are responsible for human review where the stakes warrant
              it.
            </li>
            <li>
              You own the prompts, configurations, and any data you feed into
              the workflow. We do not train on your data and we do not resell
              it.
            </li>
            <li>
              AI Care is a monthly subscription that covers monitoring, model
              updates, prompt tuning, and minor changes. Cancel any time;
              service continues through the paid period.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            11. Acceptable use
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Full rules live in our{" "}
            <a
              href="/acceptable-use"
              className="underline-hover text-foreground"
            >
              Acceptable Use Policy
            </a>
            . The short version: do not use our services for anything illegal,
            do not weaponize the AI features for spam, scraping at abusive
            scale, or generation of harmful content, and do not resell our
            services as your own without a written agreement.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            12. Confidentiality
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Anything you share with us that is not already public — business
            data, customer lists, internal documents, login credentials, draft
            content — we treat as confidential and use only to do the work. We
            expect the same back: information about how we build, our internal
            tooling, and our pricing strategy is not for republication. NDAs
            are available on request for engagements that need one.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            13. Warranties and disclaimers
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            We stand behind the explicit promises in these terms and in your
            proposal: the money-back guarantee on Starter, the 30-day
            post-launch defect fix window, the pass-through pricing on API
            costs. Beyond those promises, services are provided as is. We do
            not warrant uninterrupted operation, fitness for a particular
            purpose, or that AI-generated content will be correct.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Some parts of what we deliver depend on third parties — Vercel for
            hosting, Supabase for databases, Resend for email, Stripe for
            payments, Anthropic for AI. Outages or changes at those providers
            are outside our control.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            14. Limitation of liability
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            To the maximum extent allowed by law, Stratus is not liable for
            indirect, incidental, consequential, or punitive damages — lost
            profits, lost data, lost business — arising out of the services.
            Our total liability for any claim, regardless of form, is capped
            at the fees you paid us in the 12 months immediately before the
            claim, or the total cost of the engagement if shorter.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            15. Indemnification
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            You will defend and hold us harmless against claims arising from
            content, data, or materials you provide to us — for example,
            copyright claims on text or imagery you supplied, or claims tied
            to how you use the deliverables in your business.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            We will defend and hold you harmless against third-party claims
            that the original work we created infringes their intellectual
            property. This does not cover modifications you or anyone else
            made after delivery, or third-party components used as documented.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            16. Termination
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Either of us can end the relationship with written notice.
            Subscriptions stop at the end of the current period. For active
            project work, you owe for work completed up to the termination
            date and any non-refundable third-party costs we incurred on your
            behalf; refunds, if any, follow the{" "}
            <a href="/refunds" className="underline-hover text-foreground">
              Refund Policy
            </a>
            .
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            We may suspend or terminate immediately for non-payment, abuse of
            the services, or violation of the Acceptable Use Policy.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            17. Governing law
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            These terms are governed by the laws of the State of South
            Carolina, without regard to conflict-of-law rules. Any dispute
            that cannot be worked out by email will be resolved in the state
            or federal courts in Greenville County, South Carolina, and both
            sides agree to that venue.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            18. Changes to these terms
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            We update these terms occasionally. The current version always
            lives on this page with the &ldquo;last updated&rdquo; date at the
            top. If a change materially affects active clients — pricing
            structure, liability, ownership — we will email the contact on
            file before it takes effect.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight mt-12">
            19. Contact
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-4">
            Questions, disputes, NDA requests, or anything else related to
            these terms:{" "}
            <a
              href="mailto:business@stratus-creative.com"
              className="underline-hover text-foreground"
            >
              business@stratus-creative.com
            </a>
            . We reply within 4 hours during business hours.
          </p>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
