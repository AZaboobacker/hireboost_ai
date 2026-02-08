import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { signSession, getCookieName } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not confirmed yet." }, { status: 400 });
  }

  const email = session.customer_email;
  const tier = session.metadata?.tier || "single";
  if (!email) {
    return NextResponse.json({ error: "Missing customer email." }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = tier === "30day" ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const remainingCredits = tier === "single" ? 1 : null;

  await prisma.purchase.upsert({
    where: { stripe_session_id: sessionId },
    create: {
      email,
      tier,
      stripe_session_id: sessionId,
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

  const token = signSession({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 });
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: getCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
