import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester, requireStaffRequester } from "@/lib/form-builder/server/route-helpers";
import { getInterview, incrementInterviewCounter, listInvites } from "@/lib/interview/server/repo";
import { sendInvites } from "@/lib/interview/server/invites";

const sendSchema = z.object({
  recipients: z
    .array(
      z.object({
        name: z.string().max(200).default(""),
        email: z.string().email().max(320),
      })
    )
    .min(1)
    .max(50),
});

/** GET /api/lift/interviews/[id]/invites - invite delivery status (staff). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireStaffRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    return NextResponse.json({ data: await listInvites(id) });
  } catch (error) {
    return handleRouteError(error, "List invites failed");
  }
}

/** POST /api/lift/interviews/[id]/invites - create + send interview invites (admin). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const interview = await getInterview(id);
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    if (interview.status !== "published") {
      return NextResponse.json({ error: "Publish the interview before sending invites" }, { status: 400 });
    }

    const parsed = sendSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid recipients — provide 1-50 {name, email} entries" }, { status: 400 });

    const results = await sendInvites(interview, parsed.data.recipients, requester);
    await incrementInterviewCounter(id, "invitesSent", results.length);
    await writeAudit("interview.invitesSent", id, requester, { count: results.length, failed: results.filter((r) => !r.emailSent).length });
    return NextResponse.json({ data: results }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Send invites failed");
  }
}
