/**
 * Stripe Payment API Route
 * Handles checkout sessions and payment operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createCheckoutSession, 
  retrieveCheckoutSession,
  createRefund,
  formatAmountForStripe,
} from '@/lib/payments/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create-checkout': {
        const { 
          eventId, 
          eventName, 
          items, 
          customerEmail, 
          registrationId,
          ticketTypeId,
          quantity,
        } = body;

        if (!eventId || !items || items.length === 0) {
          return NextResponse.json({ error: 'eventId and items are required' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const session = await createCheckoutSession({
          eventId,
          eventName: eventName || 'Event Registration',
          items: items.map((item: any) => ({
            name: item.name,
            description: item.description,
            price: formatAmountForStripe(item.price),
            quantity: item.quantity || 1,
            metadata: {
              ticketTypeId: item.ticketTypeId || '',
              eventId,
            },
          })),
          customerEmail,
          successUrl: `${baseUrl}/events/${eventId}/register/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/events/${eventId}/register?cancelled=true`,
          metadata: {
            registrationId: registrationId || '',
            ticketTypeId: ticketTypeId || '',
            quantity: quantity?.toString() || '1',
          },
        });

        if (!session) {
          return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
        }

        return NextResponse.json({ 
          sessionId: session.id, 
          url: session.url,
        });
      }

      case 'verify-session': {
        const { sessionId } = body;
        
        if (!sessionId) {
          return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
        }

        const session = await retrieveCheckoutSession(sessionId);
        
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // If payment successful, update registration
        if (session.payment_status === 'paid' && session.metadata?.registrationId && db) {
          try {
            await updateDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, session.metadata.registrationId), {
              paymentStatus: 'paid',
              paymentMethod: 'stripe',
              stripeSessionId: session.id,
              stripePaymentIntentId: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id,
              paidAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          } catch (error) {
            console.error('Error updating registration:', error);
          }
        }

        return NextResponse.json({
          status: session.payment_status,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
          metadata: session.metadata,
        });
      }

      case 'refund': {
        const { paymentIntentId, amount, reason } = body;
        
        if (!paymentIntentId) {
          return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 });
        }

        const refund = await createRefund(
          paymentIntentId, 
          amount ? formatAmountForStripe(amount) : undefined,
          reason
        );

        if (!refund) {
          return NextResponse.json({ error: 'Failed to create refund' }, { status: 500 });
        }

        return NextResponse.json({ 
          refundId: refund.id,
          status: refund.status,
          amount: refund.amount,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Webhook handler for Stripe events
export async function PUT(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // In production, verify webhook signature
    // const event = constructWebhookEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    
    const event = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        if (session.metadata?.registrationId && db) {
          await updateDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, session.metadata.registrationId), {
            paymentStatus: 'paid',
            paymentMethod: 'stripe',
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            paidAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Charge refunded:', charge.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
