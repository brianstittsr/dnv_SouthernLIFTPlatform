/**
 * Seed definitions for the LIFT client lifecycle forms (Part B of
 * docs/SOUTHERN Requirenments/analysis/LIFT_Onboarding_Questions.txt).
 * Seeded through POST /api/lift/forms/seed (admin). Forms stay editable in the Form Studio.
 */
import { LIFT_SERVICE_AREAS, NAICS_OPTIONS } from "./controls";
import { BUSINESS_NEED_OPTIONS, MAX_BUSINESS_NEED_SELECTIONS } from "../lift-business-needs";
import type { FormDefinitionInput } from "./form-schema";
import type { CrosswalkKey, FieldMapping, FormField, FormFieldType, LiftTarget, MappingTransform } from "./types";

type FieldOptions = Partial<Omit<FormField, "id" | "key" | "label" | "type" | "section">>;

/** Builds a field; `id` equals `key` so seeds are stable across re-seeding. */
const field = (section: string, key: string, label: string, type: FormFieldType, options: FieldOptions = {}): FormField => ({
  id: key,
  key,
  label,
  type,
  required: false,
  section,
  ...options,
});

/** Shorthand for a single mapping. */
const to = (target: LiftTarget, path: string, transform?: MappingTransform): FieldMapping[] => [{ target, path, ...(transform ? { transform } : {}) }];

const prefill = (key: CrosswalkKey) => ({ prefillKey: key });

const SERVICE_AREAS = [...LIFT_SERVICE_AREAS];
const CERTIFICATIONS = ["8(a)", "HUBZone", "WOSB", "EDWOSB", "SDVOSB", "MBE", "DBE", "CMMC", "ISO 9001", "AS9100", "Other", "None"];
const DIGITAL_TOOLS = ["Website", "E-commerce / online sales", "Accounting software", "CRM", "Social media", "AI tools", "None"];
const REFERRAL_SOURCES = [
  "Southern University", "Small Business Development Center (SBDC)", "Partner organization", "Event or workshop",
  "Social media", "Radio", "Referral from another business", "Web search", "Other",
];
/** Partner organizations credited with referring a client — a trackable program metric. */
const REFERRED_BY_ORGS = ["KDM and Associates", "PMO", "AM Laboratory", "SBDC", "Other"];
const OWNER_ETHNICITY = [
  "Black or African American", "Hispanic or Latino", "Asian", "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander", "Multi-ethnic", "White", "Other",
];
const MEASURES = [
  "Clients served", "New business start", "Capital infusion", "Jobs supported", "Revenue growth",
  "Capital-readiness package", "Contract secured", "Digital adoption", "AM program participation", "CMMC / HUBZone / OZ readiness",
];
const FUNDING_ACK = "Southern University LIFT Center - MBDA Rural Business Center. Supported by the U.S. Department of Commerce, Minority Business Development Agency.";

const pdf = (headerSubtitle: string) => ({
  enabled: true,
  headerTitle: "Southern University LIFT Center",
  headerSubtitle,
  footerText: FUNDING_ACK,
  includeSignatureBlock: true,
  includeTimestampAndAuditHash: true,
});

