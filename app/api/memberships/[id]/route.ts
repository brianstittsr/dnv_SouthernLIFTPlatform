/**
 * Individual Membership API Route
 * 
 * Handles operations for a specific membership by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';
import { cancelSubscription, getSubscription } from '@/lib/stripe';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/memberships/[id]
 * Get a specific membership by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, id);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    const membershipData = membershipSnap.data();
    const membership = {
      id: membershipSnap.id,
      ...membershipData
    };

    // Optionally fetch Stripe subscription details
    if (membershipData.stripeSubscriptionId) {
      try {
        const subscription = await getSubscription(membershipData.stripeSubscriptionId);
        return NextResponse.json({ 
          membership,
          stripeSubscription: {
            status: subscription.status,
            currentPeriodEnd: (subscription as any).current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        });
      } catch {
        // Return membership without Stripe details if fetch fails
      }
    }

    return NextResponse.json({ membership });
  } catch (error: any) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch membership' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/memberships/[id]
 * Update a specific membership
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, id);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Remove fields that shouldn't be updated directly
    const { id: _, createdAt, stripeSubscriptionId, stripeCustomerId, ...updates } = body;

    await updateDoc(membershipRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      membershipId: id 
    });
  } catch (error: any) {
    console.error('Error updating membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update membership' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memberships/[id]
 * Cancel a membership (sets cancel_at_period_end in Stripe)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const immediate = searchParams.get('immediate') === 'true';

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, id);
    const membershipSnap = await getDoc(membershipRef);

    if (!membershipSnap.exists()) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    const membership = membershipSnap.data();

    // Cancel Stripe subscription
    if (membership.stripeSubscriptionId) {
      await cancelSubscription({
        subscriptionId: membership.stripeSubscriptionId,
        cancelAtPeriodEnd: !immediate,
      });
    }

    // Update membership status
    await updateDoc(membershipRef, {
      status: immediate ? 'cancelled' : membership.status,
      cancelAtPeriodEnd: !immediate,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      membershipId: id,
      cancelledImmediately: immediate,
      message: immediate 
        ? 'Membership cancelled immediately' 
        : 'Membership will be cancelled at the end of the billing period'
    });
  } catch (error: any) {
    console.error('Error cancelling membership:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
