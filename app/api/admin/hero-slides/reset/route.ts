import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    // Get all hero slides
    const slidesSnapshot = await db.collection('hero_slides').get();
    
    if (slidesSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No slides to clear in Firebase',
        cleared: 0,
      });
    }

    // Delete all slides
    const batch = db.batch();
    slidesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Cleared ${slidesSnapshot.size} slides from Firebase. The carousel will now use the updated default slides including the HUBZone Council slide.`,
      cleared: slidesSnapshot.size,
    });
  } catch (error) {
    console.error('Error clearing hero slides:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear hero slides' },
      { status: 500 }
    );
  }
}
