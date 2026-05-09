import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { recordAiUsage } from "./ai-usage";

const MODEL_ID = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are reviewing a chat between a prospect and the Stratus Creative AI assistant. Extract the following as strict JSON only (no prose):

\`\`\`json
{
  "businessSummary": "<one-sentence description of what business/situation the visitor seems to have>",
  "askedFor": "<one-sentence description of what they were asking about>",
  "suggestedProjectType": "<one of: starter, custom, ai-workflow, audit, unsure>",
  "suggestedEmail": "<email address if the visitor mentioned one, otherwise null>"
}
\`\`\``;

export type ChatSummary = {
  businessSummary: string;
  askedFor: string;
  suggestedProjectType: string;
  suggestedEmail: string | null;
};

const ALLOWED_TYPES = new Set([
  "starter",
  "custom",
  "ai-workflow",
  "audit",
  "unsure",
]);

function buildTranscript(
  messages: Array<{ role: string; content: string }>
): string {
  return messages
    .map((m) => {
      const speaker = m.role === "user" ? "Visitor" : "Assistant";
      return `${speaker}: ${m.content}`;
    })
    .join("\n");
}

/**
 * Summarize a chat conversation via Anthropic. Returns null on any failure
 * (model error, JSON parse failure, missing fields). Never throws.
 */
export async function summarizeChat(
  messages: Array<{ role: string; content: string }>
): Promise<ChatSummary | null> {
  try {
    const { text, usage } = await generateText({
      model: anthropic(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: buildTranscript(messages),
      maxOutputTokens: 400,
    });

    void recordAiUsage(
      "chat_summary",
      MODEL_ID,
      usage?.inputTokens ?? 0,
      usage?.outputTokens ?? 0
    );

    let raw = text.trim();
    if (raw.startsWith("```")) {
      raw = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error(
          "[chat-summarizer] JSON parse failed, no object found:",
          raw.slice(0, 200)
        );
        return null;
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        console.error(
          "[chat-summarizer] JSON parse failed:",
          e,
          raw.slice(0, 200)
        );
        return null;
      }
    }

    if (!parsed || typeof parsed !== "object") {
      console.error("[chat-summarizer] Parsed value is not an object");
      return null;
    }

    const obj = parsed as Record<string, unknown>;

    const businessSummary =
      typeof obj.businessSummary === "string" && obj.businessSummary.trim()
        ? obj.businessSummary.trim()
        : "";
    const askedFor =
      typeof obj.askedFor === "string" && obj.askedFor.trim()
        ? obj.askedFor.trim()
        : "";

    const suggestedProjectTypeRaw =
      typeof obj.suggestedProjectType === "string"
        ? obj.suggestedProjectType.trim().toLowerCase()
        : "";
    const suggestedProjectType = ALLOWED_TYPES.has(suggestedProjectTypeRaw)
      ? suggestedProjectTypeRaw
      : "unsure";

    let suggestedEmail: string | null = null;
    if (typeof obj.suggestedEmail === "string") {
      const trimmed = obj.suggestedEmail.trim();
      if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        suggestedEmail = trimmed;
      }
    }

    if (!businessSummary || !askedFor) {
      console.error("[chat-summarizer] Missing required summary fields");
      return null;
    }

    return {
      businessSummary,
      askedFor,
      suggestedProjectType,
      suggestedEmail,
    };
  } catch (err) {
    console.error("[chat-summarizer] generateText failed:", err);
    return null;
  }
}