/** B1 - AI intake (conversational). */
const intake: FormDefinitionInput = {
  slug: "lift-intake",
  title: "LIFT Center Intake",
  description: "Tell us about you and your business. This takes about 10 minutes. LIFT staff review every intake.",
  category: "Intake",
  lifecycleRef: "B1",
  presentationMode: "conversational",
  // Client-only: intake data must always be linked to a signed-in person or
  // company. The /portal/onboarding wizard submits through this definition.
  audience: "client",
  postProcess: ["intake_ai_summary"],
  nextFormSlug: "mbda-intake-loe",
  submitLabel: "Submit intake",
  completionMessage: "Thank you. A LIFT advisor will review your intake. Next, please complete the MBDA Client Intake & Letter of Engagement.",
  pdfConfig: pdf("Client Intake"),
  sections: [
    { id: "start", title: "Getting started" },
    { id: "business", title: "Your business" },
    { id: "operations", title: "How you operate" },
    { id: "needs", title: "Needs and goals" },
  ],
  fields: [
    field("start", "fullName", "What is your full name?", "short_text", { required: true, helpText: "The person match alerts and advisor messages go to.", ...prefill("owner.name"), mappings: to("liftClients", "ownerName") }),
    field("start", "contactTitle", "What is your title or role in the business?", "short_text", { helpText: "Helps advisors and partners know who they're working with.", ...prefill("owner.title"), mappings: to("liftClients", "representative.title") }),
    field("start", "email", "What is your email address?", "email", { required: true, helpText: "Where opportunity matches and program updates are sent.", ...prefill("contact.email"), mappings: to("liftClients", "contact.email") }),
    field("start", "phone", "What is the best phone number to reach you?", "phone", { helpText: "For advisor follow-ups and time-sensitive contract alerts.", ...prefill("contact.phone"), mappings: to("liftClients", "contact.phone") }),
    field("start", "mobilePhone", "Mobile phone (if different)", "phone", { helpText: "Optional backup number for urgent contract deadlines.", ...prefill("contact.mobile"), mappings: to("liftClients", "contact.mobile") }),
    field("start", "preferredContactMethod", "How would you prefer we contact you?", "dropdown", { required: true, options: ["Email", "Phone", "Either"], helpText: "How you'd like us to reach you with matches and updates.", mappings: to("liftClients", "contact.preferredContactMethod") }),
    field("start", "noLinkedin", "I don't have a LinkedIn profile (personal or company)", "checkbox", { mappings: to("liftClients", "contact.noLinkedin", "boolean") }),
    field("start", "linkedin", "What is your LinkedIn profile address?", "url", { placeholder: "https://www.linkedin.com/in/your-profile", showIf: { fieldKey: "noLinkedin", operator: "not_equals", value: "true" }, helpText: "Enriches your business record for advisor and partner matching — check the box above if you don't have one.", ...prefill("social.linkedin"), mappings: to("liftClients", "contact.linkedin") }),
    field("start", "ownerEthnicity", "Company owner ethnicity", "dropdown", { required: true, options: OWNER_ETHNICITY, helpText: "Identifies minority-business certifications and set-asides you may qualify for.", ...prefill("owner.ethnicity"), mappings: to("liftClients", "identity.ownerEthnicity") }),
    field("start", "serviceArea", "Which LIFT service(s) best match what you need?", "multi_select", { required: true, options: [...SERVICE_AREAS, "Not sure yet"], helpText: "Choosing \"Government contracting\" enables AI opportunity matching for your business.", ...prefill("serviceArea.primary"), mappings: to("liftClients", "primaryServiceAreas") }),
    field("start", "aiDisclosure", "I understand an AI assistant will summarize my answers and LIFT staff will review them before any decision is made.", "checkbox", { required: true }),
    field("start", "privacyAck", "I acknowledge the LIFT Center's privacy notice and consent to be contacted about its services.", "checkbox", { required: true, mappings: to("liftClients", "consents.privacyAcknowledged", "boolean") }),
    field("start", "emailOptIn", "I agree to receive emails from the Southern LIFT program in the future.", "checkbox", { mappings: to("liftClients", "contact.emailOptIn", "boolean") }),
    field("business", "businessName", "What is your business's legal name?", "short_text", { required: true, helpText: "Your registered legal name — links teammates from the same company and matches public records.", ...prefill("business.name"), mappings: to("liftClients", "legalName") }),
    field("business", "dba", "Do you use a different trade name (DBA)? If so, what is it?", "short_text", { helpText: "The name customers know you by — helps matching connect listings to the right business." }),
    field("business", "applyingAs", "What type of business entity is it?", "dropdown", {
      required: true,
      options: ["Sole proprietorship", "LLC", "Corporation", "S corporation", "Partnership", "Nonprofit", "Not registered yet", "Other"],
      helpText: "Your legal structure affects eligibility for programs and contracting set-asides.",
      ...prefill("business.applyingAs"),
      mappings: to("liftClients", "business.entityType"),
    }),
    field("business", "address", "What is the business's physical street address?", "short_text", { required: true, helpText: "Your location determines rural eligibility, your parish, and which set-asides (like HUBZone) apply.", ...prefill("business.address"), mappings: to("liftClients", "address.street") }),
    field("business", "city", "City", "short_text", { required: true, ...prefill("business.city"), mappings: to("liftClients", "address.city") }),
    field("business", "zip", "ZIP code", "short_text", { required: true, helpText: "Used to check rural eligibility and regional matching.", ...prefill("business.zip"), mappings: to("liftClients", "address.zip") }),
    field("business", "productsServices", "What products or services do you provide?", "text_list", {
      required: true,
      placeholder: "Type a product or service, then click +",
      helpText: "Add each product or service on its own line. Be specific — the AI matcher reads these to score opportunity fit.",
      mappings: to("liftClients", "business.productsServices"),
    }),
    field("business", "naics", "Add your NAICS code(s). Search by code or keyword, then click + to add each one.", "option_picker", {
      options: [...NAICS_OPTIONS],
      helpText: "The #1 key the AI matcher uses to score SAM.gov opportunities. Not sure of your code? Leave blank — your advisor will help.",
      ...prefill("business.naics"),
      mappings: to("liftClients", "business.naics"),
    }),
    field("business", "stage", "What stage is your business in?", "radio", { required: true, options: ["Idea", "Startup (under 2 years)", "Operating business", "Growing / expanding"], helpText: "Tells your advisor and the matcher where you are so recommendations fit your stage.", mappings: to("liftClients", "business.stage") }),
    field("business", "revenueLast12", "About how much revenue did the business earn in the last 12 months?", "currency", { helpText: "A rough figure is fine — used to flag which opportunity sizes you qualify for.", ...prefill("business.annualRevenue"), mappings: to("liftClients", "business.annualRevenueCents", "currency_to_cents") }),
    field("business", "employeesFullTime", "How many full-time employees do you have, including owners?", "dropdown", {
      required: true,
      options: ["0 - just the owner(s)", "1-4", "5-9", "10-19", "20-49", "50-99", "100 or more"],
      helpText: "SBA size standards use headcount to decide small-business eligibility for set-asides.",
      mappings: to("liftClients", "business.employeesFullTimeRange"),
    }),
    field("business", "samRegistered", "Is your business registered in SAM.gov?", "yes_no", { required: true, helpText: "Free registration required for federal contracts — your advisor can walk you through it." }),
    field("business", "uei", "What is your Unique Entity ID (UEI)?", "short_text", { showIf: { fieldKey: "samRegistered", operator: "is_true" }, helpText: "Required for federal awards — also links teammates from the same company.", ...prefill("ids.uei"), mappings: to("liftClients", "uei") }),
    field("business", "soldToGovernment", "Have you sold to government agencies, prime contractors, or large companies before?", "yes_no", { required: true, helpText: "Past contract wins significantly improve fit scoring for similar opportunities." }),
    field("business", "certifications", "Which certifications does your business hold?", "multi_select", { options: CERTIFICATIONS, helpText: "Certifications unlock set-aside opportunities — the matcher prioritizes contracts that require them.", ...prefill("certifications.current"), mappings: to("liftClients", "business.certifications") }),
    field("business", "certificationsPlanned", "Which certifications do you plan to pursue?", "multi_select", { options: CERTIFICATIONS.filter((item) => item !== "None"), helpText: "Your advisor can help you apply — shapes which future opportunities we prepare you for." }),
    field("business", "minorityCertification", "Which minority business certification do you hold, if any?", "dropdown", {
      options: ["8(a)", "MBE", "DBE", "WBE / WOSB", "HUBZone", "SDVOSB", "None", "In process"],
      helpText: "Identifies minority set-aside opportunities you qualify for.",
      ...prefill("business.minorityCertification"),
      mappings: to("liftClients", "business.minorityCertification"),
    }),
    field("business", "digitalTools", "Which digital tools do you use today?", "multi_select", { options: DIGITAL_TOOLS, helpText: "Helps your advisor plan digital and AI support — doesn't affect matching." }),
    field("operations", "acquisitionMethod", "How do you currently get business?", "dropdown", {
      required: true,
      options: ["Word of mouth", "Referrals", "Website / online", "Social media", "Bids and solicitations", "Networking events", "Other"],
      helpText: "Shows whether you're already bid-driven or need help finding opportunities.",
      ...prefill("business.acquisitionMethod"),
      mappings: to("liftClients", "business.acquisitionMethod"),
    }),
    field("operations", "openToTeaming", "Is your company open to a teaming arrangement if suggested?", "yes_no", { required: true, helpText: "Teaming is how small businesses win larger contracts — the matcher can suggest partners.", ...prefill("teaming.open"), mappings: to("liftClients", "preferences.openToTeaming", "boolean") }),
    field("operations", "outOfState", "Is your company able to perform work outside your current state?", "yes_no", { required: true, helpText: "Controls whether match suggestions extend beyond Louisiana.", ...prefill("operations.outOfState"), mappings: to("liftClients", "operations.outOfState", "boolean") }),
    field("operations", "inHouseBD", "Does your company have an in-house business development team?", "yes_no", { required: true, helpText: "Helps gauge how much hands-on capture and proposal support you'll need.", ...prefill("operations.inHouseBD"), mappings: to("liftClients", "operations.inHouseBD", "boolean") }),
    field("operations", "resourcesToInvest", "Does your company have resources to invest if recommended?", "yes_no", { required: true, helpText: "Helps advisors recommend realistic next steps — tools, registrations, travel.", ...prefill("resources.toInvest"), mappings: to("liftClients", "resources.toInvest", "boolean") }),
    field("needs", "seekingCapital", "Are you seeking financing or investment?", "yes_no", { required: true, helpText: "Routes you to capital-readiness support alongside contracting help." }),
    field("needs", "capitalPurpose", "What would the financing be used for?", "long_text", { aiEnhance: true, helpText: "Lenders and advisors use this to match you with the right financing programs.", showIf: { fieldKey: "seekingCapital", operator: "is_true" } }),
    field("needs", "capitalAmount", "About how much financing are you seeking?", "currency", { helpText: "A rough figure is fine — guides which loan and grant programs fit.", showIf: { fieldKey: "seekingCapital", operator: "is_true" } }),
    field("needs", "topNeed", "What is the single most important thing your business needs right now?", "long_text", { required: true, helpText: "The biggest driver of your service plan and the recommendations you see first.", ...prefill("needs.top"), mappings: to("liftClients", "needs.top") }),
    field("needs", "barriers", "What is holding your business back?", "long_text", { required: true, helpText: "We flag resources, training, and programs that specifically address these barriers." }),
    field("needs", "goals12Months", "What do you want to achieve in the next 12 months?", "long_text", { required: true, helpText: "Your goals become the measurable outcomes your advisor works toward with you.", mappings: to("liftClients", "needs.goals12Months") }),
    field("needs", "preferredServices", "Which kinds of help interest you?", "multi_select", {
      required: true,
      options: ["One-on-one counseling", "Workshops and training", "Capital readiness", "Government contracting", "Advanced Manufacturing program", "Digital and AI adoption"],
      helpText: "Shapes your advisor assignment and the workshops and tools we surface first.",
    }),
    field("needs", "topNeeds", `Which business needs are most important to your company? (select your top ${MAX_BUSINESS_NEED_SELECTIONS})`, "multi_select", {
      options: BUSINESS_NEED_OPTIONS,
      maxItems: MAX_BUSINESS_NEED_SELECTIONS,
      helpText: "The priority list for Louisiana companies — pick your top five. This drives which advisors, trainings, and resources we prioritize for you.",
      ...prefill("needs.topNeeds"),
      mappings: to("liftClients", "needs.topNeeds"),
    }),
    field("needs", "referralSource", "How did you hear about the LIFT Center?", "dropdown", { required: true, options: REFERRAL_SOURCES, helpText: "Helps LIFT measure outreach — doesn't affect your matches or service plan.", ...prefill("referral.source"), mappings: to("liftClients", "referralSource") }),
    field("needs", "referredBy", "Which organization referred you to the LIFT program?", "dropdown", { required: true, options: REFERRED_BY_ORGS, helpText: "Credits the partner organization that sent you — reported to MBDA as a referral metric.", mappings: to("liftClients", "referredByOrg") }),
    field("needs", "referredByOther", "Name of the referring organization (if other)", "short_text", { showIf: { fieldKey: "referredBy", operator: "equals", value: "Other" }, helpText: "Type the organization or person's name.", mappings: to("liftClients", "referredByOther") }),
    field("needs", "attachments", "Upload any documents that help us understand your business (optional)", "file_upload", {
      helpText: "For example, a capability statement, financial statement, or business plan. Do not upload Social Security numbers or controlled (CUI) documents. An AI assistant reads each file and summarizes it for your advisor.",
      maxFiles: 5,
    }),
  ],
};

