import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/share/[token]/view
 * Get full Proof Pack details for buyer (requires NDA acceptance)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(authToken);

    const { token: shareToken } = await params;

    // Find share link
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

    // Verify NDA acceptance
    const ndaSnapshot = await db
      .collection("ndaAcceptances")
      .where("buyerId", "==", decodedToken.uid)
      .where("smeId", "==", shareLinkData.smeId)
      .limit(1)
      .get();

    if (ndaSnapshot.empty) {
      return NextResponse.json(
        { error: "NDA acceptance required" },
        { status: 403 }
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

    // Log view event
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    await db.collection("proofPackAccess").add({
      proofPackId: shareLinkData.proofPackId,
      smeId: shareLinkData.smeId,
      buyerId: decodedToken.uid,
      shareLinkId: shareLinkDoc.id,
      eventType: "viewed",
      ipAddress,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      proofPack: {
        id: proofPackDoc.id,
        ...proofPackData,
      },
      sme: {
        companyName: userData?.companyName,
        industry: userData?.industry,
        description: userData?.description,
        website: userData?.website,
        certifications: userData?.certifications,
        smeId: proofPackData?.smeId,
      },
    });
  } catch (error: any) {
    console.error("Error viewing proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to view proof pack" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/share/[token]/view
 * Log document download event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(authToken);

    const { token: shareToken } = await params;
    const body = await req.json();
    const { documentId, documentName } = body;

    // Find share link
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

    // Log download event
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    await db.collection("proofPackAccess").add({
      proofPackId: shareLinkData.proofPackId,
      smeId: shareLinkData.smeId,
      buyerId: decodedToken.uid,
      shareLinkId: shareLinkDoc.id,
      eventType: "document_downloaded",
      documentId,
      documentName,
      ipAddress,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error logging download:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log download" },
      { status: 500 }
    );
  }
}
