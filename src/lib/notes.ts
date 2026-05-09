import { createServerClient } from "./supabase";

export interface Note {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// A note is "live" when its published_at is set AND has actually arrived.
// Anything with a future published_at is treated as scheduled and hidden
// from the public site until its date passes.
export async function getAllNotes(): Promise<Note[]> {
  const supabase = createServerClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("notes")
    .select("id, slug, title, description, tags, body, scheduled_at, published_at, created_at, updated_at")
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

export async function getNote(slug: string): Promise<Note | undefined> {
  const supabase = createServerClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? undefined) as Note | undefined;
}

export async function getAllNotesSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("notes")
    .select("slug")
    .not("published_at", "is", null)
    .lte("published_at", nowIso);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}
