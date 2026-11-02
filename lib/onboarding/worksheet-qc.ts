/**
 * Field-by-field quality-control check for a parsed LIFT onboarding
 * worksheet. Returns the list of issues a client must fix in the
 * field-correction wizard before the answers are written to the draft.
 */
import type { WorksheetAnswers, WorksheetField, WorksheetKind } from "./worksheet";
import { WORKSHEET_SECTIONS } from "./worksheet";

export interface WorksheetIssue {
  key: string;
  label: string;
  kind: WorksheetKind;
  /** true blocks "populate" until fixed; false allows skipping. */
  required: boolean;
  /** Human explanation of what's wrong and what to enter. */
  message: string;
  /** Allowed values shown as a picker for choice/list fields. */
  options?: readonly string[];
}

const FIELD_BY_KEY = new Map(
  WORKSHEET_SECTIONS.flatMap((s) => s.fields).map((f) => [f.key, f]),
);

const field = (key: string): WorksheetField => {
  const f = FIELD_BY_KEY.get(key);
  if (!f) throw new Error(`Unknown worksheet field: ${key}`);
  return f;
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;

const CONTACT_METHOD_OPTIONS = ["email", "phone", "either"];
const SAM_OPTIONS = ["registered", "in-progress", "not-registered", "unsure"];

function issue(
  key: string,
  required: boolean,
  message: string,
  options?: readonly string[],
): WorksheetIssue {
  const f = field(key);
  return { key, label: f.label, kind: f.kind, required, message, options: options ?? f.options };
}

/**
 * Runs every required-presence and format rule over the parsed answers.
 * Missing optional fields are skipped silently; present-but-malformed
 * optional fields become non-blocking issues.
 */
export function checkWorksheet(answers: WorksheetAnswers): WorksheetIssue[] {
  const issues: WorksheetIssue[] = [];

  const requireValue = (key: string, message: string) => {
    const v = answers[key];
    const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) issues.push(issue(key, true, message));
    return !empty;
  };

  // --- Required fields ---
  if (answers.businessNotRegistered !== true) {
    requireValue("companyName", "Your business legal name is required.");
  }
  requireValue("contactName", "Your full name is required.");

  if (requireValue("contactEmail", "A contact email is required.")) {
    if (!EMAIL_RE.test(str(answers.contactEmail))) {
      issues.push(issue("contactEmail", true, `"${str(answers.contactEmail)}" is not a valid email address.`));
    }
  }
  if (requireValue("contactPhone", "A contact phone number is required.")) {
    if (str(answers.contactPhone).replace(/\D/g, "").length < 7) {
      issues.push(issue("contactPhone", true, `"${str(answers.contactPhone)}" doesn't look like a complete phone number.`));
    }
  }
  if (requireValue("preferredContactMethod", "Choose how you'd like to be contacted.")) {
    if (!CONTACT_METHOD_OPTIONS.includes(str(answers.preferredContactMethod))) {
      issues.push(issue("preferredContactMethod", true, "Choose email, phone, or either.", CONTACT_METHOD_OPTIONS));
    }
  }
  requireValue("ownerEthnicity", "Owner ethnicity is required for MBDA reporting.");

  if (answers.noLinkedin !== true) {
    const linkedin = str(answers.linkedin);
    if (!linkedin) {
      issues.push(
        issue("linkedin", true, "Provide your LinkedIn profile URL, or answer the \"No LinkedIn profile\" field with yes."),
      );
    } else if (!/linkedin\.com|https?:\/\/|\./i.test(linkedin)) {
      issues.push(issue("linkedin", true, `"${linkedin}" doesn't look like a LinkedIn URL.`));
    }
  }

  if (answers.aiDisclosure !== true) {
    issues.push(issue("aiDisclosure", true, "You must acknowledge the AI disclosure to continue."));
  }
  if (answers.privacyAck !== true) {
    issues.push(issue("privacyAck", true, "You must acknowledge the privacy notice to continue."));
  }
  requireValue("serviceArea", "Select at least one LIFT service area.");
  requireValue("referralSource", "Tell us how you heard about the LIFT Center.");
  if (requireValue("referredBy", "Tell us which organization referred you to the LIFT program.")) {
    if (str(answers.referredBy) === "Other" && !str(answers.referredByOther)) {
      issues.push(issue("referredByOther", true, "Name the organization or person who referred you."));
    }
  }

  // --- Format checks on optional fields that WERE answered ---
  const website = str(answers.website);
  if (website && !/\./.test(website)) {
    issues.push(issue("website", false, `"${website}" doesn't look like a website URL.`));
  }
  const zip = str(answers.zip);
  if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
    issues.push(issue("zip", false, `"${zip}" should be a 5-digit ZIP code.`));
  }
  const year = str(answers.yearEstablished);
  if (year && !/^(19|20)\d{2}$/.test(year)) {
    issues.push(issue("yearEstablished", false, `"${year}" should be a 4-digit year.`));
  }
  const uei = str(answers.dunsUei);
  if (uei && !/^[A-Z0-9]{12}$/i.test(uei)) {
    issues.push(issue("dunsUei", false, "A UEI is exactly 12 letters and numbers."));
  }
  const cage = str(answers.cageCode);
  if (cage && !/^[A-Z0-9]{5}$/i.test(cage)) {
    issues.push(issue("cageCode", false, "A CAGE code is exactly 5 letters and numbers."));
  }
  for (const key of ["revenueLast12", "capitalAmount"] as const) {
    const v = str(answers[key]);
    if (v && !/^\d+(\.\d+)?$/.test(v)) {
      issues.push(issue(key, false, "Enter a dollar amount using digits only."));
    }
  }
  const sam = str(answers.samRegistered);
  if (sam && !SAM_OPTIONS.includes(sam)) {
    issues.push(issue("samRegistered", false, "Choose your SAM.gov status.", SAM_OPTIONS));
  }

  for (const key of ["applyingAs", "stage", "employeeCount", "acquisitionMethod", "referralSource", "referredBy", "ownerEthnicity"] as const) {
    const v = str(answers[key]);
    const spec = field(key);
    if (v && spec.options && !spec.options.includes(v)) {
      const required = key === "ownerEthnicity";
      issues.push(issue(key, required, `"${v}" isn't one of the available choices.`, spec.options));
    }
  }

  for (const code of arr(answers.primaryNaics)) {
    if (!/\d{2,6}/.test(code)) {
      issues.push(
        issue("primaryNaics", false, `"${code}" isn't a NAICS code — use the number (e.g. 541511) or code and title.`),
      );
      break;
    }
  }

  const contacts = Array.isArray(answers.secondaryContacts) ? answers.secondaryContacts : [];
  for (const c of contacts) {
    const email = typeof c === "object" && c !== null ? str((c as { email?: unknown }).email) : "";
    if (!email || !EMAIL_RE.test(email)) {
      issues.push(
        issue("secondaryContacts", false, "One of your additional contacts is missing a valid email — one per line: Name, email."),
      );
      break;
    }
  }

  return issues;
}
