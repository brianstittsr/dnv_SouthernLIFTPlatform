import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/proof-packs/[id]
 * Get a single Proof Pack by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const { id } = await params;
    const proofPackDoc = await db.collection("proofPacks").doc(id).get();

    if (!proofPackDoc.exists) {
      return NextResponse.json(
        { error: "Proof Pack not found" },
        { status: 404 }
      );
    }

    const proofPackData = proofPackDoc.data();

    // Verify ownership
    if (proofPackData?.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Unauthorized to access this Proof Pack" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: proofPackDoc.id,
      ...proofPackData,
    });
  } catch (error: any) {
    console.error("Error fetching proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch proof pack" },
      { status: 500 }
    );
  }
}
