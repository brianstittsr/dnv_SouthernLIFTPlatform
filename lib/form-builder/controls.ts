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
  { type: "option_picker", label: "Searchable multi-select", group: "Choice", description: "Search options and add each with a button", hasValue: true },
  { type: "text_list", label: "Item list", group: "Basic", description: "Free-text items added one per line", hasValue: true },
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

/**
 * NAICS options for `option_picker` fields — "code - label" strings.
 * Covers the sectors most common among LIFT rural-business clients.
 */
export const NAICS_OPTIONS = [
  // Agriculture, forestry, fishing (11)
  "111 - Crop Production",
  "112 - Animal Production and Aquaculture",
  "113 - Forestry and Logging",
  "115 - Support Activities for Agriculture and Forestry",
  // Construction (23)
  "236 - Construction of Buildings",
  "237 - Heavy and Civil Engineering Construction",
  "238 - Specialty Trade Contractors",
  // Manufacturing (31-33)
  "311 - Food Manufacturing",
  "312 - Beverage and Tobacco Product Manufacturing",
  "313 - Textile Mills",
  "314 - Textile Product Mills",
  "315 - Apparel Manufacturing",
  "316 - Leather and Allied Product Manufacturing",
  "321 - Wood Product Manufacturing",
  "322 - Paper Manufacturing",
  "323 - Printing and Related Support Activities",
  "324 - Petroleum and Coal Products Manufacturing",
  "325 - Chemical Manufacturing",
  "326 - Plastics and Rubber Products Manufacturing",
  "327 - Nonmetallic Mineral Product Manufacturing",
  "331 - Primary Metal Manufacturing",
  "332 - Fabricated Metal Product Manufacturing",
  "333 - Machinery Manufacturing",
  "334 - Computer and Electronic Product Manufacturing",
  "335 - Electrical Equipment, Appliance, and Component Manufacturing",
  "336 - Transportation Equipment Manufacturing",
  "337 - Furniture and Related Product Manufacturing",
  "339 - Miscellaneous Manufacturing",
  // Wholesale & retail (42, 44-45)
  "423 - Merchant Wholesalers, Durable Goods",
  "424 - Merchant Wholesalers, Nondurable Goods",
  "441 - Motor Vehicle and Parts Dealers",
  "444 - Building Material and Garden Equipment Dealers",
  "445 - Food and Beverage Stores",
  "452 - General Merchandise Stores",
  "454 - Nonstore Retailers (online sales)",
  // Transportation & warehousing (48-49)
  "484 - Truck Transportation",
  "493 - Warehousing and Storage",
  // Information & professional services (51, 54)
  "511 - Publishing Industries",
  "541511 - Custom Computer Programming Services",
  "541512 - Computer Systems Design Services",
  "541513 - Computer Facilities Management Services",
  "541519 - Other Computer Related Services",
  "541611 - Administrative Management Consulting",
  "541612 - Human Resources Consulting",
  "541613 - Marketing Consulting",
  "541614 - Process, Physical Distribution, and Logistics Consulting",
  "541618 - Other Management Consulting",
  "541690 - Other Scientific and Technical Consulting",
  "541990 - All Other Professional, Scientific, and Technical Services",
  // Administrative services (56)
  "561110 - Office Administrative Services",
  "561210 - Facilities Support Services",
  "561320 - Temporary Help Services",
  "561499 - All Other Business Support Services",
  "5617 - Services to Buildings and Dwellings (janitorial, landscaping)",
  // Education & health (61, 62)
  "611 - Educational Services",
  "621 - Ambulatory Health Care Services",
  "624 - Social Assistance (child care, community services)",
  // Hospitality & other services (71, 72, 81)
  "711 - Performing Arts, Spectator Sports, and Related Industries",
  "721 - Accommodation (hotels, B&Bs)",
  "722 - Food Services and Drinking Places",
  "811 - Repair and Maintenance",
  "812 - Personal and Laundry Services",
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
