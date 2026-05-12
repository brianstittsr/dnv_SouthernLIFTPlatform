import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

/**
 * GET /api/admin/subscriptions
 * List all Stripe subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;

    const params: Stripe.SubscriptionListParams = {
      limit,
      expand: ['data.customer', 'data.default_payment_method', 'data.items.data.price'],
    };

    if (status) {
      params.status = status as Stripe.SubscriptionListParams.Status;
    }

    const subscriptions = await stripe.subscriptions.list(params);

    return NextResponse.json({
      subscriptions: subscriptions.data,
      hasMore: subscriptions.has_more,
    });
  } catch (error: any) {
    console.error('Error listing subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list subscriptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscriptions
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, priceId, quantity = 1, trialDays, metadata } = body;

    if (!customerId || !priceId) {
      return NextResponse.json(
        { error: 'customerId and priceId are required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId, quantity }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    };

    if (trialDays) {
      subscriptionParams.trial_period_days = trialDays;
    }

    if (metadata) {
      subscriptionParams.metadata = metadata;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
