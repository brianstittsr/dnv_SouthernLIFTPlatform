/**
 * Program branding for onboarding flows shared by the KDM site and the
 * Southern University LIFT deployment (LIFT_Onboarding_Questions.txt, Appendix 3).
 *
 * Set NEXT_PUBLIC_BRANDING_MODE=lift in the LIFT deployment. Default is "kdm",
 * so the KDM site is unchanged.
 */
import { LIFT_SERVICE_AREAS } from "@/lib/form-builder/controls";

export type BrandingMode = "kdm" | "lift";

export interface ProgramBranding {
  mode: BrandingMode;
  isLift: boolean;
  /** Organization name used in sentences, e.g. "Help needed from ___". */
  orgName: string;
  /** Program or community name used in welcome messages. */
  programName: string;
  registerDescription: string;
  howFoundLabel: string;
  helpNeededLabel: string;
  clientOnboardingIntro: string;
  servicesOfInterestDescription: string;
  primaryGoalsPlaceholder: string;
  contactConsentText: string;
  welcomeTitle: string;
  focusAreasLabel: string;
  focusAreasHelp: string;
  /** Options for the focus-area picker (id + label). */
  focusAreaOptions: { id: string; label: string }[];
  readinessReviewNote: string;
  dunsLabel: string;
  /** Skip the paid-membership payment step after the consortium profile pop-up. */
  skipPaymentStep: boolean;
  /** Hide the KDM affiliate onboarding wizard (out of scope for LIFT). */
  hideAffiliateWizard: boolean;
}

const KDM_FOCUS_AREAS = [
  { id: "us-manufacturing", label: "U.S. Manufacturing" },
  { id: "critical-minerals", label: "Critical Minerals" },
  { id: "defense-contracting", label: "Defense Contracting" },
  { id: "access-to-capital", label: "Access to Capital" },
  { id: "opportunity-zones", label: "Opportunity Zones" },
];

const KDM: ProgramBranding = {
  mode: "kdm",
  isLift: false,
  orgName: "KDM & Associates",
  programName: "KDM Consortium",
  registerDescription: "Register as a client with KDM & Associates",
  howFoundLabel: "How found KDM & Associates",
  helpNeededLabel: "Help needed from KDM & Associates",
  clientOnboardingIntro: "Complete your company profile to access KDM Consortium services and connect with our network of manufacturing experts.",
  servicesOfInterestDescription: "Select the KDM services you're interested in",
  primaryGoalsPlaceholder: "What are your main objectives for working with KDM Consortium?",
  contactConsentText: "By submitting this form, you consent to KDM Consortium contacting you about our services.",
  welcomeTitle: "Welcome to the KDM Consortium!",
  focusAreasLabel: "5 Pillars Focus Areas",
  focusAreasHelp: "Select which pillars your company serves:",
  focusAreaOptions: KDM_FOCUS_AREAS,
  readinessReviewNote: "Documents will be reviewed by KDM staff. You'll be notified once your readiness is validated.",
  dunsLabel: "DUNS Number",
  skipPaymentStep: false,
  hideAffiliateWizard: false,
};

const LIFT: ProgramBranding = {
  mode: "lift",
  isLift: true,
  orgName: "the LIFT Center",
  programName: "Southern University LIFT Center",
  registerDescription: "Register with the Southern University LIFT Center",
  howFoundLabel: "How did you hear about the LIFT Center?",
  helpNeededLabel: "What help are you looking for from the LIFT Center?",
  clientOnboardingIntro: "Complete your profile to access LIFT Center services.",
  servicesOfInterestDescription: "Select the LIFT services you're interested in",
  primaryGoalsPlaceholder: "What are your main objectives for working with the LIFT Center?",
  contactConsentText: "By submitting this form, you consent to the LIFT Center contacting you about its services.",
  welcomeTitle: "Welcome to the LIFT Center!",
  focusAreasLabel: "LIFT service areas",
  focusAreasHelp: "Select the LIFT service areas that fit your business:",
  focusAreaOptions: LIFT_SERVICE_AREAS.map((area) => ({ id: area, label: area })),
  readinessReviewNote: "Documents will be reviewed by LIFT staff. You'll be notified once your readiness is validated.",
  dunsLabel: "UEI (formerly DUNS)",
  skipPaymentStep: true,
  hideAffiliateWizard: true,
};

/** Returns the active program branding (build-time setting, safe in client and server code). */
export function getProgramBranding(): ProgramBranding {
  return process.env.NEXT_PUBLIC_BRANDING_MODE === "lift" ? LIFT : KDM;
}
