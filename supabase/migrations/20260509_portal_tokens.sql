-- Passwordless client portal tokens
-- Apply via Supabase dashboard SQL editor or `supabase db push`.

create table if not exists portal_tokens (
  token text primary key,
  submission_id uuid not null references submissions(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists portal_tokens_submission_id_expires_at_idx
  on portal_tokens (submission_id, expires_at desc);

create index if not exists portal_tokens_expires_at_idx
  on portal_tokens (expires_at);

-- Suggested cleanup (run via pg_cron / Supabase scheduled function):
--   delete from portal_tokens where expires_at < now() - interval '7 days';
