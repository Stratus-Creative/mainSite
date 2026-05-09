import { createServerClient } from "./supabase";

/**
 * Anthropic per-1M-token pricing in USD (current as of late 2025/early 2026).
 * Add new models as they're adopted. If a model isn't listed, computeCost
 * falls back to 0 and we still record the row for visibility.
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
};

/**
 * Compute cost in USD for a given model + token usage. Returns 0 if the model
 * has no pricing entry (so callers don't blow up on unknown models).
 */
export function computeCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  const input = (Math.max(0, inputTokens) / 1_000_000) * pricing.input;
  const output = (Math.max(0, outputTokens) / 1_000_000) * pricing.output;
  // Round to 6 decimal places to fit numeric(10,6) cleanly.
  return Math.round((input + output) * 1_000_000) / 1_000_000;
}

/**
 * Best-effort insert into ai_usage. Never throws — failures are logged and
 * swallowed so AI features keep working even if the ledger is down.
 */
export async function recordAiUsage(
  feature: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const safeInput = Number.isFinite(inputTokens) ? Math.max(0, Math.round(inputTokens)) : 0;
    const safeOutput = Number.isFinite(outputTokens) ? Math.max(0, Math.round(outputTokens)) : 0;
    const cost = computeCost(model, safeInput, safeOutput);

    const supabase = createServerClient();
    const { error } = await supabase.from("ai_usage").insert({
      feature,
      model,
      input_tokens: safeInput,
      output_tokens: safeOutput,
      cost_usd: cost,
      metadata: metadata ?? null,
    });

    if (error) {
      console.error("[ai-usage] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[ai-usage] recordAiUsage threw:", err);
  }
}
