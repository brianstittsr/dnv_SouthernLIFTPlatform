/**
 * Validates that a public interview request carries the httpOnly cookie
 * matching the session's server-side token (set at /start).
 */

import { NextRequest, NextResponse } from "next/server";
import { INTERVIEW_SESSION_COOKIE, type LiftInterviewSessionDoc } from "../types";
import { getSession } from "./repo";

export async function requireInterviewSession(
  request: NextRequest,
  sessionId: string,
  interviewId: string
): Promise<LiftInterviewSessionDoc | NextResponse> {
  const session = await getSession(sessionId);
  if (!session || session.interviewId !== interviewId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  const cookie = request.cookies.get(INTERVIEW_SESSION_COOKIE)?.value;
  if (!cookie || cookie !== session.sessionToken) {
    return NextResponse.json({ error: "Session expired — reload the interview link to continue" }, { status: 401 });
  }
  return session;
}
