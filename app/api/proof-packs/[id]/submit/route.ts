import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/proof-packs/[id]/submit
 * Submit Proof Pack for QA review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const proofPackId = params.id;
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
        { error: "Unauthorized to submit this Proof Pack" },
        { status: 403 }
      );
    }

    // Check Pack Health score
    if (proofPackData?.packHealth?.overallScore < 70) {
      return NextResponse.json(
        {
          error: "Pack Health score must be ≥70 to submit for review",
          currentScore: proofPackData?.packHealth?.overallScore,
          requiredScore: 70,
        },
        { status: 400 }
      );
    }

    // Check if already submitted
    if (proofPackData?.status !== "draft") {
      return NextResponse.json(
        { error: "Proof Pack has already been submitted" },
        { status: 400 }
      );
    }

    // Update status to submitted
    await proofPackRef.update({
      status: "submitted",
      submittedAt: Timestamp.now(),
      submittedBy: decodedToken.uid,
      reviewStatus: "pending",
      reviewedBy: null,
      reviewedAt: null,
      reviewComments: null,
      updatedAt: Timestamp.now(),
    });

    // Get user data for email
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Queue confirmation email
    await db.collection("emailQueue").add({
      to: [userData?.email],
      subject: "Proof Pack Submitted for Review",
      body: `
        <h2>Proof Pack Submitted Successfully</h2>
        <p>Your Proof Pack "${proofPackData?.title}" has been submitted for QA review.</p>
        <p><strong>Pack Health Score:</strong> ${proofPackData?.packHealth?.overallScore}</p>
        <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p>You will receive an email notification once the review is complete.</p>
        <p>While under review, you cannot edit the Proof Pack.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/proof-packs/${proofPackId}">View Proof Pack</a></p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "proof_pack_submitted",
      resource: "proof_pack",
      resourceId: proofPackId,
      details: {
        title: proofPackData?.title,
        packHealthScore: proofPackData?.packHealth?.overallScore,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Proof Pack submitted for review",
    });
  } catch (error: any) {
    console.error("Error submitting proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit proof pack" },
      { status: 500 }
    );
  }
}
