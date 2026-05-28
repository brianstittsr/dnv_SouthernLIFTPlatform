import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    // Initialize Stripe
    const stripe = getStripe();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Get products from Stripe
    const products = await stripe.products.list({
      limit: 100,
      active: includeInactive ? undefined : true
    });

    // Get prices for each product
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        try {
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
            limit: 100
          });

          return {
            ...product,
            prices: prices.data
          };
        } catch (priceError) {
          console.error(`Error fetching prices for product ${product.id}:`, priceError);
          return {
            ...product,
            prices: []
          };
        }
      })
    );

    // Get Firestore pricing tiers for comparison
    let firestoreTiers: any[] = [];
    if (db) {
      try {
        const tiersSnapshot = await getDocs(collection(db, 'pricing_tiers'));
        firestoreTiers = tiersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (firestoreError) {
        console.error('Error fetching Firestore tiers:', firestoreError);
      }
    }

    // Calculate summary statistics
    const summary = {
      totalProducts: productsWithPrices.length,
      activeProducts: productsWithPrices.filter(p => p.active).length,
      totalPrices: productsWithPrices.reduce((sum, p) => sum + p.prices.length, 0),
      syncedTiers: firestoreTiers.filter(tier => 
        tier.stripeProductId && productsWithPrices.some(p => p.id === tier.stripeProductId)
      ).length
    };

    return NextResponse.json({
      products: productsWithPrices,
      firestoreTiers,
      summary
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
    const stripe = getStripe();

    // Create product in Stripe
    const product = await stripe.products.create({
      name: body.name || 'New Product',
      description: body.description || '',
      active: body.active !== false
    });

    // Create prices if provided
    let prices = [];
    if (body.prices && Array.isArray(body.prices)) {
      prices = await Promise.all(
        body.prices.map(async (priceData: any) => {
          try {
            const price = await stripe.prices.create({
              product: product.id,
              unit_amount: priceData.unit_amount,
              currency: priceData.currency || 'usd',
              recurring: priceData.recurring,
              active: true
            });
            return price;
          } catch (priceError) {
            console.error('Error creating price:', priceError);
            return null;
          }
        })
      );
    }

    return NextResponse.json({
      product,
      prices: prices.filter(p => p !== null)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
