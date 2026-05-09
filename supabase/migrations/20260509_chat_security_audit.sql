-- Chat security audit migrations
-- Apply via Supabase dashboard SQL editor or `supabase db push`.

-- 1. Per-IP rate limit tracking
create table if not exists rate_limits (
  id bigserial primary key,
  bucket text not null,
  ts timestamptz not null default now()
);

create index if not exists rate_limits_bucket_ts_idx
  on rate_limits (bucket, ts desc);

-- 2. Conversation uniqueness — eliminates the race condition where two
-- simultaneous requests with the same session_id create duplicate rows.
create unique index if not exists conversations_session_id_unique_idx
  on conversations (session_id);

-- 3. Submissions: associate to a session for idempotency dedupe and
-- per-session inquiry tracking.
alter table submissions add column if not exists session_id text;
create index if not exists submissions_session_id_idx
  on submissions (session_id);

-- 4. Retention cleanup — run on a schedule (pg_cron / Supabase scheduled function).
-- Suggested cadence: daily at 03:00 UTC.
--
-- Cleanup old rate-limit rows (older than 24h are useless):
--   delete from rate_limits where ts < now() - interval '24 hours';
--
-- Delete chat messages older than 90 days:
--   delete from messages where created_at < now() - interval '90 days';
--
-- Anonymize old submissions (>2 years) — keep the row for analytics:
--   update submissions
--     set email = null, phone = null, owner_name = null,
--         business_name = null, message = null
--     where created_at < now() - interval '2 years'
--       and email is not null;
