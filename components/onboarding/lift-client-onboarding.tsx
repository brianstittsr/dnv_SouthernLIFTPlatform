"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProgramBranding } from "@/lib/branding";
import { liftApi } from "@/components/forms/lift-api";
import type { FormValues } from "@/lib/form-builder/types";

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
    referralSource: d.referralSource,
    attachments: d.attachmentFiles,
  };
  if (d.revenueLast12) values.revenueLast12 = Number(d.revenueLast12);
  if (d.seekingCapital === "yes" && d.capitalAmount) values.capitalAmount = Number(d.capitalAmount);
  return values;
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
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"sme" | "buyer">("sme");
  const [smeFormData, setSmeFormData] = useState(initialSMEFormData);
  const [buyerFormData, setBuyerFormData] = useState(initialBuyerFormData);
  const [initialStep, setInitialStep] = useState(0);
  const [draftStep, setDraftStep] = useState(0);
  const uidRef = useRef("");
  const draftKeyRef = useRef("");

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

      // Check if onboarding is complete using optional chaining
      const profileData = profile as { isOnboardingComplete?: boolean };
      if (profileData.isOnboardingComplete) {
        onCompleted ? onCompleted() : router.push("/portal");
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

  // Persist the draft on every change — localStorage immediately, and the
  // users doc debounced so it survives a different device or cleared storage.
  useEffect(() => {
    if (loading || !draftKeyRef.current) return;
    const draft: OnboardingDraft = {
      userType,
      step: draftStep,
      sme: smeFormData,
      buyer: buyerFormData,
    };
    localStorage.setItem(draftKeyRef.current, JSON.stringify(draft));
    const timeout = setTimeout(() => {
      if (!db || !uidRef.current) return;
      setDoc(
        doc(db, "users", uidRef.current),
        { onboardingDraft: { ...draft, updatedAt: Timestamp.now() } },
        { merge: true },
      ).catch((error) => console.error("Could not save onboarding draft:", error));
    }, 2000);
    return () => clearTimeout(timeout);
  }, [smeFormData, buyerFormData, draftStep, userType, loading]);

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
      // For LIFT clients, submit the merged data through the intake pipeline
      // first — it validates, creates/links the liftClients record, runs the AI
      // summary, infers the parish, and analyzes attachments. The wizard only
      // completes when both records are written.
      let intakeResult: { submissionId: string; liftClientId?: string } | null = null;
      if (userType === "sme") {
        try {
          intakeResult = await liftApi.submit("lift-intake", { values: buildIntakeValues(smeFormData) });
        } catch (error) {
          console.error("LIFT intake submission failed:", error);
          toast.error(error instanceof Error ? error.message : "Could not record your intake. Please try again.");
          return false;
        }
      }

      // Link the user (and their LIFT client record) to a shared `companies`
      // doc — matched by UEI or normalized name so colleagues land on one
      // company record. Failure doesn't block onboarding.
      let companyId: string | null = null;
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

      const updateData = userType === "sme"
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
            serviceArea: smeFormData.serviceArea,
            referralSource: smeFormData.referralSource,
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
            isOnboardingComplete: true,
            onboardingCompletedAt: Timestamp.now(),
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
            isOnboardingComplete: true,
            onboardingCompletedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

      // Use Firebase Auth UID for user document
      const firebaseUid = auth?.currentUser?.uid;
      const userId = firebaseUid || profile.id;
      const userRef = doc(db, "users", userId);

      // Use setDoc with merge: true to create or update the document
      await setDoc(userRef, updateData, { merge: true });
      clearDraft();

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
      component: <ReviewStep formData={smeFormData} />,
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
    <OnboardingWizard
      steps={userType === "sme" ? smeSteps : buyerSteps}
      userType={userType}
      onComplete={handleComplete}
      onDismiss={handleDismiss}
      initialStep={initialStep}
      onStepChange={setDraftStep}
    />
  );
}
