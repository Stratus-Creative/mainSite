import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await request.json();

  if (!customerId || typeof customerId !== "string" || !customerId.startsWith("cus_")) {
    return NextResponse.json({ error: "Invalid customerId" }, { status: 400 });
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? "https://stratus-creative.com";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: origin,
  });

  return NextResponse.json({ url: session.url });
}
