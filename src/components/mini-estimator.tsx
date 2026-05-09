"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

const WORKFLOW_OPTIONS = [
  { value: "faq-bot", label: "FAQ Bot" },
  { value: "support-bot", label: "Support Bot" },
  { value: "lead-qualifier", label: "Lead Qualifier" },
  { value: "voice-agent", label: "Voice Agent" },
] as const;

const VOLUME_OPTIONS = [
  { value: "low", label: "Low", perMonth: 500 },
  { value: "medium", label: "Medium", perMonth: 5_000 },
  { value: "high", label: "High", perMonth: 50_000 },
] as const;

const MODEL_OPTIONS = [
  { value: "haiku", label: "Fast & Cheap", sublabel: "Haiku" },
  { value: "sonnet", label: "Balanced", sublabel: "Sonnet" },
  { value: "gpt4o", label: "Most Capable", sublabel: "GPT-4o" },
] as const;

type WorkflowKey = (typeof WORKFLOW_OPTIONS)[number]["value"];
type VolumeKey = (typeof VOLUME_OPTIONS)[number]["value"];
type ModelKey = (typeof MODEL_OPTIONS)[number]["value"];

// --------------------------------------------------------------------------
// Hardcoded pricing data (self-contained — does not import cost-estimator.ts)
// --------------------------------------------------------------------------

const MODEL_PRICING: Record<ModelKey, { inputPerM: number; outputPerM: number }> = {
  haiku:  { inputPerM: 0.80, outputPerM: 4.00 },
  sonnet: { inputPerM: 3.00, outputPerM: 15.00 },
  gpt4o:  { inputPerM: 2.50, outputPerM: 10.00 },
};

interface TokenProfile {
  tokensIn: number;
  tokensOut: number;
  voiceMultiplier: number;
}

const WORKFLOW_PROFILES: Record<WorkflowKey, TokenProfile> = {
  "faq-bot":       { tokensIn: 800,  tokensOut: 300, voiceMultiplier: 1 },
  "support-bot":   { tokensIn: 2500, tokensOut: 600, voiceMultiplier: 1 },
  "lead-qualifier":{ tokensIn: 1200, tokensOut: 400, voiceMultiplier: 1 },
  "voice-agent":   { tokensIn: 3500, tokensOut: 800, voiceMultiplier: 1.4 },
};

interface CareTier {
  name: "Light" | "Standard" | "Pro";
  price: number;
}

function getCareTier(workflow: WorkflowKey, volume: VolumeKey): CareTier {
  if (workflow === "voice-agent") return { name: "Pro",      price: 899 };
  if (workflow === "support-bot") return { name: "Standard", price: 399 };
  if (volume === "high")          return { name: "Standard", price: 399 };
  return                                 { name: "Light",    price: 199 };
}

// --------------------------------------------------------------------------
// Pure calculation
// --------------------------------------------------------------------------

interface Estimate {
  apiLow: number;
  apiHigh: number;
  care: CareTier;
  totalLow: number;
  totalHigh: number;
}

function calculate(
  workflow: WorkflowKey,
  volume: VolumeKey,
  model: ModelKey,
): Estimate {
  const { tokensIn, tokensOut, voiceMultiplier } = WORKFLOW_PROFILES[workflow];
  const { inputPerM, outputPerM } = MODEL_PRICING[model];
  const perMonth = VOLUME_OPTIONS.find((v) => v.value === volume)!.perMonth;

  const baseCost =
    ((tokensIn / 1_000_000) * inputPerM + (tokensOut / 1_000_000) * outputPerM) *
    perMonth *
    voiceMultiplier;

  const apiLow  = baseCost;
  const apiHigh = baseCost * 1.3;

  const care = getCareTier(workflow, volume);

  return {
    apiLow,
    apiHigh,
    care,
    totalLow:  apiLow  + care.price,
    totalHigh: apiHigh + care.price,
  };
}

// --------------------------------------------------------------------------
// Formatting helpers
// --------------------------------------------------------------------------

function fmt(n: number): string {
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n < 10) return `$${n.toFixed(1)}`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function fmtRange(low: number, high: number): string {
  return `${fmt(low)} – ${fmt(high)} / mo`;
}

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------

interface ButtonGroupProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string; sublabel?: string }>;
  value: T;
  onChange: (v: T) => void;
}

function ButtonGroup<T extends string>({ options, value, onChange }: ButtonGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {opt.label}
          {opt.sublabel && (
            <span className="ml-1 font-mono opacity-60">({opt.sublabel})</span>
          )}
        </button>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Main component
// --------------------------------------------------------------------------

export function MiniEstimator() {
  const [workflow, setWorkflow] = useState<WorkflowKey>("faq-bot");
  const [volume, setVolume]     = useState<VolumeKey>("medium");
  const [model, setModel]       = useState<ModelKey>("haiku");

  const estimate = useMemo(
    () => calculate(workflow, volume, model),
    [workflow, volume, model],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
      {/* Header */}
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Quick estimate
      </p>

      {/* Inputs */}
      <div className="mt-6 space-y-6">
        {/* Workflow type */}
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Workflow type
          </p>
          <ButtonGroup
            options={WORKFLOW_OPTIONS}
            value={workflow}
            onChange={setWorkflow}
          />
        </div>

        {/* Monthly volume */}
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Monthly volume
          </p>
          <ButtonGroup
            options={VOLUME_OPTIONS}
            value={volume}
            onChange={setVolume}
          />
        </div>

        {/* Model tier */}
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Model tier
          </p>
          <ButtonGroup
            options={MODEL_OPTIONS}
            value={model}
            onChange={setModel}
          />
        </div>
      </div>

      {/* Result */}
      <div className="mt-8 rounded-xl border border-border/60 bg-background p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              API cost (pass-through)
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-accent">
              {fmtRange(estimate.apiLow, estimate.apiHigh)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Recommended Care
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {estimate.care.name}{" "}
              <span className="text-muted-foreground">
                (${estimate.care.price}/mo)
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-border/60 pt-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Total estimated monthly
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {fmtRange(estimate.totalLow, estimate.totalHigh)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            API cost + Care tier. Build (one-time) quoted separately.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-5 text-xs text-muted-foreground">
        This is an estimate.{" "}
        <Link
          href="/tools/cost-estimator"
          className="text-foreground underline underline-offset-2 hover:text-accent transition-colors"
        >
          Run full breakdown →
        </Link>
      </p>
    </div>
  );
}
