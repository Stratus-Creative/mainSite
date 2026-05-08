// Landing page content for per-pillar and per-industry pages.

export interface PillarLanding {
  slug: string;
  pillar: string;
  hero: { eyebrow: string; title: string; accent: string; intro: string };
  problem: { label: string; title: string; body: string };
  capabilities: string[];
  pricing: { headline: string; ranges: { name: string; price: string; detail: string }[] };
  process: { step: string; title: string; detail: string }[];
  faqs: { q: string; a: string }[];
}

export const PILLAR_PAGES: Record<string, PillarLanding> = {
  "ai-agents": {
    slug: "ai-agents",
    pillar: "AI agents & workflows",
    hero: {
      eyebrow: "Service · AI agents",
      title: "Custom AI agents that",
      accent: "earn their seat at your table.",
      intro:
        "We build AI agents that do real work — handling support tickets, qualifying leads, generating quotes, ingesting emails, summarizing calls. Production-ready, cost-transparent, monitored.",
    },
    problem: {
      label: "The problem with most AI agents",
      title: "Demos are easy. Production is hard.",
      body: "Most AI agents you've seen are demos. They work for the happy path, fall apart on edge cases, and silently rack up API bills nobody warned the client about. We build agents that survive month two.",
    },
    capabilities: [
      "Customer support bots with conversation memory and escalation paths",
      "Lead qualification agents that research prospects and draft tailored responses",
      "Quote/estimate generators (e.g. car-repair estimator with VIN lookup + pricing rules)",
      "Email triage — inbound emails get scored, categorized, and drafted replies",
      "Internal copilots — agents that help your team work faster",
      "Voice AI agents (telephony + transcription + LLM)",
      "Document Q&A with RAG over your knowledge base",
    ],
    pricing: {
      headline: "Build + Care + API — three explicit lines.",
      ranges: [
        {
          name: "Build (one-time)",
          price: "$5K – $15K",
          detail: "Engineering, design, integration testing, deploy. Quoted firm in your proposal.",
        },
        {
          name: "AI Care",
          price: "$199 – $899/mo",
          detail: "Monitoring, prompt tuning, model upgrades. Tier matched to complexity.",
        },
        {
          name: "API costs",
          price: "$0 – $500+/mo",
          detail: "LLM tokens + third-party APIs. Always pass-through, never bundled.",
        },
      ],
    },
    process: [
      {
        step: "01",
        title: "Discovery",
        detail: "Understand the workflow, the volume, the success criteria. We model the cost upfront.",
      },
      {
        step: "02",
        title: "Prototype",
        detail: "We build a working prototype on your real data within the first week.",
      },
      {
        step: "03",
        title: "Production",
        detail: "Hardening, error handling, observability, deploy. 3–6 weeks total.",
      },
      {
        step: "04",
        title: "Care",
        detail: "Monthly Care covers our time. API costs pass through at-cost.",
      },
    ],
    faqs: [
      {
        q: "Which model do you use?",
        a: "Whichever fits the job. Claude Sonnet 4.6 for most workflows, Haiku for fast/cheap tasks, GPT-4o or Gemini 2.5 Pro when their strengths fit. Run our cost estimator to see the per-model math for your specific case.",
      },
      {
        q: "Can I use my own API keys?",
        a: "Yes. We default to BYO keys for new clients — clean, no markup. You can switch to our managed keys later (cost + 15% admin).",
      },
      {
        q: "What if the agent makes a mistake?",
        a: "We design every agent with escalation paths and human-in-the-loop checkpoints for high-stakes actions. Care covers prompt tuning when behavior drifts.",
      },
    ],
  },
  "local-websites": {
    slug: "local-websites",
    pillar: "Local-business websites",
    hero: {
      eyebrow: "Service · Local websites",
      title: "Real websites for businesses",
      accent: "that do real work.",
      intro:
        "Mobile-first, fast, search-friendly websites for plumbers, electricians, HVAC techs, contractors, and other local service businesses. No marketing-firm markup.",
    },
    problem: {
      label: "Why most local-business sites are broken",
      title: "Templates with the wrong colors.",
      body: "Most local businesses pay $5K–$10K for a six-page WordPress template that loads in 6 seconds and looks identical to their competitor's. We build sites that load in under 1 second, look like your actual business, and cost a fraction.",
    },
    capabilities: [
      "Single-page or compact multi-page sites",
      "Mobile-first responsive design",
      "Click-to-call hero buttons (one tap = phone call)",
      "Google Business Profile setup and optimization",
      "Live Google reviews displayed on the site",
      "Service area pages with local SEO",
      "Custom design (no templates)",
      "Built on Next.js + Vercel — sub-1-second load time",
    ],
    pricing: {
      headline: "Two paths. Always transparent.",
      ranges: [
        {
          name: "Starter",
          price: "$1,495 flat",
          detail: "Productized single-page site. Ships in 5–7 days. Ideal for solo operators and small teams.",
        },
        {
          name: "Custom",
          price: "From $5,000",
          detail: "Multi-page sites, brand systems, integrations. 2–6 weeks.",
        },
        {
          name: "Hosting + care",
          price: "$49–$99/mo",
          detail: "Optional. Vercel hosting, SSL, monitoring, content updates.",
        },
      ],
    },
    process: [
      {
        step: "01",
        title: "Tell us about your business",
        detail: "Quick form or call. We pull your Google Business Profile and reviews.",
      },
      {
        step: "02",
        title: "We build the site",
        detail: "Custom design, real copy from your reviews, mobile-first. 5–7 business days for Starter.",
      },
      {
        step: "03",
        title: "You approve, we launch",
        detail: "One round of revisions included. Then live.",
      },
      {
        step: "04",
        title: "Optional ongoing",
        detail: "Hosting, monthly updates, SEO maintenance — only if you want it.",
      },
    ],
    faqs: [
      {
        q: "Do I need to write the content?",
        a: "No. We use your Google reviews, Yelp listing, and existing public info to write the site. You approve before launch.",
      },
      {
        q: "Will it work on Google Maps?",
        a: "Yes. Every Starter includes Google Business Profile setup so you show up on Maps with your real services, hours, and contact info.",
      },
      {
        q: "What if I already have a domain?",
        a: "Use it. We'll wire it up. If you don't have one, .com domains are about $15/year — we can help you grab one.",
      },
    ],
  },
  workflows: {
    slug: "workflows",
    pillar: "Workflows & automation",
    hero: {
      eyebrow: "Service · Workflows",
      title: "Stop doing things",
      accent: "twice.",
      intro:
        "We design and build the operational systems behind your business — quote-to-invoice flows, lead capture, intake forms, integrations between the tools you already use.",
    },
    problem: {
      label: "Where the hours go",
      title: "Most operational work is the same five tasks, repeated.",
      body: "Every business has the same hidden tax: re-keying customer info between tools, copying quotes into invoices, manually triaging inbound leads. The fix isn't a new SaaS. It's a workflow that runs itself.",
    },
    capabilities: [
      "Quote-to-invoice automation",
      "Lead capture → CRM → follow-up sequences",
      "Booking, intake, and client onboarding flows",
      "Integration between SaaS tools (HubSpot, Stripe, Notion, etc.)",
      "Internal dashboards and admin panels",
      "Inbound email parsing and routing",
      "AI-assisted automation (lead scoring, content drafting)",
    ],
    pricing: {
      headline: "Custom-quoted, scope-driven.",
      ranges: [
        {
          name: "Process automation",
          price: "$3K – $8K",
          detail: "2–4 weeks. Most automations land here.",
        },
        {
          name: "AI-assisted workflows",
          price: "$5K – $15K",
          detail: "Add AI to a workflow (e.g. lead scoring, email drafting). Includes Care + API costs.",
        },
        {
          name: "Internal tooling",
          price: "$5K – $20K",
          detail: "Custom admin dashboards, internal apps, multi-user tooling.",
        },
      ],
    },
    process: [
      {
        step: "01",
        title: "Map the current process",
        detail: "We watch you do it. Identify what can be automated.",
      },
      {
        step: "02",
        title: "Design the workflow",
        detail: "Trigger → steps → output. Approval points where humans matter.",
      },
      {
        step: "03",
        title: "Build & integrate",
        detail: "Wire into your existing tools. Test on real data.",
      },
      {
        step: "04",
        title: "Hand off + monitor",
        detail: "Training for your team. Optional Care for ongoing tuning.",
      },
    ],
    faqs: [
      {
        q: "What tools do you integrate with?",
        a: "Most of them. We work with HubSpot, Salesforce, Stripe, Notion, Airtable, Slack, Resend, Twilio, Zapier, n8n, and many others. If your tool has an API, we can integrate.",
      },
      {
        q: "Do you build on Zapier or do you write custom code?",
        a: "Depends on the workflow. For simple flows, Zapier or n8n is faster and cheaper. For anything stateful or volume-sensitive, we write custom code (TypeScript, deployed to Vercel). We'll tell you which is right in discovery.",
      },
      {
        q: "Will I be locked in?",
        a: "No. We use open standards and your existing tools. You own everything we build. Documented handoff at end of project.",
      },
    ],
  },
};

