/**
 * Stripe Webhooks API Route
 * 
 * Handles all Stripe webhook events for memberships, payments, and subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';
import { verifyWebhookSignature } from '@/lib/stripe';
import { sendTemplatedEmail } from '@/lib/email';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhooks
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  if (!db) return;

  const customerId = subscription.customer as string;
  
  // Find membership by customer ID
  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const q = query(membershipsRef, where('stripeCustomerId', '==', customerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.error('No membership found for customer:', customerId);
    return;
  }

  const membershipDoc = snapshot.docs[0];
  const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipDoc.id);

  await updateDoc(membershipRef, {
    stripeSubscriptionId: subscription.id,
    status: subscription.status === 'trialing' ? 'trialing' : 'active',
    currentPeriodStart: Timestamp.fromMillis((subscription as any).current_period_start * 1000),
    currentPeriodEnd: Timestamp.fromMillis((subscription as any).current_period_end * 1000),
    updatedAt: Timestamp.now(),
  });

  console.log('Subscription created for membership:', membershipDoc.id);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!db) return;

  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const q = query(membershipsRef, where('stripeSubscriptionId', '==', subscription.id));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.error('No membership found for subscription:', subscription.id);
    return;
  }

  const membershipDoc = snapshot.docs[0];
  const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipDoc.id);

  // Map Stripe status to our status
  let status: 'active' | 'past_due' | 'cancelled' | 'trialing' = 'active';
  if (subscription.status === 'trialing') status = 'trialing';
  else if (subscription.status === 'past_due') status = 'past_due';
  else if (subscription.status === 'canceled' || subscription.status === 'unpaid') status = 'cancelled';

  await updateDoc(membershipRef, {
    status,
    currentPeriodStart: Timestamp.fromMillis((subscription as any).current_period_start * 1000),
    currentPeriodEnd: Timestamp.fromMillis((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: Timestamp.now(),
  });

  console.log('Subscription updated for membership:', membershipDoc.id);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  if (!db) return;

  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const q = query(membershipsRef, where('stripeSubscriptionId', '==', subscription.id));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.error('No membership found for subscription:', subscription.id);
    return;
  }

  const membershipDoc = snapshot.docs[0];
  const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipDoc.id);

  await updateDoc(membershipRef, {
    status: 'cancelled',
    cancelAtPeriodEnd: false,
    updatedAt: Timestamp.now(),
  });

  console.log('Subscription cancelled for membership:', membershipDoc.id);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!db) return;

  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string;

  // Find membership
  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const q = query(membershipsRef, where('stripeCustomerId', '==', customerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const membershipDoc = snapshot.docs[0];
  const membershipData = membershipDoc.data();

  // Send payment confirmation email
  if (invoice.customer_email && membershipData.userId) {
    try {
      // Get user name from users collection
      const userRef = doc(db, COLLECTIONS.USERS, membershipData.userId);
      const userSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), where('id', '==', membershipData.userId)));
      const userName = userSnap.docs[0]?.data()?.name || 'Member';

      await sendTemplatedEmail('paymentConfirmation', invoice.customer_email, {
        name: userName,
        amount: invoice.amount_paid,
        description: `KDM Consortium Membership - ${membershipData.tier}`,
        receiptUrl: invoice.hosted_invoice_url || undefined,
      });
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
    }
  }

  console.log('Payment succeeded for invoice:', invoice.id);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!db) return;

  const customerId = invoice.customer as string;

  // Find and update membership status
  const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
  const q = query(membershipsRef, where('stripeCustomerId', '==', customerId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const membershipDoc = snapshot.docs[0];
  const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipDoc.id);

  await updateDoc(membershipRef, {
    status: 'past_due',
    updatedAt: Timestamp.now(),
  });

  console.log('Payment failed for customer:', customerId);
}

/**
 * Handle successful payment intent (for one-time payments like tickets)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (!db) return;

  const metadata = paymentIntent.metadata;

  // Check if this is a ticket purchase
  if (metadata.eventId && metadata.ticketType) {
    // Update ticket status
    const ticketsRef = collection(db, COLLECTIONS.TICKETS);
    const q = query(ticketsRef, where('stripePaymentIntentId', '==', paymentIntent.id));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const ticketDoc = snapshot.docs[0];
      const ticketRef = doc(db, COLLECTIONS.TICKETS, ticketDoc.id);

      await updateDoc(ticketRef, {
        status: 'paid',
        updatedAt: Timestamp.now(),
      });

      console.log('Ticket payment succeeded:', ticketDoc.id);
    }
  }
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!db) return;

  const paymentIntentId = charge.payment_intent as string;

  // Check if this is a ticket refund
  const ticketsRef = collection(db, COLLECTIONS.TICKETS);
  const q = query(ticketsRef, where('stripePaymentIntentId', '==', paymentIntentId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const ticketDoc = snapshot.docs[0];
    const ticketRef = doc(db, COLLECTIONS.TICKETS, ticketDoc.id);

    await updateDoc(ticketRef, {
      status: 'refunded',
      updatedAt: Timestamp.now(),
    });

    console.log('Ticket refunded:', ticketDoc.id);
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!db) return;

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (session.mode === 'subscription' && subscriptionId) {
    // Update membership with subscription ID
    const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
    const q = query(membershipsRef, where('stripeCustomerId', '==', customerId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const membershipDoc = snapshot.docs[0];
      const membershipRef = doc(db, COLLECTIONS.MEMBERSHIPS, membershipDoc.id);
      const membershipData = membershipDoc.data();

      await updateDoc(membershipRef, {
        stripeSubscriptionId: subscriptionId,
        status: 'active',
        updatedAt: Timestamp.now(),
      });

      // Send welcome email
      if (session.customer_email) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
          await sendTemplatedEmail('welcome', session.customer_email, {
            name: session.customer_details?.name || 'Member',
            loginUrl: `${baseUrl}/portal`,
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }

      console.log('Checkout completed for membership:', membershipDoc.id);
    }
  }
}

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
