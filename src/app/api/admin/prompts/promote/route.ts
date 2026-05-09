import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body && typeof body.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: version, error: lookupError } = await supabase
    .from("prompt_versions")
    .select("id, prompt_key, active")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  if (version.active) {
    return NextResponse.json({ ok: true });
  }

  // Two-step demote-then-promote scoped to this prompt_key. The partial unique
  // index (prompt_key) where active=true forbids two active rows, so we must
  // clear the current active row before activating the new one.
  const { error: demoteError } = await supabase
    .from("prompt_versions")
    .update({ active: false })
    .eq("prompt_key", version.prompt_key)
    .eq("active", true);

  if (demoteError) {
    console.error("[/api/admin/prompts/promote] demote failed:", demoteError);
    return NextResponse.json({ error: "Demote failed" }, { status: 500 });
  }

  const { error: promoteError } = await supabase
    .from("prompt_versions")
    .update({ active: true })
    .eq("id", id);

  if (promoteError) {
    console.error("[/api/admin/prompts/promote] promote failed:", promoteError);
    return NextResponse.json({ error: "Promote failed" }, { status: 500 });
  }

  await emitEvent(admin.id, "prompt.saved", {
    id,
    prompt_key: version.prompt_key,
    version_id: id,
    activated: true,
    promoted: true,
  });

  return NextResponse.json({ ok: true });
}
