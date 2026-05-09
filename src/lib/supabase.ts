import { createClient } from "@supabase/supabase-js";

// Read env vars lazily inside the factories — not at module load — so that
// importing this module at build time (e.g. from generateStaticParams) doesn't
// crash when Vercel hasn't surfaced env vars yet.
function getUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Configure it in Vercel → Settings → Environment Variables for all environments (Production, Preview, Development)."
    );
  }
  return url;
}

export function createServerClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Configure it in Vercel for all environments."
    );
  }
  return createClient(getUrl(), key);
}

export function createPublicClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Configure it in Vercel for all environments."
    );
  }
  return createClient(getUrl(), key);
}
