import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const REQUEST_TYPE_LABELS: Record<string, string> = {
  "something-broken": "Something's broken",
  "content-update": "Content update",
  "add-something": "Add something new",
  "billing": "Billing or invoicing",
  "other": "Other",
};

const URGENCY_LABELS: Record<string, string> = {
  "normal": "Normal",
  "urgent": "Urgent",
  "critical": "CRITICAL — site is down",
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit({
      bucket: `support:${ip}`,
      max: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { name, email, websiteUrl, requestType, urgency, description } =
      body as Record<string, string>;

    if (!name || !email || !websiteUrl || !requestType || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const typeLabel = REQUEST_TYPE_LABELS[requestType] ?? requestType;
    const urgencyLabel = URGENCY_LABELS[urgency] ?? urgency ?? "Normal";
    const isCritical = urgency === "critical";

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Stratus Creative <notifications@stratus-creative.com>",
      to: "business@stratus-creative.com",
      replyTo: email,
      subject: `${isCritical ? "🚨 CRITICAL" : urgency === "urgent" ? "⚠️ Urgent" : "Support"}: ${typeLabel} — ${websiteUrl}`,
      text: [
        `Urgency: ${urgencyLabel}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Website: ${websiteUrl}`,
        `Request type: ${typeLabel}`,
        ``,
        `Description:`,
        description,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support email send failed:", err);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
