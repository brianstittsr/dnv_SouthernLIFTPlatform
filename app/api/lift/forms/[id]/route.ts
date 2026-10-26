import { NextRequest, NextResponse } from "next/server";
import { formDefinitionSchema } from "@/lib/form-builder/form-schema";
import { jsonError, writeAudit } from "@/lib/form-builder/server/context";
import { getFormById, saveFormDefinition } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";

type Params = { params: Promise<{ id: string }> };

/** GET /api/lift/forms/[id] - full form definition including mappings (admin). */
export async function GET(_request: NextRequest, { params }: Params) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const form = await getFormById((await params).id);
    return form ? NextResponse.json({ data: form }) : jsonError("Form not found", 404);
  } catch (error) {
    return handleRouteError(error, "Get LIFT form failed");
  }
}

/** PATCH /api/lift/forms/[id] - replace the definition; the form returns to draft until republished (admin). */
export async function PATCH(request: NextRequest, { params }: Params) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const parsed = formDefinitionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid form definition", issues: parsed.error.issues }, { status: 400 });
    const form = await saveFormDefinition(parsed.data, requester, id);
    await writeAudit("form.updated", id, requester, { slug: form.slug });
    return NextResponse.json({ data: form });
  } catch (error) {
    if (error instanceof Error && error.message === "Form not found") return jsonError("Form not found", 404);
    if (error instanceof Error && error.message.startsWith("A form with slug")) return jsonError(error.message, 409);
    return handleRouteError(error, "Update LIFT form failed");
  }
}
