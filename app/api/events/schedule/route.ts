/**
 * Event Schedule API Route
 * Handles CRUD operations for event days and sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const type = searchParams.get('type'); // 'days' or 'sessions'

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    if (type === 'sessions') {
      const dayId = searchParams.get('dayId');
      const sessionsRef = collection(db, COLLECTIONS.EVENT_SESSIONS);
      let q;
      if (dayId) {
        q = query(sessionsRef, where('eventId', '==', eventId), where('dayId', '==', dayId), orderBy('order', 'asc'));
      } else {
        q = query(sessionsRef, where('eventId', '==', eventId), orderBy('order', 'asc'));
      }
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ sessions });
    }

    // Default: fetch days
    const daysRef = collection(db, COLLECTIONS.EVENT_DAYS);
    const q = query(daysRef, where('eventId', '==', eventId), orderBy('dayNumber', 'asc'));
    const snapshot = await getDocs(q);
    const days = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ days });
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, eventId, ...data } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    if (type === 'session') {
      const { dayId, title, description, sessionType, startTime, endTime, room, speakerIds, order, isVisible = true } = data;
      
      if (!dayId || !title) {
        return NextResponse.json({ error: 'dayId and title are required for sessions' }, { status: 400 });
      }

      const [sh, sm] = (startTime || '09:00').split(':').map(Number);
      const [eh, em] = (endTime || '10:00').split(':').map(Number);
      const duration = (eh * 60 + em) - (sh * 60 + sm);

      const sessionData = {
        eventId,
        dayId,
        title,
        description: description || '',
        type: sessionType || 'presentation',
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
        duration,
        room: room || '',
        speakerIds: speakerIds || [],
        order: order || 0,
        isVisible,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const sessionsRef = collection(db, COLLECTIONS.EVENT_SESSIONS);
      const docRef = await addDoc(sessionsRef, sessionData);
      return NextResponse.json({ sessionId: docRef.id, message: 'Session added successfully' });
    }

    // Default: create day
    const { date, dayNumber, dayName, theme } = data;
    
    const dayData = {
      eventId,
      date: date ? Timestamp.fromDate(new Date(date)) : Timestamp.now(),
      dayNumber: dayNumber || 1,
      dayName: dayName || 'Day 1',
      theme: theme || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const daysRef = collection(db, COLLECTIONS.EVENT_DAYS);
    const docRef = await addDoc(daysRef, dayData);
    return NextResponse.json({ dayId: docRef.id, message: 'Day added successfully' });
  } catch (error: any) {
    console.error('Error creating schedule item:', error);
    return NextResponse.json({ error: error.message || 'Failed to create schedule item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const collectionName = type === 'session' ? COLLECTIONS.EVENT_SESSIONS : COLLECTIONS.EVENT_DAYS;
    const docRef = doc(db, collectionName, id);
    
    if (updates.date) {
      updates.date = Timestamp.fromDate(new Date(updates.date));
    }
    
    await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error updating schedule item:', error);
    return NextResponse.json({ error: error.message || 'Failed to update schedule item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const collectionName = type === 'session' ? COLLECTIONS.EVENT_SESSIONS : COLLECTIONS.EVENT_DAYS;
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: `${type || 'Day'} deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting schedule item:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete schedule item' }, { status: 500 });
  }
}
