import Stripe from "stripe";

/**
 * Lazy Stripe client. Module-level instantiation breaks Vercel builds when
 * STRIPE_SECRET_KEY isn't set in the build environment, so we defer until
 * the first call inside a request handler.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Configure it in the Vercel project's environment variables."
    );
  }
  cached = new Stripe(key);
  return cached;
}
