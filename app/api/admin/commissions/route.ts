import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { 
  PARTNER_COLLECTIONS,
  type PartnerAttributionDoc,
  type CommissionStatus,
  type ConsortiumPartnerId,
} from '@/lib/partner-commission-schema';

/**
 * GET /api/admin/commissions
 * List all commissions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      console.log('Database not initialized, returning empty commissions');
      return NextResponse.json({ commissions: [], summary: { totalCommissions: 0, totalTransactions: 0, pendingAmount: 0, paidAmount: 0 }, count: 0 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId') as ConsortiumPartnerId | null;
    const status = searchParams.get('status') as CommissionStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limitParam = searchParams.get('limit');

    const attributionsRef = db.collection(PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS);
    const snapshot = await attributionsRef.get();

    let results: PartnerAttributionDoc[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PartnerAttributionDoc));

    // Apply filters
    if (partnerId) {
      results = results.filter(r => 
        r.attributions.some(a => a.partnerId === partnerId)
      );
    }

    if (status) {
      results = results.filter(r => 
        r.attributions.some(a => a.status === status)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      results = results.filter(r => r.createdAt.toDate() >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      results = results.filter(r => r.createdAt.toDate() <= end);
    }

    // Sort by date descending
    results.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    // Apply limit
    if (limitParam) {
      results = results.slice(0, parseInt(limitParam));
    }

    // Calculate summary stats
    const summary = {
      totalCommissions: results.reduce((sum, r) => sum + r.totalCommissions, 0),
      totalTransactions: results.length,
      pendingAmount: results.reduce((sum, r) => {
        return sum + r.attributions
          .filter(a => a.status === 'pending')
          .reduce((s, a) => s + a.amount, 0);
      }, 0),
      paidAmount: results.reduce((sum, r) => {
        return sum + r.attributions
          .filter(a => a.status === 'paid')
          .reduce((s, a) => s + a.amount, 0);
      }, 0),
    };

    return NextResponse.json({
      commissions: results,
      summary,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}
