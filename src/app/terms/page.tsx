import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Stratus Creative",
  description: "Terms of Service for Stratus Creative web design and hosting services.",
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Stratus Creative
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2, 2026</p>

        <p className="mt-6 text-muted-foreground">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of services provided by
          Stratus Creative (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By purchasing our services, you agree
          to these Terms.
        </p>

        <Section title="1. Services">
          <p>We offer two types of services:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <strong>Website Build</strong> — a one-time design and development service that
              produces a professional website for your business.
            </li>
            <li>
              <strong>Website Hosting</strong> — a monthly subscription service that hosts,
              maintains, and keeps your website live on our infrastructure.
            </li>
          </ul>
          <p className="mt-3">
            We reserve the right to update, improve, or modify our services at any time. We will
            notify you of any material changes that affect your service.
          </p>
        </Section>

        <Section title="2. Payment">
          <p>
            All payments are processed securely through Stripe. We do not store your payment card
            information.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <strong>Website Build fee</strong> — charged as a one-time payment at the time of
              purchase.
            </li>
            <li>
              <strong>Hosting subscription</strong> — billed monthly on the date you subscribed.
              Your subscription renews automatically until cancelled.
            </li>
          </ul>
          <p className="mt-3">
            Prices are listed in US dollars. We may change pricing with 30 days&rsquo; written notice
            to your registered email address.
          </p>
        </Section>

        <Section title="3. Refund Policy">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Website Build</strong> — you may request a full refund within 7 days of
              purchase if work has not yet begun. Once site development has started, refunds are
              not available.
            </li>
            <li>
              <strong>Hosting subscription</strong> — you may cancel at any time. Your cancellation
              takes effect at the end of the current billing period. We do not issue partial-month
              refunds.
            </li>
          </ul>
          <p className="mt-3">
            To request a refund, contact us at{" "}
            <a href="mailto:business@stratus-creative.com" className="underline underline-offset-4">
              business@stratus-creative.com
            </a>
            .
          </p>
        </Section>

        <Section title="4. Cancellation &amp; Website Transfer">
          <p>
            You may cancel your hosting subscription at any time with no penalty. Cancellation
            takes effect at the end of your current billing cycle.
          </p>
          <p className="mt-3">
            Upon cancellation of hosting, we will provide a reasonable transfer process so you can
            take your website elsewhere. This includes providing you with the website&rsquo;s source
            files or deploying it to a hosting provider of your choice. We will complete the transfer
            within 14 business days of your cancellation request.
          </p>
          <p className="mt-3">
            If you choose not to host the site elsewhere, we will take it offline at the end of the
            billing period.
          </p>
        </Section>

        <Section title="5. Intellectual Property">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Your content</strong> — you retain ownership of all content you provide or
              that is sourced from your public business listings (text, images, branding, reviews).
            </li>
            <li>
              <strong>Our platform</strong> — Stratus Creative retains ownership of the underlying
              website templates, tooling, and platform code we use to build your site. Upon transfer,
              we provide you with the compiled website files, not our proprietary source templates.
            </li>
          </ul>
        </Section>

        <Section title="6. Hosting Service Level">
          <p>We make commercially reasonable efforts to keep hosted websites available 24/7. However:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>We do not guarantee 100% uptime.</li>
            <li>Scheduled maintenance may result in brief downtime. We will provide advance notice where possible.</li>
            <li>Downtime caused by third-party providers (including Vercel) is outside our control.</li>
          </ul>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Stratus Creative is not liable for any indirect,
            incidental, consequential, or punitive damages arising from your use of our services.
            Our total liability for any claim is limited to the amount you paid us in the 3 months
            preceding the claim.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            We may suspend or terminate services if you violate these Terms, engage in fraudulent
            activity, or fail to pay for services. We will provide reasonable notice before
            termination unless the situation requires immediate action (such as fraud or abuse).
          </p>
          <p className="mt-3">
            You may terminate your relationship with us at any time by cancelling your subscription
            and notifying us by email.
          </p>
        </Section>

        <Section title="9. Governing Law">
          <p>
            These Terms are governed by the laws of the State of South Carolina. Any disputes shall
            be resolved in the courts of South Carolina.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these Terms? Email us at{" "}
            <a href="mailto:business@stratus-creative.com" className="underline underline-offset-4">
              business@stratus-creative.com
            </a>
            .
          </p>
        </Section>
      </article>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>&copy; 2026 Stratus Creative. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
