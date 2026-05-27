import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Simple mock response for now to avoid Stripe initialization issues
    return NextResponse.json({
      products: [],
      firestoreTiers: [],
      summary: {
        totalProducts: 0,
        activeProducts: 0,
        totalPrices: 0,
        syncedTiers: 0
      }
    });
  } catch (error) {
    console.error('Error in stripe-products-simple:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Stripe products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple mock response for now
    return NextResponse.json({
      product: {
        id: 'prod_mock_' + Date.now(),
        name: body.name || 'Mock Product',
        description: body.description || '',
        active: body.active !== false,
        created: Math.floor(Date.now() / 1000)
      },
      prices: []
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
