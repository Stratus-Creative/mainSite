import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { recordAiUsage } from "./ai-usage";

const MODEL_ID = "claude-haiku-4-5-20251001";

export type VoiceIssue = {
  rule: string;
  severity: "warn" | "block";
  excerpt: string;
  message: string;
};

export type VoiceCheckResult = {
  issues: VoiceIssue[];
  score: number;
};

type DeterministicRule = {
  id: string;
  severity: "warn" | "block";
  message: string;
  // Either pattern or detector returns matches.
  pattern?: RegExp;
  detector?: (text: string) => string[];
};

// Deterministic rules — instant, no LLM. Cheap to extend.
const DETERMINISTIC_RULES: DeterministicRule[] = [
  {
    id: "no_great_question",
    severity: "warn",
    message: "Avoid 'Great question' — it reads as filler praise.",
    pattern: /\bgreat question\b/gi,
  },
  {
    id: "no_happy_to_help",
    severity: "warn",
    message: "Avoid 'I'd be happy to help' / 'happy to help'.",
    pattern: /\b(i'?d be )?happy to help\b/gi,
  },
  {
    id: "no_absolutely",
    severity: "warn",
    message: "Avoid 'Absolutely!' — too eager.",
    pattern: /\babsolutely!?\b/gi,
  },
  {
    id: "no_of_course",
    severity: "warn",
    message: "Avoid 'Of course!' — sounds servile.",
    pattern: /\bof course!?\b/gi,
  },
  {
    id: "no_let_me_explain",
    severity: "warn",
    message: "Avoid filler intros like 'Let me explain' — just answer.",
    pattern: /\blet me explain\b/gi,
  },
  {
    id: "no_so_basically",
    severity: "warn",
    message: "Avoid 'So basically' — get to the point.",
    pattern: /\bso basically\b/gi,
  },
  {
    id: "no_to_answer_your_question",
    severity: "warn",
    message: "Skip 'To answer your question' — just answer it.",
    pattern: /\bto answer your question\b/gi,
  },
  {
    id: "no_feel_free",
    severity: "warn",
    message: "Avoid 'Feel free to' / 'Don't hesitate to'.",
    pattern: /\b(feel free to|don'?t hesitate to)\b/gi,
  },
  {
    id: "no_exclamation",
    severity: "warn",
    message: "No exclamation points — voice is direct, not enthusiastic.",
    pattern: /!/g,
  },
  {
    id: "no_emoji",
    severity: "warn",
    message: "No emojis in outbound voice.",
    detector: (text) => {
      const emojiRegex =
        /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;
      const m = text.match(emojiRegex);
      return m ?? [];
    },
  },
  {
    id: "em_dash_overuse",
    severity: "warn",
    message: "Em-dash overuse — three or more em-dashes reads as a tic.",
    detector: (text) => {
      const matches = text.match(/—/g) ?? [];
      // Only flag if 3+ em-dashes in the text (allow 1–2).
      return matches.length >= 3 ? matches : [];
    },
  },
  {
    id: "no_promised_date",
    severity: "block",
    message:
      "Don't promise specific delivery dates — James scopes timeline at /start.",
    detector: (text) => {
      const out: string[] = [];
      // Match "by Friday", "by Monday", "by tomorrow", "by Dec 5", etc.
      const dayWords = /\bby (next |this )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|tonight)\b/gi;
      const m1 = text.match(dayWords);
      if (m1) out.push(...m1);
      const monthAbbrev =
        /\bby (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b/gi;
      const m2 = text.match(monthAbbrev);
      if (m2) out.push(...m2);
      return out;
    },
  },
];

function runDeterministic(text: string): VoiceIssue[] {
  const issues: VoiceIssue[] = [];
  for (const rule of DETERMINISTIC_RULES) {
    const matches: string[] = [];
    if (rule.pattern) {
      const m = text.match(rule.pattern);
      if (m) matches.push(...m);
    } else if (rule.detector) {
      matches.push(...rule.detector(text));
    }
    if (matches.length === 0) continue;
    // Collapse repeated matches into one issue with the first excerpt.
    issues.push({
      rule: rule.id,
      severity: rule.severity,
      excerpt: matches[0],
      message:
        matches.length > 1
          ? `${rule.message} (${matches.length} occurrences)`
          : rule.message,
    });
  }
  return issues;
}

const LLM_SYSTEM_PROMPT = `You are a voice editor for Stratus Creative outbound writing. The voice is: direct, specific, plain English. Like a senior engineer talking to a friend, not a salesperson.

Flag anything that violates these rules:
- No "Great question", "I'd be happy to help", "Absolutely!", "Of course!"
- No exclamation points or emojis
- No em-dash overuse
- No filler intros ("Let me explain…", "So basically…", "To answer your question…")
- No promising delivery dates or quoting custom prices
- No "feel free to" / "don't hesitate to"
- No hedging without committing ("it depends" without an answer)
- Length floor: a one-sentence answer if a one-sentence answer is correct
- No marketing-speak, salesperson tone, or excessive enthusiasm

Output STRICT JSON, nothing else, no prose, no markdown:
{"issues": [{"rule": "<short_snake_case_id>", "excerpt": "<exact text snippet>", "message": "<one sentence>"}]}

If the text is clean, return: {"issues": []}

Do NOT flag the same issue with overlapping rules — pick the most specific. Do not flag deterministic rules already covered (great_question, happy_to_help, exclamation, emoji, em_dash, let_me_explain, so_basically, to_answer_your_question, absolutely, of_course, feel_free, promised_date). Focus on subtler issues only: tone, length, hedging, marketing-speak, salesperson energy, vague answers.`;

type LlmIssue = {
  rule?: unknown;
  excerpt?: unknown;
  message?: unknown;
};

function extractJson(text: string): unknown {
  // Strip code fences if present, then try to find the first {...} block.
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function runLlm(text: string): Promise<VoiceIssue[]> {
  try {
    const { text: out, usage } = await generateText({
      model: anthropic(MODEL_ID),
      system: LLM_SYSTEM_PROMPT,
      prompt: `Evaluate this text:\n\n${text}`,
      maxOutputTokens: 300,
    });

    void recordAiUsage(
      "voice_check",
      MODEL_ID,
      usage?.inputTokens ?? 0,
      usage?.outputTokens ?? 0
    );

    const parsed = extractJson(out) as { issues?: LlmIssue[] } | null;
    if (!parsed || !Array.isArray(parsed.issues)) return [];

    const issues: VoiceIssue[] = [];
    for (const raw of parsed.issues) {
      const rule = typeof raw.rule === "string" ? raw.rule.slice(0, 64) : "";
      const excerpt =
        typeof raw.excerpt === "string" ? raw.excerpt.slice(0, 200) : "";
      const message =
        typeof raw.message === "string" ? raw.message.slice(0, 240) : "";
      if (!rule || !message) continue;
      issues.push({
        rule,
        severity: "warn", // LLM-detected nuance is always warn-level
        excerpt: excerpt || text.slice(0, 80),
        message,
      });
    }
    return issues;
  } catch (err) {
    console.error("[voice-check] generateText failed:", err);
    return [];
  }
}

function dedupe(issues: VoiceIssue[]): VoiceIssue[] {
  const seen = new Set<string>();
  const out: VoiceIssue[] = [];
  for (const i of issues) {
    const key = `${i.rule}::${i.excerpt.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(i);
  }
  return out;
}

function computeScore(issues: VoiceIssue[]): number {
  let warn = 0;
  let block = 0;
  for (const i of issues) {
    if (i.severity === "block") block += 1;
    else warn += 1;
  }
  const score = 100 - warn * 8 - block * 25;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Run a voice check over `text`. Combines deterministic regex rules with an
 * LLM nuance pass. Never throws — falls back to deterministic-only on errors.
 */
export async function checkVoice(text: string): Promise<VoiceCheckResult> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) {
    return { issues: [], score: 100 };
  }

  const deterministic = runDeterministic(trimmed);

  let llmIssues: VoiceIssue[] = [];
  if (trimmed.length > 50) {
    llmIssues = await runLlm(trimmed);
  }

  const combined = dedupe([...deterministic, ...llmIssues]);
  return { issues: combined, score: computeScore(combined) };
}
