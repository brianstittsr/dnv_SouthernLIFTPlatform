import { NextRequest, NextResponse } from 'next/server';
import { approveManualPayout } from '@/lib/services/partner-payouts.service';

/**
 * POST /api/admin/commissions/[id]/approve
 * Approve a manual payout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { approvedBy } = body;

    if (!approvedBy) {
      return NextResponse.json(
        { error: 'approvedBy is required' },
        { status: 400 }
      );
    }

    const success = await approveManualPayout(id, approvedBy);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to approve payout' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, payoutId: id });
  } catch (error: any) {
    console.error('Error approving payout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve payout' },
      { status: 500 }
    );
  }
}
