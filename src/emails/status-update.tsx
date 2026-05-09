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
} from "./_layout";
import { formatCurrency, greeting, humanize } from "./_helpers";
import { SITE_URL } from "./_theme";

export type StatusKey = "reviewing" | "accepted" | "closed";

interface Props {
  status: StatusKey;
  name?: string | null;
  businessName?: string | null;
  projectType?: string | null;
  submissionId: string;
  scope?: string | null;
  amount?: number | null;
  /**
   * Optional one-click portal sign-in URL. When provided, the primary CTA
   * sends the recipient straight into the rich client portal. When absent,
   * the CTA falls back to the legacy /quote/{id} tracker so previews and
   * older code paths keep working.
   */
  portalUrl?: string | null;
}

interface StatusCopy {
  preview: string;
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  ctaUrl: (id: string) => string;
  secondary?: { label: string; url: string };
}

const COPY: Record<StatusKey, StatusCopy> = {
  reviewing: {
    preview: "Quick update — we're reviewing your project.",
    eyebrow: "Status · Reviewing",
    headline: "We're on it.",
    body: "Just a quick update — we've started reviewing your project in detail. Expect a proposal in your inbox soon. We'll keep your tracker current as we move.",
    cta: "Open your tracker",
    ctaUrl: (id) => `${SITE_URL}/quote/${id}`,
  },
  accepted: {
    preview: "Your project is confirmed — let's get started.",
    eyebrow: "Status · Confirmed",
    headline: "We're building.",
    body: "Your project is confirmed and in the queue. We'll reach out shortly to schedule the kickoff and gather anything else we need to start.",
    cta: "Open your tracker",
    ctaUrl: (id) => `${SITE_URL}/quote/${id}`,
  },
  closed: {
    preview: "Closing this project out — happy to revisit anytime.",
    eyebrow: "Status · Closed",
    headline: "Wrapping this one up.",
    body: "We're closing this project out for now. No hard feelings either way — and if you've got something new in mind down the road, the door is open.",
    cta: "Start a new project",
    ctaUrl: () => `${SITE_URL}/start`,
    secondary: {
      label: "Run the cost estimator first",
      url: `${SITE_URL}/tools/cost-estimator`,
    },
  },
};

export default function StatusUpdateEmail({
  status,
  name,
  businessName,
  projectType,
  submissionId,
  scope,
  amount,
  portalUrl,
}: Props) {
  const copy = COPY[status];
  const projectLabel = humanize(projectType);
  const formattedAmount = formatCurrency(amount ?? null);
  const ctaHref = portalUrl ?? copy.ctaUrl(submissionId);
  const ctaLabel = portalUrl && status !== "closed" ? "Open your portal" : copy.cta;

  // Show the scope/amount recap on `accepted` so the client sees what they confirmed
  const showRecap =
    status === "accepted" && (scope || formattedAmount || projectLabel || businessName);

  return (
    <EmailLayout preview={copy.preview}>
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <Headline serif>{copy.headline}</Headline>

      <Paragraph>{greeting(name)}</Paragraph>

      <Paragraph>{copy.body}</Paragraph>

      <CtaButton href={ctaHref}>{ctaLabel}</CtaButton>

      {showRecap && (
        <>
          <Eyebrow>What you confirmed</Eyebrow>
          <DetailCard>
            {businessName && (
              <DetailRow label="For" value={businessName} />
            )}
            {projectLabel && (
              <DetailRow label="Project type" value={projectLabel} />
            )}
            {formattedAmount && (
              <DetailRow label="Investment" value={formattedAmount} />
            )}
            {scope && <DetailRow label="Scope" value={scope} />}
            <DetailRow label="Reference" value={submissionId} />
          </DetailCard>
        </>
      )}

      {copy.secondary && (
        <SecondaryLink href={copy.secondary.url}>
          {copy.secondary.label}
        </SecondaryLink>
      )}

      <MutedParagraph>Questions? Just reply to this email.</MutedParagraph>

      <Signoff />
    </EmailLayout>
  );
}

StatusUpdateEmail.PreviewProps = {
  status: "accepted",
  name: "Alex Smith",
  businessName: "Smith Plumbing Co.",
  projectType: "website",
  submissionId: "preview-abc-123",
  scope:
    "Multi-page marketing site with custom design, basic SEO, and Google Business Profile setup. Two rounds of revisions included.",
  amount: 5000,
} satisfies Props;
