/**
 * Shared spec for the downloadable LIFT client onboarding worksheet (.docx)
 * and for parsing a completed worksheet back into wizard field values.
 *
 * The spec is the single source of truth: the same `key`s are smeFormData
 * keys in components/onboarding/sme-wizard-steps.tsx, the same labels are
 * written into the generated .docx and matched when parsing an upload.
 */
import { LIFT_SERVICE_AREAS, NAICS_OPTIONS } from "@/lib/form-builder/controls";

export type WorksheetKind =
  | "text"
  | "yesno"
  | "bool"
  | "number"
  | "choice"
  | "list"
  | "contacts";

export interface WorksheetField {
  /** smeFormData key. */
  key: string;
  /** Exact label written into the document, followed by ": ". */
  label: string;
  kind: WorksheetKind;
  /** Short parenthetical guidance shown inside the label line. */
  hint?: string;
  /** Options for choice/list fuzzy matching. */
  options?: readonly string[];
}

export interface WorksheetSection {
  title: string;
  fields: WorksheetField[];
}

const ENTITY_OPTIONS = [
  "Sole proprietorship", "LLC", "Corporation", "S corporation",
  "Partnership", "Nonprofit", "Not registered yet", "Other",
];
const STAGE_OPTIONS = [
  "Idea", "Startup (under 2 years)", "Operating business", "Growing / expanding",
];
const EMPLOYEE_OPTIONS = [
  "0 - just the owner(s)", "1-4", "5-9", "10-19", "20-49", "50-99", "100 or more",
];
const ACQUISITION_OPTIONS = [
  "Word of mouth", "Referrals", "Website / online", "Social media",
  "Bids and solicitations", "Networking events", "Other",
];
const REFERRAL_OPTIONS = [
  "Southern University", "Small Business Development Center (SBDC)",
  "Partner organization", "Event or workshop", "Social media", "Radio",
  "Referral from another business", "Web search", "Other",
];
const ETHNICITY_OPTIONS = [
  "Black or African American", "Hispanic or Latino", "Asian",
  "Native American or Alaska Native", "Native Hawaiian or Pacific Islander",
  "Multi-ethnic", "White", "Other",
];
const PREFERRED_SERVICE_OPTIONS = [
  "One-on-one counseling", "Workshops and training", "Capital readiness",
  "Government contracting", "Advanced Manufacturing program", "Digital and AI adoption",
];
const DIGITAL_TOOL_OPTIONS = [
  "Website", "E-commerce / online sales", "Accounting software",
  "CRM", "Social media", "AI tools", "None",
];
const SERVICE_AREA_OPTIONS = [...LIFT_SERVICE_AREAS, "Not sure yet"];

/** certification keyword → smeFormData id */
const CERT_IDS: [RegExp, string][] = [
  [/8\s*\(?a\)?/i, "8a"],
  [/edwosb/i, "edwosb"],
  [/wosb|women/i, "wosb"],
  [/sdvosb|veteran/i, "sdvosb"],
  [/hubzone/i, "hubzone"],
  [/\bdbe\b|disadvantaged/i, "dbe"],
  [/\bmbe\b|minority/i, "mbe"],
  [/other/i, "other"],
];

