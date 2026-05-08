export interface ComparisonRow {
  feature: string;
  competitor: string;
  stratus: string;
}

export interface Comparison {
  slug: string;
  competitor: string;
  competitorTagline: string;
  intro: string;
  whenCompetitor: string[];
  whenStratus: string[];
  rows: ComparisonRow[];
  pricingNote: string;
  closingThought: string;
}

export const COMPARISONS: Record<string, Comparison> = {
  squarespace: {
    slug: "squarespace",
    competitor: "Squarespace",
    competitorTagline: "DIY website builder with a polished editor",
    intro:
      "Squarespace is good at what it does — let a non-technical owner stand up a decent-looking website in a weekend. We build websites for owners who'd rather not spend that weekend, and who want results they can't get from a template-driven editor.",
    whenCompetitor: [
      "You enjoy designing your own site and have the time",
      "Your business needs are simple and unlikely to grow complex",
      "You're testing an idea and may pivot in 6 months",
      "You want a $20/month setup with no upfront cost",
      "Your customers are mostly using your business name to find you (not searching by category)",
    ],
    whenStratus: [
      "You'd rather pay once and have it handled",
      "You want a custom design that reflects your actual brand",
      "You need real local SEO (not just template-level)",
      "You want a site that loads in under 1 second on mobile",
      "You expect to add workflows or AI down the road",
    ],
    rows: [
      {
        feature: "Upfront cost",
        competitor: "$0",
        stratus: "$1,495 flat (Starter)",
      },
      {
        feature: "Monthly cost",
        competitor: "$23–$65/mo",
        stratus: "$0 (own it) or $49–$99/mo managed",
      },
      {
        feature: "Design",
        competitor: "Templates with light customization",
        stratus: "Custom design from scratch",
      },
      {
        feature: "Performance (mobile)",
        competitor: "Variable, often heavy JS",
        stratus: "Sub-1s LCP, statically generated",
      },
      {
        feature: "Local SEO",
        competitor: "Built-in basics",
        stratus: "Built-in basics + Google Business Profile setup + reviews integration",
      },
      {
        feature: "Setup time",
        competitor: "Weekend DIY, or hire a Squarespace expert",
        stratus: "5–7 business days, fully done-for-you",
      },
      {
        feature: "Code ownership",
        competitor: "Locked to Squarespace platform",
        stratus: "You own the code; portable to any host",
      },
      {
        feature: "Workflows / automation",
        competitor: "Limited (built-in scheduling, email)",
        stratus: "Custom-quoted, including AI agents",
      },
      {
        feature: "When you outgrow it",
        competitor: "Migration to another platform = rebuild",
        stratus: "It scales with you (it's already custom)",
      },
    ],
    pricingNote:
      "Squarespace at the Business tier ($23/mo) over 5 years = $1,380. The Stratus Starter ($1,495 one-time) plus Vercel hobby hosting (free) = $1,495 over 5 years. Roughly the same total, but you own the result instead of renting it.",
    closingThought:
      "Squarespace is right when you want to build it yourself. We're right when you'd rather not — and when you want what you ship to be genuinely yours.",
  },
  wix: {
    slug: "wix",
    competitor: "Wix",
    competitorTagline: "DIY website builder with the most features per dollar",
    intro:
      "Wix gives you more flexibility than Squarespace at a similar price point — they've shipped hundreds of features. The catch is that flexibility means complexity. Most small business owners don't have time to learn another tool, and the sites they build often look like Wix sites. We build websites that look like your business.",
    whenCompetitor: [
      "You like tinkering and have time to learn the editor",
      "You need a specific feature Wix happens to ship out of the box",
      "Your budget is genuinely under $500",
      "You don't mind that the site will look like a Wix site",
    ],
    whenStratus: [
      "You want a site that doesn't look like a Wix site",
      "You want professional content (not auto-generated copy)",
      "You'd rather hand it off and not think about it",
      "You expect to expand into automation, AI, or integrations",
      "Performance and SEO matter to your business",
    ],
    rows: [
      {
        feature: "Upfront cost",
        competitor: "$0",
        stratus: "$1,495 flat (Starter)",
      },
      {
        feature: "Monthly cost",
        competitor: "$17–$159/mo",
        stratus: "$0 (own it) or $49–$99/mo managed",
      },
      {
        feature: "Design",
        competitor: "Drag-and-drop templates",
        stratus: "Custom design",
      },
      {
        feature: "Editor learning curve",
        competitor: "Hours-to-days for first site",
        stratus: "None — we build it",
      },
      {
        feature: "Performance",
        competitor: "Variable, often slow",
        stratus: "Sub-1s LCP, statically generated",
      },
      {
        feature: "AI features",
        competitor: "Wix AI site generator (cookie-cutter)",
        stratus: "Custom AI agents and workflows quoted per project",
      },
      {
        feature: "Code ownership",
        competitor: "Locked to Wix platform",
        stratus: "You own the code",
      },
      {
        feature: "Migration cost when leaving",
        competitor: "Full rebuild — Wix doesn't export",
        stratus: "$0 — it's already portable",
      },
    ],
    pricingNote:
      "Wix Core ($17/mo) over 5 years = $1,020 — but that's the cheapest tier without ads, custom domain, and most useful features. The realistic Wix Business plan ($36/mo) over 5 years = $2,160. Stratus Starter is $1,495 one-time, and you keep the site if you ever leave us.",
    closingThought:
      "Wix is fine if you want to build it yourself and accept the look. We're better when you want a real custom site without the time investment, and when you're planning to grow beyond a brochure site.",
  },
};
