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
  {
    slug: "how-to-budget-for-an-ai-customer-support-bot",
    title: "How to budget for an AI customer support bot",
    date: "2026-05-12",
    description:
      "The real cost breakdown — build, monthly API, and ongoing care — before you sign anything.",
    tags: ["AI", "Pricing"],
    body: `
Every AI support bot has three cost lines. Most agencies quote you one of them.

**Line 1: Build**

This is the one-time fee to design the conversation flow, connect to your knowledge base or documentation, wire up the widget on your site, and test it. For a focused FAQ bot — one product, one team, defined edge cases — this is 10–20 hours of work. At our rates, that's in the $1,500–$3,500 range. A more complex bot (order lookups, CRM integration, handoff to live agent) runs $5,000–$12,000. The build fee is real, but it's not where things go wrong.

**Line 2: Monthly API cost**

This is the line agencies either don't mention or bury in footnotes.

Here's the actual math for a support bot doing 1,000 conversations per month at roughly 3,000 tokens per conversation (system prompt + conversation history + user message + response):

- Claude Haiku: $0.80 per million input tokens, $4 per million output tokens. At 3K tokens average, assuming 2,400 in / 600 out: ~$1.92 input + $1.44 output = **$3.36/month per 1,000 conversations**.
- Claude Sonnet: $3 per million input tokens, $15 per million output tokens. Same token split: ~$7.20 input + $5.40 output = **$12.60/month per 1,000 conversations**.

That's the favorable end of the range. Real conversations are messier. Longer context windows, RAG retrieval chunks added to the prompt, multi-turn conversations with full history — a realistic Sonnet deployment doing 1,000 conversations/month often lands $25–$60/month in API spend, sometimes higher.

At 5,000 conversations/month, you're looking at $125–$300/month on Sonnet. At 15,000 conversations/month, it's a real budget line.

Haiku keeps costs low but handles nuance worse. Sonnet handles nuance well but costs roughly 4x more per conversation. The right answer depends on how often customers ask edge-case questions the bot needs to think through. We model this in discovery before recommending either.

**Line 3: Care (your monthly maintenance)**

A support bot is not a set-and-forget deployment. Knowledge bases change. Products get updated. New edge cases appear. Customers find failure modes the test suite didn't cover. Something drifts.

The question isn't whether the bot needs ongoing attention — it does. The question is who's paying for it and whether that's explicit.

The "support retainer" trap: agencies bundle their time into a "$200/mo retainer" that sounds like it covers everything. Read the contract. In most cases, that covers their availability to respond to tickets, not the API spend, not database hosting, not any proactive monitoring. The API bill still lands on your card.

We separate these explicitly. Our [Care tier](/pricing#care) is our time — $199/month for a bot in the Essential tier, $399 for a production workflow getting regular updates. API spend is always pass-through: you use your own keys, or we manage and bill at cost. There's no markup hidden in a bundled retainer.

**What to ask before you sign**

1. What model does the build use, and why?
2. What's the per-conversation token estimate at my expected volume?
3. Who pays the API bill after launch, and how?
4. What does "ongoing support" actually cover — line by line?

If the agency can't answer all four, they've either built the bot in a cost-blind way or they're planning to absorb a surprise and bill you for it later.

Run the numbers for your volume in 90 seconds at our [cost estimator](/tools/cost-estimator). Bring the output to whatever vendor you're evaluating.
`.trim(),
  },
  {
    slug: "what-an-ai-lead-qualification-agent-actually-costs",
    title: "What an AI lead-qualification agent actually costs",
    date: "2026-05-13",
    description:
      "Lead qualification bots sound cheap until you add up the per-lead API cost, CRM webhooks, and the monitoring bill.",
    tags: ["AI", "Pricing"],
    body: `
A customer support bot runs when someone chooses to open the chat widget. A lead-qualification agent runs on every inbound form submission. That distinction changes the cost math completely.

**What a lead-qual agent actually does**

When a new lead comes in — contact form, landing page, ad click — the agent pulls the submission, makes an LLM call to score and categorize it (product fit, urgency, company size signals, whatever criteria matter to your sales team), then fires a webhook to your CRM to tag and route the lead. Optional: trigger an SMS follow-up via Twilio if the score crosses a threshold.

Three cost lines run every single time a lead comes in.

**Cost line 1: The LLM scoring call**

A well-scoped lead-qual prompt — system instructions plus form fields plus scoring rubric plus structured output — runs around 1,500–2,500 tokens per call. At Claude Haiku rates ($0.80/M input, $4/M output), that's roughly $0.003–$0.005 per lead. At Sonnet ($3/M input, $15/M output), it's $0.006–$0.012 per lead.

At 500 leads/month: Haiku costs about $1.50–$2.50/month in LLM spend. Sonnet costs $3–$6/month.

At 5,000 leads/month: Haiku is $15–$25/month. Sonnet is $30–$60/month.

Those numbers are manageable — until you add the next two lines.

**Cost line 2: CRM webhooks and third-party data enrichment**

The webhook call to your CRM (HubSpot, Salesforce, Pipedrive, whatever) is usually free or included in your plan. But enrichment — looking up the company in Clearbit or Apollo to fill in firmographic data before the LLM scores the lead — can cost $0.01–$0.05 per lookup depending on provider and plan tier.

At 5,000 leads/month with enrichment at $0.02/lead: add $100/month to the stack.

If you're using a reverse IP lookup or real-time LinkedIn enrichment, that number goes higher.

**Cost line 3: SMS follow-up (Twilio)**

Twilio SMS in the US runs about $0.0079 per message outbound. If every qualified lead (let's say 30% of submissions) gets an automated follow-up:

- 500 leads/month × 30% × $0.0079 = **$1.19/month**
- 5,000 leads/month × 30% × $0.0079 = **$11.85/month**

Not huge, but not zero. At 25,000 leads/month — common for e-commerce or high-volume B2C — you're at $59/month just in SMS.

**Why volume sensitivity matters more here than in support bots**

A support bot scales with how often customers have problems. Lead volume scales with how much you spend on ads and how well your site converts. A good paid media campaign can double your inbound leads in a week. If your lead-qual agent is running on a fixed API key with no spend cap, a successful campaign is also a surprise bill.

We always set spend limits and alert thresholds on lead-qual deployments. We also model three scenarios during discovery: your current volume, 3x volume, and 10x volume. If the cost at 10x is a problem, we know before we build, not after.

**The full stack at two volumes**

| Component | 500 leads/mo | 5,000 leads/mo |
|---|---|---|
| LLM scoring (Haiku) | $2/mo | $20/mo |
| CRM webhooks | $0 | $0 |
| Enrichment (optional) | $10/mo | $100/mo |
| SMS follow-up (30%) | $1.19/mo | $11.85/mo |
| **Total (no enrichment)** | **~$3/mo** | **~$32/mo** |
| **Total (with enrichment)** | **~$13/mo** | **~$132/mo** |

The build to set this up — prompt engineering, CRM integration, scoring rubric, testing — is typically $2,500–$6,000 depending on how custom the scoring logic is and how many CRM objects need updating.

Care tier covers ongoing prompt tuning and monitoring. API spend is always pass-through.

You can model your specific volume at our [cost estimator](/tools/cost-estimator). If your numbers look different from these, that's worth understanding before you sign anything.
`.trim(),
  },
  {
    slug: "squarespace-vs-custom-when-does-the-upgrade-pay-back",
    title: "Squarespace vs. custom: when does the upgrade actually pay back?",
    date: "2026-05-14",
    description:
      "Squarespace is fine until it isn't. Here's the honest math on when a custom site is worth it and when it's overkill.",
    tags: ["Web", "Buying guide"],
    body: `
Squarespace is a legitimate product. If you're running a ceramics studio or a solo photography business and your website's main job is to look clean and not embarrass you, Squarespace at $23–$65/month is the right answer. We're not here to upsell you out of it.

But we get asked regularly: "At what point should I get off Squarespace?" The honest answer is a number, not a vibe.

**The math**

Squarespace Business plan: $36/month, billed annually. That's $432/year.

Our Starter custom site: $1,495 one-time. Hosting on Vercel: $20/month ($240/year). Domain: ~$15/year. Total year-one cost: $1,750. Year two onward: $255/year.

Break-even vs. Squarespace: roughly 3 years if you're on the Business plan. Less if you were on a higher Squarespace tier, or if your Squarespace subscription is month-to-month.

That math makes Squarespace look better than it is, because it ignores the non-monetary costs.

**Where Squarespace loses**

**Custom integrations are impossible or painful.** Want to pull in live data from your CRM? Trigger a Zapier workflow on a custom button click? Build a booking flow with custom logic? Squarespace's extension ecosystem is limited, and the platform deliberately restricts code access to protect the template layer. You can add a Code block with some JavaScript, but you're fighting the platform.

**Load times affect local SEO and conversion.** Squarespace generates bloated HTML with a lot of legacy CSS and JavaScript. Google's Core Web Vitals scores for Squarespace sites are consistently worse than for properly-optimized custom sites. For a business competing in local search results — plumbing, HVAC, dentistry, law — page speed is a ranking factor, and ranking is revenue.

**You don't own the code.** If you build your brand on Squarespace's templates and then need to move, you're starting from scratch. Your content migrates; your design and any custom logic you built doesn't. With a custom site, you own the repository. Moving hosts takes an afternoon.

**Where Squarespace wins**

We'll be direct about the cases where we'd tell someone to stay on Squarespace:

- **Truly simple businesses with no growth ambition.** Solo dog groomer, pottery instructor, one-person bookkeeping practice. If the site exists to confirm you're a real business and share your phone number, Squarespace is fine. No integration needs, no SEO competition, no reason to spend $1,495.
- **No budget for custom right now.** Squarespace is better than a bad custom site, and a bad custom site is what you get when someone underbids the work. If the budget isn't there, Squarespace now and custom later is a legitimate plan.
- **You want to edit content yourself frequently.** Squarespace's content editor is excellent. Our custom sites use modern frameworks that require a developer for content changes unless we build a headless CMS layer — which adds cost. If you want to edit your hours or swap a photo every week without calling us, that needs to be in the project scope.

**Three situations where you should stay on Squarespace**

1. You have no integration requirements and no SEO competition in your market.
2. You're less than a year into your business and don't know if the model works yet.
3. You need to update content constantly and aren't willing to pay for a CMS layer.

**Three situations where you should upgrade**

1. You're losing local SEO rankings to competitors with faster sites and you've confirmed page speed is a factor.
2. You need a custom integration — booking system, CRM webhook, lead scoring, e-commerce with non-standard checkout logic — and Squarespace's plugin library doesn't cover it.
3. You're growing past a single location or service area and need pages that scale without managing them manually.

If you're in situation 1, 2, or 3 from the second list, the custom build pays back in months, not years — because the alternative is revenue you're not capturing.

You can see exactly what's in our Starter and Custom tiers at [/pricing](/pricing). No tier designed to sell you up the ladder.
`.trim(),
  },
  {
    slug: "the-case-for-productized-agencies",
    title: "The case for productized agencies",
    date: "2026-05-15",
    description:
      "Custom scoping kills most small agency engagements before they start. Productized work is how you actually get what you paid for.",
    tags: ["Strategy", "Pricing"],
    body: `
Most agency engagements for small and mid-size businesses die the same way: the client isn't sure what they're buying, the agency isn't sure what they're selling, and both parties discover the gap somewhere around the 60% completion mark.

At that point, one of three things happens: the agency eats cost to finish, the client pays more than they expected, or the project limps to a launch that satisfies nobody. All three are common.

The root cause is custom scoping.

**Why agencies custom-scope everything**

It's not because every project is genuinely unique. It's because custom scoping has two advantages for the agency:

First, it maximizes the quote. When you don't have a fixed deliverable, you can charge for discovery, strategy, wireframes, revisions, "stakeholder alignment," and anything else that sounds like work. The client can't compare you to another agency on price because no two quotes are for the same thing.

Second, it creates scope flexibility. If the project runs long, the agency can point to something the client changed or added and charge for it. If the client pushes back, the agency can argue the change was outside the original scope. When the original scope was vague, both sides are right, and the dispute is mostly about who has more leverage.

None of this is in the client's interest.

**What productized agencies do differently**

A productized agency defines the deliverable before any money changes hands. Not "a website," but: a five-section, single-page site with custom design, content extraction from your Google Business Profile and reviews, mobile-first responsive build, click-to-call, schema markup, and Vercel hosting. Ships in 5–7 business days. $1,495.

The client knows what they're buying. The agency knows what they're building. There's no gap to discover at 60%.

This only works under three conditions, and all three have to hold simultaneously:

**1. Tight operations.** A productized deliverable has to fit a known, repeatable workflow. If every site takes a different amount of time because the process is different each time, the price is unpredictable. We can only quote $1,495 because we know the Starter workflow takes 8–12 hours. That knowledge came from doing it enough times to trust the number.

**2. Scope discipline.** The hardest part. A client wants one more page, one more integration, one more revision round. The correct answer for a productized shop is: "That takes it out of the Starter scope. Here's what a Custom engagement would cost." Not "sure, no problem" — that's how flat rates become losses. Not "we'll add it to your invoice" — that's how clients feel ambushed. Just a clean redirect to the appropriate tier.

**3. No discounts.** A productized price is only sustainable if the margin at that price is real. The moment you discount to win a deal, you're negotiating scope in reverse. We've never discounted a Starter. The price is the price because the math only works at the price.

**What it costs the agency**

Productization trades upside for predictability. We don't capture the client who would have paid $3,000 for a Starter if we'd custom-scoped it. That margin goes away.

What we get back: no discovery calls that go nowhere, no proposals that take three hours to write and get ghosted, no scope disputes at 60%, no projects that stall because the client can't make decisions about things they didn't know they'd need to decide.

The operational savings are real. Discovery, proposaling, and scope management easily eat 20–30% of the billable time on a custom engagement. We put that time into building instead.

**What this means for clients**

If an agency won't tell you exactly what you're getting before you sign, scope creep is not a risk — it's the plan. The vagueness is structural, not accidental. Custom scoping creates the conditions where additional charges are easier to justify and harder to dispute.

Productized agencies remove that leverage. What you see in [/pricing](/pricing) is what you get.
`.trim(),
  },
  {
    slug: "why-agencies-hide-their-pricing",
    title: "Why agencies hide their pricing (and what that tells you)",
    date: "2026-05-16",
    description:
      "\"Contact us for a quote\" is not a business model — it's a negotiation tactic. Here's what's actually behind it.",
    tags: ["Strategy", "Buying guide"],
    body: `
Most agency websites follow the same pattern: portfolio, services page, vague value propositions, and then a "Contact us for a quote" CTA where the pricing would be. You're supposed to get on a call, describe your needs, and wait for a number.

There are four real reasons agencies do this, and only one of them is slightly defensible.

**Reason 1: Anchoring — they want your budget before they name a number**

This is the main one. If you tell them your budget is $15,000, the quote is $14,500. If you tell them it's $5,000, the quote is $4,800 and the scope is thinner. The discovery call isn't about understanding your needs — it's about calibrating the number to what you'll say yes to.

Professional buyers know this and say nothing on budget. Small business owners usually don't know this and share their number early because it feels like being helpful. The agency then quotes to the ceiling.

Transparent pricing removes this entirely. The number is the number before the call starts.

**Reason 2: Scope as a variable — they need room to move**

When the deliverable is vague, the scope is negotiable after the fact. A "custom website" can be a five-page build or a twenty-page build depending on how the project goes. Pricing without a defined deliverable gives the agency flexibility to expand scope, bill for additions, and dispute what's "extra" and what's "included."

This isn't always cynical — genuinely complex projects do require discovery before pricing. A custom SaaS product, a multi-location e-commerce platform, a manufacturing data integration — these legitimately can't be quoted without understanding the requirements.

But a five-page marketing site for a local business? That's been quoted a thousand times. The agency knows what it costs. They're not hiding the price because they haven't figured it out.

**Reason 3: Competitor protection — they don't want to be shopped on price**

If they post a number, you can compare it to every other agency's number without ever talking to them. That's scary for an agency whose competitive advantage is the sales call — the pitch, the personality, the case studies they walk you through. Force you into a conversation and they can sell. Post a price and they're a commodity.

This is a real business strategy. It's also an admission that they believe the price is hard to justify on its own.

**Reason 4: They actually don't know yet**

For some agencies, the honest answer is that they don't have standardized workflows or a repeatable process. Every project is actually bespoke because they haven't built the operations to make it repeatable. The quote depends on who's available, how complex the client seems, and what other projects are in the queue.

This is the only defensible version. But it's also the most worrying one from the client's perspective — if they can't price it before the work starts, they can't manage it during.

**What transparent pricing requires**

Posting a real number means the agency has committed to a margin at that number. That requires:

- Knowing how long each type of engagement actually takes
- Having a process tight enough to trust that it'll take the same amount of time next time
- The discipline to hold the line on scope when projects drift
- The confidence not to discount to win deals

Most agencies don't have all four. The ones that do post prices. The ones that don't send you to a discovery call.

**What hiding pricing tells you**

It tells you the agency is optimizing for their margin, not your clarity. That's not automatically disqualifying — lots of honest businesses negotiate pricing — but it's a data point.

It also means your first interaction is a negotiation, not a conversation. Before you've learned anything about whether they're good at the work, you're already playing a game about numbers.

We post our prices at [/pricing](/pricing) because we've done the work of knowing what things cost and we're not interested in the anchoring game. If the number doesn't work for you, that's useful information for both of us — and you didn't have to get on a call to find out.
`.trim(),
  },
  {
    slug: "what-we-learned-shipping-spark-analyzer",
    title: "What we learned shipping Spark Analyzer for $5/user → cents",
    date: "2026-05-17",
    description:
      "How we cut per-analysis cost by 98% on a real AI product — and what that taught us about pricing AI workflows for clients.",
    tags: ["AI", "Case study"],
    body: `
Spark Analyzer is an AI-powered diagnostics tool for Minecraft server administrators. It takes a Spark profiler report — a detailed snapshot of server performance — and explains what's wrong in plain language, why it matters, and what to fix. We built it, shipped it, and it now has 500+ registered users and has processed 400+ diagnostic reports.

The first version was embarrassingly expensive to run.

**How we started: $5–$7 per analysis**

Early Spark Analyzer sent the raw Spark report file directly to GPT-4 for analysis. Spark reports are detailed. A typical report includes thread traces, method timings, entity counts, plugin call stacks, tick rate graphs — a moderately complex server generates a file that runs 50,000–150,000 tokens when serialized naively.

At GPT-4 pricing at the time, a single analysis cost $5–$7 in API spend. At 400 analyses, that's a $2,000–$2,800 API bill just to get to where we are now. That math doesn't work at scale. At 10,000 analyses/month — a realistic growth target — it's a $50,000–$70,000/month model bill. The product would be unshippable.

We knew we had to fix this before growth made it worse.

**What we actually changed**

Three things, in order of impact:

**1. Pre-processing pipeline (90% token reduction)**

Instead of sending the raw report, we built a pre-processing layer that extracts the signal before the LLM call. The key metrics for a performance diagnosis — worst-offending methods, entity counts above threshold, tick rate drops, plugin call frequency, memory pressure indicators — can be extracted with deterministic code. A rule-based parser pulls the top 20 signals from any Spark report in milliseconds.

The LLM now receives a structured summary: ~2,000–4,000 tokens instead of 50,000–150,000. The analysis quality held. The cost dropped by roughly 90%.

**2. Model routing (simple vs. complex)**

Not all server problems require the same reasoning depth. A server running 40 plugins with a single obvious offender (a poorly optimized world generator consuming 70% of tick time) is a simple analysis — the answer is unambiguous. A server with diffuse performance problems across 15 plugins and unusual entity behavior requires more nuanced reasoning.

We built a lightweight classifier that runs before the main LLM call. Simple reports route to Claude Haiku ($0.80/M input). Complex reports route to Claude Sonnet ($3/M input). Roughly 60–70% of reports are simple. The cost difference between routing and sending everything to Sonnet is substantial at volume.

**3. Prompt caching for the system prompt**

The system prompt for Spark Analyzer is detailed — it includes Minecraft-specific performance context, interpretation guidelines, output formatting instructions, and examples. It's the same across every analysis. We implemented prompt caching so the system prompt is only billed at full price on the first call in each context window; subsequent calls within the cache TTL are billed at 90% discount.

At 400+ analyses, this alone saves a meaningful percentage of the input token bill.

**What it costs now**

The per-analysis cost today is in the range of $0.02–$0.12 depending on report complexity and whether the analysis hits a warm cache. The $5–$7 number is gone. The business is sustainable through meaningful scale.

**What this means for clients**

Every AI workflow we see built by agencies — support bots, lead-qualification agents, document processors, email triagers — has this optimization problem lurking in it.

The agencies that don't know about it quote a model bill based on naive token counting. They send full documents to the LLM. They route everything to the most capable (most expensive) model. They don't implement caching. They don't build a pre-processing layer. The workflow works in demo, and the cost is only visible at production volume.

The model bill isn't a fixed cost. It's an engineering problem. The gap between an unoptimized AI workflow and an optimized one is often 80–95% in API spend, which at any real volume is the difference between a sustainable product and one that's quietly underwater.

Any AI workflow we build at Stratus includes this optimization layer as part of the build. Our [Care tier](/pricing#care) includes ongoing monitoring and optimization as usage patterns evolve — because caching hit rates, model routing thresholds, and pre-processing rules all need tuning as real usage data comes in.

If you've been quoted a monthly API cost for an AI workflow and it was based on "X tokens per call × Y calls per month," run that number through our [cost estimator](/tools/cost-estimator) and then ask the agency what their optimization plan is. If they don't have one, the real number is worse.
`.trim(),
  },
];

export function getNote(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug);
}
