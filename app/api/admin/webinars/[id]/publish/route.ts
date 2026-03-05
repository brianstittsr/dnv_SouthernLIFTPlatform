import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { id } = await params;
    const docRef = doc(db, COLLECTIONS.WEBINARS, id);

    const publishData = {
      status: "published",
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, publishData);

    return NextResponse.json({ 
      success: true, 
      data: { 
        id, 
        status: "published", 
        publishedAt: publishData.publishedAt.toDate().toISOString() 
      } 
    });
  } catch (error: any) {
    console.error("Error publishing webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
