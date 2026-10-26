import { z } from "zod";
import { fieldHasValue } from "./controls";
import { computeFormula, getVisibleFields, isAnswered } from "./logic";
import type { FieldValue, FormField, FormSection, FormValues } from "./types";

export interface ValidationResult {
  ok: boolean;
  /** Answers for visible, value-bearing fields only (hidden and staff-only answers removed). */
  values: FormValues;
  errors: Record<string, string>;
}

const uploadRefSchema = z.object({
  uploadId: z.string().min(1).max(120),
  fileName: z.string().min(1).max(260),
  contentType: z.string().min(1).max(160),
  sizeBytes: z.number().int().nonnegative(),
});

const signatureSchema = z
  .object({
    mode: z.enum(["drawn", "typed"]),
    dataUrl: z.string().max(450_000).optional(),
    typedName: z.string().max(200).optional(),
  })
  .refine((value) => (value.mode === "drawn" ? Boolean(value.dataUrl?.startsWith("data:image/png;base64,")) : Boolean(value.typedName?.trim())), {
    message: "Please sign before continuing",
  });

/** Builds the Zod schema for one field's answer (required handled separately). */
function schemaForField(field: FormField): z.ZodType<FieldValue> {
  const options = field.options ?? [];
  const optionCheck = (value: string) => options.length === 0 || field.lookupSource !== undefined || options.includes(value);
  switch (field.type) {
    case "email":
      return z.string().trim().max(320).email("Enter a valid email address");
    case "url":
      return z.string().trim().max(500).regex(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i, "Enter a valid web address");
    case "phone":
      return z.string().trim().max(40).regex(/^[+()\d\s.-]{7,}$/, "Enter a valid phone number");
    case "short_text":
      return z.string().trim().max(500);
    case "long_text":
      return z.string().trim().max(10_000);
    case "number":
    case "currency":
    case "calculated":
      return z.coerce.number().refine(Number.isFinite, "Enter a number").refine((value) => field.type !== "currency" || value >= 0, "Amount cannot be negative");
    case "date":
      return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");
    case "datetime":
      return z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Enter a valid date and time");
    case "dropdown":
    case "radio":
    case "platform_lookup":
      return z.string().trim().max(500).refine(optionCheck, "Choose one of the listed options");
    case "multi_select":
      return z.array(z.string().max(500)).max(100).refine((list) => list.every(optionCheck), "Choose from the listed options");
    case "yes_no":
      return z.enum(["yes", "no"]);
    case "checkbox":
      return z.boolean();
    case "likert_scale":
    case "rating_stars":
    case "nps": {
      const min = field.type === "nps" ? 0 : field.scaleMin ?? 1;
      const max = field.type === "nps" ? 10 : field.type === "rating_stars" ? 5 : field.scaleMax ?? 5;
      return z.coerce.number().int().min(min).max(max);
    }
    case "file_upload":
      return z.array(uploadRefSchema).max(field.maxFiles ?? 5);
    case "signature":
      return signatureSchema as unknown as z.ZodType<FieldValue>;
    case "repeating_table":
      return z.array(z.record(z.string(), z.union([z.string().max(2000), z.number(), z.null()]))).max(100);
    default:
      return z.any();
  }
}

/** Validates repeating-table rows against required columns. */
function validateTableRows(field: FormField, rows: FieldValue): string | null {
  if (!Array.isArray(rows)) return null;
  const requiredColumns = (field.tableColumns ?? []).filter((column) => column.required);
  for (const [index, row] of (rows as Record<string, unknown>[]).entries()) {
    for (const column of requiredColumns) {
      const cell = row[column.key];
      if (cell === null || cell === undefined || String(cell).trim() === "") {
        return `Row ${index + 1}: ${column.label} is required`;
      }
    }
  }
  return null;
}

/**
 * Validates answers for a form. Hidden fields (show-if false, or staff-only for
 * non-staff) are dropped so they can never be submitted.
 */
export function validateFormValues(
  fields: FormField[],
  sections: FormSection[],
  rawValues: FormValues,
  options: { isStaff: boolean; onlyFieldKeys?: string[] }
): ValidationResult {
  const staffSectionIds = new Set(sections.filter((section) => section.staffOnly).map((section) => section.id));
  const working: FormValues = { ...rawValues };

  for (const field of fields) {
    if (field.type === "calculated") working[field.key] = computeFormula(field.formula, working);
  }

  const visible = getVisibleFields(fields, working, options.isStaff, staffSectionIds).filter((field) => fieldHasValue(field.type));
  const scoped = options.onlyFieldKeys ? visible.filter((field) => options.onlyFieldKeys?.includes(field.key)) : visible;
  const errors: Record<string, string> = {};
  const values: FormValues = {};

  for (const field of scoped) {
    const value = working[field.key];
    if (!isAnswered(value)) {
      if (field.required && field.type !== "calculated") {
        errors[field.key] = field.type === "checkbox" ? "This confirmation is required" : `${field.label} is required`;
      }
      continue;
    }
    const parsed = schemaForField(field).safeParse(value);
    if (!parsed.success) {
      errors[field.key] = parsed.error.issues[0]?.message ?? "Invalid answer";
      continue;
    }
    if (field.type === "repeating_table") {
      const tableError = validateTableRows(field, parsed.data);
      if (tableError) {
        errors[field.key] = tableError;
        continue;
      }
    }
    values[field.key] = parsed.data;
  }

  return { ok: Object.keys(errors).length === 0, values, errors };
}
