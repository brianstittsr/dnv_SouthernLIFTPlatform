/**
 * Re-seeds the LIFT lifecycle forms from LIFT_FORM_TEMPLATES (overwrite),
 * mirroring POST /api/lift/forms/seed?overwrite=true.
 * Run: npx tsx --env-file=.env.local scripts/reseed-lift-forms.ts
 */
import { formDefinitionSchema } from "../lib/form-builder/form-schema";
import { LIFT_FORM_TEMPLATES } from "../lib/form-builder/lift-templates";
import { getFormBySlug, publishForm, saveFormDefinition } from "../lib/form-builder/server/forms-repo";
import { writeAudit, type Requester } from "../lib/form-builder/server/context";

async function main() {
  const requester: Requester = { uid: "reseed-script", email: null, name: "reseed-script", isStaff: true, isAdmin: true };
  for (const template of LIFT_FORM_TEMPLATES) {
    const definition = formDefinitionSchema.parse(template);
    const existing = await getFormBySlug(definition.slug, true);
    const saved = await saveFormDefinition(definition, requester, existing?.id);
    const published = await publishForm(saved.id, requester);
    console.log(`${definition.slug}: ${existing ? `v${existing.version} -> ` : "created "}v${published.version} (${existing ? "updated" : "created"})`);
  }
  await writeAudit("forms.seeded", "lift-templates", requester, { via: "scripts/reseed-lift-forms.ts" });
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
