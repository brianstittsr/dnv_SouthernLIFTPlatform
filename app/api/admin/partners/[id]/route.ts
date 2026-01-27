import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
  PARTNER_COLLECTIONS,
  type PartnerProfileDoc,
} from '@/lib/partner-commission-schema';

/**
 * GET /api/admin/partners/[id]
 * Get a single partner profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const docRef = db.collection(PARTNER_COLLECTIONS.PARTNER_PROFILES).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      partner: { id: doc.id, ...doc.data() } as PartnerProfileDoc 
    });
  } catch (error: any) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/partners/[id]
 * Update a partner profile
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const {
      contactName,
      contactEmail,
      contactPhone,
      paymentMethod,
      stripeConnectAccountId,
      paypalEmail,
      autoPayoutEnabled,
      minimumPayoutAmount,
      payoutFrequency,
      holdPeriodDays,
      attributionRules,
      isActive,
    } = body;

    const docRef = db.collection(PARTNER_COLLECTIONS.PARTNER_PROFILES).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Only update fields that are provided
    if (contactName !== undefined) updateData.contactName = contactName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (stripeConnectAccountId !== undefined) updateData.stripeConnectAccountId = stripeConnectAccountId;
    if (paypalEmail !== undefined) updateData.paypalEmail = paypalEmail;
    if (autoPayoutEnabled !== undefined) updateData.autoPayoutEnabled = autoPayoutEnabled;
    if (minimumPayoutAmount !== undefined) updateData.minimumPayoutAmount = minimumPayoutAmount;
    if (payoutFrequency !== undefined) updateData.payoutFrequency = payoutFrequency;
    if (holdPeriodDays !== undefined) updateData.holdPeriodDays = holdPeriodDays;
    if (attributionRules !== undefined) updateData.attributionRules = attributionRules;
    if (isActive !== undefined) updateData.isActive = isActive;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();

    return NextResponse.json({ 
      success: true,
      partner: { id: updatedDoc.id, ...updatedDoc.data() } as PartnerProfileDoc 
    });
  } catch (error: any) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update partner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/partners/[id]
 * Delete a partner profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const docRef = db.collection(PARTNER_COLLECTIONS.PARTNER_PROFILES).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
