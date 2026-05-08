/**
 * Stratus Creative — AI Workflow Cost Estimator
 *
 * Pure pricing logic + reference data. All UI sits on top of this.
 * Numbers are checked against published provider pricing as of 2026-05-08.
 * Update PRICING_LAST_UPDATED whenever any constant in this file changes.
 */

// Stored as ISO; format functions render it human-friendly.
export const PRICING_LAST_UPDATED_ISO = "2026-05-08";
export const PRICING_LAST_UPDATED = formatLongDate(PRICING_LAST_UPDATED_ISO);

function formatLongDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ----------------------------------------------------------------------
// LLM model pricing (per 1M tokens, in USD)
// ----------------------------------------------------------------------

export type ModelKey =
  | "gpt-4o-mini"
  | "gpt-4o"
  | "o1-mini"
  | "o1"
  | "claude-haiku"
  | "claude-sonnet"
  | "claude-opus"
  | "gemini-flash"
  | "gemini-pro";

export interface ModelPrice {
  key: ModelKey;
  name: string;
  provider: "openai" | "anthropic" | "google";
  inputPerM: number;
  outputPerM: number;
  // Cached input pricing (Anthropic + Google) — falls back to inputPerM
  cachedInputPerM?: number;
  // Typical latency to first token (ms) — for latency estimates only
  latencyMs: number;
  // Typical output tokens/sec — for total response time estimates
  outputTokensPerSec: number;
  good_for: string;
}

export const MODELS: Record<ModelKey, ModelPrice> = {
  "gpt-4o-mini": {
    key: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    inputPerM: 0.15,
    outputPerM: 0.6,
    latencyMs: 500,
    outputTokensPerSec: 50,
    good_for: "Classification, simple chat, light reasoning",
  },
  "gpt-4o": {
    key: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    inputPerM: 2.5,
    outputPerM: 10,
    latencyMs: 1500,
    outputTokensPerSec: 30,
    good_for: "Most production workflows, balanced cost/quality",
  },
  "o1-mini": {
    key: "o1-mini",
    name: "o1-mini",
    provider: "openai",
    inputPerM: 3,
    outputPerM: 12,
    latencyMs: 5000,
    outputTokensPerSec: 25,
    good_for: "Lightweight reasoning, math, structured output",
  },
  "o1": {
    key: "o1",
    name: "o1",
    provider: "openai",
    inputPerM: 15,
    outputPerM: 60,
    latencyMs: 12000,
    outputTokensPerSec: 20,
    good_for: "Complex multi-step reasoning (high latency)",
  },
  "claude-haiku": {
    key: "claude-haiku",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    inputPerM: 0.8,
    outputPerM: 4,
    cachedInputPerM: 0.08,
    latencyMs: 600,
    outputTokensPerSec: 50,
    good_for: "Fast, cheap chat with great quality",
  },
  "claude-sonnet": {
    key: "claude-sonnet",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    inputPerM: 3,
    outputPerM: 15,
    cachedInputPerM: 0.3,
    latencyMs: 1500,
    outputTokensPerSec: 30,
    good_for: "Most production workflows, especially with long context",
  },
  "claude-opus": {
    key: "claude-opus",
    name: "Claude Opus 4.7",
    provider: "anthropic",
    inputPerM: 15,
    outputPerM: 75,
    cachedInputPerM: 1.5,
    latencyMs: 3500,
    outputTokensPerSec: 25,
    good_for: "Maximum quality, complex agents",
  },
  "gemini-flash": {
    key: "gemini-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    inputPerM: 0.3,
    outputPerM: 2.5,
    latencyMs: 500,
    outputTokensPerSec: 60,
    good_for: "Fast multimodal, long context, low cost",
  },
  "gemini-pro": {
    key: "gemini-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    inputPerM: 1.25,
    outputPerM: 10,
    latencyMs: 1800,
    outputTokensPerSec: 30,
    good_for: "Top-tier reasoning, multimodal, very long context",
  },
};

// ----------------------------------------------------------------------
// Common third-party API costs
// ----------------------------------------------------------------------

