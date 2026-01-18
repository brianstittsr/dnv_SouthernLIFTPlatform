import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/share/[token]/nda
 * Accept NDA for shared Proof Pack
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const shareToken = params.token;
    const body = await req.json();
    const { accepted } = body;

    if (!accepted) {
      return NextResponse.json(
        { error: "NDA must be accepted to view Proof Pack" },
        { status: 400 }
      );
    }

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

    // Check if NDA already accepted for this buyer-SME relationship
    const existingNDASnapshot = await db
      .collection("ndaAcceptances")
      .where("buyerId", "==", decodedToken.uid)
      .where("smeId", "==", shareLinkData.smeId)
      .limit(1)
      .get();

    if (!existingNDASnapshot.empty) {
      // NDA already accepted
      return NextResponse.json({
        success: true,
        message: "NDA already accepted",
        ndaId: existingNDASnapshot.docs[0].id,
      });
    }

    // Get client IP address
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Create NDA acceptance record
    const ndaData = {
      buyerId: decodedToken.uid,
      smeId: shareLinkData.smeId,
      proofPackId: shareLinkData.proofPackId,
      shareLinkId: shareLinkDoc.id,
      accepted: true,
      acceptedAt: Timestamp.now(),
      ipAddress,
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    const ndaRef = await db.collection("ndaAcceptances").add(ndaData);

    // Log access event
    await db.collection("proofPackAccess").add({
      proofPackId: shareLinkData.proofPackId,
      smeId: shareLinkData.smeId,
      buyerId: decodedToken.uid,
      shareLinkId: shareLinkDoc.id,
      eventType: "nda_accepted",
      ipAddress,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // Increment access count on share link
    await shareLinkDoc.ref.update({
      accessCount: (shareLinkData.accessCount || 0) + 1,
    });

    return NextResponse.json({
      success: true,
      message: "NDA accepted successfully",
      ndaId: ndaRef.id,
    });
  } catch (error: any) {
    console.error("Error accepting NDA:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept NDA" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/share/[token]/nda
 * Check if buyer has accepted NDA
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const shareToken = params.token;

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

    const shareLinkData = shareLinksSnapshot.docs[0].data();

    // Check if NDA accepted
    const ndaSnapshot = await db
      .collection("ndaAcceptances")
      .where("buyerId", "==", decodedToken.uid)
      .where("smeId", "==", shareLinkData.smeId)
      .limit(1)
      .get();

    return NextResponse.json({
      accepted: !ndaSnapshot.empty,
      ndaId: ndaSnapshot.empty ? null : ndaSnapshot.docs[0].id,
    });
  } catch (error: any) {
    console.error("Error checking NDA status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check NDA status" },
      { status: 500 }
    );
  }
}
