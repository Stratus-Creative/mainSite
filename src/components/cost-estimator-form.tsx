"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildEstimateSummary,
  buildModelComparison,
  buildVolumeScenarios,
  buildWorkflowSteps,
  CARE_TIERS,
  estimateBuildCost,
  estimateLatency,
  estimateMonthlyCost,
  formatLatency,
  formatRange,
  formatUsd,
  MODELS,
  PRICING_LAST_UPDATED,
  TEMPLATES,
  THIRD_PARTY_APIS,
  type EstimatorInput,
  type ModelKey,
  type TemplateKey,
  type ThirdPartyApiKey,
} from "@/lib/cost-estimator";

const COMPLEXITY_OPTIONS = [
  {
    value: "simple",
    label: "Simple",
    detail: "Single-purpose, stateless, light orchestration",
  },
  {
    value: "moderate",
    label: "Moderate",
    detail: "Multi-step, integrations, light memory",
  },
  {
    value: "complex",
    label: "Complex",
    detail: "Multi-agent, deep memory, autonomous behavior",
  },
] as const;

type Complexity = (typeof COMPLEXITY_OPTIONS)[number]["value"];

const SELECTABLE_API_KEYS: ThirdPartyApiKey[] = [
  "vin-decoder",
  "sms",
  "voice-min",
  "transcription-min",
  "web-scrape",
  "geocoding",
  "email-parsing",
  "image-gen",
];

// Parse a TemplateKey from a string, falling back to a default.
function parseTemplateKey(raw: string | null, fallback: TemplateKey): TemplateKey {
  if (raw && raw in TEMPLATES) return raw as TemplateKey;
  return fallback;
}

// Parse a ModelKey from a string, falling back to a default.
function parseModelKey(raw: string | null, fallback: ModelKey): ModelKey {
  if (raw && raw in MODELS) return raw as ModelKey;
  return fallback;
}

