import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';

/**
 * GET /api/admin/stripe-products
 * Fetch all Stripe products and prices
 */
export async function GET(req: NextRequest) {
  try {
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
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 100
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          active: product.active,
          metadata: product.metadata,
          created: product.created,
          updated: product.updated,
          prices: prices.data.map(price => ({
            id: price.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            recurring: price.recurring,
            active: price.active,
            created: price.created,
            metadata: price.metadata
          }))
        };
      })
    );

    // Get pricing tiers from Firestore for comparison
    let firestoreTiers: any[] = [];
    if (db) {
      const tiersRef = collection(db, 'pricing_tiers');
      const tiersSnapshot = await getDocs(tiersRef);
      firestoreTiers = tiersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return NextResponse.json({
      products: productsWithPrices,
      firestoreTiers,
      summary: {
        totalProducts: productsWithPrices.length,
        activeProducts: productsWithPrices.filter(p => p.active).length,
        totalPrices: productsWithPrices.reduce((sum, p) => sum + p.prices.length, 0),
        syncedTiers: firestoreTiers.filter(t => t.stripeProductId).length
      }
    });

  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Stripe products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stripe-products
 * Create a new Stripe product
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, active = true, metadata = {}, prices } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create the product
    const product = await stripe.products.create({
      name,
      description: description || '',
      active,
      metadata: {
        ...metadata,
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      }
    });

    // Create prices if provided
    const createdPrices = [];
    if (prices && Array.isArray(prices)) {
      for (const priceConfig of prices) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceConfig.unit_amount,
          currency: priceConfig.currency || 'usd',
          recurring: priceConfig.recurring,
          metadata: {
            ...priceConfig.metadata,
            productId: product.id
          }
        });
        createdPrices.push(price);
      }
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        metadata: product.metadata,
        created: product.created
      },
      prices: createdPrices
    });

  } catch (error) {
    console.error('Error creating Stripe product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Stripe product' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/stripe-products
 * Update an existing Stripe product
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, active, metadata } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (metadata !== undefined) updateData.metadata = metadata;

    const product = await stripe.products.update(id, updateData);

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        metadata: product.metadata,
        updated: product.updated
      }
    });

  } catch (error) {
    console.error('Error updating Stripe product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update Stripe product' },
      { status: 500 }
    );
  }
}
