import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckoutButton } from "@/components/checkout-button";
import Link from "next/link";

export const metadata = {
  title: "Pricing — Stratus Creative",
  description:
    "Simple, transparent pricing for professional websites. One-time build fee plus optional monthly hosting and maintenance.",
};

export default function PricingPage() {
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
            <Link href="/pricing" className="text-foreground">
              Pricing
            </Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="/#contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
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
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          One-time build fee. Optional monthly hosting. No contracts, no
          surprises.
        </p>
      </section>

      <Separator />

      {/* Build Plans */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Website Build</h2>
          <p className="mt-2 text-muted-foreground">
            Pay once. Own your site.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Essential */}
          <Card>
            <CardHeader>
              <CardTitle>Essential</CardTitle>
              <CardDescription>For solo operators getting online</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$1,250</span>
                <span className="ml-1 text-sm text-muted-foreground">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Single-page responsive website</li>
                <li>&#10003; Content written from your Google reviews</li>
                <li>&#10003; Click-to-call phone button</li>
                <li>&#10003; Google Maps embed</li>
                <li>&#10003; Basic on-page SEO</li>
                <li>&#10003; SSL certificate included</li>
                <li>&#10003; Delivered in 5–7 business days</li>
              </ul>
              <CheckoutButton
                plan="essential"
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Get started — $1,250
              </CheckoutButton>
            </CardContent>
          </Card>

          {/* Professional */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Professional</CardTitle>
                <Badge>Most Popular</Badge>
              </div>
              <CardDescription>For businesses ready to compete</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$2,500</span>
                <span className="ml-1 text-sm text-muted-foreground">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Multi-page site (3–5 pages)</li>
                <li>&#10003; Contact form with email notifications</li>
                <li>&#10003; Photo gallery / portfolio section</li>
                <li>&#10003; Testimonials section</li>
                <li>&#10003; Google Business Profile optimization</li>
                <li>&#10003; Everything in Essential</li>
                <li>&#10003; Delivered in 7–10 business days</li>
              </ul>
              <CheckoutButton
                plan="professional"
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                Get started — $2,500
              </CheckoutButton>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>For established businesses</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$4,250</span>
                <span className="ml-1 text-sm text-muted-foreground">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Full site (5–8 pages)</li>
                <li>&#10003; Team / About page</li>
                <li>&#10003; Service area pages</li>
                <li>&#10003; Testimonials showcase</li>
                <li>&#10003; Advanced on-page SEO</li>
                <li>&#10003; Everything in Professional</li>
                <li>&#10003; Delivered in 10–14 business days</li>
              </ul>
              <CheckoutButton
                plan="premium"
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Get started — $4,250
              </CheckoutButton>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Hosting Add-Ons */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Hosting &amp; Maintenance</h2>
          <p className="mt-2 text-muted-foreground">
            Add a hosting plan and we handle everything. Cancel anytime.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Basic Hosting</CardTitle>
              <CardDescription>Hosting and uptime monitoring</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="ml-1 text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Managed hosting on Vercel</li>
                <li>&#10003; SSL certificate renewal</li>
                <li>&#10003; Uptime monitoring</li>
                <li>&#10003; Security updates</li>
                <li>&#10003; Cancel anytime</li>
              </ul>
              <CheckoutButton
                plan="hosting_basic"
                className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Subscribe — $49/mo
              </CheckoutButton>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hosting + Updates</CardTitle>
                <Badge>Best Value</Badge>
              </div>
              <CardDescription>Hosting plus monthly content edits</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="ml-1 text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Everything in Basic Hosting</li>
                <li>&#10003; Up to 2 content updates/month</li>
                <li>&#10003; New photos or service changes</li>
                <li>&#10003; Priority support</li>
                <li>&#10003; Cancel anytime</li>
              </ul>
              <CheckoutButton
                plan="hosting_plus"
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                Subscribe — $99/mo
              </CheckoutButton>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Other Add-Ons */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">More Add-Ons</h2>
          <p className="mt-2 text-muted-foreground">
            Reach more customers with these optional services.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Google Ads Management</span>
            <span className="font-semibold">$149/mo</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Google Business Profile Optimization</span>
            <span className="font-semibold">$250</span>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Interested in an add-on?{" "}
          <Link href="/#contact" className="underline underline-offset-4 hover:text-foreground">
            Contact us
          </Link>
        </p>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Common questions</h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-6 text-sm">
          {[
            {
              q: "Do I need to provide anything?",
              a: "No. We research your business using public info — Google reviews, Yelp listings, your phone number and address. You just approve the site.",
            },
            {
              q: "What if I want changes after launch?",
              a: "Minor changes are free within 30 days. For ongoing updates, our Hosting + Updates plan covers up to 2 changes per month.",
            },
            {
              q: "Do I own the website?",
              a: "Yes. Once paid, the site is yours. You can host it yourself or let us handle hosting.",
            },
            {
              q: "Can I cancel the hosting subscription?",
              a: "Yes, anytime. Your site stays live for the remainder of the billing period. After that you can move it elsewhere or we take it down.",
            },
            {
              q: "Is a domain included?",
              a: "Domain registration is not included but we can help you purchase and connect one. Most .com domains are around $15/year.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-lg border px-5 py-4">
              <p className="font-medium">{item.q}</p>
              <p className="mt-1 text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>&copy; 2026 Stratus Creative. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span>business@stratus-creative.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
