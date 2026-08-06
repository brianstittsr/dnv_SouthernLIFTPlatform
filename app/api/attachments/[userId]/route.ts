import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

/**
 * GET /api/attachments/[userId]
 * Returns all attachments for a user, including markdown content.
 * Used by AI context system for RFI/RFP recommendations.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const snapshot = await db
      .collection(COLLECTIONS.MEMBER_ATTACHMENTS)
      .where("userId", "==", userId)
      .get();

    const attachments = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return NextResponse.json({ data: attachments });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}
