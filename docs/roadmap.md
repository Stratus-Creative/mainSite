# Stratus Creative — Roadmap

Living document of what's built, what's next, and what's parked. Update as priorities shift.

Last updated: May 8, 2026.

---

## Cost Estimator (`/tools/cost-estimator`)

### Built — v1 (May 2026)
- ✅ 7 workflow templates (FAQ bot, email triage, support bot, quote generator, lead qualifier, voice agent, blank)
- ✅ 9 LLM models with current pricing (GPT-4o, GPT-4o-mini, o1, o1-mini, Claude Haiku 4.5, Sonnet 4.6, Opus 4.7, Gemini 2.5 Flash, Gemini 2.5 Pro)
- ✅ Anthropic prompt cache slider with savings line
- ✅ 8 third-party APIs with per-call cost (VIN, SMS, voice, transcription, scrape, geocoding, email parsing, image gen)
- ✅ Auto-recommended Care tier from volume + memory + voice + complexity
- ✅ Build cost estimate alongside, with `+` indicator
- ✅ 30% safety buffer on high-end estimate
- ✅ Per-model latency + per-API latency, total expected response time
- ✅ Workflow visualizer (per-request flow diagram)
- ✅ Volume sensitivity table (½× / 1× / 2× / 5× / 10×)
- ✅ Model comparison view (same workflow, different models side-by-side)
- ✅ Copy-to-clipboard plain-text export
- ✅ "Discuss this estimate" button pre-fills `/start` form with full estimate summary
- ✅ Pricing data last-updated date stamp

### Planned — v2

| Item | Notes | Effort |
|---|---|---|
| Save estimate by client name | localStorage first, auth-gated later | S |
| Shareable URL state | Encode form state in query params for permalinks | S |
| PDF export with Stratus branding | Use `@react-pdf/renderer` or print stylesheet | M |
| Email this estimate | Send via Resend, cc to studio | S |
| Internal margin overlay | Auth-gated route at `/admin/estimator` showing actual margin | M |
| Live API price feeds | Scheduled job pulls current OpenAI/Anthropic/Google pricing weekly | L (needs backend) |
| Workflow component library | Visual builder for chained calls, voice flows, etc. | L |
| Latency breakdown chart | Visual stack of per-step latency (already have data) | S |
| Add DeepSeek, Llama (Together.ai), xAI Grok | As we start using them | S each |
| Confidence intervals | Show ranges on per-request cost too, not just monthly | S |
| Burn-rate over time | Show what monthly invoice trends look like over 12 months as volume scales | M |
| Compare against competitors | Show typical agency pricing for the same workflow | M |
| Export to Stripe quote | Auto-generate a Stripe Quote object from estimator output | M |

---

## Site additions

### Built (May 2026)
- ✅ Dark Editorial design system (refined cobalt accent, charcoal background)
- ✅ Home / Services / Pricing / Work / Start / Support pages
- ✅ Pricing page with two-path Starter/Custom + Typical Ranges + AI Care tiers + How AI Workflows Are Priced explainer
- ✅ AI Care three tiers (Light $199, Standard $399, Pro $899)
- ✅ About page with principles + bio
- ✅ Tools index (`/tools`)
- ✅ Notes/Blog (`/notes`) with first post
- ✅ Custom 404
- ✅ Trust strip component (stack + clients placeholder)
- ✅ Vercel Analytics + Speed Insights
- ✅ SEO/AEO foundation: robots.txt allowing all major AI crawlers, llms.txt, sitemap.xml
- ✅ JSON-LD: Organization + WebSite + Service catalog + WebApplication + FAQPage
- ✅ Custom OG image generator (`opengraph-image.tsx`)
- ✅ Per-page metadata (title templates, canonical URLs, keywords, OG, Twitter)
- ✅ Free AI cost estimator at `/tools/cost-estimator`

### Next up — content & trust

| Item | Why | Effort |
|---|---|---|
| 3–5 more Notes essays | AEO win, demonstrates expertise. Topics: "The hidden cost of free CMS templates," "What HVAC techs need on a website," "When workflow automation isn't worth it" | M each |
| Personal photo / studio photography | Trust signal — premium agencies show their face | S |
| Per-pillar deep landing pages | `/services/ai-agents`, `/services/local-websites`, `/services/workflows`. Each with deeper FAQ + pillar-specific CTAs. SEO + conversion lift. | L (3 pages × M each) |
| Per-industry landing pages | `/for/hvac`, `/for/dentists`, `/for/real-estate`. Same offer, industry-specific copy. Massive SEO. | L (3+ pages × M each) |
| Custom favicon + apple-touch-icon set | Currently default Next.js favicon | S |
| Newsletter signup | For Notes posts. Use Resend + simple Supabase storage | M |
| RSS feed for Notes | `/notes/feed.xml` route | S |

### Tools expansion (`/tools/*`)

Already have: cost estimator. Coming next:

| Tool | Why | Effort |
|---|---|---|
| Website ROI calculator | "What's a website actually worth to your business?" Shows expected revenue lift from average ticket × leads × close rate × conversion improvement | M |
| Brand questionnaire generator | Auto-generate a discovery brief, downloadable + emailable | M |
| Local SEO audit | Drop in business name + city, get a 1-page report of where you rank vs competitors | L (needs SerpAPI or similar) |
| Workflow ROI calculator | "How many hours/mo does the manual process take? Here's what automation pays back" | M |
| AI prompt builder | Help non-technical users iterate on prompts with cost/latency feedback | M |

### Internal / admin

| Item | Why | Effort |
|---|---|---|
| `/admin` dashboard | Single view of all client AI workflows, their cost, their uptime | L |
| Internal estimator with margin | Same calculator, auth-gated, shows actual margin at each price | S |
| Cost-monitoring agent | LLM-driven daemon that watches per-client API spend and alerts on spikes | L |
| Discovery call template | Auto-generated proposal PDF after a call is logged | M |

### Live transparency (post-clients)

| Item | Why | Effort |
|---|---|---|
| `/transparency` page | Anonymized averages from real client base — what AI workflows actually cost to run, in production. Massive trust signal that no other agency has. | M (after 5+ AI clients) |
| Public uptime status page | Real uptime + incident log per client (with permission) | M |
| Case studies as projects ship | `/work/[slug]` deep dive per project. Problem → approach → outcome with measurable wins | M each |

---

## Design / UX backlog

| Item | Notes |
|---|---|
| Animated number-counter on home stats | When we have stats |
| Custom cursor on cost estimator | Subtle premium signal |
| Scroll-triggered reveal on home pillars | Already feels good static — only do if it adds clarity |
| Loading skeletons for slow forms | Already fast in dev — re-evaluate after deploy |
| Better focus states on form inputs | Audit pass |

---

## Effort key

- **S** — < 1 day  
- **M** — 1–3 days  
- **L** — 3+ days

Estimates assume AI-assisted development.
