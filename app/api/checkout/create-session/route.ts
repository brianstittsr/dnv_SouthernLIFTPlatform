import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRODUCTS } from "@/lib/types/cart";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const transactionItems: any[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = PRODUCTS[item.productId as keyof typeof PRODUCTS];
      
      if (!product) {
        return NextResponse.json(
          { error: `Invalid product: ${item.productId}` },
          { status: 400 }
        );
      }

      const amount = Math.round(product.price * 100);
      totalAmount += amount * item.quantity;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
            metadata: {
              productId: product.id,
              productType: product.type,
            },
          },
          unit_amount: amount,
          recurring: product.billingPeriod === 'monthly' ? {
            interval: 'month',
          } : product.billingPeriod === 'annual' ? {
            interval: 'year',
          } : undefined,
        },
        quantity: item.quantity,
      });

      transactionItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: lineItems.some(item => item.price_data?.recurring) ? 'subscription' : 'payment',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout-cart`,
      metadata: {
        source: 'checkout-cart',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    if (!db) {
      console.error("Firebase Admin not initialized");
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const transactionRef = db.collection('transactions').doc();
    await transactionRef.set({
      id: transactionRef.id,
      stripeSessionId: checkoutSession.id,
      status: 'pending',
      amount: totalAmount / 100,
      currency: 'usd',
      customerEmail: checkoutSession.customer_email || '',
      customerName: '',
      userId: '',
      items: transactionItems,
      metadata: {
        mode: checkoutSession.mode,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
