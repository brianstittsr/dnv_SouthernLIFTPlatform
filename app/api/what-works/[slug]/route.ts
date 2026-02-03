import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  increment,
} from "firebase/firestore";
import { WHAT_WORKS_COLLECTION } from "@/lib/what-works-schema";

/**
 * GET /api/what-works/[slug]
 * Get a single What Works article by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Try to find by slug first
    const articlesRef = collection(db, WHAT_WORKS_COLLECTION);
    const q = query(articlesRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Try to find by document ID
      const docRef = doc(db, WHAT_WORKS_COLLECTION, slug);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }

      const data = docSnap.data();
      
      // Increment view count
      await updateDoc(docRef, { viewCount: increment(1) });

      return NextResponse.json({
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      });
    }

    const articleDoc = snapshot.docs[0];
    const data = articleDoc.data();

    // Increment view count
    const docRef = doc(db, WHAT_WORKS_COLLECTION, articleDoc.id);
    await updateDoc(docRef, { viewCount: increment(1) });

    return NextResponse.json({
      id: articleDoc.id,
      ...data,
      publishedAt: data.publishedAt?.toDate?.() || new Date(),
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    });
  } catch (error) {
    console.error("Error fetching What Works article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/what-works/[slug]
 * Update a What Works article
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Find article by slug or ID
    const articlesRef = collection(db, WHAT_WORKS_COLLECTION);
    const q = query(articlesRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);

    let docId: string;
    if (snapshot.empty) {
      // Try document ID
      const docRef = doc(db, WHAT_WORKS_COLLECTION, slug);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }
      docId = slug;
    } else {
      docId = snapshot.docs[0].id;
    }

    const docRef = doc(db, WHAT_WORKS_COLLECTION, docId);
    const updateData = {
      ...body,
      updatedAt: Timestamp.now(),
    };

    if (body.publishedAt) {
      updateData.publishedAt = Timestamp.fromDate(new Date(body.publishedAt));
    }

    await updateDoc(docRef, updateData);

    const updatedDoc = await getDoc(docRef);
    const data = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...data,
      publishedAt: data?.publishedAt?.toDate?.() || new Date(),
      createdAt: data?.createdAt?.toDate?.() || new Date(),
      updatedAt: data?.updatedAt?.toDate?.() || new Date(),
    });
  } catch (error) {
    console.error("Error updating What Works article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/what-works/[slug]
 * Delete a What Works article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Find article by slug or ID
    const articlesRef = collection(db, WHAT_WORKS_COLLECTION);
    const q = query(articlesRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);

    let docId: string;
    if (snapshot.empty) {
      docId = slug;
    } else {
      docId = snapshot.docs[0].id;
    }

    const docRef = doc(db, WHAT_WORKS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, id: docId });
  } catch (error) {
    console.error("Error deleting What Works article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
