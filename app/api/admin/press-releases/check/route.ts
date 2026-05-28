import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    // Check both collections
    const pressReleasesSnapshot = await db.collection('pressReleases').get();
    const press_releasesSnapshot = await db.collection('press_releases').get();

    const pressReleasesDocs = pressReleasesSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title?.substring(0, 50),
      status: doc.data().status,
      slug: doc.data().slug,
      releaseDate: doc.data().releaseDate?.toDate?.()?.toISOString(),
    }));

    const press_releasesDocs = press_releasesSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title?.substring(0, 50),
      status: doc.data().status,
      slug: doc.data().slug,
      releaseDate: doc.data().releaseDate?.toDate?.()?.toISOString(),
    }));

    return NextResponse.json({
      pressReleases: {
        count: pressReleasesSnapshot.size,
        docs: pressReleasesDocs,
      },
      press_releases: {
        count: press_releasesSnapshot.size,
        docs: press_releasesDocs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking press releases:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check press releases' },
      { status: 500 }
    );
  }
}
