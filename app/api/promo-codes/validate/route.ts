/**
 * Promo Code Validation API Route
 * 
 * Validates a promo code for use at checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

/**
 * GET /api/promo-codes/validate
 * Validate a promo code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const eventId = searchParams.get('eventId');
    const amount = searchParams.get('amount'); // Original price in cents

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Promo code is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { valid: false, message: 'Database not initialized' },
        { status: 500 }
      );
    }

    const promoCodesRef = collection(db, COLLECTIONS.PROMO_CODES);
    const q = query(
      promoCodesRef,
      where('code', '==', code.toUpperCase()),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid promo code'
      });
    }

    const promoData = snapshot.docs[0].data();
    const now = Timestamp.now();

    // Check validity period
    if (promoData.validFrom > now) {
      return NextResponse.json({
        valid: false,
        message: 'Promo code is not yet active'
      });
    }

    if (promoData.validUntil < now) {
      return NextResponse.json({
        valid: false,
        message: 'Promo code has expired'
      });
    }

    // Check usage limit
    if (promoData.maxUses && promoData.usedCount >= promoData.maxUses) {
      return NextResponse.json({
        valid: false,
        message: 'Promo code has reached its usage limit'
      });
    }

    // Check applicability
    if (promoData.applicableTo === 'events' && !eventId) {
      return NextResponse.json({
        valid: false,
        message: 'This promo code is only valid for events'
      });
    }

    if (promoData.applicableTo === 'memberships' && eventId) {
      return NextResponse.json({
        valid: false,
        message: 'This promo code is only valid for memberships'
      });
    }

    // Check event-specific codes
    if (promoData.eventIds && promoData.eventIds.length > 0 && eventId) {
      if (!promoData.eventIds.includes(eventId)) {
        return NextResponse.json({
          valid: false,
          message: 'This promo code is not valid for this event'
        });
      }
    }

    // Calculate discount
    let discount = 0;
    const originalAmount = amount ? parseInt(amount) : 0;

    if (promoData.discountType === 'percentage') {
      discount = Math.round(originalAmount * (promoData.discountValue / 100));
    } else {
      discount = promoData.discountValue;
    }

    // Ensure discount doesn't exceed original amount
    discount = Math.min(discount, originalAmount);

    return NextResponse.json({
      valid: true,
      code: promoData.code,
      discountType: promoData.discountType,
      discountValue: promoData.discountValue,
      discount,
      finalAmount: originalAmount - discount,
      message: `Promo code applied! ${promoData.discountType === 'percentage' 
        ? `${promoData.discountValue}% off` 
        : `$${(promoData.discountValue / 100).toFixed(2)} off`}`
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, message: error.message || 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
