# Design Spec: Supabase-Backed Notes with Scheduled Publishing & Newsletter

**Date:** 2026-05-09
**Approach:** Option B — Supabase table + Vercel Deploy Hook (static rebuild on publish)
**Status:** Approved by user

---

## Problem

Notes/articles are hardcoded TypeScript in `src/lib/notes-data.ts`. Publishing requires a code change and a deploy. There is no way to schedule a future publish date or automatically send a newsletter when an article goes live.

---

## Solution Overview

1. **Supabase `notes` table** — source of truth for all articles, with `scheduled_at` and `published_at` timestamps
2. **Next.js pages** — fetch from Supabase at build time; `revalidate: 3600` as fallback
3. **Edge function `publish-notes`** — pg_cron every 30 min; marks due articles published, fires Vercel deploy hook, sends Resend broadcast
4. **Admin panel `/admin/notes`** — list, create, edit, and reschedule articles without touching TypeScript

---

## Section 1: Data Model

```sql
create table notes (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text not null,
  tags          text[] not null default '{}',
  body          text not null,
  scheduled_at  timestamptz null,   -- null = draft; future = scheduled; past = publishes on next cron
  published_at  timestamptz null,   -- set by edge function; null = not yet live
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS: service role only (admin + edge function). Public reads filtered to published_at is not null.
alter table notes enable row level security;

create policy "Public can read published notes"
  on notes for select
  using (published_at is not null);

create policy "Service role has full access"
  on notes for all
  using (auth.role() = 'service_role');
```

### Article states

| State     | `scheduled_at` | `published_at` |
|-----------|---------------|----------------|
| Draft     | null          | null           |
| Scheduled | future        | null           |
| Published | any           | set            |

### Seed migration

All existing articles from `notes-data.ts` are inserted with `published_at = scheduled_at = their existing date` so nothing disappears from the live site on deploy.

---

## Section 2: Next.js Rendering Changes

### `src/lib/notes-data.ts` → `src/lib/notes.ts`

Replace the static `NOTES` array with two async server functions:

```ts
// Returns all published notes, newest first
export async function getAllNotes(): Promise<Note[]>

// Returns a single published note by slug
export async function getNote(slug: string): Promise<Note | undefined>
```

Both query Supabase with `published_at is not null` and order by `published_at desc`.

### Pages affected

- `src/app/notes/page.tsx` — call `getAllNotes()` server-side; `export const revalidate = 3600`
- `src/app/notes/[slug]/page.tsx` — call `getNote(slug)` server-side; `export const revalidate = 3600`; `generateStaticParams` fetches slugs from Supabase at build time

### Why `revalidate: 3600`

The deploy hook is primary. ISR revalidation is a safety net: if a deploy hook fires but a cached page hasn't been replaced yet, ISR ensures it clears within an hour. In practice, the static rebuild from the deploy hook resolves in 2–3 minutes, so subscribers clicking a newsletter link land on the live article.

---

## Section 3: Edge Function — `publish-notes`

**File:** `supabase/functions/publish-notes/index.ts`

**Trigger:** pg_cron, every 30 minutes

**pg_cron SQL:**
```sql
select cron.schedule(
  'publish-notes',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/publish-notes',
    headers := '{"Authorization": "Bearer <CRON_SECRET>"}'::jsonb
  )
  $$
);
```

**Logic:**
1. Auth check: `Authorization: Bearer <CRON_SECRET>` (same pattern as `followup-reminders`)
2. Query: `where scheduled_at <= now() and published_at is null`
3. If none due → return `{ ok: true, published: 0 }`
4. Update: set `published_at = now()` on all due articles
5. For each newly published article: create and send a Resend Broadcast to `RESEND_AUDIENCE_ID`
   - `POST /broadcasts` — creates the broadcast with subject, from, html/text body, and audience ID
   - `POST /broadcasts/{id}/send` — sends it immediately
   - Subject: article title
   - Body: description + "Read it here: https://stratus-creative.com/notes/[slug]"
   - Sender: `Stratus Creative <business@stratus-creative.com>`
   - Note: this is the Resend Broadcasts API, not the `/emails` endpoint used elsewhere
6. Fire `VERCEL_DEPLOY_HOOK_URL` (one POST, covers all articles published in this run)
7. Return `{ ok: true, published: N }`