export const WORKSHEET_SECTIONS: WorksheetSection[] = [
  {
    title: "Your business",
    fields: [
      { key: "businessNotRegistered", label: "Business not registered yet (yes/no)", kind: "bool" },
      { key: "companyName", label: "Business legal name", kind: "text" },
      { key: "dba", label: "Trade name / DBA (if different)", kind: "text" },
      { key: "applyingAs", label: "Business entity type", kind: "choice", options: ENTITY_OPTIONS, hint: "e.g. LLC, Sole proprietorship, Corporation" },
      { key: "address", label: "Street address", kind: "text" },
      { key: "city", label: "City", kind: "text" },
      { key: "state", label: "State", kind: "text" },
      { key: "zip", label: "ZIP code", kind: "text" },
      { key: "website", label: "Website", kind: "text" },
      { key: "yearEstablished", label: "Year established", kind: "text" },
      { key: "employeeCount", label: "Full-time employees including owners", kind: "choice", options: EMPLOYEE_OPTIONS, hint: "e.g. 1-4" },
      { key: "stage", label: "Business stage", kind: "choice", options: STAGE_OPTIONS, hint: "Idea / Startup / Operating / Growing" },
      { key: "revenueLast12", label: "Revenue last 12 months (USD)", kind: "number" },
    ],
  },
  {
    title: "What you sell",
    fields: [
      { key: "primaryNaics", label: "NAICS code(s)", kind: "list", options: NAICS_OPTIONS, hint: "comma-separated, e.g. 331110, 541511" },
      { key: "productsServices", label: "Products and services", kind: "list", hint: "comma-separated" },
      { key: "coreCapabilities", label: "Core capabilities", kind: "text", hint: "what your business does best" },
      { key: "pastPerformance", label: "Past performance", kind: "text", hint: "relevant contracts or clients" },
      { key: "keyDifferentiators", label: "What makes you different", kind: "text" },
      { key: "digitalTools", label: "Digital tools you use", kind: "list", options: DIGITAL_TOOL_OPTIONS, hint: "comma-separated" },
    ],
  },
  {
    title: "Government contracting",
    fields: [
      { key: "interestedInGovcon", label: "Interested in government contracting (yes/no)", kind: "yesno" },
      { key: "samRegistered", label: "SAM.gov status", kind: "choice", options: ["Registered", "In progress", "Not registered", "Unsure"] },
      { key: "dunsUei", label: "UEI (Unique Entity ID)", kind: "text" },
      { key: "cageCode", label: "CAGE code", kind: "text" },
      { key: "soldToGovernment", label: "Sold to government or large primes before (yes/no)", kind: "yesno" },
      { key: "certifications", label: "Certifications held", kind: "list", options: ["8(a)", "HUBZone", "WOSB", "EDWOSB", "SDVOSB", "MBE", "DBE", "Other"] },
      { key: "certificationsPlanned", label: "Certifications you plan to pursue", kind: "list", options: ["8(a)", "HUBZone", "WOSB", "EDWOSB", "SDVOSB", "MBE", "DBE", "Other"] },
    ],
  },
  {
    title: "Needs and goals",
    fields: [
      { key: "seekingCapital", label: "Seeking financing or investment (yes/no)", kind: "yesno" },
      { key: "capitalPurpose", label: "What the financing would be used for", kind: "text" },
      { key: "capitalAmount", label: "Financing amount sought (USD)", kind: "number" },
      { key: "topNeed", label: "Single most important need right now", kind: "text" },
      { key: "barriers", label: "What is holding the business back", kind: "text" },
      { key: "goals12Months", label: "Goals for the next 12 months", kind: "text" },
      { key: "preferredServices", label: "Kinds of help you want", kind: "list", options: PREFERRED_SERVICE_OPTIONS, hint: "comma-separated" },
    ],
  },
  {
    title: "Operations",
    fields: [
      { key: "acquisitionMethod", label: "How you currently get business", kind: "choice", options: ACQUISITION_OPTIONS },
      { key: "openToTeaming", label: "Open to teaming with other businesses (yes/no)", kind: "yesno" },
      { key: "outOfState", label: "Can perform work outside your state (yes/no)", kind: "yesno" },
      { key: "inHouseBD", label: "Have an in-house business development team (yes/no)", kind: "yesno" },
      { key: "resourcesToInvest", label: "Have resources to invest if recommended (yes/no)", kind: "yesno" },
    ],
  },
  {
    title: "LIFT program",
    fields: [
      { key: "serviceArea", label: "LIFT services you need", kind: "list", options: SERVICE_AREA_OPTIONS, hint: "comma-separated" },
      { key: "referralSource", label: "How you heard about the LIFT Center", kind: "choice", options: REFERRAL_OPTIONS },
      { key: "aiDisclosure", label: "I understand an AI assistant summarizes my answers and staff review them (yes/no)", kind: "bool" },
      { key: "privacyAck", label: "I acknowledge the privacy notice and consent to be contacted (yes/no)", kind: "bool" },
      { key: "emailOptIn", label: "I agree to receive LIFT program emails (yes/no)", kind: "bool" },
    ],
  },
  {
    title: "Contact information",
    fields: [
      { key: "contactName", label: "Your full name", kind: "text" },
      { key: "contactTitle", label: "Your title or role", kind: "text" },
      { key: "contactEmail", label: "Email", kind: "text" },
      { key: "contactPhone", label: "Phone", kind: "text" },
      { key: "mobilePhone", label: "Mobile phone (if different)", kind: "text" },
      { key: "preferredContactMethod", label: "Preferred contact method", kind: "choice", options: ["Email", "Phone", "Either"] },
      { key: "noLinkedin", label: "No LinkedIn profile, personal or company (yes/no)", kind: "bool" },
      { key: "linkedin", label: "LinkedIn profile URL", kind: "text" },
      { key: "ownerEthnicity", label: "Company owner ethnicity", kind: "choice", options: ETHNICITY_OPTIONS },
      { key: "secondaryContacts", label: "Additional contacts (one per line: Name, email)", kind: "contacts" },
    ],
  },
];

