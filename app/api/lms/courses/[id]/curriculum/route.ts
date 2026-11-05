import { NextRequest, NextResponse } from "next/server";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { getMemberCurriculum } from "@/lib/lms/server/journey";

/**
 * GET /api/lms/courses/[id]/curriculum — enrolled members only.
 * Returns modules + sessions with content URLs and per-session completion.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const { id } = await params;

    const curriculum = await getMemberCurriculum(requester.uid, id);
    if (!curriculum) return jsonError("Not enrolled in this course", 403);

    return NextResponse.json({
      data: {
        membership: {
          id: curriculum.membership.id,
          status: curriculum.membership.status ?? "active",
          progressPercentage: curriculum.membership.progressPercentage ?? 0,
          completedSessions: curriculum.membership.completedSessions ?? 0,
          totalSessions: curriculum.membership.totalSessions ?? 0,
        },
        modules: curriculum.modules,
      },
    });
  } catch (error) {
    return handleRouteError(error, "Load curriculum failed");
  }
}
