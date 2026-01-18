import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { calculatePackHealth, identifyGaps } from "@/lib/pack-health";

/**
 * GET /api/proof-packs
 * Get all Proof Packs for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    const proofPacksSnapshot = await db
      .collection("proofPacks")
      .where("smeId", "==", userData?.smeId)
      .orderBy("updatedAt", "desc")
      .get();

    const proofPacks = proofPacksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ proofPacks });
  } catch (error: any) {
    console.error("Error fetching proof packs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch proof packs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/proof-packs
 * Create a new Proof Pack
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Check subscription limits
    if (userData?.subscriptionTier === "free") {
      const existingPacksSnapshot = await db
        .collection("proofPacks")
        .where("smeId", "==", userData.smeId)
        .get();

      if (existingPacksSnapshot.size >= 3) {
        return NextResponse.json(
          { error: "Free tier limited to 3 Proof Packs. Upgrade to create more." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { title, description } = body;

    const proofPackData = {
      smeId: userData?.smeId,
      partnerId: null,
      tenantId: userData?.tenantId,
      userId: decodedToken.uid,
      
      title: title || "Untitled Proof Pack",
      description: description || "",
      
      status: "draft",
      visibility: "private",
      
      documents: [],
      documentCount: 0,
      
      packHealth: {
        overallScore: 0,
        completenessScore: 0,
        expirationScore: 0,
        qualityScore: 0,
        remediationScore: 0,
        isEligibleForIntroductions: false,
        calculatedAt: Timestamp.now(),
      },
      
      gaps: [],
      tags: [],
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const proofPackRef = await db.collection("proofPacks").add(proofPackData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "proof_pack_created",
      resource: "proof_pack",
      resourceId: proofPackRef.id,
      details: { title },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      proofPackId: proofPackRef.id,
      redirectTo: `/portal/proof-packs/${proofPackRef.id}`,
    });
  } catch (error: any) {
    console.error("Error creating proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create proof pack" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/proof-packs
 * Update Proof Pack details
 */
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { proofPackId, title, description, tags, visibility } = body;

    if (!proofPackId) {
      return NextResponse.json(
        { error: "Missing proofPackId" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (visibility !== undefined) updateData.visibility = visibility;

    await db.collection("proofPacks").doc(proofPackId).update(updateData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "proof_pack_updated",
      resource: "proof_pack",
      resourceId: proofPackId,
      details: { title, visibility },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update proof pack" },
      { status: 500 }
    );
  }
}
