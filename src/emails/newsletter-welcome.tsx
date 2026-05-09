import {
  EmailLayout,
  Eyebrow,
  Headline,
  MutedParagraph,
  Paragraph,
  SecondaryLink,
  Signoff,
} from "./_layout";
import { SITE_URL } from "./_theme";

export default function NewsletterWelcomeEmail() {
  return (
    <EmailLayout preview="You're in. One decoded piece a month — no pitch.">
      <Eyebrow>Welcome</Eyebrow>
      <Headline serif>You&rsquo;re in.</Headline>

      <Paragraph>
        About once a month you&rsquo;ll get one piece — practical writing on
        websites, AI workflows, and AI cost transparency. Things we&rsquo;ve
        actually shipped, billed for, or measured. No pitch. No funnel.
      </Paragraph>

      <Paragraph>
        While you wait, two things worth your time:
      </Paragraph>

      <SecondaryLink href={`${SITE_URL}/tools/cost-estimator`}>
        Run the AI cost estimator
      </SecondaryLink>

      <SecondaryLink href={`${SITE_URL}/resources/free-website-audit`}>
        Request a free 15-minute website audit
      </SecondaryLink>

      <MutedParagraph>
        Want to unsubscribe? Just reply with &ldquo;unsubscribe&rdquo; and
        we&rsquo;ll take you off the list immediately.
      </MutedParagraph>

      <Signoff />
    </EmailLayout>
  );
}
