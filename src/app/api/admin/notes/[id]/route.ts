import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { slug, title, description, tags, note_body, scheduled_at } = body;

  const supabase = createServerClient();

  // Prevent editing published notes' content
  const { data: existing } = await supabase
    .from("notes")
    .select("published_at")
    .eq("id", id)
    .single();

  const updates: Record<string, unknown> = { scheduled_at: scheduled_at ?? null };

  if (!existing?.published_at) {
    // Draft / scheduled: allow full content edits
    if (slug) updates.slug = slug;
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (note_body) updates.body = note_body;
  }

  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/notes/:id] DB error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createServerClient();

  // Only allow deleting drafts
  const { data: existing } = await supabase
    .from("notes")
    .select("published_at, scheduled_at")
    .eq("id", id)
    .single();

  if (existing?.published_at) {
    return NextResponse.json(
      { error: "Cannot delete a published note. Unpublish it first." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) {
    console.error("[admin/notes/:id] DB error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
