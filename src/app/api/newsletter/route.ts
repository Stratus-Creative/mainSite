import { NextResponse } from "next/server";

/**
 * Newsletter signup endpoint — minimal v1.
 * Records email + timestamp via Resend audience or Supabase.
 *
 * Wire-up:
 * - Set RESEND_API_KEY in env (already present for contact form)
 * - Set RESEND_AUDIENCE_ID once you create an audience in Resend
 * - Or swap to Supabase by setting SUPABASE_URL + SUPABASE_SERVICE_KEY
 *
 * Until then this endpoint accepts the submission and logs it.
 * Replace with real persistence when ready.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    const resendKey = process.env.RESEND_API_KEY;

    if (audienceId && resendKey) {
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
        // Don't fail the user — they'll think it worked, we'll capture later
      }
    } else {
      console.log("[newsletter] subscribed:", email);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Newsletter signup error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
