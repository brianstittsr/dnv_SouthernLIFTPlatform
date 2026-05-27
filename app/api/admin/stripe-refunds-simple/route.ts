import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Simple mock response for now to avoid Stripe initialization issues
    return NextResponse.json({
      refunds: [],
      firestoreRefunds: [],
      stats: {
        totalRefunds: 0,
        totalAmount: 0,
        averageRefundAmount: 0,
        recentRefunds: 0,
        statusBreakdown: {}
      }
    });
  } catch (error) {
    console.error('Error in stripe-refunds-simple:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple mock response for now
    return NextResponse.json({
      refund: {
        id: 're_mock_' + Date.now(),
        amount: body.amount ? parseInt(body.amount) * 100 : 0,
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
        status: 'succeeded',
        reason: body.reason || 'requested_by_customer'
      }
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create refund' },
      { status: 500 }
    );
  }
}
