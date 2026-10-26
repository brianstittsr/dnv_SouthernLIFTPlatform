import type { FormFieldType, LookupSource } from "./types";

/** Display metadata for each control in the Form Studio palette. */
export interface ControlDefinition {
  type: FormFieldType;
  label: string;
  group: "Basic" | "Choice" | "Survey" | "Documents & Legal" | "Layout";
  description: string;
  /** Whether the control stores an answer. */
  hasValue: boolean;
}

export const CONTROL_CATALOG: readonly ControlDefinition[] = [
  { type: "short_text", label: "Short text", group: "Basic", description: "Single-line answer", hasValue: true },
  { type: "long_text", label: "Long text", group: "Basic", description: "Paragraph answer", hasValue: true },
  { type: "email", label: "Email", group: "Basic", description: "Validated email address", hasValue: true },
  { type: "phone", label: "Phone", group: "Basic", description: "Phone number", hasValue: true },
  { type: "url", label: "Website / URL", group: "Basic", description: "Web address", hasValue: true },
  { type: "number", label: "Number", group: "Basic", description: "Whole or decimal number", hasValue: true },
  { type: "currency", label: "Currency", group: "Basic", description: "US dollar amount", hasValue: true },
  { type: "date", label: "Date", group: "Basic", description: "Calendar date", hasValue: true },
  { type: "datetime", label: "Date & time", group: "Basic", description: "Date with time", hasValue: true },
  { type: "dropdown", label: "Dropdown", group: "Choice", description: "Pick one from a list", hasValue: true },
  { type: "radio", label: "Radio buttons", group: "Choice", description: "Pick one, all options visible", hasValue: true },
  { type: "multi_select", label: "Multi-select", group: "Choice", description: "Pick any number", hasValue: true },
  { type: "yes_no", label: "Yes / No", group: "Choice", description: "Yes or no answer", hasValue: true },
  { type: "checkbox", label: "Checkbox / consent", group: "Choice", description: "Single agreement checkbox", hasValue: true },
  { type: "platform_lookup", label: "Platform lookup", group: "Choice", description: "Pick from live platform data", hasValue: true },
  { type: "likert_scale", label: "Likert scale", group: "Survey", description: "Agreement scale (1-5 or 1-7)", hasValue: true },
  { type: "nps", label: "Net Promoter Score", group: "Survey", description: "0-10 likelihood to recommend", hasValue: true },
  { type: "rating_stars", label: "Star rating", group: "Survey", description: "1-5 stars", hasValue: true },
  { type: "file_upload", label: "File upload", group: "Documents & Legal", description: "Upload documents or images", hasValue: true },
  { type: "signature", label: "Signature", group: "Documents & Legal", description: "Drawn or typed signature", hasValue: true },
  { type: "repeating_table", label: "Repeating table", group: "Documents & Legal", description: "Multiple rows of line items", hasValue: true },
  { type: "calculated", label: "Calculated", group: "Documents & Legal", description: "Formula from other answers", hasValue: true },
  { type: "section_header", label: "Section header", group: "Layout", description: "Heading inside a section", hasValue: false },
  { type: "statement", label: "Statement / disclosure", group: "Layout", description: "Read-only text block", hasValue: false },
] as const;

/** Returns true when a field type stores an answer. */
export function fieldHasValue(type: FormFieldType): boolean {
  return CONTROL_CATALOG.find((control) => control.type === type)?.hasValue ?? true;
}

export const LOOKUP_SOURCES: readonly { value: LookupSource; label: string; staffOnly: boolean }[] = [
  { value: "parishes", label: "Louisiana parishes", staffOnly: false },
  { value: "service_areas", label: "LIFT service areas", staffOnly: false },
  { value: "events", label: "Events & workshops", staffOnly: false },
  { value: "cohorts", label: "Cohorts", staffOnly: false },
  { value: "partners", label: "Partner organizations", staffOnly: false },
  { value: "advisors", label: "Advisors (staff)", staffOnly: true },
  { value: "lift_clients", label: "LIFT clients (staff)", staffOnly: true },
  { value: "manual_list", label: "Manual list (use options)", staffOnly: false },
] as const;

/** LIFT service areas (categories used across intake, plans, and sessions). */
export const LIFT_SERVICE_AREAS = [
  "Business Formation & Entrepreneurship",
  "Capital Readiness",
  "Procurement Readiness (CMMC / HUBZone / Opportunity Zones / Mentor-Protege)",
  "Advanced Manufacturing (AM Lab)",
  "Digital & AI Adoption",
  "Agriculture & Rural Enterprise",
] as const;

/** The 64 Louisiana parishes. */
export const LOUISIANA_PARISHES = [
  "Acadia", "Allen", "Ascension", "Assumption", "Avoyelles", "Beauregard", "Bienville", "Bossier",
  "Caddo", "Calcasieu", "Caldwell", "Cameron", "Catahoula", "Claiborne", "Concordia", "De Soto",
  "East Baton Rouge", "East Carroll", "East Feliciana", "Evangeline", "Franklin", "Grant", "Iberia",
  "Iberville", "Jackson", "Jefferson", "Jefferson Davis", "Lafayette", "Lafourche", "LaSalle", "Lincoln",
  "Livingston", "Madison", "Morehouse", "Natchitoches", "Orleans", "Ouachita", "Plaquemines",
  "Pointe Coupee", "Rapides", "Red River", "Richland", "Sabine", "St. Bernard", "St. Charles",
  "St. Helena", "St. James", "St. John the Baptist", "St. Landry", "St. Martin", "St. Mary",
  "St. Tammany", "Tangipahoa", "Tensas", "Terrebonne", "Union", "Vermilion", "Vernon", "Washington",
  "Webster", "West Baton Rouge", "West Carroll", "West Feliciana", "Winn",
] as const;

/** Allowed upload types and size limit for form attachments. */
export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_SIGNATURE_BYTES = 300 * 1024;
