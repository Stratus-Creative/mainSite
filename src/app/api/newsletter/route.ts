import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const resendKey = process.env.RESEND_API_KEY;

    if (audienceId && resendKey) {
      // Add contact to Resend audience
      const res = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        }
      );
      if (!res.ok && res.status !== 409) {
        console.error("Resend audience add failed", await res.text());
      }
    } else if (resendKey) {
      // No audience configured yet — notify admin so the signup isn't lost
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Stratus Creative <notifications@stratus-creative.com>",
          to: "business@stratus-creative.com",
          subject: `Newsletter signup: ${email}`,
          text: `New newsletter signup: ${email}\n\nRESEND_AUDIENCE_ID is not set — add this contact manually or configure the audience.`,
        }),
      });
    } else {
      console.log("[newsletter] subscribed (no Resend key):", email);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter signup error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
