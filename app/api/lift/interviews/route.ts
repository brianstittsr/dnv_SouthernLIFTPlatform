import { NextRequest, NextResponse } from "next/server";
import { writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { interviewConfigSchema } from "@/lib/interview/types";
import { createInterview, listInterviews } from "@/lib/interview/server/repo";

/** GET /api/lift/interviews - list AI interviews (admin). */
export async function GET() {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    return NextResponse.json({ data: await listInterviews() });
  } catch (error) {
    return handleRouteError(error, "List interviews failed");
  }
}

/** POST /api/lift/interviews - create an AI interview (admin). */
export async function POST(request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const parsed = interviewConfigSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid interview configuration", issues: parsed.error.issues }, { status: 400 });
    const interview = await createInterview(parsed.data, requester);
    await writeAudit("interview.created", interview.id, requester, { title: interview.title });
    return NextResponse.json({ data: interview }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Create interview failed");
  }
}
