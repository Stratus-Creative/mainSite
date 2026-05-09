import {
  CtaButton,
  DetailCard,
  DetailRow,
  EmailLayout,
  Eyebrow,
  Headline,
  MutedParagraph,
  Paragraph,
  Signoff,
} from "./_layout";
import { greeting, humanize, humanizeBudget } from "./_helpers";
import { SITE_URL } from "./_theme";

interface Props {
  name?: string | null;
  businessName?: string | null;
  submissionId: string;
  projectType?: string | null;
  budget?: string | null;
  message?: string | null;
  websiteUrl?: string | null;
  concern?: string | null;
  source?: string | null;
}

export default function SubmissionConfirmationEmail({
  name,
  businessName,
  submissionId,
  projectType,
  budget,
  message,
  websiteUrl,
  concern,
  source,
}: Props) {
  const trackerUrl = `${SITE_URL}/quote/${submissionId}`;
  const isAudit = source === "free-website-audit";

  // Build the recap rows from whatever fields we have
  const recap: { label: string; value: string }[] = [];
  if (businessName) recap.push({ label: "Business", value: businessName });
  if (!isAudit && projectType)
    recap.push({ label: "Project type", value: humanize(projectType) ?? projectType });
  if (!isAudit && budget) {
    const b = humanizeBudget(budget);
    if (b) recap.push({ label: "Budget", value: b });
  }
  if (isAudit && websiteUrl) recap.push({ label: "Website", value: websiteUrl });
  if (isAudit && concern)
    recap.push({ label: "Main concern", value: humanize(concern) ?? concern });
  recap.push({ label: "Reference", value: submissionId });

  return (
    <EmailLayout preview="We got your project — here's where to track it.">
      <Eyebrow>{isAudit ? "Audit request received" : "Project received"}</Eyebrow>
      <Headline serif>Thanks — we&apos;ve got it.</Headline>

      <Paragraph>{greeting(name)}</Paragraph>

      <Paragraph>
        Your {isAudit ? "audit request" : "project"} landed in our queue. James
        will read every detail and reply personally — usually within four hours
        during business hours.
      </Paragraph>

      <Paragraph>
        In the meantime, you have a private tracker for this {isAudit ? "request" : "project"}.
        Bookmark it. We&rsquo;ll update the status as we go (received → reviewing →{" "}
        {isAudit ? "delivered" : "quoted"}), and you can check back anytime.
      </Paragraph>

      <CtaButton href={trackerUrl}>Open your project tracker</CtaButton>

      {recap.length > 0 && (
        <>
          <Eyebrow>What you sent us</Eyebrow>
          <DetailCard>
            {recap.map((r) => (
              <DetailRow key={r.label} label={r.label} value={r.value} />
            ))}
          </DetailCard>
        </>
      )}

      {message && (
        <>
          <Eyebrow>Your message</Eyebrow>
          <DetailCard>
            <Paragraph>
              <span style={{ whiteSpace: "pre-wrap" }}>{message}</span>
            </Paragraph>
          </DetailCard>
        </>
      )}

      <MutedParagraph>
        Questions before you hear from us? Just reply to this email.
      </MutedParagraph>

      <Signoff />
    </EmailLayout>
  );
}

SubmissionConfirmationEmail.PreviewProps = {
  name: "Alex Smith",
  businessName: "Smith Plumbing Co.",
  submissionId: "preview-abc-123",
  projectType: "website",
  budget: "5k-15k",
  message:
    "We need a new site for our plumbing business. Currently on Wix and it's slow. We do residential and small commercial across the upstate.",
  websiteUrl: null,
  concern: null,
  source: "start-form",
} satisfies Props;
