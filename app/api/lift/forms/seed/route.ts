import { NextRequest, NextResponse } from "next/server";
import { formDefinitionSchema } from "@/lib/form-builder/form-schema";
import { LIFT_FORM_TEMPLATES } from "@/lib/form-builder/lift-templates";
import { writeAudit } from "@/lib/form-builder/server/context";
import { getFormBySlug, publishForm, saveFormDefinition } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";

/**
 * POST /api/lift/forms/seed - create the LIFT lifecycle forms (B1-B10) that do not exist yet,
 * and publish them. Existing forms are left unchanged unless ?overwrite=true (admin).
 */
export async function POST(request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const overwrite = request.nextUrl.searchParams.get("overwrite") === "true";
    const results: { slug: string; action: "created" | "updated" | "skipped"; version?: number }[] = [];
    for (const template of LIFT_FORM_TEMPLATES) {
      const definition = formDefinitionSchema.parse(template);
      const existing = await getFormBySlug(definition.slug, true);
      if (existing && !overwrite) {
        results.push({ slug: definition.slug, action: "skipped", version: existing.version });
        continue;
      }
      const saved = await saveFormDefinition(definition, requester, existing?.id);
      const published = await publishForm(saved.id, requester);
      results.push({ slug: definition.slug, action: existing ? "updated" : "created", version: published.version });
    }
    await writeAudit("forms.seeded", "lift-templates", requester, { results });
    return NextResponse.json({ data: results });
  } catch (error) {
    return handleRouteError(error, "Seed LIFT forms failed");
  }
}