const MBDA_CONSENT = [
  "CERTIFICATION: Under this agreement, the client certifies under penalty of perjury that it is a minority business enterprise (MBE), as defined by the MBDA Act, 15 U.S.C. 9501(9), (15): a business enterprise majority-owned and controlled by at least one socially or economically disadvantaged individual. An individual of any race or ethnicity may meet this definition.",
  "PRIVACY DISCLOSURE AND INFORMATION USE: By submitting this form, your company agrees to allow the Business Center and/or MBDA to share this document, the information in it, and any supplementary material with United States Government agencies as needed to carry out due diligence and advocate for your interests, and for research, studies, and analysis consistent with the MBDA mission. The Client Engagement Form is business confidential and will not be shared outside the U.S. Government without your permission, to the extent permitted by law.",
  "ACCEPTANCE OF CLIENT RELATIONSHIP: The client agrees to (a) acknowledge the relationship with the Business Center; (b) provide firm contact and profile information; (c) disclose to MBDA and/or the Business Center outcomes based on the services provided; and (d) provide documentary verification for transactions resulting from services provided under this engagement. Services are subsidized through Federal appropriations. MBDA does not guarantee any particular outcome.",
].join("\n\n");

/** B2 - MBDA Client Intake & Letter of Engagement. */
const mbdaIntake: FormDefinitionInput = {
  slug: "mbda-intake-loe",
  title: "MBDA Client Intake & Letter of Engagement",
  description: "Official MBDA Business Center client intake and letter of engagement. Your answers from the LIFT intake are filled in where available.",
  category: "Intake",
  lifecycleRef: "B2",
  presentationMode: "standard",
  audience: "client",
  ombControlNumber: "0640-0002",
  ombExpiresOn: "2026-01-31",
  consentText: MBDA_CONSENT,
  postProcess: ["enrollment_consent"],
  nextFormSlug: "rural-eligibility",
  submitLabel: "Sign and submit",
  completionMessage: "Your Letter of Engagement is signed. Next, please confirm your rural eligibility.",
  pdfConfig: pdf("MBDA Client Intake & Letter of Engagement (OMB Control No. 0640-0002)"),
  sections: [
    { id: "agreement", title: "Certification and privacy" },
    { id: "application", title: "Client application" },
    { id: "preliminary", title: "Preliminary questions" },
    { id: "relationship", title: "Acceptance of client relationship" },
    { id: "internal", title: "For internal use only", staffOnly: true },
  ],
  fields: [
    field("agreement", "mbdaConsentStatement", MBDA_CONSENT, "statement"),
    field("agreement", "agreeToProceed", "I have read the certification, privacy disclosure, and acceptance of client relationship, and I agree to proceed.", "checkbox", { required: true }),
    field("application", "representativeName", "Full name of authorized client representative", "short_text", { required: true, ...prefill("owner.name"), mappings: to("liftClients", "representative.name") }),
    field("application", "representativeTitle", "Title", "short_text", { required: true, ...prefill("owner.title"), mappings: to("liftClients", "representative.title") }),
    field("application", "companyEmail", "Company email", "email", { required: true, ...prefill("contact.email"), mappings: to("liftClients", "contact.email") }),
    field("application", "companyPhone", "Company phone", "phone", { required: true, ...prefill("contact.phone"), mappings: to("liftClients", "contact.phone") }),
    field("application", "mobilePhone", "Mobile phone", "phone", { ...prefill("contact.mobile"), mappings: to("liftClients", "contact.mobile") }),
    field("application", "businessName", "Company name", "short_text", { required: true, ...prefill("business.name"), mappings: to("liftClients", "legalName") }),
    field("application", "companyAddress", "Company address", "short_text", { required: true, ...prefill("business.address"), mappings: to("liftClients", "address.street") }),
    field("application", "website", "Website URL", "url", { ...prefill("business.website"), mappings: to("liftClients", "contact.website") }),
    field("application", "applyingAs", "Applying as", "dropdown", {
      required: true,
      options: ["Sole proprietorship", "LLC", "Corporation", "S corporation", "Partnership", "Nonprofit", "Other"],
      ...prefill("business.applyingAs"),
      mappings: to("liftClients", "business.entityType"),
    }),
    field("application", "minorityCertification", "Minority business certification", "dropdown", {
      options: ["8(a)", "MBE", "DBE", "WBE / WOSB", "HUBZone", "SDVOSB", "None", "In process"],
      ...prefill("business.minorityCertification"),
      mappings: to("liftClients", "business.minorityCertification"),
    }),
    field("application", "uei", "Unique Entity ID (UEI) - formerly DUNS No.", "short_text", { ...prefill("ids.uei"), mappings: to("liftClients", "uei") }),
    field("application", "cageCode", "SAM / CAGE code", "short_text", { ...prefill("ids.cage"), mappings: to("liftClients", "cageCode") }),
    field("application", "primaryNaics", "Primary NAICS code - with definition written out", "short_text", { required: true, placeholder: "e.g., 332710 - Machine Shops", ...prefill("business.naics"), mappings: to("liftClients", "business.primaryNaics") }),
    field("application", "ownerEthnicity", "Company owner ethnicity", "dropdown", { required: true, options: OWNER_ETHNICITY, ...prefill("owner.ethnicity"), mappings: to("liftClients", "identity.ownerEthnicity") }),
    field("application", "annualRevenue", "Approximate annual revenue", "currency", { required: true, ...prefill("business.annualRevenue"), mappings: to("liftClients", "business.annualRevenueCents", "currency_to_cents") }),
    field("application", "headshot", "Professional headshot", "file_upload", { maxFiles: 1, accept: ["image/png", "image/jpeg", "image/webp"] }),
    field("application", "capabilityStatement", "One-page capability statement", "file_upload", { maxFiles: 1 }),
    field("application", "linkedinUrl", "LinkedIn page URL", "url", { ...prefill("social.linkedin") }),
    field("application", "facebookUrl", "Facebook page URL", "url"),
    field("application", "twitterUrl", "Twitter / X page URL", "url"),
    field("application", "informationAccurate", "I agree that the information herein is true and correct. The information provided in this application is kept confidential.", "checkbox", { required: true }),
    field("application", "signature", "Signature of authorized client representative", "signature", { required: true }),
    field("preliminary", "topNeed", "What is the #1 need of your company?", "long_text", { required: true, ...prefill("needs.top"), mappings: to("liftClients", "needs.top") }),
    field("preliminary", "acquisitionMethod", "How do you currently get business?", "dropdown", {
      required: true,
      options: ["Word of mouth", "Referrals", "Website / online", "Social media", "Bids and solicitations", "Networking events", "Other"],
      ...prefill("business.acquisitionMethod"),
    }),
    field("preliminary", "openToTeaming", "Is your company open to a teaming arrangement if suggested?", "yes_no", { required: true, ...prefill("teaming.open"), mappings: to("liftClients", "preferences.openToTeaming", "boolean") }),
    field("relationship", "servicesInterested", "Services interested in", "multi_select", {
      required: true,
      options: [
        "Business consulting", "Access to capital / loan packaging", "Contract bid / proposal preparation", "Contract opportunity matching",
        "Strategic partnerships / teaming", "Certification assistance", "Training and workshops",
      ],
      mappings: to("liftClients", "preferences.servicesInterested"),
    }),
    field("relationship", "helpWanted", "What help are you looking for from the Business Center?", "long_text", { required: true, ...prefill("needs.helpWanted") }),
    field("relationship", "howFound", "How did you find the Business Center?", "dropdown", { required: true, options: REFERRAL_SOURCES, ...prefill("referral.source") }),
    field("relationship", "resourcesToInvest", "Does your company have resources to invest if recommended by the Business Center?", "yes_no", { required: true, ...prefill("resources.toInvest") }),
    field("relationship", "outOfState", "Is your company able to perform work outside your current state?", "yes_no", { required: true, ...prefill("operations.outOfState") }),
    field("relationship", "inHouseBD", "Does your company have an in-house business development team?", "yes_no", { required: true, ...prefill("operations.inHouseBD") }),
    field("relationship", "interestedIn", "Is your company interested in obtaining one of the following?", "multi_select", { options: ["8(a) Certification", "GSA Schedule", "HUBZone"] }),
    field("relationship", "newAgencies", "What agencies are you looking to do business with that you currently are NOT doing business with?", "long_text", { ...prefill("agencies.target") }),
    field("relationship", "referredBy", "Who were you referred by?", "short_text", { ...prefill("referral.by") }),
    field("relationship", "clientNotes", "Notes", "long_text"),
    field("internal", "repAssigned", "Business Center rep assigned", "platform_lookup", { lookupSource: "advisors", staffOnly: true, mappings: to("liftClients", "assignedProgramManagerId") }),
    field("internal", "tags", "Tags (comma separated)", "short_text", { staffOnly: true, mappings: to("liftClients", "tags", "split_csv") }),
    field("internal", "centerLocation", "Business Center location", "dropdown", { staffOnly: true, options: ["Baton Rouge (main campus)", "Shreveport satellite", "Virtual"] }),
    field("internal", "centerStaff", "Business Center staff", "platform_lookup", { lookupSource: "advisors", staffOnly: true }),
    field("internal", "interviewDate", "Interview date", "date", { staffOnly: true }),
    field("internal", "staffReferralName", "Staff referral name", "short_text", { staffOnly: true }),
    field("internal", "crmCertifiedDate", "CRM certified date", "date", { staffOnly: true }),
    field("internal", "referralDate", "Referral date", "date", { staffOnly: true }),
  ],
};

