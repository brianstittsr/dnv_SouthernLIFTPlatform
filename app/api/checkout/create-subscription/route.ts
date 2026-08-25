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

    // Use SetupIntent to collect payment details first (card, bank transfer/ACH, etc.).
    // After payment method is confirmed, we create the subscription separately.
    // This avoids the invoice PaymentIntent 400 error with Stripe Elements.
    // `automatic_payment_methods` (instead of a hardcoded `payment_method_types`)
    // lets Stripe dynamically offer any payment method enabled in the Dashboard,
    // including "Pay by bank" / ACH direct debit (us_bank_account).
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      usage: "off_session",
      automatic_payment_methods: { enabled: true },
      metadata: {
        priceId: priceId || "",
        membershipType: "kdm-consortium",
        email,
      },
    });

    console.log("SetupIntent created:", { 
      id: setupIntent.id, 
      hasClientSecret: !!setupIntent.client_secret,
      clientSecretPrefix: setupIntent.client_secret?.substring(0, 20) 
    });

    if (!setupIntent.client_secret) {
      return NextResponse.json(
        { error: "Stripe did not return a client secret. Please try again." },
        { status: 500 }
      );
    }

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
