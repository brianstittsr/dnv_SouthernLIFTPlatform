import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const { courseIds } = await request.json();

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid course IDs' },
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

    // Fetch course details from Firestore
    const courses = await Promise.all(
      courseIds.map(async (courseId) => {
        const courseDoc = await db.collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
          throw new Error(`Course ${courseId} not found`);
        }
        return { id: courseDoc.id, ...courseDoc.data() };
      })
    );

    // Check if user already has memberships for these courses
    const existingmemberships = await Promise.all(
      courseIds.map(async (courseId) => {
        const membershipQuery = await db
          .collection('course_memberships')
          .where('userId', '==', userId)
          .where('courseId', '==', courseId)
          .limit(1)
          .get();
        return !membershipQuery.empty;
      })
    );

    if (existingmemberships.some(exists => exists)) {
      return NextResponse.json(
        { error: 'You are already enrolled in one or more of these courses' },
        { status: 400 }
      );
    }

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = courses.map((course: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: course.title,
          description: course.description || `${course.estimatedDurationWeeks}-week course`,
          images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
          metadata: {
            courseId: course.id,
            facilitatorName: course.facilitatorName,
            difficultyLevel: course.difficultyLevel,
          },
        },
        unit_amount: course.priceInCents,
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/instructor/courses?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses?canceled=true`,
      customer_email: decodedToken.email,
      client_reference_id: userId,
      metadata: {
        userId,
        courseIds: courseIds.join(','),
        type: 'course_purchase',
      },
    });

    // Store pending purchase in Firestore
    await db.collection('course_purchases').add({
      userId,
      courseIds,
      stripeSessionId: session.id,
      status: 'pending',
      totalAmount: courses.reduce((sum: number, c: any) => sum + c.priceInCents, 0),
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
