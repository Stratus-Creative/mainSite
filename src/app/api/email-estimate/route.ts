import { NextResponse } from "next/server";

// Basic RFC 5322 email pattern — not exhaustive, but catches obvious mistakes.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
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

    const { email, estimateSummary } = body as Record<string, unknown>;

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

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      // Dev / preview environments without Resend configured — log and succeed silently.
      console.log("[email-estimate] no RESEND_API_KEY set. Would have sent to:", email);
      return NextResponse.json({ ok: true });
    }

    const text = [
      estimateSummary,
      "──────────────────────────────────────",
      "Run a new estimate or adjust yours at https://stratus-creative.com/tools/cost-estimator",
    ].join("\n");

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
