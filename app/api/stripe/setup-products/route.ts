import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

/**
 * POST /api/stripe/setup-products
 * One-time setup endpoint to create Stripe products and prices for KDM Consortium Membership
 * This should only be run once during initial setup
 */
export async function POST(req: NextRequest) {
  try {
    // Note: In production, add proper authentication here
    // For now, this endpoint is accessible to set up initial Stripe products

    // Check if product already exists
    const existingProducts = await stripe.products.list({
      limit: 100,
    });

    let product = existingProducts.data.find(
      (p) => p.name === "KDM Consortium Membership"
    );

    if (!product) {
      // Create the product
      product = await stripe.products.create({
        name: "KDM Consortium Membership",
        description:
          "Monthly recurring membership to KDM Consortium with exclusive benefits and access to government contracting opportunities",
        type: "service",
        metadata: {
          membershipType: "kdm-consortium",
          billingCycle: "monthly",
        },
      });
      console.log("Created product:", product.id);
    } else {
      console.log("Product already exists:", product.id);
    }

    // Check if monthly price already exists
    const existingPrices = await stripe.prices.list({
      product: product.id,
      limit: 100,
    });

    let monthlyPrice = existingPrices.data.find(
      (p) => p.recurring?.interval === "month" && p.active
    );

    if (!monthlyPrice) {
      // Create monthly recurring price ($1,250/month)
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 125000, // $1,250.00 in cents
        currency: "usd",
        recurring: {
          interval: "month",
          interval_count: 1,
        },
        metadata: {
          billingCycle: "monthly",
          displayName: "Monthly Membership",
        },
      });
      console.log("Created monthly price:", monthlyPrice.id);
    } else {
      console.log("Monthly price already exists:", monthlyPrice.id);
    }

    // Optionally create an annual price for discounted yearly billing
    let annualPrice = existingPrices.data.find(
      (p) => p.recurring?.interval === "year" && p.active
    );

    if (!annualPrice) {
      // Create annual recurring price ($12,000/year - 20% discount)
      annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 1200000, // $12,000.00 in cents
        currency: "usd",
        recurring: {
          interval: "year",
          interval_count: 1,
        },
        metadata: {
          billingCycle: "annual",
          displayName: "Annual Membership (Save 20%)",
        },
      });
      console.log("Created annual price:", annualPrice.id);
    } else {
      console.log("Annual price already exists:", annualPrice.id);
    }

    return NextResponse.json({
      message: "Stripe products and prices set up successfully",
      product: {
        id: product.id,
        name: product.name,
      },
      prices: {
        monthly: {
          id: monthlyPrice.id,
          amount: monthlyPrice.unit_amount,
          currency: monthlyPrice.currency,
          interval: "month",
        },
        annual: {
          id: annualPrice.id,
          amount: annualPrice.unit_amount,
          currency: annualPrice.currency,
          interval: "year",
        },
      },
    });
  } catch (error) {
    console.error("Error setting up Stripe products:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to set up products" },
      { status: 500 }
    );
  }
}
