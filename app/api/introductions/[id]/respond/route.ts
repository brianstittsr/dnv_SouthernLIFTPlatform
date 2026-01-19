import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/introductions/[id]/respond
 * Accept or decline introduction request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { action, declineReason } = body;

    if (!action || (action !== "accept" && action !== "decline")) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    const introRef = db.collection("introductions").doc(id);
    const introDoc = await introRef.get();

    if (!introDoc.exists) {
      return NextResponse.json(
        { error: "Introduction not found" },
        { status: 404 }
      );
    }

    const introData = introDoc.data();

    if (!introData) {
      return NextResponse.json(
        { error: "Introduction data not found" },
        { status: 404 }
      );
    }

    // Verify SME ownership
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (userData?.smeId !== introData?.smeId) {
      return NextResponse.json(
        { error: "Unauthorized to respond to this introduction" },
        { status: 403 }
      );
    }

    // Update introduction
    const updateData: any = {
      status: action === "accept" ? "accepted" : "declined",
      respondedAt: Timestamp.now(),
      respondedBy: decodedToken.uid,
      updatedAt: Timestamp.now(),
    };

    if (action === "decline" && declineReason) {
      updateData.declineReason = declineReason;
    }

    if (action === "accept") {
      updateData.stage = "meeting_scheduling";
      updateData.smeContactInfo = {
        email: userData?.email,
        phone: userData?.phone || null,
      };
    }

    await introRef.update(updateData);

    // Send notification to buyer
    const buyerDoc = await db.collection("users").doc(introData.buyerId).get();
    const buyerData = buyerDoc.data();

    if (action === "accept") {
      await db.collection("emailQueue").add({
        to: [buyerData?.email],
        subject: "Introduction Accepted!",
        body: `
          <h2>Great News!</h2>
          <p>${introData.smeCompany} has accepted your introduction request.</p>
          <p><strong>Next Steps:</strong> Schedule a meeting to discuss your project.</p>
          <p><strong>SME Contact:</strong> ${userData?.email}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/buyer/introductions/${id}">Schedule Meeting</a></p>
        `,
        createdAt: Timestamp.now(),
        status: "pending",
      });
    } else {
      await db.collection("emailQueue").add({
        to: [buyerData?.email],
        subject: "Introduction Update",
        body: `
          <h2>Introduction Update</h2>
          <p>Thank you for your interest in ${introData.smeCompany}.</p>
          <p>Unfortunately, they are unable to pursue this opportunity at this time.</p>
          ${declineReason ? `<p><strong>Reason:</strong> ${declineReason}</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/buyer/directory">Browse Other SMEs</a></p>
        `,
        createdAt: Timestamp.now(),
        status: "pending",
      });
    }

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: `introduction_${action}ed`,
      resource: "introduction",
      resourceId: id,
      details: { buyerCompany: introData.buyerCompany },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Introduction ${action}ed successfully`,
    });
  } catch (error: any) {
    console.error("Error responding to introduction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to respond to introduction" },
      { status: 500 }
    );
  }
}
