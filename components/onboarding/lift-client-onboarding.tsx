"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db, auth } from "@/lib/firebase";
import { doc, Timestamp, setDoc, getDoc } from "firebase/firestore";
import {
  OnboardingWizard,
  WizardStep,
  BusinessInfoStep,
  GovconStep,
  CapabilitiesStep,
  NeedsGoalsStep,
  OperationsStep,
  ContactInfoStep,
  ProgramStep,
  ReviewStep,
  initialSMEFormData,
  isManufacturingBusiness,
  AgencyInfoStep,
  RoleStep,
  ProcurementInterestsStep,
  ContactPreferencesStep,
  BuyerReviewStep,
  initialBuyerFormData,
} from "@/components/onboarding";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProgramBranding } from "@/lib/branding";
import { liftApi } from "@/components/forms/lift-api";
import type { FormValues } from "@/lib/form-builder/types";
import { checkWorksheet } from "@/lib/onboarding/worksheet-qc";

/** smeFormData key → the SME wizard step index containing that field. */
const SME_FIELD_STEP: Record<string, number> = {
  businessNotRegistered: 0, companyName: 0, dba: 0, applyingAs: 0, address: 0,
  city: 0, state: 0, zip: 0, website: 0, yearEstablished: 0, employeeCount: 0,
  stage: 0, revenueLast12: 0,
  primaryNaics: 1, secondaryNaics: 1, productsServices: 1, coreCapabilities: 1,
  pastPerformance: 1, keyDifferentiators: 1, digitalTools: 1,
  capabilityStatementFileName: 1, wantsCapabilityStatementHelp: 1,
  interestedInGovcon: 2, samRegistered: 2, dunsUei: 2, cageCode: 2,
  soldToGovernment: 2, certifications: 2, certificationsPlanned: 2,
  seekingCapital: 3, capitalPurpose: 3, capitalAmount: 3, topNeed: 3,
  barriers: 3, goals12Months: 3, preferredServices: 3, topNeeds: 3,
  acquisitionMethod: 4, openToTeaming: 4, outOfState: 4, inHouseBD: 4,
  resourcesToInvest: 4,
  contactName: 5, contactTitle: 5, contactEmail: 5, contactPhone: 5,
  mobilePhone: 5, preferredContactMethod: 5, noLinkedin: 5, linkedin: 5,
  ownerEthnicity: 5, secondaryContacts: 5,
  serviceArea: 6, referralSource: 6, referredBy: 6, referredByOther: 6, aiDisclosure: 6, privacyAck: 6,
  emailOptIn: 6, attachmentFiles: 6,
};

/** Maps wizard certification ids to the intake form's option labels. */
const CERT_ID_TO_OPTION: Record<string, string> = {
  "8a": "8(a)",
  wosb: "WOSB",
  edwosb: "EDWOSB",
  sdvosb: "SDVOSB",
  hubzone: "HUBZone",
  mbe: "MBE",
  dbe: "DBE",
  other: "Other",
};

/**
 * Maps the merged onboarding wizard data onto the LIFT intake form's field
 * keys, so the wizard submits through the same pipeline as any intake
 * (validation, liftClients mappings, AI summary, parish inference, and
 * attachment analysis all apply).
 */
/** Priority for deriving B2's single minority-certification answer from the multi-select. */
const MINORITY_CERT_PRIORITY: [string, string][] = [
  ["mbe", "MBE"],
  ["dbe", "DBE"],
  ["wosb", "WBE / WOSB"],
  ["edwosb", "WBE / WOSB"],
  ["8a", "8(a)"],
  ["hubzone", "HUBZone"],
  ["sdvosb", "SDVOSB"],
];

