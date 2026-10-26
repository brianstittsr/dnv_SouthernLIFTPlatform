import { z } from "zod";
import { isSafePath } from "./mapping";

const key = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, "Keys use letters, numbers, and underscores");

const fieldTypes = [
  "short_text", "long_text", "email", "phone", "url", "number", "currency", "date", "datetime",
  "dropdown", "platform_lookup", "multi_select", "radio", "yes_no", "checkbox", "likert_scale", "nps",
  "rating_stars", "file_upload", "signature", "repeating_table", "calculated", "section_header", "statement",
] as const;

const targets = [
  "liftClients", "liftBaselines", "liftServicePlans", "liftSessions", "liftTrainingAttendance", "liftFeedback",
  "liftCapitalPackages", "liftCapabilityLibraries", "liftProposalResponses", "liftOutcomeClaims",
  "liftImpactConsents", "liftExits",
] as const;

const crosswalkKeys = [
  "owner.name", "owner.title", "owner.ethnicity", "business.name", "business.address", "business.city",
  "business.state", "business.zip", "business.parish", "business.website", "business.naics",
  "business.revenueBand", "business.annualRevenue", "business.employeesFullTime", "business.employeesPartTime",
  "business.applyingAs", "contact.email", "contact.phone", "contact.mobile", "ids.uei", "ids.cage",
  "certifications.current", "capabilities.summary", "needs.top", "needs.helpWanted", "business.acquisitionMethod",
  "teaming.open", "resources.toInvest", "operations.outOfState", "operations.inHouseBD", "agencies.target",
  "referral.source", "referral.by", "serviceArea.primary", "social.linkedin",
] as const;

export const formFieldSchema = z.object({
  id: z.string().min(1).max(64),
  key,
  label: z.string().min(1).max(5000),
  type: z.enum(fieldTypes),
  required: z.boolean(),
  helpText: z.string().max(4000).optional(),
  placeholder: z.string().max(300).optional(),
  options: z.array(z.string().min(1).max(300)).max(200).optional(),
  lookupSource: z.enum(["parishes", "service_areas", "advisors", "partners", "lift_clients", "events", "cohorts", "manual_list"]).optional(),
  scaleMin: z.number().int().min(0).max(10).optional(),
  scaleMax: z.number().int().min(1).max(10).optional(),
  scaleMinLabel: z.string().max(80).optional(),
  scaleMaxLabel: z.string().max(80).optional(),
  tableColumns: z
    .array(
      z.object({
        key,
        label: z.string().min(1).max(120),
        type: z.enum(["text", "number", "currency", "date", "dropdown"]),
        options: z.array(z.string().max(200)).max(100).optional(),
        required: z.boolean().optional(),
      })
    )
    .max(12)
    .optional(),
  formula: z.string().max(300).optional(),
  section: z.string().max(64).optional(),
  showIf: z
    .object({
      fieldKey: key,
      operator: z.enum(["equals", "not_equals", "includes", "is_true", "is_false", "answered"]),
      value: z.string().max(300).optional(),
    })
    .optional(),
  staffOnly: z.boolean().optional(),
  prefillKey: z.enum(crosswalkKeys).optional(),
  mappings: z
    .array(
      z.object({
        target: z.enum(targets),
        path: z.string().refine(isSafePath, "Use a dotted path such as business.revenue"),
        transform: z.enum(["none", "currency_to_cents", "split_csv", "boolean", "number"]).optional(),
      })
    )
    .max(5)
    .optional(),
  accept: z.array(z.string().max(160)).max(20).optional(),
  maxFiles: z.number().int().min(1).max(10).optional(),
  reportingCategory: z.enum(["dimension", "metric", "identifier", "open_text", "compliance_artifact"]).optional(),
  recommendedChartType: z.enum(["bar", "pie", "line", "kpi", "none"]).optional(),
});

/** Fields an admin may create or edit on a form definition. */
export const formDefinitionSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes").max(80),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).default(""),
    category: z.string().max(80).default("LIFT"),
    lifecycleRef: z.string().max(10).optional(),
    presentationMode: z.enum(["standard", "conversational"]),
    audience: z.enum(["public", "client", "staff"]),
    sections: z
      .array(z.object({ id: z.string().min(1).max(64), title: z.string().min(1).max(200), description: z.string().max(2000).optional(), staffOnly: z.boolean().optional() }))
      .max(30),
    fields: z.array(formFieldSchema).max(200),
    ombControlNumber: z.string().max(40).optional(),
    ombExpiresOn: z.string().max(20).optional(),
    consentText: z.string().max(10_000).optional(),
    submitLabel: z.string().max(60).optional(),
    completionMessage: z.string().max(2000).optional(),
    nextFormSlug: z.string().max(80).optional(),
    postProcess: z.array(z.enum(["intake_ai_summary", "outcome_claims", "proposal_award", "enrollment_consent", "rural_attestation"])).max(5).optional(),
    pdfConfig: z
      .object({
        enabled: z.boolean(),
        headerTitle: z.string().max(200),
        headerSubtitle: z.string().max(300),
        footerText: z.string().max(500),
        includeSignatureBlock: z.boolean(),
        includeTimestampAndAuditHash: z.boolean(),
      })
      .optional(),
  })
  .superRefine((form, context) => {
    const keys = new Set<string>();
    form.fields.forEach((field, index) => {
      if (keys.has(field.key)) context.addIssue({ code: "custom", path: ["fields", index, "key"], message: `Duplicate field key "${field.key}"` });
      keys.add(field.key);
    });
    form.fields.forEach((field, index) => {
      if (field.showIf && !keys.has(field.showIf.fieldKey)) {
        context.addIssue({ code: "custom", path: ["fields", index, "showIf"], message: `Show-if refers to unknown field "${field.showIf.fieldKey}"` });
      }
    });
  });

export type FormDefinitionInput = z.infer<typeof formDefinitionSchema>;
