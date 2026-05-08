# Stratus Creative — Enhancements Roadmap

Companion to [roadmap.md](./roadmap.md). This document tracks the SEO / AEO / conversion enhancements proposed and shipped, plus the research plan for the larger items still parked.

Last updated: May 8, 2026.

---

## Table of contents

1. [Shipped this session](#shipped-this-session)
2. [Built but parked (research before shipping)](#built-but-parked)
3. [Future enhancements ranked by impact](#future-enhancements-ranked-by-impact)
4. [Research plan: Stratus AI chatbot](#research-plan-stratus-ai-chatbot)
5. [Effort + priority key](#effort--priority-key)

---

## Shipped this session

These were the items prioritized and built (May 2026):

### Content
- ✅ **3 additional Notes essays** — published at `/notes`
- ✅ **/vs/squarespace + /vs/wix** comparison pages — captures branded competitor searches
- ✅ **/press kit page** — logo files, brand colors, founder bio, photos
- ✅ **Per-pillar deep landing pages** — `/services/ai-agents`, `/services/local-websites`, `/services/workflows`
- ✅ **Per-industry landing pages** — `/for/hvac`, `/for/dentists`, `/for/contractors`

### Tools
- ✅ **Lead magnet** — *"What Your Website Should Actually Cost in 2026"* at `/resources/website-cost-guide`
- ✅ **/transparency** placeholder — anonymized client cost data structure (live once 5+ AI clients)
- ✅ **/status** placeholder — uptime + incident transparency (live once we have hosted clients)
- ✅ **Case study template** — `/work/[slug]` deep dive structure

### SEO / AEO
- ✅ **LocalBusiness JSON-LD schema** — for "agency near me" searches + Google Business Profile alignment
- ✅ **BreadcrumbList JSON-LD schema** — added to all sub-pages
- ✅ **Article JSON-LD schema** — every Notes post is properly marked up
- ✅ **Offer schema inline on services pages** — direct service ↔ price association for AI assistants
- ✅ **Numerical anchors audit** — all key prices, ranges, and timelines surface as concrete numbers

### Conversion
- ✅ **Save form progress to localStorage** — /start form persists across sessions
- ✅ **Form abandonment tracking** — Vercel Analytics custom events for scroll depth + step completion

### Documentation
- ✅ This file — captures the roadmap going forward
- ✅ Research plan for the AI chatbot (below)

---

## Built but parked

### Stratus AI assistant chatbot (item #2)
**Status:** plan documented below, build deferred.

Decision: needs more thought before building. See [research plan](#research-plan-stratus-ai-chatbot) below for the full design before commit.

---

## Future enhancements ranked by impact

These remain on the backlog. Ordered by likely conversion / SEO impact, with effort sizing.

### 🟢 HIGH IMPACT — next quarter

| # | Item | Why | Effort |
|---|---|---|---|
| 1 | **Cal.com booking widget on /start** | Lets serious prospects skip the email volley. Significant conversion lift. | S |
| 2 | **Stratus AI chatbot** | Eats own dog food + drives conversion. See research plan below. | M–L |
| 9 | **90-second loom video** on home + about | Trust signal — premium agencies show their face | S |
| 22 | **A/B testing** once we have ~500 sessions/week | Test hero, pricing presentation, CTA wording | M |

### 🟡 MEDIUM IMPACT — second quarter

| # | Item | Why | Effort |
|---|---|---|---|
| 8 | **Inline mini cost estimator on /pricing** | Lets prospects play without leaving | M |
| 18 | **Trust signals on Stripe checkout** | Visa/MC/Amex icons, "secure checkout" badge, money-back-7-days line | S |
| 19 | **Recently quoted counter** ("147 estimates this month") | Social proof. Only ship if number is real. | S |

### 🔴 Long-game / when we have clients

| # | Item | Why | Effort |
|---|---|---|---|
| 23 | **Reviews integration** via Google Reviews API | Live testimonials with schema markup | M |
| 24+25 | **Activate /transparency + /status** pages with real data | Trust signal nobody else has. Placeholders shipped — flip them on once we have 5+ AI clients. | S to activate |
| 26 | **Ship case studies** as projects close | `/work/[slug]` template is built — populate it | M each |

### 📚 Content backlog

Each Notes essay is ~600–900 words, opinionated, links to /pricing + /tools/cost-estimator. Three landed this session — keep this rhythm:

- *"How to budget for an AI customer support bot"*
- *"What an AI lead-qualification agent actually costs"*
- *"Squarespace vs custom: when does the upgrade pay back?"*
- *"The case for productized agencies"*
- *"Why agencies hide their pricing (and what that tells you)"*
- *"What we learned shipping Spark Analyzer for $5/user → cents"*

Goal: ship one essay every 2–3 weeks. Each ranks for high-intent search.

### 📰 Per-industry landing pages — backlog

Three landed this session (HVAC, dentists, contractors). Add as we close clients in each vertical:

- `/for/realtors` — buyer-funnel optimization, IDX integration awareness
- `/for/lawyers` — case-type pages, compliance-aware
- `/for/restaurants` — menu, ordering integration awareness
- `/for/medical-practices` — HIPAA-aware messaging
- `/for/landscapers` — service area + before/after galleries
- `/for/financial-advisors` — compliance-aware, FINRA-friendly
- `/for/coaches` — booking-first, content-led

Each takes ~half a day to write well. Ship when industry intent shows up in inbound.

### 🏆 Per-pillar pages — backlog

Three landed (`ai-agents`, `local-websites`, `workflows`). Possible future additions:

- `/services/online-presence-package` — bundled GBP + reviews + content
- `/services/ai-care` — deep dive on the Care tier philosophy

---

## Research plan: Stratus AI chatbot

### What it would do

A small chat widget (bottom-right of every page) that answers prospect questions instantly using Stratus's own pricing, services, and llms.txt content. Non-pushy — opens on click, not on intent. Disappears on /support since that's for existing clients.

### Why it matters

1. **Eats its own dog food.** A studio that builds AI workflows for clients should run one of its own. Demonstrating capability beats describing it.
2. **Conversion path.** Most prospects bounce because they have one specific question. ("Does the Starter include a domain?" "What if I already have a logo?") A chatbot answers that question in <2 seconds and either closes the inquiry or escalates to /start.
3. **AEO compounding.** Conversations become structured Q&A data we can mine for new FAQ entries → which feed back into AI assistant indexing.

### Architecture options

**Option A: AI SDK chat with system prompt**
- Use Vercel AI SDK's `useChat` hook on the frontend
- Server-side route `/api/chat` calls Claude Sonnet 4.6 with a long system prompt containing pricing data, FAQ, services description
- Stream responses
- No vector DB needed — context fits in a single system prompt
- **Pros:** simplest. Ships in 1–2 days. Total cost: ~$5–$30/mo for Stratus volumes.
- **Cons:** no memory across sessions. Can't reference past conversations.

**Option B: AI SDK chat + RAG over llms.txt + Notes**
- Same frontend as A
- Server route uses pgvector (Supabase) to retrieve relevant chunks from llms.txt + Notes posts + pricing page
- Then calls the model with retrieved context
- **Pros:** more accurate as content grows. Self-updating when we add a Notes post.
- **Cons:** more infra (vector DB, embedding pipeline). 1 week of work. ~$70/mo Pinecone or self-hosted pgvector free tier.

**Option C: AI SDK chat + tool calling**
- Same frontend
- Server route gives the model TOOLS: `getPricing(plan)`, `getFAQ(topic)`, `bookCall()`, `runCostEstimator(workflow)`
- Model calls tools to answer with structured data
- **Pros:** most accurate. Can offer to run the cost estimator inline. Can book a call directly.
- **Cons:** most complex. 2 weeks of work. Most expensive ($30–$150/mo at modest volume).

### Recommendation

**Ship Option A first** — proves the concept with low risk. Migrate to C as the product matures. Skip B unless content volume grows past ~50 essays.

### Constraints to design around

- **Trust:** the bot can be wrong. Add disclaimers: "Estimates only — confirm with a human before committing." Always include a "Talk to a human" CTA.
- **Safety:** never let the bot make purchase decisions or accept user payment info. Hand-off any monetary action to a human.
- **Cost ceiling:** hard cap on monthly API spend. Refuse new conversations once cap is hit (with friendly message).
- **Latency:** stream responses. Don't make users wait 5 seconds for the full answer.
- **Mobile-first:** chat widget on mobile is its own UX problem. Build it deliberately.
- **Privacy:** don't log conversations to Stratus's tools without disclosure. Respect user privacy.

### What to build (Option A scope)

```
src/components/chat-widget.tsx          // floating button + chat panel
src/app/api/chat/route.ts               // POST → streams Anthropic response
src/lib/chat-system-prompt.ts           // assembled system prompt
src/lib/chat-rate-limit.ts              // Upstash rate limit + monthly cap
```

The system prompt would include:
- Brand voice and positioning
- Full pricing structure (Starter, Custom, AI Care tiers)
- Common FAQs
- Links to relevant pages (pricing, services, /start, cost estimator)
- Refusal patterns (no purchase decisions, no payment data, escalate to /start for actual project quotes)

### Cost model

| Volume | Model | Estimated /mo |
|---|---|---|
| 100 conversations × 15 turns × ~2K tokens each | Claude Haiku 4.5 | ~$5 |
| 500 conversations × 15 turns × ~2K tokens each | Claude Haiku 4.5 | ~$25 |
| 1000 conversations × 15 turns × ~2K tokens each | Claude Sonnet 4.6 | ~$150 |

Add Care tier (Standard, $399/mo) once it's running. AI Care for our own AI workflow.

### When to build

After we ship 2–3 client AI workflows. We'll have learned the cost patterns and the chatbot becomes part of the proof, not a speculative feature.

### Decision criteria for green-lighting

- ✅ At least 100 unique sessions/week on the marketing site
- ✅ Inbound questions show the same 5–10 patterns repeating
- ✅ At least one paying AI Care client (so we know the Care motion)
- ✅ Vercel Analytics shows /pricing scroll depth dropping mid-page (suggests questions go unanswered)

Once 3 of 4 are true, ship Option A.

---

## Effort + priority key

- **S** — < 1 day
- **M** — 1–3 days
- **L** — 3+ days

Estimates assume AI-assisted development.
