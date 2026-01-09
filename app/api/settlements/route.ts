/**
 * Settlements API Route
 * 
 * Handles monthly revenue settlement statements for KDM/V+ revenue sharing
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
import { COLLECTIONS, SettlementDoc } from '@/lib/schema';
import { calculateRevenueSplit, REVENUE_SPLIT } from '@/lib/stripe';

/**
 * GET /api/settlements
 * Retrieve settlement statements with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const settlementsRef = collection(db, COLLECTIONS.SETTLEMENTS);
    let constraints: any[] = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    constraints.push(orderBy('periodEnd', 'desc'));

    const q = query(settlementsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    let settlements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by year/month if specified
    if (year || month) {
      settlements = settlements.filter((s: any) => {
        const periodEnd = s.periodEnd.toDate();
        if (year && periodEnd.getFullYear() !== parseInt(year)) return false;
        if (month && periodEnd.getMonth() + 1 !== parseInt(month)) return false;
        return true;
      });
    }

    return NextResponse.json({ settlements });
  } catch (error: any) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settlements
 * Generate a new settlement statement for a period
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      periodStart,
      periodEnd,
      programRevenues,
      directProgramCosts,
      platformRunCostAllowance = 0,
      costRecoveryPool = 0,
      notes
    } = body;

    if (!periodStart || !periodEnd || !programRevenues) {
      return NextResponse.json(
        { error: 'periodStart, periodEnd, and programRevenues are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Calculate totals
    const revenueTotal = 
      (programRevenues.membershipDues || 0) +
      (programRevenues.eventTickets || 0) +
      (programRevenues.sponsorFees || 0) +
      (programRevenues.pursuitPacks || 0) +
      (programRevenues.other || 0);

    const costsTotal = 
      (directProgramCosts?.processorFees || 0) +
      (directProgramCosts?.chargebacks || 0) +
      (directProgramCosts?.refunds || 0) +
      (directProgramCosts?.fraudLosses || 0) +
      (directProgramCosts?.thirdPartyCosts || 0);

    // Calculate revenue split
    const split = calculateRevenueSplit({
      programRevenues: revenueTotal,
      processorFees: directProgramCosts?.processorFees || 0,
      chargebacks: directProgramCosts?.chargebacks || 0,
      refunds: directProgramCosts?.refunds || 0,
      fraudLosses: directProgramCosts?.fraudLosses || 0,
      thirdPartyCosts: directProgramCosts?.thirdPartyCosts || 0,
      platformRunCostAllowance,
      costRecoveryPool,
    });

    const settlementData: Omit<SettlementDoc, 'id'> = {
      periodStart: Timestamp.fromDate(new Date(periodStart)),
      periodEnd: Timestamp.fromDate(new Date(periodEnd)),
      programRevenues: {
        membershipDues: programRevenues.membershipDues || 0,
        eventTickets: programRevenues.eventTickets || 0,
        sponsorFees: programRevenues.sponsorFees || 0,
        pursuitPacks: programRevenues.pursuitPacks || 0,
        other: programRevenues.other || 0,
        total: revenueTotal,
      },
      directProgramCosts: {
        processorFees: directProgramCosts?.processorFees || 0,
        chargebacks: directProgramCosts?.chargebacks || 0,
        refunds: directProgramCosts?.refunds || 0,
        fraudLosses: directProgramCosts?.fraudLosses || 0,
        thirdPartyCosts: directProgramCosts?.thirdPartyCosts || 0,
        total: costsTotal,
      },
      platformRunCostAllowance,
      costRecoveryPool,
      netProgramRevenue: split.netProgramRevenue,
      kdmShare: split.kdmShare,
      vplusShare: split.vplusShare,
      status: 'draft',
      notes,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const settlementsRef = collection(db, COLLECTIONS.SETTLEMENTS);
    const docRef = await addDoc(settlementsRef, settlementData);

    return NextResponse.json({
      settlementId: docRef.id,
      summary: {
        totalRevenue: revenueTotal,
        totalCosts: costsTotal,
        netProgramRevenue: split.netProgramRevenue,
        kdmShare: split.kdmShare,
        vplusShare: split.vplusShare,
        splitPercentage: `${REVENUE_SPLIT.KDM_PERCENTAGE}/${REVENUE_SPLIT.VPLUS_PERCENTAGE}`,
      },
      message: 'Settlement statement created successfully'
    });
  } catch (error: any) {
    console.error('Error creating settlement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create settlement' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settlements
 * Update a settlement statement (status changes, notes, etc.)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settlementId, ...updates } = body;

    if (!settlementId) {
      return NextResponse.json(
        { error: 'settlementId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const settlementRef = doc(db, COLLECTIONS.SETTLEMENTS, settlementId);
    const settlementSnap = await getDoc(settlementRef);

    if (!settlementSnap.exists()) {
      return NextResponse.json(
        { error: 'Settlement not found' },
        { status: 404 }
      );
    }

    // Only allow certain fields to be updated
    const allowedUpdates: any = {};
    if (updates.status) allowedUpdates.status = updates.status;
    if (updates.notes !== undefined) allowedUpdates.notes = updates.notes;
    if (updates.pdfUrl) allowedUpdates.pdfUrl = updates.pdfUrl;

    await updateDoc(settlementRef, {
      ...allowedUpdates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      settlementId 
    });
  } catch (error: any) {
    console.error('Error updating settlement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settlement' },
      { status: 500 }
    );
  }
}

/**
 * Generate settlement from actual transaction data
 * POST /api/settlements/generate
 */
export async function generateSettlement(periodStart: Date, periodEnd: Date) {
  if (!db) throw new Error('Database not initialized');

  const startTimestamp = Timestamp.fromDate(periodStart);
  const endTimestamp = Timestamp.fromDate(periodEnd);

  // Aggregate membership revenue
  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const membershipsQuery = query(
    membershipsRef,
    where('status', '==', 'active')
  );
  const membershipsSnapshot = await getDocs(membershipsQuery);
  
  let membershipDues = 0;
  membershipsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    // Simplified - in production, query actual payments from Stripe
    membershipDues += data.amount || 0;
  });

  // Aggregate ticket revenue
  const ticketsRef = collection(db, COLLECTIONS.TICKETS);
  const ticketsQuery = query(
    ticketsRef,
    where('status', '==', 'paid'),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp)
  );
  const ticketsSnapshot = await getDocs(ticketsQuery);
  
  let eventTickets = 0;
  ticketsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    eventTickets += data.price || 0;
  });

  // Aggregate sponsor revenue
  const sponsorsRef = collection(db, COLLECTIONS.SPONSORS);
  const sponsorsQuery = query(
    sponsorsRef,
    where('status', '==', 'paid'),
    where('paidAt', '>=', startTimestamp),
    where('paidAt', '<=', endTimestamp)
  );
  const sponsorsSnapshot = await getDocs(sponsorsQuery);
  
  let sponsorFees = 0;
  sponsorsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    sponsorFees += data.amount || 0;
  });

  return {
    membershipDues,
    eventTickets,
    sponsorFees,
    pursuitPacks: 0, // Would need pursuit pack tracking
    other: 0,
  };
}
