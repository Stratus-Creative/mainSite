import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES: Record<
  string,
  { name: string; amount: number; mode: Stripe.Checkout.SessionCreateParams["mode"]; interval?: "month" }
> = {
  essential: { name: "Essential Website Build", amount: 125000, mode: "payment" },
  professional: { name: "Professional Website Build", amount: 250000, mode: "payment" },
  premium: { name: "Premium Website Build", amount: 425000, mode: "payment" },
  hosting_basic: { name: "Hosting & Maintenance", amount: 4900, mode: "subscription", interval: "month" },
  hosting_plus: { name: "Hosting + Monthly Updates", amount: 9900, mode: "subscription", interval: "month" },
};

export async function POST(request: Request) {
  const { plan } = await request.json();

  const price = PRICES[plan];
  if (!price) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? "https://stratus-creative.com";

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
    price.mode === "subscription"
      ? {
          price_data: {
            currency: "usd",
            product_data: { name: price.name },
            unit_amount: price.amount,
            recurring: { interval: price.interval! },
          },
          quantity: 1,
        }
      : {
          price_data: {
            currency: "usd",
            product_data: { name: price.name },
            unit_amount: price.amount,
          },
          quantity: 1,
        };

  const session = await stripe.checkout.sessions.create({
    mode: price.mode,
    line_items: [lineItem],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cancel`,
    ...(price.mode === "subscription" && {
      subscription_data: { metadata: { plan } },
    }),
    metadata: { plan },
  });

  return NextResponse.json({ url: session.url });
}
