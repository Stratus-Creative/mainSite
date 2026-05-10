"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const HERO_FAQ = [
  {
    q: "Will this work for my business?",
    a: "We work with local service businesses (HVAC, plumbing, contractors), small professional firms (law, dental, real estate), and solo founders / consultants. If you're growing past $20M/year and need 30+ pages or compliance-heavy work, we're probably not the right fit — and we'll tell you that on the first call.",
    cta: { label: "Browse our service pillars", href: "/services" },
  },
  {
    q: "How much will mine cost?",
    a: "Productized starter websites are $1,495 flat. Custom engagements (multi-page, automation, AI agents) start at $5,000 and most land between $5K–$15K. AI workflow Care is separate at $199/$399/$899 per month. API costs are always pass-through, never bundled.",
    cta: { label: "See full pricing", href: "/pricing" },
  },
  {
    q: "How fast can you ship?",
    a: "Starter sites ship in 5–7 business days. Custom multi-page sites take 2–6 weeks depending on scope. AI workflows take 3–6 weeks for production deployment. We commit to dates in the proposal — and we hit them.",
    cta: { label: "See in-flight work", href: "/work" },
  },
];

export function HomeHeroFaq() {
  return (
    <Accordion.Root className="mt-12 divide-y divide-border/40 border-y border-border/40">
      {HERO_FAQ.map((item, i) => (
        <Accordion.Item
          key={i}
          value={String(i)}
          className="group"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-medium tracking-tight transition-colors hover:text-accent focus-visible:outline-none">
              <span>{item.q}</span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="support-faq-panel overflow-hidden">
            <div className="pb-5 pt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>{item.a}</p>
              <Link
                href={item.cta.href}
                className="group mt-3 inline-flex items-center gap-2 text-sm text-foreground"
              >
                <span className="underline-hover">{item.cta.label}</span>
                <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
