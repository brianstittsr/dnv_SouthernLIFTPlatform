import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (!db) {
      console.error("Firebase Admin not initialized");
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const transactionsRef = db.collection('transactions');
        const snapshot = await transactionsRef
          .where('stripeSessionId', '==', session.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          await doc.ref.update({
            status: 'completed',
            stripePaymentIntentId: session.payment_intent as string,
            completedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            metadata: {
              ...doc.data().metadata,
              paymentStatus: session.payment_status,
              customerDetails: session.customer_details,
            },
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        const transactionsRef = db.collection('transactions');
        const snapshot = await transactionsRef
          .where('stripeSessionId', '==', session.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          await doc.ref.update({
            status: 'failed',
            updatedAt: Timestamp.now(),
            metadata: {
              ...doc.data().metadata,
              reason: 'session_expired',
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const transactionsRef = db.collection('transactions');
        const snapshot = await transactionsRef
          .where('stripePaymentIntentId', '==', paymentIntent.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          await doc.ref.update({
            status: 'failed',
            updatedAt: Timestamp.now(),
            metadata: {
              ...doc.data().metadata,
              failureReason: paymentIntent.last_payment_error?.message,
            },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        const transactionsRef = db.collection('transactions');
        const snapshot = await transactionsRef
          .where('stripePaymentIntentId', '==', charge.payment_intent)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          await doc.ref.update({
            status: 'refunded',
            updatedAt: Timestamp.now(),
            metadata: {
              ...doc.data().metadata,
              refundAmount: charge.amount_refunded,
              refundReason: charge.refunds?.data[0]?.reason,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}
