import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const TIER_PRICES = {
  diy: 9900, // $99 in cents
  dwy: 29900, // $299 in cents
  dfy: 59900, // $599 in cents
};

/**
 * POST /api/subscription/checkout
 * Create Stripe checkout session for subscription
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { tier } = body;

    if (!tier || !TIER_PRICES[tier as keyof typeof TIER_PRICES]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `SVP Platform - ${tier.toUpperCase()} Subscription`,
              description: `Monthly subscription to ${tier.toUpperCase()} tier`,
            },
            unit_amount: TIER_PRICES[tier as keyof typeof TIER_PRICES],
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/subscription`,
      customer_email: userData?.email,
      metadata: {
        userId: decodedToken.uid,
        tier,
        type: "subscription",
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
