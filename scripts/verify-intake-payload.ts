/**
 * Validates a realistic buildIntakeValues() payload against the CURRENT
 * lift-intake template (lib/form-builder/lift-templates.ts), independent of
 * whatever version is seeded in Firestore.
 * Run: npx tsx scripts/verify-intake-payload.ts
 */
import { LIFT_FORM_TEMPLATES } from "../lib/form-builder/lift-templates";
import { validateFormValues } from "../lib/form-builder/validation";

// Mirrors buildIntakeValues() in components/onboarding/lift-client-onboarding.tsx
const wizardValues = {
  fullName: "Repro Tester",
  contactTitle: "Owner",
  email: "repro@example.com",
  phone: "555-123-4567",
  mobilePhone: "",
  preferredContactMethod: "Email",
  noLinkedin: true,
  linkedin: "",
  ownerEthnicity: "Black or African American",
  serviceArea: ["Procurement Readiness (CMMC / HUBZone / Opportunity Zones / Mentor-Protege)"],
  aiDisclosure: true,
  privacyAck: true,
  emailOptIn: true,
  businessName: "Repro Test LLC",
  dba: "",
  applyingAs: "LLC",
  address: "123 Main St",
  city: "Baton Rouge",
  zip: "70802",
  productsServices: ["R425 - Support- Professional: Engineering/Technical"],
  naics: ["541511 - Custom Computer Programming Services"],
  stage: "Operating business",
  employeesFullTime: "1-4",
  samRegistered: "no",
  uei: "",
  soldToGovernment: "no",
  certifications: [],
  certificationsPlanned: [],
  minorityCertification: "None",
  digitalTools: ["Website"],
  acquisitionMethod: "Referrals",
  openToTeaming: "yes",
  outOfState: "yes",
  inHouseBD: "no",
  resourcesToInvest: "yes",
  seekingCapital: "no",
  capitalPurpose: "",
  topNeed: "Win first federal contract",
  barriers: "No past performance",
  goals12Months: "One contract",
  preferredServices: ["Government contracting"],
  referralSource: "Web search",
  attachments: [],
  revenueLast12: 50000,
};

const template = LIFT_FORM_TEMPLATES.find((t) => t.slug === "lift-intake");
if (!template) throw new Error("lift-intake template missing");
const result = validateFormValues(template.fields as never, template.sections, wizardValues, { isStaff: false });
if (!result.ok) {
  console.error("INVALID against current template:", JSON.stringify(result.errors, null, 2));
  process.exit(1);
}
console.log("VALID: wizard payload passes the current lift-intake template");
