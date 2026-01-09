/**
 * Sponsors API Route
 * 
 * Handles CRUD operations for KDM Consortium sponsors
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
  deleteDoc,
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS, SponsorDoc } from '@/lib/schema';

/**
 * GET /api/sponsors
 * Retrieve sponsors with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const eventId = searchParams.get('eventId');
    const active = searchParams.get('active');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const sponsorsRef = collection(db, COLLECTIONS.SPONSORS);
    let constraints: any[] = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (tier) {
      constraints.push(where('tier', '==', tier));
    }

    if (eventId) {
      constraints.push(where('eventIds', 'array-contains', eventId));
    }

    if (active === 'true') {
      constraints.push(where('status', 'in', ['committed', 'paid', 'fulfilled']));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(sponsorsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const sponsors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ sponsors });
  } catch (error: any) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sponsors' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sponsors
 * Create a new sponsor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      tier,
      amount,
      benefits = [],
      logoUrl,
      websiteUrl,
      description,
      eventIds = [],
      sponsorshipPeriodStart,
      sponsorshipPeriodEnd
    } = body;

    if (!companyName || !contactEmail || !tier || amount === undefined) {
      return NextResponse.json(
        { error: 'companyName, contactEmail, tier, and amount are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const sponsorData: Omit<SponsorDoc, 'id'> = {
      companyName,
      contactName: contactName || '',
      contactEmail,
      contactPhone: contactPhone || '',
      tier,
      amount,
      status: 'prospect',
      benefits,
      benefitsFulfilled: [],
      logoUrl: logoUrl || '',
      websiteUrl: websiteUrl || '',
      description: description || '',
      eventIds,
      sponsorshipPeriodStart: sponsorshipPeriodStart 
        ? Timestamp.fromDate(new Date(sponsorshipPeriodStart))
        : Timestamp.now(),
      sponsorshipPeriodEnd: sponsorshipPeriodEnd
        ? Timestamp.fromDate(new Date(sponsorshipPeriodEnd))
        : Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 year default
      analytics: {
        impressions: 0,
        clicks: 0,
        leads: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const sponsorsRef = collection(db, COLLECTIONS.SPONSORS);
    const docRef = await addDoc(sponsorsRef, sponsorData);

    return NextResponse.json({
      sponsorId: docRef.id,
      message: 'Sponsor created successfully'
    });
  } catch (error: any) {
    console.error('Error creating sponsor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sponsor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sponsors
 * Update a sponsor
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sponsorId, ...updates } = body;

    if (!sponsorId) {
      return NextResponse.json(
        { error: 'sponsorId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const sponsorRef = doc(db, COLLECTIONS.SPONSORS, sponsorId);
    const sponsorSnap = await getDoc(sponsorRef);

    if (!sponsorSnap.exists()) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    // Convert date strings to Timestamps
    const processedUpdates: any = { ...updates };
    if (updates.sponsorshipPeriodStart) {
      processedUpdates.sponsorshipPeriodStart = Timestamp.fromDate(new Date(updates.sponsorshipPeriodStart));
    }
    if (updates.sponsorshipPeriodEnd) {
      processedUpdates.sponsorshipPeriodEnd = Timestamp.fromDate(new Date(updates.sponsorshipPeriodEnd));
    }
    if (updates.paidAt) {
      processedUpdates.paidAt = Timestamp.fromDate(new Date(updates.paidAt));
    }

    await updateDoc(sponsorRef, {
      ...processedUpdates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      sponsorId 
    });
  } catch (error: any) {
    console.error('Error updating sponsor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sponsor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sponsors
 * Delete a sponsor
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorId = searchParams.get('sponsorId');

    if (!sponsorId) {
      return NextResponse.json(
        { error: 'sponsorId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const sponsorRef = doc(db, COLLECTIONS.SPONSORS, sponsorId);
    const sponsorSnap = await getDoc(sponsorRef);

    if (!sponsorSnap.exists()) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    await deleteDoc(sponsorRef);

    return NextResponse.json({ 
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting sponsor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete sponsor' },
      { status: 500 }
    );
  }
}
