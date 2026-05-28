import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';

interface FirestoreTier {
  id: string;
  name?: string;
  description?: string;
  active?: boolean;
  monthlyPrice?: number;
  annualPrice?: number;
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  [key: string]: any; // Allow additional properties
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const results = {
      productsCreated: 0,
      pricesCreated: 0,
      tiersUpdated: 0,
      errors: [] as string[]
    };

    if (!db) {
      results.errors.push('Database not initialized');
      return NextResponse.json({
        success: false,
        message: 'Database not available',
        results,
        timestamp: new Date().toISOString()
      });
    }

    // Get Firestore pricing tiers
    const tiersSnapshot = await getDocs(collection(db, 'pricing_tiers'));
    const firestoreTiers: FirestoreTier[] = tiersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sync each tier to Stripe
    for (const tier of firestoreTiers) {
      try {
        // Check if product already exists
        let stripeProduct;
        if (tier.stripeProductId) {
          stripeProduct = await stripe.products.retrieve(tier.stripeProductId);
        } else {
          // Create new product
          stripeProduct = await stripe.products.create({
            name: tier.name || 'KDM Consortium Membership',
            description: tier.description || 'Membership tier for KDM Consortium',
            active: tier.active !== false
          });
          results.productsCreated++;

          // Update Firestore with Stripe product ID
          await updateDoc(doc(db, 'pricing_tiers', tier.id), {
            stripeProductId: stripeProduct.id,
            updatedAt: Timestamp.now()
          });
        }

        // Create monthly price if not exists
        if (tier.monthlyPrice && !tier.stripePriceIdMonthly) {
          const monthlyPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: tier.monthlyPrice * 100, // Convert to cents
            currency: 'usd',
            recurring: { interval: 'month' },
            active: tier.active !== false
          });
          results.pricesCreated++;

          await updateDoc(doc(db, 'pricing_tiers', tier.id), {
            stripePriceIdMonthly: monthlyPrice.id,
            updatedAt: Timestamp.now()
          });
        }

        // Create annual price if not exists
        if (tier.annualPrice && !tier.stripePriceIdAnnual) {
          const annualPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: tier.annualPrice * 100, // Convert to cents
            currency: 'usd',
            recurring: { interval: 'year' },
            active: tier.active !== false
          });
          results.pricesCreated++;

          await updateDoc(doc(db, 'pricing_tiers', tier.id), {
            stripePriceIdAnnual: annualPrice.id,
            updatedAt: Timestamp.now()
          });
        }

        results.tiersUpdated++;
      } catch (tierError) {
        const errorMsg = `Error syncing tier ${tier.name}: ${tierError instanceof Error ? tierError.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      message: `Sync completed. ${results.productsCreated} products created, ${results.pricesCreated} prices created, ${results.tiersUpdated} tiers updated.`,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in stripe-sync-simple:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync Stripe products' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Simple mock response for sync status
    return NextResponse.json({
      status: 'idle',
      lastSync: null,
      results: {
        productsCreated: 0,
        pricesCreated: 0,
        tiersUpdated: 0,
        errors: []
      }
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
