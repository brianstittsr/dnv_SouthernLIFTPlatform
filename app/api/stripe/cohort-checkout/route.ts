import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { cohortIds } = await request.json();

    if (!cohortIds || !Array.isArray(cohortIds) || cohortIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid cohort IDs' },
        { status: 400 }
      );
    }

    // Get authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Fetch cohort details from Firestore
    const cohorts = await Promise.all(
      cohortIds.map(async (cohortId) => {
        const cohortDoc = await db.collection('cohorts').doc(cohortId).get();
        if (!cohortDoc.exists) {
          throw new Error(`Cohort ${cohortId} not found`);
        }
        return { id: cohortDoc.id, ...cohortDoc.data() };
      })
    );

    // Check if user already has memberships for these cohorts
    const existingMemberships = await Promise.all(
      cohortIds.map(async (cohortId) => {
        const membershipQuery = await db
          .collection('cohort_memberships')
          .where('userId', '==', userId)
          .where('cohortId', '==', cohortId)
          .limit(1)
          .get();
        return !membershipQuery.empty;
      })
    );

    if (existingMemberships.some(exists => exists)) {
      return NextResponse.json(
        { error: 'You are already enrolled in one or more of these cohorts' },
        { status: 400 }
      );
    }

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cohorts.map((cohort: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: cohort.title,
          description: cohort.description || `${cohort.estimatedDurationWeeks}-week cohort`,
          images: cohort.thumbnailUrl ? [cohort.thumbnailUrl] : [],
          metadata: {
            cohortId: cohort.id,
            facilitatorName: cohort.facilitatorName,
            difficultyLevel: cohort.difficultyLevel,
          },
        },
        unit_amount: cohort.priceInCents,
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/instructor/cohorts?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cohorts?canceled=true`,
      customer_email: decodedToken.email,
      client_reference_id: userId,
      metadata: {
        userId,
        cohortIds: cohortIds.join(','),
        type: 'cohort_purchase',
      },
    });

    // Store pending purchase in Firestore
    await db.collection('cohort_purchases').add({
      userId,
      cohortIds,
      stripeSessionId: session.id,
      status: 'pending',
      totalAmount: cohorts.reduce((sum: number, c: any) => sum + c.priceInCents, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