export function CostEstimatorForm() {
  // Read initial state from URL query params (client-side only, safe fallback to defaults).
  function readUrlParams(): {
    templateKey: TemplateKey;
    modelKey: ModelKey;
    volume: number;
    cache: number;
  } {
    if (typeof window === "undefined") {
      return { templateKey: "support-bot", modelKey: "claude-sonnet", volume: 800, cache: 40 };
    }
    const params = new URLSearchParams(window.location.search);
    const templateKey = parseTemplateKey(params.get("tpl"), "support-bot");
    const tpl = TEMPLATES[templateKey];
    const modelKey = parseModelKey(params.get("model"), tpl.model);
    const volume = Number(params.get("vol")) || tpl.monthlyVolume;
    const cache = Number(params.get("cache") ?? tpl.cachedInputPercent);
    return { templateKey, modelKey, volume, cache };
  }

  const initialUrl = readUrlParams();
  const initialTpl = TEMPLATES[initialUrl.templateKey];

  const [template, setTemplate] = useState<TemplateKey>(initialUrl.templateKey);
  const t = TEMPLATES[template];

  // Form state — initialized from template (or URL params on first render)
  const [monthlyVolume, setMonthlyVolume] = useState(initialUrl.volume);
  const [avgInputTokens, setAvgInputTokens] = useState(initialTpl.avgInputTokens);
  const [avgOutputTokens, setAvgOutputTokens] = useState(initialTpl.avgOutputTokens);
  const [model, setModel] = useState<ModelKey>(initialUrl.modelKey);
  const [useRag, setUseRag] = useState(initialTpl.useRag);
  const [cachedInputPercent, setCachedInputPercent] = useState(initialUrl.cache);
  const [hasMemory, setHasMemory] = useState(initialTpl.useRag || initialUrl.templateKey === "support-bot");
  const [hasVoice, setHasVoice] = useState(initialUrl.templateKey === "voice-agent");
  const [complexity, setComplexity] = useState<Complexity>("moderate");
  const [thirdPartyUsage, setThirdPartyUsage] = useState<
    Partial<Record<ThirdPartyApiKey, number>>
  >(initialTpl.thirdPartyUsage);

  function applyTemplate(key: TemplateKey) {
    const tpl = TEMPLATES[key];
    setTemplate(key);
    setMonthlyVolume(tpl.monthlyVolume);
    setAvgInputTokens(tpl.avgInputTokens);
    setAvgOutputTokens(tpl.avgOutputTokens);
    setModel(tpl.model);
    setUseRag(tpl.useRag);
    setCachedInputPercent(tpl.cachedInputPercent);
    setThirdPartyUsage(tpl.thirdPartyUsage);
    setHasMemory(tpl.useRag || key === "support-bot");
    setHasVoice(key === "voice-agent");
    setComplexity("moderate");
  }

  // Sync shareable URL state without adding to browser history.
  // Only the four fields that meaningfully identify an estimate are encoded.
  const isMounted = useRef(false);
  useEffect(() => {
    // Skip the very first render — URL was already read to initialize state.
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const params = new URLSearchParams();
    params.set("tpl", template);
    params.set("model", model);
    params.set("vol", String(monthlyVolume));
    if (MODELS[model].cachedInputPerM !== undefined) {
      params.set("cache", String(cachedInputPercent));
    }
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", url);
  }, [template, model, monthlyVolume, cachedInputPercent]);

  const estimatorInput: EstimatorInput = useMemo(
    () => ({
      monthlyVolume,
      avgInputTokens,
      avgOutputTokens,
      model,
      useRag,
      cachedInputPercent,
      thirdPartyUsage,
      fixedMonthlyApis: useRag ? ["vector-db"] : [],
      hasMemory,
      hasVoice,
      complexity,
    }),
    [
      monthlyVolume,
      avgInputTokens,
      avgOutputTokens,
      model,
      useRag,
      cachedInputPercent,
      thirdPartyUsage,
      hasMemory,
      hasVoice,
      complexity,
    ]
  );

  const result = useMemo(
    () => estimateMonthlyCost(estimatorInput),
    [estimatorInput]
  );

  const buildEstimate = useMemo(
    () => estimateBuildCost(template, complexity),
    [template, complexity]
  );

  const latency = useMemo(
    () =>
      estimateLatency({
        model,
        avgOutputTokens,
        thirdPartyUsage,
        useRag,
      }),
    [model, avgOutputTokens, thirdPartyUsage, useRag]
  );

  const workflowSteps = useMemo(
    () => buildWorkflowSteps(estimatorInput),
    [estimatorInput]
  );

  const volumeScenarios = useMemo(
    () => buildVolumeScenarios(estimatorInput),
    [estimatorInput]
  );

  const modelComparison = useMemo(
    () => buildModelComparison(estimatorInput),
    [estimatorInput]
  );

  const careTier = CARE_TIERS[result.recommendedCareTier];

  const [showAdvanced, setShowAdvanced] = useState(false);

  const summaryText = useMemo(
    () =>
      buildEstimateSummary({
        templateName: TEMPLATES[template].name,
        monthlyVolume,
        modelName: MODELS[model].name,
        buildLow: buildEstimate.low,
        buildHigh: buildEstimate.high,
        buildWeeks: buildEstimate.weeks,
        careTierName: careTier.name,
        careTierMonthly: careTier.monthly,
        apiTotalMonthly: result.apiTotalMonthly,
        apiTotalWithBuffer: result.apiTotalMonthlyWithBuffer,
        monthlyInvoiceLow: result.monthlyInvoiceLow,
        monthlyInvoiceHigh: result.monthlyInvoiceHigh,
        costPerRequest: result.costPerRequest,
        totalLatencyMs: latency.totalMs,
      }),
    [template, monthlyVolume, model, buildEstimate, careTier, result, latency]
  );

  const discussHref = useMemo(() => {
    const params = new URLSearchParams({
      fromEstimator: "1",
      summary: summaryText,
    });
    return `/start?${params.toString()}`;
  }, [summaryText]);

  const [copied, setCopied] = useState(false);
  function copyEstimate() {
    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Email estimate state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  type EmailStatus = "idle" | "sending" | "sent" | { error: string };
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");

  async function sendEstimate(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValue || !emailValue.includes("@")) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/email-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, estimateSummary: summaryText }),
      });
      if (!res.ok) {
        const data: unknown = await res.json();
        const msg =
          data !== null &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as Record<string, unknown>).error === "string"
            ? (data as Record<string, string>).error
            : "Something went wrong. Please try again.";
        setEmailStatus({ error: msg });
      } else {
        setEmailStatus("sent");
        setEmailValue("");
      }
    } catch {
      setEmailStatus({ error: "Network error. Please try again." });
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Form */}
      <div className="space-y-12 lg:col-span-7">
        {/* Template picker */}
        <fieldset className="space-y-4">
          <legend className="section-label">01 — Pick a starting point</legend>
          <p className="text-sm text-muted-foreground">
            Start with a template, then tune from there. Or pick &quot;Blank&quot; and
            describe your own.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.values(TEMPLATES).map((tpl) => {
              const active = template === tpl.key;
              return (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => applyTemplate(tpl.key)}
                  className={`group flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border bg-background hover:border-foreground/40"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      active ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {tpl.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tpl.blurb}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Volume + tokens */}
        <fieldset className="space-y-6">
          <legend className="section-label">02 — Volume &amp; per-request size</legend>
          <NumberInput
            label="Monthly request volume"
            help="How many times will the workflow run per month?"
            value={monthlyVolume}
            onChange={setMonthlyVolume}
            min={0}
            step={50}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Avg input tokens / request"
              help="Includes prompt, system message, RAG context"
              value={avgInputTokens}
              onChange={setAvgInputTokens}
              min={0}
              step={100}
            />
            <NumberInput
              label="Avg output tokens / request"
              help="What the model writes back"
              value={avgOutputTokens}
              onChange={setAvgOutputTokens}
              min={0}
              step={50}
            />
          </div>
        </fieldset>

        {/* Model */}
        <fieldset className="space-y-4">
          <legend className="section-label">03 — Model</legend>
          <div className="grid gap-2">
            {Object.values(MODELS).map((m) => {
              const active = model === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setModel(m.key)}
                  className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border bg-background hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      ${m.inputPerM.toFixed(2)} in / ${m.outputPerM.toFixed(2)} out per M
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {m.good_for}
                  </span>
                </button>
              );
            })}
          </div>
          {MODELS[model].cachedInputPerM !== undefined && (
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="flex items-center justify-between text-sm">
                <span className="font-medium">Prompt cache hit rate</span>
                <span className="font-mono text-xs text-accent">
                  {cachedInputPercent}%
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={cachedInputPercent}
                onChange={(e) => setCachedInputPercent(Number(e.target.value))}
                className="mt-3 w-full accent-[oklch(0.68_0.14_250)]"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Anthropic prompt cache reduces repeated input cost by ~90%.
                Higher cache hit rate = lower bill.
              </p>
            </div>
          )}
        </fieldset>

        {/* RAG + Memory + Voice */}
        <fieldset className="space-y-4">
          <legend className="section-label">04 — Workflow shape</legend>
          <div className="grid gap-2">
            <ToggleRow
              label="Uses RAG (knowledge base lookup)"
              detail="Adds a vector database — adds ~$70/mo fixed cost"
              checked={useRag}
              onChange={setUseRag}
            />
            <ToggleRow
              label="Has conversation memory"
              detail="Multi-turn conversations remember prior messages"
              checked={hasMemory}
              onChange={setHasMemory}
            />
            <ToggleRow
              label="Voice / telephony"
              detail="Inbound or outbound voice calls (Twilio + transcription)"
              checked={hasVoice}
              onChange={setHasVoice}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium">Engineering complexity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Affects build estimate and Care tier recommendation.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {COMPLEXITY_OPTIONS.map((opt) => {
                const active = complexity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setComplexity(opt.value)}
                    className={`rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-foreground hover:border-foreground/40"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {opt.detail}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </fieldset>

        {/* Third-party APIs */}
        <fieldset className="space-y-4">
          <legend className="section-label">05 — Third-party APIs per request</legend>
          <p className="text-sm text-muted-foreground">
            Calls per request (set to 0 if not used). Multiplied by volume to
            get monthly cost.
          </p>
          <div className="grid gap-2">
            {SELECTABLE_API_KEYS.map((key) => {
              const api = THIRD_PARTY_APIS[key];
              const value = thirdPartyUsage[key] ?? 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{api.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {api.description} —{" "}
                      <span className="font-mono">
                        ${api.costPerUnit.toFixed(4)} {api.unit}
                      </span>
                    </p>
                  </div>
                  <NumberStepper
                    value={value}
                    min={0}
                    onChange={(n) =>
                      setThirdPartyUsage({
                        ...thirdPartyUsage,
                        [key]: n,
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Output panel */}
      <aside className="lg:col-span-5">
        <div className="sticky top-32 space-y-6">
          {/* Headline numbers */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="section-label">Estimated monthly</p>
            <p className="mt-4 text-5xl font-semibold tracking-tight">
              {formatRange(result.monthlyInvoiceLow, result.monthlyInvoiceHigh)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Includes <span className="text-foreground">{careTier.name}</span>{" "}
              ({formatUsd(careTier.monthly)}/mo) + estimated API spend with a
              30% safety buffer on the high side.
            </p>

            <div className="mt-6 grid gap-3 border-t border-border pt-6 text-sm">
              <Row
                label={careTier.name}
                value={`${formatUsd(careTier.monthly)}/mo`}
                accent
              />
              <Row
                label="Estimated API spend"
                value={`${formatUsd(result.apiTotalMonthly)} – ${formatUsd(result.apiTotalMonthlyWithBuffer)}/mo`}
              />
              <div className="flex flex-col gap-0.5">
                <Row
                  label="Cost per request"
                  value={formatUsd(result.costPerRequest, { cents: true })}
                  muted
                />
                <div className="flex justify-end">
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    Range:{" "}
                    {formatUsd(result.costPerRequest * 0.7, { cents: true })}
                    {" – "}
                    {formatUsd(result.costPerRequest * 1.5, { cents: true })}
                    {" (p25–p75)"}
                  </span>
                </div>
              </div>
              <Row
                label="Expected latency"
                value={`~${formatLatency(latency.totalMs)} per request`}
                muted
              />
            </div>
          </div>

          {/* Build estimate */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="section-label">One-time build</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {formatRange(buildEstimate.low, buildEstimate.high)}
              <span className="text-accent">+</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {buildEstimate.weeks} · scoped to your complexity rating.
              Range is a typical starting point — projects can extend higher
              based on scope. Quoted firm in your proposal.
            </p>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="section-label">API spend breakdown</p>
            <ul className="mt-4 divide-y divide-border text-sm">
              {result.breakdown.length === 0 && (
                <li className="py-3 text-muted-foreground">
                  Add a model + volume to see the breakdown.
                </li>
              )}
              {result.breakdown.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    {item.note && (
                      <p className="text-xs text-muted-foreground">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsd(item.amount, { cents: item.amount < 5 })}/mo
                  </span>
                </li>
              ))}
              {result.llmCachedSavings > 0 && (
                <li className="flex justify-between py-3 text-xs text-accent">
                  <span>Prompt cache savings</span>
                  <span className="font-mono">
                    −{formatUsd(result.llmCachedSavings, { cents: true })}/mo
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Recommended Care tier */}
          <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
            <p className="section-label">Recommended Care tier</p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-accent">
              {careTier.name}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {careTier.hours} · {careTier.description}
            </p>
          </div>

          {/* Workflow visualizer */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="section-label">Per-request flow</p>
            <p className="mt-2 text-xs text-muted-foreground">
              What happens each time the workflow runs.
            </p>
            <ol className="mt-5 space-y-2">
              {workflowSteps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3"
                >
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-[10px] text-accent">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                  <div className="text-right">
                    {step.cost && (
                      <p className="font-mono text-[11px] text-foreground">
                        {step.cost}
                      </p>
                    )}
                    {step.latencyMs !== undefined && step.latencyMs > 0 && (
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {formatLatency(step.latencyMs)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
          >
            <span>
              {showAdvanced ? "Hide" : "Show"} volume scaling &amp; model comparison
            </span>
            <span
              aria-hidden="true"
              className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {showAdvanced && (
            <>
              {/* Volume sensitivity */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="section-label">Volume sensitivity</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  How monthly cost scales as request volume changes (Care tier
                  recommendation may shift at higher volumes).
                </p>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="pb-3">Scale</th>
                        <th className="pb-3">Volume/mo</th>
                        <th className="pb-3 text-right">API/mo</th>
                        <th className="pb-3 text-right">Total/mo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volumeScenarios.map((s) => (
                        <tr
                          key={s.multiplier}
                          className={`border-b border-border/40 last:border-0 ${
                            s.multiplier === "1×" ? "bg-accent/5" : ""
                          }`}
                        >
                          <td
                            className={`py-3 font-mono text-xs ${
                              s.multiplier === "1×" ? "text-accent" : ""
                            }`}
                          >
                            {s.multiplier}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {s.monthlyVolume.toLocaleString()}
                          </td>
                          <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                            {formatUsd(s.apiSpend, {
                              cents: s.apiSpend < 5,
                            })}
                          </td>
                          <td className="py-3 text-right font-mono text-xs">
                            {formatRange(
                              s.monthlyInvoiceLow,
                              s.monthlyInvoiceHigh
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Model comparison */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="section-label">Same workflow, different models</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Cost &amp; latency for this exact workflow across models.
                  Highlighted is your current pick.
                </p>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        <th className="pb-3">Model</th>
                        <th className="pb-3 text-right">API/mo</th>
                        <th className="pb-3 text-right">Per req</th>
                        <th className="pb-3 text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelComparison.map((m) => (
                        <tr
                          key={m.model.key}
                          className={`border-b border-border/40 last:border-0 ${
                            m.model.key === model ? "bg-accent/5" : ""
                          }`}
                        >
                          <td
                            className={`py-3 ${
                              m.model.key === model ? "text-accent" : ""
                            }`}
                          >
                            {m.model.name}
                          </td>
                          <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                            {formatUsd(m.apiSpend, {
                              cents: m.apiSpend < 5,
                            })}
                          </td>
                          <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                            {formatUsd(m.costPerRequest, { cents: true })}
                          </td>
                          <td className="py-3 text-right font-mono text-xs text-muted-foreground">
                            ~{formatLatency(m.latencyMs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyEstimate}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              {copied ? "Copied ✓" : "Copy estimate"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmailForm((v) => !v);
                setEmailStatus("idle");
              }}
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Email this estimate
            </button>
          </div>

          {showEmailForm && (
            <div className="rounded-2xl border border-border bg-card p-5">
              {emailStatus === "sent" ? (
                <p className="text-sm text-accent">
                  Sent! Check your inbox.
                </p>
              ) : (
                <form onSubmit={sendEstimate} className="flex flex-col gap-3">
                  <label className="block text-sm font-medium" htmlFor="estimate-email">
                    Your email
                  </label>
                  <input
                    id="estimate-email"
                    type="email"
                    required
                    value={emailValue}
                    onChange={(e) => {
                      setEmailValue(e.target.value);
                      setEmailStatus("idle");
                    }}
                    placeholder="you@example.com"
                    className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                  {typeof emailStatus === "object" && "error" in emailStatus && (
                    <p className="text-xs text-red-500">{emailStatus.error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={emailStatus === "sending"}
                    className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {emailStatus === "sending" ? "Sending…" : "Send"}
                  </button>
                </form>
              )}
            </div>
          )}

          <a
            href={discussHref}
            className="block rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background transition-colors hover:bg-accent"
          >
            Discuss this estimate →
          </a>

          <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Pricing data updated {PRICING_LAST_UPDATED}
          </p>
        </div>
      </aside>
    </div>
  );
}

// -------- helpers ----------

function NumberInput({
  label,
  help,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  help?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  function clamp(n: number) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, n);
  }

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {help && (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {help}
        </span>
      )}
      <div className="mt-2 flex items-stretch gap-2">
        <button
          type="button"
          aria-label="Decrement"
          onClick={() => onChange(clamp(value - step))}
          className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-base text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-center text-base text-foreground focus:border-foreground focus:outline-none"
        />
        <button
          type="button"
          aria-label="Increment"
          onClick={() => onChange(clamp(value + step))}
          className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-base text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          +
        </button>
      </div>
    </label>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
}) {
  function clamp(n: number) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, n);
  }
  return (
    <div className="flex items-stretch gap-1">
      <button
        type="button"
        aria-label="Decrement"
        onClick={() => onChange(clamp(value - step))}
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-9 w-14 rounded-md border border-border bg-background px-2 text-center text-sm text-foreground focus:border-foreground focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increment"
        onClick={() => onChange(clamp(value + step))}
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        +
      </button>
    </div>
  );
}

function ToggleRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-start justify-between gap-4 rounded-lg border p-3 text-left transition-colors ${
        checked
          ? "border-accent bg-accent/10"
          : "border-border bg-background hover:border-foreground/40"
      }`}
    >
      <div>
        <p
          className={`text-sm font-medium ${
            checked ? "text-accent" : "text-foreground"
          }`}
        >
          {label}
        </p>
        {detail && (
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        )}
      </div>
      <span
        aria-hidden="true"
        className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border ${
          checked
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>
        {label}
      </span>
      <span
        className={`font-mono ${
          accent ? "text-accent" : muted ? "text-muted-foreground" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

