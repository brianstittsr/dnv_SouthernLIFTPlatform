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

  // ---- Public marketing site ----
  /** Short site name used in nav/footer, e.g. "KDM & Associates" / "LIFT Center". */
  siteName: string;
  /**
   * Public origin for canonical URLs, sitemap, and JSON-LD. Reads
   * NEXT_PUBLIC_SITE_URL first; falls back to the per-mode default below.
   */
  siteUrl: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  logoSrc: string;
  logoAlt: string;
  /** Label for the authenticated area, e.g. "V+ Portal" / "LIFT Client Portal". */
  portalName: string;
  contactEmail: string;
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
  siteName: "KDM & Associates",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://kdm-assoc.com",
  siteTitle: "KDM & Associates | Defense Manufacturing, CMMC & Government Contracting",
  siteDescription:
    "KDM & Associates connects small manufacturers with government contracting opportunities, CMMC readiness, critical minerals, and access to capital through the V+KDM Consortium platform.",
  siteKeywords: [
    "KDM & Associates",
    "government contracting",
    "CMMC",
    "defense manufacturing",
    "critical minerals",
    "opportunity zones",
  ],
  logoSrc: "/kdm-logo.png",
  logoAlt: "KDM & Associates Logo",
  portalName: "V+ Portal",
  contactEmail: "info@kdm-assoc.com",
  contactPhone: "(202) 555-0100",
  contactAddress: "Washington, DC",
  copyrightName: "KDM & Associates",
  footerTagline:
    "Connecting small businesses with government contracting opportunities.",
  fundingAcknowledgment: "",
  blogName: "KDM Blog",
  blogTitle:
    "KDM Blog | Defense Manufacturing, CMMC, & Government Contracting Insights",
  blogDescription:
    "Insights on defense contracting, CMMC compliance, critical minerals, opportunity zones, and access to capital for small manufacturers.",
  blogKeywords: [
    "defense contracting",
    "CMMC",
    "government contracts",
    "small business",
    "manufacturing",
  ],
  blogCtaTitle: "Ready to Take the Next Step?",
  blogCtaBody:
    "Join the KDM Consortium platform to get matched with government contract opportunities and connect with defense-ready partners.",
  blogCtaPrimaryLabel: "Register as Supplier",
  blogCtaPrimaryHref: "/register?type=sme",
  blogCtaSecondaryLabel: "Register as Government Buyer",
  blogCtaSecondaryHref: "/register?type=buyer",
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
  logoSrc: "/kdm-logo.png",
  logoAlt: "Southern University LIFT Center Logo",
  portalName: "LIFT Client Portal",
  contactEmail: "liftcenter@sus.edu",
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
  blogCtaPrimaryHref: "/forms/lift-intake",
  blogCtaSecondaryLabel: "Browse Workshops & Events",
  blogCtaSecondaryHref: "/events",
};

/** Returns the active program branding (build-time setting, safe in client and server code). */
export function getProgramBranding(): ProgramBranding {
  return process.env.NEXT_PUBLIC_BRANDING_MODE === "lift" ? LIFT : KDM;
}
