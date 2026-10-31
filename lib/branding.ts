/**
 * Program branding for the Southern University MBDA LIFT Rural Business
 * Center deployment (LIFT_Onboarding_Questions.txt, Appendix 3).
 *
 * This codebase is LIFT-only — KDM branding was removed. getProgramBranding()
 * keeps its original signature and `isLift: true` so existing callers and
 * ternaries resolve to the LIFT branch.
 */
import { LIFT_SERVICE_AREAS } from "@/lib/form-builder/controls";

export type BrandingMode = "lift";

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
  /** Skip the paid-membership payment step — LIFT services are no-cost. */
  skipPaymentStep: boolean;
  /** Hide the affiliate onboarding wizard (out of scope for LIFT). */
  hideAffiliateWizard: boolean;

  // ---- Public marketing site ----
  siteName: string;
  /**
   * Public origin for canonical URLs, sitemap, and JSON-LD. Reads
   * NEXT_PUBLIC_SITE_URL first; falls back to the default below.
   */
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  logoSrc: string;
  logoAlt: string;
  /** Label for the authenticated area, e.g. "LIFT Client Portal". */
  portalName: string;
  contactEmail: string;
  /** Address that receives contact-form notification emails (the "to"). */
  contactFormRecipient: string;
  contactPhone: string;
  contactAddress: string;
  copyrightName: string;
  footerTagline: string;
  /** Federal funding acknowledgment shown in the footer (empty = none). */
  fundingAcknowledgment: string;

  // ---- Blog ----
  blogName: string;
  blogTitle: string;
  blogDescription: string;
  blogKeywords: string[];
  blogCtaTitle: string;
  blogCtaBody: string;
  blogCtaPrimaryLabel: string;
  blogCtaPrimaryHref: string;
  blogCtaSecondaryLabel: string;
  blogCtaSecondaryHref: string;
}

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
  siteName: "Southern University LIFT Center",
  // TODO: replace with the real LIFT domain before launch (open question in the
  // public-site plan). NEXT_PUBLIC_SITE_URL overrides this at build time.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://lift.southern.edu",
  siteTitle:
    "Southern University MBDA LIFT Rural Business Center | No-Cost Small Business Support",
  siteDescription:
    "The Southern University MBDA LIFT Rural Business Center provides no-cost technical assistance, training, capital readiness, and government contracting support to rural Louisiana small businesses.",
  siteKeywords: [
    "LIFT Center",
    "Southern University",
    "MBDA",
    "rural business",
    "small business assistance",
    "government contracting readiness",
    "capital readiness",
    "Louisiana",
  ],
  // TODO: replace with the approved LIFT/MBDA/Southern logo asset when supplied.
  // The UI uses a text wordmark; this path is only referenced in JSON-LD.
  logoSrc: "/favicon.ico",
  logoAlt: "Southern University LIFT Center Logo",
  portalName: "LIFT Client Portal",
  contactEmail: "liftcenter@sus.edu",
  contactFormRecipient: "patrick.mensah@sus.edu",
  contactPhone: "(225) 771-0000",
  contactAddress: "Southern University, Baton Rouge, LA",
  copyrightName: "Southern University LIFT Center",
  footerTagline:
    "No-cost business support for rural Louisiana entrepreneurs and small businesses.",
  fundingAcknowledgment:
    "Funded in part by the U.S. Department of Commerce, Minority Business Development Agency (MBDA).",
  blogName: "LIFT Blog",
  blogTitle: "LIFT Blog | Rural Business Resources & Center News",
  blogDescription:
    "Resources, training highlights, and success stories from the Southern University LIFT Rural Business Center — covering capital readiness, procurement readiness, advanced manufacturing, digital & AI adoption, and rural entrepreneurship.",
  blogKeywords: [
    "LIFT Center",
    "rural business",
    "small business",
    "capital readiness",
    "procurement readiness",
    "Louisiana",
  ],
  blogCtaTitle: "Ready to Grow Your Business?",
  blogCtaBody:
    "The LIFT Center offers no-cost advising, training, and contracting-readiness support to rural Louisiana small businesses. Start with a short intake interview.",
  blogCtaPrimaryLabel: "Start the LIFT Intake",
  blogCtaPrimaryHref: "/sign-up",
  blogCtaSecondaryLabel: "Browse Workshops & Events",
  blogCtaSecondaryHref: "/events",
};

/** Returns the LIFT program branding (safe in client and server code). */
export function getProgramBranding(): ProgramBranding {
  return LIFT;
}
