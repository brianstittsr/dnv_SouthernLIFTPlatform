import { checkWorksheet } from "../lib/onboarding/worksheet-qc";

// Realistic completed wizard data (as the online wizard produces it)
const smeFormData: Record<string, unknown> = {
  companyName: "Bayou Metal Works LLC",
  businessNotRegistered: false,
  applyingAs: "LLC",
  address: "123 Main St", city: "Baton Rouge", state: "LA", zip: "70802",
  website: "https://bayoumetal.com",
  yearEstablished: "2015",
  employeeCount: "10-19",
  stage: "Operating business",
  revenueLast12: "500000",
  primaryNaics: ["332710 - Machine Shops"],
  productsServices: ["R425 - Support- Professional: Engineering/Technical", "CNC machining"],
  interestedInGovcon: "yes",
  samRegistered: "registered",
  dunsUei: "AB12CD34EF56",
  cageCode: "7XYZ1",
  soldToGovernment: "yes",
  certifications: ["8a", "hubzone"],
  seekingCapital: "yes",
  capitalAmount: "250000",
  topNeed: "Working capital",
  barriers: "Access to capital",
  goals12Months: "Win first federal contract",
  preferredServices: ["Government contracting"],
  acquisitionMethod: "Word of mouth",
  openToTeaming: "yes", outOfState: "yes", inHouseBD: "no", resourcesToInvest: "yes",
  contactName: "Jane Doe", contactTitle: "Owner",
  contactEmail: "jane@bayoumetal.com", contactPhone: "225-555-0100",
  preferredContactMethod: "email",
  noLinkedin: true, linkedin: "",
  ownerEthnicity: "Black or African American",
  serviceArea: ["Government contracting"],
  referralSource: "Southern University",
  aiDisclosure: true, privacyAck: true, emailOptIn: true,
  signatureName: "Jane Doe", attestationConfirmed: true,
};

// Same normalization handleComplete applies
const qcInput = {
  ...smeFormData,
  revenueLast12: (smeFormData.revenueLast12 as string).replace(/[$,\s]/g, ""),
  capitalAmount: (smeFormData.capitalAmount as string).replace(/[$,\s]/g, ""),
  yearEstablished: (smeFormData.yearEstablished as string).match(/(19|20)\d{2}/)?.[0] ?? smeFormData.yearEstablished,
};

const issues = checkWorksheet(qcInput);
console.log("Normal submission — issues:", issues.length, JSON.stringify(issues.map(i => `${i.key}(${i.required})`)));

// Now with messy-but-plausible optional fields
const messy = { ...qcInput, revenueLast12: "$500,000", capitalAmount: "about 250k", zip: "70802-1234", website: "bayoumetal" };
const messyNorm = { ...messy, revenueLast12: messy.revenueLast12.replace(/[$,\s]/g,""), capitalAmount: messy.capitalAmount.replace(/[$,\s]/g,"") };
const messyIssues = checkWorksheet(messyNorm);
console.log("Messy optional fields — blocking:", messyIssues.filter(i=>i.required).length, "| warnings:", messyIssues.filter(i=>!i.required).map(i=>i.key));

// Missing required
const missing = { ...qcInput, contactEmail: "bad", serviceArea: [], referralSource: "" };
const missIssues = checkWorksheet(missing);
console.log("Missing required — blocking:", missIssues.filter(i=>i.required).map(i=>i.key));
