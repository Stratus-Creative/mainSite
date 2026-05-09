import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

const MAX_CONTENT = 64_000;
const MAX_SUMMARY = 500;

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const promptKey = typeof body.prompt_key === "string" ? body.prompt_key.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const activate = body.activate === true;

  if (!promptKey || promptKey.length > 64) {
    return NextResponse.json({ error: "Invalid prompt_key" }, { status: 400 });
  }
  if (!content.trim() || content.length > MAX_CONTENT) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }
  if (!summary || summary.length > MAX_SUMMARY) {
    return NextResponse.json({ error: "Invalid summary" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Insert the new version (always inactive at first; we activate it below
  // in a second step so the unique-active index never sees two active rows).
  const { data: inserted, error: insertError } = await supabase
    .from("prompt_versions")
    .insert({
      prompt_key: promptKey,
      content,
      summary,
      created_by: admin.id,
      active: false,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[/api/admin/prompts/save] insert failed:", insertError);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  if (activate) {
    // Two-step demote-then-promote. The unique partial index on (prompt_key)
    // where active=true means we must clear the existing active row first.
    const { error: demoteError } = await supabase
      .from("prompt_versions")
      .update({ active: false })
      .eq("prompt_key", promptKey)
      .eq("active", true);

    if (demoteError) {
      console.error("[/api/admin/prompts/save] demote failed:", demoteError);
      return NextResponse.json({ error: "Demote failed" }, { status: 500 });
    }

    const { error: promoteError } = await supabase
      .from("prompt_versions")
      .update({ active: true })
      .eq("id", inserted.id);

    if (promoteError) {
      console.error("[/api/admin/prompts/save] promote failed:", promoteError);
      return NextResponse.json({ error: "Promote failed" }, { status: 500 });
    }
  }

  await emitEvent(admin.id, "prompt.saved", {
    id: inserted.id,
    prompt_key: promptKey,
    version_id: inserted.id,
    activated: activate,
    summary,
  });

  return NextResponse.json({ ok: true, id: inserted.id });
}
