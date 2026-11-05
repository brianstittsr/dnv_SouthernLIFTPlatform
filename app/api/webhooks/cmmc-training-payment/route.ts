import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendTemplatedEmail } from '@/lib/email';
import { headers } from 'next/headers';

/**
 * POST /api/webhooks/cmmc-training-payment
 * Records completed CMMC training purchases. Uses the Firebase Admin SDK —
 * the previous client-SDK writes were all denied by Firestore rules, so
 * payments and participants were never recorded.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No Stripe signature' }, { status: 400 });
    }

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_CMMC_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_CMMC_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      if (session.metadata?.type !== 'cmmc_training') {
        return NextResponse.json({ received: true });
      }

      if (!db) {
        console.error('Database not initialized');
        return NextResponse.json({ error: 'Database not available' }, { status: 500 });
      }

      // Update or create the payment record
      const paymentSnapshot = await db
        .collection('cmmc_training_payments')
        .where('sessionId', '==', session.id)
        .limit(1)
        .get();

      const paymentData = {
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
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (!paymentSnapshot.empty) {
        await paymentSnapshot.docs[0].ref.update(paymentData);
      } else {
        await db.collection('cmmc_training_payments').add({ ...paymentData, createdAt: Timestamp.now() });
      }

      // Record the participant (idempotent by session id)
      const participantSnapshot = await db
        .collection('cmmc_training_participants')
        .where('sessionId', '==', session.id)
        .limit(1)
        .get();

      if (participantSnapshot.empty) {
        await db.collection('cmmc_training_participants').add({
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
      }

      const paymentAmount = session.amount_total / 100;
      const customerName = session.metadata?.customer_name || 'Training Participant';
      const customerEmail = session.customer_email;
      const trainingLevel = session.metadata?.training_level;
      const templateVars = {
        customerName,
        customerEmail,
        trainingLevel,
        amount: paymentAmount,
        sessionId: session.id,
        paymentDate: new Date().toLocaleDateString(),
        companyInfo: session.metadata?.company_info || 'Not provided',
      };

      await sendTemplatedEmail('cmmcTrainingPaymentNotification', 'kmoore@kdm-assoc.com', templateVars);
      await sendTemplatedEmail('cmmcTrainingPaymentNotification', 'nelinia@strategicvalueplus.com', templateVars);
      await sendTemplatedEmail('cmmcTrainingConfirmation', customerEmail, templateVars);

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
