import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.json();
  const {
    businessName,
    ownerName,
    phone,
    email,
    category,
    city,
    message,
    projectType,
    budget,
    contactPref,
    smsConsent,
    source,
    websiteUrl,
    concern,
  } = body;

  // Persist submission and get back a trackable ID
  let submissionId: string | null = null;
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        source: source ?? category ?? "start-form",
        owner_name: ownerName,
        business_name: businessName,
        email,
        phone,
        project_type: projectType,
        budget,
        contact_pref: contactPref,
        sms_consent: smsConsent === "true" || smsConsent === true,
        website_url: websiteUrl,
        concern,
        message,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert failed:", error);
    } else {
      submissionId = data.id;
    }
  } catch (err) {
    console.error("Supabase error:", err);
  }

  // Email notification — include tracker link if we got an ID
  try {
    await resend.emails.send({
      from: "Stratus Creative <notifications@stratus-creative.com>",
      to: "business@stratus-creative.com",
      subject: `New lead: ${businessName} (${category ?? source ?? "start-form"})`,
      text: [
        `Business: ${businessName}`,
        `Owner: ${ownerName}`,
        `Phone: ${phone || "not provided"}`,
        `Email: ${email || "not provided"}`,
        `Type: ${category ?? source}`,
        `City: ${city ?? "not specified"}`,
        submissionId
          ? `\nQuote tracker: https://stratus-creative.com/quote/${submissionId}`
          : "",
        message ? `\nMessage:\n${message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }

  console.log("New lead:", body);
  return NextResponse.json({ success: true, id: submissionId });
}
