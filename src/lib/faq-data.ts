export interface FaqItem {
  q: string;
  a: string;
}

export const SUPPORT_FAQ: FaqItem[] = [
  {
    q: "How do I request changes to my website?",
    a: 'Use the support form on this page and select "Content Update" or "Feature Request" as the request type. Describe what you need and we\'ll follow up within 24–48 business hours to confirm details and a timeline.',
  },
  {
    q: "What is included in hosting?",
    a: "Hosting includes uptime monitoring, SSL certificate management, automated backups, security updates, and basic performance optimization. Your site stays fast, secure, and online — we handle all the technical details.",
  },
  {
    q: "How does billing work?",
    a: "We bill monthly on a fixed rate agreed upon in your service contract. Invoices are sent by email on the 1st of each month. One-time work outside your plan's scope is quoted separately and invoiced upon completion.",
  },
  {
    q: "How do I cancel?",
    a: "You can cancel your hosting or service plan at any time with 30 days' written notice to business@stratus-creative.com. We'll confirm the cancellation, assist with any data exports, and ensure a smooth offboarding.",
  },
  {
    q: "How long do changes take?",
    a: "Minor content updates (text, images, links) are typically done within 1–3 business days. Larger feature requests are scoped individually. We'll always confirm the expected timeline before we start.",
  },
];
