import { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SupportFaq } from "@/components/support-faq";
import { SupportForm } from "@/components/support-form";

export const metadata: Metadata = {
  title: "Support — Stratus Creative",
  description:
    "Get help with your Stratus Creative website. Browse common questions or submit a support request.",
};

export default function SupportPage() {
  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Stratus Creative
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="/#services" className="transition-colors hover:text-foreground">
              Services
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="/support" className="text-foreground">
              Support
            </Link>
          </nav>
          <Link
            href="/#contact"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          How can we help?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Find answers to common questions below, or submit a request and
          we&apos;ll get back to you within{" "}
          <span className="font-medium text-foreground">
            24–48 business hours
          </span>
          .
        </p>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <SupportFaq />
      </section>

      <Separator />

      {/* Contact form */}
      <section id="contact" className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Submit a support request
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            For existing clients only.{" "}
            <Link href="/#contact" className="underline underline-offset-4 hover:text-foreground">
              Not a client yet?
            </Link>
          </p>
        </div>
        <SupportForm />
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Stratus Creative. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
