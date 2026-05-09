import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase";

async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const session = store.get("admin-session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
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
    await resend.emails.send({
      from: "James at Stratus Creative <james@stratus-creative.com>",
      to: submission.email!,
      replyTo: "business@stratus-creative.com",
      subject: `Your quote from Stratus Creative — ${formattedAmount}`,
      text: [
        `Hi ${clientName},`,
        "",
        "Thanks for reaching out — I've put together a quote based on our conversation.",
        "",
        `Project: ${scope}`,
        "",
        `Investment: ${formattedAmount}`,
        "",
        paymentLink
          ? `To accept and get started, use this payment link:\n${paymentLink}`
          : "Reply to this email and I'll send over next steps to get started.",
        "",
        "Any questions, just reply here.",
        "",
        "— James",
        "Stratus Creative",
        "business@stratus-creative.com",
        "",
        `Reference: ${id}`,
      ].join("\n"),
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

  return NextResponse.json({ ok: true, paymentLink });
}
