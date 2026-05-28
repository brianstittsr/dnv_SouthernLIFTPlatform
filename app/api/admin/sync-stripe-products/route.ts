import { NextRequest, NextResponse } from 'next/server';
import { StripeProductSync } from '@/../../scripts/sync-stripe-products';

/**
 * POST /api/admin/sync-stripe-products
 * Trigger Stripe products synchronization
 */
export async function POST(req: NextRequest) {
  try {
    const sync = new StripeProductSync();
    await sync.syncAllProducts();
    
    const results = sync.getResults();
    
    return NextResponse.json({
      success: true,
      message: 'Stripe products synchronized successfully',
      results: {
        created: results.created,
        updated: results.updated,
        errors: results.errors,
        details: results.details
      }
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync Stripe products' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync-stripe-products
 * Get sync status
 */
export async function GET() {
  return NextResponse.json({
    message: 'Stripe product synchronization endpoint',
    usage: 'POST to trigger synchronization',
    endpoint: '/api/admin/sync-stripe-products'
  });
}