/** B3 - Rural eligibility attestation. */
const ruralEligibility: FormDefinitionInput = {
  slug: "rural-eligibility",
  title: "Rural Eligibility Attestation",
  description: "Confirm where your business operates. LIFT staff make the final eligibility decision.",
  category: "Intake",
  lifecycleRef: "B3",
  presentationMode: "standard",
  audience: "client",
  postProcess: ["rural_attestation"],
  nextFormSlug: "baseline-survey",
  submitLabel: "Sign and submit",
  completionMessage: "Thank you. LIFT staff will confirm your eligibility. Next, please complete the baseline survey.",
  pdfConfig: pdf("Rural Eligibility Attestation"),
  sections: [{ id: "location", title: "Business location" }],
  fields: [
    field("location", "address", "Business physical address", "short_text", { required: true, ...prefill("business.address") }),
    field("location", "city", "City", "short_text", { required: true, ...prefill("business.city") }),
    field("location", "parish", "Parish", "platform_lookup", { required: true, lookupSource: "parishes", ...prefill("business.parish"), mappings: to("liftClients", "address.parish") }),
    field("location", "zip", "ZIP code", "short_text", { required: true, ...prefill("business.zip") }),
    field("location", "principalPlace", "Is this the business's principal place of operation?", "yes_no", { required: true }),
    field("location", "additionalLocations", "Do you operate additional locations?", "yes_no", { required: true }),
    field("location", "additionalLocationsList", "List your additional locations (address and parish)", "long_text", { showIf: { fieldKey: "additionalLocations", operator: "is_true" } }),
    field("location", "attest", "I attest that the information above is accurate.", "checkbox", { required: true }),
    field("location", "signature", "Signature", "signature", { required: true }),
  ],
};

const readiness = (key: string, label: string): FormField =>
  field("readiness", key, label, "likert_scale", { required: true, scaleMin: 1, scaleMax: 5, scaleMinLabel: "Not ready", scaleMaxLabel: "Fully ready", mappings: to("liftBaselines", `readiness.${key}`) });

