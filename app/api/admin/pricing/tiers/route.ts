import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { getStripe } from '@/lib/stripe';

interface PricingTierRequest {
  id?: string;
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  description: string;
  active: boolean;
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

/**
 * POST /api/admin/pricing/tiers
 * Create a new pricing tier
 */
export async function POST(req: NextRequest) {
  try {
    const body: PricingTierRequest = await req.json();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    // Create Stripe product if not provided
    let stripeProductId = body.stripeProductId;
    if (!stripeProductId) {
      const product = await stripe.products.create({
        name: body.name,
        description: body.description,
        type: 'service',
        metadata: {
          tier: body.name,
        },
      });
      stripeProductId = product.id;
    }

    // Create Stripe prices
    let stripePriceIdMonthly = body.stripePriceIdMonthly;
    if (!stripePriceIdMonthly) {
      const monthlyPrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: body.monthlyPrice,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      });
      stripePriceIdMonthly = monthlyPrice.id;
    }

    let stripePriceIdAnnual = body.stripePriceIdAnnual;
    if (body.annualPrice && !stripePriceIdAnnual) {
      const annualPrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: body.annualPrice,
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
      });
      stripePriceIdAnnual = annualPrice.id;
    }

    // Save to Firestore
    const tiersRef = collection(db, 'pricing_tiers');
    const tierDoc = await addDoc(tiersRef, {
      name: body.name,
      monthlyPrice: body.monthlyPrice,
      annualPrice: body.annualPrice,
      description: body.description,
      active: body.active,
      stripeProductId,
      stripePriceIdMonthly,
      stripePriceIdAnnual,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      id: tierDoc.id,
      ...body,
      stripeProductId,
      stripePriceIdMonthly,
      stripePriceIdAnnual,
    });
  } catch (error) {
    console.error('Error creating pricing tier:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create pricing tier' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/tiers
 * Update an existing pricing tier
 */
export async function PUT(req: NextRequest) {
  try {
    const body: PricingTierRequest = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Tier ID is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const tierRef = doc(db, 'pricing_tiers', body.id);
    await updateDoc(tierRef, {
      name: body.name,
      monthlyPrice: body.monthlyPrice,
      annualPrice: body.annualPrice,
      description: body.description,
      active: body.active,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      id: body.id,
      ...body,
    });
  } catch (error) {
    console.error('Error updating pricing tier:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update pricing tier' },
      { status: 500 }
    );
  }
}
