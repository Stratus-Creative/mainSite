import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { recordAiUsage } from "./ai-usage";

const MODEL_ID = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are James from Stratus Creative drafting a personal reply email to a prospect. Match this voice:

- Direct, specific, plain English
- Three short paragraphs MAX, often less
- Use real numbers (e.g. "$1,495", "5–7 business days") when relevant
- No "Great question!", no "I'd be happy to help!", no exclamation points
- End with a single clear next step (e.g. "send me X by Y" or "book at /start")

Don't invent prices or commit to dates. If unclear what to quote, point to /start and ask the right question.

Output the email body only. No greeting, no signature — those are added by the system. Just the body paragraphs.`;

export type DraftableSubmission = {
  owner_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  source?: string | null;
  project_type?: string | null;
  budget?: string | null;
  message?: string | null;
  website_url?: string | null;
  concern?: string | null;
  internal_notes?: string | null;
  quoted_amount?: number | null;
  quoted_scope?: string | null;
};

export type RecentNote = {
  body: string;
  created_at: string;
};

export type RecentEvent = {
  action: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
};

function buildUserMessage(
  submission: DraftableSubmission,
  recentNotes: RecentNote[],
  recentEvents: RecentEvent[],
  voiceContext?: string | null
): string {
  const sections: string[] = [];

  const lead: string[] = [];
  if (submission.owner_name) lead.push(`Name: ${submission.owner_name}`);
  if (submission.business_name) lead.push(`Business: ${submission.business_name}`);
  if (submission.email) lead.push(`Email: ${submission.email}`);
  if (submission.source) lead.push(`Source: ${submission.source}`);
  if (submission.project_type) lead.push(`Project type: ${submission.project_type}`);
  if (submission.budget) lead.push(`Budget range: ${submission.budget}`);
  if (submission.website_url) lead.push(`Website: ${submission.website_url}`);
  if (submission.concern) lead.push(`Audit concern: ${submission.concern}`);
  if (submission.quoted_amount)
    lead.push(`Quoted amount: $${submission.quoted_amount}`);
  if (submission.quoted_scope) lead.push(`Quoted scope: ${submission.quoted_scope}`);
  if (lead.length > 0) sections.push("LEAD:\n" + lead.join("\n"));

  if (submission.message) {
    sections.push("THEIR MESSAGE:\n" + submission.message);
  }

  if (submission.internal_notes) {
    sections.push("INTERNAL NOTES:\n" + submission.internal_notes);
  }

  if (recentNotes.length > 0) {
    sections.push(
      "RECENT NOTES:\n" +
        recentNotes
          .map((n) => `- (${n.created_at}) ${n.body}`)
          .join("\n")
    );
  }

  if (recentEvents.length > 0) {
    sections.push(
      "RECENT ACTIVITY:\n" +
        recentEvents
          .map((e) => {
            const summary =
              e.metadata && typeof e.metadata.summary === "string"
                ? e.metadata.summary
                : JSON.stringify(e.metadata ?? {});
            return `- (${e.created_at}) ${e.action} ${summary}`;
          })
          .join("\n")
    );
  }

  if (voiceContext) {
    sections.push("VOICE CONTEXT:\n" + voiceContext);
  }

  sections.push(
    "Draft the email body for James to send back. Body only — no greeting, no sign-off."
  );

  return sections.join("\n\n");
}

/**
 * Generate an email reply draft from James's voice for a given submission.
 * Returns null on any error. Never throws.
 */
export async function draftReply(
  submission: DraftableSubmission,
  recentNotes: RecentNote[],
  recentEvents: RecentEvent[],
  voiceContext?: string | null
): Promise<string | null> {
  try {
    const { text, usage } = await generateText({
      model: anthropic(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: buildUserMessage(submission, recentNotes, recentEvents, voiceContext),
      maxOutputTokens: 600,
    });

    void recordAiUsage(
      "draft_reply",
      MODEL_ID,
      usage?.inputTokens ?? 0,
      usage?.outputTokens ?? 0
    );

    const trimmed = text.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch (err) {
    console.error("[draft-reply] generateText failed:", err);
    return null;
  }
}
