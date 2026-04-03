import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Stratus Creative",
  description: "Privacy Policy for Stratus Creative web design and hosting services.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2, 2026</p>

        <p className="mt-6 text-muted-foreground">
          Stratus Creative (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your
          personal information. This Privacy Policy explains what data we collect, how we use it,
          and your rights.
        </p>

        <Section title="1. Information We Collect">
          <p>We collect the following information when you use our services:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <strong>Contact information</strong> — your name, email address, and phone number,
              provided when you fill out our contact form or purchase a service.
            </li>
            <li>
              <strong>Business information</strong> — your business name, location, service type,
              and other details you provide or that we source from public listings (Google, Yelp,
              etc.) to build your website.
            </li>
            <li>
              <strong>Payment information</strong> — payment is processed by Stripe. We receive a
              record of the transaction (amount, date, plan) but we never see or store your card
              number, CVV, or other sensitive payment details.
            </li>
            <li>
              <strong>Website content</strong> — text, images, or other materials you provide for
              inclusion on your website.
            </li>
            <li>
              <strong>Usage data</strong> — basic analytics such as page views, may be collected
              by our hosting platform (Vercel) automatically.
            </li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc space-y-1 pl-5">
            <li>To build and deliver your website.</li>
            <li>To set up and manage your hosting subscription.</li>
            <li>To process payments and send receipts through Stripe.</li>
            <li>To communicate with you about your project or subscription.</li>
            <li>To respond to support requests.</li>
          </ul>
          <p className="mt-3">
            We do not sell your personal information to third parties. We do not use your data for
            advertising purposes.
          </p>
        </Section>

        <Section title="3. Third-Party Services">
          <p>We use the following third-party services to deliver our product:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <strong>Stripe</strong> — for payment processing and subscription billing. Stripe&rsquo;s
              privacy practices are governed by{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                Stripe&rsquo;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel</strong> — for website hosting infrastructure. Vercel may collect
              standard server logs (IP addresses, request data) as part of their hosting service.
            </li>
            <li>
              <strong>Resend</strong> — for sending transactional emails (contact form confirmations,
              payment notifications).
            </li>
          </ul>
        </Section>

        <Section title="4. Data Retention">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              While you are an active client, we retain your contact details, business information,
              and website content to deliver and maintain your service.
            </li>
            <li>
              After you cancel your hosting subscription, we will transfer your website and its
              content to you (see our Terms of Service). We will then remove your website files from
              our systems within a reasonable timeframe, typically within 30 days of transfer
              completion.
            </li>
            <li>
              Basic transaction records (purchase date, plan, amount) may be retained for accounting
              and legal purposes as required.
            </li>
          </ul>
        </Section>

        <Section title="5. Your Rights">
          <p>You have the right to:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <strong>Access</strong> — request a copy of the personal information we hold about you.
            </li>
            <li>
              <strong>Correction</strong> — ask us to correct inaccurate or incomplete information.
            </li>
            <li>
              <strong>Deletion</strong> — request that we delete your personal information. Note
              that some information may be retained for legal or accounting purposes.
            </li>
            <li>
              <strong>Website transfer</strong> — upon cancellation of hosting, receive your website
              content and files as described in our Terms of Service.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at{" "}
            <a href="mailto:business@stratus-creative.com" className="underline underline-offset-4">
              business@stratus-creative.com
            </a>
            .
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            Our main website uses minimal cookies — primarily those set by our hosting platform
            (Vercel) for performance and security purposes. We do not use advertising or tracking
            cookies. Your hosted website (the one we build for you) may use cookies depending on
            the features included.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We take reasonable steps to protect your information, including using HTTPS encryption
            for all data in transit and relying on reputable third-party processors (Stripe, Vercel)
            that maintain industry-standard security practices. No method of transmission over the
            internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by email or by posting a notice on our website. Continued use of our services
            after changes take effect constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions or concerns about your privacy? Contact us at{" "}
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
