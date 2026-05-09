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
import {
  formatCurrency as fmtCurrency,
  formatLongDate,
  greeting,
  humanize,
} from "./_helpers";
import { SITE_URL } from "./_theme";

interface Props {
  name?: string | null;
  businessName?: string | null;
  projectType?: string | null;
  amount: number;
  scope: string;
  submissionId: string;
  paymentLink?: string | null;
  sentAt?: string | Date | null;
}

export default function QuoteSentEmail({
  name,
  businessName,
  projectType,
  amount,
  scope,
  submissionId,
  paymentLink,
  sentAt,
}: Props) {
  const trackerUrl = `${SITE_URL}/quote/${submissionId}`;
  const formatted = fmtCurrency(amount) ?? `$${amount}`;
  const dateLabel = formatLongDate(sentAt ?? new Date());
  const projectLabel = humanize(projectType);

  return (
    <EmailLayout preview={`Your quote from Stratus Creative — ${formatted}`}>
      <Eyebrow>Quote ready</Eyebrow>
      <Headline serif>Your proposal.</Headline>

      <Paragraph>{greeting(name)}</Paragraph>

      <Paragraph>
        Thanks for the conversation. Based on what you shared, here&rsquo;s
        what we&rsquo;re proposing for{" "}
        {businessName ? (
          <>
            <strong>{businessName}</strong>
          </>
        ) : (
          "your project"
        )}
        {" "}— fixed-price, no retainer, no surprise add-ons.
      </Paragraph>

      <StatBlock label="Investment" value={formatted} />

      <DetailCard>
        {projectLabel && (
          <DetailRow label="Project type" value={projectLabel} />
        )}
        <DetailRow label="Scope" value={scope} />
        {dateLabel && <DetailRow label="Sent" value={dateLabel} />}
        <DetailRow label="Reference" value={submissionId} />
      </DetailCard>

      {paymentLink ? (
        <>
          <Paragraph>
            Ready to start? Use the secure payment link below — kickoff begins
            once payment is received.
          </Paragraph>
          <CtaButton href={paymentLink}>Accept and pay securely</CtaButton>
          <SecondaryLink href={trackerUrl}>
            View on your tracker
          </SecondaryLink>
        </>
      ) : (
        <>
          <Paragraph>
            Reply to this email when you&rsquo;re ready to move forward and
            we&rsquo;ll send next steps to get started.
          </Paragraph>
          <CtaButton href={trackerUrl}>Open your tracker</CtaButton>
        </>
      )}

      <MutedParagraph>
        Questions, scope tweaks, or want a quick call? Just reply.
      </MutedParagraph>

      <Signoff name="James · Stratus Creative" />
    </EmailLayout>
  );
}

QuoteSentEmail.PreviewProps = {
  name: "Alex Smith",
  businessName: "Smith Plumbing Co.",
  projectType: "website",
  amount: 5000,
  scope:
    "Multi-page marketing site with custom design, basic SEO, and Google Business Profile setup. Two rounds of revisions included. Hosted on Vercel.",
  submissionId: "preview-abc-123",
  paymentLink: null,
  sentAt: new Date(),
} satisfies Props;
