# Stratus Creative — Conversion Playbook

A focused look at moves that specifically increase conversion of prospects → paying clients. Companion to [enhancements-roadmap.md](./enhancements-roadmap.md).

The roadmap covers everything (SEO, AEO, content, schema). This doc is **only the conversion-driving moves**, ranked by impact-per-hour.

Last updated: May 8, 2026.

---

## What's already shipped that helps conversion

Worth naming so we don't reinvent:

- **Transparent pricing** (Starter $1,495 / Custom from $5,000) — already differentiates from agencies that hide
- **AI Care 3-tier** — credibility on the AI side
- **/tools/cost-estimator** — converts evaluators into qualified leads
- **/resources/website-cost-guide** lead magnet
- **/vs/squarespace + /vs/wix** — captures branded competitor intent
- **Per-pillar landing pages** (×3) and per-industry landing pages (×3)
- **/start form pre-fills** from estimator + saves progress to localStorage
- **Stripe self-serve checkout** for the Starter
- **Multiple Notes essays** seeding long-tail organic
- **Multiple CTA paths** on every page (Start / See pricing / Cost estimator)

That's a strong base. The gaps below are what to build next.

---

## Tier 1 — High impact, low effort (ship next 2 weeks)

### 1. Money-back guarantee on Starter
**Why:** Risk reversal is the single highest-converting copy change for a flat-rate service. Every conversion psychologist puts this at the top.
**What:** Add a line to the Starter card on `/pricing`: *"7-day money-back guarantee — if we haven't started the work yet, full refund."* Match what the existing Terms already allow. **You're not promising anything new — you're just surfacing what's already true.**
**Effort:** S · 30 minutes of copy change.

### 2. Founder photo + signature
**Why:** Single biggest trust delta available. Prospects buy from people, not brands. Right now your About page has no photo of you. Premium agencies always show the founder.
**What:**
- Headshot on `/about` (top of the bio section)
- Smaller version on Notes posts (next to the date) — author byline
- Optional: a hand-drawn signature SVG that appears at the end of essays
**Effort:** S (after you take the photo). One afternoon.

### 3. Floating "Start a project" CTA
**Why:** Long pages bury the conversion action. A persistent button that follows scroll — small and unobtrusive — captures intent the moment it forms. Every premium agency that converts well has one.
**What:** A small fixed-position button bottom-right on long pages. Hides in /start (already there) and /support. Subtle: small dot + "Start" label. Expands on hover.
**Effort:** S. New `<FloatingCta />` component, mount in layout.

### 4. Inline FAQ on the home hero
**Why:** The top 3 questions every prospect has — *"Is this for me?" / "How much will it cost?" / "How long will it take?"* — currently aren't answered until you scroll. Surfacing them in the hero kills bounce.
**What:** Below the home hero CTA, add 3 expandable Q&A items:
- *"Will this work for my business?"* → quick answer + link to /services
- *"How much will mine cost?"* → quick answer + link to /pricing
- *"How fast can you ship?"* → quick answer + link to /work
**Effort:** S. Reuses existing accordion component.

