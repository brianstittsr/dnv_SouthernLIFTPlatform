import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

interface FirestorePricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  description?: string;
  active: boolean;
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Simple Stripe product synchronization endpoint
 * No authentication required for development use
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Starting Stripe product synchronization...');
    
    const stripe = getStripe();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Get pricing tiers from Firestore
    const tiersRef = collection(db, 'pricing_tiers');
    const tiersSnapshot = await getDocs(tiersRef);
    const tiers = tiersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestorePricingTier));

    console.log(`📊 Found ${tiers.length} pricing tiers`);

    // Get existing Stripe products
    const products = await stripe.products.list({ limit: 100 });
    console.log(`📦 Found ${products.data.length} Stripe products`);

    let created = 0;
    let updated = 0;
    const results = [];

    for (const tier of tiers) {
      const existingProduct = products.data.find(p => 
        p.id === tier.stripeProductId || 
        p.name === tier.name ||
        p.metadata.tier === tier.name
      );

      if (!existingProduct) {
        // Create new product
        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description || '',
          type: 'service',
          active: tier.active,
          metadata: {
            tier: tier.name,
            firestoreId: tier.id
          }
        });

        // Create monthly price
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.monthlyPrice,
          currency: 'usd',
          recurring: { interval: 'month' },
          metadata: { tier: tier.name, billingCycle: 'monthly' }
        });

        // Create annual price if specified
        let annualPrice = null;
        if (tier.annualPrice) {
          annualPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: tier.annualPrice,
            currency: 'usd',
            recurring: { interval: 'year' },
            metadata: { tier: tier.name, billingCycle: 'annual' }
          });
        }

        // Update Firestore with Stripe IDs
        await updateDoc(doc(db, 'pricing_tiers', tier.id), {
          stripeProductId: product.id,
          stripePriceIdMonthly: monthlyPrice.id,
          stripePriceIdAnnual: annualPrice?.id,
          updatedAt: Timestamp.now()
        });

        console.log(`✅ Created product: ${tier.name}`);
        results.push({
          action: 'created',
          tier: tier.name,
          productId: product.id,
          monthlyPriceId: monthlyPrice.id,
          annualPriceId: annualPrice?.id
        });
        created++;

      } else {
        // Update existing product if needed
        let needsUpdate = false;
        const updateData: any = {};

        if (existingProduct.name !== tier.name) {
          updateData.name = tier.name;
          needsUpdate = true;
        }

        if (existingProduct.description !== tier.description) {
          updateData.description = tier.description || '';
          needsUpdate = true;
        }

        if (existingProduct.active !== tier.active) {
          updateData.active = tier.active;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await stripe.products.update(existingProduct.id, updateData);
          console.log(`🔄 Updated product: ${tier.name}`);
          results.push({
            action: 'updated',
            tier: tier.name,
            productId: existingProduct.id,
            changes: updateData
          });
          updated++;
        }

        // Update Firestore with product ID if missing
        if (!tier.stripeProductId) {
          await updateDoc(doc(db, 'pricing_tiers', tier.id), {
            stripeProductId: existingProduct.id,
            updatedAt: Timestamp.now()
          });
        }
      }
    }

    console.log(`🎉 Synchronization complete! Created: ${created}, Updated: ${updated}`);

    return NextResponse.json({
      success: true,
      message: 'Stripe products synchronized successfully',
      results: {
        created,
        updated,
        total: tiers.length,
        details: results
      }
    });

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
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
 * GET /api/sync-stripe-products
 * Get sync status information
 */
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Get current pricing tiers
    const tiersRef = collection(db, 'pricing_tiers');
    const tiersSnapshot = await getDocs(tiersRef);
    const tiers = tiersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestorePricingTier));

    // Get Stripe products count
    const stripe = getStripe();
    const products = await stripe.products.list({ limit: 100 });

    return NextResponse.json({
      message: 'Stripe product synchronization endpoint',
      status: {
        firestoreTiers: tiers.length,
        stripeProducts: products.data.length,
        syncedTiers: tiers.filter(t => t.stripeProductId).length
      },
      usage: 'POST to trigger synchronization'
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
