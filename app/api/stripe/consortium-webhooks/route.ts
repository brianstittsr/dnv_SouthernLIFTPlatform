import { NextRequest, NextResponse } from "next/server";
import { getStripe, verifyWebhookSignature } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";
import Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const event = verifyWebhookSignature(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { firebaseUid, userType, plan, firstName, lastName, companyName } = session.metadata || {};

        if (!firebaseUid) {
          console.error("Missing firebaseUid in session metadata");
          break;
        }

        // Generate username and password from registration data
        const tempPassword = crypto.randomBytes(12).toString('hex');
        
        let username: string;
        if (firstName && lastName) {
          username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
        } else if (companyName) {
          username = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        } else {
          username = session.customer_email?.split('@')[0] || 'user';
        }
        
        username = username + Math.floor(Math.random() * 1000);

        // Update user with subscription info and generated credentials
        await db.collection("users").doc(firebaseUid).update({
          "stripe.customerId": session.customer,
          "stripe.subscriptionId": session.subscription,
          "stripe.subscriptionStatus": "active",
          "stripe.plan": plan,
          username,
          tempPassword,
          isTempPassword: true,
          hasChangedPassword: false,
          firstName: firstName || null,
          lastName: lastName || null,
          companyName: companyName || null,
          paymentComplete: true,
          onboardingStatus: "active",
          updatedAt: Timestamp.now(),
        });

        // Send welcome email with credentials
        const { sendWelcomeEmail } = await import("@/lib/email-demo");
        await sendWelcomeEmail(session.customer_email || "", username, tempPassword, firebaseUid);

        console.log(`Payment completed for user ${firebaseUid}, credentials generated`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const { firebaseUid } = subscription.metadata || {};

        if (!firebaseUid) {
          console.error("Missing firebaseUid in subscription metadata");
          break;
        }

        await db.collection("users").doc(firebaseUid).update({
          "stripe.subscriptionStatus": subscription.status,
          updatedAt: Timestamp.now(),
        });

        console.log(`Subscription updated for user ${firebaseUid}: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { firebaseUid } = subscription.metadata || {};

        if (!firebaseUid) {
          console.error("Missing firebaseUid in subscription metadata");
          break;
        }

        await db.collection("users").doc(firebaseUid).update({
          "stripe.subscriptionStatus": "canceled",
          paymentComplete: false,
          updatedAt: Timestamp.now(),
        });

        console.log(`Subscription canceled for user ${firebaseUid}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        
        if (invoice.subscription && typeof invoice.subscription === "string") {
          const stripe = getStripe();
          const subscriptionObj = await stripe.subscriptions.retrieve(invoice.subscription);
          const { firebaseUid } = subscriptionObj.metadata || {};

          if (firebaseUid) {
            await db.collection("users").doc(firebaseUid).update({
              "stripe.subscriptionStatus": "past_due",
              updatedAt: Timestamp.now(),
            });

            console.log(`Payment failed for user ${firebaseUid}`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        
        if (invoice.subscription && typeof invoice.subscription === "string") {
          const stripe = getStripe();
          const subscriptionObj = await stripe.subscriptions.retrieve(invoice.subscription);
          const { firebaseUid } = subscriptionObj.metadata || {};

          if (firebaseUid) {
            await db.collection("users").doc(firebaseUid).update({
              "stripe.subscriptionStatus": "active",
              updatedAt: Timestamp.now(),
            });

            console.log(`Payment succeeded for user ${firebaseUid}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
