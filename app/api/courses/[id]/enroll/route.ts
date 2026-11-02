import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/courses/[id]/enroll
 * Enroll in course with payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    const body = await req.json();
    const { paymentType, stripeSessionId } = body;

    const { id } = await params;
    const courseRef = db.collection("courses").doc(id);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();

    // Check capacity
    if (courseData?.enrolledCount >= courseData?.maxParticipants) {
      return NextResponse.json(
        { error: "Course is at full capacity" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    if (courseData?.participants?.includes(decodedToken.uid)) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Create enrollment record
    const enrollmentData = {
      courseId: id,
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

    await db.collection("courseEnrollments").add(enrollmentData);

    // Update course participant list
    await courseRef.update({
      participants: [...(courseData?.participants || []), decodedToken.uid],
      enrolledCount: (courseData?.enrolledCount || 0) + 1,
      updatedAt: Timestamp.now(),
    });

    // Get user data for email
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    // Send confirmation email
    await db.collection("emailQueue").add({
      to: [userData?.email],
      subject: "Course Enrollment Confirmed",
      body: `
        <h2>Welcome to ${courseData?.title}!</h2>
        <p>Your enrollment has been confirmed.</p>
        <p><strong>Start Date:</strong> ${courseData?.startDate?.toDate().toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${courseData?.duration} weeks</p>
        <p>You will receive notifications when new curriculum materials are released.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/courses/${id}">Access Course Dashboard</a></p>
      `,
      createdAt: Timestamp.now(),
      status: "pending",
    });

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "course_enrolled",
      resource: "course",
      resourceId: id,
      details: { courseTitle: courseData?.title },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in course",
    });
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
