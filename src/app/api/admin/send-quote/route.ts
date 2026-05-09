import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";
import { getCurrentAdmin } from "@/lib/admin-auth";
import QuoteSentEmail from "@/emails/quote-sent";
import { renderEmail } from "@/emails/render";
import { emitEvent } from "@/lib/webhook-dispatch";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, amount, scope } = await request.json();

  if (!id || !amount || !scope) {
    return NextResponse.json(
      { error: "id, amount, and scope are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Fetch the submission to get client contact info
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("email, business_name, owner_name, project_type")
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const clientName = submission.business_name ?? submission.owner_name ?? "there";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

  // --- Stripe Payment Link (activate by setting STRIPE_PAYMENT_LINKS_ENABLED=true) ---
  // When ready:
  // 1. Set STRIPE_PAYMENT_LINKS_ENABLED=true in your env
  // 2. The block below creates a one-time Stripe Price and Payment Link for this quote
  let paymentLink: string | null = null;
  if (process.env.STRIPE_PAYMENT_LINKS_ENABLED === "true") {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const price = await stripe.prices.create({
        currency: "usd",
        unit_amount: Math.round(amount * 100),
        product_data: {
          name: `Stratus Creative — ${submission.project_type ?? "Project"} quote`,
        },
      });

      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { submission_id: id },
      });

      paymentLink = link.url;
    } catch (err) {
      console.error("Stripe payment link creation failed:", err);
      // Non-fatal — send the quote email without a payment link
    }
  }
  // ---------------------------------------------------------------------------

  // Send quote email to client
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { html, text } = await renderEmail(
      QuoteSentEmail({
        name: submission.owner_name ?? null,
        businessName: submission.business_name ?? null,
        projectType: submission.project_type ?? null,
        amount,
        scope,
        submissionId: id,
        paymentLink,
        sentAt: new Date(),
      })
    );
    await resend.emails.send({
      from: "James at Stratus Creative <james@stratus-creative.com>",
      to: submission.email!,
      replyTo: "business@stratus-creative.com",
      subject: `Your quote from Stratus Creative — ${formattedAmount}`,
      html,
      text,
    });
  } catch (err) {
    console.error("Quote email failed:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }

  // Update submission
  await supabase
    .from("submissions")
    .update({
      status: "quoted",
      quoted_amount: amount,
      quoted_scope: scope,
      quoted_at: new Date().toISOString(),
      ...(paymentLink ? { stripe_payment_link: paymentLink } : {}),
    })
    .eq("id", id);

  await emitEvent(admin.id, "quote.sent", {
    id,
    amount,
    scope,
    business_name: submission.business_name,
    owner_name: submission.owner_name,
    paymentLink,
  });

  return NextResponse.json({ ok: true, paymentLink });
}
