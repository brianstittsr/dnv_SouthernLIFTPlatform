import { NextRequest, NextResponse } from "next/server";
import { formDefinitionSchema } from "@/lib/form-builder/form-schema";
import { writeAudit } from "@/lib/form-builder/server/context";
import { listForms, saveFormDefinition } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";

/** GET /api/lift/forms - list all LIFT forms (admin). */
export async function GET() {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    return NextResponse.json({ data: await listForms() });
  } catch (error) {
    return handleRouteError(error, "List LIFT forms failed");
  }
}

/** POST /api/lift/forms - create a form definition (admin). */
export async function POST(request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const parsed = formDefinitionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid form definition", issues: parsed.error.issues }, { status: 400 });
    const form = await saveFormDefinition(parsed.data, requester);
    await writeAudit("form.created", form.id, requester, { slug: form.slug });
    return NextResponse.json({ data: form }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("A form with slug")) return NextResponse.json({ error: error.message }, { status: 409 });
    return handleRouteError(error, "Create LIFT form failed");
  }
}
