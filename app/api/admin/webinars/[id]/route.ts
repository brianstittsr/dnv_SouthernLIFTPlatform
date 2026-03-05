import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { id } = params;
    const docRef = doc(db, COLLECTIONS.WEBINARS, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
    }

    const webinar = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate().toISOString(),
      updatedAt: docSnap.data().updatedAt?.toDate().toISOString(),
      publishedAt: docSnap.data().publishedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ data: webinar });
  } catch (error: any) {
    console.error("Error fetching webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { id } = params;
    const body = await req.json();
    const docRef = doc(db, COLLECTIONS.WEBINARS, id);

    const updateData = {
      ...body,
      updatedAt: Timestamp.now(),
    };

    // Remove fields that shouldn't be updated or cause issues
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);

    return NextResponse.json({ data: { id, ...updateData } });
  } catch (error: any) {
    console.error("Error updating webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { id } = params;
    const docRef = doc(db, COLLECTIONS.WEBINARS, id);
    await deleteDoc(docRef);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
