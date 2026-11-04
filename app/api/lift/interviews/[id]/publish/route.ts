import { NextRequest, NextResponse } from "next/server";
import { writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { getInterview, publishInterview } from "@/lib/interview/server/repo";

/** POST /api/lift/interviews/[id]/publish - publish a new interview version. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const existing = await getInterview(id);
    if (!existing) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    if (!existing.title.trim()) return NextResponse.json({ error: "A title is required before publishing" }, { status: 400 });
    const interview = await publishInterview(id);
    await writeAudit("interview.published", id, requester, { version: interview?.version });
    return NextResponse.json({ data: interview });
  } catch (error) {
    return handleRouteError(error, "Publish interview failed");
  }
}
