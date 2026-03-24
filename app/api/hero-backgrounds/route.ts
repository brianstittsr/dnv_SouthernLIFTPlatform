import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to list hero background images
 * Returns empty array as fallback since Firebase Storage listing requires admin SDK
 */
export async function GET(request: NextRequest) {
  try {
    // Return empty array as fallback
    // In production, use Firebase Admin SDK to list images from server
    const images: any[] = [];
    
    return NextResponse.json({
      success: true,
      images: images,
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