export type ThirdPartyApiKey =
  | "vin-decoder"
  | "sms"
  | "voice-min"
  | "transcription-min"
  | "web-scrape"
  | "geocoding"
  | "email-parsing"
  | "image-gen"
  | "vector-db";

export interface ThirdPartyApi {
  key: ThirdPartyApiKey;
  name: string;
  unit: "per call" | "per minute" | "per month";
  costPerUnit: number;
  // Typical latency added per call (ms). 0 means async/negligible from user's perspective.
  latencyMs: number;
  description: string;
}

export const THIRD_PARTY_APIS: Record<ThirdPartyApiKey, ThirdPartyApi> = {
  "vin-decoder": {
    key: "vin-decoder",
    name: "VIN decoder",
    unit: "per call",
    costPerUnit: 0.05,
    latencyMs: 200,
    description: "Vehicle data (year, make, model, specs)",
  },
  sms: {
    key: "sms",
    name: "SMS (Twilio)",
    unit: "per call",
    costPerUnit: 0.008,
    latencyMs: 100,
    description: "Inbound or outbound SMS message",
  },
  "voice-min": {
    key: "voice-min",
    name: "Voice telephony (Twilio)",
    unit: "per minute",
    costPerUnit: 0.022,
    latencyMs: 0,
    description: "Inbound or outbound voice call",
  },
  "transcription-min": {
    key: "transcription-min",
    name: "Transcription (AssemblyAI / Whisper)",
    unit: "per minute",
    costPerUnit: 0.01,
    latencyMs: 1500,
    description: "Audio → text transcription",
  },
  "web-scrape": {
    key: "web-scrape",
    name: "Web scraping (Apify / Browse)",
    unit: "per call",
    costPerUnit: 0.02,
    latencyMs: 4000,
    description: "Fetch + render a page",
  },
  geocoding: {
    key: "geocoding",
    name: "Geocoding (Google Maps)",
    unit: "per call",
    costPerUnit: 0.005,
    latencyMs: 150,
    description: "Address → lat/lng",
  },
  "email-parsing": {
    key: "email-parsing",
    name: "Email parsing (Postmark inbound)",
    unit: "per call",
    costPerUnit: 0.01,
    latencyMs: 0,
    description: "Receive + parse inbound email",
  },
  "image-gen": {
    key: "image-gen",
    name: "Image generation (DALL-E / SDXL)",
    unit: "per call",
    costPerUnit: 0.04,
    latencyMs: 8000,
    description: "Standard quality image",
  },
  "vector-db": {
    key: "vector-db",
    name: "Vector DB (Pinecone serverless)",
    unit: "per month",
    costPerUnit: 70,
    latencyMs: 80,
    description: "RAG vector storage + search (fixed monthly minimum)",
  },
};

// ----------------------------------------------------------------------
// Care tiers
// ----------------------------------------------------------------------

export type CareTier = "light" | "standard" | "pro";

export interface CareTierInfo {
  key: CareTier;
  name: string;
  monthly: number;
  hours: string;
  description: string;
  fits: string[];
}

export const CARE_TIERS: Record<CareTier, CareTierInfo> = {
  light: {
    key: "light",
    name: "AI Care · Light",
    monthly: 199,
    hours: "Up to 3 hrs/mo",
    description:
      "Monitoring, small fixes, model upgrades. Good for single-purpose AI workflows with light volume.",
    fits: [
      "FAQ chatbot",
      "Email triage / classification",
      "Lead scoring",
      "Document tagging",
    ],
  },
  standard: {
    key: "standard",
    name: "AI Care · Standard",
    monthly: 399,
    hours: "Up to 6 hrs/mo",
    description:
      "Multi-step workflows with memory, integrations, or moderate volume. Most clients land here.",
    fits: [
      "Customer support bot with conversation memory",
      "Quote/estimate generators (the car-repair tool)",
      "Lead qualification with web research",
      "Document Q&A with RAG",
    ],
  },
  pro: {
    key: "pro",
    name: "AI Care · Pro",
    monthly: 899,
    hours: "Up to 12 hrs/mo",
    description:
      "High-volume, complex, or multi-agent systems. White-glove monitoring + priority response.",
    fits: [
      "Voice AI agents (telephony + AI)",
      "Multi-agent autonomous research",
      "High-volume real-time pipelines",
      "Enterprise integrations",
    ],
  },
};

