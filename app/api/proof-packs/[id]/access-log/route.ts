import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/proof-packs/[id]/access-log
 * Get access audit trail for a Proof Pack
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
    const proofPackId = id;

    // Verify ownership
    const proofPackDoc = await db.collection("proofPacks").doc(proofPackId).get();
    
    if (!proofPackDoc.exists) {
      return NextResponse.json(
        { error: "Proof Pack not found" },
        { status: 404 }
      );
    }

    const proofPackData = proofPackDoc.data();

    if (proofPackData?.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Unauthorized to view access log" },
        { status: 403 }
      );
    }

    // Get access events
    const accessSnapshot = await db
      .collection("proofPackAccess")
      .where("proofPackId", "==", proofPackId)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const accessEvents = accessSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get buyer information for each event
    const buyerIds = [...new Set(accessEvents.map((e: any) => e.buyerId))];
    const buyersSnapshot = await db
      .collection("users")
      .where("__name__", "in", buyerIds.length > 0 ? buyerIds : ["dummy"])
      .get();

    const buyersMap = new Map();
    buyersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      buyersMap.set(doc.id, {
        email: data.email,
        companyName: data.companyName,
      });
    });

    // Enrich events with buyer info
    const enrichedEvents = accessEvents.map((event: any) => ({
      ...event,
      buyer: buyersMap.get(event.buyerId) || { email: "Unknown", companyName: "Unknown" },
    }));

    // Get share links
    const shareLinksSnapshot = await db
      .collection("shareLinks")
      .where("proofPackId", "==", proofPackId)
      .get();

    const shareLinks = shareLinksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      accessEvents: enrichedEvents,
      shareLinks,
      totalAccess: accessEvents.length,
    });
  } catch (error: any) {
    console.error("Error fetching access log:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch access log" },
      { status: 500 }
    );
  }
}
