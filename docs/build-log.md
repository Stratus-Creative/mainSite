# Stratus Creative — Build Log

Comprehensive record of everything built across this session — pages, components, infrastructure, content, and what's still pending.

Last updated: May 8, 2026.

---

## What this site is now

A 30+ page Dark Editorial creative agency site for Stratus Creative — a one-person studio building websites, workflows, and AI agents. Built on Next.js 16 + Tailwind v4 + shadcn/ui, deployed to Vercel, with full SEO/AEO infrastructure and a complete conversion stack.

---

## Pages shipped

### Core

| Route | Purpose |
|---|---|
| [/](src/app/page.tsx) | Home — hero with capacity scarcity badge, inline 3-question FAQ, three pillars, free-tool callout, trust strip, manifesto, process, pricing teaser, final CTA |
| [/about](src/app/about/page.tsx) | About — founder photo (live: `/Founder.jpg`), bio with signature, four principles, trust strip, clients placeholder |
| [/services](src/app/services/page.tsx) | Services overview — three pillars deep, "What we don't do" section with 6 honest refusals |
| [/pricing](src/app/pricing/page.tsx) | Pricing — Starter $1,495 + Custom from $5K + "in between" capture + comparison anchors + 7-day money-back guarantee + AI Care 3-tier + How AI Workflows Are Priced explainer + FAQ |
| [/work](src/app/work/page.tsx) | Work — in-flight projects + "case studies coming as we ship" honest placeholder |
| [/start](src/app/start/page.tsx) | Start a project — full form with project type, budget, contact pref (Email/Text/Either), 4-hour response promise, localStorage progress save, estimator pre-fill |
| [/support](src/app/support/page.tsx) | Existing-client support FAQ + ticket form |

### Per-pillar deep landing pages

| Route | Pillar |
|---|---|
| [/services/ai-agents](src/app/services/[pillar]/page.tsx) | AI agents & workflows |
| [/services/local-websites](src/app/services/[pillar]/page.tsx) | Local-business websites |
| [/services/workflows](src/app/services/[pillar]/page.tsx) | Workflows & automation |

### Per-industry landing pages

| Route | Industry |
|---|---|
| [/for/hvac](src/app/for/[industry]/page.tsx) | HVAC |
| [/for/dentists](src/app/for/[industry]/page.tsx) | Dental practices |
| [/for/contractors](src/app/for/[industry]/page.tsx) | Contractors |

### Comparison pages

| Route | Competitor |
|---|---|
| [/vs/squarespace](src/app/vs/[competitor]/page.tsx) | Squarespace |
| [/vs/wix](src/app/vs/[competitor]/page.tsx) | Wix |

### Notes / blog

| Route | Title |
|---|---|
| [/notes](src/app/notes/page.tsx) | Blog index |
| [/notes/the-real-cost-of-an-ai-agent](src/app/notes/[slug]/page.tsx) | The real cost of an AI agent |
| [/notes/what-ten-thousand-dollar-websites-actually-buy-you](src/app/notes/[slug]/page.tsx) | What $10K marketing-firm websites actually buy you |
| [/notes/what-to-ask-an-agency-before-signing](src/app/notes/[slug]/page.tsx) | What to ask a web agency before signing |
| [/notes/why-flat-rate-starter-sites](src/app/notes/[slug]/page.tsx) | Why we charge a flat rate for starter sites |

### Tools

| Route | Purpose |
|---|---|
| [/tools](src/app/tools/page.tsx) | Tools index |
| [/tools/cost-estimator](src/app/tools/cost-estimator/page.tsx) | AI workflow cost estimator (9 models, 7 templates, latency, model comparison, volume sensitivity, workflow visualizer, prompt cache, copy/share, "Discuss this estimate" pre-fills /start) |

### Resources / lead magnets

| Route | Purpose |
|---|---|
| [/resources/website-cost-guide](src/app/resources/website-cost-guide/page.tsx) | Free PDF guide — "What Your Website Should Actually Cost in 2026" with print-to-PDF button |
| [/resources/free-website-audit](src/app/resources/free-website-audit/page.tsx) | Free 15-min Loom audit lead magnet with concern selector form |

### Trust / transparency

