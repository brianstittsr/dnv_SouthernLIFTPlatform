import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { sendTemplatedEmail } from '@/lib/email';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No Stripe signature' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_FOUNDERS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_FOUNDERS_WEBHOOK_SECRET not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Verify this is a Founders membership payment
      if (session.metadata?.type !== 'founders_membership') {
        return NextResponse.json({ received: true });
      }

      if (!db) {
        console.error('Database not initialized');
        return NextResponse.json(
          { error: 'Database not available' },
          { status: 500 }
        );
      }

      // Update payment record in Firestore
      const paymentsQuery = query(
        collection(db, 'founders_payments'),
        where('sessionId', '==', session.id)
      );
      const paymentSnapshot = await getDocs(paymentsQuery);

      if (!paymentSnapshot.empty) {
        const paymentDoc = paymentSnapshot.docs[0];
        await updateDoc(doc(db, 'founders_payments', paymentDoc.id), {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent,
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } else {
        // Create payment record if it doesn't exist
        await addDoc(collection(db, 'founders_payments'), {
          sessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          customerEmail: session.customer_email,
          customerName: session.metadata?.customer_name,
          memberId: session.metadata?.member_id,
          amount: session.amount_total,
          currency: session.currency,
          status: 'completed',
          type: 'founders_membership',
          createdAt: Timestamp.now(),
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Add member to Founders collection
      await addDoc(collection(db, 'founders_members'), {
        customerEmail: session.customer_email,
        customerName: session.metadata?.customer_name,
        memberId: session.metadata?.member_id,
        sessionId: session.id,
        paymentAmount: session.amount_total,
        currency: session.currency,
        joinedAt: Timestamp.now(),
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Send email notifications
      const paymentAmount = session.amount_total / 100; // Convert to dollars
      const customerName = session.metadata?.customer_name || 'Founders Member';
      const customerEmail = session.customer_email;

      // Send notification to Keith Moore
      await sendTemplatedEmail('foundersPaymentNotification', 'kmoore@kdm-assoc.com', {
        customerName,
        customerEmail,
        amount: paymentAmount,
        sessionId: session.id,
        paymentDate: new Date().toLocaleDateString(),
        type: 'Founders Membership'
      });

      // Send notification to Nelinia
      await sendTemplatedEmail('foundersPaymentNotification', 'nelinia@strategicvalueplus.com', {
        customerName,
        customerEmail,
        amount: paymentAmount,
        sessionId: session.id,
        paymentDate: new Date().toLocaleDateString(),
        type: 'Founders Membership'
      });

      // Send confirmation email to the customer
      await sendTemplatedEmail('foundersPaymentConfirmation', customerEmail, {
        customerName,
        amount: paymentAmount,
        paymentDate: new Date().toLocaleDateString(),
        type: 'Founders Membership'
      });

      console.log(`Founders membership payment completed: ${customerName} (${customerEmail}) - $${paymentAmount}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Founders payment webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
