import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export interface PromotionalPrice {
  id: string;
  tierId: string;
  tierName: string;
  promotionalPrice: number;
  validFrom: Timestamp;
  validUntil: Timestamp;
  description: string;
  active: boolean;
}

/**
 * Get the active promotional price for a tier (if any)
 */
export async function getActivePromotionalPrice(
  tierId: string
): Promise<PromotionalPrice | null> {
  if (!db) return null;

  try {
    const now = Timestamp.now();
    const promosRef = collection(db, 'promotional_prices');
    
    const q = query(
      promosRef,
      where('tierId', '==', tierId),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    
    // Find a promo that is currently active (within date range)
    for (const doc of snapshot.docs) {
      const promo = doc.data();
      if (promo.validFrom <= now && now <= promo.validUntil) {
        return {
          id: doc.id,
          ...promo,
        } as PromotionalPrice;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching promotional price:', error);
    return null;
  }
}

/**
 * Get the effective price for a tier (promotional or regular)
 */
export async function getEffectivePrice(
  tierId: string,
  regularPrice: number,
  billingCycle: 'monthly' | 'annual' = 'monthly'
): Promise<{
  price: number;
  isPromotional: boolean;
  promotion?: PromotionalPrice;
}> {
  const promo = await getActivePromotionalPrice(tierId);
  
  if (promo) {
    return {
      price: promo.promotionalPrice,
      isPromotional: true,
      promotion: promo,
    };
  }

  return {
    price: regularPrice,
    isPromotional: false,
  };
}

/**
 * Get all active promotions
 */
export async function getAllActivePromotions(): Promise<PromotionalPrice[]> {
  if (!db) return [];

  try {
    const now = Timestamp.now();
    const promosRef = collection(db, 'promotional_prices');
    
    const q = query(
      promosRef,
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    
    // Filter by date range
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as PromotionalPrice;
      })
      .filter((promo) => promo.validFrom <= now && now <= promo.validUntil);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    return [];
  }
}

/**
 * Format price for display
 */
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

/**
 * Calculate savings from promotional price
 */
export function calculateSavings(
  regularPrice: number,
  promotionalPrice: number
): {
  amount: number;
  percentage: number;
} {
  const amount = regularPrice - promotionalPrice;
  const percentage = Math.round((amount / regularPrice) * 100);
  
  return {
    amount,
    percentage,
  };
}
