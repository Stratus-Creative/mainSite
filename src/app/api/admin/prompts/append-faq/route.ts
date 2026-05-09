import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { emitEvent } from "@/lib/webhook-dispatch";

const MAX_Q = 1_000;
const MAX_A = 4_000;
const MAX_CONTENT = 64_000;
const PROMPT_KEY = "chat-system";
const SECTION_HEADING = "## CURATED ANSWERS";

function appendFaq(content: string, question: string, answer: string): string {
  const block = `\n\nQ: ${question.trim()}\nA: ${answer.trim()}`;
  if (content.includes(SECTION_HEADING)) {
    // Append after the existing section. We just stick it at end of file —
    // the section heading gives the model the framing once.
    return `${content.trimEnd()}${block}`;
  }
  return `${content.trimEnd()}\n\n${SECTION_HEADING}${block}`;
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  const summaryIn =
    typeof body.summary === "string" ? body.summary.trim() : "";

  if (!question || question.length > MAX_Q) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }
  if (!answer || answer.length > MAX_A) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Load currently active prompt to get baseline content.
  const { data: active, error: activeErr } = await supabase
    .from("prompt_versions")
    .select("content")
    .eq("prompt_key", PROMPT_KEY)
    .eq("active", true)
    .maybeSingle();

  if (activeErr) {
    console.error("[/api/admin/prompts/append-faq] active lookup failed:", activeErr);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  const baseContent =
    active?.content && typeof active.content === "string" ? active.content : "";
  if (!baseContent) {
    return NextResponse.json(
      { error: "No active prompt to extend. Save an initial version in /admin/prompts first." },
      { status: 400 }
    );
  }

  const nextContent = appendFaq(baseContent, question, answer);
  if (nextContent.length > MAX_CONTENT) {
    return NextResponse.json({ error: "Prompt too long after append" }, { status: 400 });
  }

  const truncatedQ =
    question.length > 80 ? question.slice(0, 77) + "..." : question;
  const summary =
    summaryIn && summaryIn.length <= 500
      ? summaryIn
      : `Added FAQ: ${truncatedQ}`;

  // Insert new inactive version, then demote-and-promote (matches existing pattern).
  const { data: inserted, error: insertError } = await supabase
    .from("prompt_versions")
    .insert({
      prompt_key: PROMPT_KEY,
      content: nextContent,
      summary,
      created_by: admin.id,
      active: false,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[/api/admin/prompts/append-faq] insert failed:", insertError);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  const { error: demoteError } = await supabase
    .from("prompt_versions")
    .update({ active: false })
    .eq("prompt_key", PROMPT_KEY)
    .eq("active", true);

  if (demoteError) {
    console.error("[/api/admin/prompts/append-faq] demote failed:", demoteError);
    return NextResponse.json({ error: "Demote failed" }, { status: 500 });
  }

  const { error: promoteError } = await supabase
    .from("prompt_versions")
    .update({ active: true })
    .eq("id", inserted.id);

  if (promoteError) {
    console.error("[/api/admin/prompts/append-faq] promote failed:", promoteError);
    return NextResponse.json({ error: "Promote failed" }, { status: 500 });
  }

  await emitEvent(admin.id, "prompt.saved", {
    id: inserted.id,
    prompt_key: PROMPT_KEY,
    version_id: inserted.id,
    activated: true,
    faq_added: true,
    question: truncatedQ,
    summary,
  });

  return NextResponse.json({ ok: true, versionId: inserted.id });
}
