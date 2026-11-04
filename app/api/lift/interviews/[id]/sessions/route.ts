import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requireStaffRequester } from "@/lib/form-builder/server/route-helpers";
import { listSessions } from "@/lib/interview/server/repo";
import type { LiftInterviewSessionDoc } from "@/lib/interview/types";

/** GET /api/lift/interviews/[id]/sessions - completed + in-progress sessions (staff). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireStaffRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    // Strip the server-side session token before returning rows.
    const sessions = (await listSessions(id)).map(({ sessionToken: _t, ...rest }: LiftInterviewSessionDoc) => rest);
    return NextResponse.json({ data: sessions });
  } catch (error) {
    return handleRouteError(error, "List sessions failed");
  }
}