/** B4 - Baseline assessment survey. */
const baseline: FormDefinitionInput = {
  slug: "baseline-survey",
  title: "Baseline Assessment Survey",
  description: "A snapshot of your business today. We compare it with your 6- and 12-month check-ins to measure progress.",
  category: "Assessment",
  lifecycleRef: "B4",
  presentationMode: "conversational",
  audience: "client",
  completionMessage: "Thank you. Your baseline is recorded. Your advisor will use it to build your service plan.",
  pdfConfig: pdf("Baseline Assessment"),
  sections: [
    { id: "financials", title: "Revenue, jobs, and capital" },
    { id: "readiness", title: "Readiness self-assessment" },
  ],
  fields: [
    field("financials", "revenueLast12", "Gross revenue for the most recent 12 months", "currency", { required: true, ...prefill("business.annualRevenue"), mappings: to("liftBaselines", "revenueLast12MonthsCents", "currency_to_cents") }),
    field("financials", "employeesFullTime", "Full-time employees, including owners", "number", { required: true, ...prefill("business.employeesFullTime"), mappings: to("liftBaselines", "employeesFullTime", "number") }),
    field("financials", "employeesPartTime", "Part-time employees", "number", { required: true, ...prefill("business.employeesPartTime"), mappings: to("liftBaselines", "employeesPartTime", "number") }),
    field("financials", "annualPayroll", "Annual payroll", "currency", { mappings: to("liftBaselines", "annualPayrollCents", "currency_to_cents") }),
    field("financials", "capitalRaised", "Total capital raised to date (loans and investment)", "currency", { mappings: to("liftBaselines", "capitalRaisedCents", "currency_to_cents") }),
    field("financials", "capitalSources", "Sources of that capital", "short_text", { mappings: to("liftBaselines", "capitalSources") }),
    field("financials", "contractsHeld", "Number of current government or prime contracts", "number", { mappings: to("liftBaselines", "contractsHeld", "number") }),
    field("financials", "registeredWithSos", "Is the business registered with the Louisiana Secretary of State?", "yes_no", { required: true, mappings: to("liftBaselines", "registeredWithSos", "boolean") }),
    field("financials", "registrationDate", "Registration date", "date", { showIf: { fieldKey: "registeredWithSos", operator: "is_true" }, mappings: to("liftBaselines", "registrationDate") }),
    readiness("readinessCapital", "Access to capital"),
    readiness("readinessContracting", "Government contracting"),
    readiness("readinessFinancial", "Financial management"),
    readiness("readinessMarketing", "Marketing and sales"),
    readiness("readinessTechnology", "Technology and cybersecurity"),
    readiness("readinessOperations", "Operations and production"),
    field("readiness", "financialsUpload", "Upload supporting financials (optional)", "file_upload", {
      maxFiles: 3,
      helpText: "For example, a profit-and-loss statement or balance sheet. An AI assistant reads each file and summarizes it for your advisor. Do not upload Social Security numbers or account numbers.",
      mappings: to("liftBaselines", "financialsUpload"),
    }),
  ],
};

/** B5a - Service plan (staff). */
const servicePlan: FormDefinitionInput = {
  slug: "service-plan",
  title: "Client Service Plan",
  description: "Staff record the client's goals, planned services, and partner referrals after the assessment.",
  category: "Case management",
  lifecycleRef: "B5",
  presentationMode: "standard",
  audience: "staff",
  completionMessage: "Service plan saved.",
  pdfConfig: pdf("Client Service Plan"),
  sections: [{ id: "plan", title: "Service plan" }],
  fields: [
    field("plan", "liftClientId", "Client", "platform_lookup", { required: true, lookupSource: "lift_clients" }),
    field("plan", "goals", "Client goals mapped to measures", "repeating_table", {
      required: true,
      tableColumns: [
        { key: "measure", label: "Measure", type: "dropdown", options: MEASURES, required: true },
        { key: "description", label: "Goal", type: "text", required: true },
        { key: "targetDate", label: "Target date", type: "date" },
      ],
      mappings: to("liftServicePlans", "goals"),
    }),
    field("plan", "services", "Services planned", "repeating_table", {
      required: true,
      tableColumns: [
        { key: "serviceArea", label: "Service area", type: "dropdown", options: SERVICE_AREAS, required: true },
        { key: "provider", label: "Provider (Center or partner)", type: "text", required: true },
        { key: "status", label: "Status", type: "dropdown", options: ["Planned", "Active", "Done"] },
      ],
      mappings: to("liftServicePlans", "services"),
    }),
    field("plan", "referrals", "Referrals to partners", "repeating_table", {
      tableColumns: [
        { key: "partner", label: "Partner", type: "text", required: true },
        { key: "reason", label: "Reason", type: "text" },
        { key: "consentToShare", label: "Client consented to share data?", type: "dropdown", options: ["Yes", "No"], required: true },
        { key: "fieldsShared", label: "Fields shared", type: "text" },
      ],
      mappings: to("liftServicePlans", "referrals"),
    }),
    field("plan", "approvedBy", "Approved by", "platform_lookup", { required: true, lookupSource: "advisors", mappings: to("liftServicePlans", "approvedBy") }),
    field("plan", "approvalDate", "Approval date", "date", { required: true, mappings: to("liftServicePlans", "approvalDate") }),
  ],
};

/** B5b - Advisor session log (staff and partner advisors). */
const sessionLog: FormDefinitionInput = {
  slug: "advisor-session-log",
  title: "Advisor Session Log",
  description: "Log each counseling or technical-assistance session. One or more sessions counts the client as served.",
  category: "Case management",
  lifecycleRef: "B5",
  presentationMode: "standard",
  audience: "staff",
  completionMessage: "Session logged.",
  pdfConfig: pdf("Advisor Session Log"),
  sections: [{ id: "session", title: "Session" }],
  fields: [
    field("session", "liftClientId", "Client", "platform_lookup", { required: true, lookupSource: "lift_clients" }),
    field("session", "advisorId", "Advisor", "platform_lookup", { required: true, lookupSource: "advisors", mappings: to("liftSessions", "advisorId") }),
    field("session", "partnerOrg", "Partner organization (if any)", "platform_lookup", { lookupSource: "partners", mappings: to("liftSessions", "partnerOrg") }),
    field("session", "serviceArea", "Service area", "dropdown", { required: true, options: SERVICE_AREAS, mappings: to("liftSessions", "serviceArea") }),
    field("session", "sessionType", "Session type", "dropdown", { required: true, options: ["Counseling", "Technical assistance", "Assessment", "Training follow-up"], mappings: to("liftSessions", "sessionType") }),
    field("session", "sessionDate", "Session date", "date", { required: true, mappings: to("liftSessions", "sessionDate") }),
    field("session", "durationMinutes", "Duration (minutes)", "number", { required: true, mappings: to("liftSessions", "durationMinutes", "number") }),
    field("session", "notes", "Notes (staff only)", "long_text", { required: true, mappings: to("liftSessions", "notes") }),
    field("session", "nextSteps", "Next steps and client commitments", "long_text", { mappings: to("liftSessions", "nextSteps") }),
    field("session", "referralsMade", "Referrals made", "long_text", { mappings: to("liftSessions", "referralsMade") }),
  ],
};

