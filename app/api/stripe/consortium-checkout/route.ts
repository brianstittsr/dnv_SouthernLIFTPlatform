import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";
import { CheckoutSessionRequest, BUYER_PRICING, SUPPLIER_PRICING } from "@/lib/types/consortium";
import { Timestamp } from "firebase-admin/firestore";

const DISCOUNT_DEADLINE = new Date("2026-04-30");

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
    
    // Check if discount is still available
    let discountCouponId: string | undefined;
    const now = new Date();
    if (now < DISCOUNT_DEADLINE) {
      const trackerRef = db.collection("settings").doc("consortium-membership-tracker");
      const trackerDoc = await trackerRef.get();
      
      if (trackerDoc.exists) {
        const tracker = trackerDoc.data() as any;
        if (tracker && tracker.remainingSlots > 0) {
          // Apply 50% discount coupon
          discountCouponId = process.env.STRIPE_50_PERCENT_DISCOUNT_COUPON_ID;
          
          // Decrement remaining slots
          await trackerRef.update({
            remainingSlots: tracker.remainingSlots - 1,
            claimedSlots: (tracker.claimedSlots || 0) + 1,
            updatedAt: Timestamp.now(),
          });
          
          // Record the discount claim
          await trackerRef.collection("claims").doc(decodedToken.uid).set({
            userId: decodedToken.uid,
            email: decodedToken.email,
            claimedAt: Timestamp.now(),
            discountPercentage: 50,
            plan,
            userType,
          });
        }
      }
    }

    const sessionConfig: any = {
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
        discountApplied: discountCouponId ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          firebaseUid: decodedToken.uid,
          userType,
          plan,
        },
      },
    };

    // Add discount coupon if available
    if (discountCouponId) {
      sessionConfig.discounts = [{ coupon: discountCouponId }];
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      discountApplied: !!discountCouponId,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
