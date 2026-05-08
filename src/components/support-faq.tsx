"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { SUPPORT_FAQ } from "@/lib/faq-data";

export function SupportFaq() {
  return (
    <Accordion.Root className="divide-y divide-border/60 rounded-lg border border-border/60">
      {SUPPORT_FAQ.map((faq, i) => (
        <Accordion.Item key={i} value={String(i)} className="group">
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span>{faq.q}</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]:rotate-180"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="support-faq-panel overflow-hidden">
            <p className="px-5 pb-4 pt-1 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
