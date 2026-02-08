import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;
    const tier = session.metadata?.tier ?? "single";
    if (email) {
      const now = new Date();
      const expiresAt = tier === "30day" ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
      const remainingCredits = tier === "single" ? 1 : null;

      await prisma.purchase.upsert({
        where: { stripe_session_id: session.id },
        create: {
          email,
          tier,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer?.toString() ?? null,
          status: "paid",
          expires_at: expiresAt,
          remaining_credits: remainingCredits
        },
        update: {
          status: "paid",
          expires_at: expiresAt,
          remaining_credits: remainingCredits
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
