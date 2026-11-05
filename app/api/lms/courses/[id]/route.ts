import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { getCourseById, getPublicCourseBySlug, getCourseOutline } from "@/lib/lms/server/journey";

const iso = (value: unknown): string | null =>
  value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function"
    ? (value as { toDate: () => Date }).toDate().toISOString()
    : null;

/**
 * GET /api/lms/courses/[id] — public course detail (published only).
 * Accepts a course id or slug. Returns the syllabus outline (titles only —
 * session content is membership-gated via /curriculum).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const course = (await getCourseById(id)) ?? (await getPublicCourseBySlug(id));
    if (!course || (!course.isPublished && course.status !== "published" && course.status !== "active")) {
      return jsonError("Course not found", 404);
    }

    const outline = await getCourseOutline(course.id);
    return NextResponse.json({
      data: {
        id: course.id,
        title: course.title,
        slug: course.slug ?? null,
        description: course.description ?? "",
        facilitatorName: course.facilitatorName ?? null,
        facilitatorBio: null,
        courseStartDate: iso(course.courseStartDate),
        courseEndDate: iso(course.courseEndDate),
        maxParticipants: course.maxParticipants ?? null,
        currentParticipants: course.currentParticipants ?? 0,
        estimatedDurationWeeks: course.estimatedDurationWeeks ?? null,
        status: course.status ?? "published",
        difficultyLevel: course.difficultyLevel ?? null,
        priceInCents: course.priceInCents ?? 0,
        compareAtPriceInCents: course.compareAtPriceInCents ?? null,
        isFree: course.isFree ?? false,
        thumbnailUrl: course.thumbnailUrl ?? null,
        tags: course.tags ?? [],
        learningOutcomes: course.learningOutcomes ?? [],
        prerequisites: course.prerequisites ?? [],
        outline,
      },
    });
  } catch (error) {
    return handleRouteError(error, "Load LMS course failed");
  }
}
