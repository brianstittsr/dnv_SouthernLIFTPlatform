import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { interviewConfigSchema } from "@/lib/interview/types";
import { getInterview, setInterviewStatus, setPublicLinkEnabled, updateInterview } from "@/lib/interview/server/repo";

const patchSchema = z.object({
  config: interviewConfigSchema.optional(),
  action: z.enum(["archive"]).optional(),
  publicLinkEnabled: z.boolean().optional(),
});

/** GET /api/lift/interviews/[id] - fetch one interview (admin). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const interview = await getInterview(id);
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    return NextResponse.json({ data: interview });
  } catch (error) {
    return handleRouteError(error, "Get interview failed");
  }
}

/**
 * PATCH /api/lift/interviews/[id] — save config edits (editing a published
 * interview returns it to draft), toggle the public link, or archive.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const parsed = patchSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { config, action, publicLinkEnabled } = parsed.data;

    const existing = await getInterview(id);
    if (!existing) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    if (config) {
      const updated = await updateInterview(id, config);
      await writeAudit("interview.updated", id, requester, { title: config.title });
      return NextResponse.json({ data: updated });
    }
    if (typeof publicLinkEnabled === "boolean") {
      if (publicLinkEnabled && existing.status !== "published") {
        return NextResponse.json({ error: "Publish the interview before enabling the public link" }, { status: 400 });
      }
      await setPublicLinkEnabled(id, publicLinkEnabled);
      await writeAudit("interview.publicLink", id, requester, { enabled: publicLinkEnabled });
      return NextResponse.json({ data: await getInterview(id) });
    }
    if (action === "archive") {
      await setInterviewStatus(id, "archived");
      await writeAudit("interview.archived", id, requester);
      return NextResponse.json({ data: { archived: true } });
    }
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error, "Update interview failed");
  }
}
