import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";

/**
 * POST /api/proof-packs/[id]/share
 * Generate secure share link for Proof Pack
 */
export async function POST(
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
    const body = await req.json();
    const { expirationDays } = body;

    const proofPackRef = db.collection("proofPacks").doc(proofPackId);
    const proofPackDoc = await proofPackRef.get();

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
        { error: "Unauthorized to share this Proof Pack" },
        { status: 403 }
      );
    }

    // Verify Proof Pack is approved
    if (proofPackData?.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved Proof Packs can be shared" },
        { status: 400 }
      );
    }

    // Verify Pack Health score
    if (proofPackData?.packHealth?.overallScore < 70) {
      return NextResponse.json(
        { error: "Pack Health score must be ≥70 to share" },
        { status: 400 }
      );
    }

    // Generate cryptographically secure token
    const shareToken = crypto.randomBytes(32).toString("hex");

    // Calculate expiration date
    let expiresAt = null;
    if (expirationDays && expirationDays > 0) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);
      expiresAt = Timestamp.fromDate(expirationDate);
    }

    // Create share link document
    const shareLinkData = {
      proofPackId,
      smeId: proofPackData.smeId,
      userId: decodedToken.uid,
      token: shareToken,
      expiresAt,
      isActive: true,
      accessCount: 0,
      createdAt: Timestamp.now(),
      createdBy: decodedToken.uid,
    };

    const shareLinkRef = await db.collection("shareLinks").add(shareLinkData);

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "share_link_created",
      resource: "proof_pack",
      resourceId: proofPackId,
      details: {
        shareLinkId: shareLinkRef.id,
        expirationDays: expirationDays || "no expiration",
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      shareUrl,
      shareLinkId: shareLinkRef.id,
      expiresAt: expiresAt?.toDate().toISOString(),
    });
  } catch (error: any) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create share link" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/proof-packs/[id]/share
 * Revoke a share link
 */
export async function DELETE(
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

    const searchParams = req.nextUrl.searchParams;
    const shareLinkId = searchParams.get("shareLinkId");

    if (!shareLinkId) {
      return NextResponse.json(
        { error: "Missing shareLinkId" },
        { status: 400 }
      );
    }

    const shareLinkRef = db.collection("shareLinks").doc(shareLinkId);
    const shareLinkDoc = await shareLinkRef.get();

    if (!shareLinkDoc.exists) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    const shareLinkData = shareLinkDoc.data();

    // Verify ownership
    if (shareLinkData?.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Unauthorized to revoke this share link" },
        { status: 403 }
      );
    }

    // Revoke link
    await shareLinkRef.update({
      isActive: false,
      revokedAt: Timestamp.now(),
      revokedBy: decodedToken.uid,
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "share_link_revoked",
      resource: "proof_pack",
      resourceId: id,
      details: { shareLinkId },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Share link revoked successfully",
    });
  } catch (error: any) {
    console.error("Error revoking share link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revoke share link" },
      { status: 500 }
    );
  }
}