### 5. "Reply within 4 hours during business hours" promise
**Why:** "Within 1 business day" is already a promise but it's vague. A specific number compresses anxiety. Conversion benchmarks show it's the single most effective copy change you can make for inbound forms.
**What:** Change the /start form footer + service expectations from *"Reply within 1 business day"* → *"Reply within 4 hours during business hours."* Only ship if you can actually do this. (You can — you're the only one who handles inbound right now.)
**Effort:** S · copy change. Requires you to actually deliver.

### 6. "What we don't do" section
**Why:** Counterintuitive, hugely effective. Listing what you turn down (paid ads, social media management, big-agency contract work) signals expertise and saves bad-fit prospects time. Premium agencies do this.
**What:** A short section on `/services` (or its own `/what-we-dont-do` page) listing 5-8 things you decline. Each line: what + why.
**Effort:** S. One page, minimal code, maximum credibility.

### 7. Microsoft Clarity (free heatmaps + session replay)
**Why:** Free analytics tool that tells you exactly what visitors do — which sections they read, where they bounce, what they almost-click. You can't optimize what you can't see. Strictly better than guessing.
**What:** Add Clarity script to layout. ~5 lines of code. Privacy-aware (respects Do Not Track).
**Effort:** S · 15 minutes including signup.

---

## Tier 2 — Medium impact, medium effort (ship next month)

### 8. Cal.com booking widget on /start
**Why:** Already in roadmap. Worth reiterating because it's the single biggest single conversion lever beyond risk reversal. "Book a 15-min call" → 3-5x more bookings than email forms in most B2B benchmarks.
**What:** Cal.com (free, open-source). Add a tab/toggle on /start: "Email" vs "Book a 15-min call." Default to email; let people self-select up.
**Effort:** S–M. ~1 day to wire up properly.

### 9. Quote-tracker page after submission
**Why:** Today, /start submits → "Thanks, we'll be in touch." Then 4 hours of silence. Most prospects re-evaluate during that wait window and may bounce to a competitor.
**What:** After submit, redirect to `/quote/{id}` where they can see: "Your inquiry: [scope] · Status: We're reviewing · Expected response: Tuesday 4pm." Small thing that hugely reduces buyer anxiety.
**Effort:** M. Needs a small backend (Supabase + token-gated page). 2-3 days.

### 10. Stratus AI chatbot
**Why:** Already documented. Eats own dog food + 24/7 conversion path.
**What:** See `enhancements-roadmap.md` Stratus AI Chatbot section.
**Effort:** M (Option A) — 1-2 days.

### 11. Comparison anchoring on /pricing
**Why:** Pricing without context lands as "expensive" or "cheap" by raw number alone. Pricing with the right anchor lands correctly. Right now $1,495 sits alone — could be reframed as "$1,495 vs $10,000 typical agency build."
**What:** Subtle anchor under each price:
- Starter: *"vs $5,000–$10,000 at typical agencies"*
- Custom: *"vs $15,000–$50,000+ at full-service agencies"*
- AI Care: *"vs $1,500/hr Big Four AI consulting"*
Don't be smarmy — frame as "honest comparison." Same tone as our /vs pages.
**Effort:** S. Copy change on /pricing.

### 12. "Free 15-min website audit" lead magnet
**Why:** Catches prospects who aren't ready for /start but are evaluating. Different from the cost guide PDF — this is human-led ("schedule a 15-min call") with no commitment.
**What:** New `/resources/free-website-audit` page. Cal.com integration. We give them a 15-min Loom of their site reviewed. Free, 1x per company.
**Effort:** S–M. New page + scheduling. Worth it if you can do 2-3 of these per week.

### 13. Loss-aversion framing in hero copy (test)
**Why:** Current home hero is feature-led ("websites, workflows, online presence"). Loss-aversion frames convert better in B2B testing.
**What:** Test as A/B variant once we have traffic. Examples:
- *"Stop losing local customers to template-grade websites."*
- *"Every month without a working website is leads on the table."*
- *"What's a slow website actually costing your business?"*
Don't ship without an A/B framework — this is hypothesis-driven, not gut-driven.
**Effort:** M (after we have ~500 sessions/wk for A/B confidence).

### 14. Newsletter signup at end of every Notes post
**Why:** Notes essays are great long-term content. Capturing emails is the longest-term conversion play available — buyers read 3-7 essays before they're ready to buy.
**What:** Bottom of every Notes post: *"Get one essay like this in your inbox each month. No sales pitch."* Email field, Resend integration, simple Supabase storage.
**Effort:** M. ~1 day for the form + storage + send infrastructure.

---

## Tier 3 — Long-game (ship as we have signal)

### 15. Live availability scarcity
**Why:** "Only taking 3 new Custom clients this month" is the most-cited B2B conversion line in services. Real scarcity beats fake scarcity.
**What:** Small line on /pricing or /start: *"Currently accepting 2 new Custom engagements this quarter."* Update manually as state changes. **ONLY if true** — never fake this. Build a small admin panel to update the number.
**Effort:** S (just a setting). Long game because it requires us to have demand exceeding supply.

### 16. Founder-led 90-second video on home + about
**Why:** Already in roadmap. Listed here for completeness because it's a conversion play, not just brand.
**What:** James direct-to-camera, 60-90s, walks through what a Stratus engagement looks like. Embedded inline. Self-recorded with a phone is fine.
**Effort:** S — 1 hour to record, edit, embed.

### 17. SMS opt-in alternative on /start
**Why:** A subset of clients (especially local-services owners — HVAC, contractors, plumbers) prefer text over email. Letting them choose increases conversion among that segment.
**What:** Optional radio button on /start: *"How should we reach you?" Email | Text | Both.* Backend uses Twilio for SMS.
**Effort:** M. Twilio integration, opt-in tracking.

### 18. Email re-engagement automation
**Why:** Most prospects bounce. The ones who don't convert today may convert in 60 days. An email sequence (3-5 emails over 30-60 days) keeps Stratus on top of mind.
**What:** Sequence triggers on /start submission OR cost-estimator email capture. Drip:
- Day 0: confirmation
- Day 3: link to most relevant Notes essay based on stated need
- Day 14: case study or social proof
- Day 30: "Is now the right time?" check-in
- Day 60: reactivation offer
**Effort:** M–L. Needs Resend or Loops integration + state machine.

### 19. Customer testimonial page
**Why:** Once you have 3+ paying clients, a `/testimonials` or `/clients` page is conversion gold. Currently we have nothing — by design (don't fake it). Build the page in advance so it's ready when we have content.
**What:** Empty page now with placeholder copy: *"We're building this. Be the first to be featured here."* Convert into real testimonials as clients ship.
**Effort:** S now (placeholder), M later (real implementation).

### 20. Public roadmap
**Why:** Transparency = trust. Showing what we're working on signals a real, growing business — not a single inbound that will disappear in 6 months.
**What:** A `/roadmap` page that's a curated public version of `roadmap.md`. Shows what's shipping, what's planned, what's parked. Updated monthly.
**Effort:** S. Mostly copy from roadmap.md.

---

## What I'd ship FIRST (this week)

If I could only do 5 things in one week to lift conversion, in order:

1. **Money-back guarantee line on /pricing** — 30 minutes
2. **Microsoft Clarity** added — 15 minutes
3. **Floating "Start" CTA** — 1 hour
4. **Inline 3-question FAQ on home hero** — 1 hour
5. **"What we don't do" section on /services** — 1 hour

That's a half-day of work for measurably better conversion. Everything else in this doc is prioritized after these.

---

## How to measure if any of this works

Conversion = inbound form submissions ÷ unique visitors.

**Baseline:** capture this number in Vercel Analytics this week. Without a baseline you'll never know if anything moved.

**Targets to set:**
- Bounce rate on /pricing under 60% (currently unknown)
- Cost estimator → /start prefill conversion above 15% (currently unknown)
- /start submit rate above 3% of visitors (B2B services benchmark)
- 1+ Stripe Starter purchase per 100 unique visitors

**What to track in Clarity:**
- Where do people scroll-rage on /pricing? (suggests confusing pricing layout)
- What buttons do people click that don't go anywhere? (broken expectations)
- How far down /start do people get before abandoning?
- Heatmap of cost estimator — which inputs do people change?

After 2 weeks of Clarity data + Vercel Analytics, you'll have specific signals on what to A/B test next. Don't guess — measure.

---

## What NOT to do

These are common conversion-tactic recommendations that are wrong for Stratus:

❌ **Pop-up exit-intent modals** — high lift, but tonally wrong for premium positioning. The whole brand says "we're not desperate." Don't.

❌ **Limited-time discounts** — same reason. We're not Squarespace. Don't run flash sales.

❌ **Live chat that pings on every page load** — annoying and signals desperation. Build the chatbot if and when, but don't auto-engage.

❌ **Testimonial fakes** — never. Better to have empty than fake.

❌ **Aggressive retargeting** — feels stalker-y for a $5K service. Email nurture is the right intensity.

❌ **Sticky banners with "Get a quote!" + countdown timer** — looks like a tire shop. Don't.

The brand is "confident, transparent, premium." Every conversion tactic should support that frame. If a tactic would feel out of place at Pentagram, it's out of place at Stratus.
