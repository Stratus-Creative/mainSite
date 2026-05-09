export const PRICING = {
  starter: {
    price: 1495,
    label: "$1,495 flat, one-time",
    deliveryDays: "5–7 business days",
  },
  aiWidget: {
    price: 800,
    label: "$800 flat, one-time",
    deliveryDays: "3–5 business days",
  },
  custom: {
    rangeLow: 5000,
    rangeHigh: 20000,
    label: "$5,000–$20,000 typical",
    deliveryWeeks: "2–6 weeks typical",
  },
  hosting: {
    basic: { price: 49, label: "$49/mo" },
    plus: { price: 99, label: "$99/mo" },
  },
  aiCare: {
    light: { price: 199, hours: 3, label: "Light $199/mo (≈3 hrs)" },
    standard: { price: 399, hours: 6, label: "Standard $399/mo (≈6 hrs)" },
    pro: { price: 899, hours: 12, label: "Pro $899/mo (≈12 hrs)" },
  },
} as const;

export function buildPricingBlock(): string {
  const p = PRICING;
  return `<starter_site>
${p.starter.label}.
- Single-page or compact multi-page, custom design (no templates), mobile-first
- Google Business Profile integration, click-to-call, live Google reviews
- Basic on-page SEO, SSL included
- ${p.starter.deliveryDays}
- 7-day money-back guarantee
- Best for: local service businesses, solo operators, contractors
</starter_site>

<ai_chat_widget>
${p.aiWidget.label}. Productized add-on.
- Custom AI assistant trained on the client's business, embedded on their site
- Streaming chat, page-context awareness, proactive nudge
- Conversation logging, session management, monthly cap protection
- ${p.aiWidget.deliveryDays}
- Ongoing: AI Care Light ${p.aiCare.light.label.split(" ")[1]} + pass-through API (~$5–$30/mo)
- Best for: local businesses or Starter clients who want AI without a full workflow build
- This is the same widget the prospect is using right now.
</ai_chat_widget>

<custom_engagements>
${p.custom.label}. Scoped per project.
- Multi-page sites, brand systems
- AI workflows and agents (lead qualification, support bots, voice agents) with memory, RAG, tool-calling, integrations
- Marketing automation, CRM integration
- Internal process automation, dashboards, admin panels
- ${p.custom.deliveryWeeks}
</custom_engagements>

<hosting>
Optional, month-to-month, cancel anytime.
- Basic Hosting: ${p.hosting.basic.label} — managed Vercel hosting, SSL, monitoring, security updates
- Hosting + Updates: ${p.hosting.plus.label} — everything above + up to 2 content updates/month
</hosting>

<ai_care>
Recurring, after build. Covers our time, not API costs.
- ${p.aiCare.light.label} — single-purpose workflows, low volume. Required for the AI Chat Widget.
- ${p.aiCare.standard.label} — multi-step workflows with memory or integrations. Most clients land here.
- ${p.aiCare.pro.label} — voice agents, high volume, multi-agent systems.
</ai_care>`;
}
