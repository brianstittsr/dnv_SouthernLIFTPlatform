import { NextRequest, NextResponse } from 'next/server';
import { listHeroBackgrounds } from '@/lib/firebase-hero-storage';

/**
 * API route to list hero background images
 * Avoids CORS issues by calling Firebase Storage from server-side
 */
export async function GET(request: NextRequest) {
  try {
    const images = await listHeroBackgrounds();
    
    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        id: img.id,
        name: img.name,
        url: img.url,
        path: img.path,
        size: img.size,
        contentType: img.contentType,
        uploadedAt: img.uploadedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Hero Backgrounds API] Error listing images:', error);
    return NextResponse.json(
      { error: 'Failed to list hero background images' },
      { status: 500 }
    );
  }
}
