import { NextResponse } from "next/server";
import { getPublishedCourses } from "@/lib/lms/server/journey";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";

const serializeCourse = (course: {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  facilitatorName?: string;
  courseStartDate?: { toDate: () => Date };
  courseEndDate?: { toDate: () => Date };
  maxParticipants?: number;
  currentParticipants?: number;
  estimatedDurationWeeks?: number;
  status?: string;
  difficultyLevel?: string;
  priceInCents?: number;
  compareAtPriceInCents?: number;
  isFree?: boolean;
  thumbnailUrl?: string;
  tags?: string[];
}) => ({
  id: course.id,
  title: course.title,
  slug: course.slug ?? null,
  description: course.description ?? "",
  facilitatorName: course.facilitatorName ?? null,
  courseStartDate: course.courseStartDate?.toDate().toISOString() ?? null,
  courseEndDate: course.courseEndDate?.toDate().toISOString() ?? null,
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
});

/** GET /api/lms/catalog — public list of published courses. */
export async function GET() {
  try {
    const courses = await getPublishedCourses();
    return NextResponse.json({ data: courses.map(serializeCourse) });
  } catch (error) {
    return handleRouteError(error, "List LMS catalog failed");
  }
}
