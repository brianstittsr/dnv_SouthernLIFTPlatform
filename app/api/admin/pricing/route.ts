import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

/**
 * GET /api/admin/pricing
 * Fetch all pricing tiers and promotional prices
 */
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Fetch pricing tiers
    const tiersRef = collection(db, 'pricing_tiers');
    const tiersSnapshot = await getDocs(tiersRef);
    const tiers = tiersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch promotional prices
    const promosRef = collection(db, 'promotional_prices');
    const promosSnapshot = await getDocs(promosRef);
    const promotionalPrices = promosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      tiers,
      promotionalPrices,
    });
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
}