| Route | Purpose |
|---|---|
| [/transparency](src/app/transparency/page.tsx) | Live cost data placeholder (activates with 5+ AI clients) |
| [/status](src/app/status/page.tsx) | Uptime page + incident log |
| [/testimonials](src/app/testimonials/page.tsx) | Empty-state honest placeholder; fills in as projects ship |
| [/roadmap](src/app/roadmap/page.tsx) | Public roadmap — Now / Next / Later / Parked |
| [/press](src/app/press/page.tsx) | Press kit — quick facts, founder bio, brand colors |
| [/work/[slug]](src/app/work/[slug]/page.tsx) | Case study template (ready when first ships) |

### Legal + utility

| Route |
|---|
| [/privacy](src/app/privacy/page.tsx) |
| [/terms](src/app/terms/page.tsx) |
| [/success](src/app/success/page.tsx) |
| [/cancel](src/app/cancel/page.tsx) |
| [Custom 404](src/app/not-found.tsx) — `/anything-not-found` |

---

## Components built

### Layout & nav
- [src/components/site-header.tsx](src/components/site-header.tsx) — sticky header with active-path highlighting
- [src/components/site-footer.tsx](src/components/site-footer.tsx) — three-column footer (Studio / Tools & notes / Legal)
- [src/components/floating-cta.tsx](src/components/floating-cta.tsx) — fixed-position "Start a project" button after 70% scroll
- [src/components/trust-strip.tsx](src/components/trust-strip.tsx) — tools we use grid + clients placeholder variant

### Forms
- [src/components/start-form.tsx](src/components/start-form.tsx) — main contact form with localStorage save, estimator pre-fill, contact prefs, restore banner
- [src/components/contact-form.tsx](src/components/contact-form.tsx) — older simple form, kept for compatibility
- [src/components/audit-form.tsx](src/components/audit-form.tsx) — free audit request form with concern selector
- [src/components/support-form.tsx](src/components/support-form.tsx) — existing-client support form
- [src/components/support-faq.tsx](src/components/support-faq.tsx) — accordion FAQ
- [src/components/newsletter-signup.tsx](src/components/newsletter-signup.tsx) — newsletter signup at end of every Notes post

### Cost estimator
- [src/components/cost-estimator-form.tsx](src/components/cost-estimator-form.tsx) — interactive estimator UI
- [src/lib/cost-estimator.ts](src/lib/cost-estimator.ts) — pure pricing logic + workflow templates + model data

### Conversion / interactivity
- [src/components/home-hero-faq.tsx](src/components/home-hero-faq.tsx) — accordion of top 3 prospect questions
- [src/components/clarity-script.tsx](src/components/clarity-script.tsx) — Microsoft Clarity heatmap integration
- [src/components/print-button.tsx](src/components/print-button.tsx) — client-side print trigger
- [src/components/checkout-button.tsx](src/components/checkout-button.tsx) — Stripe checkout integration
- [src/components/link-button.tsx](src/components/link-button.tsx) — anchor styled as button

### Structured data
- [src/components/structured-data.tsx](src/components/structured-data.tsx) — JSON-LD components: Organization, WebSite, LocalBusiness, Service catalog, WebApplication, FAQPage, BreadcrumbList, Article

### Settings & data
- [src/lib/site-settings.ts](src/lib/site-settings.ts) — global settings (capacity, founder photo path, response promise, Clarity ID)
- [src/lib/notes-data.ts](src/lib/notes-data.ts) — all 4 Notes essays
- [src/lib/comparison-data.ts](src/lib/comparison-data.ts) — Squarespace + Wix comparison data
- [src/lib/landing-data.ts](src/lib/landing-data.ts) — per-pillar + per-industry landing copy
- [src/lib/case-studies-data.ts](src/lib/case-studies-data.ts) — case study data store (empty, ready)
- [src/lib/faq-data.ts](src/lib/faq-data.ts) — support FAQ data

---

## API routes

| Route | Purpose |
|---|---|
| [/api/contact](src/app/api/contact/route.ts) | Contact + audit form submissions (Resend email) |
| [/api/checkout](src/app/api/checkout/route.ts) | Stripe checkout session creator (Starter $1,495, hosting plans) |
| [/api/customer-portal](src/app/api/customer-portal/route.ts) | Stripe customer portal redirect |
| [/api/webhooks/stripe](src/app/api/webhooks/stripe/route.ts) | Stripe webhook handler |
| [/api/support](src/app/api/support/route.ts) | Support ticket submission |
| [/api/newsletter](src/app/api/newsletter/route.ts) | Newsletter signup (Resend audience) |

