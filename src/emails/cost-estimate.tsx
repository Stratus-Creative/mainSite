import { Section, Text } from "@react-email/components";
import {
  CtaButton,
  DetailCard,
  DetailRow,
  EmailLayout,
  Eyebrow,
  Headline,
  MutedParagraph,
  Paragraph,
  SecondaryLink,
  Signoff,
  StatBlock,
} from "./_layout";
import { COLORS, FONTS, SITE_URL } from "./_theme";

export interface CostEstimateData {
  workflow: string;
  monthlyVolume: number;
  model: string;
  buildLow: number;
  buildHigh: number;
  buildWeeks: string;
  careTierName: string;
  careMonthly: number;
  apiMonthlyLow: number;
  apiMonthlyHigh: number;
  monthlyInvoiceLow: number;
  monthlyInvoiceHigh: number;
  costPerRequest: number;
  latencyMs?: number | null;
}

interface Props {
  estimate: CostEstimateData;
  /** Plain-text fallback summary (used as a "raw view" detail at the bottom) */
  rawSummary?: string | null;
}

function fmtUsd(n: number, opts?: { cents?: boolean }): string {
  if (!Number.isFinite(n)) return "—";
  if (opts?.cents || (n > 0 && n < 1)) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtRange(low: number, high: number): string {
  return `${fmtUsd(low)} – ${fmtUsd(high)}`;
}

function fmtLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function CostEstimateEmail({ estimate, rawSummary }: Props) {
  return (
    <EmailLayout preview="Your AI workflow estimate from Stratus Creative.">
      <Eyebrow>Your estimate</Eyebrow>
      <Headline serif>The numbers, in writing.</Headline>

      <Paragraph>
        Here&rsquo;s the estimate you ran. Save it, share it with whoever
        you&rsquo;re comparing vendors with, or bring it to your next
        conversation. Real numbers beat &ldquo;starting from $X*&rdquo; every
        time.
      </Paragraph>

      <StatBlock
        label="Monthly total"
        value={fmtRange(estimate.monthlyInvoiceLow, estimate.monthlyInvoiceHigh)}
      />

      <Eyebrow>The setup</Eyebrow>
      <DetailCard>
        <DetailRow label="Workflow" value={estimate.workflow} />
        <DetailRow
          label="Volume"
          value={`${estimate.monthlyVolume.toLocaleString()} requests/mo`}
        />
        <DetailRow label="Model" value={estimate.model} />
        {typeof estimate.latencyMs === "number" && (
          <DetailRow
            label="Latency"
            value={`~${fmtLatency(estimate.latencyMs)} per request`}
          />
        )}
        <DetailRow
          label="Per request"
          value={fmtUsd(estimate.costPerRequest, { cents: true })}
        />
      </DetailCard>

      <Eyebrow>The three lines</Eyebrow>
      <DetailCard>
        <DetailRow
          label="Build (one-time)"
          value={`${fmtRange(estimate.buildLow, estimate.buildHigh)}+ · ${estimate.buildWeeks}`}
        />
        <DetailRow
          label="Care (recurring · our time)"
          value={`${estimate.careTierName} — ${fmtUsd(estimate.careMonthly)}/mo`}
        />
        <DetailRow
          label="API (recurring · pass-through)"
          value={`${fmtRange(estimate.apiMonthlyLow, estimate.apiMonthlyHigh)}/mo`}
        />
      </DetailCard>

      <Paragraph>
        Want to adjust the inputs or model a different workflow?
      </Paragraph>

      <CtaButton href={`${SITE_URL}/tools/cost-estimator`}>
        Run another estimate
      </CtaButton>

      <SecondaryLink href={`${SITE_URL}/start`}>
        Talk to us about building this
      </SecondaryLink>

      <MutedParagraph>
        Questions about the math? The transparency page at{" "}
        {SITE_URL}/transparency walks through every component.
      </MutedParagraph>

      {rawSummary && (
        <Section
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "20px 22px",
            margin: "24px 0 8px",
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: COLORS.muted,
              margin: "0 0 12px 0",
              fontWeight: 500,
            }}
          >
            Raw summary
          </Text>
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              lineHeight: 1.65,
              color: COLORS.fg,
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {rawSummary}
          </Text>
        </Section>
      )}

      <Signoff />
    </EmailLayout>
  );
}

CostEstimateEmail.PreviewProps = {
  estimate: {
    workflow: "Customer Support Bot",
    monthlyVolume: 5000,
    model: "Claude Sonnet 4.6",
    buildLow: 5000,
    buildHigh: 12000,
    buildWeeks: "4–6 weeks",
    careTierName: "AI Care · Standard",
    careMonthly: 399,
    apiMonthlyLow: 42,
    apiMonthlyHigh: 51,
    monthlyInvoiceLow: 441,
    monthlyInvoiceHigh: 450,
    costPerRequest: 0.09,
    latencyMs: 2300,
  },
  rawSummary: null,
} satisfies Props;
