/**
 * Event Speakers API Route
 * Handles CRUD operations for event speakers
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
  Timestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const speakersRef = collection(db, COLLECTIONS.EVENT_SPEAKERS);
    const q = query(
      speakersRef,
      where('eventId', '==', eventId),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    
    const speakers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ speakers });
  } catch (error: any) {
    console.error('Error fetching speakers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch speakers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, title, organization, photo, bio, shortBio, role, featured, email, linkedin, order, isVisible = true } = body;

    if (!eventId || !name) {
      return NextResponse.json({ error: 'eventId and name are required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const speakerData = {
      eventId,
      name,
      title: title || '',
      organization: organization || '',
      photo: photo || '',
      bio: bio || '',
      shortBio: shortBio || '',
      role: role || 'speaker',
      featured: featured || false,
      email,
      linkedin,
      order: order || 0,
      isVisible,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const speakersRef = collection(db, COLLECTIONS.EVENT_SPEAKERS);
    const docRef = await addDoc(speakersRef, speakerData);

    return NextResponse.json({ speakerId: docRef.id, message: 'Speaker added successfully' });
  } catch (error: any) {
    console.error('Error adding speaker:', error);
    return NextResponse.json({ error: error.message || 'Failed to add speaker' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { speakerId, ...updates } = body;

    if (!speakerId) {
      return NextResponse.json({ error: 'speakerId is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const speakerRef = doc(db, COLLECTIONS.EVENT_SPEAKERS, speakerId);
    await updateDoc(speakerRef, { ...updates, updatedAt: Timestamp.now() });

    return NextResponse.json({ success: true, speakerId });
  } catch (error: any) {
    console.error('Error updating speaker:', error);
    return NextResponse.json({ error: error.message || 'Failed to update speaker' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const speakerId = searchParams.get('speakerId');

    if (!speakerId) {
      return NextResponse.json({ error: 'speakerId is required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const speakerRef = doc(db, COLLECTIONS.EVENT_SPEAKERS, speakerId);
    await deleteDoc(speakerRef);

    return NextResponse.json({ success: true, message: 'Speaker deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting speaker:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete speaker' }, { status: 500 });
  }
}
