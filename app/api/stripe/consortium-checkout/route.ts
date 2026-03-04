import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/lib/firebase-admin";
import { CheckoutSessionRequest, BUYER_PRICING, SUPPLIER_PRICING } from "@/lib/types/consortium";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await auth.verifyIdToken(token);

    const body: CheckoutSessionRequest = await req.json();
    const { plan, userType } = body;

    if (!plan || !userType) {
      return NextResponse.json(
        { error: "Missing required fields: plan and userType" },
        { status: 400 }
      );
    }

    const priceIds = {
      buyer: {
        monthly: process.env.STRIPE_BUYER_MONTHLY_PRICE_ID,
        annual: process.env.STRIPE_BUYER_ANNUAL_PRICE_ID,
      },
      supplier: {
        monthly: process.env.STRIPE_SUPPLIER_MONTHLY_PRICE_ID,
        annual: process.env.STRIPE_SUPPLIER_ANNUAL_PRICE_ID,
      },
    };

    const priceId = priceIds[userType][plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid price configuration" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: decodedToken.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/portal/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/portal/payment`,
      metadata: {
        firebaseUid: decodedToken.uid,
        userType,
        plan,
        membershipType: "consortium",
      },
      subscription_data: {
        metadata: {
          firebaseUid: decodedToken.uid,
          userType,
          plan,
        },
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
