/**
 * Regenerates the LIFT client onboarding completion report for a user who
 * already completed onboarding, and archives the PDF in portal Documents
 * (same code path as POST /api/onboarding/completion-report).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/rerun-onboarding-report.ts [selector]
 *
 * The selector may be a users-doc uid, an email, or a name (default
 * "Manpreet Hundal"). Pass --send-email to also resend the staff email.
 */
import { db } from "../lib/firebase-admin";
import {
  analyzeServiceGaps,
  buildEmailHtml,
  buildReportHtml,
  recommendAdditionalServices,
  type SmeAnswers,
} from "../lib/onboarding/completion-report";
import { archiveOnboardingReportPdf } from "../lib/onboarding/report-archive";
import { renderHtmlToPdf } from "../lib/form-builder/server/pdf";
import { sendEmail } from "../lib/email";

const args = process.argv.slice(2);
const sendEmailFlag = args.includes("--send-email");
const selector = args.find((a) => !a.startsWith("--")) ?? "Manpreet Hundal";

const RECIPIENTS = (process.env.LIFT_REPORT_RECIPIENTS ??
  "bstitt@strategicvalueplus.com,mhundal@kdm-assoc.com")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean);

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const yn = (v: unknown): string => (v === true ? "yes" : v === false ? "no" : str(v));
const num = (v: unknown): string => (typeof v === "number" && Number.isFinite(v) ? String(v) : str(v));

/** Locates the users doc by uid, email, or display/first+last name. */
async function findUserDoc(sel: string): Promise<{ id: string; data: Record<string, unknown> }> {
  if (!db) throw new Error("Database not initialized");

  const byId = await db.collection("users").doc(sel).get();
  if (byId.exists) return { id: byId.id, data: byId.data() as Record<string, unknown> };

  const emailHit = await db.collection("users").where("email", "==", sel).limit(1).get();
  if (!emailHit.empty) {
    const doc = emailHit.docs[0];
    return { id: doc.id, data: doc.data() as Record<string, unknown> };
  }

  const needle = sel.toLowerCase();
  const snapshot = await db.collection("users").get();
  const matches = snapshot.docs.filter((doc) => {
    const d = doc.data();
    const full = `${str(d.firstName)} ${str(d.lastName)}`.trim().toLowerCase();
    return [str(d.displayName).toLowerCase(), full, str(d.email).toLowerCase()].includes(needle);
  });
  if (matches.length === 0) throw new Error(`No users doc found for "${sel}"`);
  if (matches.length > 1) {
    throw new Error(
      `Multiple users match "${sel}": ${matches.map((d) => `${d.id} (${str(d.data().email)})`).join(", ")}`,
    );
  }
  return { id: matches[0].id, data: matches[0].data() as Record<string, unknown> };
}

/**
 * Rebuilds the wizard's sme answers from the fields handleComplete() wrote to
 * the users doc — booleans/numbers are converted back to the yes/no and
 * string formats the report generator expects.
 */
