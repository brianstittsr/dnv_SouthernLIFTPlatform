import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * PUT /api/introductions/[id]/stage
 * Update introduction stage (for conversion tracking)
 */
export async function PUT(
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

    const body = await req.json();
    const { stage, notes, estimatedValue, meetingDate } = body;

    const validStages = [
      "intro",
      "meeting_scheduling",
      "meeting_held",
      "rfq_sent",
      "proposal_submitted",
      "award",
    ];

    if (!stage || !validStages.includes(stage)) {
      return NextResponse.json(
        { error: "Invalid stage" },
        { status: 400 }
      );
    }

    const introRef = db.collection("introductions").doc(params.id);
    const introDoc = await introRef.get();

    if (!introDoc.exists) {
      return NextResponse.json(
        { error: "Introduction not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      stage,
      updatedAt: Timestamp.now(),
      updatedBy: decodedToken.uid,
    };

    if (notes) updateData.stageNotes = notes;
    if (estimatedValue) updateData.estimatedValue = estimatedValue;
    if (meetingDate) {
      updateData.meetingDate = Timestamp.fromDate(new Date(meetingDate));
    }

    // Track stage transition
    const stageHistory = introDoc.data()?.stageHistory || [];
    stageHistory.push({
      stage,
      timestamp: Timestamp.now(),
      updatedBy: decodedToken.uid,
      notes: notes || null,
    });
    updateData.stageHistory = stageHistory;

    await introRef.update(updateData);

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "introduction_stage_updated",
      resource: "introduction",
      resourceId: params.id,
      details: { stage, notes },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // Trigger revenue attribution event if award stage
    if (stage === "award" && estimatedValue) {
      await db.collection("revenueEvents").add({
        introductionId: params.id,
        smeId: introDoc.data()?.smeId,
        partnerId: introDoc.data()?.partnerId,
        buyerId: introDoc.data()?.buyerId,
        eventType: "award",
        value: estimatedValue,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating stage:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update stage" },
      { status: 500 }
    );
  }
}