function buildIntakeValues(d: typeof initialSMEFormData): FormValues {
  const certOptions = (ids: string[]) => ids.map((id) => CERT_ID_TO_OPTION[id] ?? "Other");
  const minorityCert = MINORITY_CERT_PRIORITY.find(([id]) => d.certifications.includes(id))?.[1];
  const values: FormValues = {
    fullName: d.contactName,
    contactTitle: d.contactTitle,
    email: d.contactEmail,
    phone: d.contactPhone,
    mobilePhone: d.mobilePhone,
    preferredContactMethod:
      ({ email: "Email", phone: "Phone", either: "Either" } as Record<string, string>)[
        d.preferredContactMethod
      ] ?? "",
    noLinkedin: d.noLinkedin,
    linkedin: d.noLinkedin ? "" : d.linkedin,
    ownerEthnicity: d.ownerEthnicity,
    serviceArea: d.serviceArea,
    aiDisclosure: d.aiDisclosure,
    privacyAck: d.privacyAck,
    emailOptIn: d.emailOptIn,
    businessName: d.businessNotRegistered ? "Not registered yet" : d.companyName,
    dba: d.dba,
    applyingAs: d.applyingAs,
    address: d.address,
    city: d.city,
    zip: d.zip,
    productsServices: d.productsServices,
    naics: d.primaryNaics,
    stage: d.stage,
    employeesFullTime: d.employeeCount,
    samRegistered:
      d.interestedInGovcon === "yes" && (d.samRegistered === "registered" || d.samRegistered === "in-progress")
        ? "yes"
        : "no",
    uei: d.dunsUei,
    soldToGovernment: d.soldToGovernment === "yes" ? "yes" : "no",
    certifications: certOptions(d.certifications),
    certificationsPlanned: certOptions(d.certificationsPlanned),
    minorityCertification: minorityCert ?? "None",
    digitalTools: d.digitalTools,
    acquisitionMethod: d.acquisitionMethod,
    openToTeaming: d.openToTeaming === "yes" ? "yes" : "no",
    outOfState: d.outOfState === "yes" ? "yes" : "no",
    inHouseBD: d.inHouseBD === "yes" ? "yes" : "no",
    resourcesToInvest: d.resourcesToInvest === "yes" ? "yes" : "no",
    seekingCapital: d.seekingCapital === "yes" ? "yes" : "no",
    capitalPurpose: d.capitalPurpose,
    topNeed: d.topNeed,
    barriers: d.barriers,
    goals12Months: d.goals12Months,
    preferredServices: d.preferredServices,
    topNeeds: d.topNeeds,
    referralSource: d.referralSource,
    referredBy: d.referredBy,
    referredByOther: d.referredBy === "Other" ? d.referredByOther : "",
    attachments: d.attachmentFiles,
  };
  const money = (v: string) => {
    const n = Number(v.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };
  const revenue = money(d.revenueLast12);
  if (revenue !== undefined) values.revenueLast12 = revenue;
  const capital = d.seekingCapital === "yes" ? money(d.capitalAmount) : undefined;
  if (capital !== undefined) values.capitalAmount = capital;
  return values;
}

const yesNo = (v: unknown): string => (v === true ? "yes" : v === false ? "no" : "");
const strOf = (v: unknown): string => (typeof v === "string" ? v : "");
const arrOf = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
const numStr = (v: unknown): string => (typeof v === "number" && Number.isFinite(v) ? String(v) : "");

/**
 * Maps the users doc (written by a completed onboarding) back onto the SME
 * wizard's form shape so the Review step can display the submitted answers.
 */
function userDocToSmeData(d: Record<string, unknown>): typeof initialSMEFormData {
  return {
    ...initialSMEFormData,
    businessNotRegistered: d.businessNotRegistered === true,
    companyName: d.businessNotRegistered === true ? "" : strOf(d.company),
    dba: strOf(d.dba),
    applyingAs: strOf(d.applyingAs),
    address: strOf(d.address),
    city: strOf(d.city),
    state: strOf(d.state),
    zip: strOf(d.zip),
    website: strOf(d.website),
    yearEstablished: strOf(d.yearEstablished),
    employeeCount: strOf(d.employeeCount),
    stage: strOf(d.stage),
    revenueLast12: numStr(d.revenueLast12) || strOf(d.revenueLast12),
    primaryNaics: arrOf(d.primaryNaics),
    productsServices: arrOf(d.productsServices),
    coreCapabilities: strOf(d.coreCapabilities),
    pastPerformance: strOf(d.pastPerformance),
    keyDifferentiators: strOf(d.keyDifferentiators),
    digitalTools: arrOf(d.digitalTools),
    capabilityStatementFileName: strOf(d.capabilityStatementFileName),
    wantsCapabilityStatementHelp: d.wantsCapabilityStatementHelp === true,
    interestedInGovcon: yesNo(d.interestedInGovcon),
    samRegistered: strOf(d.samRegistered),
    dunsUei: strOf(d.dunsUei),
    cageCode: strOf(d.cageCode),
    soldToGovernment: yesNo(d.soldToGovernment),
    certifications: arrOf(d.certifications),
    certificationsPlanned: arrOf(d.certificationsPlanned),
    seekingCapital: yesNo(d.seekingCapital),
    capitalPurpose: strOf(d.capitalPurpose),
    capitalAmount: numStr(d.capitalAmount) || strOf(d.capitalAmount),
    topNeed: strOf(d.topNeed),
    barriers: strOf(d.barriers),
    goals12Months: strOf(d.goals12Months),
    preferredServices: arrOf(d.preferredServices),
    topNeeds: arrOf(d.topNeeds),
    acquisitionMethod: strOf(d.acquisitionMethod),
    openToTeaming: yesNo(d.openToTeaming),
    outOfState: yesNo(d.outOfState),
    inHouseBD: yesNo(d.inHouseBD),
    resourcesToInvest: yesNo(d.resourcesToInvest),
    contactName: [strOf(d.firstName), strOf(d.lastName)].filter(Boolean).join(" ").trim(),
    contactTitle: strOf(d.jobTitle),
    contactEmail: strOf(d.email),
    contactPhone: strOf(d.phone),
    mobilePhone: strOf(d.mobilePhone),
    preferredContactMethod: strOf(d.preferredContactMethod),
    noLinkedin: d.noLinkedin === true,
    linkedin: strOf(d.linkedin),
    ownerEthnicity: strOf(d.ownerEthnicity),
    secondaryContacts: Array.isArray(d.secondaryContacts)
      ? d.secondaryContacts.map((c) => ({
          name: strOf((c as Record<string, unknown>)?.name),
          email: strOf((c as Record<string, unknown>)?.email),
        }))
      : [],
    serviceArea: arrOf(d.serviceArea),
    referralSource: strOf(d.referralSource),
    referredBy: strOf(d.referredBy),
    referredByOther: strOf(d.referredByOther),
    aiDisclosure: d.aiDisclosureAcknowledged === true,
    privacyAck: d.privacyAcknowledged === true,
    emailOptIn: d.emailOptIn === true,
    signatureName: strOf(d.signatureName),
    attestationConfirmed: d.attestationConfirmed === true,
  };
}

/** Maps the users doc back onto the buyer wizard's form shape. */
function userDocToBuyerData(d: Record<string, unknown>): typeof initialBuyerFormData {
  return {
    ...initialBuyerFormData,
    agencyName: strOf(d.company),
    agencyType: strOf(d.agencyType),
    officeDivision: strOf(d.officeDivision),
    address: strOf(d.address),
    city: strOf(d.city),
    state: strOf(d.state),
    zip: strOf(d.zip),
    jobTitle: strOf(d.jobTitle),
    roleType: strOf(d.roleType),
    procurementAuthority: strOf(d.procurementAuthority),
    annualBudget: strOf(d.annualBudget),
    certificationPreferences: arrOf(d.certificationPreferences),
    contractTypes: arrOf(d.contractTypes),
    geographicPreferences: strOf(d.geographicPreferences),
    preferredContactMethod: strOf(d.preferredContactMethod),
    availabilityForIntros: strOf(d.availabilityForIntros),
    meetingPreferences: strOf(d.meetingPreferences),
  };
}

/** In-progress wizard answers, saved so a refresh or navigation doesn't lose work. */
interface OnboardingDraft {
  userType?: "sme" | "buyer";
  step?: number;
  sme?: Partial<typeof initialSMEFormData>;
  buyer?: Partial<typeof initialBuyerFormData>;
}

interface LiftClientOnboardingProps {
  /**
   * Called after onboarding completes and the profile is saved. Defaults to
   * routing to the SME dashboard.
   */
  onCompleted?: () => void;
  /** Called when the wizard is dismissed. Defaults to routing to /portal. */
  onDismissed?: () => void;
}

/**
 * The LIFT client onboarding wizard. Renders inline (not a modal) so it can be
 * embedded on the profile page or used as the standalone /portal/onboarding
 * page. The user's existing profile fields prefill the wizard so profile data
 * is captured once and updated in place.
 */
export function LiftClientOnboarding({ onCompleted, onDismissed }: LiftClientOnboardingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, updateProfile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"sme" | "buyer">("sme");
  const [smeFormData, setSmeFormData] = useState(initialSMEFormData);
  const [buyerFormData, setBuyerFormData] = useState(initialBuyerFormData);
  const [initialStep, setInitialStep] = useState(0);
  const [draftStep, setDraftStep] = useState(0);
  const [submittedView, setSubmittedView] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [intakeSubmissionId, setIntakeSubmissionId] = useState<string | null>(null);
  const uidRef = useRef("");
  const draftKeyRef = useRef("");
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef<OnboardingDraft>({});

  useEffect(() => {
    if (!profile.id) return;
    let cancelled = false;

    const init = async () => {
      const type = searchParams.get("type") === "buyer" ? "buyer" : "sme";
      setUserType(type);

      // `profile.id` may be a teamMembers doc id — the draft key and users doc
      // are keyed by the Firebase Auth uid.
      const uid = auth?.currentUser?.uid || profile.authUid || profile.id;
      uidRef.current = uid;
      draftKeyRef.current = `lift-onboarding-draft:${uid}:${type}`;

      // When onboarding is already complete, load the saved profile and show
      // the submitted answers read-only instead of bouncing the client out —
      // they should be able to re-open onboarding and see what they sent.
      const profileData = profile as { isOnboardingComplete?: boolean };
      if (profileData.isOnboardingComplete) {
        try {
          if (db && uid) {
            const snap = await getDoc(doc(db, "users", uid));
            const saved = snap.data() as Record<string, unknown> | undefined;
            if (saved && !cancelled) {
              if (type === "sme") setSmeFormData(userDocToSmeData(saved));
              else setBuyerFormData(userDocToBuyerData(saved));
              const completed = saved.onboardingCompletedAt;
              setSubmittedAt(
                (completed as { toDate?: () => Date })?.toDate?.()?.toLocaleDateString("en-US") ??
                  (typeof completed === "string" ? completed : null),
              );
              setIntakeSubmissionId(typeof saved.liftIntakeSubmissionId === "string" ? saved.liftIntakeSubmissionId : null);
            }
          }
        } catch (error) {
          console.error("Could not load submitted onboarding answers:", error);
        }
        if (cancelled) return;
        setSubmittedView(true);
        setLoading(false);
        return;
      }

      // Restore an in-progress draft — localStorage first (this device),
      // then the onboardingDraft field on the users doc (other devices).
      let restored = false;
      try {
        const raw = localStorage.getItem(draftKeyRef.current);
        const draft = raw ? (JSON.parse(raw) as OnboardingDraft) : null;
        if (draft && !cancelled) {
          if (draft.sme) setSmeFormData({ ...initialSMEFormData, ...draft.sme });
          if (draft.buyer) setBuyerFormData({ ...initialBuyerFormData, ...draft.buyer });
          setInitialStep(draft.step ?? 0);
          setDraftStep(draft.step ?? 0);
          restored = true;
        }
      } catch {
        // Malformed draft — fall through to profile prefill.
      }
      if (!restored && db && uid) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          const draft = snap.data()?.onboardingDraft as OnboardingDraft | undefined;
          if (draft && (draft.sme || draft.buyer) && !cancelled) {
            if (draft.sme) setSmeFormData({ ...initialSMEFormData, ...draft.sme });
            if (draft.buyer) setBuyerFormData({ ...initialBuyerFormData, ...draft.buyer });
            setInitialStep(draft.step ?? 0);
            setDraftStep(draft.step ?? 0);
            restored = true;
          }
        } catch (error) {
          console.error("Could not load onboarding draft:", error);
        }
      }
      if (cancelled) return;

      if (!restored) {
        // Prefill the wizard from the existing user profile so fields already
        // on the user's profile don't have to be re-entered.
        setSmeFormData((prev) => ({
          ...prev,
          contactName:
            prev.contactName ||
            [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim(),
          contactEmail: prev.contactEmail || profile.email || "",
          contactPhone: prev.contactPhone || profile.phone || "",
          contactTitle: prev.contactTitle || profile.jobTitle || "",
          companyName:
            prev.companyName ||
            profile.legalCompanyName ||
            profile.companyName ||
            profile.company ||
            "",
          website: prev.website || profile.website || "",
          address: prev.address || profile.address || "",
          city: prev.city || profile.city || "",
          state: prev.state || profile.state || "",
          zip: prev.zip || profile.zip || "",
          dunsUei: prev.dunsUei || profile.uei || profile.dunsNumber || "",
          cageCode: prev.cageCode || profile.cageCode || "",
          primaryNaics:
            prev.primaryNaics.length > 0
              ? prev.primaryNaics
              : profile.primaryNaics ?? profile.naicsCodes ?? [],
          certifications:
            prev.certifications.length > 0
              ? prev.certifications
              : profile.certifications ?? [],
        }));
      }

      setLoading(false);
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [profile, searchParams, router, onCompleted]);

  // Always-current draft snapshot so blur/page-hide handlers save fresh state.
  draftRef.current = { userType, step: draftStep, sme: smeFormData, buyer: buyerFormData };

  const flushDraft = useCallback(() => {
    if (!db || !uidRef.current || !draftKeyRef.current || submittedView) return;
    setDoc(
      doc(db, "users", uidRef.current),
      { onboardingDraft: { ...draftRef.current, updatedAt: Timestamp.now() } },
      { merge: true },
    ).catch((error) => console.error("Could not save onboarding draft:", error));
  }, [submittedView]);

  // Save as soon as any field loses focus — leaving an input is the client's
  // signal that an answer is finished, so persist immediately rather than
  // waiting for the periodic debounce.
  const handleFieldBlur = useCallback(() => {
    if (loading || submittedView || !draftKeyRef.current) return;
    localStorage.setItem(draftKeyRef.current, JSON.stringify(draftRef.current));
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null;
    flushDraft();
  }, [loading, submittedView, flushDraft]);

  // Flush on page hide / unload so the last field typed is never stranded.
  useEffect(() => {
    const flush = () => {
      if (submittedView) return;
      if (draftKeyRef.current) {
        localStorage.setItem(draftKeyRef.current, JSON.stringify(draftRef.current));
      }
      flushDraft();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [flushDraft, submittedView]);

  // Persist the draft on every change — localStorage immediately, and the
  // users doc debounced so it survives a different device or cleared storage.
  useEffect(() => {
    if (loading || submittedView || !draftKeyRef.current) return;
    localStorage.setItem(draftKeyRef.current, JSON.stringify(draftRef.current));
    draftTimerRef.current = setTimeout(flushDraft, 2000);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    };
  }, [smeFormData, buyerFormData, draftStep, userType, loading, submittedView, flushDraft]);

  const clearDraft = () => {
    if (draftKeyRef.current) localStorage.removeItem(draftKeyRef.current);
    if (db && uidRef.current) {
      setDoc(
        doc(db, "users", uidRef.current),
        { onboardingDraft: null },
        { merge: true },
      ).catch((error) => console.error("Could not clear onboarding draft:", error));
    }
  };

  const handleComplete = async () => {
    if (!db || !profile.id) return;

    try {
      // For LIFT clients, run the same field-by-field quality check used on
      // uploaded worksheets before anything is submitted. Required issues
      // block and jump to the step containing the problem; optional-format
      // issues warn but don't block (the worksheet flow lets users skip them).
      if (userType === "sme") {
        const qcInput = {
          ...(smeFormData as unknown as Record<string, unknown>),
          // Normalize formats people naturally type so QC judges the value,
          // not the punctuation ("$50,000", "est. 2010").
          revenueLast12: smeFormData.revenueLast12.replace(/[$,\s]/g, ""),
          capitalAmount: smeFormData.capitalAmount.replace(/[$,\s]/g, ""),
          yearEstablished: smeFormData.yearEstablished.match(/(19|20)\d{2}/)?.[0] ?? smeFormData.yearEstablished,
        };
        const qcIssues = checkWorksheet(qcInput);
        const blocking = qcIssues.filter((i) => i.required);
        if (blocking.length > 0) {
          const first = blocking[0];
          setDraftStep(SME_FIELD_STEP[first.key] ?? 0);
          toast.error(
            `${blocking.length} field${blocking.length === 1 ? "" : "s"} need${blocking.length === 1 ? "s" : ""} a quick fix before submitting`,
            { description: first.message },
          );
          return false;
        }
        if (qcIssues.length > 0) {
          toast.warning(
            `${qcIssues.length} optional field${qcIssues.length === 1 ? " looks" : "s look"} unusual — worth a second look when you can`,
            { description: qcIssues[0].message },
          );
        }
      }

      // For LIFT clients, submit the merged data through the intake pipeline
      // first — it validates, creates/links the liftClients record, runs the AI
      // summary, infers the parish, and analyzes attachments. The wizard only
      // completes when both records are written.
      let intakeResult: { submissionId: string; liftClientId?: string } | null = null;
      let companyId: string | null = null;

      const firebaseUid = auth?.currentUser?.uid;
      const userId = firebaseUid || profile.authUid || profile.id;
      const userRef = db ? doc(db, "users", userId) : null;

      if (userType === "sme") {
        try {
          intakeResult = await liftApi.submit("lift-intake", { values: buildIntakeValues(smeFormData) });
        } catch (error) {
          console.error("LIFT intake submission failed:", error);
          // Persist the answers anyway — a failed registry submission must not
          // lose what the client typed, and the draft stays for a retry.
          if (userRef) {
            await setDoc(userRef, buildUpdateData(false), { merge: true })
              .catch((saveError) => console.error("Partial onboarding save failed:", saveError));
          }
          toast.error(error instanceof Error ? error.message : "Could not record your intake. Please try again.");
          return false;
        }
      }

      // Link the user (and their LIFT client record) to a shared `companies`
      // doc — matched by UEI or normalized name so colleagues land on one
      // company record. Failure doesn't block onboarding.
      if (userType === "sme" && smeFormData.companyName.trim()) {
        try {
          const idToken = await auth?.currentUser?.getIdToken();
          if (!idToken) throw new Error("Not signed in");
          const linkResponse = await fetch("/api/companies/link", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({
              legalCompanyName: smeFormData.companyName,
              dba: smeFormData.dba,
              website: smeFormData.website,
              uei: smeFormData.dunsUei,
              cageCode: smeFormData.cageCode,
              address: { street: smeFormData.address, city: smeFormData.city, state: smeFormData.state, zip: smeFormData.zip },
              yearEstablished: smeFormData.yearEstablished,
              employeeCountRange: smeFormData.employeeCount,
              annualRevenueCents: smeFormData.revenueLast12 ? Math.round(Number(smeFormData.revenueLast12) * 100) : undefined,
              naicsCodes: smeFormData.primaryNaics,
              certifications: smeFormData.certifications,
              productsServices: smeFormData.productsServices,
              coreCapabilities: smeFormData.coreCapabilities,
              keyDifferentiators: smeFormData.keyDifferentiators,
              digitalTools: smeFormData.digitalTools,
              liftClientId: intakeResult?.liftClientId,
            }),
          });
          const linkBody = (await linkResponse.json()) as { data?: { companyId: string }; error?: string };
          if (!linkResponse.ok) throw new Error(linkBody.error || "Link failed");
          companyId = linkBody.data?.companyId ?? null;
        } catch (error) {
          console.error("Company link failed:", error);
          toast.warning("Profile saved, but your company record could not be linked. Staff can link it for you.");
        }
      }

      // Email each additional contact a sign-up link so they can create
      // their own account. Best-effort — never blocks onboarding.
      const contactsToInvite = smeFormData.secondaryContacts.filter(
        (c) => c.name.trim() && c.email.trim(),
      );
      if (userType === "sme" && contactsToInvite.length > 0) {
        try {
          const idToken = await auth?.currentUser?.getIdToken();
          if (!idToken) throw new Error("Not signed in");
          const inviteResponse = await fetch("/api/contacts/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({
              contacts: contactsToInvite.map((c) => ({ name: c.name.trim(), email: c.email.trim() })),
              companyName: smeFormData.companyName,
            }),
          });
          if (!inviteResponse.ok) {
            const inviteBody = (await inviteResponse.json().catch(() => ({}))) as { error?: string };
            throw new Error(inviteBody.error || "Invite failed");
          }
        } catch (error) {
          console.error("Contact invites failed:", error);
          toast.warning("Profile saved, but invite emails could not be sent. Your advisor can resend them.");
        }
      }

      function buildUpdateData(complete: boolean) {
        return userType === "sme"
        ? {
            email: profile.email,
            firstName: smeFormData.contactName?.split(" ")[0] || "",
            lastName: smeFormData.contactName?.split(" ").slice(1).join(" ") || "",
            company: smeFormData.businessNotRegistered ? "Not registered yet" : smeFormData.companyName,
            businessNotRegistered: smeFormData.businessNotRegistered,
            dba: smeFormData.dba,
            applyingAs: smeFormData.applyingAs,
            dunsUei: smeFormData.dunsUei,
            cageCode: smeFormData.cageCode,
            address: smeFormData.address,
            city: smeFormData.city,
            state: smeFormData.state,
            zip: smeFormData.zip,
            website: smeFormData.website,
            yearEstablished: smeFormData.yearEstablished,
            employeeCount: smeFormData.employeeCount,
            stage: smeFormData.stage,
            revenueLast12: smeFormData.revenueLast12 ? Number(smeFormData.revenueLast12) : null,
            certifications: smeFormData.certifications,
            certificationsPlanned: smeFormData.certificationsPlanned,
            interestedInGovcon: smeFormData.interestedInGovcon === "yes",
            samRegistered: smeFormData.samRegistered,
            soldToGovernment: smeFormData.soldToGovernment === "yes",
            isManufacturer: isManufacturingBusiness(smeFormData.primaryNaics),
            primaryNaics: smeFormData.primaryNaics,
            productsServices: smeFormData.productsServices,
            coreCapabilities: smeFormData.coreCapabilities,
            pastPerformance: smeFormData.pastPerformance,
            keyDifferentiators: smeFormData.keyDifferentiators,
            digitalTools: smeFormData.digitalTools,
            hasCapabilityStatement: Boolean(smeFormData.capabilityStatementFileId),
            capabilityStatementFileId: smeFormData.capabilityStatementFileId || null,
            capabilityStatementAttachmentId: smeFormData.capabilityStatementAttachmentId || null,
            capabilityStatementFileName: smeFormData.capabilityStatementFileName || null,
            wantsCapabilityStatementHelp: smeFormData.wantsCapabilityStatementHelp,
            seekingCapital: smeFormData.seekingCapital === "yes",
            capitalPurpose: smeFormData.capitalPurpose,
            capitalAmount: smeFormData.capitalAmount ? Number(smeFormData.capitalAmount) : null,
            topNeed: smeFormData.topNeed,
            barriers: smeFormData.barriers,
            goals12Months: smeFormData.goals12Months,
            preferredServices: smeFormData.preferredServices,
            topNeeds: smeFormData.topNeeds,
            serviceArea: smeFormData.serviceArea,
            referralSource: smeFormData.referralSource,
            referredBy: smeFormData.referredBy,
            referredByOther: smeFormData.referredBy === "Other" ? smeFormData.referredByOther : "",
            acquisitionMethod: smeFormData.acquisitionMethod,
            openToTeaming: smeFormData.openToTeaming === "yes",
            outOfState: smeFormData.outOfState === "yes",
            inHouseBD: smeFormData.inHouseBD === "yes",
            resourcesToInvest: smeFormData.resourcesToInvest === "yes",
            aiDisclosureAcknowledged: smeFormData.aiDisclosure,
            privacyAcknowledged: smeFormData.privacyAck,
            emailOptIn: smeFormData.emailOptIn,
            phone: smeFormData.contactPhone,
            mobilePhone: smeFormData.mobilePhone,
            jobTitle: smeFormData.contactTitle,
            linkedin: smeFormData.noLinkedin ? "" : smeFormData.linkedin,
            noLinkedin: smeFormData.noLinkedin,
            ownerEthnicity: smeFormData.ownerEthnicity,
            preferredContactMethod: smeFormData.preferredContactMethod,
            secondaryContacts: smeFormData.secondaryContacts.filter(
              (c) => c.name.trim() && c.email.trim(),
            ),
            liftClientId: intakeResult?.liftClientId ?? null,
            liftIntakeSubmissionId: intakeResult?.submissionId ?? null,
            companyId: companyId ?? null,
            signatureName: smeFormData.signatureName.trim(),
            attestationConfirmed: true,
            attestationSignedAt: Timestamp.now(),
            liftIntakePending: complete ? false : true,
            ...(complete ? { isOnboardingComplete: true, onboardingCompletedAt: Timestamp.now() } : {}),
            updatedAt: Timestamp.now(),
          }
        : {
            email: profile.email,
            firstName: "",
            lastName: "",
            company: buyerFormData.agencyName,
            agencyType: buyerFormData.agencyType,
            officeDivision: buyerFormData.officeDivision,
            address: buyerFormData.address,
            city: buyerFormData.city,
            state: buyerFormData.state,
            zip: buyerFormData.zip,
            jobTitle: buyerFormData.jobTitle,
            roleType: buyerFormData.roleType,
            procurementAuthority: buyerFormData.procurementAuthority,
            annualBudget: buyerFormData.annualBudget,
            certificationPreferences: buyerFormData.certificationPreferences,
            contractTypes: buyerFormData.contractTypes,
            geographicPreferences: buyerFormData.geographicPreferences,
            preferredContactMethod: buyerFormData.preferredContactMethod,
            availabilityForIntros: buyerFormData.availabilityForIntros,
            meetingPreferences: buyerFormData.meetingPreferences,
            ...(complete ? { isOnboardingComplete: true, onboardingCompletedAt: Timestamp.now() } : {}),
            updatedAt: Timestamp.now(),
          };
      }

      if (!userRef) throw new Error("Profile store unavailable");

      // Use setDoc with merge: true to create or update the document
      await setDoc(userRef, buildUpdateData(true), { merge: true });
      updateProfile({ isOnboardingComplete: true, onboardingCompletedAt: new Date().toISOString() });
      clearDraft();

      // Emails a PDF profile + service-gap report to LIFT staff.
      // Fire-and-forget — a failure here must never block completion.
      if (userType === "sme") {
        void auth?.currentUser?.getIdToken()
          .then((idToken) => {
            if (!idToken) return;
            return fetch("/api/onboarding/completion-report", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
              body: JSON.stringify({ sme: smeFormData }),
            });
          })
          .catch((reportError) => console.error("Onboarding completion report failed:", reportError));
      }

      toast.success(getProgramBranding().welcomeTitle, {
        description: "Your profile is ready. Let's get started!",
      });

      if (onCompleted) {
        onCompleted();
      } else {
        router.push(userType === "sme" ? "/portal/sme/dashboard" : "/portal/buyer/dashboard");
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Failed to save profile");
      return false;
    }
  };

  const handleDismiss = () => {
    // Keep the draft — dismissing means "finish later", and the wizard
    // restores where they left off on return.
    onDismissed ? onDismissed() : router.push("/portal");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Completed onboarding — show the submitted answers read-only so the client
  // can always come back and review what they sent.
  if (submittedView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Your onboarding is complete</h2>
                <p className="text-sm text-muted-foreground">
                  Submitted{submittedAt ? ` on ${submittedAt}` : ""}. Your answers are saved — review them below.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {intakeSubmissionId && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/lift/submissions/${intakeSubmissionId}/pdf`} target="_blank" rel="noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Download intake PDF
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/portal/onboarding-progress">View onboarding progress</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/portal/documents">View documents</Link>
              </Button>
              {onCompleted ? (
                <Button size="sm" onClick={onCompleted}>
                  Continue
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href="/portal">Back to portal</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {userType === "sme" ? (
          <ReviewStep formData={smeFormData} setFormData={() => undefined} readOnly />
        ) : (
          <BuyerReviewStep formData={buyerFormData} />
        )}
      </div>
    );
  }

  const smeSteps: WizardStep[] = [
    {
      id: "business-info",
      title: "Business Information",
      description: "Tell us about your company",
      component: <BusinessInfoStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if ((!smeFormData.businessNotRegistered && !smeFormData.companyName) || !smeFormData.address || !smeFormData.city || !smeFormData.state || !smeFormData.zip) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (!smeFormData.applyingAs || !smeFormData.stage || !smeFormData.employeeCount) {
          toast.error("Please select your entity type, business stage, and employee range");
          return false;
        }
        return true;
      },
    },
    {
      id: "capabilities",
      title: "Capabilities",
      description: "Describe your products, services, and NAICS codes",
      component: <CapabilitiesStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (smeFormData.productsServices.length === 0 || smeFormData.primaryNaics.length === 0 || !smeFormData.coreCapabilities) {
          toast.error("Please add at least one product/service, one NAICS code, and describe your capabilities");
          return false;
        }
        return true;
      },
    },
    {
      id: "govcon",
      title: "Government Contracting",
      description: "Your GOVCON readiness — SAM.gov, UEI, and certifications",
      component: <GovconStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.interestedInGovcon) {
          toast.error("Please tell us whether you're interested in government contracting");
          return false;
        }
        if (smeFormData.interestedInGovcon === "yes" && !smeFormData.samRegistered) {
          toast.error("Please select your SAM.gov registration status");
          return false;
        }
        return true;
      },
    },
    {
      id: "needs-goals",
      title: "Needs & Goals",
      description: "What your business needs most and where you're headed",
      component: <NeedsGoalsStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.seekingCapital) {
          toast.error("Please tell us whether you're seeking financing or investment");
          return false;
        }
        if (!smeFormData.topNeed || !smeFormData.barriers || !smeFormData.goals12Months) {
          toast.error("Please fill in your top need, barriers, and 12-month goals");
          return false;
        }
        if (smeFormData.preferredServices.length === 0) {
          toast.error("Please select at least one kind of help you're interested in");
          return false;
        }
        if (smeFormData.topNeeds.length === 0) {
          toast.error("Please pick the business needs most important to your company (up to 5)");
          return false;
        }
        if (smeFormData.topNeeds.length > 5) {
          toast.error("Please pick no more than 5 business needs");
          return false;
        }
        return true;
      },
    },
    {
      id: "operations",
      title: "Operations",
      description: "How your business wins and delivers work",
      component: <OperationsStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.acquisitionMethod) {
          toast.error("Please tell us how you currently get business");
          return false;
        }
        if (!smeFormData.openToTeaming || !smeFormData.outOfState || !smeFormData.inHouseBD || !smeFormData.resourcesToInvest) {
          toast.error("Please answer all four yes/no questions");
          return false;
        }
        return true;
      },
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can your LIFT advisor reach you?",
      component: <ContactInfoStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.contactName || !smeFormData.contactEmail || !smeFormData.contactPhone) {
          toast.error("Please fill in all required contact fields");
          return false;
        }
        if (!smeFormData.preferredContactMethod) {
          toast.error("Please select your preferred contact method");
          return false;
        }
        if (!smeFormData.noLinkedin && !smeFormData.linkedin.trim()) {
          toast.error("Please add your LinkedIn profile, or check the box if you don't have one");
          return false;
        }
        if (!smeFormData.ownerEthnicity) {
          toast.error("Please select the owner ethnicity");
          return false;
        }
        const incomplete = smeFormData.secondaryContacts.some(
          (c) => (c.name.trim() && !c.email.trim()) || (!c.name.trim() && c.email.trim()),
        );
        if (incomplete) {
          toast.error("Each additional contact needs both a name and an email — or remove the row");
          return false;
        }
        return true;
      },
    },
    {
      id: "program",
      title: "LIFT Program",
      description: "Service areas, supporting documents, and consents",
      component: <ProgramStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (smeFormData.serviceArea.length === 0) {
          toast.error("Please select at least one LIFT service area");
          return false;
        }
        if (!smeFormData.referralSource) {
          toast.error("Please tell us how you heard about the LIFT Center");
          return false;
        }
        if (!smeFormData.referredBy) {
          toast.error("Please tell us which organization referred you");
          return false;
        }
        if (smeFormData.referredBy === "Other" && !smeFormData.referredByOther.trim()) {
          toast.error("Please name the organization that referred you");
          return false;
        }
        if (!smeFormData.aiDisclosure) {
          toast.error("Please acknowledge the AI disclosure to continue");
          return false;
        }
        if (!smeFormData.privacyAck) {
          toast.error("Please acknowledge the privacy notice to continue");
          return false;
        }
        return true;
      },
    },
    {
      id: "review",
      title: "Review",
      description: "Review your profile before completing",
      component: <ReviewStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.attestationConfirmed) {
          toast.error("Please certify that your information is accurate");
          return false;
        }
        if (!smeFormData.signatureName.trim()) {
          toast.error("Please type your full legal name as your digital signature");
          return false;
        }
        return true;
      },
    },
  ];

  const buyerSteps: WizardStep[] = [
    {
      id: "agency-info",
      title: "Agency Information",
      description: "Tell us about your organization",
      component: <AgencyInfoStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      validate: () => {
        if (!buyerFormData.agencyName || !buyerFormData.agencyType) {
          toast.error("Please fill in agency name and type");
          return false;
        }
        return true;
      },
    },
    {
      id: "role",
      title: "Role & Responsibilities",
      description: "Tell us about your role",
      component: <RoleStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      validate: () => {
        if (!buyerFormData.jobTitle || !buyerFormData.roleType) {
          toast.error("Please fill in your job title and role type");
          return false;
        }
        return true;
      },
    },
    {
      id: "procurement",
      title: "Procurement Interests",
      description: "What types of contractors are you looking for?",
      component: <ProcurementInterestsStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      isOptional: true,
    },
    {
      id: "contact-prefs",
      title: "Contact Preferences",
      description: "How would you like to be contacted?",
      component: <ContactPreferencesStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      isOptional: true,
    },
    {
      id: "review",
      title: "Review",
      description: "Review your profile before completing",
      component: <BuyerReviewStep formData={buyerFormData} />,
    },
  ];

  return (
    <div onBlurCapture={handleFieldBlur}>
      <OnboardingWizard
        steps={userType === "sme" ? smeSteps : buyerSteps}
        userType={userType}
        onComplete={handleComplete}
        onDismiss={handleDismiss}
        initialStep={initialStep}
        step={draftStep}
        onStepChange={setDraftStep}
      />
    </div>
  );
}
