import Link from "next/link";
import { NewsletterSignup } from "@/components/newsletter-signup";

const FOOTER_NAV = [
  {
    label: "Studio",
    links: [
      { href: "/work", label: "Work" },
      { href: "/services", label: "Services" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/start", label: "Start a project" },
    ],
  },
  {
    label: "Tools & resources",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/tools/cost-estimator", label: "AI cost estimator" },
      { href: "/resources/free-website-audit", label: "Free website audit" },
      { href: "/notes", label: "Decoded" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refunds", label: "Refunds" },
      { href: "/acceptable-use", label: "Acceptable use" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Newsletter row — quiet line, not a marketing card */}
        <div className="border-b border-border/60 py-6">
          <NewsletterSignup variant="compact" />
        </div>

        {/* Top: oversized wordmark + CTA */}
        <div className="grid gap-12 py-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="section-label">Build with us</p>
            <h2 className="display-heading mt-6 text-5xl sm:text-6xl lg:text-7xl">
              Let&apos;s make something
              <br />
              <span className="serif-accent text-accent">worth showing.</span>
            </h2>
            <Link
              href="/start"
              className="mt-10 inline-flex items-center gap-3 text-base text-foreground"
            >
              <span className="underline-hover">Start a project</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5 lg:justify-end">
            {FOOTER_NAV.map((group) => (
              <div key={group.label}>
                <p className="section-label">{group.label}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: copyright + contact */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border/60 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {year} Stratus Creative — All rights reserved.</span>
          <a
            href="mailto:business@stratus-creative.com"
            className="font-mono tracking-wider transition-colors hover:text-foreground"
          >
            business@stratus-creative.com
          </a>
        </div>
      </div>
    </footer>
  );
}
