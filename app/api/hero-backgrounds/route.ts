import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * API route to list hero background images.
 * Reads the hero_images metadata collection — image bytes live in the
 * fileBlobs store and are served from each doc's `imageUrl` (/api/files/{id}).
 */
export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ success: true, images: [] });
    }

    const snapshot = await db
      .collection('hero_images')
      .orderBy('createdAt', 'desc')
      .get();

    const images = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();
        return { id: docSnap.id, url: (data.imageUrl as string) || '', name: data.name };
      })
      .filter((img) => img.url.length > 0);

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error('[Hero Backgrounds API] Error listing images:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list hero background images',
        images: []
      },
      { status: 200 }
    );
  }
}
