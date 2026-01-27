import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { COLLECTIONS } from '@/lib/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface TransactionResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description: string | null;
  customerEmail: string | null;
  customerName: string | null;
  created: number;
  metadata: Record<string, string>;
  source: 'stripe' | 'firestore';
  stripePaymentIntentId?: string;
  entityType?: string;
  entityName?: string;
}

/**
 * GET /api/admin/transactions
 * Fetch transactions from Stripe and/or Firestore
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'both'; // 'stripe', 'firestore', or 'both'
    const limit = parseInt(searchParams.get('limit') || '50');
    const startingAfter = searchParams.get('starting_after') || undefined;
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    const transactions: TransactionResponse[] = [];
    let hasMore = false;
    let stripeError: string | null = null;
    let firestoreError: string | null = null;

    // Fetch from Stripe
    if (source === 'stripe' || source === 'both') {
      try {
        if (!process.env.STRIPE_SECRET_KEY) {
          stripeError = 'Stripe API key not configured';
        } else {
          // Fetch PaymentIntents from Stripe
          const paymentIntents = await stripe.paymentIntents.list({
            limit,
            starting_after: startingAfter,
          });

          hasMore = paymentIntents.has_more;

          for (const pi of paymentIntents.data) {
            // Filter by status if specified
            if (status && pi.status !== status) continue;

            // Get customer details if available
            let customerEmail: string | null = null;
            let customerName: string | null = null;
            
            if (pi.customer) {
              try {
                const customer = await stripe.customers.retrieve(pi.customer as string);
                if (customer && !customer.deleted) {
                  customerEmail = (customer as Stripe.Customer).email || null;
                  customerName = (customer as Stripe.Customer).name || null;
                }
              } catch {
                // Customer retrieval failed, continue without customer info
              }
            }

            // Also check receipt_email
            if (!customerEmail && pi.receipt_email) {
              customerEmail = pi.receipt_email;
            }

            transactions.push({
              id: pi.id,
              amount: pi.amount / 100, // Convert from cents
              currency: pi.currency.toUpperCase(),
              status: pi.status,
              type: pi.metadata?.type || 'payment',
              description: pi.description,
              customerEmail,
              customerName,
              created: pi.created,
              metadata: pi.metadata || {},
              source: 'stripe',
              stripePaymentIntentId: pi.id,
              entityType: pi.metadata?.entityType,
              entityName: pi.metadata?.entityName,
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching from Stripe:', error);
        stripeError = error.message;
      }
    }

    // Fetch from Firestore
    if ((source === 'firestore' || source === 'both') && db) {
      try {
        let query = db.collection(COLLECTIONS.TRANSACTIONS)
          .orderBy('createdAt', 'desc')
          .limit(limit);

        if (status) {
          query = query.where('status', '==', status);
        }
        if (type) {
          query = query.where('type', '==', type);
        }

        const snapshot = await query.get();

        for (const doc of snapshot.docs) {
          const data = doc.data();
          
          // Avoid duplicates if we already have this from Stripe
          if (transactions.some(t => t.stripePaymentIntentId === data.stripePaymentIntentId)) {
            continue;
          }

          transactions.push({
            id: doc.id,
            amount: data.amount,
            currency: data.currency || 'USD',
            status: data.status,
            type: data.type,
            description: data.entityName || data.type,
            customerEmail: data.userEmail,
            customerName: data.userName,
            created: data.createdAt?._seconds || Math.floor(Date.now() / 1000),
            metadata: data.metadata || {},
            source: 'firestore',
            stripePaymentIntentId: data.stripePaymentIntentId,
            entityType: data.entityType,
            entityName: data.entityName,
          });
        }
      } catch (error: any) {
        console.error('Error fetching from Firestore:', error);
        firestoreError = error.message;
      }
    }

    // Sort by created date descending
    transactions.sort((a, b) => b.created - a.created);

    // Calculate summary
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: transactions
        .filter(t => t.status === 'succeeded')
        .reduce((sum, t) => sum + t.amount, 0),
      pendingAmount: transactions
        .filter(t => t.status === 'requires_payment_method' || t.status === 'requires_confirmation' || t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
      failedCount: transactions.filter(t => t.status === 'canceled' || t.status === 'failed').length,
      succeededCount: transactions.filter(t => t.status === 'succeeded').length,
    };

    return NextResponse.json({
      transactions: transactions.slice(0, limit),
      summary,
      hasMore,
      errors: {
        stripe: stripeError,
        firestore: firestoreError,
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions', transactions: [], summary: {} },
      { status: 500 }
    );
  }
}
