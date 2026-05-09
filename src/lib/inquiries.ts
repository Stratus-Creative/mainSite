import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import SubmissionConfirmationEmail from "@/emails/submission-confirmation";
import { renderEmail } from "@/emails/render";

export interface InquiryInput {
  source: string;
  email: string;
  message: string;
  ownerName?: string;
  businessName?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  contactPref?: string;
  smsConsent?: boolean;
  websiteUrl?: string;
  concern?: string;
  category?: string;
  city?: string;
  sessionId?: string;
}

export interface InquiryResult {
  id: string | null;
  error?: unknown;
}

export async function createInquiry(input: InquiryInput): Promise<InquiryResult> {
  let submissionId: string | null = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        source: input.source,
        owner_name: input.ownerName ?? null,
        business_name: input.businessName ?? null,
        email: input.email,
        phone: input.phone ?? null,
        project_type: input.projectType ?? null,
        budget: input.budget ?? null,
        contact_pref: input.contactPref ?? null,
        sms_consent: input.smsConsent ?? false,
        website_url: input.websiteUrl ?? null,
        concern: input.concern ?? null,
        message: input.message,
        session_id: input.sessionId ?? null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Supabase insert failed:", error);
      return { id: null, error };
    }
    submissionId = data.id;
  } catch (err) {
    console.error("Supabase error:", err);
    return { id: null, error: err };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const labelType = input.category ?? input.source;
  const labelName = input.businessName ?? input.ownerName ?? "(no name)";

  try {
    await resend.emails.send({
      from: "Stratus Creative <notifications@stratus-creative.com>",
      to: "business@stratus-creative.com",
      subject: `New lead: ${labelName} (${labelType})`,
      text: [
        `Business: ${input.businessName ?? "not provided"}`,
        `Owner: ${input.ownerName ?? "not provided"}`,
        `Phone: ${input.phone || "not provided"}`,
        `Email: ${input.email || "not provided"}`,
        `Type: ${labelType}`,
        `City: ${input.city ?? "not specified"}`,
        submissionId
          ? `\nQuote tracker: https://stratus-creative.com/quote/${submissionId}`
          : "",
        input.message ? `\nMessage:\n${input.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("Notification email failed:", err);
  }

  if (input.email && submissionId) {
    try {
      const { html, text } = await renderEmail(
        SubmissionConfirmationEmail({
          name: input.ownerName ?? null,
          businessName: input.businessName ?? null,
          submissionId,
          projectType: input.projectType ?? null,
          budget: input.budget ?? null,
          message: input.message ?? null,
          websiteUrl: input.websiteUrl ?? null,
          concern: input.concern ?? null,
          source: input.source ?? null,
        })
      );
      await resend.emails.send({
        from: "Stratus Creative <business@stratus-creative.com>",
        to: input.email,
        replyTo: "business@stratus-creative.com",
        subject: "We got your project — here's your tracker",
        html,
        text,
      });
    } catch (err) {
      console.error("Client confirmation email failed:", err);
    }
  }

  return { id: submissionId };
}