// ----------------------------------------------------------------------
// Pre-built workflow templates
// ----------------------------------------------------------------------

export type TemplateKey =
  | "blank"
  | "faq-bot"
  | "email-triage"
  | "support-bot"
  | "quote-generator"
  | "lead-qualifier"
  | "voice-agent";

export interface WorkflowTemplate {
  key: TemplateKey;
  name: string;
  blurb: string;
  monthlyVolume: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  model: ModelKey;
  useRag: boolean;
  cachedInputPercent: number; // 0-100
  thirdPartyUsage: Partial<Record<ThirdPartyApiKey, number>>; // unit count per request
  fixedMonthlyApis: ThirdPartyApiKey[]; // e.g. vector-db is monthly fixed
}

export const TEMPLATES: Record<TemplateKey, WorkflowTemplate> = {
  blank: {
    key: "blank",
    name: "Blank workflow",
    blurb: "Start from scratch — describe your own workflow from zero.",
    monthlyVolume: 100,
    avgInputTokens: 1000,
    avgOutputTokens: 300,
    model: "claude-haiku",
    useRag: false,
    cachedInputPercent: 0,
    thirdPartyUsage: {},
    fixedMonthlyApis: [],
  },
  "faq-bot": {
    key: "faq-bot",
    name: "FAQ chatbot",
    blurb: "Answers common questions from a small knowledge base. Stateless.",
    monthlyVolume: 500,
    avgInputTokens: 800,
    avgOutputTokens: 250,
    model: "gpt-4o-mini",
    useRag: true,
    cachedInputPercent: 60,
    thirdPartyUsage: {},
    fixedMonthlyApis: ["vector-db"],
  },
  "email-triage": {
    key: "email-triage",
    name: "Email triage / classification",
    blurb:
      "Reads inbound emails, scores them, categorizes, drafts responses. Per email.",
    monthlyVolume: 300,
    avgInputTokens: 1500,
    avgOutputTokens: 200,
    model: "gpt-4o-mini",
    useRag: false,
    cachedInputPercent: 0,
    thirdPartyUsage: { "email-parsing": 1 },
    fixedMonthlyApis: [],
  },
  "support-bot": {
    key: "support-bot",
    name: "Customer support bot (with memory)",
    blurb:
      "Handles real customer conversations with multi-turn memory and a help-center knowledge base.",
    monthlyVolume: 800,
    avgInputTokens: 2500,
    avgOutputTokens: 400,
    model: "claude-sonnet",
    useRag: true,
    cachedInputPercent: 40,
    thirdPartyUsage: {},
    fixedMonthlyApis: ["vector-db"],
  },
  "quote-generator": {
    key: "quote-generator",
    name: "Quote / estimate generator",
    blurb:
      "Takes structured inputs (e.g. VIN + service request), returns a written quote. Like the car-repair example.",
    monthlyVolume: 200,
    avgInputTokens: 2000,
    avgOutputTokens: 500,
    model: "claude-sonnet",
    useRag: true,
    cachedInputPercent: 50,
    thirdPartyUsage: { "vin-decoder": 1 },
    fixedMonthlyApis: ["vector-db"],
  },
  "lead-qualifier": {
    key: "lead-qualifier",
    name: "Lead qualifier (with web research)",
    blurb:
      "Inbound lead → researches the company online → scores + drafts a tailored response.",
    monthlyVolume: 200,
    avgInputTokens: 4000,
    avgOutputTokens: 600,
    model: "claude-sonnet",
    useRag: false,
    cachedInputPercent: 20,
    thirdPartyUsage: { "web-scrape": 3 },
    fixedMonthlyApis: [],
  },
  "voice-agent": {
    key: "voice-agent",
    name: "Voice AI agent",
    blurb:
      "Inbound calls handled by an AI voice agent. Telephony + transcription + LLM all stack up.",
    monthlyVolume: 300,
    avgInputTokens: 3000,
    avgOutputTokens: 800,
    model: "claude-sonnet",
    useRag: true,
    cachedInputPercent: 30,
    thirdPartyUsage: {
      "voice-min": 4,
      "transcription-min": 4,
    },
    fixedMonthlyApis: ["vector-db"],
  },
};

