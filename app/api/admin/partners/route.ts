import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
  PARTNER_COLLECTIONS,
  CONSORTIUM_PARTNERS,
  DEFAULT_ATTRIBUTION_PERCENTAGES,
  type PartnerProfileDoc,
  type ConsortiumPartnerId,
} from '@/lib/partner-commission-schema';

/**
 * GET /api/admin/partners
 * List all partner profiles
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      console.log('Database not initialized, returning empty partners array');
      return NextResponse.json({ partners: [] });
    }

    const partnersRef = db.collection(PARTNER_COLLECTIONS.PARTNER_PROFILES);
    const snapshot = await partnersRef.get();

    const partners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PartnerProfileDoc));

    return NextResponse.json({ partners });
  } catch (error: any) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ partners: [], error: error.message });
  }
}

/**
 * POST /api/admin/partners
 * Create a new partner profile
 */
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      console.error('POST /api/admin/partners: Database not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('POST /api/admin/partners: Failed to parse request body', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    console.log('POST /api/admin/partners: Creating partner with data:', body);
    const {
      partnerId,
      contactName,
      contactEmail,
      contactPhone,
      paymentMethod = 'manual',
      autoPayoutEnabled = false,
      minimumPayoutAmount = 100,
      holdPeriodDays = 7,
    } = body;

    if (!partnerId || !CONSORTIUM_PARTNERS[partnerId as ConsortiumPartnerId]) {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    if (!contactName || !contactEmail) {
      return NextResponse.json(
        { error: 'Contact name and email are required' },
        { status: 400 }
      );
    }

    const partnerInfo = CONSORTIUM_PARTNERS[partnerId as ConsortiumPartnerId];

    const newPartner = {
      partnerId: partnerId as ConsortiumPartnerId,
      name: partnerInfo.name,
      displayName: partnerInfo.displayName,
      contactName,
      contactEmail,
      contactPhone,
      paymentMethod,
      autoPayoutEnabled,
      minimumPayoutAmount,
      payoutFrequency: 'weekly',
      holdPeriodDays,
      attributionRules: [
        { contributionType: 'lead_generation', percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.lead_generation, isActive: true },
        { contributionType: 'service_delivery', percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery, isActive: true },
        { contributionType: 'introduction', percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.introduction, isActive: true },
      ],
      stats: {
        totalEarnings: 0,
        pendingCommissions: 0,
        paidCommissions: 0,
        totalTransactions: 0,
      },
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(PARTNER_COLLECTIONS.PARTNER_PROFILES).add(newPartner);

    return NextResponse.json({ 
      success: true, 
      partnerId: docRef.id,
      partner: { id: docRef.id, ...newPartner }
    });
  } catch (error: any) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create partner' },
      { status: 500 }
    );
  }
}
