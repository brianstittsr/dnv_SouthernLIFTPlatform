import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';

/**
 * GET /api/admin/stripe-refunds
 * Fetch refund history and statistics
 */
export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit') || '50';
    const status = searchParams.get('status');

    // Get refunds from Stripe
    const refunds = await stripe.refunds.list({
      limit: parseInt(limitParam),
      ...(status && { status: status as any })
    });

    // Get refund records from Firestore for additional data
    let firestoreRefunds: any[] = [];
    if (db) {
      const refundsRef = collection(db, 'refund_records');
      const q = query(refundsRef, orderBy('createdAt', 'desc'), limit(parseInt(limitParam)));
      const snapshot = await getDocs(q);
      firestoreRefunds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // Calculate statistics
    const stats = {
      totalRefunds: refunds.data.length,
      totalAmount: refunds.data.reduce((sum, refund) => sum + refund.amount, 0),
      averageRefundAmount: refunds.data.length > 0 ? refunds.data.reduce((sum, refund) => sum + refund.amount, 0) / refunds.data.length : 0,
      recentRefunds: refunds.data.filter(r => Date.now() - r.created * 1000 < 7 * 24 * 60 * 60 * 1000).length, // Last 7 days
      statusBreakdown: refunds.data.reduce((acc, refund) => {
        acc[refund.status] = (acc[refund.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      refunds: refunds.data.map(refund => ({
        id: refund.id,
        object: refund.object,
        amount: refund.amount,
        currency: refund.currency,
        created: refund.created,
        status: refund.status,
        reason: refund.reason,
        charge: refund.charge,
        payment_intent: refund.payment_intent,
        balance_transaction: refund.balance_transaction,
        metadata: refund.metadata,
        receipt_number: refund.receipt_number
      })),
      firestoreRefunds,
      stats
    });

  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stripe-refunds
 * Create a new refund
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentIntentId, amount, reason = 'requested_by_customer', metadata = {} } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get the payment intent to verify it exists and get charge info
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent.charges.data.length) {
      return NextResponse.json(
        { error: 'No charges found for this payment intent' },
        { status: 400 }
      );
    }

    const chargeId = paymentIntent.charges.data[0].id;

    // Create the refund
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: amount ? parseInt(amount) * 100 : undefined, // Convert to cents if amount provided
      reason: reason as any,
      metadata: {
        ...metadata,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        paymentIntentId
      }
    });

    // Record the refund in Firestore
    if (db) {
      const refundsRef = collection(db, 'refund_records');
      await addDoc(refundsRef, {
        stripeRefundId: refund.id,
        paymentIntentId,
        chargeId,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
        status: refund.status,
        metadata: refund.metadata,
        createdAt: Timestamp.now(),
        createdBy: 'admin'
      });
    }

    return NextResponse.json({
      refund: {
        id: refund.id,
        object: refund.object,
        amount: refund.amount,
        currency: refund.currency,
        created: refund.created,
        status: refund.status,
        reason: refund.reason,
        charge: refund.charge,
        payment_intent: refund.payment_intent,
        metadata: refund.metadata
      }
    });

  } catch (error) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create refund' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/stripe-refunds
 * Update refund metadata (limited functionality as Stripe refunds are mostly immutable)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { refundId, metadata } = body;

    if (!refundId) {
      return NextResponse.json(
        { error: 'Refund ID is required' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Note: Stripe refunds are mostly immutable after creation
    // We can only update metadata in some cases
    const refund = await stripe.refunds.retrieve(refundId);

    // Update Firestore record if it exists
    if (db && metadata) {
      const refundsRef = collection(db, 'refund_records');
      const q = query(refundsRef, where('stripeRefundId', '==', refundId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          metadata: { ...snapshot.docs[0].data().metadata, ...metadata },
          updatedAt: Timestamp.now()
        });
      }
    }

    return NextResponse.json({
      refund: {
        id: refund.id,
        metadata: refund.metadata
      },
      message: 'Refund metadata updated successfully'
    });

  } catch (error) {
    console.error('Error updating refund:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update refund' },
      { status: 500 }
    );
  }
}
