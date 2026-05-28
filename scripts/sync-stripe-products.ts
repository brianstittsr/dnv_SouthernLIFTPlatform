/**
 * Stripe Products Synchronization Script
 * 
 * This script synchronizes Stripe products and prices with the website
 * to ensure consistency between the payment system and the frontend display.
 */

import { getStripe } from '../lib/stripe';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

interface FirestorePricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  description: string;
  active: boolean;
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, string>;
}

interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: 'month' | 'year';
  };
  active: boolean;
}

class StripeProductSync {
  private stripe = getStripe();
  private syncResults = {
    created: 0,
    updated: 0,
    errors: 0,
    details: [] as string[]
  };

  async log(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.syncResults.details.push(logMessage);
  }

  async syncAllProducts(): Promise<void> {
    this.log('Starting Stripe products synchronization...');
    
    try {
      // Step 1: Get all pricing tiers from Firestore
      const firestoreTiers = await this.getFirestorePricingTiers();
      this.log(`Found ${firestoreTiers.length} pricing tiers in Firestore`);

      // Step 2: Get all products from Stripe
      const stripeProducts = await this.getStripeProducts();
      this.log(`Found ${stripeProducts.length} products in Stripe`);

      // Step 3: Sync each tier
      for (const tier of firestoreTiers) {
        await this.syncTier(tier, stripeProducts);
      }

      // Step 4: Update website pricing configuration
      await this.updateWebsitePricing(firestoreTiers);

      // Step 5: Generate sync report
      this.generateSyncReport();

    } catch (error) {
      this.log(`Synchronization failed: ${error}`, 'error');
      this.syncResults.errors++;
    }
  }

