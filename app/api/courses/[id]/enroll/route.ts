import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { enrollInCourse } from "@/lib/lms/server/journey";

/**
 * POST /api/courses/[id]/enroll (legacy route — delegates to the course_* journey)
 * Free courses enroll directly; paid courses return 402 so the client goes
 * through /api/stripe/course-checkout.
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

    const decodedToken = await auth.verifyIdToken(authHeader.split("Bearer ")[1]);
    const { id } = await params;

    const result = await enrollInCourse(decodedToken.uid, id, decodedToken.email ?? null);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, ...(result.checkoutRequired ? { checkoutRequired: true } : {}) },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      membershipId: result.membershipId,
      alreadyEnrolled: result.alreadyEnrolled,
    });
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
