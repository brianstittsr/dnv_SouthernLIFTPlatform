import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * PATCH /api/admin/cohorts/[id]/assign-instructor
 * Assign an instructor to a cohort
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    // Check custom claims first, then fall back to Firestore user document
    let isAdmin = claims.role === "platform_admin";
    
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get cohort ID from params
    const { id } = await params;

    // Parse request body
    const body = await req.json();
    const { instructorId, instructorName, instructorEmail } = body;

    if (!instructorId || !instructorName) {
      return NextResponse.json(
        { error: "Missing required fields: instructorId, instructorName" },
        { status: 400 }
      );
    }

    // Verify instructor exists and has correct role
    const instructorDoc = await db.collection("users").doc(instructorId).get();
    if (!instructorDoc.exists) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 }
      );
    }

    const instructorData = instructorDoc.data();
    const isInstructor = instructorData?.svpRole === "cmmc_instructor" || 
                        instructorData?.role === "cmmc_instructor";

    if (!isInstructor) {
      return NextResponse.json(
        { error: "User is not a CMMC instructor" },
        { status: 400 }
      );
    }

    // Update cohort with instructor information
    const cohortRef = db.collection("cohorts").doc(id);
    const cohortDoc = await cohortRef.get();

    if (!cohortDoc.exists) {
      return NextResponse.json(
        { error: "Cohort not found" },
        { status: 404 }
      );
    }

    await cohortRef.update({
      facilitatorId: instructorId,
      facilitatorName: instructorName,
      facilitatorEmail: instructorEmail || instructorData?.email || "",
      updatedAt: Timestamp.now(),
      updatedBy: decodedToken.uid,
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "cohort_instructor_assigned",
      resource: "cohort",
      resourceId: id,
      details: { instructorId, instructorName },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Instructor assigned successfully",
      cohort: {
        id,
        facilitatorId: instructorId,
        facilitatorName: instructorName,
      },
    });
  } catch (error: any) {
    console.error("Error assigning instructor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign instructor" },
      { status: 500 }
    );
  }
}
