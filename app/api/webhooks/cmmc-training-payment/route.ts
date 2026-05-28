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
    const webhookSecret = process.env.STRIPE_CMMC_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_CMMC_WEBHOOK_SECRET not set');
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
      
      // Verify this is a CMMC training payment
      if (session.metadata?.type !== 'cmmc_training') {
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
        collection(db, 'cmmc_training_payments'),
        where('sessionId', '==', session.id)
      );
      const paymentSnapshot = await getDocs(paymentsQuery);

      if (!paymentSnapshot.empty) {
        const paymentDoc = paymentSnapshot.docs[0];
        await updateDoc(doc(db, 'cmmc_training_payments', paymentDoc.id), {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent,
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } else {
        // Create payment record if it doesn't exist
        await addDoc(collection(db, 'cmmc_training_payments'), {
          sessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          customerEmail: session.customer_email,
          customerName: session.metadata?.customer_name,
          memberId: session.metadata?.member_id,
          companyInfo: session.metadata?.company_info,
          trainingLevel: session.metadata?.training_level,
          amount: session.amount_total,
          currency: session.currency,
          status: 'completed',
          type: 'cmmc_training',
          createdAt: Timestamp.now(),
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // Add to CMMC training participants
      await addDoc(collection(db, 'cmmc_training_participants'), {
        customerEmail: session.customer_email,
        customerName: session.metadata?.customer_name,
        memberId: session.metadata?.member_id,
        companyInfo: session.metadata?.company_info,
        trainingLevel: session.metadata?.training_level,
        sessionId: session.id,
        paymentAmount: session.amount_total,
        currency: session.currency,
        enrolledAt: Timestamp.now(),
        status: 'enrolled',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Send email notifications
      const paymentAmount = session.amount_total / 100; // Convert to dollars
      const customerName = session.metadata?.customer_name || 'Training Participant';
      const customerEmail = session.customer_email;
      const trainingLevel = session.metadata?.training_level;

      // Send notification to Keith Moore
      await sendTemplatedEmail('cmmcTrainingPaymentNotification', 'kmoore@kdm-assoc.com', {
        customerName,
        customerEmail,
        trainingLevel,
        amount: paymentAmount,
        sessionId: session.id,
        paymentDate: new Date().toLocaleDateString(),
        companyInfo: session.metadata?.company_info || 'Not provided'
      });

      // Send notification to Nelinia
      await sendTemplatedEmail('cmmcTrainingPaymentNotification', 'nelinia@strategicvalueplus.com', {
        customerName,
        customerEmail,
        trainingLevel,
        amount: paymentAmount,
        sessionId: session.id,
        paymentDate: new Date().toLocaleDateString(),
        companyInfo: session.metadata?.company_info || 'Not provided'
      });

      // Send confirmation email to the customer
      await sendTemplatedEmail('cmmcTrainingConfirmation', customerEmail, {
        customerName,
        trainingLevel,
        amount: paymentAmount,
        paymentDate: new Date().toLocaleDateString(),
        companyInfo: session.metadata?.company_info || 'Not provided'
      });

      console.log(`CMMC training payment completed: ${customerName} (${customerEmail}) - ${trainingLevel} - $${paymentAmount}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing CMMC training payment webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
