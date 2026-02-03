import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";

interface DraftData {
  title: string;
  content: string;
  hashtags: string;
  glossary: Array<{ term: string; definition: string }>;
  references: Array<{ id: string; title: string; url: string; status: string }>;
  images: string[];
  tone: string;
  length: string;
  prompt: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: string;
}

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const draftsRef = collection(db, "linkedinArticles");
    let q = query(draftsRef, orderBy("createdAt", "desc"));

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    if (status) {
      q = query(q, where("status", "==", status));
    }

    const snapshot = await getDocs(q);
    const drafts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      scheduledFor: doc.data().scheduledFor?.toDate?.() || null,
      publishedAt: doc.data().publishedAt?.toDate?.() || null,
    }));

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body: DraftData & { userId?: string } = await request.json();

    const now = Timestamp.now();
    const draftData = {
      userId: body.userId || "anonymous",
      title: body.title || "",
      content: body.content || "",
      hashtags: body.hashtags || "",
      glossary: body.glossary || [],
      references: body.references || [],
      images: body.images || [],
      tone: body.tone || "professional",
      length: body.length || "medium",
      prompt: body.prompt || "",
      status: body.status || "draft",
      scheduledFor: body.scheduledFor ? Timestamp.fromDate(new Date(body.scheduledFor)) : null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, "linkedinArticles"), draftData);

    return NextResponse.json({
      id: docRef.id,
      ...draftData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
