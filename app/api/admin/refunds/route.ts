import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

/**
 * POST /api/admin/refunds
 * Create a refund for a payment intent or charge
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, chargeId, amount, reason, metadata } = body;

    if (!paymentIntentId && !chargeId) {
      return NextResponse.json(
        { error: 'paymentIntentId or chargeId is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    const refundParams: Stripe.RefundCreateParams = {
      reason: reason || 'requested_by_customer',
    };

    if (paymentIntentId) {
      refundParams.payment_intent = paymentIntentId;
    } else if (chargeId) {
      refundParams.charge = chargeId;
    }

    if (amount) {
      refundParams.amount = amount; // Partial refund amount in cents
    }

    if (metadata) {
      refundParams.metadata = metadata;
    }

    const refund = await stripe.refunds.create(refundParams);

    return NextResponse.json({ refund });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create refund' },
      { status: 500 }
    );
  }
}
