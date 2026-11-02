import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getRequester, requireDb } from "@/lib/form-builder/server/context";
import { createMeeting, isZoomConfigured } from "@/lib/zoom";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface SessionDoc {
  courseId?: string;
  title?: string;
  scheduledDate?: { toDate?: () => Date } | string;
  startTime?: { toDate?: () => Date } | string;
  durationMinutes?: number;
  zoomMeetingId?: string | number;
}

function sessionStart(session: SessionDoc): Date {
  const raw = session.scheduledDate ?? session.startTime;
  if (raw && typeof raw === "object" && typeof raw.toDate === "function") return raw.toDate();
  if (raw) {
    const parsed = new Date(String(raw));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

/**
 * POST /api/lms/sessions/{id}/zoom
 * Creates a Zoom meeting for a course session and stores the join/start
 * URLs on the session record. Staff, admins, or the course instructor.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const requester = await getRequester();
    if (!requester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isZoomConfigured())) {
      return NextResponse.json({ error: "Zoom is not configured" }, { status: 503 });
    }

    const { id } = await context.params;
    const db = requireDb();
    const sessionSnap = await db.collection("course_sessions").doc(id).get();
    if (!sessionSnap.exists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const session = sessionSnap.data() as SessionDoc;

    let instructorId: string | undefined;
    if (session.courseId) {
      const courseSnap = await db.collection("courses").doc(session.courseId).get();
      const course = courseSnap.data();
      instructorId = (course?.instructorId || course?.facilitatorId) as string | undefined;
    }
    const isInstructor = Boolean(instructorId && requester.uid === instructorId);
    if (!requester.isStaff && !requester.isAdmin && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.zoomMeetingId) {
      return NextResponse.json({ error: "Session already has a Zoom meeting" }, { status: 409 });
    }

    let body: { startTime?: string; durationMinutes?: number; topic?: string } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch {
      // no body — use session defaults
    }
    const start = body.startTime ? new Date(body.startTime) : sessionStart(session);
    const duration = body.durationMinutes ?? session.durationMinutes ?? 60;
    const topic = body.topic || session.title || "LIFT Course Session";

    const meeting = await createMeeting({ topic, startTime: start, durationMinutes: duration });
    await sessionSnap.ref.set(
      {
        zoomMeetingId: String(meeting.id),
        zoomJoinUrl: meeting.join_url,
        zoomStartUrl: meeting.start_url,
        zoomScheduledAt: meeting.start_time,
        zoomCreatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    return NextResponse.json({
      meetingId: String(meeting.id),
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      startTime: meeting.start_time,
    });
  } catch (error) {
    console.error("[lms] zoom meeting create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create meeting" },
      { status: 500 }
    );
  }
}
