import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { setupIntentId, paymentMethodId, email } = body;

    if (!setupIntentId || !paymentMethodId) {
      return NextResponse.json(
        { error: "setupIntentId and paymentMethodId are required" },
        { status: 400 }
      );
    }

    // Retrieve the setup intent to get the customer and priceId
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const customerId = setupIntent.customer as string;
    const priceId = setupIntent.metadata?.priceId || process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;

    if (!customerId) {
      return NextResponse.json({ error: "No customer found" }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: "No price ID configured" }, { status: 400 });
    }

    // Set the payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create the subscription with the saved payment method
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: {
        membershipType: "kdm-consortium",
        setupIntentId,
        email: email || "",
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Confirm subscription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 }
    );
  }
}