**Required env vars (edge function secrets):**
- `CRON_SECRET` — shared with pg_cron call
- `SUPABASE_URL` — auto-injected
- `SUPABASE_SERVICE_ROLE_KEY` — auto-injected
- `RESEND_API_KEY` — already exists on other functions
- `RESEND_AUDIENCE_ID` — already used by newsletter route
- `VERCEL_DEPLOY_HOOK_URL` — new; generate in Vercel dashboard → Project Settings → Git → Deploy Hooks

**Error handling:**
- If Resend fails for an article, log the error but do NOT roll back `published_at` — the article should stay published; newsletter failure is recoverable manually
- If deploy hook fails, log but do not roll back — ISR will catch it within an hour
- If DB update fails, abort before any sends

---

## Section 4: Admin Panel — Notes Editor

### Routes

| Route | Purpose |
|---|---|
| `/admin/notes` | List all notes with status badges (Draft / Scheduled / Published) |
| `/admin/notes/new` | Create new note |
| `/admin/notes/[id]` | Edit note; reschedule or publish immediately |

### List view (`/admin/notes`)

Table columns: Title, Status, Scheduled At, Published At, Actions (Edit / Delete draft).

Status badge logic:
- `published_at` set → **Published** (green)
- `scheduled_at` set and `published_at` null → **Scheduled** (yellow, shows scheduled time)
- both null → **Draft** (gray)

### Editor form (`/admin/notes/new` and `/admin/notes/[id]`)

Fields:
- **Title** (text input)
- **Slug** (text input, auto-generated from title on new articles, always editable)
- **Description** (textarea, single paragraph)
- **Tags** (comma-separated text input, stored as `text[]`)
- **Body** (large textarea — same markdown-like format as existing notes)
- **Schedule** (datetime-local input for `scheduled_at`)

Actions:
- **Save as Draft** — saves with `scheduled_at = null`, `published_at = null`
- **Schedule** — saves with `scheduled_at` set to the datetime picker value
- **Publish Now** — sets `published_at = now()`, fires deploy hook immediately via a Next.js API route

Editing rules:
- **Draft or Scheduled**: all fields editable including `scheduled_at`
- **Published**: all content fields read-only; `published_at` displayed as read-only timestamp; only admin action is "Unpublish" (sets `published_at = null`, does NOT reset `scheduled_at`, fires deploy hook so the article is removed from the live site immediately)

### API routes

- `GET /api/admin/notes` — list all notes (admin auth required)
- `POST /api/admin/notes` — create note
- `PUT /api/admin/notes/[id]` — update note (content or schedule)
- `DELETE /api/admin/notes/[id]` — delete draft only (published notes cannot be deleted via UI)
- `POST /api/admin/notes/[id]/publish-now` — sets `published_at`, fires deploy hook

---

## Section 5: Migration Plan

**Order of operations to avoid any downtime:**

1. Create `notes` table in Supabase (migration SQL)
2. Seed all existing articles from `notes-data.ts` into the table with correct `published_at` dates
3. Update Next.js pages to fetch from Supabase (keep `notes-data.ts` import as fallback during transition)
4. Deploy — verify `/notes` and `/notes/[slug]` pages render correctly from DB
5. Remove `notes-data.ts` static array (keep the `Note` type interface)
6. Deploy `publish-notes` edge function to Supabase
7. Add pg_cron schedule for the function
8. Add `VERCEL_DEPLOY_HOOK_URL` to Supabase edge function secrets
9. Build admin notes editor routes
10. Test: create a scheduled article 5 minutes out, verify edge function publishes it, verify newsletter send, verify site rebuilds

---

## Environment Variables Summary

| Variable | Where | Status |
|---|---|---|
| `SUPABASE_URL` | Next.js + Edge Functions | Exists |
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js | Exists |
| `SUPABASE_SERVICE_ROLE_KEY` | Next.js + Edge Functions | Exists |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Exists |
| `RESEND_API_KEY` | Next.js + Edge Functions | Exists |
| `RESEND_AUDIENCE_ID` | Next.js + Edge Functions | Exists |
| `CRON_SECRET` | Edge Functions | Exists (used by followup-reminders) |
| `VERCEL_DEPLOY_HOOK_URL` | Edge Functions | **New — generate in Vercel dashboard** |
