import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const VISIBILITY_COLLECTION = "blogVisibility";

interface VisibilityDoc {
  slug: string;
  hidden: boolean;
  updatedAt: FirebaseFirestore.Timestamp;
}

/**
 * GET - Retrieve visibility state for all blog posts
 */
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ data: {} });
    }

    const snapshot = await db.collection(VISIBILITY_COLLECTION).get();
    const visibility: Record<string, boolean> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as VisibilityDoc;
      visibility[doc.id] = data.hidden;
    });

    return NextResponse.json({ data: visibility });
  } catch (error) {
    console.error("Error loading blog visibility:", error);
    return NextResponse.json({ data: {} });
  }
}

/**
 * POST - Toggle visibility for a blog post
 * Body: { slug: string, hidden: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { slug, hidden } = body;

    if (!slug || typeof hidden !== "boolean") {
      return NextResponse.json(
        { error: "slug (string) and hidden (boolean) are required" },
        { status: 400 }
      );
    }

    await db.collection(VISIBILITY_COLLECTION).doc(slug).set(
      {
        slug,
        hidden,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, slug, hidden });
  } catch (error) {
    console.error("Error updating blog visibility:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Bulk update visibility for multiple posts
 * Body: { updates: { slug: string, hidden: boolean }[] }
 */
export async function PUT(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "updates array is required" },
        { status: 400 }
      );
    }

    const batch = db.batch();

    for (const { slug, hidden } of updates) {
      if (slug && typeof hidden === "boolean") {
        const docRef = db.collection(VISIBILITY_COLLECTION).doc(slug);
        batch.set(
          docRef,
          { slug, hidden, updatedAt: Timestamp.now() },
          { merge: true }
        );
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      updated: updates.length,
    });
  } catch (error) {
    console.error("Error bulk updating blog visibility:", error);
    return NextResponse.json(
      { error: "Failed to bulk update visibility" },
      { status: 500 }
    );
  }
}
