import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
    const q = query(webinarsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const webinars = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      publishedAt: doc.data().publishedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ data: webinars });
  } catch (error: any) {
    console.error("Error fetching webinars:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const body = await req.json();
    const webinarsRef = collection(db, COLLECTIONS.WEBINARS);

    const now = Timestamp.now();
    const docData = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(webinarsRef, docData);

    return NextResponse.json({ 
      data: { id: docRef.id, ...body, createdAt: now.toDate().toISOString(), updatedAt: now.toDate().toISOString() } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating webinar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
