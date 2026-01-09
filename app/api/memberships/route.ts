/**
 * Memberships API Route
 * 
 * Handles CRUD operations for KDM Consortium memberships
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
import { COLLECTIONS, MembershipDoc } from '@/lib/schema';
import { 
  createStripeCustomer, 
  createCheckoutSession,
  MEMBERSHIP_TIERS 
} from '@/lib/stripe';

/**
 * GET /api/memberships
 * Retrieve all memberships or filter by userId
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

    const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
    let q;

    if (userId && status) {
      q = query(
        membershipsRef,
        where('userId', '==', userId),
        where('status', '==', status)
      );
    } else if (userId) {
      q = query(membershipsRef, where('userId', '==', userId));
    } else if (status) {
      q = query(membershipsRef, where('status', '==', status));
    } else {
      q = query(membershipsRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const memberships = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ memberships });
  } catch (error: any) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memberships
 * Create a new membership (initiates Stripe checkout)
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

    // Check if user already has an active membership
    const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
    const existingQuery = query(
      membershipsRef,
      where('userId', '==', userId),
      where('status', 'in', ['active', 'trialing'])
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'User already has an active membership' },
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
      successUrl: successUrl || `${baseUrl}/portal/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${baseUrl}/portal/membership/cancel`,
      trialDays,
    });

    // Create pending membership record
    const tierConfig = MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS];
    const membershipData: Omit<MembershipDoc, 'id'> = {
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

    const docRef = await addDoc(membershipsRef, membershipData);

    return NextResponse.json({
      membershipId: docRef.id,
      checkoutUrl: session.url,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('Error creating membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create membership' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/memberships
 * Update membership (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId, updates } = body;

    if (!membershipId || !updates) {
      return NextResponse.json(
        { error: 'membershipId and updates are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipId);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    await updateDoc(membershipRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      membershipId 
    });
  } catch (error: any) {
    console.error('Error updating membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update membership' },
      { status: 500 }
    );
  }
}
