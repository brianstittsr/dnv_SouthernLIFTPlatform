import { NextRequest, NextResponse } from "next/server";
import { createPartialPaymentCheckoutSession } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

/**
 * POST /api/payments/partial
 * Create a Stripe Checkout session for a partial payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      entityType,
      entityId,
      entityName,
      totalAmount, // in cents
      paymentAmount, // in cents
      userId,
      userName,
      userEmail,
      eventDate,
      paymentPlanId,
      successUrl,
      cancelUrl,
      tags = [],
    } = body;

    if (!entityType || !entityId || !totalAmount || !paymentAmount || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Initiate Stripe Checkout for partial payment
    const session = await createPartialPaymentCheckoutSession({
      customerEmail: userEmail,
      entityType,
      entityId,
      entityName,
      totalAmount,
      paymentAmount,
      successUrl,
      cancelUrl,
      paymentPlanId,
      metadata: {
        userId: userId || "",
        userName: userName || "",
        userEmail: userEmail,
        type: "partial_payment",
        tags: tags.join(","),
        eventDate: eventDate || "",
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Error creating partial payment session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment session" },
      { status: 500 }
    );
  }
}
