import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";

interface UpdateDraftData {
  title?: string;
  content?: string;
  hashtags?: string;
  glossary?: Array<{ term: string; definition: string }>;
  references?: Array<{ id: string; title: string; url: string; status: string }>;
  images?: string[];
  tone?: string;
  length?: string;
  prompt?: string;
  status?: "draft" | "scheduled" | "published";
  scheduledFor?: string;
  linkedinPostId?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, "linkedinArticles", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      scheduledFor: data.scheduledFor?.toDate?.() || null,
      publishedAt: data.publishedAt?.toDate?.() || null,
    });
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: UpdateDraftData = await request.json();
    const docRef = doc(db, "linkedinArticles", id);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: Timestamp.now(),
    };

    // Convert date strings to Timestamps
    if (body.scheduledFor) {
      updateData.scheduledFor = Timestamp.fromDate(new Date(body.scheduledFor));
    }

    // If status is being set to published, add publishedAt
    if (body.status === "published") {
      updateData.publishedAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);

    const updatedDoc = await getDoc(docRef);
    const data = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...data,
      createdAt: data?.createdAt?.toDate?.() || new Date(),
      updatedAt: data?.updatedAt?.toDate?.() || new Date(),
      scheduledFor: data?.scheduledFor?.toDate?.() || null,
      publishedAt: data?.publishedAt?.toDate?.() || null,
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, "linkedinArticles", id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