export interface SecondaryContactValue {
  name: string;
  email: string;
}

export type WorksheetAnswers = Record<string, unknown>;

// ---------- Parsing ----------

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanValue = (v: string): string =>
  v
    .replace(/^_+|_+$/g, "")
    // Leading "(hint)" printed after the colon in the generated document.
    // Greedy: hints themselves contain parens (e.g. "(e.g. 8(a), WOSB)").
    .replace(/^\(.*\)\s*/, "")
    .replace(/^_+|_+$/g, "")
    .trim();

const isYes = (v: string) => /^(y|yes|true|1|x)\b/i.test(v.trim());
const isNo = (v: string) => /^(n|no|false|0)\b/i.test(v.trim());

/** Exact → prefix → substring option match (case-insensitive). */
function matchOption(value: string, options: readonly string[]): string | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  return (
    options.find((o) => o.toLowerCase() === v) ??
    options.find((o) => o.toLowerCase().startsWith(v)) ??
    options.find((o) => v.startsWith(o.toLowerCase())) ??
    options.find((o) => o.toLowerCase().includes(v))
  );
}

const EMPLOYEE_BUCKETS: [number, number, string][] = [
  [0, 0, "0 - just the owner(s)"],
  [1, 4, "1-4"],
  [5, 9, "5-9"],
  [10, 19, "10-19"],
  [20, 49, "20-49"],
  [50, 99, "50-99"],
  [100, Infinity, "100 or more"],
];

function coerceChoice(field: WorksheetField, value: string): string | undefined {
  if (field.key === "preferredContactMethod") {
    if (/either|both/i.test(value)) return "either";
    if (/phone|call|text|mobile/i.test(value)) return "phone";
    if (/e-?mail/i.test(value)) return "email";
    return undefined;
  }
  if (field.key === "samRegistered") {
    if (/in.?progress|pending|started/i.test(value)) return "in-progress";
    if (/not|no\b|haven/i.test(value)) return "not-registered";
    if (/unsure|don.?t know/i.test(value)) return "unsure";
    if (/yes|registered|done/i.test(value)) return "registered";
    return undefined;
  }
  if (field.key === "employeeCount") {
    const n = Number.parseInt(value.match(/\d+/)?.[0] ?? "", 10);
    if (Number.isFinite(n)) {
      return EMPLOYEE_BUCKETS.find(([lo, hi]) => n >= lo && n <= hi)?.[2];
    }
  }
  return field.options ? matchOption(value, field.options) : value;
}