/** B6a - Workshop registration. */
const workshopRegistration: FormDefinitionInput = {
  slug: "workshop-registration",
  title: "Workshop Registration",
  description: "Register for a LIFT Center workshop or webinar. LIFT training is free for eligible businesses.",
  category: "Training",
  lifecycleRef: "B6",
  presentationMode: "standard",
  audience: "public",
  completionMessage: "You're registered. Watch your email for event details.",
  pdfConfig: pdf("Workshop Registration"),
  sections: [
    { id: "registration", title: "Registration" },
    { id: "attendance", title: "Attendance (staff check-in)", staffOnly: true },
  ],
  fields: [
    field("registration", "eventId", "Which workshop are you registering for?", "platform_lookup", { required: true, lookupSource: "events", mappings: to("liftTrainingAttendance", "eventId") }),
    field("registration", "firstName", "First name", "short_text", { required: true, mappings: to("liftTrainingAttendance", "attendee.firstName") }),
    field("registration", "lastName", "Last name", "short_text", { required: true, mappings: to("liftTrainingAttendance", "attendee.lastName") }),
    field("registration", "email", "Email", "email", { required: true, ...prefill("contact.email"), mappings: to("liftTrainingAttendance", "attendee.email") }),
    field("registration", "phone", "Phone", "phone", { ...prefill("contact.phone"), mappings: to("liftTrainingAttendance", "attendee.phone") }),
    field("registration", "businessName", "Business name", "short_text", { ...prefill("business.name"), mappings: to("liftTrainingAttendance", "attendee.businessName") }),
    field("registration", "currentClient", "Are you a current LIFT client?", "yes_no", { required: true, mappings: to("liftTrainingAttendance", "currentClient", "boolean") }),
    field("registration", "parish", "Parish", "platform_lookup", { lookupSource: "parishes", ...prefill("business.parish"), mappings: to("liftTrainingAttendance", "attendee.parish") }),
    field("registration", "consentContact", "I consent to be contacted about LIFT Center services.", "checkbox", { required: true, mappings: to("liftTrainingAttendance", "consentContact") }),
    field("registration", "accommodation", "Do you need an accessibility or language accommodation?", "short_text", { mappings: to("liftTrainingAttendance", "accommodation") }),
    field("attendance", "attended", "Attended", "yes_no", { staffOnly: true, mappings: to("liftTrainingAttendance", "attended", "boolean") }),
    field("attendance", "minutesAttended", "Minutes attended", "number", { staffOnly: true, mappings: to("liftTrainingAttendance", "minutesAttended", "number") }),
  ],
};

/** B6b - Workshop feedback. */
const workshopFeedback: FormDefinitionInput = {
  slug: "workshop-feedback",
  title: "Workshop Feedback",
  description: "Tell us how the session went. It takes about two minutes.",
  category: "Training",
  lifecycleRef: "B6",
  presentationMode: "conversational",
  audience: "public",
  completionMessage: "Thank you for your feedback!",
  pdfConfig: pdf("Workshop Feedback"),
  sections: [{ id: "feedback", title: "Feedback" }],
  fields: [
    field("feedback", "eventId", "Which workshop did you attend?", "platform_lookup", { required: true, lookupSource: "events", mappings: to("liftFeedback", "eventId") }),
    field("feedback", "nps", "How likely are you to recommend this workshop to another business owner?", "nps", { required: true, mappings: to("liftFeedback", "nps") }),
    field("feedback", "overallRating", "Overall rating of the session", "rating_stars", { required: true, mappings: to("liftFeedback", "overallRating") }),
    field("feedback", "contentRelevant", "The content was relevant to my business.", "likert_scale", { required: true, scaleMin: 1, scaleMax: 5, scaleMinLabel: "Strongly disagree", scaleMaxLabel: "Strongly agree", mappings: to("liftFeedback", "contentRelevant") }),
    field("feedback", "applyWithin90", "I can apply what I learned within the next 90 days.", "likert_scale", { required: true, scaleMin: 1, scaleMax: 5, scaleMinLabel: "Strongly disagree", scaleMaxLabel: "Strongly agree", mappings: to("liftFeedback", "applyWithin90Days") }),
    field("feedback", "doDifferently", "What will you do differently as a result of this session?", "long_text", { mappings: to("liftFeedback", "doDifferently") }),
    field("feedback", "nextTopics", "What topics should LIFT offer next?", "long_text", { mappings: to("liftFeedback", "nextTopics") }),
    field("feedback", "followUp", "May we contact you for a follow-up session?", "yes_no", { mappings: to("liftFeedback", "followUp", "boolean") }),
  ],
};

export const LOAN_PACKAGE_DOCUMENTS = [
  "Business plan",
  "Business tax returns (2-3 years)",
  "Personal tax returns",
  "Year-to-date profit and loss",
  "Balance sheet",
  "Cash-flow projection",
  "Debt schedule",
  "Owner personal financial statement",
  "Business licenses and registration",
  "Collateral documentation",
];

/** B7 - Capital readiness checklist. */
const capitalReadiness: FormDefinitionInput = {
  slug: "capital-readiness",
  title: "Capital Readiness Checklist",
  description: "Build a lender- or investor-ready package. Download the document checklist to bring to your loan officer meeting.",
  category: "Capital",
  lifecycleRef: "B7",
  presentationMode: "standard",
  audience: "client",
  completionMessage: "Your capital package is saved. Your advisor will review it with you.",
  pdfConfig: pdf("Capital Readiness Checklist"),
  sections: [
    { id: "request", title: "Capital request" },
    { id: "documents", title: "Document checklist" },
  ],
  fields: [
    field("request", "capitalGuardrail", "The LIFT Center helps you prepare for third-party financing. Center and award funds are never used for loans, grants, or equity to businesses.", "statement"),
    field("request", "capitalPurpose", "Purpose of the capital", "long_text", { required: true, mappings: to("liftCapitalPackages", "purpose") }),
    field("request", "amountSought", "Amount sought", "currency", { required: true, mappings: to("liftCapitalPackages", "amountSoughtCents", "currency_to_cents") }),
    field("request", "capitalType", "Capital type", "dropdown", { required: true, options: ["Loan", "Line of credit", "Equity", "External grant", "Microloan", "Other"], mappings: to("liftCapitalPackages", "capitalType") }),
    field("request", "targetLenders", "Target lenders or investors", "long_text", { mappings: to("liftCapitalPackages", "targetLenders") }),
    field("documents", "checklistIntro", "Gather the documents below and bring them to your loan officer meeting. Download the LIFT checklist to track what you still need.", "statement"),
    field("documents", "loanPackageChecklist", "Download the LIFT document checklist (PDF)", "download", { downloadUrl: "/api/lift/checklists/capital-readiness" }),
    field("documents", "documentsReady", "Which documents do you already have?", "multi_select", {
      options: LOAN_PACKAGE_DOCUMENTS,
      mappings: to("liftCapitalPackages", "documentsReady"),
    }),
    field("documents", "notApplicable", "List any checklist items that do not apply", "long_text", { mappings: to("liftCapitalPackages", "notApplicable") }),
  ],
};

