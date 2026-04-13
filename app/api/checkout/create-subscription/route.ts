import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, priceId } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer: Stripe.Customer | null = null;
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { source: "kdm-consortium-membership" },
      });
    }

    // Use SetupIntent to collect card details first.
    // After payment method is confirmed, we create the subscription separately.
    // This avoids the invoice PaymentIntent 400 error with Stripe Elements.
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      payment_method_types: ["card"],
      metadata: {
        priceId: priceId || "",
        membershipType: "kdm-consortium",
        email,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
      setupIntentId: setupIntent.id,
      mode: "setup",
    });
  } catch (error) {
    console.error("Setup intent creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
