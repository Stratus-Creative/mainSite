// One-time seed: inserts all notes from notes-data.ts into Supabase.
// Run: npx tsx scripts/seed-notes.ts
import { createClient } from "@supabase/supabase-js";
import { NOTES } from "../src/lib/notes-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const rows = NOTES.map((n) => ({
  slug: n.slug,
  title: n.title,
  description: n.description,
  tags: n.tags,
  body: n.body,
  scheduled_at: `${n.date}T09:00:00Z`,
  published_at: `${n.date}T09:00:00Z`,
}));

async function main() {
  const { error } = await supabase
    .from("notes")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${rows.length} notes.`);
}

main();