/** B8a - Capability library. */
const capabilityLibrary: FormDefinitionInput = {
  slug: "capability-library",
  title: "Capability Library",
  description: "Your verified company facts. The Proposal Accelerator drafts RFI and RFP responses only from this information.",
  category: "Procurement",
  lifecycleRef: "B8",
  presentationMode: "standard",
  audience: "client",
  completionMessage: "Your capability library is updated.",
  pdfConfig: pdf("Capability Library"),
  sections: [{ id: "library", title: "Capability library" }],
  fields: [
    field("library", "companyOverview", "Company overview", "long_text", { required: true, ...prefill("capabilities.summary"), mappings: to("liftCapabilityLibraries", "overview") }),
    field("library", "coreCompetencies", "Core competencies (one per line)", "long_text", { required: true, mappings: to("liftCapabilityLibraries", "coreCompetencies") }),
    field("library", "differentiators", "Differentiators", "long_text", { mappings: to("liftCapabilityLibraries", "differentiators") }),
    field("library", "pastPerformance", "Past performance", "repeating_table", {
      tableColumns: [
        { key: "customer", label: "Customer", type: "text", required: true },
        { key: "contractNumber", label: "Contract number", type: "text" },
        { key: "value", label: "Value", type: "currency" },
        { key: "period", label: "Period", type: "text" },
        { key: "description", label: "Description", type: "text" },
      ],
      mappings: to("liftCapabilityLibraries", "pastPerformance"),
    }),
    field("library", "certificationsHeld", "Certifications", "repeating_table", {
      tableColumns: [
        { key: "name", label: "Certification", type: "text", required: true },
        { key: "number", label: "Number", type: "text" },
        { key: "expiresOn", label: "Expiration", type: "date" },
      ],
      mappings: to("liftCapabilityLibraries", "certifications"),
    }),
    field("library", "keyPersonnel", "Key personnel", "repeating_table", {
      tableColumns: [
        { key: "name", label: "Name", type: "text", required: true },
        { key: "role", label: "Role", type: "text", required: true },
        { key: "summary", label: "Summary", type: "text" },
      ],
      mappings: to("liftCapabilityLibraries", "keyPersonnel"),
    }),
  ],
};

const respondYes = { fieldKey: "respond", operator: "is_true" as const };
const awarded = { fieldKey: "outcome", operator: "equals" as const, value: "Awarded" };

/** B8b - Opportunity response (Proposal Accelerator). */
const proposalResponse: FormDefinitionInput = {
  slug: "proposal-response",
  title: "SAM.gov Opportunity Response",
  description: "Track your response to a SAM.gov RFI, sources-sought notice, or RFP, from go/no-go through award.",
  category: "Procurement",
  lifecycleRef: "B8",
  presentationMode: "standard",
  audience: "client",
  postProcess: ["proposal_award"],
  completionMessage: "Your opportunity response is saved.",
  pdfConfig: pdf("Opportunity Response"),
  sections: [
    { id: "opportunity", title: "Opportunity" },
    { id: "response", title: "Response" },
    { id: "outcome", title: "Submission and outcome" },
  ],
  fields: [
    field("opportunity", "noticeId", "SAM.gov notice ID or solicitation number", "short_text", { required: true, mappings: to("liftProposalResponses", "noticeId") }),
    field("opportunity", "noticeTitle", "Notice title", "short_text", { mappings: to("liftProposalResponses", "noticeTitle") }),
    field("opportunity", "containsCui", "Do any attachments contain controlled unclassified (CUI) or export-controlled information?", "yes_no", { required: true, mappings: to("liftProposalResponses", "containsCui", "boolean") }),
    field("opportunity", "cuiWarning", "Do not upload CUI or export-controlled documents to this platform. Work with your advisor offline for those materials.", "statement", { showIf: { fieldKey: "containsCui", operator: "is_true" } }),
    field("opportunity", "respond", "Go / No-Go: do you intend to respond?", "yes_no", { required: true, mappings: to("liftProposalResponses", "go", "boolean") }),
    field("opportunity", "noGoReason", "Why not?", "long_text", { showIf: { fieldKey: "respond", operator: "is_false" }, mappings: to("liftProposalResponses", "noGoReason") }),
    field("response", "responseType", "Response type", "dropdown", { required: true, showIf: respondYes, options: ["RFI response", "Sources sought", "Capability statement", "RFP volume"], mappings: to("liftProposalResponses", "responseType") }),
    field("response", "teamingPartners", "Teaming partners to include", "long_text", { showIf: respondYes, mappings: to("liftProposalResponses", "teamingPartners") }),
    field("response", "claimsConfirmed", "I confirm every claim in the draft is accurate or has been removed.", "checkbox", { required: true, showIf: respondYes, mappings: to("liftProposalResponses", "claimsConfirmed") }),
    field("response", "advisorNotes", "Advisor review notes", "long_text", { staffOnly: true, mappings: to("liftProposalResponses", "advisorNotes") }),
    field("response", "clientApproval", "I approve finalizing this response.", "checkbox", { required: true, showIf: respondYes, mappings: to("liftProposalResponses", "clientApproved") }),
    field("outcome", "submitted", "Has the response been submitted?", "yes_no", { showIf: respondYes, mappings: to("liftProposalResponses", "submitted", "boolean") }),
    field("outcome", "submittedDate", "Submission date", "date", { showIf: { fieldKey: "submitted", operator: "is_true" }, mappings: to("liftProposalResponses", "submittedDate") }),
    field("outcome", "submissionMethod", "Submission method", "dropdown", { showIf: { fieldKey: "submitted", operator: "is_true" }, options: ["SAM.gov", "Email", "Agency portal", "Other"], mappings: to("liftProposalResponses", "submissionMethod") }),
    field("outcome", "outcome", "Outcome", "dropdown", { showIf: { fieldKey: "submitted", operator: "is_true" }, options: ["Pending", "Awarded", "Not awarded"], mappings: to("liftProposalResponses", "outcome") }),
    field("outcome", "awardAmount", "Award amount", "currency", { required: true, showIf: awarded, mappings: to("liftProposalResponses", "awardAmountCents", "currency_to_cents") }),
    field("outcome", "awardDate", "Award date", "date", { required: true, showIf: awarded, mappings: to("liftProposalResponses", "awardDate") }),
    field("outcome", "awardNotice", "Upload the award notice or contract", "file_upload", { required: true, showIf: awarded, maxFiles: 3 }),
  ],
};

const yesCapital = { fieldKey: "obtainedCapital", operator: "is_true" as const };
const yesContracts = { fieldKey: "wonContracts", operator: "is_true" as const };

