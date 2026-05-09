import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { recordAiUsage } from "./ai-usage";

export type LeadScore = {
  intent: number;
  budget: number;
  fit: number;
  summary: string;
  scored_at: string;
  model: string;
};

export type ScoreableSubmission = {
  owner_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  source?: string | null;
  project_type?: string | null;
  budget?: string | null;
  message?: string | null;
  website_url?: string | null;
  concern?: string | null;
};

const MODEL_ID = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are a lead-scoring assistant for Stratus Creative, a solo web/AI studio. Score this prospect on three axes:
- intent (1-10): how seriously they're considering buying. Specific timeline, mentioned budget, or asking about scope = high. Vague exploration = low.
- budget (1-10): apparent budget fit. Stratus's offerings range $1,495 (Starter site) up to $20K (custom AI workflow). 10 = clearly in range. 1 = clearly under.
- fit (1-10): project fit for what Stratus actually does. Web + AI + small business = 10. "Build me a mobile app" = 1.

Reply in strict JSON only, no prose: {"intent": N, "budget": N, "fit": N, "summary": "<one sentence describing the lead>"}`;

function clampScore(n: unknown): number {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return 1;
  return Math.max(1, Math.min(10, Math.round(num)));
}

function buildUserMessage(s: ScoreableSubmission): string {
  const lines: string[] = [];
  if (s.owner_name) lines.push(`Name: ${s.owner_name}`);
  if (s.business_name) lines.push(`Business: ${s.business_name}`);
  if (s.email) lines.push(`Email: ${s.email}`);
  if (s.source) lines.push(`Source: ${s.source}`);
  if (s.project_type) lines.push(`Project type: ${s.project_type}`);
  if (s.budget) lines.push(`Budget range: ${s.budget}`);
  if (s.website_url) lines.push(`Website (audit): ${s.website_url}`);
  if (s.concern) lines.push(`Audit concern: ${s.concern}`);
  if (s.message) lines.push(`Message:\n${s.message}`);
  return lines.join("\n");
}

/**
 * Score a submission via the Anthropic API. Returns null on any failure
 * (model error, JSON parse failure, missing fields). Never throws.
 */
export async function scoreSubmission(
  submission: ScoreableSubmission
): Promise<LeadScore | null> {
  try {
    const { text, usage } = await generateText({
      model: anthropic(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: buildUserMessage(submission),
      maxOutputTokens: 300,
    });

    void recordAiUsage(
      "lead_scoring",
      MODEL_ID,
      usage?.inputTokens ?? 0,
      usage?.outputTokens ?? 0
    );

    // Attempt to parse the JSON. Strip leading/trailing whitespace/code-fences if any.
    let raw = text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: try to extract the first {...} block
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error("[lead-scoring] JSON parse failed, no object found:", raw.slice(0, 200));
        return null;
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        console.error("[lead-scoring] JSON parse failed:", e, raw.slice(0, 200));
        return null;
      }
    }

    if (!parsed || typeof parsed !== "object") {
      console.error("[lead-scoring] Parsed value is not an object:", parsed);
      return null;
    }

    const obj = parsed as Record<string, unknown>;
    const summary =
      typeof obj.summary === "string" && obj.summary.trim().length > 0
        ? obj.summary.trim()
        : null;
    if (!summary) {
      console.error("[lead-scoring] Missing summary field");
      return null;
    }

    return {
      intent: clampScore(obj.intent),
      budget: clampScore(obj.budget),
      fit: clampScore(obj.fit),
      summary,
      scored_at: new Date().toISOString(),
      model: MODEL_ID,
    };
  } catch (err) {
    console.error("[lead-scoring] generateText failed:", err);
    return null;
  }
}
