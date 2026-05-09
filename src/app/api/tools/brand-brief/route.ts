import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { recordAiUsage } from "@/lib/ai-usage";
import { getClientIp } from "@/lib/rate-limit";

const MODEL_ID = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are a brand strategist generating a discovery brief for a small-business website project. Given a brief description from the business owner, output strict JSON in this shape:

{
  "businessOverview": "<2-3 sentences summarizing what the business does>",
  "targetAudience": "<who the customers are, including demographics, psychographics, and the situations they're in when they need the service>",
  "brandVoice": "<3-5 adjectives describing the brand personality, plus a sentence on tone>",
  "successCriteria": "<what winning looks like — leads, calls, brand recognition, etc — in concrete terms>",
  "existingAssets": "<best guess at what they likely have: logo, photos, social presence — in 1-2 sentences>",
  "inspirationSites": "<2-3 example types of sites or brands they should look at for inspiration>"
}

Match the voice of a senior product strategist talking to a friend: direct, specific, no fluff, no exclamation points, no "Great question!" Plain English.`;

// In-memory rate limit: 10 requests per IP per hour.
type RateBucket = { count: number; resetAt: number };
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, RateBucket>();

function checkInMemoryRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitStore.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return false;
  }
  bucket.count += 1;
  return true;
}

type Brief = {
  businessOverview: string;
  targetAudience: string;
  brandVoice: string;
  successCriteria: string;
  existingAssets: string;
  inspirationSites: string;
};

function parseBriefJson(raw: string): Brief | null {
  const trimmed = raw.trim();

  // Try direct parse first.
  try {
    const parsed = JSON.parse(trimmed);
    if (isBrief(parsed)) return parsed;
  } catch {
    // fall through
  }

  // Strip ```json ... ``` fences.
  const fenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (fenced !== trimmed) {
    try {
      const parsed = JSON.parse(fenced);
      if (isBrief(parsed)) return parsed;
    } catch {
      // fall through
    }
  }

  // Regex-extract the first {...} block.
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (isBrief(parsed)) return parsed;
    } catch {
      // fall through
    }
  }

  return null;
}

function isBrief(value: unknown): value is Brief {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.businessOverview === "string" &&
    typeof v.targetAudience === "string" &&
    typeof v.brandVoice === "string" &&
    typeof v.successCriteria === "string" &&
    typeof v.existingAssets === "string" &&
    typeof v.inspirationSites === "string"
  );
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkInMemoryRateLimit(ip)) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (description.length < 30 || description.length > 2000) {
      return NextResponse.json(
        { error: "invalid_description" },
        { status: 400 }
      );
    }

    const { text, usage } = await generateText({
      model: anthropic(MODEL_ID),
      system: SYSTEM_PROMPT,
      prompt: `Business description from the owner:\n\n${description}\n\nReturn the JSON object only — no preamble, no commentary.`,
      maxOutputTokens: 800,
    });

    const brief = parseBriefJson(text);
    if (!brief) {
      console.error("[brand-brief] failed to parse JSON from model output:", text.slice(0, 500));
      return NextResponse.json(
        { error: "parse_failed" },
        { status: 500 }
      );
    }

    void recordAiUsage(
      "brand_brief",
      MODEL_ID,
      usage?.inputTokens ?? 0,
      usage?.outputTokens ?? 0,
      { description: description.slice(0, 200) }
    );

    return NextResponse.json({ ok: true, brief });
  } catch (err) {
    console.error("[brand-brief]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
