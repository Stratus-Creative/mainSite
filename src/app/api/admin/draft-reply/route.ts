import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { draftReply } from "@/lib/draft-reply";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select(
      "id, owner_name, business_name, email, source, project_type, budget, message, website_url, concern, internal_notes, quoted_amount, quoted_scope"
    )
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: notesData } = await supabase
    .from("submission_notes")
    .select("body, created_at")
    .eq("submission_id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: eventsData } = await supabase
    .from("events")
    .select("action, metadata, created_at")
    .eq("resource_type", "submission")
    .eq("resource_id", id)
    .order("created_at", { ascending: false })
    .limit(3);

  const recentNotes = (notesData ?? []).map((n) => ({
    body: n.body as string,
    created_at: n.created_at as string,
  }));

  const recentEvents = (eventsData ?? []).map((e) => ({
    action: e.action as string,
    metadata: (e.metadata ?? null) as Record<string, unknown> | null,
    created_at: e.created_at as string,
  }));

  const draft = await draftReply(submission, recentNotes, recentEvents);
  if (!draft) {
    return NextResponse.json({ error: "Draft failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, draft });
}
