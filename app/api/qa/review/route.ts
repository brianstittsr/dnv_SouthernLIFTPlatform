import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/qa/review
 * Approve or reject a Proof Pack
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    // Verify QA reviewer role
    if (claims.role !== "qa_reviewer" && claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { proofPackId, action, comments } = body;

    if (!proofPackId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: proofPackId, action" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "reject" && !comments) {
      return NextResponse.json(
        { error: "Comments are required when rejecting" },
        { status: 400 }
      );
    }

    const proofPackRef = db.collection("proofPacks").doc(proofPackId);
    const proofPackDoc = await proofPackRef.get();

    if (!proofPackDoc.exists) {
      return NextResponse.json(
        { error: "Proof Pack not found" },
        { status: 404 }
      );
    }

    const proofPackData = proofPackDoc.data();

    // Verify status is submitted
    if (proofPackData?.status !== "submitted") {
      return NextResponse.json(
        { error: "Proof Pack is not in submitted status" },
        { status: 400 }
      );
    }

    // Update Proof Pack based on action
    const updateData: any = {
      reviewedBy: decodedToken.uid,
      reviewedAt: Timestamp.now(),
      reviewComments: comments || null,
      updatedAt: Timestamp.now(),
    };

    if (action === "approve") {
      updateData.status = "approved";
      updateData.reviewStatus = "approved";
    } else {
      updateData.status = "draft"; // Return to draft for edits
      updateData.reviewStatus = "rejected";
    }

    await proofPackRef.update(updateData);

    // Get SME user data for email
    const userDoc = await db.collection("users").doc(proofPackData.userId).get();
    const userData = userDoc.data();

    // Send email notification
    const emailSubject = action === "approve"
      ? "Proof Pack Approved!"
      : "Proof Pack Requires Revisions";

    const emailBody = action === "approve"
      ? `
        <h2>Congratulations! Your Proof Pack has been approved.</h2>
        <p>Your Proof Pack "${proofPackData?.title}" has been reviewed and approved by our QA team.</p>
        <p><strong>Pack Health Score:</strong> ${proofPackData?.packHealth?.overallScore}</p>
        <p>Your Proof Pack is now eligible for buyer introductions.</p>
        ${comments ? `<p><strong>Reviewer Comments:</strong> ${comments}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/proof-packs/${proofPackId}">View Proof Pack</a></p>
      `
      : `
        <h2>Your Proof Pack requires revisions</h2>
        <p>Your Proof Pack "${proofPackData?.title}" has been reviewed and requires some updates before approval.</p>
        <p><strong>Reviewer Comments:</strong></p>
        <p>${comments}</p>
        <p>Please make the necessary revisions and resubmit for review.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/proof-packs/${proofPackId}">Edit Proof Pack</a></p>
      `;

    await db.collection("emailQueue").add({
      to: [userData?.email],
      subject: emailSubject,
      body: emailBody,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: `proof_pack_${action}d`,
      resource: "proof_pack",
      resourceId: proofPackId,
      details: {
        title: proofPackData?.title,
        comments,
        packHealthScore: proofPackData?.packHealth?.overallScore,
      },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Proof Pack ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Error reviewing proof pack:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review proof pack" },
      { status: 500 }
    );
  }
}
