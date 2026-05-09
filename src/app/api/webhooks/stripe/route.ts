import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const stripe = getStripe();
  const resend = new Resend(process.env.RESEND_API_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan ?? "unknown";
      const customerEmail = session.customer_details?.email ?? "unknown";
      const customerName = session.customer_details?.name ?? "unknown";

      console.log(`Checkout complete: ${plan} — ${customerEmail}`);

      await resend.emails.send({
        from: "Stratus Creative <notifications@stratus-creative.com>",
        to: "business@stratus-creative.com",
        subject: `New payment: ${plan} — ${customerName}`,
        text: [
          `Plan: ${plan}`,
          `Customer: ${customerName}`,
          `Email: ${customerEmail}`,
          `Amount: $${((session.amount_total ?? 0) / 100).toFixed(2)}`,
          `Mode: ${session.mode}`,
          `Session ID: ${session.id}`,
          session.customer ? `Customer ID: ${session.customer}` : "",
          session.subscription ? `Subscription ID: ${session.subscription}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      }).catch((err) => console.error("Email send failed:", err));

      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`Invoice paid: ${invoice.id} — ${invoice.customer_email}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(`Invoice payment failed: ${invoice.id} — ${invoice.customer_email}`);

      if (invoice.customer_email) {
        await resend.emails.send({
          from: "Stratus Creative <notifications@stratus-creative.com>",
          to: "business@stratus-creative.com",
          subject: `Payment failed: ${invoice.customer_email}`,
          text: [
            `Customer: ${invoice.customer_email}`,
            `Invoice ID: ${invoice.id}`,
            `Amount due: $${((invoice.amount_due ?? 0) / 100).toFixed(2)}`,
          ].join("\n"),
        }).catch((err) => console.error("Email send failed:", err));
      }

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`Subscription cancelled: ${sub.id} — customer ${sub.customer}`);

      await resend.emails.send({
        from: "Stratus Creative <notifications@stratus-creative.com>",
        to: "business@stratus-creative.com",
        subject: `Subscription cancelled: ${sub.id}`,
        text: [
          `Subscription ID: ${sub.id}`,
          `Customer ID: ${sub.customer}`,
          `Cancelled at: ${new Date((sub.canceled_at ?? 0) * 1000).toISOString()}`,
          `Plan: ${sub.metadata?.plan ?? "unknown"}`,
        ].join("\n"),
      }).catch((err) => console.error("Email send failed:", err));

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