---

## Design system

### Theme — Dark Editorial
- **Background:** `oklch(0.18 0 0)` — deep charcoal, not pure black
- **Foreground:** `oklch(0.98 0 0)` — near-white
- **Card:** `oklch(0.22 0 0)` — clear lift from background
- **Muted text:** `oklch(0.78 0 0)` — legible at small sizes
- **Accent:** `oklch(0.68 0.14 250)` — refined cobalt blue (≈ `#7894E8`)

### Typography
- **Sans (primary):** Geist (Google Fonts)
- **Mono (labels, code):** Geist Mono
- **Serif (italic accent only):** Instrument Serif — used sparingly on home hero ("online presence") and footer ("worth showing")

### CSS utilities (in [globals.css](src/app/globals.css))
- `.editorial-grid` — subtle background grid overlay
- `.section-label` — uppercase mono label with leading rule
- `.display-heading` — bold tight-leading headlines
- `.serif-accent` — Instrument Serif italic
- `.underline-hover` — animated underline on hover
- Custom number input styling (hide native spinners, custom +/- via JSX)

---

## SEO / AEO infrastructure

### Crawlers + indexing
- **[robots.txt](public/robots.txt)** — explicitly allows GPTBot, ClaudeBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, Bytespider, CCBot, cohere-ai, MistralAI-User, Meta-ExternalAgent, etc.
- **[llms.txt](public/llms.txt)** — AEO-friendly summary of every page, every price, every service
- **[sitemap.ts](src/app/sitemap.ts)** — dynamic sitemap with all 30+ routes (auto-regenerates as Notes/case-studies grow)

### JSON-LD structured data
- ProfessionalService + Organization (every page)
- WebSite (every page)
- LocalBusiness with geo, hours, area served (every page)
- Service catalog with 7 Offers — Starter, Custom, AI Care Light/Standard/Pro, Hosting Basic, Hosting+Updates (pricing page)
- WebApplication (cost estimator page)
- FAQPage (pricing, support, services, per-pillar pages)
- Article (every Notes post — headline, datePublished, author, publisher, keywords)
- BreadcrumbList (Notes posts; extensible)

### Metadata
- `metadataBase` set
- Per-page `title`, `description`, `keywords`, canonical URLs
- OG tags + Twitter cards
- Custom OG image generator at `/opengraph-image` (programmatic PNG via `next/og`)
- Robots directives for max-image-preview/max-snippet

---

## Conversion infrastructure

### Active
- **Stripe self-serve checkout** for Starter ($1,495) + Hosting plans
- **Cost estimator** with "Discuss this estimate" deep-link to /start (URL-encoded summary)
- **/start form** with localStorage progress save, draft restore banner, contact prefs
- **Floating "Start" CTA** on every page after 70% scroll
- **Inline 3-question FAQ** on home hero
- **Free 15-min audit** lead magnet at /resources/free-website-audit
- **Free PDF cost guide** at /resources/website-cost-guide
- **Newsletter signup** at end of every Notes post
- **7-day money-back guarantee** badge on Starter
- **Comparison anchors** ("$1,495 vs $5,000–$10,000 at typical agencies")
- **Capacity scarcity** badge on home hero ("2 Custom slots this quarter") — driven by `SITE_SETTINGS.customSlotsThisQuarter`
- **4-hour response promise** in /start
- **"What we don't do"** section on /services — counterintuitive credibility
- **Microsoft Clarity** ready (just needs project ID env var)
- **Vercel Analytics** + **Speed Insights** active

### Documented but not built
- **Cal.com booking widget** — held off per user
- **Quote tracker page** — held off (needs backend, designed in conversion-playbook.md)
- **Stratus AI chatbot** — research plan + 3 architecture options in enhancements-roadmap.md
- **Email re-engagement automation** — full design in email-re-engagement-plan.md
- **Founder Loom video** — placeholder hook in site-settings.ts

---

## Documentation written

All in [docs/](docs/):

