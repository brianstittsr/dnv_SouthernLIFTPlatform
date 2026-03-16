import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, customerInfo, productName } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never", // Disable redirect-based payment methods for embedded form
      },
      metadata: {
        productName: productName || "CMMC Cohort",
        customerName: customerInfo ? `${customerInfo.firstName} ${customerInfo.lastName}` : "",
        customerEmail: customerInfo?.email || "",
        customerCompany: customerInfo?.company || "",
      },
      description: productName || "CMMC Cohort Registration",
      receipt_email: customerInfo?.email,
    });

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