/** B9 - Outcome check-in. */
const outcomeCheckin: FormDefinitionInput = {
  slug: "outcome-checkin",
  title: "Outcome Check-in",
  description: "Share your results at 6 and 12 months, or any time you reach a milestone. LIFT staff verify each outcome with your documentation.",
  category: "Outcomes",
  lifecycleRef: "B9",
  presentationMode: "conversational",
  audience: "client",
  postProcess: ["outcome_claims"],
  submitLabel: "Certify and submit",
  completionMessage: "Thank you. LIFT staff will review your outcomes and documentation.",
  pdfConfig: pdf("Outcome Check-in"),
  sections: [
    { id: "growth", title: "Revenue and jobs" },
    { id: "capital", title: "Capital and contracts" },
    { id: "other", title: "Other milestones" },
    { id: "certify", title: "Evidence and certification" },
  ],
  fields: [
    field("growth", "checkinType", "Which check-in is this?", "dropdown", { required: true, options: ["6-month", "12-month", "Outcome update"] }),
    field("growth", "baselineRevenue", "Revenue at baseline (from your baseline survey)", "currency", { helpText: "Filled in from your baseline survey when available." }),
    field("growth", "revenueLast12", "Gross revenue for the last 12 months", "currency", { required: true, ...prefill("business.annualRevenue") }),
    field("growth", "revenueChange", "Change in revenue since baseline", "calculated", { formula: "{revenueLast12} - {baselineRevenue}" }),
    field("growth", "employeesFullTime", "Current full-time employees", "number", { required: true, ...prefill("business.employeesFullTime") }),
    field("growth", "employeesPartTime", "Current part-time employees", "number", { required: true, ...prefill("business.employeesPartTime") }),
    field("growth", "jobsCreated", "How many jobs were created with LIFT assistance?", "number", { required: true }),
    field("growth", "jobsRetained", "How many jobs were retained with LIFT assistance?", "number", { required: true }),
    field("capital", "obtainedCapital", "Did you obtain capital since your last check-in?", "yes_no", { required: true }),
    field("capital", "capitalObtained", "Capital obtained", "repeating_table", {
      required: true,
      showIf: yesCapital,
      tableColumns: [
        { key: "source", label: "Source", type: "text", required: true },
        { key: "type", label: "Type", type: "dropdown", options: ["Loan", "Line of credit", "Equity", "External grant", "Microloan", "Other"] },
        { key: "amount", label: "Amount", type: "currency", required: true },
        { key: "closingDate", label: "Closing date", type: "date", required: true },
      ],
    }),
    field("capital", "wonContracts", "Did you win any contracts?", "yes_no", { required: true }),
    field("capital", "contractsWon", "Contracts won", "repeating_table", {
      required: true,
      showIf: yesContracts,
      tableColumns: [
        { key: "customer", label: "Customer", type: "text", required: true },
        { key: "contractNumber", label: "Contract number", type: "text" },
        { key: "value", label: "Value", type: "currency", required: true },
        { key: "awardDate", label: "Award date", type: "date", required: true },
        { key: "type", label: "Type", type: "dropdown", options: ["HUBZone", "Prime", "OEM", "Other"] },
      ],
    }),
    field("other", "registeredNewBusiness", "Did you register a new business?", "yes_no", { required: true }),
    field("other", "registrationDate", "Registration date", "date", { required: true, showIf: { fieldKey: "registeredNewBusiness", operator: "is_true" } }),
    field("other", "registrationNumber", "Registration number", "short_text", { showIf: { fieldKey: "registeredNewBusiness", operator: "is_true" } }),
    field("other", "newDigitalTools", "Which new digital tools did you adopt?", "multi_select", { options: DIGITAL_TOOLS.filter((item) => item !== "None") }),
    field("other", "completedReadiness", "Did you complete a certification-readiness program or certification?", "yes_no"),
    field("other", "readinessPrograms", "Which ones?", "multi_select", { showIf: { fieldKey: "completedReadiness", operator: "is_true" }, options: ["CMMC", "HUBZone", "Opportunity Zone", "8(a)", "Other"] }),
    field("certify", "attribution", "How did LIFT assistance contribute to these results?", "long_text", { required: true }),
    field("certify", "evidence", "Upload evidence for each outcome you reported", "file_upload", {
      helpText: "Examples: payroll record or signed jobs attestation, loan closing document, award notice, Secretary of State registration.",
      maxFiles: 10,
    }),
    field("certify", "certify", "I certify these outcomes are accurate and may be reported to MBDA.", "checkbox", { required: true }),
    field("certify", "signature", "Signature", "signature", { required: true }),
  ],
};

/** B10a - Impact story consent. */
const impactConsent: FormDefinitionInput = {
  slug: "impact-consent",
  title: "Impact Story Consent",
  description: "Help other rural businesses see what is possible by sharing your story.",
  category: "Impact",
  lifecycleRef: "B10",
  presentationMode: "standard",
  audience: "client",
  completionMessage: "Thank you for sharing your story.",
  pdfConfig: pdf("Impact Story Consent"),
  sections: [{ id: "story", title: "Your story" }],
  fields: [
    field("story", "shareStory", "May LIFT share your story publicly?", "yes_no", { required: true, mappings: to("liftImpactConsents", "shareStory", "boolean") }),
    field("story", "storyText", "Approved quote or story", "long_text", { showIf: { fieldKey: "shareStory", operator: "is_true" }, mappings: to("liftImpactConsents", "storyText") }),
    field("story", "photo", "Photo or logo", "file_upload", { showIf: { fieldKey: "shareStory", operator: "is_true" }, maxFiles: 2, accept: ["image/png", "image/jpeg", "image/webp"] }),
    field("story", "consentUse", "I consent to the use of my name, business name, and image in LIFT Center and MBDA communications.", "checkbox", { required: true, showIf: { fieldKey: "shareStory", operator: "is_true" }, mappings: to("liftImpactConsents", "consentToUse") }),
    field("story", "signature", "Signature", "signature", { required: true, showIf: { fieldKey: "shareStory", operator: "is_true" } }),
  ],
};

/** B10b - Program exit. */
const programExit: FormDefinitionInput = {
  slug: "program-exit",
  title: "Program Exit Survey",
  description: "Tell us about your experience with the LIFT Center.",
  category: "Impact",
  lifecycleRef: "B10",
  presentationMode: "conversational",
  audience: "client",
  completionMessage: "Thank you for being part of the LIFT Center.",
  pdfConfig: pdf("Program Exit Survey"),
  sections: [
    { id: "exit", title: "Your experience" },
    { id: "staff", title: "Exit details (staff)", staffOnly: true },
  ],
  fields: [
    field("exit", "satisfaction", "Overall, how satisfied are you with the LIFT Center?", "rating_stars", { required: true, mappings: to("liftExits", "satisfaction") }),
    field("exit", "nps", "How likely are you to recommend LIFT to another business owner?", "nps", { required: true, mappings: to("liftExits", "nps") }),
    field("exit", "mostHelpfulService", "Which service helped your business the most?", "dropdown", { options: [...SERVICE_AREAS, "One-on-one counseling", "Workshops and training"], mappings: to("liftExits", "mostHelpfulService") }),
    field("exit", "improve", "What should LIFT improve?", "long_text", { mappings: to("liftExits", "improve") }),
    field("exit", "stayConnected", "Would you like to stay connected as an alumni business or mentor?", "yes_no", { mappings: to("liftExits", "stayConnected", "boolean") }),
    field("staff", "exitReason", "Reason for exit", "dropdown", { staffOnly: true, options: ["Goals met", "Moved out of service area", "Business closed", "No longer responsive", "Other"], mappings: to("liftExits", "exitReason") }),
  ],
};

/** All LIFT lifecycle forms in Part B order. */
export const LIFT_FORM_TEMPLATES: FormDefinitionInput[] = [
  intake,
  mbdaIntake,
  ruralEligibility,
  baseline,
  servicePlan,
  sessionLog,
  workshopRegistration,
  workshopFeedback,
  capitalReadiness,
  capabilityLibrary,
  proposalResponse,
  outcomeCheckin,
  impactConsent,
  programExit,
];
