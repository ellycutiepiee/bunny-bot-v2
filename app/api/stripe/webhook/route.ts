import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-11-20" });
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const discordUserId = session.client_reference_id;
    if (discordUserId) {
      // Grant 30 days of premium
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      await prisma.user.upsert({
        where: { id: discordUserId },
        update: { premiumExpiresAt: expiresAt },
        create: { id: discordUserId, premiumExpiresAt: expiresAt },
      });
    }
  }

  return new NextResponse("ok", { status: 200 });
}
