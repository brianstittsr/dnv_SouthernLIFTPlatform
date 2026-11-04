import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requireStaffRequester } from "@/lib/form-builder/server/route-helpers";
import { getSession } from "@/lib/interview/server/repo";

/** GET /api/lift/interviews/[id]/sessions/[sessionId] - transcript + evaluation (staff). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const requester = await requireStaffRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id, sessionId } = await params;
    const session = await getSession(sessionId);
    if (!session || session.interviewId !== id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const { sessionToken: _t, ...safe } = session;
    return NextResponse.json({ data: safe });
  } catch (error) {
    return handleRouteError(error, "Get session failed");
  }
}
