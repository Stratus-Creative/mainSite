# Email re-engagement automation — design

Plan for the drip sequence that re-engages prospects who don't convert immediately. **Not built yet** — this document is the spec we'll execute when we wire up the automation infrastructure.

---

## Why this matters

Most prospects don't convert on their first visit. For B2B services in our price range ($1.5K–$20K), the typical buying cycle is 14–60 days from first touch to commit. Without re-engagement, every prospect who isn't ready *today* is permanently lost. With re-engagement, ~10–15% of "lost" prospects come back when the timing is right.

The goal isn't to spam. It's to make sure when the prospect IS ready (next quarter, next budget cycle, after their current project ships), Stratus is the obvious next call.

---

## Trigger events

The sequence kicks off on any of these:

1. **`/start` form submission** — prospect raised hand explicitly
2. **Cost estimator email capture** (when we add it) — prospect engaged but not ready
3. **Newsletter signup** — light engagement, content-led nurture
4. **`/resources/free-website-audit` form submission** — high engagement, audit follow-up
5. **`/resources/website-cost-guide` download with email** (when gated) — low engagement, content-led

Each trigger gets its own variant of the sequence — same shape, different emphasis.

---

## Sequence structure

### Variant A — Submitted /start (high intent, no immediate close)

```
Day 0  · Confirmation: "We received your inquiry. Replying within 4 hours."
         Sender: James, personal tone. No automation feel.

Day 1  · Manual reply (you, not automation) — covered separately

Day 7  · "Quick check-in: did our quote fit your timeline?"
         Personal, not automated-feeling. Soft re-engagement.

Day 14 · Relevant Notes essay based on their stated need
         e.g. AI workflow inquiry → "The real cost of an AI agent"
              Local site inquiry → "What $10K websites actually buy you"

Day 30 · Case study or social proof (when we have it)
         If no case study yet: a Notes essay on their industry

Day 60 · "Reactivation": a small offer or specific value
         e.g. "Here's a free 15-min audit if you'd still like one"

Day 90 · Final email: "We'll stop emailing after this one — let us
         know if you'd like to stay subscribed for future updates"
         Honest opt-out makes the prior emails feel less spammy.
```

### Variant B — Cost estimator email capture (medium intent)

Shorter, more content-led:

```
Day 0  · Confirmation + their estimate as a PDF
Day 5  · "We found a Notes essay that matches your workflow type"
Day 14 · "Here's how three of our clients ship workflows like yours"
Day 30 · "Want to talk through it?" CTA
Day 60 · Final + opt-out option
```

### Variant C — Newsletter signup (lowest intent, longest game)

Just regular content cadence — one essay per month, no special automation.

### Variant D — Free audit submission (high engagement, post-delivery)

```
Day 0  · Confirmation: "Your audit is in our queue, 1–3 business days"
Day 2  · Audit Loom delivery (manual)
Day 4  · "Did the audit help? Anything I should clarify?"
Day 14 · "If you'd like to fix any of those issues, here's our pricing"
Day 30 · Soft re-engagement
Day 60 · Final
```

---

## Tooling options

### Resend Audiences + scheduled sends
- We're already using Resend for transactional
- Audiences feature handles list + segmentation
- Scheduled sends via simple cron job hitting Resend API
- **Pros:** zero new vendor. Cheap. Already wired.
- **Cons:** no built-in workflow editor — sequences live in code

### Loops (loops.so)
- Purpose-built for SaaS/services drip sequences
- Visual workflow editor
- Webhook triggers from form submissions
- **Pros:** non-technical updates. Easy A/B.
- **Cons:** new vendor. ~$49/mo for our volume.

### Customer.io / Customer.dev
- Higher-end alternative
- More flexibility
- **Cons:** overkill at our volume. Skip until we hit 1,000+ subscribers.

### Recommendation

**Start with Resend + scheduled sends in code.** Migrate to Loops once subscribers cross 200 OR once you want non-technical workflow editing.

---

## Implementation sketch (Resend variant)

```ts
// src/lib/email-sequences.ts
export const sequences = {
  startSubmission: [
    { day: 0, template: "start-confirmation" },
    { day: 7, template: "start-checkin" },
    { day: 14, template: "start-essay-{topic}" },
    { day: 30, template: "start-social-proof" },
    { day: 60, template: "start-reactivation" },
    { day: 90, template: "start-final" },
  ],
  // ...
};

// On form submit:
// 1. Add email to Resend audience with custom variables (topic, pillar, etc.)
// 2. Schedule each email in the sequence via Resend scheduled-send API
// 3. Track unsubscribes via Resend webhook → flip subscriber status

// Cron job runs daily:
// - Read all subscribers with sequence in progress
// - For each: check if next email is due, send via Resend
// - Mark sent in DB (Supabase `email_sends` table)
```

Estimated build time: **2–3 days** for full v1 with 4 variants.

---

## Content to write

We need 12–15 unique email templates total. Drafts to write before launch:

**Confirmation emails** (5 variants — one per trigger):
- start-confirmation
- estimator-confirmation (with their numbers)
- newsletter-welcome
- audit-confirmation
- cost-guide-confirmation

**Re-engagement emails** (per variant):
- start-checkin (day 7)
- start-essay-ai (day 14, AI workflow inquiry)
- start-essay-website (day 14, website inquiry)
- start-social-proof (day 30, when we have case studies)
- start-reactivation (day 60)
- start-final (day 90)

**Estimator-specific:**
- estimator-followup (day 5)
- estimator-clients (day 14)
- estimator-cta (day 30)

**Audit-specific:**
- audit-feedback (day 4)
- audit-pricing-cta (day 14)

Each email: 80–150 words, single CTA, sender = James personal email, no marketing-style HTML (plain text or very minimal).

---

## Metrics to track

Once live, watch:

- **Open rate** (target: >40% — service-business benchmarks)
- **Click rate** (target: >8%)
- **Reply rate** (target: >2% — replies are gold)
- **Unsubscribe rate** (alarm if >2% per send)
- **Sequence-attributed conversions** (count of paid clients who came from a re-engagement email)

If unsubscribes spike, the cadence is too aggressive — slow it down.

---

## When to ship

- ✅ At least 50 inbound submissions tracked through `/start` and the cost estimator
- ✅ At least 3 paying clients (so we have something to point to in re-engagement)
- ✅ Resend audience set up
- ✅ 12+ email templates written and reviewed

Until then, manual follow-up is fine. The leverage starts when you can't keep up manually.
