"use client";

import { useMemo, useState } from "react";

const WEEKS_PER_MONTH = 4.33;

const CARE_TIERS = [
  { key: "light", name: "Light", monthly: 199 },
  { key: "standard", name: "Standard", monthly: 399 },
  { key: "pro", name: "Pro", monthly: 899 },
] as const;

type CareTierKey = (typeof CARE_TIERS)[number]["key"];

const SCENARIOS = {
  conservative: {
    label: "Conservative",
    detail: "50% replacement · Light Care",
    replacementPct: 50,
    careTier: "light" as CareTierKey,
  },
  realistic: {
    label: "Realistic",
    detail: "80% replacement · Standard Care",
    replacementPct: 80,
    careTier: "standard" as CareTierKey,
  },
  aggressive: {
    label: "Aggressive",
    detail: "90% replacement · Pro Care",
    replacementPct: 90,
    careTier: "pro" as CareTierKey,
  },
} as const;

type ScenarioKey = keyof typeof SCENARIOS;

function formatUsd(value: number, opts?: { cents?: boolean }): string {
  if (!Number.isFinite(value)) return "$0";
  const useCents = opts?.cents ?? false;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: useCents ? 2 : 0,
    maximumFractionDigits: useCents ? 2 : 0,
  }).format(value);
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

