import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validation";
import { getBaseUrl } from "@/lib/utils";

const priceMap: Record<string, string | undefined> = {
  single: process.env.STRIPE_PRICE_ID_SINGLE,
  "30day": process.env.STRIPE_PRICE_ID_30DAY,
  lifetime: process.env.STRIPE_PRICE_ID_LIFETIME
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigin = process.env.APP_BASE_URL;
  if (allowedOrigin && origin && !origin.startsWith(allowedOrigin)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const priceId = priceMap[parsed.data.tier];
  if (!priceId) {
    return NextResponse.json({ error: "Pricing configuration is missing." }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getBaseUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/app`,
    customer_email: parsed.data.email,
    metadata: {
      tier: parsed.data.tier
    }
  });

  return NextResponse.json({ url: session.url });
}
