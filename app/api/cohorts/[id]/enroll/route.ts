import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/cohorts/[id]/enroll
 * Enroll in cohort with payment
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

    const body = await req.json();
    const { paymentType, stripeSessionId } = body;

    const { id } = await params;
    const cohortRef = db.collection("cohorts").doc(id);
    const cohortDoc = await cohortRef.get();

    if (!cohortDoc.exists) {
      return NextResponse.json(
        { error: "Cohort not found" },
        { status: 404 }
      );
    }

    const cohortData = cohortDoc.data();

    // Check capacity
    if (cohortData?.enrolledCount >= cohortData?.maxParticipants) {
      return NextResponse.json(
        { error: "Cohort is at full capacity" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    if (cohortData?.participants?.includes(decodedToken.uid)) {
      return NextResponse.json(
        { error: "Already enrolled in this cohort" },
        { status: 400 }
      );
    }

    // Create enrollment record
    const enrollmentData = {
      cohortId: id,
      userId: decodedToken.uid,
      paymentType: paymentType || "full",
      stripeSessionId: stripeSessionId || null,
      
      progress: {
        completedWeeks: [],
        assessmentScores: {},
        overallCompletion: 0,
      },
      
      enrolledAt: Timestamp.now(),
      status: "active",
      certificateGenerated: false,
    };

    await db.collection("cohortEnrollments").add(enrollmentData);

    // Update cohort participant list
    await cohortRef.update({
      participants: [...(cohortData?.participants || []), decodedToken.uid],
      enrolledCount: (cohortData?.enrolledCount || 0) + 1,
      updatedAt: Timestamp.now(),
    });

    // Get user data for email
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Send confirmation email
    await db.collection("emailQueue").add({
      to: [userData?.email],
      subject: "Cohort Enrollment Confirmed",
      body: `
        <h2>Welcome to ${cohortData?.title}!</h2>
        <p>Your enrollment has been confirmed.</p>
        <p><strong>Start Date:</strong> ${cohortData?.startDate?.toDate().toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${cohortData?.duration} weeks</p>
        <p>You will receive notifications when new curriculum materials are released.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/cohorts/${id}">Access Cohort Dashboard</a></p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "cohort_enrolled",
      resource: "cohort",
      resourceId: id,
      details: { cohortTitle: cohortData?.title },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in cohort",
    });
  } catch (error: any) {
    console.error("Error enrolling in cohort:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enroll in cohort" },
      { status: 500 }
    );
  }
}