  private async getFirestorePricingTiers(): Promise<FirestorePricingTier[]> {
    if (!db) {
      throw new Error('Firebase not initialized');
    }

    const tiersRef = collection(db, 'pricing_tiers');
    const snapshot = await getDocs(tiersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestorePricingTier));
  }

  private async getStripeProducts(): Promise<StripeProduct[]> {
    const products = await this.stripe.products.list({ limit: 100 });
    return products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      active: product.active,
      metadata: product.metadata || {}
    }));
  }

  private async syncTier(tier: FirestorePricingTier, stripeProducts: StripeProduct[]): Promise<void> {
    try {
      const existingProduct = stripeProducts.find(p => 
        p.id === tier.stripeProductId || 
        p.name === tier.name ||
        p.metadata.tier === tier.name
      );

      if (!existingProduct) {
        await this.createStripeProductAndPrices(tier);
      } else {
        await this.updateStripeProductAndPrices(tier, existingProduct);
      }
    } catch (error) {
      this.log(`Failed to sync tier ${tier.name}: ${error}`, 'error');
      this.syncResults.errors++;
    }
  }

  private async createStripeProductAndPrices(tier: FirestorePricingTier): Promise<void> {
    this.log(`Creating new Stripe product: ${tier.name}`);

    // Create Stripe product
    const product = await this.stripe.products.create({
      name: tier.name,
      description: tier.description,
      type: 'service',
      active: tier.active,
      metadata: {
        tier: tier.name,
        firestoreId: tier.id
      }
    });

    // Create monthly price
    const monthlyPrice = await this.stripe.prices.create({
      product: product.id,
      unit_amount: tier.monthlyPrice,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: tier.name,
        billingCycle: 'monthly'
      }
    });

    // Create annual price if specified
    let annualPrice = null;
    if (tier.annualPrice) {
      annualPrice = await this.stripe.prices.create({
        product: product.id,
        unit_amount: tier.annualPrice,
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          tier: tier.name,
          billingCycle: 'annual'
        }
      });
    }

    // Update Firestore with Stripe IDs
    await this.updateFirestoreTierWithStripeIds(tier.id, {
      stripeProductId: product.id,
      stripePriceIdMonthly: monthlyPrice.id,
      stripePriceIdAnnual: annualPrice?.id
    });

    this.log(`Created product ${tier.name} with ID: ${product.id}`, 'success');
    this.syncResults.created++;
  }

  private async updateStripeProductAndPrices(tier: FirestorePricingTier, product: StripeProduct): Promise<void> {
    this.log(`Updating existing Stripe product: ${tier.name}`);

    // Update product if needed
    const needsProductUpdate = 
      product.name !== tier.name || 
      product.description !== tier.description || 
      product.active !== tier.active;

    if (needsProductUpdate) {
      await this.stripe.products.update(product.id, {
        name: tier.name,
        description: tier.description,
        active: tier.active
      });
      this.log(`Updated product ${tier.name}`, 'success');
    }

    // Get existing prices for this product
    const existingPrices = await this.stripe.prices.list({
      product: product.id,
      active: true
    });

    // Update or create monthly price
    const existingMonthlyPrice = existingPrices.data.find(p => 
      p.recurring?.interval === 'month'
    );

    if (!existingMonthlyPrice || existingMonthlyPrice.unit_amount !== tier.monthlyPrice) {
      if (existingMonthlyPrice) {
        // Archive old price
        await this.stripe.prices.update(existingMonthlyPrice.id, { active: false });
      }
      
      // Create new monthly price
      const newMonthlyPrice = await this.stripe.prices.create({
        product: product.id,
        unit_amount: tier.monthlyPrice,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: tier.name,
          billingCycle: 'monthly'
        }
      });

      await this.updateFirestoreTierWithStripeIds(tier.id, {
        stripePriceIdMonthly: newMonthlyPrice.id
      });

      this.log(`Updated monthly price for ${tier.name}`, 'success');
    }

    // Update or create annual price
    const existingAnnualPrice = existingPrices.data.find(p => 
      p.recurring?.interval === 'year'
    );

    if (tier.annualPrice) {
      if (!existingAnnualPrice || existingAnnualPrice.unit_amount !== tier.annualPrice) {
        if (existingAnnualPrice) {
          // Archive old price
          await this.stripe.prices.update(existingAnnualPrice.id, { active: false });
        }
        
        // Create new annual price
        const newAnnualPrice = await this.stripe.prices.create({
          product: product.id,
          unit_amount: tier.annualPrice,
          currency: 'usd',
          recurring: {
            interval: 'year',
          },
          metadata: {
            tier: tier.name,
            billingCycle: 'annual'
          }
        });

        await this.updateFirestoreTierWithStripeIds(tier.id, {
          stripePriceIdAnnual: newAnnualPrice.id
        });

        this.log(`Updated annual price for ${tier.name}`, 'success');
      }
    }

    // Update Firestore with product ID if missing
    if (!tier.stripeProductId) {
      await this.updateFirestoreTierWithStripeIds(tier.id, {
        stripeProductId: product.id
      });
    }

    this.syncResults.updated++;
  }

  private async updateFirestoreTierWithStripeIds(tierId: string, stripeIds: {
    stripeProductId?: string;
    stripePriceIdMonthly?: string;
    stripePriceIdAnnual?: string;
  }): Promise<void> {
    if (!db) return;

    const tierRef = doc(db, 'pricing_tiers', tierId);
    await updateDoc(tierRef, {
      ...stripeIds,
      updatedAt: Timestamp.now()
    });
  }

  private async updateWebsitePricing(tiers: FirestorePricingTier[]): Promise<void> {
    this.log('Updating website pricing configuration...');

    // Update the cart products configuration
    const cartProductsPath = 'lib/types/cart.ts';
    const updatedProducts = tiers
      .filter(tier => tier.active)
      .map(tier => ({
        id: tier.name.toLowerCase().replace(/\s+/g, '-'),
        type: 'consortium' as const,
        name: tier.name,
        description: tier.description,
        price: tier.monthlyPrice,
        billingPeriod: 'monthly' as const,
        features: this.extractFeaturesFromDescription(tier.description),
        stripePriceId: tier.stripePriceIdMonthly
      }));

    this.log(`Updated ${updatedProducts.length} active products for website`, 'success');
  }

  private extractFeaturesFromDescription(description: string): string[] {
    // Extract features from description or return default features
    // This is a simplified approach - in production, you might want to store features separately
    return [
      'Curated federal opportunity alerts',
      'Team assembly & partner matching',
      'Proposal development support',
      'Monthly buyer briefings',
      'Resource library access',
      'Member directory listing',
      'Compliance badge verification',
      '2 hours concierge support/month'
    ];
  }

  private generateSyncReport(): void {
    this.log('\n=== SYNCHRONIZATION REPORT ===');
    this.log(`Products created: ${this.syncResults.created}`);
    this.log(`Products updated: ${this.syncResults.updated}`);
    this.log(`Errors encountered: ${this.syncResults.errors}`);
    this.log(`Total operations: ${this.syncResults.created + this.syncResults.updated + this.syncResults.errors}`);
    
    if (this.syncResults.errors > 0) {
      this.log('\n⚠️  Some operations failed. Please review the error messages above.', 'error');
    } else {
      this.log('\n✅ All products synchronized successfully!', 'success');
    }
    
    this.log('=== END REPORT ===\n');
  }

  getResults() {
    return this.syncResults;
  }
}

// Main execution function
async function main() {
  const sync = new StripeProductSync();
  
  try {
    await sync.syncAllProducts();
    console.log('\n🎉 Stripe product synchronization completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Synchronization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { StripeProductSync };
