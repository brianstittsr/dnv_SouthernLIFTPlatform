import { NextRequest, NextResponse } from "next/server";
import { getStripe, verifyWebhookSignature } from "@/lib/stripe";
import { db } from "@/lib/firebase-admin";
import Stripe from "stripe";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";

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
        const { firebaseUid, firstName, lastName, companyName, membershipType } = session.metadata || {};

        if (!firebaseUid) {
          console.error("Missing firebaseUid in session metadata");
          break;
        }

        const customerEmail = session.customer_email || "";
        const displayFirstName = firstName || customerEmail.split("@")[0] || "";
        const displayLastName = lastName || "";
        const displayCompany = companyName || "";

        // Update the pre-created user record with subscription details
        const userRef = db.collection(COLLECTIONS.USERS).doc(firebaseUid);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
          await userRef.update({
            "stripe.customerId": session.customer,
            "stripe.subscriptionId": session.subscription,
            "stripe.subscriptionStatus": "active",
            "stripe.plan": membershipType || "kdm-consortium",
            membershipStatus: "active",
            subscriptionStatus: "active",
            paymentComplete: true,
            onboardingStatus: "active",
            updatedAt: Timestamp.now(),
          });
        } else {
          // Fallback: create user doc if it was not created before checkout
          await userRef.set({
            id: firebaseUid,
            userId: firebaseUid,
            email: customerEmail,
            firstName: displayFirstName,
            lastName: displayLastName,
            companyName: displayCompany,
            role: "consortium_member",
            svpRole: "consortium_member",
            membershipType: "kdm-consortium",
            membershipStatus: "active",
            membershipTier: "core-capture",
            subscriptionStatus: "active",
            paymentComplete: true,
            onboardingStatus: "active",
            consortiumOnboardingComplete: false,
            hasChangedPassword: true,
            isTempPassword: false,
            tags: ["KDM Consortium Member"],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }

        // Ensure a consortium member record exists
        const consortiumQuery = await db
          .collection(COLLECTIONS.CONSORTIUM_MEMBERS)
          .where("firebaseUid", "==", firebaseUid)
          .limit(1)
          .get();

        if (consortiumQuery.empty) {
          await db.collection(COLLECTIONS.CONSORTIUM_MEMBERS).add({
            firebaseUid,
            firstName: displayFirstName,
            lastName: displayLastName,
            emailPrimary: customerEmail,
            company: displayCompany,
            membershipTier: "core-capture",
            membershipStatus: "active",
            subscriptionId: session.subscription as string,
            onboardingComplete: false,
            consortiumOnboardingComplete: false,
            expertise: "",
            tags: ["kdm-consortium"],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          console.log(`Consortium member created for ${firebaseUid}`);
        }

        console.log(`Payment completed for user ${firebaseUid}`);
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
