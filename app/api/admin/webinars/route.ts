import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/auth/server-auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const webinarsRef = db.collection(COLLECTIONS.WEBINARS);
    const snapshot = await webinarsRef.orderBy("createdAt", "desc").get();

    const webinars = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        publishedAt: data.publishedAt?.toDate().toISOString(),
      };
    });

    return NextResponse.json({ data: webinars });
  } catch (error: any) {
    console.error("Error fetching webinars:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const webinarsRef = db.collection(COLLECTIONS.WEBINARS);

    const now = Timestamp.now();
    const docData = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await webinarsRef.add(docData);

    return NextResponse.json({ 
      data: { 
        id: docRef.id, 
        ...body, 
        createdAt: now.toDate().toISOString(), 
        updatedAt: now.toDate().toISOString() 
      } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
