import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContactForm } from "@/components/contact-form";
import { CheckoutButton } from "@/components/checkout-button";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Stratus Creative
          </span>
          <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
            <a
              href="#services"
              className="transition-colors hover:text-foreground"
            >
              Services
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
            <Link
              href="/support"
              className="transition-colors hover:text-foreground"
            >
              Support
            </Link>
          </nav>
          <LinkButton href="#contact" size="sm">
            Get Started
          </LinkButton>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
        <Badge variant="secondary" className="mb-6">
          Now serving local businesses
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Your business deserves a website that works as hard as you do
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          We build professional, mobile-friendly websites for local service
          businesses. No DIY builders. No hassle. We research your business,
          build your site, and handle everything.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <LinkButton href="#contact" size="lg">
            Get Your Website
          </LinkButton>
          <LinkButton href="#how-it-works" size="lg" variant="outline">
            See How It Works
          </LinkButton>
        </div>
      </section>

      <Separator />

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Built for local service businesses
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Plumbers, electricians, cleaners, landscapers, HVAC techs, dog
            groomers, pressure washers, handymen — if you serve your local
            community, we build your website.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Mobile-First Design",
              description:
                "Your customers search on their phones. Every site we build looks great on mobile, tablet, and desktop.",
            },
            {
              title: "Content from Your Reviews",
              description:
                "We write your website copy using your Google reviews, services, and business info. No questionnaires needed.",
            },
            {
              title: "SEO Built In",
              description:
                "Title tags, meta descriptions, local keywords, and Google Maps integration so customers find you.",
            },
            {
              title: "Click-to-Call",
              description:
                "One tap and your customers are calling you. Every site includes a prominent phone button.",
            },
            {
              title: "Fast & Secure",
              description:
                "SSL certificates, fast hosting, and modern web technology. Your site loads in under 2 seconds.",
            },
            {
              title: "No Maintenance Headaches",
              description:
                "We host, maintain, and update your site. You never have to touch it unless you want to.",
            },
          ].map((service) => (
            <Card key={service.title}>
              <CardHeader>
                <CardTitle className="text-base">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We do the work upfront. You just say yes.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "1",
              title: "We find you",
              description:
                "We research local businesses in your area and identify those without a website.",
            },
            {
              step: "2",
              title: "We build your site",
              description:
                "Using your Google reviews, services, and public info, we create a professional website for your business.",
            },
            {
              step: "3",
              title: "We reach out",
              description:
                "We send you a preview of your new website. No obligation — just take a look.",
            },
            {
              step: "4",
              title: "You go live",
              description:
                "Love it? Pay once and your site goes live. Add hosting and we handle everything going forward.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            One-time build fee based on your business size. No hidden costs.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Essential</CardTitle>
              <CardDescription>
                For solo operators getting started online
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$1,250</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Single-page responsive website</li>
                <li>&#10003; Click-to-call phone button</li>
                <li>&#10003; Google Maps embed</li>
                <li>&#10003; Basic SEO optimization</li>
                <li>&#10003; SSL certificate</li>
                <li>&#10003; Content written from your reviews</li>
              </ul>
              <CheckoutButton
                plan="essential"
                className="mt-auto w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Get started
              </CheckoutButton>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Professional</CardTitle>
                <Badge>Most Popular</Badge>
              </div>
              <CardDescription>
                For growing businesses ready to compete online
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$2,500</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Multi-page site (3–5 pages)</li>
                <li>&#10003; Contact form with email notifications</li>
                <li>&#10003; Photo gallery / portfolio</li>
                <li>&#10003; Testimonials section</li>
                <li>&#10003; Google Business Profile optimization</li>
                <li>&#10003; Everything in Essential</li>
              </ul>
              <CheckoutButton
                plan="professional"
                className="mt-auto w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                Get started
              </CheckoutButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>
                For established businesses with complex needs
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$4,250</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>&#10003; Full site (5–8 pages)</li>
                <li>&#10003; Team page</li>
                <li>&#10003; Service area pages</li>
                <li>&#10003; Testimonials showcase</li>
                <li>&#10003; Advanced SEO</li>
                <li>&#10003; Everything in Professional</li>
              </ul>
              <CheckoutButton
                plan="premium"
                className="mt-auto w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Get started
              </CheckoutButton>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold">Optional Add-Ons</h3>
          <div className="mx-auto mt-6 grid max-w-3xl gap-4 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <span className="font-medium">Hosting &amp; Maintenance</span>
                <span className="ml-3 font-semibold">$49/mo</span>
              </div>
              <CheckoutButton
                plan="hosting_basic"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                Subscribe
              </CheckoutButton>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <span className="font-medium">Hosting + Monthly Updates</span>
                <span className="ml-3 font-semibold">$99/mo</span>
              </div>
              <CheckoutButton
                plan="hosting_plus"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                Subscribe
              </CheckoutButton>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span>Google Ads Management</span>
              <span className="font-semibold">$149/mo</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span>Google Business Optimization</span>
              <span className="font-semibold">$250</span>
            </div>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Already a customer?{" "}
            <a
              href="mailto:business@stratus-creative.com?subject=Manage my subscription"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact us to manage your subscription
            </a>
          </p>
        </div>
      </section>

      <Separator />

      {/* Contact Form */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to get your website?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tell us about your business and we&apos;ll get started. No
            obligation, no pressure.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-lg">
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>&copy; 2026 Stratus Creative. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <span>business@stratus-creative.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