export function WorkflowRoiForm() {
  // Process inputs
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [peopleInvolved, setPeopleInvolved] = useState(1);
  const [hourlyCost, setHourlyCost] = useState(50);
  const [replacementPct, setReplacementPct] = useState(80);

  // Build inputs
  const [buildCost, setBuildCost] = useState(8000);
  const [careTier, setCareTier] = useState<CareTierKey>("standard");
  const [apiCost, setApiCost] = useState(50);

  const careTierMonthly = useMemo(
    () => CARE_TIERS.find((t) => t.key === careTier)?.monthly ?? 399,
    [careTier]
  );

  const inputsValid = hoursPerWeek > 0 && hourlyCost > 0;

  const metrics = useMemo(() => {
    const hoursSavedPerMonth =
      hoursPerWeek *
      WEEKS_PER_MONTH *
      peopleInvolved *
      (replacementPct / 100);
    const monthlyLaborSavings = hoursSavedPerMonth * hourlyCost;
    const monthlyAutomationCost = careTierMonthly + apiCost;
    const netMonthlySavings = monthlyLaborSavings - monthlyAutomationCost;

    let paybackLabel: string;
    if (netMonthlySavings <= 0) {
      paybackLabel = "Not yet";
    } else if (netMonthlySavings >= buildCost) {
      paybackLabel = "Already worth it";
    } else {
      const months = buildCost / netMonthlySavings;
      paybackLabel = months > 12 ? "12+ months" : `${months.toFixed(1)} months`;
    }

    const totalSaved3yr =
      monthlyLaborSavings * 36 - monthlyAutomationCost * 36 - buildCost;
    const roiPct = buildCost > 0 ? (totalSaved3yr / buildCost) * 100 : 0;

    return {
      hoursSavedPerMonth,
      monthlyLaborSavings,
      monthlyAutomationCost,
      netMonthlySavings,
      paybackLabel,
      totalSaved3yr,
      roiPct,
    };
  }, [
    hoursPerWeek,
    peopleInvolved,
    hourlyCost,
    replacementPct,
    buildCost,
    careTierMonthly,
    apiCost,
  ]);

  function applyScenario(key: ScenarioKey) {
    const s = SCENARIOS[key];
    setReplacementPct(s.replacementPct);
    setCareTier(s.careTier);
  }

  const activeScenario: ScenarioKey | null = useMemo(() => {
    for (const key of Object.keys(SCENARIOS) as ScenarioKey[]) {
      const s = SCENARIOS[key];
      if (s.replacementPct === replacementPct && s.careTier === careTier) {
        return key;
      }
    }
    return null;
  }, [replacementPct, careTier]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Form */}
      <div className="space-y-12 lg:col-span-7">
        {/* Process inputs */}
        <fieldset className="space-y-6">
          <legend className="section-label">01 — The manual process</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Hours per week on this process"
              value={hoursPerWeek}
              onChange={setHoursPerWeek}
              min={0}
              step={1}
            />
            <NumberInput
              label="People involved"
              value={peopleInvolved}
              onChange={setPeopleInvolved}
              min={0}
              step={1}
            />
            <NumberInput
              label="Avg hourly cost (loaded)"
              help="Salary + taxes + overhead"
              value={hourlyCost}
              onChange={setHourlyCost}
              min={0}
              step={5}
              prefix="$"
            />
            <NumberInput
              label="Time AI will replace (%)"
              help="Most workflows automate 70–90% — there's always some human review."
              value={replacementPct}
              onChange={setReplacementPct}
              min={0}
              step={5}
              suffix="%"
            />
          </div>
        </fieldset>

        {/* Build inputs */}
        <fieldset className="space-y-6">
          <legend className="section-label">02 — The automation</legend>
          <NumberInput
            label="One-time build cost"
            help="Stratus typical range: $5K–$20K depending on complexity."
            value={buildCost}
            onChange={setBuildCost}
            min={0}
            step={500}
            prefix="$"
          />

          <div>
            <p className="text-sm font-medium">Monthly Care tier</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Monitoring, prompt tuning, and small fixes — distinct from
              API spend.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {CARE_TIERS.map((tier) => {
                const active = careTier === tier.key;
                return (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setCareTier(tier.key)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background hover:border-foreground/40"
                    }`}
                  >
                    <span
                      className={`block text-sm font-medium ${
                        active ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {tier.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                      ${tier.monthly}/mo
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <NumberInput
            label="Estimated monthly API pass-through"
            help="LLM tokens + third-party APIs. Light: $0–$50. Moderate: $50–$500. Heavy/voice: $500+."
            value={apiCost}
            onChange={setApiCost}
            min={0}
            step={25}
            prefix="$"
          />
        </fieldset>

        {/* Scenario pills */}
        <fieldset className="space-y-3">
          <legend className="section-label">Quick scenarios</legend>
          <p className="text-sm text-muted-foreground">
            Pick a baseline. Adjust from there.
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
              const s = SCENARIOS[key];
              const active = activeScenario === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyScenario(key)}
                  className={`rounded-full border px-4 py-2 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-foreground hover:border-foreground/40"
                  }`}
                >
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    {s.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Results panel */}
      <aside className="lg:col-span-5">
        <div className="sticky top-32 space-y-6">
          {/* Headline */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="section-label">Net monthly savings</p>
            {inputsValid ? (
              <>
                <p
                  className={`mt-4 text-5xl font-semibold tracking-tight ${
                    metrics.netMonthlySavings < 0 ? "text-muted-foreground" : ""
                  }`}
                >
                  {formatUsd(metrics.netMonthlySavings)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Labor saved ({formatUsd(metrics.monthlyLaborSavings)}/mo)
                  minus Stratus Care + API ({formatUsd(metrics.monthlyAutomationCost)}/mo).
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Enter positive numbers to see results.
              </p>
            )}
          </div>

          {/* Tile row */}
          {inputsValid && (
            <div className="grid grid-cols-2 gap-3">
              <Tile
                label="Hours saved / mo"
                value={formatNumber(metrics.hoursSavedPerMonth)}
              />
              <Tile
                label="Net savings / mo"
                value={formatUsd(metrics.netMonthlySavings)}
              />
              <Tile label="Payback" value={metrics.paybackLabel} />
              <Tile
                label="3-year ROI"
                value={`${formatNumber(metrics.roiPct)}%`}
              />
            </div>
          )}

          {/* 3-year detail */}
          {inputsValid && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="section-label">3-year picture</p>
              <div className="mt-4 grid gap-3 text-sm">
                <Row
                  label="Total labor saved"
                  value={formatUsd(metrics.monthlyLaborSavings * 36)}
                />
                <Row
                  label="Total automation cost"
                  value={`−${formatUsd(metrics.monthlyAutomationCost * 36)}`}
                />
                <Row
                  label="One-time build"
                  value={`−${formatUsd(buildCost)}`}
                />
                <div className="mt-2 border-t border-border pt-3">
                  <Row
                    label="Net 3-year savings"
                    value={formatUsd(metrics.totalSaved3yr)}
                    accent
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sanity check */}
          <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
            <p className="section-label">Honest sanity check</p>
            <p className="mt-3 text-sm text-muted-foreground">
              These numbers assume the workflow actually does what you scoped.
              Real automation projects have hidden edge cases — we account for
              that in the Care tier. If anything looks too good to be true,
              run the conservative scenario (50% replacement instead of 80%).
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <a
              href="/start"
              className="rounded-full bg-foreground px-5 py-2.5 text-center text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Get a real quote →
            </a>
            <a
              href="/tools/cost-estimator"
              className="rounded-full border border-border bg-background px-5 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Estimate the AI tokens →
            </a>
          </div>

          {/* How we calculate */}
          <details className="group rounded-2xl border border-border bg-card p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-foreground">
              <span>How we calculate this</span>
              <span
                aria-hidden="true"
                className="transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <div className="mt-4 space-y-3 text-xs text-muted-foreground">
              <Formula
                title="Hours saved per month"
                expr="hours/week × 4.33 × people × replacement %"
              />
              <Formula
                title="Monthly labor savings"
                expr="hours saved × hourly cost"
              />
              <Formula
                title="Monthly automation cost"
                expr="Care tier + API pass-through"
              />
              <Formula
                title="Net monthly savings"
                expr="labor savings − automation cost"
              />
              <Formula
                title="Payback period"
                expr="build cost ÷ net monthly savings"
              />
              <Formula
                title="3-year net savings"
                expr="(labor savings × 36) − (automation cost × 36) − build cost"
              />
              <Formula
                title="3-year ROI"
                expr="3-year net savings ÷ build cost × 100"
              />
              <p className="pt-2">
                We use 4.33 weeks per month — slightly more accurate than 4.
              </p>
            </div>
          </details>
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
  prefix,
  suffix,
}: {
  label: string;
  help?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  function handle(raw: string) {
    if (raw === "") {
      onChange(0);
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(Math.max(min, n));
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {help && (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {help}
        </span>
      )}
      <div className="mt-2 flex items-stretch overflow-hidden rounded-lg border border-border bg-background focus-within:border-foreground">
        {prefix && (
          <span className="flex items-center pl-4 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => handle(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2.5 text-base text-foreground focus:outline-none"
        />
        {suffix && (
          <span className="flex items-center pr-4 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-foreground">{label}</span>
      <span
        className={`font-mono ${
          accent ? "text-accent font-semibold" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Formula({ title, expr }: { title: string; expr: string }) {
  return (
    <div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="font-mono text-[11px] text-accent">{expr}</p>
    </div>
  );
}
