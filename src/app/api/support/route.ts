import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.json();
  const { name, email, websiteUrl, requestType, description } = body;

  const requestTypeLabel: Record<string, string> = {
    "bug-fix": "Bug Fix",
    "content-update": "Content Update",
    "feature-request": "Feature Request",
    "billing-question": "Billing Question",
  };

  try {
    await resend.emails.send({
      from: "Stratus Creative <notifications@stratus-creative.com>",
      to: "business@stratus-creative.com",
      subject: `Support request: ${requestTypeLabel[requestType] ?? requestType} — ${websiteUrl}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Website: ${websiteUrl}`,
        `Request Type: ${requestTypeLabel[requestType] ?? requestType}`,
        `\nDescription:\n${description}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Support email send failed:", err);
  }

  console.log("Support request:", body);
  return NextResponse.json({ success: true });
}
