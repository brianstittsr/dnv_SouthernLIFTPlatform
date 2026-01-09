/**
 * Promo Codes API Route
 * 
 * Handles CRUD operations for promotional codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS, PromoCodeDoc } from '@/lib/schema';

/**
 * GET /api/promo-codes
 * Retrieve promo codes with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const applicableTo = searchParams.get('applicableTo');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const promoCodesRef = collection(db, COLLECTIONS.PROMO_CODES);
    let constraints: any[] = [];

    if (isActive === 'true') {
      constraints.push(where('isActive', '==', true));
    }

    if (applicableTo) {
      constraints.push(where('applicableTo', '==', applicableTo));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(promoCodesRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const promoCodes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ promoCodes });
  } catch (error: any) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promo-codes
 * Create a new promo code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      validFrom,
      validUntil,
      applicableTo = 'all',
      eventIds
    } = body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'code, discountType, discountValue, validFrom, and validUntil are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Check if code already exists
    const promoCodesRef = collection(db, COLLECTIONS.PROMO_CODES);
    const existingQuery = query(promoCodesRef, where('code', '==', code.toUpperCase()));
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    const promoCodeData: Omit<PromoCodeDoc, 'id'> = {
      code: code.toUpperCase(),
      description: description || '',
      discountType,
      discountValue,
      maxUses,
      usedCount: 0,
      validFrom: Timestamp.fromDate(new Date(validFrom)),
      validUntil: Timestamp.fromDate(new Date(validUntil)),
      applicableTo,
      eventIds,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(promoCodesRef, promoCodeData);

    return NextResponse.json({
      promoCodeId: docRef.id,
      code: code.toUpperCase(),
      message: 'Promo code created successfully'
    });
  } catch (error: any) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create promo code' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/promo-codes
 * Update a promo code
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { promoCodeId, ...updates } = body;

    if (!promoCodeId) {
      return NextResponse.json(
        { error: 'promoCodeId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const promoCodeRef = doc(db, COLLECTIONS.PROMO_CODES, promoCodeId);
    const promoCodeSnap = await getDoc(promoCodeRef);

    if (!promoCodeSnap.exists()) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Convert date strings to Timestamps
    const processedUpdates: any = { ...updates };
    if (updates.validFrom) {
      processedUpdates.validFrom = Timestamp.fromDate(new Date(updates.validFrom));
    }
    if (updates.validUntil) {
      processedUpdates.validUntil = Timestamp.fromDate(new Date(updates.validUntil));
    }
    if (updates.code) {
      processedUpdates.code = updates.code.toUpperCase();
    }

    await updateDoc(promoCodeRef, {
      ...processedUpdates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      promoCodeId 
    });
  } catch (error: any) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/promo-codes
 * Delete a promo code
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promoCodeId = searchParams.get('promoCodeId');

    if (!promoCodeId) {
      return NextResponse.json(
        { error: 'promoCodeId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const promoCodeRef = doc(db, COLLECTIONS.PROMO_CODES, promoCodeId);
    const promoCodeSnap = await getDoc(promoCodeRef);

    if (!promoCodeSnap.exists()) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    await deleteDoc(promoCodeRef);

    return NextResponse.json({ 
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