// ----------------------------------------------------------------------
// Build cost ranges (build fee, one-time)
// ----------------------------------------------------------------------

export interface BuildEstimate {
  low: number;
  high: number;
  weeks: string;
}

export function estimateBuildCost(
  template: TemplateKey,
  complexity: "simple" | "moderate" | "complex"
): BuildEstimate {
  const base: Record<TemplateKey, BuildEstimate> = {
    blank: { low: 3000, high: 8000, weeks: "2–4 weeks" },
    "faq-bot": { low: 2000, high: 4000, weeks: "1–2 weeks" },
    "email-triage": { low: 3000, high: 6000, weeks: "2–3 weeks" },
    "support-bot": { low: 5000, high: 10000, weeks: "3–5 weeks" },
    "quote-generator": { low: 6000, high: 12000, weeks: "3–6 weeks" },
    "lead-qualifier": { low: 5000, high: 10000, weeks: "3–5 weeks" },
    "voice-agent": { low: 8000, high: 15000, weeks: "4–8 weeks" },
  };

  const e = base[template];
  const multipliers: Record<string, number> = {
    simple: 0.8,
    moderate: 1,
    complex: 1.3,
  };
  const m = multipliers[complexity] ?? 1;

  return {
    low: Math.round(e.low * m),
    high: Math.round(e.high * m),
    weeks: e.weeks,
  };
}

// ----------------------------------------------------------------------
// Recommend a Care tier
// ----------------------------------------------------------------------

export function recommendCareTier(input: {
  monthlyVolume: number;
  hasMemory: boolean;
  hasVoice: boolean;
  complexity: "simple" | "moderate" | "complex";
}): CareTier {
  let score = 0;

  if (input.monthlyVolume > 500) score += 1;
  if (input.monthlyVolume > 2000) score += 1;
  if (input.hasMemory) score += 1;
  if (input.hasVoice) score += 2;
  if (input.complexity === "moderate") score += 1;
  if (input.complexity === "complex") score += 2;

  if (score >= 4) return "pro";
  if (score >= 2) return "standard";
  return "light";
}

// ----------------------------------------------------------------------
// Main estimator — produce a full monthly cost breakdown
// ----------------------------------------------------------------------

export interface EstimatorInput {
  monthlyVolume: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  model: ModelKey;
  useRag: boolean;
  cachedInputPercent: number; // 0-100, only applied to anthropic models
  thirdPartyUsage: Partial<Record<ThirdPartyApiKey, number>>;
  fixedMonthlyApis: ThirdPartyApiKey[];
  hasMemory: boolean;
  hasVoice: boolean;
  complexity: "simple" | "moderate" | "complex";
}

export interface EstimatorOutput {
  // Per-month variable cost from LLM API
  llmInputCost: number;
  llmOutputCost: number;
  llmCachedSavings: number;
  llmTotalMonthly: number;

  // Per-month variable cost from third-party APIs
  thirdPartyVariableMonthly: number;

  // Per-month fixed cost from third-party APIs (e.g. vector DB minimums)
  thirdPartyFixedMonthly: number;

  // Total estimated API spend per month
  apiTotalMonthly: number;

  // 30% buffer for safety
  apiTotalMonthlyWithBuffer: number;

  // Recommended Care tier
  recommendedCareTier: CareTier;

  // Total monthly Stratus invoice
  monthlyInvoiceLow: number;
  monthlyInvoiceHigh: number;

  // Per-request cost (informational)
  costPerRequest: number;

  // Breakdown for UI
  breakdown: Array<{ label: string; amount: number; note?: string }>;
}

