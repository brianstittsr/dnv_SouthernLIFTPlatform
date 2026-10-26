/**
 * Logic checks for the LIFT Form Builder (no test runner in this repo).
 * Run: npx tsx scripts/verify-form-builder.ts
 * Exits non-zero when any check fails.
 */
import assert from "node:assert/strict";
import { buildPrefill, coercePrefillValue, extractCrosswalkValues, fromClientRegistration, fromUserProfile } from "../lib/form-builder/crosswalk";
import { formDefinitionSchema } from "../lib/form-builder/form-schema";
import { canonicalStringify, hashCanonical } from "../lib/form-builder/hash";
import { LIFT_FORM_TEMPLATES } from "../lib/form-builder/lift-templates";
import { computeFormula, evaluateArithmetic, evaluateShowIf, getVisibleFields } from "../lib/form-builder/logic";
import { applyTransform, buildTargetWrites, isSafePath } from "../lib/form-builder/mapping";
import type { FormField } from "../lib/form-builder/types";
import { validateFormValues } from "../lib/form-builder/validation";

let passed = 0;
const failures: string[] = [];

/** Runs one named check and records the result. */
function check(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const field = (key: string, type: FormField["type"], extra: Partial<FormField> = {}): FormField => ({ id: key, key, label: key, type, required: false, ...extra });

// Templates
check("all 14 Part B templates are present", () => assert.equal(LIFT_FORM_TEMPLATES.length, 14));
for (const template of LIFT_FORM_TEMPLATES) {
  check(`template ${template.slug} passes the form schema`, () => {
    const result = formDefinitionSchema.safeParse(template);
    assert.ok(result.success, result.success ? "" : JSON.stringify(result.error.issues.slice(0, 3)));
  });
  check(`template ${template.slug} sections exist for every field`, () => {
    const sectionIds = new Set(template.sections.map((section) => section.id));
    for (const item of template.fields) assert.ok(!item.section || sectionIds.has(item.section), `${item.key} -> ${item.section}`);
  });
  check(`template ${template.slug} mapping paths are safe`, () => {
    for (const item of template.fields) for (const mapping of item.mappings ?? []) assert.ok(isSafePath(mapping.path), `${item.key}: ${mapping.path}`);
  });
}
check("template slugs are unique", () => {
  const slugs = LIFT_FORM_TEMPLATES.map((template) => template.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});
check("nextFormSlug references an existing template", () => {
  const slugs = new Set(LIFT_FORM_TEMPLATES.map((template) => template.slug));
  for (const template of LIFT_FORM_TEMPLATES) if (template.nextFormSlug) assert.ok(slugs.has(template.nextFormSlug), template.nextFormSlug);
});
check("MBDA intake has a staff-only internal section and a signature", () => {
  const mbda = LIFT_FORM_TEMPLATES.find((template) => template.slug === "mbda-intake-loe");
  assert.ok(mbda?.sections.some((section) => section.id === "internal" && section.staffOnly));
  assert.ok(mbda?.fields.some((item) => item.type === "signature" && item.required));
  assert.equal(mbda?.ombControlNumber, "0640-0002");
});

// Show-if and visibility
check("show-if operators", () => {
  assert.equal(evaluateShowIf({ fieldKey: "a", operator: "is_true" }, { a: "yes" }), true);
  assert.equal(evaluateShowIf({ fieldKey: "a", operator: "is_true" }, { a: "no" }), false);
  assert.equal(evaluateShowIf({ fieldKey: "a", operator: "equals", value: "Awarded" }, { a: "Awarded" }), true);
  assert.equal(evaluateShowIf({ fieldKey: "a", operator: "includes", value: "x" }, { a: ["x", "y"] }), true);
  assert.equal(evaluateShowIf({ fieldKey: "a", operator: "answered" }, { a: "" }), false);
  assert.equal(evaluateShowIf(undefined, {}), true);
});
check("staff-only fields and sections are hidden from non-staff", () => {
  const fields = [field("a", "short_text"), field("b", "short_text", { staffOnly: true }), field("c", "short_text", { section: "internal" })];
  const visible = getVisibleFields(fields, {}, false, new Set(["internal"])).map((item) => item.key);
  assert.deepEqual(visible, ["a"]);
  assert.equal(getVisibleFields(fields, {}, true, new Set(["internal"])).length, 3);
});

// Formula evaluation
check("arithmetic evaluator", () => {
  assert.equal(evaluateArithmetic("2 + 3 * 4"), 14);
  assert.equal(evaluateArithmetic("(2 + 3) * 4"), 20);
  assert.equal(evaluateArithmetic("10 - -5"), 15);
  assert.equal(evaluateArithmetic("1 / 0"), null);
  assert.equal(evaluateArithmetic("2 + alert(1)"), null);
});
check("formula uses answers and returns null when inputs are missing", () => {
  assert.equal(computeFormula("{revenueLast12} - {baselineRevenue}", { revenueLast12: 150000, baselineRevenue: 100000 }), 50000);
  assert.equal(computeFormula("{revenueLast12} - {baselineRevenue}", { revenueLast12: 150000 }), null);
});

// Validation
const validationFields: FormField[] = [
  field("email", "email", { required: true }),
  field("seeking", "yes_no", { required: true }),
  field("amount", "currency", { required: true, showIf: { fieldKey: "seeking", operator: "is_true" } }),
  field("stage", "radio", { required: true, options: ["Idea", "Operating business"] }),
  field("consent", "checkbox", { required: true }),
  field("internalNote", "short_text", { staffOnly: true }),
  field("rows", "repeating_table", { tableColumns: [{ key: "lender", label: "Lender", type: "text", required: true }] }),
  field("rating", "nps"),
];
check("required, type, and option validation", () => {
  const result = validateFormValues(validationFields, [], { email: "bad", seeking: "yes", stage: "Other", consent: false }, { isStaff: false });
  assert.equal(result.ok, false);
  assert.ok(result.errors.email);
  assert.ok(result.errors.amount, "conditional required field enforced when visible");
  assert.ok(result.errors.stage);
  assert.ok(result.errors.consent);
});
check("hidden and staff-only answers are dropped", () => {
  const result = validateFormValues(
    validationFields,
    [],
    { email: "owner@example.com", seeking: "no", amount: 5000, stage: "Idea", consent: true, internalNote: "secret", rating: 9 },
    { isStaff: false }
  );
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal("amount" in result.values, false);
  assert.equal("internalNote" in result.values, false);
  assert.equal(result.values.rating, 9);
});
check("repeating table required columns and NPS range", () => {
  const result = validateFormValues(validationFields, [], { email: "a@b.co", seeking: "no", stage: "Idea", consent: true, rows: [{ lender: "" }], rating: 11 }, { isStaff: true });
  assert.ok(result.errors.rows);
  assert.ok(result.errors.rating);
});
check("signature requires a typed name or PNG drawing", () => {
  const signatureFields = [field("signature", "signature", { required: true })];
  assert.equal(validateFormValues(signatureFields, [], { signature: { mode: "typed", typedName: "" } }, { isStaff: false }).ok, false);
  assert.equal(validateFormValues(signatureFields, [], { signature: { mode: "typed", typedName: "Jane Owner" } }, { isStaff: false }).ok, true);
  assert.equal(validateFormValues(signatureFields, [], { signature: { mode: "drawn", dataUrl: "data:text/html,x" } }, { isStaff: false }).ok, false);
});
check("step-scoped validation only checks listed keys", () => {
  const result = validateFormValues(validationFields, [], { email: "a@b.co" }, { isStaff: false, onlyFieldKeys: ["email"] });
  assert.equal(result.ok, true);
});

// Mapping
check("mapping transforms", () => {
  assert.equal(applyTransform(1234.56, "currency_to_cents"), 123456);
  assert.deepEqual(applyTransform("332710, 541330", "split_csv"), ["332710", "541330"]);
  assert.equal(applyTransform("yes", "boolean"), true);
  assert.equal(applyTransform("abc", "number"), null);
});
check("mapping writes nested paths per target and rejects unsafe paths", () => {
  const fields = [
    field("revenue", "currency", { mappings: [{ target: "liftBaselines", path: "revenueLast12MonthsCents", transform: "currency_to_cents" }] }),
    field("parish", "short_text", { mappings: [{ target: "liftClients", path: "address.parish" }] }),
    field("evil", "short_text", { mappings: [{ target: "liftClients", path: "__proto__.polluted" }] }),
  ];
  const writes = buildTargetWrites(fields, { revenue: 100, parish: "Caddo", evil: "x" });
  assert.deepEqual(writes.liftBaselines, { revenueLast12MonthsCents: 10000 });
  assert.deepEqual(writes.liftClients, { address: { parish: "Caddo" } });
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

// Hashing
check("canonical hash ignores key order and changes with content", () => {
  assert.equal(canonicalStringify({ b: 1, a: [2, { d: 1, c: 2 }] }), '{"a":[2,{"c":2,"d":1}],"b":1}');
  assert.equal(hashCanonical({ a: 1, b: 2 }), hashCanonical({ b: 2, a: 1 }));
  assert.notEqual(hashCanonical({ a: 1 }), hashCanonical({ a: 2 }));
});

// Cross-walk prefill
check("client registration adapter maps A1/A2 fields", () => {
  const prefill = fromClientRegistration({
    firstName: "Jane",
    lastName: "Owner",
    companyName: "Bayou Fabrication LLC",
    companyEmail: "jane@bayoufab.com",
    naicsCodes: ["332710", "332312"],
    openToTeamingArrangement: true,
    minorityBusinessCertification: "None",
    howFoundKDMAssociates: "Referral",
  });
  assert.equal(prefill["owner.name"], "Jane Owner");
  assert.equal(prefill["business.naics"], "332710, 332312");
  assert.equal(prefill["teaming.open"], "yes");
  assert.equal(prefill["certifications.current"], undefined);
  assert.equal(prefill["referral.source"], "Referral");
});
check("user profile adapter strips NAICS descriptions", () => {
  const prefill = fromUserProfile({ company: "Acme", primaryNaics: ["541511 - Custom Computer Programming Services"], dunsUei: "ABC123" });
  assert.equal(prefill["business.naics"], "541511");
  assert.equal(prefill["ids.uei"], "ABC123");
});
check("prefill priority and coercion", () => {
  const fields = [
    field("businessName", "short_text", { prefillKey: "business.name" }),
    field("referralSource", "dropdown", { prefillKey: "referral.source", options: ["Referral", "Other"] }),
    field("certs", "multi_select", { prefillKey: "certifications.current", options: ["8(a)", "HUBZone"] }),
  ];
  const defaults = buildPrefill(fields, [{ "business.name": "From LIFT profile" }, { "business.name": "From registration", "referral.source": "Billboard", "certifications.current": ["HUBZone", "WOSB"] }]);
  assert.equal(defaults.businessName, "From LIFT profile");
  assert.equal(defaults.referralSource, undefined, "values outside the option list are not prefilled");
  assert.deepEqual(defaults.certs, ["HUBZone"]);
  assert.equal(coercePrefillValue(field("n", "number"), "42"), 42);
});
check("extracting cross-walk values skips empty answers", () => {
  const fields = [field("a", "short_text", { prefillKey: "business.name" }), field("b", "multi_select", { prefillKey: "certifications.current" })];
  assert.deepEqual(extractCrosswalkValues(fields, { a: "Acme", b: [] }), { "business.name": "Acme" });
});

console.log(`LIFT Form Builder checks: ${passed} passed, ${failures.length} failed`);
for (const failure of failures) console.error(`  FAIL ${failure}`);
if (failures.length) process.exit(1);
