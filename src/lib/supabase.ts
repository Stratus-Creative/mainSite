import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function createServerClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export function createPublicClient() {
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
