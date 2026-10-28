/**
 * LIFT Form Builder - shared types.
 *
 * Based on docs/svp-kdm-features/formbuilder/Adams form builder.md, hardened for the
 * Southern University LIFT Rural Business Center (no API keys on form documents,
 * files and signatures stored in Firebase Storage, versioned forms, field mappings).
 */

/** Supported control types. */
export type FormFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "dropdown"
  | "platform_lookup"
  | "multi_select"
  | "radio"
  | "yes_no"
  | "checkbox"
  | "likert_scale"
  | "nps"
  | "rating_stars"
  | "file_upload"
  | "signature"
  | "repeating_table"
  | "calculated"
  | "section_header"
  | "statement";

/** Live lookup sources for `platform_lookup` fields. */
export type LookupSource =
  | "parishes"
  | "service_areas"
  | "advisors"
  | "partners"
  | "lift_clients"
  | "events"
  | "cohorts"
  | "manual_list";

/** Who may open and submit a form. */
export type FormAudience = "public" | "client" | "staff";

export type FormStatus = "draft" | "published" | "archived";

export type PresentationMode = "standard" | "conversational";

export type ShowIfOperator = "equals" | "not_equals" | "includes" | "is_true" | "is_false" | "answered";

/** Conditional display rule evaluated against other answers. */
export interface ShowIfRule {
  fieldKey: string;
  operator: ShowIfOperator;
  value?: string;
}

/** Column definition for `repeating_table` fields. */
export interface TableColumn {
  key: string;
  label: string;
  type: "text" | "number" | "currency" | "date" | "dropdown";
  options?: string[];
  required?: boolean;
}

/** Records the platform can write form answers into. */
export type LiftTarget =
  | "liftClients"
  | "liftBaselines"
  | "liftServicePlans"
  | "liftSessions"
  | "liftTrainingAttendance"
  | "liftFeedback"
  | "liftCapitalPackages"
  | "liftCapabilityLibraries"
  | "liftProposalResponses"
  | "liftOutcomeClaims"
  | "liftImpactConsents"
  | "liftExits";

export type MappingTransform = "none" | "currency_to_cents" | "split_csv" | "boolean" | "number";

/** Writes one answer to a path on a target record. */
export interface FieldMapping {
  target: LiftTarget;
  path: string;
  transform?: MappingTransform;
}

/** Canonical cross-walk keys used to prefill answers across forms and existing profiles. */
export type CrosswalkKey =
  | "owner.name"
  | "owner.title"
  | "owner.ethnicity"
  | "business.name"
  | "business.address"
  | "business.city"
  | "business.state"
  | "business.zip"
  | "business.parish"
  | "business.website"
  | "business.naics"
  | "business.revenueBand"
  | "business.annualRevenue"
  | "business.employeesFullTime"
  | "business.employeesPartTime"
  | "business.applyingAs"
  | "contact.email"
  | "contact.phone"
  | "contact.mobile"
  | "ids.uei"
  | "ids.cage"
  | "certifications.current"
  | "capabilities.summary"
  | "needs.top"
  | "needs.helpWanted"
  | "business.acquisitionMethod"
  | "teaming.open"
  | "resources.toInvest"
  | "operations.outOfState"
  | "operations.inHouseBD"
  | "agencies.target"
  | "referral.source"
  | "referral.by"
  | "serviceArea.primary"
  | "social.linkedin";

/** A single question or display element. */
export interface FormField {
  id: string;
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  options?: string[];
  lookupSource?: LookupSource;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  tableColumns?: TableColumn[];
  /** Formula for `calculated` fields, e.g. "{revenueNow} - {revenueBaseline}". */
  formula?: string;
  /** Section id this field belongs to (standard mode shows one section per page). */
  section?: string;
  showIf?: ShowIfRule;
  /** Only staff can see and answer this field. */
  staffOnly?: boolean;
  prefillKey?: CrosswalkKey;
  mappings?: FieldMapping[];
  /** Allowed file MIME types for `file_upload`. */
  accept?: string[];
  maxFiles?: number;
  reportingCategory?: "dimension" | "metric" | "identifier" | "open_text" | "compliance_artifact";
  recommendedChartType?: "bar" | "pie" | "line" | "kpi" | "none";
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  staffOnly?: boolean;
}

export interface FormPdfConfig {
  enabled: boolean;
  headerTitle: string;
  headerSubtitle: string;
  footerText: string;
  includeSignatureBlock: boolean;
  includeTimestampAndAuditHash: boolean;
}

