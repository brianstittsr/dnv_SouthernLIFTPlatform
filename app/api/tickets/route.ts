/**
 * Tickets API Route
 * 
 * Handles event ticket purchases, retrieval, and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS, TicketDoc } from '@/lib/schema';
import { createTicketCheckoutSession } from '@/lib/stripe';
import { sendTemplatedEmail } from '@/lib/email';

/**
 * Generate a unique ticket ID using timestamp and random string
 */
function generateTicketId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TKT-${timestamp}-${random}`.toUpperCase();
}

/**
 * GET /api/tickets
 * Retrieve tickets - filter by userId or eventId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const ticketsRef = collection(db, COLLECTIONS.TICKETS);
    let q;

    if (userId && eventId) {
      q = query(
        ticketsRef,
        where('userId', '==', userId),
        where('eventId', '==', eventId)
      );
    } else if (userId) {
      q = query(
        ticketsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (eventId) {
      q = query(
        ticketsRef, 
        where('eventId', '==', eventId),
        orderBy('createdAt', 'desc')
      );
    } else if (status) {
      q = query(ticketsRef, where('status', '==', status));
    } else {
      q = query(ticketsRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Create a new ticket purchase (initiates Stripe checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventId,
      userId,
      userName,
      userEmail,
      ticketType,
      price,
      quantity = 1,
      promoCode,
      attendeeInfo,
      successUrl,
      cancelUrl 
    } = body;

    if (!eventId || !userEmail || !ticketType || price === undefined) {
      return NextResponse.json(
        { error: 'eventId, userEmail, ticketType, and price are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Verify event exists and has capacity
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = eventSnap.data();
    
    if (eventData.status !== 'published') {
      return NextResponse.json(
        { error: 'Event is not available for registration' },
        { status: 400 }
      );
    }

    if (eventData.maxAttendees && eventData.currentAttendees >= eventData.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is sold out' },
        { status: 400 }
      );
    }

    // Validate promo code if provided
    let discount = 0;
    if (promoCode) {
      const promoCodesRef = collection(db, COLLECTIONS.PROMO_CODES);
      const promoQuery = query(
        promoCodesRef,
        where('code', '==', promoCode.toUpperCase()),
        where('isActive', '==', true)
      );
      const promoSnapshot = await getDocs(promoQuery);

      if (!promoSnapshot.empty) {
        const promoData = promoSnapshot.docs[0].data();
        const now = Timestamp.now();

        // Check validity
        if (promoData.validFrom <= now && promoData.validUntil >= now) {
          if (!promoData.maxUses || promoData.usedCount < promoData.maxUses) {
            // Check if applicable to this event
            if (promoData.applicableTo === 'all' || 
                promoData.applicableTo === 'events' ||
                (promoData.eventIds && promoData.eventIds.includes(eventId))) {
              
              if (promoData.discountType === 'percentage') {
                discount = Math.round(price * (promoData.discountValue / 100));
              } else {
                discount = promoData.discountValue;
              }

              // Update promo code usage
              const promoRef = doc(db, COLLECTIONS.PROMO_CODES, promoSnapshot.docs[0].id);
              await updateDoc(promoRef, {
                usedCount: promoData.usedCount + 1,
              });
            }
          }
        }
      }
    }

    const finalPrice = Math.max(0, price - discount);
    const ticketId = generateTicketId();

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
    const session = await createTicketCheckoutSession({
      customerEmail: userEmail,
      eventId,
      ticketType,
      price: finalPrice,
      quantity,
      successUrl: successUrl || `${baseUrl}/events/${eventId}/confirmation?ticket_id=${ticketId}`,
      cancelUrl: cancelUrl || `${baseUrl}/events/${eventId}`,
      promoCode: promoCode?.toUpperCase(),
    });

    // Create pending ticket record
    const ticketData: Omit<TicketDoc, 'id'> = {
      eventId,
      userId: userId || '',
      userName: userName || '',
      userEmail,
      ticketType,
      price: finalPrice,
      status: 'pending',
      stripePaymentIntentId: '', // Will be set after payment
      qrCode: ticketId, // Use ticket ID as QR code data
      checkedIn: false,
      promoCode: promoCode?.toUpperCase(),
      discount,
      attendeeInfo,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const ticketsRef = collection(db, COLLECTIONS.TICKETS);
    const docRef = await addDoc(ticketsRef, ticketData);

    return NextResponse.json({
      ticketId: docRef.id,
      ticketCode: ticketId,
      checkoutUrl: session.url,
      finalPrice,
      discount,
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tickets
 * Update ticket (check-in, cancel, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, action, checkedInBy } = body;

    if (!ticketId || !action) {
      return NextResponse.json(
        { error: 'ticketId and action are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const ticketRef = doc(db, COLLECTIONS.TICKETS, ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticketData = ticketSnap.data();

    switch (action) {
      case 'check-in':
        if (ticketData.status !== 'paid') {
          return NextResponse.json(
            { error: 'Only paid tickets can be checked in' },
            { status: 400 }
          );
        }
        if (ticketData.checkedIn) {
          return NextResponse.json(
            { error: 'Ticket already checked in', checkedInAt: ticketData.checkedInAt },
            { status: 400 }
          );
        }
        await updateDoc(ticketRef, {
          checkedIn: true,
          checkedInAt: Timestamp.now(),
          checkedInBy: checkedInBy || 'system',
          updatedAt: Timestamp.now(),
        });
        break;

      case 'cancel':
        if (ticketData.status === 'cancelled' || ticketData.status === 'refunded') {
          return NextResponse.json(
            { error: 'Ticket already cancelled or refunded' },
            { status: 400 }
          );
        }
        await updateDoc(ticketRef, {
          status: 'cancelled',
          updatedAt: Timestamp.now(),
        });

        // Update event attendee count
        const eventRef = doc(db, COLLECTIONS.EVENTS, ticketData.eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          const eventData = eventSnap.data();
          await updateDoc(eventRef, {
            currentAttendees: Math.max(0, (eventData.currentAttendees || 1) - 1),
          });
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "check-in" or "cancel"' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true,
      ticketId,
      action 
    });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