export function estimateMonthlyCost(input: EstimatorInput): EstimatorOutput {
  const model = MODELS[input.model];

  // LLM tokens per month
  const monthlyInputTokens = input.monthlyVolume * input.avgInputTokens;
  const monthlyOutputTokens = input.monthlyVolume * input.avgOutputTokens;

  // Cached vs uncached input split (only Anthropic supports prompt cache today)
  const supportsCache =
    model.provider === "anthropic" && model.cachedInputPerM !== undefined;
  const cachedFraction = supportsCache
    ? Math.min(Math.max(input.cachedInputPercent, 0), 100) / 100
    : 0;

  const cachedInputTokens = monthlyInputTokens * cachedFraction;
  const uncachedInputTokens = monthlyInputTokens * (1 - cachedFraction);

  const llmInputCost =
    (uncachedInputTokens / 1_000_000) * model.inputPerM +
    (cachedInputTokens / 1_000_000) * (model.cachedInputPerM ?? model.inputPerM);

  const llmOutputCost = (monthlyOutputTokens / 1_000_000) * model.outputPerM;

  // What we WOULD have paid without caching, for the savings line
  const fullInputCost = (monthlyInputTokens / 1_000_000) * model.inputPerM;
  const llmCachedSavings = Math.max(0, fullInputCost - llmInputCost);

  const llmTotalMonthly = llmInputCost + llmOutputCost;

  // Third-party variable: per-request
  let thirdPartyVariableMonthly = 0;
  const breakdown: EstimatorOutput["breakdown"] = [];

  for (const [k, count] of Object.entries(input.thirdPartyUsage)) {
    if (!count || count <= 0) continue;
    const api = THIRD_PARTY_APIS[k as ThirdPartyApiKey];
    if (!api || api.unit === "per month") continue;
    const monthlyUsage = input.monthlyVolume * count;
    const cost = monthlyUsage * api.costPerUnit;
    thirdPartyVariableMonthly += cost;
    if (cost > 0) {
      breakdown.push({
        label: api.name,
        amount: cost,
        note: `${monthlyUsage.toLocaleString()} ${api.unit.replace("per ", "")}s @ $${api.costPerUnit.toFixed(4)}`,
      });
    }
  }

  // Third-party fixed monthly
  let thirdPartyFixedMonthly = 0;
  for (const k of input.fixedMonthlyApis) {
    const api = THIRD_PARTY_APIS[k];
    if (!api) continue;
    if (api.unit === "per month") {
      thirdPartyFixedMonthly += api.costPerUnit;
      breakdown.push({
        label: api.name,
        amount: api.costPerUnit,
        note: "Fixed monthly minimum",
      });
    }
  }

  // RAG implies vector-db if not already added
  if (input.useRag && !input.fixedMonthlyApis.includes("vector-db")) {
    const vectorDb = THIRD_PARTY_APIS["vector-db"];
    thirdPartyFixedMonthly += vectorDb.costPerUnit;
    breakdown.push({
      label: vectorDb.name,
      amount: vectorDb.costPerUnit,
      note: "Required for RAG",
    });
  }

  if (llmTotalMonthly > 0) {
    breakdown.unshift({
      label: `${model.name} (LLM)`,
      amount: llmTotalMonthly,
      note: cachedFraction > 0
        ? `${(cachedFraction * 100).toFixed(0)}% cache hit, saves $${llmCachedSavings.toFixed(2)}/mo`
        : `${(monthlyInputTokens / 1000).toFixed(0)}K in / ${(monthlyOutputTokens / 1000).toFixed(0)}K out tokens`,
    });
  }

  const apiTotalMonthly =
    llmTotalMonthly + thirdPartyVariableMonthly + thirdPartyFixedMonthly;
  const apiTotalMonthlyWithBuffer = apiTotalMonthly * 1.3;

  const recommendedCareTier = recommendCareTier({
    monthlyVolume: input.monthlyVolume,
    hasMemory: input.hasMemory,
    hasVoice: input.hasVoice,
    complexity: input.complexity,
  });

  const careCost = CARE_TIERS[recommendedCareTier].monthly;

  const monthlyInvoiceLow = careCost + apiTotalMonthly;
  const monthlyInvoiceHigh = careCost + apiTotalMonthlyWithBuffer;

  const costPerRequest =
    input.monthlyVolume > 0 ? apiTotalMonthly / input.monthlyVolume : 0;

  return {
    llmInputCost,
    llmOutputCost,
    llmCachedSavings,
    llmTotalMonthly,
    thirdPartyVariableMonthly,
    thirdPartyFixedMonthly,
    apiTotalMonthly,
    apiTotalMonthlyWithBuffer,
    recommendedCareTier,
    monthlyInvoiceLow,
    monthlyInvoiceHigh,
    costPerRequest,
    breakdown,
  };
}

