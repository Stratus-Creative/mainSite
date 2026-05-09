"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const STARTER_PRICE = 1495;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  return currencyFormatter.format(Math.round(value));
}

export function WebsiteRoiForm() {
  const [avgSale, setAvgSale] = useState<number>(500);
  const [visitors, setVisitors] = useState<number>(1000);
  const [currentConv, setCurrentConv] = useState<number>(1.0);
  const [targetConv, setTargetConv] = useState<number>(3.0);

  const valid = avgSale > 0 && visitors > 0;

  const metrics = useMemo(() => {
    if (!valid) {
      return null;
    }
    const currentRevenue = visitors * (currentConv / 100) * avgSale;
    const newRevenue = visitors * (targetConv / 100) * avgSale;
    const monthlyLift = newRevenue - currentRevenue;
    const annualLift = monthlyLift * 12;
    const threeYearValue = annualLift * 3 - STARTER_PRICE;

    let paybackLabel: string;
    if (monthlyLift <= 0) {
      paybackLabel = "No lift to recover from";
    } else if (monthlyLift >= STARTER_PRICE) {
      paybackLabel = "Immediate";
    } else {
      const months = STARTER_PRICE / monthlyLift;
      if (months > 12) {
        paybackLabel = "12+ months";
      } else {
        paybackLabel = `${(Math.round(months * 10) / 10).toFixed(1)} months`;
      }
    }

    return {
      currentRevenue,
      newRevenue,
      monthlyLift,
      annualLift,
      threeYearValue,
      paybackLabel,
    };
  }, [valid, visitors, currentConv, targetConv, avgSale]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Inputs */}
      <div className="space-y-8 lg:col-span-7">
        <fieldset className="space-y-6">
          <legend className="section-label">Your numbers</legend>
          <p className="text-sm text-muted-foreground">
            Pull these from your analytics or your gut — directional is fine.
            Math runs entirely in your browser.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              label="Average sale / customer value"
              prefix="$"
              value={avgSale}
              onChange={setAvgSale}
              min={0}
              step={10}
            />
            <NumberField
              label="Current monthly visitors"
              value={visitors}
              onChange={setVisitors}
              min={0}
              step={100}
            />
            <NumberField
              label="Current conversion rate"
              suffix="%"
              value={currentConv}
              onChange={setCurrentConv}
              min={0}
              step={0.1}
            />
            <NumberField
              label="Target conversion rate"
              suffix="%"
              value={targetConv}
              onChange={setTargetConv}
              min={0}
              step={0.1}
              help="A custom site with clear CTAs and conversion-focused design typically lifts to 2–4%."
            />
          </div>
        </fieldset>
      </div>

      {/* Results */}
      <aside className="lg:col-span-5">
        <div className="sticky top-32 space-y-6">
          {!metrics ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="section-label">Results</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Enter positive numbers to see results.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Expected monthly revenue lift
                </p>
                <p className="mt-4 text-5xl font-semibold tracking-tight text-accent">
                  {formatCurrency(metrics.monthlyLift)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  From {formatCurrency(metrics.currentRevenue)}/mo today to{" "}
                  <span className="text-foreground">
                    {formatCurrency(metrics.newRevenue)}/mo
                  </span>{" "}
                  at the target conversion rate.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <ResultTile
                  label="Annual lift"
                  value={formatCurrency(metrics.annualLift)}
                />
                <ResultTile
                  label="Payback period"
                  value={metrics.paybackLabel}
                  hint={`vs. Starter at ${formatCurrency(STARTER_PRICE)}`}
                />
                <ResultTile
                  label="3-year value"
                  value={formatCurrency(metrics.threeYearValue)}
                  hint="Net of Starter build"
                />
              </div>

              <div className="rounded-2xl border border-border/60 bg-background p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Sanity check
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  These projections assume your visitor numbers are accurate
                  and your new site can actually convert at the target rate.
                  Real results depend on copy, design, and trust signals — not
                  just code. Treat this as a directional argument, not a
                  forecast.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
                >
                  Talk to James about a real quote
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/tools/cost-estimator"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Run the math on your AI workflow too
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </>
          )}

          <details className="rounded-2xl border border-border bg-card p-5 text-sm">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              How we calculate this
            </summary>
            <div className="mt-4 space-y-3 text-muted-foreground">
              <p>
                <span className="text-foreground">Current monthly revenue</span>
                {" = "}
                visitors × current conversion % × average sale.
              </p>
              <p>
                <span className="text-foreground">New monthly revenue</span>
                {" = "}
                visitors × target conversion % × average sale.
              </p>
              <p>
                <span className="text-foreground">Monthly lift</span> is the
                difference. <span className="text-foreground">Annual lift</span>{" "}
                multiplies that by 12.
              </p>
              <p>
                <span className="text-foreground">Payback period</span> divides
                the Starter build (
                {formatCurrency(STARTER_PRICE)}) by monthly lift. If lift is
                bigger than the build, payback shows as &quot;Immediate.&quot;
              </p>
              <p>
                <span className="text-foreground">3-year value</span> is annual
                lift × 3, minus the Starter build cost — what the upgrade is
                worth to your business across the typical lifespan of a site
                refresh.
              </p>
            </div>
          </details>
        </div>
      </aside>
    </div>
  );
}

function NumberField({
  label,
  help,
  prefix,
  suffix,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  help?: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
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

function ResultTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
