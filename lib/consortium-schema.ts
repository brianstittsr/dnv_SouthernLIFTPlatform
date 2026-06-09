/**
 * KDM Consortium Intelligence Platform - Comprehensive Data Schema
 * 
 * This file defines the complete data structures for the KDM Consortium Intelligence Platform,
 * including company intelligence profiles, readiness scores, AI matching, membership tiers,
 * partner directory, performance metrics, and E2G alignment data.
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// BASE TYPES
// ============================================================================

export type OnboardingStage = 
  | "discovery_intake"
  | "account_creation"
  | "profile_build"
  | "readiness_validation"
  | "matching_activation"
  | "engagement_tracking";

export type OnboardingStatus = 
  | "not_started"
  | "in_progress"
  | "profile_complete"
  | "readiness_validated"
  | "matching_active"
  | "fully_onboarded";

export type MembershipTier = "founder" | "core_capture" | "elite" | "standard";

export type ReferralSource = 
  | "hcnc_network"
  | "sba_district_office"
  | "industry_event"
  | "existing_member"
  | "direct_marketing"
  | "other";

export type ContractType = "fixed_price" | "cost_plus" | "time_and_materials" | "other";

export type TeamingRole = "prime" | "subcontractor" | "joint_venture" | "mentor_protege";

export type E2GPillar = 
  | "ai_automation"
  | "agricultural_modernization"
  | "workforce_development"
  | "quality_systems"
  | "business_growth";

export type E2GRegion = "MD" | "VA" | "PA" | "WV" | "all";

// ============================================================================
// COMPANY IDENTITY DATA
// ============================================================================

export interface CompanyIdentity {
  legalCompanyName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  companyDescription: string; // Public pitch
  ceoBiography?: string;
  companyLogo?: string;
  yearsInBusiness: number;
  annualRevenueRange: string; // e.g., "$0-500K", "$500K-2M", "$2M-10M", "$10M+"
  employeeCountRange: string; // e.g., "1-10", "11-50", "51-200", "200+"
  website?: string;
  dunsNumber?: string;
}

// ============================================================================
// INDUSTRY CLASSIFICATION (NAICS CODES)
// ============================================================================

export interface NAICSCode {
  code: string; // 6-digit NAICS code
  description: string;
  isPrimary: boolean;
}

// ============================================================================
// CERTIFICATIONS & SET-ASIDE DESIGNATIONS
// ============================================================================

export type CertificationType = 
  | "8a"
  | "wosb"
  | "sdvosb"
  | "hubzone"
  | "cmmc_level1"
  | "cmmc_level2"
  | "cmmc_level3"
  | "mbe"
  | "dbe"
  | "iso_9001"
  | "iso_27001"
  | "other";

export interface Certification {
  type: CertificationType;
  certificationNumber?: string;
  issuingAgency?: string;
  issueDate?: Timestamp;
  expirationDate?: Timestamp;
  isActive: boolean;
  documentationUrl?: string;
}

// ============================================================================
// CORE CAPABILITIES & EXPERTISE
// ============================================================================

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
  yearsExperience: number;
  keyDifferentiators: string[];
  relevantProjects: string[];
}

export interface ServiceOffering {
  name: string;
  description: string;
  targetMarkets: string[];
  pricingModel?: string;
  deliveryMethods: string[];
}

export interface TechnologySpecialization {
  technology: string;
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  yearsExperience: number;
  certifications?: string[];
}

// ============================================================================
// PAST PERFORMANCE & TRACK RECORD
// ============================================================================

export interface PastPerformance {
  id: string;
  contractTitle: string;
  clientName: string;
  contractValue?: string;
  contractType: ContractType;
  startDate: Timestamp;
  endDate?: Timestamp;
  description: string;
  outcomes: string[];
  keyDifferentiators: string[];
  clientReference?: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  documentationUrl?: string;
}

// ============================================================================
// GOVERNMENT CONTRACTING PROFILE
// ============================================================================

export interface GovernmentContractingProfile {
  cageCode?: string;
  uei?: string; // Unique Entity ID
  samRegistrationStatus: "not_registered" | "pending" | "active" | "expired";
  samRegistrationDate?: Timestamp;
  samExpirationDate?: Timestamp;
  gsaScheduleHolder: boolean;
  gsaScheduleNumbers?: string[];
  preferredContractTypes: ContractType[];
  contractSizePreferences: string[]; // e.g., "$0-100K", "$100K-500K", "$500K-1M", "$1M+"
  setAsidePreferences: CertificationType[];
  pastFederalContracts: number;
  federalContractValue?: string;
}

// ============================================================================
// GEOGRAPHIC COVERAGE
// ============================================================================

export interface GeographicCoverage {
  statesServed: string[]; // State abbreviations
  regionsServed: string[]; // e.g., "Appalachian", "Mid-Atlantic"
  geographicServiceArea: string;
  willingToDeployToRural: boolean;
  ruralDeploymentExperience: boolean;
  ruralRegionsServed?: string[];
  internationalCoverage?: string[];
}

// ============================================================================
// TEAMING PREFERENCES
// ============================================================================

export interface TeamingPreferences {
  willingToPrime: boolean;
  willingToSub: boolean;
  seekingPartners: boolean;
  idealPartnerProfile: string;
  contractSizePreferences: string[];
  setAsidePreferences: CertificationType[];
  teamingRolePreferences: TeamingRole[];
  preferredPartnerSize?: string; // e.g., "small", "medium", "large", "any"
  geographicPreferences?: string[];
}

// ============================================================================
// CONSORTIUM PILLAR ALIGNMENT
// ============================================================================

export interface ConsortiumPillarAlignment {
  pillars: E2GPillar[];
  marketplaceSellerProfile: string;
  primaryServiceCategories: string[];
  secondaryServiceCategories?: string[];
  e2gFocus: boolean;
  ruralFocus: boolean;
  manufacturingFocus: boolean;
}

// ============================================================================
// READINESS SCORE DATA
// ============================================================================

export interface ReadinessScore {
  overallScore: number; // 0-100
  breakdown: {
    samRegistration: number; // 0-20
    uei: number; // 0-15
    cageCode: number; // 0-15
    naicsCoverage: number; // 0-15
    federalCertifications: number; // 0-15
    pastPerformance: number; // 0-10
    gsaSchedule: number; // 0-10
  };
  lastCalculated: Timestamp;
  scoreHistory: {
    score: number;
    calculatedAt: Timestamp;
  }[];
  gaps: string[];
  remediationRecommendations: string[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
}

// ============================================================================
// AI MATCHING DATA
// ============================================================================

export interface CapabilityMatch {
  opportunityId?: string;
  partnerId: string;
  matchScore: number; // 0-100
  confidence: number; // 0-100
  matchReasons: string[];
  gaps: string[];
  recommendedActions: string[];
  calculatedAt: Timestamp;
}

export interface TeamingMatch {
  partner1Id: string;
  partner2Id: string;
  matchScore: number;
  confidence: number;
  complementaryStrengths: string[];
  potentialSynergies: string[];
  recommendedRoles: {
    partner1Role: TeamingRole;
    partner2Role: TeamingRole;
  };
  calculatedAt: Timestamp;
}

export interface E2GAlignmentMatch {
  partnerId: string;
  e2gFirmId?: string;
  matchScore: number;
  confidence: number;
  pillarAlignment: E2GPillar[];
  geographicAlignment: boolean;
  ruralExperience: boolean;
  specializationMatch: string[];
  calculatedAt: Timestamp;
}

// ============================================================================
// MEMBERSHIP TIER DATA
// ============================================================================

export interface MembershipTierInfo {
  tier: MembershipTier;
  assignedAt: Timestamp;
  assignedBy?: string; // Admin user ID
  assignmentReason: string;
  features: string[];
  restrictions: string[];
  upgradeEligibility: boolean;
  downgradeEligibility: boolean;
  renewalDate?: Timestamp;
  autoRenew: boolean;
}

export interface TierBenefits {
  tier: MembershipTier;
  benefits: {
    adminAccess: boolean;
    consortiumOversight: boolean;
    strategicPlanning: boolean;
    performanceTracking: boolean;
    teamManagement: boolean;
    marketplaceOversight: boolean;
    analyticsDashboard: boolean;
    fullMarketplaceAccess: boolean;
    aiOpportunityMatching: boolean;
    teamingRecommendations: boolean;
    proposalCollaboration: boolean;
    oneToOneNetworking: boolean;
    eventAccess: boolean;
    marketplaceListings: boolean;
    opportunitySearch: boolean;
    networking: boolean;
    resourceAccess: boolean;
    capabilityPromotion: boolean;
    directoryVisibility: boolean;
    basicMarketplaceAccess: boolean;
    opportunityBrowsing: boolean;
    resourceLibrary: boolean;
    directoryListing: boolean;
    readinessScoreDevelopment: boolean;
  };
  pricing: {
    monthly?: number;
    annual?: number;
  };
}

// ============================================================================
// PARTNER DIRECTORY DATA
// ============================================================================

export interface PartnerDirectoryListing {
  partnerId: string;
  companyName: string;
  capabilities: string[];
  certifications: CertificationType[];
  geographicCoverage: string[];
  readinessScore: number;
  membershipTier: MembershipTier;
  visibility: "public" | "consortium_only" | "tier_restricted";
  listingStatus: "active" | "inactive" | "pending_review";
  featured: boolean;
  priorityRanking?: number;
  lastUpdated: Timestamp;
  engagementMetrics: {
    profileViews: number;
    inquiries: number;
    connections: number;
    teamingRequests: number;
  };
}

// ============================================================================
// PERFORMANCE METRICS DATA
// ============================================================================

export interface EngagementMetrics {
  profileCompleteness: number; // 0-100
  lastProfileUpdate: Timestamp;
  marketplaceListingsCount: number;
  opportunityWinRate: number; // 0-100
  meetingsAttended: number;
  meetingsHosted: number;
  teamingRequestsSent: number;
  teamingRequestsReceived: number;
  teamingRequestsAccepted: number;
  proposalsSubmitted: number;
  proposalsWon: number;
  averageResponseTime: number; // hours
  activeEngagementScore: number; // 0-100
  connections: number;
  calculatedAt: Timestamp;
}

export interface PerformanceMetrics {
  partnerId: string;
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  satisfactionScores: {
    average: number; // 0-5
    count: number;
    breakdown: {
      fiveStar: number;
      fourStar: number;
      threeStar: number;
      twoStar: number;
      oneStar: number;
    };
  };
  projectCompletionRate: number; // 0-100
  qualityAssessmentScore: number; // 0-100
  timelinessScore: number; // 0-100
  complianceAdherenceScore: number; // 0-100
  e2gFirmFeedback: {
    average: number;
    count: number;
    comments: string[];
  };
  calculatedAt: Timestamp;
}

// ============================================================================
// E2G ALIGNMENT DATA
// ============================================================================

export interface E2GAlignment {
  partnerId: string;
  targetRegions: E2GRegion[];
  ruralDeploymentExperience: boolean;
  ruralRegionsServed: string[];
  pillarCapabilities: {
    pillar: E2GPillar;
    capabilityLevel: "none" | "basic" | "intermediate" | "advanced";
    relevantProjects: number;
  }[];
  hubZoneCertified: boolean;
  communityRelationshipStrength: number; // 0-100
  ruralManufacturingSpecialization: boolean;
  e2gReadinessScore: number; // 0-100
  lastAssessed: Timestamp;
}

// ============================================================================
// ONBOARDING TRACKING DATA
// ============================================================================

export interface OnboardingTracking {
  partnerId: string;
  currentStage: OnboardingStage;
  status: OnboardingStatus;
  stageProgress: {
    [key in OnboardingStage]: {
      startedAt?: Timestamp;
      completedAt?: Timestamp;
      status: "not_started" | "in_progress" | "completed" | "skipped";
    };
  };
  referralSource: ReferralSource;
  referralDetails?: string;
  initialContact: {
    date: Timestamp;
    method: string;
    details: string;
  };
  welcomeSequence: {
    sent: boolean;
    sentAt?: Timestamp;
    opened: boolean;
    openedAt?: Timestamp;
    clicked: boolean;
    clickedAt?: Timestamp;
  };
  estimatedCompletionDate?: Timestamp;
  notes: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// COMPLETE CONSORTIUM PROFILE
// ============================================================================

export interface ConsortiumProfile {
  id: string;
  userId: string;
  onboardingTracking: OnboardingTracking;
  companyIdentity: CompanyIdentity;
  naicsCodes: NAICSCode[];
  certifications: Certification[];
  capabilities: Capability[];
  serviceOfferings: ServiceOffering[];
  technologySpecializations: TechnologySpecialization[];
  pastPerformance: PastPerformance[];
  governmentContractingProfile: GovernmentContractingProfile;
  geographicCoverage: GeographicCoverage;
  teamingPreferences: TeamingPreferences;
  consortiumPillarAlignment: ConsortiumPillarAlignment;
  readinessScore: ReadinessScore;
  membershipTier: MembershipTierInfo;
  partnerDirectoryListing?: PartnerDirectoryListing;
  engagementMetrics: EngagementMetrics;
  performanceMetrics?: PerformanceMetrics;
  e2gAlignment: E2GAlignment;
  capabilityMatches: CapabilityMatch[];
  teamingMatches: TeamingMatch[];
  e2gAlignmentMatches: E2GAlignmentMatch[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
}

// ============================================================================
// FIRESTORE COLLECTION CONSTANTS
// ============================================================================

export const CONSORTIUM_COLLECTIONS = {
  PROFILES: "consortium_profiles",
  READINESS_SCORES: "readiness_scores",
  CAPABILITY_MATCHES: "capability_matches",
  TEAMING_MATCHES: "teaming_matches",
  E2G_ALIGNMENT_MATCHES: "e2g_alignment_matches",
  MEMBERSHIP_TIERS: "membership_tiers",
  PARTNER_DIRECTORY: "partner_directory",
  PERFORMANCE_METRICS: "performance_metrics",
  E2G_ALIGNMENTS: "e2g_alignments",
  ONBOARDING_TRACKING: "onboarding_tracking",
} as const;

// ============================================================================
// MEMBERSHIP TIER CONFIGURATIONS
// ============================================================================

export const MEMBERSHIP_TIER_CONFIG: Record<MembershipTier, TierBenefits> = {
  founder: {
    tier: "founder",
    benefits: {
      adminAccess: true,
      consortiumOversight: true,
      strategicPlanning: true,
      performanceTracking: true,
      teamManagement: true,
      marketplaceOversight: true,
      analyticsDashboard: true,
      fullMarketplaceAccess: true,
      aiOpportunityMatching: true,
      teamingRecommendations: true,
      proposalCollaboration: true,
      oneToOneNetworking: true,
      eventAccess: true,
      marketplaceListings: true,
      opportunitySearch: true,
      networking: true,
      resourceAccess: true,
      capabilityPromotion: true,
      directoryVisibility: true,
      basicMarketplaceAccess: true,
      opportunityBrowsing: true,
      resourceLibrary: true,
      directoryListing: true,
      readinessScoreDevelopment: true,
    },
    pricing: {
      // Founder members typically have custom pricing
    },
  },
  core_capture: {
    tier: "core_capture",
    benefits: {
      adminAccess: false,
      consortiumOversight: false,
      strategicPlanning: false,
      performanceTracking: false,
      teamManagement: false,
      marketplaceOversight: false,
      analyticsDashboard: false,
      fullMarketplaceAccess: true,
      aiOpportunityMatching: true,
      teamingRecommendations: true,
      proposalCollaboration: true,
      oneToOneNetworking: true,
      eventAccess: true,
      marketplaceListings: true,
      opportunitySearch: true,
      networking: true,
      resourceAccess: true,
      capabilityPromotion: true,
      directoryVisibility: true,
      basicMarketplaceAccess: true,
      opportunityBrowsing: true,
      resourceLibrary: true,
      directoryListing: true,
      readinessScoreDevelopment: true,
    },
    pricing: {
      monthly: 1250,
      annual: 13500,
    },
  },
  elite: {
    tier: "elite",
    benefits: {
      adminAccess: false,
      consortiumOversight: false,
      strategicPlanning: false,
      performanceTracking: false,
      teamManagement: false,
      marketplaceOversight: false,
      analyticsDashboard: false,
      fullMarketplaceAccess: false,
      aiOpportunityMatching: false,
      teamingRecommendations: false,
      proposalCollaboration: false,
      oneToOneNetworking: false,
      eventAccess: true,
      marketplaceListings: true,
      opportunitySearch: true,
      networking: true,
      resourceAccess: true,
      capabilityPromotion: true,
      directoryVisibility: true,
      basicMarketplaceAccess: true,
      opportunityBrowsing: true,
      resourceLibrary: true,
      directoryListing: true,
      readinessScoreDevelopment: true,
    },
    pricing: {
      monthly: 750,
      annual: 8100,
    },
  },
  standard: {
    tier: "standard",
    benefits: {
      adminAccess: false,
      consortiumOversight: false,
      strategicPlanning: false,
      performanceTracking: false,
      teamManagement: false,
      marketplaceOversight: false,
      analyticsDashboard: false,
      fullMarketplaceAccess: false,
      aiOpportunityMatching: false,
      teamingRecommendations: false,
      proposalCollaboration: false,
      oneToOneNetworking: false,
      eventAccess: false,
      marketplaceListings: false,
      opportunitySearch: false,
      networking: false,
      resourceAccess: false,
      capabilityPromotion: false,
      directoryVisibility: false,
      basicMarketplaceAccess: true,
      opportunityBrowsing: true,
      resourceLibrary: true,
      directoryListing: true,
      readinessScoreDevelopment: true,
    },
    pricing: {
      monthly: 350,
      annual: 3780,
    },
  },
};

// ============================================================================
// READINESS SCORE WEIGHTS
// ============================================================================

export const READINESS_SCORE_WEIGHTS = {
  samRegistration: 20,
  uei: 15,
  cageCode: 15,
  naicsCoverage: 15,
  federalCertifications: 15,
  pastPerformance: 10,
  gsaSchedule: 10,
} as const;

// ============================================================================
// E2G PILLAR DEFINITIONS
// ============================================================================

export const E2G_PILLAR_DEFINITIONS: Record<E2GPillar, { name: string; description: string }> = {
  ai_automation: {
    name: "AI & Automation",
    description: "Artificial intelligence, machine learning, and automation technologies for manufacturing modernization",
  },
  agricultural_modernization: {
    name: "Agricultural Modernization",
    description: "Modern agricultural technologies, equipment, and processes for rural farming communities",
  },
  workforce_development: {
    name: "Workforce Development",
    description: "Training, education, and skill development programs for rural workforce enhancement",
  },
  quality_systems: {
    name: "Quality Systems",
    description: "Quality management systems, compliance, and certification programs for manufacturing excellence",
  },
  business_growth: {
    name: "Business Growth",
    description: "Business consulting, strategic planning, and growth acceleration services for rural businesses",
  },
};

// ============================================================================
// E2G REGION DEFINITIONS
// ============================================================================

export const E2G_REGION_DEFINITIONS: Record<E2GRegion, { name: string; states: string[] }> = {
  MD: { name: "Maryland", states: ["MD"] },
  VA: { name: "Virginia", states: ["VA"] },
  PA: { name: "Pennsylvania", states: ["PA"] },
  WV: { name: "West Virginia", states: ["WV"] },
  all: { name: "All Regions", states: ["MD", "VA", "PA", "WV"] },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTierBenefits(tier: MembershipTier): TierBenefits {
  return MEMBERSHIP_TIER_CONFIG[tier];
}

export function calculateReadinessScore(
  profile: Partial<ConsortiumProfile>
): ReadinessScore {
  const breakdown = {
    samRegistration: 0,
    uei: 0,
    cageCode: 0,
    naicsCoverage: 0,
    federalCertifications: 0,
    pastPerformance: 0,
    gsaSchedule: 0,
  };

  // SAM Registration
  if (profile.governmentContractingProfile?.samRegistrationStatus === "active") {
    breakdown.samRegistration = READINESS_SCORE_WEIGHTS.samRegistration;
  }

  // UEI
  if (profile.governmentContractingProfile?.uei) {
    breakdown.uei = READINESS_SCORE_WEIGHTS.uei;
  }

  // CAGE Code
  if (profile.governmentContractingProfile?.cageCode) {
    breakdown.cageCode = READINESS_SCORE_WEIGHTS.cageCode;
  }

  // NAICS Coverage
  if (profile.naicsCodes && profile.naicsCodes.length > 0) {
    breakdown.naicsCoverage = READINESS_SCORE_WEIGHTS.naicsCoverage;
  }

  // Federal Certifications
  const federalCerts = profile.certifications?.filter(
    (c) => ["8a", "wosb", "sdvosb", "hubzone"].includes(c.type)
  );
  if (federalCerts && federalCerts.length > 0) {
    breakdown.federalCertifications = READINESS_SCORE_WEIGHTS.federalCertifications;
  }

  // Past Performance
  if (profile.pastPerformance && profile.pastPerformance.length > 0) {
    breakdown.pastPerformance = READINESS_SCORE_WEIGHTS.pastPerformance;
  }

  // GSA Schedule
  if (profile.governmentContractingProfile?.gsaScheduleHolder) {
    breakdown.gsaSchedule = READINESS_SCORE_WEIGHTS.gsaSchedule;
  }

  const overallScore =
    breakdown.samRegistration +
    breakdown.uei +
    breakdown.cageCode +
    breakdown.naicsCoverage +
    breakdown.federalCertifications +
    breakdown.pastPerformance +
    breakdown.gsaSchedule;

  const gaps: string[] = [];
  const remediationRecommendations: string[] = [];
  const resources: { title: string; url: string; description: string }[] = [];

  if (breakdown.samRegistration === 0) {
    gaps.push("SAM.gov registration not active");
    remediationRecommendations.push("Register or renew SAM.gov registration");
    resources.push({
      title: "SAM.gov Registration",
      url: "https://sam.gov",
      description: "Official SAM.gov registration portal",
    });
  }

  if (breakdown.uei === 0) {
    gaps.push("UEI not assigned");
    remediationRecommendations.push("Obtain Unique Entity ID through SAM.gov");
  }

  if (breakdown.cageCode === 0) {
    gaps.push("CAGE code not assigned");
    remediationRecommendations.push("Apply for CAGE code through SAM.gov");
  }

  if (breakdown.naicsCoverage === 0) {
    gaps.push("No NAICS codes specified");
    remediationRecommendations.push("Add relevant NAICS codes to profile");
  }

  if (breakdown.federalCertifications === 0) {
    gaps.push("No federal certifications");
    remediationRecommendations.push("Consider obtaining federal set-aside certifications");
  }

  if (breakdown.pastPerformance === 0) {
    gaps.push("No past performance documented");
    remediationRecommendations.push("Document past contracts and projects");
  }

  return {
    overallScore,
    breakdown,
    lastCalculated: Timestamp.now(),
    scoreHistory: [
      {
        score: overallScore,
        calculatedAt: Timestamp.now(),
      },
    ],
    gaps,
    remediationRecommendations,
    resources,
  };
}
