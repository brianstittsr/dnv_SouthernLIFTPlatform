import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const COLLECTION_NAME = "consortiumPricing";
    
    // Get all pricing data
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    const prices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as any));

    return NextResponse.json({
      success: true,
      count: prices.length,
      prices: prices.map(p => ({
        id: p.id,
        name: p.name,
        priceType: p.priceType,
        price: p.price,
        active: p.active,
        isPromotional: p.isPromotional,
        promotionalPrice: p.promotionalPrice,
        description: p.description,
        createdAt: p.createdAt?.toDate()?.toISOString(),
        updatedAt: p.updatedAt?.toDate()?.toISOString(),
      })),
      message: `Found ${prices.length} pricing records`
    });

  } catch (error) {
    console.error('Error checking pricing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check pricing' },
      { status: 500 }
    );
  }
}