function smeAnswersFromUserDoc(d: Record<string, unknown>): SmeAnswers {
  return {
    contactName:
      [str(d.firstName), str(d.lastName)].filter(Boolean).join(" ").trim() || str(d.displayName),
    contactEmail: str(d.email),
    contactPhone: str(d.phone),
    mobilePhone: str(d.mobilePhone),
    preferredContactMethod: str(d.preferredContactMethod),
    contactTitle: str(d.jobTitle),
    noLinkedin: d.noLinkedin === true,
    linkedin: str(d.linkedin),
    ownerEthnicity: str(d.ownerEthnicity),
    companyName: str(d.company),
    businessNotRegistered: d.businessNotRegistered === true,
    dba: str(d.dba),
    applyingAs: str(d.applyingAs),
    address: str(d.address),
    city: str(d.city),
    state: str(d.state),
    zip: str(d.zip),
    website: str(d.website),
    yearEstablished: str(d.yearEstablished),
    employeeCount: str(d.employeeCount),
    stage: str(d.stage),
    revenueLast12: num(d.revenueLast12),
    primaryNaics: Array.isArray(d.primaryNaics) ? d.primaryNaics : [],
    productsServices: Array.isArray(d.productsServices) ? d.productsServices : [],
    coreCapabilities: str(d.coreCapabilities),
    pastPerformance: str(d.pastPerformance),
    keyDifferentiators: str(d.keyDifferentiators),
    digitalTools: Array.isArray(d.digitalTools) ? d.digitalTools : [],
    capabilityStatementFileName: str(d.capabilityStatementFileName),
    wantsCapabilityStatementHelp: d.wantsCapabilityStatementHelp === true,
    interestedInGovcon: yn(d.interestedInGovcon),
    samRegistered: str(d.samRegistered),
    dunsUei: str(d.dunsUei),
    cageCode: str(d.cageCode),
    soldToGovernment: yn(d.soldToGovernment),
    certifications: Array.isArray(d.certifications) ? d.certifications : [],
    certificationsPlanned: Array.isArray(d.certificationsPlanned) ? d.certificationsPlanned : [],
    seekingCapital: yn(d.seekingCapital),
    capitalPurpose: str(d.capitalPurpose),
    capitalAmount: num(d.capitalAmount),
    topNeed: str(d.topNeed),
    barriers: str(d.barriers),
    goals12Months: str(d.goals12Months),
    preferredServices: Array.isArray(d.preferredServices) ? d.preferredServices : [],
    topNeeds: Array.isArray(d.topNeeds) ? d.topNeeds : [],
    serviceArea: Array.isArray(d.serviceArea) ? d.serviceArea : [],
    referralSource: str(d.referralSource),
    referredBy: str(d.referredBy),
    acquisitionMethod: str(d.acquisitionMethod),
    openToTeaming: yn(d.openToTeaming),
    outOfState: yn(d.outOfState),
    inHouseBD: yn(d.inHouseBD),
    resourcesToInvest: yn(d.resourcesToInvest),
  };
}

async function main() {
  const user = await findUserDoc(selector);
  const sme = smeAnswersFromUserDoc(user.data);
  console.log(`User: ${sme.contactName || user.id} <${sme.contactEmail}> — company: ${sme.companyName || "?"}`);
  if (user.data.isOnboardingComplete !== true) {
    console.warn("Warning: isOnboardingComplete is not true on this users doc — regenerating anyway.");
  }

  const gaps = analyzeServiceGaps(sme);
  const aiRecs = await recommendAdditionalServices(sme, gaps);
  const pdf = await renderHtmlToPdf(buildReportHtml(sme, gaps, aiRecs));
  console.log(`Report rendered: ${gaps.length} service gaps, ${aiRecs.length} AI recommendations, ${pdf.length} bytes`);

  const company = str(sme.companyName) || "New client";
  const fileName = `LIFT-Onboarding-Report-${company.replace(/[^a-z0-9]+/gi, "-")}.pdf`;
  const archived = await archiveOnboardingReportPdf({
    pdf,
    fileName,
    ownerName: str(sme.contactName) || company,
    ownerUid: user.id,
    companyId: (user.data.companyId as string | undefined) ?? null,
    companyName: company,
  });
  console.log(`Archived to portal Documents: ${fileName} (document ${archived.documentId}, file ${archived.fileId})`);

  if (sendEmailFlag) {
    const result = await sendEmail({
      to: RECIPIENTS,
      subject: `LIFT onboarding complete: ${company}`,
      html: buildEmailHtml(sme, gaps, aiRecs),
      text: `${company} completed LIFT onboarding. Identified services: ${gaps.map((g) => g.service).join(", ") || "none"}. See attached PDF.`,
      attachments: [{ filename: fileName, content: pdf, contentType: "application/pdf" }],
    });
    console.log(result.success ? `Email sent to ${RECIPIENTS.join(", ")}` : `Email failed: ${result.error}`);
  } else {
    console.log("Staff email not resent (pass --send-email to resend).");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
