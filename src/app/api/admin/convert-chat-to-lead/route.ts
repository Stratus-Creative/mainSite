import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";
import { summarizeChat } from "@/lib/chat-summarizer";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const conversationId =
    body && typeof body === "object" && "conversationId" in body
      ? (body as { conversationId: unknown }).conversationId
      : null;

  if (typeof conversationId !== "string" || !conversationId.trim()) {
    return NextResponse.json(
      { error: "missing_conversation_id" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Load conversation
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .select("id, session_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (convoError || !conversation) {
    return NextResponse.json(
      { error: "conversation_not_found" },
      { status: 404 }
    );
  }

  // Reject if already linked
  const { data: existing } = await supabase
    .from("chat_attribution")
    .select("submission_id")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (existing?.submission_id) {
    return NextResponse.json(
      {
        error: "already_linked",
        submissionId: existing.submission_id,
      },
      { status: 409 }
    );
  }

  // Load messages
  const { data: messagesData, error: msgError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("[convert-chat-to-lead] message fetch failed:", msgError);
    return NextResponse.json({ error: "message_fetch_failed" }, { status: 500 });
  }

  const messages = (messagesData ?? []) as Array<{
    role: string;
    content: string;
  }>;

  // AI summarize
  const summary = await summarizeChat(messages);
  if (!summary) {
    return NextResponse.json(
      { error: "summarization_failed" },
      { status: 502 }
    );
  }

  // Create submission row
  const messageBody = `Auto-generated from chat:\n\n${summary.businessSummary}\n\nAsked for: ${summary.askedFor}`;

  const { data: insertedSubmission, error: insertError } = await supabase
    .from("submissions")
    .insert({
      source: "chat-widget",
      email: summary.suggestedEmail,
      business_name: null,
      owner_name: null,
      project_type: summary.suggestedProjectType,
      message: messageBody,
      status: "received",
    })
    .select("id")
    .single();

  if (insertError || !insertedSubmission) {
    console.error(
      "[convert-chat-to-lead] submission insert failed:",
      insertError
    );
    return NextResponse.json(
      { error: "submission_insert_failed" },
      { status: 500 }
    );
  }

  const submissionId = insertedSubmission.id as string;

  // Insert attribution link (best-effort: don't fail the request if this errors,
  // but do try)
  const { error: attribError } = await supabase
    .from("chat_attribution")
    .insert({
      conversation_id: conversationId,
      submission_id: submissionId,
    });

  if (attribError) {
    console.error(
      "[convert-chat-to-lead] chat_attribution insert failed:",
      attribError
    );
  }

  // Fire event (audit + webhooks)
  await emitEvent(admin.id, "submission.created", {
    id: submissionId,
    business_name: null,
    owner_name: null,
    email: summary.suggestedEmail,
    source: "chat-widget",
    project_type: summary.suggestedProjectType,
  });

  return NextResponse.json({ ok: true, submissionId });
}
