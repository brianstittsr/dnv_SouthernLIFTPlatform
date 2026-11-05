import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { recordSessionProgress } from "@/lib/lms/server/journey";

const progressSchema = z.object({
  courseId: z.string().min(1).max(128),
  moduleId: z.string().min(1).max(128),
  action: z.enum(["access", "complete"]),
  timeSpentSeconds: z.number().int().min(0).max(86_400).optional(),
});

/**
 * POST /api/lms/sessions/[id]/progress — records a session view or completion
 * and advances the member's course progress (server-side so completion can
 * safely issue certificates).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const { id } = await params;

    const parsed = progressSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid request body", 400);

    const result = await recordSessionProgress(
      requester.uid,
      parsed.data.courseId,
      id,
      parsed.data.moduleId,
      parsed.data.action,
      parsed.data.timeSpentSeconds ?? 0
    );
    if (!result.ok) return jsonError(result.error ?? "Progress update failed", 403);

    return NextResponse.json({
      data: { progressPercentage: result.progressPercentage, completed: result.completed },
    });
  } catch (error) {
    return handleRouteError(error, "Record session progress failed");
  }
}
