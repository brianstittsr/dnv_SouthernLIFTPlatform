/**
 * Events API Route
 * 
 * Handles CRUD operations for KDM Consortium events
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
  deleteDoc,
  query, 
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS, EventDoc } from '@/lib/schema';

/**
 * GET /api/events
 * Retrieve events with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const upcoming = searchParams.get('upcoming');
    const limitParam = searchParams.get('limit');

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    let constraints: any[] = [];

    // Filter by status (default to published for public queries)
    if (status) {
      constraints.push(where('status', '==', status));
    }

    // Filter by category
    if (category) {
      constraints.push(where('category', '==', category));
    }

    // Filter by featured
    if (featured === 'true') {
      constraints.push(where('isFeatured', '==', true));
    }

    // Filter upcoming events (startDate >= now)
    if (upcoming === 'true') {
      constraints.push(where('startDate', '>=', Timestamp.now()));
      constraints.push(orderBy('startDate', 'asc'));
    } else {
      constraints.push(orderBy('startDate', 'desc'));
    }

    // Apply limit
    if (limitParam) {
      constraints.push(limit(parseInt(limitParam)));
    }

    const q = query(eventsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title,
      description,
      shortDescription,
      startDate,
      startTime,
      endDate,
      endTime,
      isAllDay = false,
      locationType,
      location,
      virtualLink,
      registrationUrl,
      registrationDeadline,
      maxAttendees,
      imageUrl,
      category,
      tags = [],
      status = 'draft',
      isFeatured = false,
      isTicketed = false,
      ticketTypes,
      sponsorIds = [],
      speakerIds = [],
      createdBy
    } = body;

    if (!title || !startDate || !locationType || !location || !category) {
      return NextResponse.json(
        { error: 'title, startDate, locationType, location, and category are required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const eventData: Omit<EventDoc, 'id'> = {
      title,
      description: description || '',
      shortDescription,
      startDate: Timestamp.fromDate(new Date(startDate)),
      startTime: startTime || '09:00',
      endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : Timestamp.fromDate(new Date(startDate)),
      endTime: endTime || '17:00',
      isAllDay,
      locationType,
      location,
      virtualLink,
      registrationUrl,
      registrationDeadline: registrationDeadline ? Timestamp.fromDate(new Date(registrationDeadline)) : undefined,
      maxAttendees,
      currentAttendees: 0,
      imageUrl,
      category,
      tags,
      status,
      isFeatured,
      isTicketed,
      ticketTypes: ticketTypes?.map((t: any) => ({
        ...t,
        soldCount: 0
      })),
      sponsorIds,
      speakerIds,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: createdBy || 'system',
    };

    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const docRef = await addDoc(eventsRef, eventData);

    return NextResponse.json({
      eventId: docRef.id,
      message: 'Event created successfully'
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events
 * Update an event (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, ...updates } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Convert date strings to Timestamps
    const processedUpdates: any = { ...updates };
    if (updates.startDate) {
      processedUpdates.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      processedUpdates.endDate = Timestamp.fromDate(new Date(updates.endDate));
    }
    if (updates.registrationDeadline) {
      processedUpdates.registrationDeadline = Timestamp.fromDate(new Date(updates.registrationDeadline));
    }

    await updateDoc(eventRef, {
      ...processedUpdates,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true,
      eventId 
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events
 * Delete an event (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check for existing tickets before deleting
    const ticketsRef = collection(db, COLLECTIONS.TICKETS);
    const ticketsQuery = query(
      ticketsRef,
      where('eventId', '==', eventId),
      where('status', '==', 'paid')
    );
    const ticketsSnapshot = await getDocs(ticketsQuery);

    if (!ticketsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Cannot delete event with paid tickets. Cancel the event instead.' },
        { status: 400 }
      );
    }

    await deleteDoc(eventRef);

    return NextResponse.json({ 
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
