# Design Spec: "The Channel You're Using Wrong" — Notes Series

**Date:** 2026-05-09
**Type:** Content — three new notes added to `src/lib/notes-data.ts`
**Status:** Approved by user

---

## Overview

Three short notes published on consecutive dates (May 18–20, 2026). Each corrects a single widely-misread marketing stat using real data from credible sources (ANA Response Rate Report, Mailchimp/Klaviyo benchmarks, USPS Household Mail Survey, TCPA case law). Each ends with a CTA tied to Stratus's Workflows & Automation service.

The series argues that the "digital beats mail" narrative is true in a narrow sense and misleading in a broad one — which matches the Stratus voice (honest, data-backed, no BS).

---

## Research Findings (Source of Truth)

All data drawn from two research passes. Key figures to use in articles:

### SMS
- Open rate: ~98%, read within 3 minutes (Validity "State of SMS Marketing 2023", EZ Texting 2025)
- Average response time: 90 seconds
- Response rate (opted-in list): ~45% (Business.com, SlickText)
- Postcard response rate (cold prospect list): 3.16–5.7% (ANA Response Rate Report 2023)
- Cost per SMS: ~$0.04/message; postcard: ~$0.50–0.70/piece all-in
- **Critical caveat:** TCPA requires written opt-in before any promotional text. Cold SMS prospecting is illegal ($500–$1,500/message in fines). Postcards via EDDM require zero prior consent.
- ANA cross-channel ROI: direct mail house lists 112–161% vs. SMS ~102%

### Email
- Average open rate: 35.63% (Mailchimp benchmarks) — **inflated since 2021 by Apple Mail Privacy Protection pre-loading pixels**
- Email ROI cited as "$36 per $1 spent" (DMA/Litmus) — calculated by dividing channel revenue by near-zero variable send cost
- Direct mail ROI (ANA): 112–161% on house lists — fully loaded cost (print + postage + list)
- Studies holding methodology constant narrow the gap significantly; neither channel dominates
- Email list decay: 22–25% annually (job changes, abandoned addresses)
- Postal address decay: 8–10% annually (80% of movers file USPS NCOA change-of-address)
- Automated email flows (abandoned cart, welcome): 48–50% open rates, generate 41% of email revenue from 5.3% of sends (Klaviyo)

### Postcards
- EDDM (Every Door Direct Mail): $0.247/piece postage + printing; no list required; saturation of any carrier route
- 55+ demographic: 50% rate direct mail as preferred ad channel (vs. lower digital preference)
- Multichannel lift: combining direct mail + digital follow-up generates 27–118% higher response vs. mail-only (ANA/DMA)
- Best postcard use cases: cold geographic outreach (local home services, healthcare recall, real estate), 55+ audiences, high-ticket B2B
- Weakest postcard use cases: restaurants/local retail (low AOV, 2.96% response rate), ecommerce

---

## Article 1: SMS

**Slug:** `what-the-98-percent-sms-open-rate-actually-means`
**Title:** `What the 98% SMS open rate actually means`
**Date:** `2026-05-18`
**Tags:** `["Marketing", "SMS"]`
**Description:** The number is real. The comparison it's used to make isn't. Here's what SMS actually does — and doesn't do — for small businesses.

### Structure
1. Open with the stat: 98% open rate, read within 3 minutes, 90-second average response. All real.
2. Complicate it: that number is always measured on opted-in subscribers — people who chose to receive texts. The postcard comparison (4.4% cold response) is a different population entirely.
3. The structural problem: TCPA. Cold SMS prospecting is illegal. Postcards via EDDM require zero consent. The comparison collapses.
4. Where SMS wins clearly: existing customer retention, appointment reminders, re-engagement when a customer goes quiet, time-sensitive offers. No channel closes faster.
5. CTA: the automation layer — SMS triggers from your CRM, appointment reminders, reactivation sequences. Link to `/services/workflows`.

---

## Article 2: Email

**Slug:** `what-the-36-dollar-email-roi-number-actually-means`
**Title:** `What the "$36 for every $1 spent" email ROI number actually means`
**Date:** `2026-05-19`
**Tags:** `["Marketing", "Email"]`
**Description:** The $36 ROI figure and the 112% direct mail ROI figure are calculated completely differently. Here's what they actually mean side by side.

### Structure
1. Open with the $36:1 ROI claim — real, widely cited. Then surface the direct mail counterpart: 112–161% ROI (ANA). Seems like email wins by a mile.
2. The catch: different math. Email ROI = channel revenue ÷ near-zero send cost. Direct mail ROI = net revenue ÷ fully loaded print + postage + list cost. Studies holding methodology constant narrow the gap significantly.
3. The open rate problem: Apple MPP since 2021 pre-loads pixels. Reported open rates (35%+) are partially artificial. Click-to-open is now the real metric.
4. The stability surprise: email lists decay 22–25%/year. Postal addresses decay 8–10%/year. Your mailing list is more durable than your email list.
5. Where email wins: warm-list retention, automated flows (abandoned cart, post-visit follow-up, reactivation). 48–50% open rates on automated sequences. This is where the ROI is real.
6. CTA: automated email flows are a workflow build, not ongoing manual work. Link to `/services/workflows` and process automation pricing.

---

## Article 3: Postcards

**Slug:** `why-postcards-still-work`
**Title:** `Why postcards still work (and what to use them for)`
**Date:** `2026-05-20`
**Tags:** `["Marketing", "Strategy"]`
**Description:** Postcards do something texts and emails legally can't. Here's the honest breakdown of when each channel wins, and why the best answer is usually sequencing all three.

### Structure
1. The honest counterargument: postcards are the only scalable legal cold-outreach channel. EDDM blankets a carrier route — no list, no consent form, no prior relationship. HVAC seasonal campaign to a new neighborhood: no SMS or email alternative exists.
2. Where postcards hold: 55+ demographic (50% prefer mail), healthcare recall campaigns, dental new-mover targeting, real estate, high-ticket B2B.
3. The multichannel finding: combining direct mail + digital follow-up generates 27–118% lift vs. mail-only (ANA data). Best operators sequence: postcard → email 24–48 hours later → SMS if available. Neither channel replaces the others.
4. The Stratus angle: your website is the landing page for all three channels. A postcard with a QR code, an email link, and an SMS shortlink all land somewhere. That somewhere has to convert.
5. CTA: a site built to convert cold traffic (from a postcard campaign or otherwise) is different from a brochure site. Link to `/pricing#starter` and `/services/websites`.

---

## Voice & Formatting

Match existing notes exactly:
- Paragraphs separated by `\n\n`
- `**Bold**` for section headers within body
- `[link text](url)` for internal CTAs
- Markdown table syntax supported (confirmed in renderer for existing articles)
- No emoji, no exclamation points
- Tone: direct, honest, data-first, skeptical of hype including their own
- Articles run 400–700 words each (matching existing notes length)

---

## CTA Mapping

| Article | Primary CTA | Link |
|---|---|---|
| SMS | "We build the automation layer" | `/services/workflows` |
| Email | "Automated flows are a workflow build" | `/services/workflows` |
| Postcards | "Your site has to convert cold traffic" | `/pricing#starter` |

---

## Implementation

All three articles added to the `NOTES` array in `src/lib/notes-data.ts`. Append to the array (the notes page sorts by date at render time, so array order doesn't affect display — existing convention is oldest-first in the file). No new files, no schema changes, no routing changes required.
