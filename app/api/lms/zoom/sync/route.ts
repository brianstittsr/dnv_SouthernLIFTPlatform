import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getRequester, requireDb } from "@/lib/form-builder/server/context";
import { getPastMeetingParticipants, isZoomConfigured } from "@/lib/zoom";

interface SyncedSession {
  sessionId: string;
  participants: number;
  matched: number;
}

function isCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return request.headers.get("x-cron-secret") === secret;
}

/**
 * POST/GET /api/lms/zoom/sync
 * Pulls past-meeting participants for sessions that have a Zoom meeting,
 * stores per-participant attendance on the session, and marks matched
 * enrolled learners attended in course_session_progress. Callable by
 * staff/admins or by Vercel cron with CRON_SECRET.
 */
async function runSync(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isCron(request)) {
      const requester = await getRequester();
      if (!requester || (!requester.isStaff && !requester.isAdmin)) {
        return NextResponse.json({ error: "Forbidden" }, { status: requester ? 403 : 401 });
      }
    }
    if (!(await isZoomConfigured())) {
      return NextResponse.json({ error: "Zoom is not configured" }, { status: 503 });
    }

    const db = requireDb();
    const sessions = await db
      .collection("course_sessions")
      .where("zoomMeetingId", ">", "")
      .get();

    const synced: SyncedSession[] = [];
    const errors: { sessionId: string; error: string }[] = [];

    const force = request.nextUrl.searchParams.get("force") === "1";
    for (const sessionDoc of sessions.docs) {
      const session = sessionDoc.data();
      if (session.zoomSyncedAt && !force && !session.zoomResyncRequested) continue;
      try {
        const participants = await getPastMeetingParticipants(session.zoomMeetingId);
        const attendance = participants.map((p) => ({
          name: p.name || "Participant",
          email: p.user_email || null,
          joinTime: p.join_time || null,
          leaveTime: p.leave_time || null,
          durationSeconds: p.duration || 0,
        }));
        const attendeeEmails = new Set(
          attendance.map((a) => a.email?.toLowerCase()).filter((e): e is string => Boolean(e))
        );
        const totalMinutes = Math.round(attendance.reduce((sum, a) => sum + a.durationSeconds, 0) / 60);

        // Match attendee emails to enrolled learners and mark progress
        let matched = 0;
        if (attendeeEmails.size > 0 && session.courseId) {
          const users = await db
            .collection("users")
            .where("email", "in", [...attendeeEmails].slice(0, 30))
            .get();
          const userIds = new Set(users.docs.map((u) => u.id));
          if (userIds.size > 0) {
            const progress = await db
              .collection("course_session_progress")
              .where("sessionId", "==", sessionDoc.id)
              .get();
            const batch = db.batch();
            for (const progressDoc of progress.docs) {
              const data = progressDoc.data();
              if (userIds.has(data.userId)) {
                const minutes = Math.round(
                  attendance
                    .filter((a) => a.email && attendeeEmails.has(a.email.toLowerCase()))
                    .reduce((sum, a) => sum + a.durationSeconds, 0) / 60
                );
                batch.set(
                  progressDoc.ref,
                  {
                    attended: true,
                    attendanceMinutes: minutes,
                    attendedAt: Timestamp.now(),
                  },
                  { merge: true }
                );
                matched += 1;
              }
            }
            await batch.commit();
          }
        }

        await sessionDoc.ref.set(
          {
            zoomAttendance: attendance,
            zoomAttendeeCount: attendance.length,
            zoomTotalMinutes: totalMinutes,
            zoomSyncedAt: Timestamp.now(),
            zoomResyncRequested: false,
          },
          { merge: true }
        );
        synced.push({ sessionId: sessionDoc.id, participants: attendance.length, matched });
      } catch (error) {
        errors.push({
          sessionId: sessionDoc.id,
          error: error instanceof Error ? error.message : "sync failed",
        });
      }
    }

    return NextResponse.json({ synced, errors, scanned: sessions.size });
  } catch (error) {
    console.error("[lms] zoom sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return runSync(request);
}

/** Vercel cron invokes GET. */
export async function GET(request: NextRequest) {
  return runSync(request);
}
