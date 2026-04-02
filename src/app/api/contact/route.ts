import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await request.json();
  const { businessName, ownerName, phone, email, category, city, message } =
    body;

  try {
    await resend.emails.send({
      from: "Stratus Creative <notifications@stratus-creative.com>",
      to: "business@stratus-creative.com",
      subject: `New lead: ${businessName} (${category} — ${city})`,
      text: [
        `Business: ${businessName}`,
        `Owner: ${ownerName}`,
        `Phone: ${phone}`,
        `Email: ${email || "not provided"}`,
        `Type: ${category}`,
        `City: ${city}`,
        message ? `\nMessage:\n${message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("Email send failed:", err);
    // Don't fail the request — lead is logged, email is best-effort
  }

  console.log("New lead:", body);
  return NextResponse.json({ success: true });
}
