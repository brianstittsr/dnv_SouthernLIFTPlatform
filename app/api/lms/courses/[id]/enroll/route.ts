import { NextRequest, NextResponse } from "next/server";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { enrollInCourse } from "@/lib/lms/server/journey";

/**
 * POST /api/lms/courses/[id]/enroll — free-course enrollment.
 * Paid courses return 402 { checkoutRequired: true }; the client then goes
 * through /api/stripe/course-checkout.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const { id } = await params;

    const result = await enrollInCourse(requester.uid, id, requester.email);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, ...(result.checkoutRequired ? { checkoutRequired: true } : {}) },
        { status: result.status }
      );
    }
    return NextResponse.json({ data: { membershipId: result.membershipId, alreadyEnrolled: result.alreadyEnrolled } });
  } catch (error) {
    return handleRouteError(error, "Enroll in course failed");
  }
}
