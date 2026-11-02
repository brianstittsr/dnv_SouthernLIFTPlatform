import { NextRequest, NextResponse } from "next/server";
import { getRequester, requireDb } from "@/lib/form-builder/server/context";
import { createCourseAnnouncementDraft } from "@/lib/lms/announce";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/lms/courses/{id}/announce
 * Creates (or returns the existing) LinkedIn announcement draft for a
 * course. Staff, admins, or the course instructor.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const requester = await getRequester();
    if (!requester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const db = requireDb();
    const courseSnap = await db.collection("courses").doc(id).get();
    if (!courseSnap.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const course = courseSnap.data() as { instructorId?: string; facilitatorId?: string };
    const isInstructor =
      requester.uid === course.instructorId || requester.uid === course.facilitatorId;
    if (!requester.isStaff && !requester.isAdmin && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const draftId = await createCourseAnnouncementDraft(id, courseSnap.data() ?? {}, requester.uid);
    return NextResponse.json({ draftId });
  } catch (error) {
    console.error("[lms] announce error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
