import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("id, slug, title, description, tags, scheduled_at, published_at, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/notes] DB error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, title, description, tags, note_body, scheduled_at } = body;

  if (!slug || !title || !description || !note_body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      slug,
      title,
      description,
      tags: tags ?? [],
      body: note_body,
      scheduled_at: scheduled_at ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[admin/notes] DB error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