export interface IndustryLanding {
  slug: string;
  industry: string;
  hero: { eyebrow: string; title: string; accent: string; intro: string };
  features: string[];
  faqs: { q: string; a: string }[];
}

export const INDUSTRY_PAGES: Record<string, IndustryLanding> = {
  hvac: {
    slug: "hvac",
    industry: "HVAC",
    hero: {
      eyebrow: "For · HVAC",
      title: "Websites for HVAC techs",
      accent: "who run a real business.",
      intro:
        "Click-to-call buttons that actually convert. Service area pages that rank locally. Reviews pulled live from Google. Built in 5–7 days for $1,495.",
    },
    features: [
      "Emergency service banner with click-to-call (one tap = ringing phone)",
      "Service area pages that rank for 'HVAC repair [city]' searches",
      "Live Google reviews displayed on the site, auto-updated",
      "Google Business Profile setup with services, hours, photos",
      "Mobile-first design — most HVAC searches happen on phones in driveways",
      "Quick quote forms (name + phone + system type → text to your dispatch)",
      "Loads in under 1 second on mobile (Squarespace and WordPress can take 5+)",
    ],
    faqs: [
      {
        q: "Can you integrate with my dispatch software?",
        a: "Yes — for Custom engagements. ServiceTitan, Housecall Pro, Jobber, FieldEdge. We can wire form submissions directly into your dispatch queue.",
      },
      {
        q: "Will the site rank for my city?",
        a: "Local SEO basics are included with every Starter (city + service in title tags, Google Business Profile, reviews, schema markup). For aggressive multi-city ranking, the Custom tier with dedicated service-area pages performs better.",
      },
      {
        q: "Can I update my own hours and services?",
        a: "With Hosting + Updates ($99/mo), yes — we make changes for you within 1–3 business days. If you want self-service editing, that's a Custom tier requirement.",
      },
    ],
  },
  dentists: {
    slug: "dentists",
    industry: "Dental practices",
    hero: {
      eyebrow: "For · Dentists",
      title: "Dental websites that book",
      accent: "new patients.",
      intro:
        "Modern, trust-forward sites for dental practices. New patient acquisition, online booking, insurance verification. Built in 5–7 days for $1,495 (Starter) or custom.",
    },
    features: [
      "Online appointment booking (integrate with NexHealth, LocalMed, or your existing system)",
      "Insurance accepted list with logos",
      "New patient form with insurance verification",
      "Service pages (cleanings, fillings, cosmetic, orthodontics) — each ranks separately",
      "Doctor & team page with bios, photos, credentials",
      "Reviews pulled live from Google with schema markup (helps stars show in search)",
      "HIPAA-aware contact forms (no PHI in form submissions)",
      "Mobile-first design — most dental searches happen on phones",
    ],
    faqs: [
      {
        q: "Are you HIPAA compliant?",
        a: "Our hosting (Vercel) and email (Resend) are not HIPAA-covered by default. For practices needing HIPAA-covered intake forms, we use third-party integrations like NexHealth that ARE HIPAA compliant. We never collect PHI directly.",
      },
      {
        q: "Can you integrate with my practice management software?",
        a: "Yes for Custom engagements. We've integrated with Dentrix, Eaglesoft, Open Dental, and others. Booking integrations are best handled via NexHealth or a similar middleware.",
      },
      {
        q: "Do you handle dental SEO?",
        a: "Local SEO basics are included. For ongoing dental SEO (content, citations, link-building), we partner with specialist agencies — we won't pretend to be SEO-only specialists.",
      },
    ],
  },
  contractors: {
    slug: "contractors",
    industry: "Contractors",
    hero: {
      eyebrow: "For · Contractors",
      title: "Websites for contractors",
      accent: "who let the work speak.",
      intro:
        "Before/after galleries. Service pages that rank locally. Quick-quote forms that text you the lead. Built in 5–7 days for $1,495 — or custom for multi-trade firms.",
    },
    features: [
      "Before/after photo galleries (the highest-converting element on a contractor site)",
      "Service pages for each trade (roofing, siding, painting, etc.) — each ranks separately",
      "Project portfolio with project details, location, timeline",
      "Click-to-call hero on mobile",
      "Quick quote forms with photo upload",
      "Service area pages — rank for 'roofing contractor [city]' across your service zone",
      "Customer reviews pulled live from Google with schema markup",
      "Insurance + license badges (BBB, manufacturer certifications, etc.)",
    ],
    faqs: [
      {
        q: "How do I get the photos onto the site?",
        a: "We accept Dropbox, Google Drive, or text — whatever's easiest. For Starter we use 8–12 of your best photos. Custom engagements include unlimited photos with project metadata.",
      },
      {
        q: "Can you integrate with CompanyCam or similar field tools?",
        a: "Yes for Custom engagements. We've integrated with CompanyCam, JobNimbus, and Buildertrend. New project photos can auto-publish to the site.",
      },
      {
        q: "What about quoting tools?",
        a: "We can integrate with your existing quoting tool, or build custom quote-flow workflows for Custom engagements (e.g. measurement → material lookup → estimate generation). That falls under our Workflows pillar.",
      },
    ],
  },
};
