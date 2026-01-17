/**
 * PayPal Payment API Route
 * Handles order creation and capture
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createOrder, 
  captureOrder, 
  getOrder,
  refundCapture,
  getApprovalUrl,
  isPayPalConfigured,
} from '@/lib/payments/paypal';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create-order': {
        const { 
          eventId, 
          eventName, 
          items, 
          registrationId,
        } = body;

        if (!eventId || !items || items.length === 0) {
          return NextResponse.json({ error: 'eventId and items are required' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const order = await createOrder({
          eventId,
          eventName: eventName || 'Event Registration',
          items: items.map((item: any) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity || 1,
          })),
          returnUrl: `${baseUrl}/events/${eventId}/register/success?paypal=true&registrationId=${registrationId || ''}`,
          cancelUrl: `${baseUrl}/events/${eventId}/register?cancelled=true`,
          customId: registrationId,
        });

        if (!order) {
          return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
        }

        const approvalUrl = getApprovalUrl(order);

        return NextResponse.json({ 
          orderId: order.id,
          approvalUrl,
          status: order.status,
        });
      }

      case 'capture-order': {
        const { orderId, registrationId } = body;
        
        if (!orderId) {
          return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const capturedOrder = await captureOrder(orderId);
        
        if (!capturedOrder) {
          return NextResponse.json({ error: 'Failed to capture order' }, { status: 500 });
        }

        // Update registration if payment successful
        if (capturedOrder.status === 'COMPLETED' && registrationId && db) {
          const capture = capturedOrder.purchase_units?.[0]?.payments?.captures?.[0];
          
          try {
            await updateDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, registrationId), {
              paymentStatus: 'paid',
              paymentMethod: 'paypal',
              paypalOrderId: orderId,
              paypalCaptureId: capture?.id,
              paidAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          } catch (error) {
            console.error('Error updating registration:', error);
          }
        }

        return NextResponse.json({
          orderId: capturedOrder.id,
          status: capturedOrder.status,
          payer: capturedOrder.payer,
        });
      }

      case 'get-order': {
        const { orderId } = body;
        
        if (!orderId) {
          return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const order = await getOrder(orderId);
        
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
          orderId: order.id,
          status: order.status,
          payer: order.payer,
          purchaseUnits: order.purchase_units,
        });
      }

      case 'refund': {
        const { captureId, amount, currency } = body;
        
        if (!captureId) {
          return NextResponse.json({ error: 'captureId is required' }, { status: 400 });
        }

        const refund = await refundCapture(captureId, amount, currency);

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
    console.error('PayPal API error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Webhook handler for PayPal events
export async function PUT(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    // In production, verify webhook signature
    // const isValid = await verifyWebhookSignature(webhookId, headers, body);

    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        const orderId = event.resource?.id;
        if (orderId) {
          // Auto-capture the order
          await captureOrder(orderId);
        }
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        const capture = event.resource;
        console.log('Payment captured:', capture?.id);
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const refund = event.resource;
        console.log('Payment refunded:', refund?.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
