/**
 * Meemerging businessrships API Route
 * 
 * Handles CRUD operations for KDM Consortium meemerging businessrships
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS, Meemerging businessrshipDoc } from '@/lib/schema';
import { 
  createStripeCustomer, 
  createCheckoutSession,
  MEemerging businessRSHIP_TIERS 
} from '@/lib/stripe';

/**
 * GET /api/meemerging businessrships
 * Retrieve all meemerging businessrships or filter by userId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const meemerging businessrshipsRef = collection(db, COLLECTIONS.MEemerging businessRSHIPS);
    let q;

    if (userId && status) {
      q = query(
        meemerging businessrshipsRef,
        where('userId', '==', userId),
        where('status', '==', status)
      );
    } else if (userId) {
      q = query(meemerging businessrshipsRef, where('userId', '==', userId));
    } else if (status) {
      q = query(meemerging businessrshipsRef, where('status', '==', status));
    } else {
      q = query(meemerging businessrshipsRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const meemerging businessrships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ meemerging businessrships });
  } catch (error: any) {
    console.error('Error fetching meemerging businessrships:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meemerging businessrships' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/meemerging businessrships
 * Create a new meemerging businessrship (initiates Stripe checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      email, 
      name, 
      tier = 'core-capture',
      billingCycle = 'monthly',
      trialDays,
      successUrl,
      cancelUrl 
    } = body;

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'userId, email, and name are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Check if user already has an active meemerging businessrship
    const meemerging businessrshipsRef = collection(db, COLLECTIONS.MEemerging businessRSHIPS);
    const existingQuery = query(
      meemerging businessrshipsRef,
      where('userId', '==', userId),
      where('status', 'in', ['active', 'trialing'])
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'User already has an active meemerging businessrship' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const customer = await createStripeCustomer({
      email,
      name,
      userId,
      metadata: {
        tier,
        billingCycle,
      },
    });

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
    const session = await createCheckoutSession({
      customerId: customer.id,
      tier: tier as 'core-capture',
      billingCycle: billingCycle as 'monthly' | 'annual',
      successUrl: successUrl || `${baseUrl}/portal/meemerging businessrship/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${baseUrl}/portal/meemerging businessrship/cancel`,
      trialDays,
    });

    // Create pending meemerging businessrship record
    const tierConfig = MEemerging businessRSHIP_TIERS[tier as keyof typeof MEemerging businessRSHIP_TIERS];
    const meemerging businessrshipData: Omit<Meemerging businessrshipDoc, 'id'> = {
      userId,
      tier: tier as 'core-capture' | 'pursuit-pack' | 'custom',
      status: 'trialing',
      billingCycle: billingCycle as 'monthly' | 'annual',
      amount: billingCycle === 'monthly' 
        ? (tierConfig as any).monthlyPrice 
        : (tierConfig as any).annualPrice,
      stripeSubscriptionId: '', // Will be set by webhook
      stripeCustomerId: customer.id,
      currentPeriodStart: Timestamp.now(),
      currentPeriodEnd: Timestamp.now(),
      cancelAtPeriodEnd: false,
      metadata: {
        conciergeHoursUsed: 0,
        conciergeHoursLimit: (tierConfig as any).conciergeHoursLimit || 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(meemerging businessrshipsRef, meemerging businessrshipData);

    return NextResponse.json({
      meemerging businessrshipId: docRef.id,
      checkoutUrl: session.url,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('Error creating meemerging businessrship:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create meemerging businessrship' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meemerging businessrships
 * Update meemerging businessrship (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { meemerging businessrshipId, updates } = body;

    if (!meemerging businessrshipId || !updates) {
      return NextResponse.json(
        { error: 'meemerging businessrshipId and updates are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const meemerging businessrshipRef = doc(db, COLLECTIONS.MEemerging businessRSHIPS, meemerging businessrshipId);
    const meemerging businessrshipSnap = await getDoc(meemerging businessrshipRef);

    if (!meemerging businessrshipSnap.exists()) {
      return NextResponse.json(
        { error: 'Meemerging businessrship not found' },
        { status: 404 }
      );
    }

    await updateDoc(meemerging businessrshipRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      meemerging businessrshipId 
    });
  } catch (error: any) {
    console.error('Error updating meemerging businessrship:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update meemerging businessrship' },
      { status: 500 }
    );
  }
}
