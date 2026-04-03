"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do I request changes to my website?",
    answer:
      'Use the support form on this page and select "Content Update" or "Feature Request" as the request type. Describe what you need and we\'ll follow up within 24–48 business hours to confirm details and a timeline.',
  },
  {
    question: "What is included in hosting?",
    answer:
      "Hosting includes uptime monitoring, SSL certificate management, automated backups, security updates, and basic performance optimization. Your site stays fast, secure, and online — we handle all the technical details.",
  },
  {
    question: "How does billing work?",
    answer:
      "We bill monthly on a fixed rate agreed upon in your service contract. Invoices are sent by email on the 1st of each month. One-time work outside your plan's scope is quoted separately and invoiced upon completion.",
  },
  {
    question: "How do I cancel?",
    answer:
      "You can cancel your hosting or service plan at any time with 30 days' written notice to business@stratus-creative.com. We'll confirm the cancellation, assist with any data exports, and ensure a smooth offboarding.",
  },
  {
    question: "How long do changes take?",
    answer:
      "Minor content updates (text, images, links) are typically done within 1–3 business days. Larger feature requests are scoped individually. We'll always confirm the expected timeline before we start.",
  },
];

export function SupportFaq() {
  return (
    <Accordion.Root className="divide-y rounded-lg border">
      {faqs.map((faq, i) => (
        <Accordion.Item key={i} value={String(i)} className="group">
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span>{faq.question}</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="support-faq-panel overflow-hidden">
            <p className="px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
