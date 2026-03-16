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
    const { items, productName, productDescription, amount, quantity, customerInfo } = body;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const transactionItems: any[] = [];
    let totalAmount = 0;
    let checkoutMode: 'payment' | 'subscription' = 'payment';
    let successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
    let cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout-cart`;
    let source = 'checkout-cart';

    // Handle direct product purchase (e.g., CMMC Cohort)
    if (productName && amount) {
      const unitAmount = Math.round(amount * 100);
      const itemQuantity = quantity || 1;
      totalAmount = unitAmount * itemQuantity;

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            description: productDescription || '',
          },
          unit_amount: unitAmount,
        },
        quantity: itemQuantity,
      });

      transactionItems.push({
        productName,
        quantity: itemQuantity,
        price: amount,
      });

      successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}&product=cmmc-cohort`;
      cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cmmc-cohort`;
      source = 'cmmc-cohort';
    } 
    // Handle cart-based checkout
    else if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const product = PRODUCTS[item.productId as keyof typeof PRODUCTS];
        
        if (!product) {
          return NextResponse.json(
            { error: `Invalid product: ${item.productId}` },
            { status: 400 }
          );
        }

        const unitAmount = Math.round(product.price * 100);
        totalAmount += unitAmount * item.quantity;

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
            unit_amount: unitAmount,
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

      checkoutMode = lineItems.some(item => item.price_data?.recurring) ? 'subscription' : 'payment';
    } else {
      return NextResponse.json(
        { error: "Invalid request: provide either items or product details" },
        { status: 400 }
      );
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: checkoutMode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    // Add customer email if provided
    if (customerInfo?.email) {
      sessionParams.customer_email = customerInfo.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

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
      customerEmail: customerInfo?.email || checkoutSession.customer_email || '',
      customerName: customerInfo ? `${customerInfo.firstName} ${customerInfo.lastName}`.trim() : '',
      customerInfo: customerInfo || {},
      userId: '',
      items: transactionItems,
      metadata: {
        mode: checkoutSession.mode,
        source,
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
