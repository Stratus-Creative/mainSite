export interface Note {
  slug: string;
  title: string;
  date: string; // ISO
  description: string;
  tags: string[];
  body: string;
}

export const NOTES: Note[] = [
  {
    slug: "the-real-cost-of-an-ai-agent",
    title: "The real cost of an AI agent",
    date: "2026-05-08",
    description:
      "Most agencies quote $10K and quietly absorb the API spend until it kills the project. Here's the math we wish we'd seen earlier.",
    tags: ["AI", "Pricing"],
    body: `
We've watched a lot of agencies sell "AI agents" for $5K–$25K, then go quiet six months later. The build looked fine. The demo worked. The model bill didn't.

There are three things that cost money on every AI workflow:

**1. Build time** — already covered by the build fee.

**2. LLM API calls** — variable, recurring. GPT-4o is $2.50 per million input tokens and $10 per million output. Claude Sonnet 4.6 is $3 in / $15 out. A customer support bot doing 800 conversations a month at 2,500 tokens in / 400 out per turn racks up real money fast — easily $30–$150/mo on Sonnet, more on Opus.

**3. Third-party API calls** — VIN lookups, telephony, transcription, web scraping, vector storage. Often more than the LLM. A voice agent stack (Twilio + transcription + TTS + LLM) can cross $0.50/minute on its own.

The pattern we see in failing AI engagements is the agency builds the workflow, hands it over, and tries to fold the recurring cost into a "$200/mo support retainer." That covers the agency's time. It doesn't cover $400/mo of API spend nobody warned the client about.

**What we do instead:**
- Three explicit lines on every AI quote: build (one-time), Care (recurring, our time), API (recurring, pass-through).
- Care tiers scale with workflow complexity ($199 / $399 / $899/mo). A voice agent doesn't get the FAQ-bot Care tier.
- API costs are always pass-through. Client uses their own keys, or we manage and bill at-cost + 15% admin.
- Volume sensitivity is part of the discovery call. We model what happens at 100/500/5,000 requests/mo before signing anything.

If you're shopping for an AI workflow and the agency hasn't told you what it costs to run, that's not because it's small. It's because they don't know yet, and they're hoping you won't either.

You can run the math yourself in 90 seconds at our [free cost estimator](/tools/cost-estimator). Bring the result to whoever you're talking to and watch the conversation get useful.
`.trim(),
  },
  {
    slug: "what-ten-thousand-dollar-websites-actually-buy-you",
    title: "What $10,000 marketing-firm websites actually buy you",
    date: "2026-05-09",
    description:
      "Most local businesses pay agency rates for template-grade work. Here's what the markup actually pays for, and what it doesn't.",
    tags: ["Pricing", "Web"],
    body: `
A plumbing company we talked to last month was three weeks into a $9,500 website project with a regional marketing firm. They sent us the proposal. It was four pages, all bullet points. Every page had vague phrases like "professional design," "industry-standard SEO," and "mobile responsive."

The actual deliverable was a six-page WordPress site with a customized template, three stock photos, a contact form, and "monthly reporting" — meaning a screenshot of Google Analytics emailed once a month.

This is most of the local marketing-firm market. So what does the $10,000 actually pay for?

**1. Account management overhead.** A real chunk of any agency budget pays for the project manager, the account executive, and the meeting cadence. None of that touches your website. It's organizational fat that exists because the agency has 30 clients and needs to coordinate.

**2. Subcontractor margin.** Many regional firms outsource the actual build to overseas developers and mark it up 3–5x. The site you get costs them $1,500. You pay $9,500.

**3. "Strategy."** A discovery doc, a brand questionnaire, a sitemap diagram. Sometimes these matter — for genuinely complex businesses. For a single-location plumber serving one metro area, they're mostly theater.

**4. Theme licensing + hosting bundle.** Most $10K agencies use commercial WordPress themes (~$60 license), bundle in hosting at a 5–10x markup, and lock you into a multi-year contract. Try to leave and you'll find your site can't easily be migrated.

**What it actually costs to build a real website in 2026**

A single-page, mobile-first, fast-loading, SEO-clean website with custom design (not a template) and integrated Google Business Profile + reviews can be built well in 8–12 hours by someone who knows what they're doing. At a fair labor rate, that's $1,200–$2,500. Add hosting (Vercel: $20/mo), SSL (free, Let's Encrypt), and a domain (~$15/year), and you've got everything you actually need.

That's why our [Starter](/pricing#starter) is $1,495 flat. It's not "discount" — it's the actual cost of doing the work without bloat.

**When the markup IS worth it**

To be fair: there are real situations where a bigger agency engagement pays back.

- **Multi-location chains** with 50+ locations needing custom location pages — that's real architecture work.
- **Regulated industries** (healthcare, finance, legal) where compliance copywriting is non-trivial.
- **High-traffic e-commerce** with inventory, payments, fulfillment, customer support workflows.
- **Brand systems** for businesses scaling past $10M in revenue and competing on brand.

But none of that describes a local plumber, electrician, or HVAC business. They get a template, the same content their competitors got, and a five-figure invoice.

If that's you, [run the math](/tools/cost-estimator) and ask the agency to itemize what you're paying for. The conversation usually doesn't last long.
`.trim(),
  },
  {
    slug: "what-to-ask-an-agency-before-signing",
    title: "What to ask a web agency before you sign anything",
    date: "2026-05-10",
    description:
      "A short, honest list of questions that filter the agencies who deserve your money from the ones who don't.",
    tags: ["Buying guide", "Web"],
    body: `
We get inbound from prospects who are mid-evaluation with two or three other agencies. They ask us what to look for. Here's the list we send.

These aren't trick questions. A serious agency answers them quickly. A non-serious one fumbles through them, gets defensive, or sends you to a "discovery call" before they'll commit to a number.

**1. Can I see the actual code/templates you'd use, before I sign?**

If they say "every project is custom" but won't show their stack, that's a red flag. Real agencies have an opinionated, well-tested foundation they reuse. They should be proud to show it.

**2. What does the site cost to host and maintain after you build it?**

The build fee is the easy part. Ongoing cost is where most agencies hide the bill. Demand specifics: hosting per month, SSL, security updates, backup strategy, what happens when WordPress core updates and breaks something. If they shrug and say "we'll take care of it for $X/mo" without a line-item, the line-item is the problem.

**3. Who actually does the work? In-house, freelance, or offshore?**

Doesn't have to be in-house — but you should know. Offshore-built sites aren't bad by default, but you should know who's accountable when something breaks at 2am.

**4. What does the contract say about ownership?**

Your domain, your content, your photos, your code. You should own all of it. Some agencies retain rights to "their" templates and require ongoing fees just to keep your site live. Read the contract and ask: *"If I leave you tomorrow, what do I keep?"*

**5. What's the actual delivery timeline, in business days?**

Most agencies promise "4–6 weeks" and ship in 12. Demand a deliverable schedule with checkpoints. If they can't commit to a date, they don't have a process.

**6. What happens after launch?**

Specifically: free changes window (most should offer 30 days), what counts as a "change" vs. "new feature," monthly maintenance scope, support response time. Get this in writing.

**7. Can you give me three references from the past 12 months?**

Real agencies have happy recent clients. If they only show case studies from 3+ years ago, ask why. (Common answer: clients churned and they don't want to admit it.)

**8. What does your site cost?**

If their own marketing site is built on a Webflow template they didn't customize, they're not the agency that's going to build you something custom. Watch how they handle the question — defensiveness here is diagnostic.

**9. Do you charge by the hour, by the project, or by the milestone?**

Hourly billing rewards inefficiency. Milestone billing aligns incentives. Project pricing is fine if the scope is well-defined. Avoid agencies that won't commit to either a fixed scope or a fixed budget.

**10. What's the worst project you've had in the past year, and what went wrong?**

This is the one that separates real agencies from sales-driven ones. A real agency answers it without flinching: *"We over-promised on a launch date and ate the cost." "We had a scope misunderstanding and had to re-do a section." "A client fired us at 80% completion."* That's normal. An agency that says "no, all our projects go great" is hiding something — or hasn't shipped enough work to have learned anything.

---

We answer all ten of these without hedging. If the agency you're talking to can't, you've already learned something valuable.

If you want to use this as a checklist on your next call, [save the questions](/notes/what-to-ask-an-agency-before-signing) and bring them. We'd rather you find a great agency that isn't us than overpay for one that's flashier.
`.trim(),
  },
  {
    slug: "why-flat-rate-starter-sites",
    title: "Why we charge a flat rate for starter sites",
    date: "2026-05-11",
    description:
      "Three-tier pricing ladders are a sales tactic. Flat-rate productized work isn't. Here's why we picked one and what it costs us.",
    tags: ["Pricing", "Strategy"],
    body: `
The default playbook for agencies and SaaS companies is the three-tier pricing ladder. Essential / Professional / Premium. $1,250 / $2,500 / $4,250. Most-popular badge on the middle tier. Optional add-ons stacked underneath.

We had this exact structure six weeks ago. We replaced it with one flat price ($1,495) and a single "Custom from $5,000" path.

Here's why.

**Three tiers exist to push you up the ladder, not to fit the work.**

If your business actually has three legitimate tiers of service, fine. But for productized small-business websites? The "Essential" was a teaser. The "Premium" was overkill. The "Most Popular" badge on Professional was a manufactured anchor, not a market signal. The whole structure existed because conversion-rate optimization decks said it would lift average order value 15–22%.

It probably did. It also introduced decision paralysis: now every prospect spent their first call agonizing over whether they were "Essential or Professional," which is a question we couldn't actually answer for them because the differences were arbitrary.

**Productized means productized.**

If we're going to call something a productized service, it has to actually be a product — same scope, same deliverable, same price for everyone who buys it. The Starter is a single-page site with content sourced from public reviews, GBP integration, click-to-call, mobile-first responsive design, and basic SEO. Ships in 5–7 business days. $1,495.

It works for plumbers. It works for solo consultants. It works for anyone whose business doesn't have specific needs that can't be served by a single-page presence. It doesn't work for businesses with five service areas, a team page, an in-house tooling integration, or a custom workflow. Those are Custom engagements, quoted per project.

That's two paths. Not five.

**The catch nobody tells you about flat-rate productized work**

Flat rate is a margin promise we make to ourselves, not to the client. It only works if:

1. **Our process is tight.** Every Starter we ship has to fit a known workflow. Custom design plus prompt engineering for content extraction plus hosting setup plus QA, all in under 12 hours of total time. We can't afford a "this Starter is taking forever" project — the math falls apart.

2. **We say no when the scope drifts.** A Starter client wants three extra pages mid-build? That's not a Starter anymore. We quote it as Custom or politely decline. Holding the line is the whole game.

3. **We don't run discounts.** Flat rate at $1,495 only stays sustainable if we never sell a Starter for $1,000 to "win" a deal. The price is the price.

**What it costs us**

We give up some upside. A three-tier ladder would let us charge more to clients who'd happily pay more. We don't capture that. The trade-off: simpler conversations, faster delivery, and a clearer brand promise. We think it's worth it.

If you're an agency considering this, the question is whether your operations can hold the line on scope. If they can't, three tiers will let you absorb the chaos. If they can, flat rate is a much better business.

You can [see what's actually included in the Starter](/pricing#starter) — it's the whole list, no upsell.
`.trim(),
  },
];

export function getNote(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug);
}
