import { NextResponse } from "next/server";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { getMemberCourses } from "@/lib/lms/server/journey";

const serializeTimestamp = (value: unknown): string | null => {
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
};

/** GET /api/lms/my-courses — the signed-in member's enrollments with progress. */
export async function GET() {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);

    const entries = await getMemberCourses(requester.uid);
    return NextResponse.json({
      data: entries.map((entry) => ({
        membershipId: entry.membershipId,
        courseId: entry.courseId,
        status: entry.status,
        progressPercentage: entry.progressPercentage,
        completedSessions: entry.completedSessions,
        totalSessions: entry.totalSessions,
        enrolledAt: entry.enrolledAt,
        completedAt: entry.completedAt,
        certificateId: entry.certificateId,
        course: entry.course
          ? {
              title: entry.course.title,
              slug: entry.course.slug ?? null,
              description: entry.course.description ?? "",
              facilitatorName: entry.course.facilitatorName ?? null,
              thumbnailUrl: entry.course.thumbnailUrl ?? null,
              estimatedDurationWeeks: entry.course.estimatedDurationWeeks ?? null,
              difficultyLevel: entry.course.difficultyLevel ?? null,
              courseStartDate: serializeTimestamp(entry.course.courseStartDate),
              courseEndDate: serializeTimestamp(entry.course.courseEndDate),
            }
          : null,
      })),
    });
  } catch (error) {
    return handleRouteError(error, "Load member courses failed");
  }
}
