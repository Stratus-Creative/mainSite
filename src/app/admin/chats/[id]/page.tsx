import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { AdminBar } from "@/components/admin-bar";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { ChatActions } from "./chat-actions";
import { ConvertToLead } from "./convert-to-lead";
import { AddToPrompt } from "./add-to-prompt";

export const metadata: Metadata = {
  title: "Conversation — Stratus Admin",
  robots: { index: false, follow: false },
};

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  session_id: string;
  page_url: string | null;
  created_at: string;
  flagged: boolean | null;
  starred: boolean | null;
  tags: string[] | null;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Params {
  params: Promise<{ id: string }>;
}

export default async function AdminChatDetailPage({ params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;

  const supabase = createServerClient();
  const { data: conversation, error: convoError } = await supabase
    .from("conversations")
    .select("id, session_id, page_url, created_at, flagged, starred, tags")
    .eq("id", id)
    .maybeSingle();

  if (convoError || !conversation) notFound();

  const convo = conversation as Conversation;

  const { data: messagesData } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const messages = (messagesData as Message[] | null) ?? [];

  const { data: attributionRow } = await supabase
    .from("chat_attribution")
    .select("submission_id")
    .eq("conversation_id", id)
    .maybeSingle();

  const linkedSubmissionId =
    (attributionRow?.submission_id as string | undefined) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AdminBar />

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Back */}
        <Link
          href="/admin/chats"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All conversations
        </Link>

        {/* Triage actions */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <ChatActions
            conversationId={convo.id}
            initialStarred={Boolean(convo.starred)}
            initialFlagged={Boolean(convo.flagged)}
            initialTags={Array.isArray(convo.tags) ? convo.tags : []}
          />
          <ConvertToLead
            conversationId={convo.id}
            existingSubmissionId={linkedSubmissionId}
          />
        </div>

        {/* Header */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              Conversation
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {convo.page_url ?? "—"}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Started {formatDateTime(convo.created_at)} · {messages.length}{" "}
              message{messages.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Suggest a Q&A for the prompt */}
        <div className="mt-8">
          <AddToPrompt />
        </div>

        {/* Transcript */}
        <div className="mx-auto mt-10 max-w-4xl space-y-5">
          {messages.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No messages in this conversation.
            </p>
          )}

          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                    isUser
                      ? "bg-foreground text-background"
                      : "border border-border/60 bg-card text-foreground"
                  }`}
                >
                  {m.content}
                </div>
                <p
                  className={`mt-1.5 px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground`}
                >
                  {m.role} · {formatTime(m.created_at)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Reference */}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          {convo.id}
        </p>
      </main>
    </div>
  );
}
