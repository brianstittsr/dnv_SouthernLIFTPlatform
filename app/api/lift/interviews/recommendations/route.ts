import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { INTERVIEW_PROMPT_RECOMMENDATIONS } from "@/lib/interview/recommendations";

/** GET /api/lift/interviews/recommendations?domain=... - curated prompt recommendations (admin). */
export async function GET(request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const domain = request.nextUrl.searchParams.get("domain");
    const data = domain ? INTERVIEW_PROMPT_RECOMMENDATIONS.filter((r) => r.domain === domain) : INTERVIEW_PROMPT_RECOMMENDATIONS;
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, "List prompt recommendations failed");
  }
}
