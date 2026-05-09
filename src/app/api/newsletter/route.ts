import { NextResponse } from "next/server";
import NewsletterWelcomeEmail from "@/emails/newsletter-welcome";
import { renderEmail } from "@/emails/render";
import { emitEvent } from "@/lib/webhook-dispatch";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit({
      bucket: `newsletter:${ip}`,
      max: 5,
      windowMs: 60 * 60 * 1000, // 5 signups per hour per IP
    });
    if (!rl.allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

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
      } else {
        await emitEvent(null, "subscriber.added", { email });
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

    // Welcome email to subscriber (non-blocking)
    if (resendKey) {
      try {
        const { html, text } = await renderEmail(NewsletterWelcomeEmail());
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Stratus Creative <business@stratus-creative.com>",
            to: email,
            reply_to: "business@stratus-creative.com",
            subject: "Welcome — you're in",
            html,
            text,
          }),
        });
      } catch (err) {
        console.error("Newsletter welcome email failed", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter signup error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