// ----------------------------------------------------------------------
// Latency estimate (per request, end-to-end)
// ----------------------------------------------------------------------

export interface LatencyEstimate {
  totalMs: number;
  breakdown: Array<{ label: string; ms: number }>;
}

export function estimateLatency(input: {
  model: ModelKey;
  avgOutputTokens: number;
  thirdPartyUsage: Partial<Record<ThirdPartyApiKey, number>>;
  useRag: boolean;
}): LatencyEstimate {
  const m = MODELS[input.model];
  const breakdown: LatencyEstimate["breakdown"] = [];

  // Third-party calls (assume sequential — most workflows chain them)
  for (const [k, count] of Object.entries(input.thirdPartyUsage)) {
    if (!count || count <= 0) continue;
    const api = THIRD_PARTY_APIS[k as ThirdPartyApiKey];
    if (!api || api.latencyMs === 0) continue;
    breakdown.push({
      label: `${api.name} × ${count}`,
      ms: api.latencyMs * count,
    });
  }

  if (input.useRag) {
    breakdown.push({
      label: "Vector DB lookup",
      ms: THIRD_PARTY_APIS["vector-db"].latencyMs,
    });
  }

  const generationMs =
    m.latencyMs + (input.avgOutputTokens / m.outputTokensPerSec) * 1000;
  breakdown.push({
    label: `${m.name} generation`,
    ms: Math.round(generationMs),
  });

  const totalMs = breakdown.reduce((sum, x) => sum + x.ms, 0);
  return { totalMs, breakdown };
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ----------------------------------------------------------------------
// Workflow visualizer — renders the per-request flow as ordered steps
// ----------------------------------------------------------------------

export interface WorkflowStep {
  label: string;
  detail: string;
  cost?: string;
  latencyMs?: number;
}

export function buildWorkflowSteps(input: EstimatorInput): WorkflowStep[] {
  const steps: WorkflowStep[] = [];
  steps.push({
    label: "Inbound trigger",
    detail: "User input, webhook, scheduled event, or inbound message",
  });

  for (const [k, count] of Object.entries(input.thirdPartyUsage)) {
    if (!count || count <= 0) continue;
    const api = THIRD_PARTY_APIS[k as ThirdPartyApiKey];
    if (!api) continue;
    steps.push({
      label: api.name,
      detail: `${count}× per request — ${api.description}`,
      cost: `$${(api.costPerUnit * count).toFixed(4)}/req`,
      latencyMs: api.latencyMs * count,
    });
  }

  if (input.useRag) {
    steps.push({
      label: "Vector DB lookup",
      detail: "Find relevant context from the knowledge base",
      latencyMs: THIRD_PARTY_APIS["vector-db"].latencyMs,
    });
  }

  const m = MODELS[input.model];
  const llmCostPerReq =
    (input.avgInputTokens / 1_000_000) * m.inputPerM +
    (input.avgOutputTokens / 1_000_000) * m.outputPerM;
  const llmLatency =
    m.latencyMs + (input.avgOutputTokens / m.outputTokensPerSec) * 1000;
  steps.push({
    label: `${m.name} generation`,
    detail: `Model produces ${input.avgOutputTokens.toLocaleString()} avg output tokens`,
    cost: `$${llmCostPerReq.toFixed(4)}/req`,
    latencyMs: Math.round(llmLatency),
  });

  steps.push({
    label: "Response delivered",
    detail: "Returned to user / written back / next step",
  });

  return steps;
}

// ----------------------------------------------------------------------
// Volume sensitivity — show cost across a series of volumes
// ----------------------------------------------------------------------

export interface VolumeScenario {
  multiplier: string;
  monthlyVolume: number;
  apiSpend: number;
  monthlyInvoiceLow: number;
  monthlyInvoiceHigh: number;
  costPerRequest: number;
}

export function buildVolumeScenarios(
  input: EstimatorInput
): VolumeScenario[] {
  const multipliers = [0.5, 1, 2, 5, 10];
  const labels = ["½×", "1×", "2×", "5×", "10×"];

  return multipliers.map((m, i) => {
    const adjusted: EstimatorInput = {
      ...input,
      monthlyVolume: Math.round(input.monthlyVolume * m),
    };
    const r = estimateMonthlyCost(adjusted);
    return {
      multiplier: labels[i],
      monthlyVolume: adjusted.monthlyVolume,
      apiSpend: r.apiTotalMonthly,
      monthlyInvoiceLow: r.monthlyInvoiceLow,
      monthlyInvoiceHigh: r.monthlyInvoiceHigh,
      costPerRequest: r.costPerRequest,
    };
  });
}

// ----------------------------------------------------------------------
// Model comparison — same workflow, different models
// ----------------------------------------------------------------------

export interface ModelComparison {
  model: ModelPrice;
  apiSpend: number;
  monthlyInvoiceLow: number;
  costPerRequest: number;
  latencyMs: number;
}

export function buildModelComparison(
  input: EstimatorInput,
  modelKeys: ModelKey[] = [
    "gpt-4o-mini",
    "gemini-flash",
    "claude-haiku",
    "gpt-4o",
    "claude-sonnet",
    "gemini-pro",
  ]
): ModelComparison[] {
  return modelKeys.map((key) => {
    const adjusted: EstimatorInput = { ...input, model: key };
    const r = estimateMonthlyCost(adjusted);
    const latency = estimateLatency({
      model: key,
      avgOutputTokens: input.avgOutputTokens,
      thirdPartyUsage: input.thirdPartyUsage,
      useRag: input.useRag,
    });
    return {
      model: MODELS[key],
      apiSpend: r.apiTotalMonthly,
      monthlyInvoiceLow: r.monthlyInvoiceLow,
      costPerRequest: r.costPerRequest,
      latencyMs: latency.totalMs,
    };
  });
}

// ----------------------------------------------------------------------
// Build a plain-text estimate summary for export / form pre-fill
// ----------------------------------------------------------------------

export function buildEstimateSummary(args: {
  templateName: string;
  monthlyVolume: number;
  modelName: string;
  buildLow: number;
  buildHigh: number;
  buildWeeks: string;
  careTierName: string;
  careTierMonthly: number;
  apiTotalMonthly: number;
  apiTotalWithBuffer: number;
  monthlyInvoiceLow: number;
  monthlyInvoiceHigh: number;
  costPerRequest: number;
  totalLatencyMs: number;
}): string {
  const lines = [
    "── ESTIMATE FROM /tools/cost-estimator ──",
    "",
    `Workflow:    ${args.templateName}`,
    `Volume:      ${args.monthlyVolume.toLocaleString()} requests/mo`,
    `Model:       ${args.modelName}`,
    `Latency:     ~${formatLatency(args.totalLatencyMs)} per request`,
    "",
    `Build:       ${formatRange(args.buildLow, args.buildHigh)}+ · ${args.buildWeeks}`,
    `Care:        ${args.careTierName} (${formatUsd(args.careTierMonthly)}/mo)`,
    `API:         ${formatUsd(args.apiTotalMonthly)} – ${formatUsd(args.apiTotalWithBuffer)}/mo (pass-through)`,
    `Total/mo:    ${formatRange(args.monthlyInvoiceLow, args.monthlyInvoiceHigh)}`,
    `Per request: ${formatUsd(args.costPerRequest, { cents: true })}`,
    "",
    `Updated ${PRICING_LAST_UPDATED}.`,
    "",
    "── My project ──",
    "",
  ];
  return lines.join("\n");
}

// ----------------------------------------------------------------------
// Formatting helpers
// ----------------------------------------------------------------------

export function formatUsd(n: number, opts?: { cents?: boolean }): string {
  if (!Number.isFinite(n)) return "—";
  if (opts?.cents || (n > 0 && n < 1)) {
    return `$${n.toFixed(2)}`;
  }
  return `$${Math.round(n).toLocaleString()}`;
}

export function formatRange(low: number, high: number): string {
  return `${formatUsd(low)} – ${formatUsd(high)}`;
}
