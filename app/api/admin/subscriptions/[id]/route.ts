import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

/**
 * DELETE /api/admin/subscriptions/[id]
 * Cancel a subscription immediately
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const stripe = getStripe();

    const subscription = await stripe.subscriptions.cancel(id);

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subscriptions/[id]
 * Update a subscription (e.g., cancel at period end)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { cancelAtPeriodEnd } = body;

    const stripe = getStripe();

    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
