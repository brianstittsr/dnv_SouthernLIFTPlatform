import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

/**
 * GET /api/share/[token]
 * Get Proof Pack by share token (public endpoint)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: shareToken } = await params;

    // Find share link by token
    const shareLinksSnapshot = await db
      .collection("shareLinks")
      .where("token", "==", shareToken)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (shareLinksSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired share link" },
        { status: 404 }
      );
    }

    const shareLinkDoc = shareLinksSnapshot.docs[0];
    const shareLinkData = shareLinkDoc.data();

    // Check expiration
    if (shareLinkData.expiresAt && shareLinkData.expiresAt.toMillis() < Date.now()) {
      return NextResponse.json(
        { error: "Share link has expired" },
        { status: 410 }
      );
    }

    // Get Proof Pack
    const proofPackDoc = await db
      .collection("proofPacks")
      .doc(shareLinkData.proofPackId)
      .get();

    if (!proofPackDoc.exists) {
      return NextResponse.json(
        { error: "Proof Pack not found" },
        { status: 404 }
      );
    }

    const proofPackData = proofPackDoc.data();

    // Get SME user data
    const userDoc = await db.collection("users").doc(proofPackData?.userId).get();
    const userData = userDoc.data();

    return NextResponse.json({
      proofPack: {
        id: proofPackDoc.id,
        title: proofPackData?.title,
        description: proofPackData?.description,
        packHealth: proofPackData?.packHealth,
        documentCount: proofPackData?.documentCount,
      },
      sme: {
        companyName: userData?.companyName,
        industry: userData?.industry,
        smeId: proofPackData?.smeId,
      },
      shareLinkId: shareLinkDoc.id,
    });
  } catch (error: any) {
    console.error("Error fetching shared proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shared proof pack" },
      { status: 500 }
    );
  }
}