| File | Purpose |
|---|---|
| [roadmap.md](docs/roadmap.md) | Overall product roadmap (cost estimator + site additions, with effort sizing) |
| [enhancements-roadmap.md](docs/enhancements-roadmap.md) | SEO/AEO/conversion enhancements — what's shipped + future + chatbot research plan |
| [conversion-playbook.md](docs/conversion-playbook.md) | Pure conversion focus — Tier 1/2/3 with effort, "What NOT to do" section, KPIs |
| [email-re-engagement-plan.md](docs/email-re-engagement-plan.md) | Full design for automated drip sequences |
| [build-log.md](docs/build-log.md) | This document |

---

## Things wired but waiting for your action

1. **Microsoft Clarity** — sign up at clarity.microsoft.com (free), get project ID, set `NEXT_PUBLIC_CLARITY_PROJECT_ID=...` in `.env.local`. Heatmaps live next deploy.
2. **Founder photo** — ✅ **DONE** — `Founder.jpg` is live on /about
3. **Founder Loom video** — record 60–90 seconds, embed where you want, set `showFounderVideo: true` in [site-settings.ts](src/lib/site-settings.ts)
4. **Resend audience** — create in Resend dashboard, set `RESEND_AUDIENCE_ID=...` in env. Newsletter signups flow in automatically
5. **Capacity number** — currently shows "2 Custom slots this quarter". Update [site-settings.ts](src/lib/site-settings.ts) as availability shifts. Set to `null` to hide.
6. **Stripe webhook signing secret + product setup** — verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in env
7. **Logo finalization** — currently using "Stratus Creative" wordmark with cobalt dot in nav. Final logo iteration in progress with Gemini

---

## Environment variables expected

In `.env.local` (development) and Vercel env (production):

```
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...                # optional — for newsletter
NEXT_PUBLIC_CLARITY_PROJECT_ID=...    # optional — for heatmaps
```

---

## Tech stack

- **Framework:** Next.js 16.2.2 (App Router, RSC default, Turbopack dev)
- **React:** 19.2.4
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-nova style)
- **Fonts:** Geist + Geist Mono + Instrument Serif (next/font/google)
- **UI primitives:** @base-ui/react (accordion)
- **Icons:** lucide-react
- **Payments:** Stripe (`stripe@21`)
- **Email:** Resend (`resend@6`)
- **Analytics:** Vercel Analytics + Speed Insights
- **Hosting:** Vercel

---

## Stack we use (publicly listed in TrustStrip)

Next.js · Vercel · Supabase · Convex · Stripe · OpenAI · Anthropic · Google Gemini · Cloudflare · Sentry · Resend

---

## Key decisions documented

- **Two-path pricing** instead of three tiers — productized Starter + Custom only, no SaaS-style ladder
- **AI Care priced as time, not API** — three tiers ($199/$399/$899) cover monitoring + tuning. API costs always pass-through.
- **Cost estimator is public** — every prospect can run the math themselves before talking to us
- **No fake testimonials, no fake clients** — `/testimonials` is an empty honest placeholder
- **Money-back guarantee was already in our Terms** — surfacing it on /pricing is just transparency
- **Founder photo + signature on every Notes post** — trust signal
- **Numerical anchors throughout copy** — concrete numbers help AI assistants quote us correctly
- **No exit-intent pop-ups, no countdown timers, no fake urgency** — wrong tone for premium positioning

---

## What's next

Top priorities for next session:

1. **Logo finalization** — wrap the Gemini iteration loop, render final SVG, replace text-based wordmark
2. **First Loom video** — 90 seconds direct-to-camera on home + about
3. **Microsoft Clarity** — sign up + add env var
4. **First case study** — once first paying client ships
5. **More Notes essays** — one every 2–3 weeks (3–5 topics in conversion-playbook.md backlog)

Items deferred to dedicated sessions:
- **Stratus AI chatbot** — Option A (1–2 days)
- **Cal.com booking widget** — when ready to commit to call cadence
- **Quote tracker page** — when inbound exceeds 5/week
- **Email re-engagement automation** — when 50+ inbound + 3 paying clients

---

## Final route count

**31 pages live + 6 API routes + 8 JSON-LD schemas + 4 documentation files.**

That's where the site stands as of this session close.
