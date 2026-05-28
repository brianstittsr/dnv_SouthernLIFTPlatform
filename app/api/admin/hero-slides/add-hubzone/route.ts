import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const slideId = "press-release-hubzone";

    // Check if slide already exists
    const existingDoc = await db.collection('hero_slides').doc(slideId).get();
    
    if (existingDoc.exists) {
      return NextResponse.json({
        success: true,
        message: 'HUBZone press release slide already exists in Firebase',
        id: slideId,
        exists: true,
      });
    }

    // Create the HUBZone press release slide
    const heroSlide = {
      id: slideId,
      badge: "🎉 Major Partnership Announcement",
      headline: "KDM Consortium &",
      middleLine: "&",
      highlightedText: "HUBZone Council",
      subheadline: "Launching a Whole of Government Team Approach to build a National HUBZone Digital Ecosystem. Accelerating small business success and strengthening federal contracting opportunities.",
      benefits: ["Digital Ecosystem Platform", "2026 National HUBZone Conference", "Federal Contracting Support"],
      primaryCta: {
        text: "Read Press Release",
        href: "/press-releases/kdm-consortium-hubzone-council-digital-ecosystem",
        action: "link"
      },
      secondaryCta: {
        text: "Join the Consortium",
        href: "/consortium"
      },
      isPublished: true,
      order: 0,
      backgroundType: "image",
      backgroundImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80",
      backgroundOverlay: true,
      backgroundOverlayOpacity: 60,
      fullScreenBg: true,
      showRibbon: true,
      ribbonColor: "dark",
      showWaves: false,
      highlightOnSecondLine: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Save to Firestore
    await db.collection('hero_slides').doc(slideId).set(heroSlide);

    return NextResponse.json({
      success: true,
      message: 'HUBZone press release slide added to Firebase successfully',
      id: slideId,
      exists: false,
      slide: heroSlide,
    });
  } catch (error) {
    console.error('Error adding HUBZone hero slide:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add hero slide' },
      { status: 500 }
    );
  }
}