/** Post-submission processing hooks implemented in code (lib/form-builder/postprocess.ts). */
export type PostProcessHook = "intake_ai_summary" | "outcome_claims" | "proposal_award" | "enrollment_consent" | "rural_attestation";

/** Firestore: liftForms/{formId} */
export interface LiftFormDoc {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  /** Part B lifecycle reference, e.g. "B2". */
  lifecycleRef?: string;
  status: FormStatus;
  presentationMode: PresentationMode;
  audience: FormAudience;
  sections: FormSection[];
  fields: FormField[];
  version: number;
  ombControlNumber?: string;
  ombExpiresOn?: string;
  consentText?: string;
  submitLabel?: string;
  completionMessage?: string;
  /** Slug of the form to suggest after completion (e.g., B1 -> B2). */
  nextFormSlug?: string;
  postProcess?: PostProcessHook[];
  pdfConfig: FormPdfConfig;
  analytics: FormAnalytics;
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface FormAnalytics {
  totalViews: number;
  totalStarts: number;
  totalSubmissions: number;
}

/** Sanitized form returned to runners (no mappings, staff-only content filtered). */
export type PublicFormSchema = Omit<LiftFormDoc, "analytics" | "createdByUid" | "createdByName" | "fields"> & {
  fields: Omit<FormField, "mappings">[];
};

/** Reference to a file uploaded through /api/lift/forms/uploads. */
export interface UploadRef {
  uploadId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

/** Value captured by the signature control. */
export interface SignatureValue {
  mode: "drawn" | "typed";
  dataUrl?: string;
  typedName?: string;
}

export type TableRow = Record<string, string | number | null>;

export type FieldValue =
  | string
  | number
  | boolean
  | string[]
  | UploadRef[]
  | SignatureValue
  | TableRow[]
  | null;

export type FormValues = Record<string, FieldValue>;

export interface StoredFile {
  fieldKey: string;
  uploadId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
}

export interface StoredSignature {
  fieldKey: string;
  mode: "drawn" | "typed";
  uploadId?: string;
  typedName?: string;
  signedByName: string;
  signedAt: string;
  consentTextHash?: string;
  contentHash: string;
  userAgent?: string;
  ipHash?: string;
}

export interface IntakeAiSummary {
  status: "pending_staff_review" | "confirmed" | "rejected";
  source: "ai" | "fallback";
  needsAssessment: string;
  recommendedServiceAreas: string[];
  recommendedServicePlan: { serviceArea: string; action: string }[];
  eligibilityFlags: string[];
  generatedAt: string;
}

/** Firestore: liftFormSubmissions/{submissionId} */
export interface LiftFormSubmissionDoc {
  id: string;
  formId: string;
  formSlug: string;
  formTitle: string;
  formVersion: number;
  liftClientId?: string;
  submittedByUid?: string;
  submittedByName: string;
  submittedByEmail?: string;
  values: FormValues;
  files: StoredFile[];
  signatures: StoredSignature[];
  contentHash: string;
  consentTextHash?: string;
  source: "portal" | "public_link" | "staff";
  status: "submitted" | "accepted" | "rejected";
  mappingStatus: "applied" | "skipped" | "failed";
  mappingErrors?: string[];
  aiSummary?: IntakeAiSummary;
  completionSeconds?: number;
  createdAt: string;
}

/** Firestore: liftFormDrafts/{formSlug}__{uid} */
export interface LiftFormDraftDoc {
  formSlug: string;
  uid: string;
  values: FormValues;
  stepIndex: number;
  updatedAt: string;
}

/** Firestore: liftClientProfiles/{liftClientId} - latest known answer per cross-walk key. */
export interface LiftClientProfileDoc {
  liftClientId: string;
  values: Partial<Record<CrosswalkKey, { value: FieldValue; sourceSubmissionId: string; updatedAt: string }>>;
  updatedAt: string;
}

/** Firestore: liftClients/{liftClientId} */
export interface LiftClientDoc {
  id: string;
  legalName: string;
  status: "intake_draft" | "intake_submitted" | "enrolled" | "inactive";
  ownerUid?: string;
  contactEmail?: string;
  uei?: string;
  enrollment?: {
    consentSubmissionId?: string;
    consentSignedAt?: string;
    loeFormVersion?: string;
  };
  eligibility?: {
    rural: { status: "pending" | "eligible" | "ineligible" | "review"; parish?: string; submissionId?: string };
  };
  source: "public_intake" | "portal_form" | "staff";
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}
