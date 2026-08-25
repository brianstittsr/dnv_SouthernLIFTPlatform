import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, customerInfo, productName, customerId, subscriptionId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Build metadata
    const metadata: Record<string, string> = {
      productName: productName || "CMMC Cohort",
      customerName: customerInfo ? `${customerInfo.firstName} ${customerInfo.lastName}` : "",
      customerEmail: customerInfo?.email || "",
      customerCompany: customerInfo?.company || "",
    };

    if (subscriptionId) {
      metadata.subscriptionId = subscriptionId;
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      // Omitting `allow_redirects` (defaults to "always") so bank transfer / ACH
      // direct debit (us_bank_account) and other eligible methods remain available.
      // The client confirms with `redirect: 'if_required'` to stay embedded when possible.
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: productName || "CMMC Cohort Registration",
      receipt_email: customerInfo?.email,
    };

    // If we have a customerId, attach it to the payment intent
    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
