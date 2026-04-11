import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';

interface PromotionalPriceRequest {
  id?: string;
  tierId: string;
  tierName: string;
  promotionalPrice: number;
  validFrom: string;
  validUntil: string;
  description: string;
  active: boolean;
}

/**
 * POST /api/admin/pricing/promotions
 * Create a new promotional price
 */
export async function POST(req: NextRequest) {
  try {
    const body: PromotionalPriceRequest = await req.json();

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Validate dates
    const validFrom = new Date(body.validFrom);
    const validUntil = new Date(body.validUntil);

    if (validFrom >= validUntil) {
      return NextResponse.json(
        { error: 'Valid from date must be before valid until date' },
        { status: 400 }
      );
    }

    const promosRef = collection(db, 'promotional_prices');
    const promoDoc = await addDoc(promosRef, {
      tierId: body.tierId,
      tierName: body.tierName,
      promotionalPrice: body.promotionalPrice,
      validFrom: Timestamp.fromDate(validFrom),
      validUntil: Timestamp.fromDate(validUntil),
      description: body.description,
      active: body.active,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      id: promoDoc.id,
      ...body,
    });
  } catch (error) {
    console.error('Error creating promotional price:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create promotional price' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/promotions
 * Update an existing promotional price
 */
export async function PUT(req: NextRequest) {
  try {
    const body: PromotionalPriceRequest = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Validate dates
    const validFrom = new Date(body.validFrom);
    const validUntil = new Date(body.validUntil);

    if (validFrom >= validUntil) {
      return NextResponse.json(
        { error: 'Valid from date must be before valid until date' },
        { status: 400 }
      );
    }

    const promoRef = doc(db, 'promotional_prices', body.id);
    await updateDoc(promoRef, {
      tierId: body.tierId,
      tierName: body.tierName,
      promotionalPrice: body.promotionalPrice,
      validFrom: Timestamp.fromDate(validFrom),
      validUntil: Timestamp.fromDate(validUntil),
      description: body.description,
      active: body.active,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      id: body.id,
      ...body,
    });
  } catch (error) {
    console.error('Error updating promotional price:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update promotional price' },
      { status: 500 }
    );
  }
}
