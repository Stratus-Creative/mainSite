import { NextResponse } from "next/server";
import CostEstimateEmail, {
  type CostEstimateData,
} from "@/emails/cost-estimate";
import { renderEmail } from "@/emails/render";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_NUMERIC_FIELDS: (keyof CostEstimateData)[] = [
  "monthlyVolume",
  "buildLow",
  "buildHigh",
  "careMonthly",
  "apiMonthlyLow",
  "apiMonthlyHigh",
  "monthlyInvoiceLow",
  "monthlyInvoiceHigh",
  "costPerRequest",
];

const REQUIRED_STRING_FIELDS: (keyof CostEstimateData)[] = [
  "workflow",
  "model",
  "buildWeeks",
  "careTierName",
];

function isCostEstimateData(value: unknown): value is CostEstimateData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  for (const f of REQUIRED_NUMERIC_FIELDS) {
    if (typeof v[f] !== "number" || !Number.isFinite(v[f] as number)) return false;
  }
  for (const f of REQUIRED_STRING_FIELDS) {
    if (typeof v[f] !== "string" || (v[f] as string).trim() === "") return false;
  }
  return true;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit({
      bucket: `email-estimate:${ip}`,
      max: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const body: unknown = await request.json();

    if (
      body === null ||
      typeof body !== "object" ||
      !("email" in body) ||
      !("estimateSummary" in body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { email, estimateSummary, estimate } = body as Record<string, unknown>;

    if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (typeof estimateSummary !== "string" || estimateSummary.trim() === "") {
      return NextResponse.json(
        { error: "Estimate summary is required." },
        { status: 400 }
      );
    }

    if (!isCostEstimateData(estimate)) {
      return NextResponse.json(
        { error: "Invalid estimate data." },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      console.log("[email-estimate] no RESEND_API_KEY set. Would have sent to:", email);
      return NextResponse.json({ ok: true });
    }

    const { html, text } = await renderEmail(
      CostEstimateEmail({ estimate, rawSummary: null })
    );

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Stratus Creative <notifications@stratus-creative.com>",
        to: email,
        bcc: "business@stratus-creative.com",
        subject: "Your Stratus Creative AI workflow estimate",
        html,
        text,
      }),
    });

    if (!res.ok) {
      console.error("[email-estimate] Resend error:", await res.text());
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[email-estimate] unexpected error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
