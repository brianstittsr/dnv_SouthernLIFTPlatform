/**
 * One-time update: pushes the updated `lift-intake` (B1) template — now with the
 * `topNeeds` pick-list (top 5 Louisiana business needs) — into Firestore and
 * publishes a new form version. Mirrors POST /api/lift/forms/seed?overwrite=true
 * but scoped to B1 only, so staff edits to the other lifecycle forms are untouched.
 *
 * Run: npx tsx --env-file=.env.local scripts/update-b1-top-needs.ts
 */
import { formDefinitionSchema } from "../lib/form-builder/form-schema";
import { LIFT_FORM_TEMPLATES } from "../lib/form-builder/lift-templates";
import { writeAudit, type Requester } from "../lib/form-builder/server/context";
import { getFormBySlug, publishForm, saveFormDefinition } from "../lib/form-builder/server/forms-repo";

const SCRIPT_REQUESTER: Requester = {
  uid: "seed-script",
  email: null,
  name: "update-b1-top-needs script",
  isStaff: true,
  isAdmin: true,
  roles: ["platform_admin"],
};

async function main() {
  const template = LIFT_FORM_TEMPLATES.find((entry) => formDefinitionSchema.parse(entry).slug === "lift-intake");
  if (!template) throw new Error("lift-intake template not found");

  const definition = formDefinitionSchema.parse(template);
  const topNeedsField = definition.fields.find((f) => f.key === "topNeeds");
  console.log("topNeeds field:", JSON.stringify({ type: topNeedsField?.type, options: topNeedsField?.options?.length, maxItems: topNeedsField?.maxItems }));

  const existing = await getFormBySlug(definition.slug, true);
  const saved = await saveFormDefinition(definition, SCRIPT_REQUESTER, existing?.id);
  const published = await publishForm(saved.id, SCRIPT_REQUESTER);
  await writeAudit("forms.seeded", "lift-templates", SCRIPT_REQUESTER, {
    results: [{ slug: definition.slug, action: existing ? "updated" : "created", version: published.version }],
  });
  console.log(`${definition.slug}: ${existing ? "updated" : "created"} → published version ${published.version}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
