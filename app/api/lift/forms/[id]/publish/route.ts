import { NextRequest, NextResponse } from "next/server";
import { jsonError, writeAudit } from "@/lib/form-builder/server/context";
import { publishForm } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";

/** POST /api/lift/forms/[id]/publish - publish a new immutable version (admin). */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const form = await publishForm(id, requester);
    await writeAudit("form.published", id, requester, { slug: form.slug, version: form.version });
    return NextResponse.json({ data: form });
  } catch (error) {
    if (error instanceof Error && error.message === "Form not found") return jsonError("Form not found", 404);
    return handleRouteError(error, "Publish LIFT form failed");
  }
}
