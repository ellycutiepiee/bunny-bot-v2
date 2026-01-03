import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID; // recurring $4/month price
  if (!stripeSecret || !priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-11-20" });

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://bunny-bot.com/premium?success=1",
      cancel_url: "https://bunny-bot.com/premium?canceled=1",
      client_reference_id: (session.user as any).id, // Discord user ID injected via NextAuth
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Stripe error" }, { status: 500 });
  }
}
