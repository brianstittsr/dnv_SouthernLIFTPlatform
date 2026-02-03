import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { 
  PARTNER_COLLECTIONS,
  type PayoutDoc,
  type PayoutStatus,
} from '@/lib/partner-commission-schema';
import { getPendingPayouts, retryFailedPayout } from '@/lib/services/partner-payouts.service';

/**
 * GET /api/admin/payouts
 * List all payouts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      console.log('Database not initialized, returning empty payouts');
      return NextResponse.json({ payouts: [], summary: { totalPending: 0, totalProcessing: 0, totalCompleted: 0, totalFailed: 0, pendingCount: 0, completedCount: 0 } });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as PayoutStatus | null;
    const partnerId = searchParams.get('partnerId');

    const payoutsRef = db.collection(PARTNER_COLLECTIONS.PAYOUTS);
    const snapshot = await payoutsRef.get();

    let payouts: PayoutDoc[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PayoutDoc));

    // Apply filters
    if (status) {
      payouts = payouts.filter(p => p.status === status);
    }

    if (partnerId) {
      payouts = payouts.filter(p => p.partnerId === partnerId);
    }

    // Sort by date descending
    payouts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    // Calculate summary
    const summary = {
      totalPending: payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
      totalProcessing: payouts.filter(p => p.status === 'processing').reduce((s, p) => s + p.amount, 0),
      totalCompleted: payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
      totalFailed: payouts.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0),
      pendingCount: payouts.filter(p => p.status === 'pending').length,
      completedCount: payouts.filter(p => p.status === 'completed').length,
    };

    return NextResponse.json({ payouts, summary });
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payouts
 * Retry a failed payout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutId, action } = body;

    if (!payoutId) {
      return NextResponse.json(
        { error: 'payoutId is required' },
        { status: 400 }
      );
    }

    if (action === 'retry') {
      const success = await retryFailedPayout(payoutId);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to retry payout' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, payoutId });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing payout action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payout action' },
      { status: 500 }
    );
  }
}