function coerceList(field: WorksheetField, raw: string): string[] | undefined {
  const lines = raw.split("\n").map((s) => s.trim()).filter(Boolean);
  // Checkbox-control lists: keep only checked options; plain text falls back
  // to comma/semicolon splitting.
  let items: string[];
  if (lines.some((line) => CHECKBOX_RE.test(line))) {
    items = lines
      .map((line) => line.match(CHECKBOX_RE))
      .filter((m): m is RegExpMatchArray => m !== null && CHECKED_RE.test(m[1]))
      .map((m) => m[2].trim());
  } else {
    items = raw
      .split(/[,\n;•]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (items.length === 0) return undefined;

  if (field.key === "certifications" || field.key === "certificationsPlanned") {
    const ids = items
      .map((item) => CERT_IDS.find(([re]) => re.test(item))?.[1])
      .filter((id): id is string => Boolean(id));
    return ids.length > 0 ? [...new Set(ids)] : undefined;
  }
  if (field.key === "primaryNaics") {
    const codes = items.map((item) => {
      const digits = item.match(/\d{2,6}/)?.[0];
      const hit = digits
        ? NAICS_OPTIONS.find((o) => o.trim().startsWith(digits))
        : matchOption(item, NAICS_OPTIONS);
      return hit ?? item;
    });
    return [...new Set(codes)];
  }
  if (field.options) {
    const matched = items.map((item) => matchOption(item, field.options!) ?? item);
    return [...new Set(matched)];
  }
  return [...new Set(items)];
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;

function coerceContacts(lines: string[]): SecondaryContactValue[] {
  return lines
    .map((line) => {
      const email = line.match(EMAIL_RE)?.[0] ?? "";
      const name = line.replace(email, "").replace(/[<>()[\],;]/g, " ").replace(/\s+/g, " ").trim();
      return email ? { name, email } : null;
    })
    .filter((c): c is SecondaryContactValue => c !== null);
}

const HEADING_RE = /^(\d+\.\s+|[A-Z][A-Z &/\-]{5,}$)/;
const END_MARKER = /end of worksheet/i;
/** Content-control placeholder text — means the field was never filled in. */
const PLACEHOLDER_RE = /^(choose an item\.?|click or tap here.*|type your answer.*|one per line.*)$/i;
/** Checkbox lines emitted by the .docx parser: "[x] Option" / "[ ] Option". */
const CHECKBOX_RE = /^\s*\[([xX✓✔☑☒ ])\]\s*(.+)$/;
const CHECKED_RE = /^[xX✓✔☑☒]$/;

/**
 * Coerces raw worksheet line(s) for one field into its smeFormData value.
 * Returns undefined when nothing valid can be produced. Shared by the
 * document parser and the field-correction wizard.
 */
export function coerceField(field: WorksheetField, lines: string[]): unknown {
  const raw = lines
    .filter((line) => !PLACEHOLDER_RE.test(line.trim()))
    .join(field.kind === "contacts" || field.kind === "list" ? "\n" : " ")
    .trim();
  if (!raw || PLACEHOLDER_RE.test(raw)) return undefined;
  switch (field.kind) {
    case "yesno":
      return isYes(raw) ? "yes" : isNo(raw) ? "no" : undefined;
    case "bool":
      return isYes(raw) ? true : isNo(raw) ? false : undefined;
    case "number": {
      const cleaned = raw.replace(/[$,\s]/g, "");
      return /^\d+(\.\d+)?$/.test(cleaned) ? cleaned : undefined;
    }
    case "choice":
      return coerceChoice(field, raw);
    case "list":
      return coerceList(field, raw);
    case "contacts":
      return coerceContacts(lines);
    default:
      return raw;
  }
}

/** Looks up a worksheet field spec by its smeFormData key. */
export function findWorksheetField(key: string): WorksheetField | undefined {
  return WORKSHEET_SECTIONS.flatMap((s) => s.fields).find((f) => f.key === key);
}

export function parseWorksheetText(text: string): WorksheetAnswers {
  const fields = WORKSHEET_SECTIONS.flatMap((s) => s.fields);
  const byLabel = new Map(
    fields.map((f) => [f.label, { field: f, re: new RegExp(`^${escapeRe(f.label)}\\s*:\\s*(.*)$`, "i") }]),
  );
  const labelRe = new RegExp(
    `^(${fields.map((f) => escapeRe(f.label)).join("|")})\\s*:\\s*(.*)$`,
    "i",
  );

  interface Collected { field: WorksheetField; lines: string[] }
  const collected: Collected[] = [];
  let current: Collected | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\t/g, " ").trim();
    if (END_MARKER.test(line)) break;
    if (!line) continue;
    const labelMatch = line.match(labelRe);
    if (labelMatch) {
      const field = byLabel.get(
        fields.find((f) => f.label.toLowerCase() === labelMatch[1].toLowerCase())!.label,
      )!.field;
      current = { field, lines: [] };
      collected.push(current);
      const rest = cleanValue(labelMatch[2]);
      if (rest) current.lines.push(rest);
      continue;
    }
    if (current && !HEADING_RE.test(line)) {
      current.lines.push(line);
    }
  }

  const answers: WorksheetAnswers = {};
  for (const { field, lines } of collected) {
    const value = coerceField(field, lines);
    if (value !== undefined && !(Array.isArray(value) && value.length === 0)) {
      answers[field.key] = value;
    }
  }
  return answers;
}
