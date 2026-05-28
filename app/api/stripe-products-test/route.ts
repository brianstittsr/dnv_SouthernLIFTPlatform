import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Stripe products API working',
      timestamp: new Date().toISOString(),
      path: '/api/stripe-products-test'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
