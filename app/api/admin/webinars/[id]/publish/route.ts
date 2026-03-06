import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = db.collection(COLLECTIONS.WEBINARS).doc(id);

    const publishData = {
      status: "published",
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await docRef.update(publishData);

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
