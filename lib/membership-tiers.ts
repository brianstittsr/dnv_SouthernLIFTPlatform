/**
 * Membership Tier Management System
 * 
 * This module implements the tiered membership model for the KDM Consortium Intelligence Platform.
 * It handles tier assignment, upgrade/downgrade workflows, feature access control, and tier management.
 */

import { Timestamp } from "firebase/firestore";
import {
  MembershipTier,
  MembershipTierInfo,
  TierBenefits,
  MEMBERSHIP_TIER_CONFIG,
  getTierBenefits,
  ConsortiumProfile,
  EngagementMetrics,
} from "./consortium-schema";

// ============================================================================
// TIER ASSIGNMENT CRITERIA
// ============================================================================

export interface TierAssignmentCriteria {
  profileCompleteness: number; // 0-100
  readinessScore: number; // 0-100
  engagementScore: number; // 0-100
  pastPerformanceCount: number;
  federalCertifications: number;
  subscriptionLevel?: string;
  tenureMonths?: number;
  invitationStatus?: "invited" | "applied" | "none";
}

export interface TierAssignmentResult {
  recommendedTier: MembershipTier;
  currentTier?: MembershipTier;
  upgradeEligible: boolean;
  downgradeEligible: boolean;
  reasons: string[];
  requirements: string[];
  estimatedUpgradePath?: string[];
}

/**
 * Determines the appropriate membership tier based on profile criteria
 */
export function determineMembershipTier(
  criteria: TierAssignmentCriteria,
  currentTier?: MembershipTier
): TierAssignmentResult {
  const reasons: string[] = [];
  const requirements: string[] = [];
  let recommendedTier: MembershipTier = "standard";

  // Founder Members - by invitation only
  if (criteria.invitationStatus === "invited") {
    recommendedTier = "founder";
    reasons.push("Invited by KDM leadership");
    return {
      recommendedTier,
      currentTier,
      upgradeEligible: currentTier !== "founder",
      downgradeEligible: false,
      reasons,
      requirements: [],
    };
  }

  // Core Capture Members - high engagement and readiness
  if (
    criteria.profileCompleteness >= 90 &&
    criteria.readinessScore >= 75 &&
    criteria.engagementScore >= 70 &&
    criteria.pastPerformanceCount >= 3 &&
    criteria.federalCertifications >= 1
  ) {
    recommendedTier = "core_capture";
    reasons.push("High profile completeness (90%+)");
    reasons.push("Strong government contracting readiness (75%+)");
    reasons.push("Active platform engagement (70%+)");
    reasons.push("Documented past performance (3+ projects)");
    reasons.push("Federal certification holder");
  }
  // Elite Members - established with specialized expertise
  else if (
    criteria.profileCompleteness >= 80 &&
    criteria.readinessScore >= 60 &&
    criteria.engagementScore >= 50 &&
    criteria.pastPerformanceCount >= 1
  ) {
    recommendedTier = "elite";
    reasons.push("Good profile completeness (80%+)");
    reasons.push("Adequate government contracting readiness (60%+)");
    reasons.push("Moderate platform engagement (50%+)");
    reasons.push("Documented past performance");
  }
  // Standard Members - emerging organizations
  else {
    recommendedTier = "standard";
    reasons.push("Building profile and engagement");
    if (criteria.profileCompleteness < 80) {
      requirements.push("Complete profile to 80%+");
    }
    if (criteria.readinessScore < 60) {
      requirements.push("Improve readiness score to 60%+");
    }
    if (criteria.engagementScore < 50) {
      requirements.push("Increase platform engagement");
    }
    if (criteria.pastPerformanceCount < 1) {
      requirements.push("Document past performance");
    }
  }

  // Determine upgrade/downgrade eligibility
  const tierHierarchy: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
  const currentIndex = currentTier ? tierHierarchy.indexOf(currentTier) : 0;
  const recommendedIndex = tierHierarchy.indexOf(recommendedTier);

  return {
    recommendedTier,
    currentTier,
    upgradeEligible: recommendedIndex > currentIndex,
    downgradeEligible: recommendedIndex < currentIndex,
    reasons,
    requirements,
    estimatedUpgradePath: calculateUpgradePath(currentTier, recommendedTier),
  };
}

function calculateUpgradePath(
  currentTier: MembershipTier | undefined,
  targetTier: MembershipTier
): string[] {
  const tierHierarchy: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
  const currentIndex = currentTier ? tierHierarchy.indexOf(currentTier) : 0;
  const targetIndex = tierHierarchy.indexOf(targetTier);

  if (targetIndex <= currentIndex) {
    return [];
  }

  const path: string[] = [];
  for (let i = currentIndex + 1; i <= targetIndex; i++) {
    const tier = tierHierarchy[i];
    switch (tier) {
      case "elite":
        path.push("Complete profile to 80%+");
        path.push("Achieve readiness score of 60%+");
        path.push("Document at least 1 past performance");
        break;
      case "core_capture":
        path.push("Complete profile to 90%+");
        path.push("Achieve readiness score of 75%+");
        path.push("Maintain engagement score of 70%+");
        path.push("Document 3+ past performance projects");
        path.push("Obtain federal certification");
        break;
      case "founder":
        path.push("Receive invitation from KDM leadership");
        break;
    }
  }

  return path;
}

// ============================================================================
// TIER TRANSITION WORKFLOWS
// ============================================================================

export interface TierTransitionRequest {
  partnerId: string;
  currentTier: MembershipTier;
  targetTier: MembershipTier;
  requestedBy: string; // User ID
  reason: string;
  effectiveDate?: Timestamp;
}

export interface TierTransitionResult {
  success: boolean;
  newTier?: MembershipTier;
  effectiveDate?: Timestamp;
  message: string;
  requiresApproval: boolean;
  approvalRequiredBy?: string[];
}

export function processTierTransition(
  request: TierTransitionRequest
): TierTransitionResult {
  const tierHierarchy: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
  const currentIndex = tierHierarchy.indexOf(request.currentTier);
  const targetIndex = tierHierarchy.indexOf(request.targetTier);

  // Founder tier requires approval
  if (request.targetTier === "founder") {
    return {
      success: false,
      message: "Founder tier requires invitation from KDM leadership",
      requiresApproval: true,
      approvalRequiredBy: ["platform_admin", "consortium_governance"],
    };
  }

  // Downgrade to standard always allowed
  if (request.targetTier === "standard") {
    return {
      success: true,
      newTier: "standard",
      effectiveDate: request.effectiveDate || Timestamp.now(),
      message: "Tier downgraded to Standard",
      requiresApproval: false,
    };
  }

  // Upgrade requires approval for higher tiers
  if (targetIndex > currentIndex) {
    if (request.targetTier === "core_capture") {
      return {
        success: false,
        message: "Core Capture tier upgrade requires admin approval",
        requiresApproval: true,
        approvalRequiredBy: ["platform_admin"],
      };
    }
  }

  // Elite upgrade can be automatic if criteria met
  if (request.targetTier === "elite" && targetIndex > currentIndex) {
    return {
      success: true,
      newTier: "elite",
      effectiveDate: request.effectiveDate || Timestamp.now(),
      message: "Tier upgraded to Elite",
      requiresApproval: false,
    };
  }

  return {
    success: false,
    message: "Invalid tier transition request",
    requiresApproval: false,
  };
}

// ============================================================================
// FEATURE ACCESS CONTROL
// ============================================================================

export interface FeatureAccessCheck {
  feature: keyof TierBenefits["benefits"];
  tier: MembershipTier;
  hasAccess: boolean;
  reason?: string;
}

export function checkFeatureAccess(
  feature: keyof TierBenefits["benefits"],
  tier: MembershipTier
): FeatureAccessCheck {
  const tierBenefits = getTierBenefits(tier);
  const hasAccess = tierBenefits.benefits[feature];

  return {
    feature,
    tier,
    hasAccess,
    reason: hasAccess
      ? undefined
      : `Feature not available for ${tier} tier`,
  };
}

export function filterFeaturesByTier(
  features: (keyof TierBenefits["benefits"])[],
  tier: MembershipTier
): (keyof TierBenefits["benefits"])[] {
  return features.filter((feature) => checkFeatureAccess(feature, tier).hasAccess);
}

// ============================================================================
// TIER BENEFITS COMPARISON
// ============================================================================

export interface TierComparison {
  tier1: MembershipTier;
  tier2: MembershipTier;
  tier1Benefits: TierBenefits;
  tier2Benefits: TierBenefits;
  exclusiveToTier1: (keyof TierBenefits["benefits"])[];
  exclusiveToTier2: (keyof TierBenefits["benefits"])[];
  sharedFeatures: (keyof TierBenefits["benefits"])[];
  upgradeValue: string;
}

export function compareTiers(
  tier1: MembershipTier,
  tier2: MembershipTier
): TierComparison {
  const tier1Benefits = getTierBenefits(tier1);
  const tier2Benefits = getTierBenefits(tier2);

  const allFeatures = Object.keys(tier1Benefits.benefits) as (keyof TierBenefits["benefits"])[];

  const exclusiveToTier1: (keyof TierBenefits["benefits"])[] = [];
  const exclusiveToTier2: (keyof TierBenefits["benefits"])[] = [];
  const sharedFeatures: (keyof TierBenefits["benefits"])[] = [];

  allFeatures.forEach((feature) => {
    const tier1Has = tier1Benefits.benefits[feature];
    const tier2Has = tier2Benefits.benefits[feature];

    if (tier1Has && !tier2Has) {
      exclusiveToTier1.push(feature);
    } else if (!tier1Has && tier2Has) {
      exclusiveToTier2.push(feature);
    } else if (tier1Has && tier2Has) {
      sharedFeatures.push(feature);
    }
  });

  // Calculate upgrade value
  const tierHierarchy: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
  const tier1Index = tierHierarchy.indexOf(tier1);
  const tier2Index = tierHierarchy.indexOf(tier2);

  let upgradeValue = "";
  if (tier2Index > tier1Index) {
    const newFeatures = exclusiveToTier2.length;
    upgradeValue = `Upgrade to ${tier2} for ${newFeatures} additional features`;
  } else if (tier1Index > tier2Index) {
    const lostFeatures = exclusiveToTier1.length;
    upgradeValue = `Downgrade to ${tier2} will lose ${lostFeatures} features`;
  } else {
    upgradeValue = "Same tier - no feature difference";
  }

  return {
    tier1,
    tier2,
    tier1Benefits,
    tier2Benefits,
    exclusiveToTier1,
    exclusiveToTier2,
    sharedFeatures,
    upgradeValue,
  };
}

// ============================================================================
// TIER ANALYTICS
// ============================================================================

export interface TierAnalytics {
  tier: MembershipTier;
  memberCount: number;
  averageReadinessScore: number;
  averageEngagementScore: number;
  averageProfileCompleteness: number;
  totalOpportunitiesWon: number;
  totalProposalValue: number;
  retentionRate: number;
  upgradeRate: number;
  downgradeRate: number;
}

export function calculateTierAnalytics(
  profiles: ConsortiumProfile[],
  tier: MembershipTier
): TierAnalytics {
  const tierProfiles = profiles.filter(
    (p) => p.membershipTier.tier === tier
  );

  if (tierProfiles.length === 0) {
    return {
      tier,
      memberCount: 0,
      averageReadinessScore: 0,
      averageEngagementScore: 0,
      averageProfileCompleteness: 0,
      totalOpportunitiesWon: 0,
      totalProposalValue: 0,
      retentionRate: 0,
      upgradeRate: 0,
      downgradeRate: 0,
    };
  }

  const totalReadinessScore = tierProfiles.reduce(
    (sum, p) => sum + p.readinessScore.overallScore,
    0
  );
  const totalEngagementScore = tierProfiles.reduce(
    (sum, p) => sum + p.engagementMetrics.activeEngagementScore,
    0
  );
  const totalProfileCompleteness = tierProfiles.reduce(
    (sum, p) => sum + p.engagementMetrics.profileCompleteness,
    0
  );

  // Calculate proposal wins (would need actual data)
  const totalOpportunitiesWon = tierProfiles.reduce(
    (sum, p) => sum + p.engagementMetrics.proposalsWon,
    0
  );

  return {
    tier,
    memberCount: tierProfiles.length,
    averageReadinessScore: totalReadinessScore / tierProfiles.length,
    averageEngagementScore: totalEngagementScore / tierProfiles.length,
    averageProfileCompleteness: totalProfileCompleteness / tierProfiles.length,
    totalOpportunitiesWon,
    totalProposalValue: 0, // Would need actual proposal value data
    retentionRate: 0, // Would need historical data
    upgradeRate: 0, // Would need historical data
    downgradeRate: 0, // Would need historical data
  };
}

// ============================================================================
// TIER RECOMMENDATIONS
// ============================================================================

export interface TierRecommendation {
  partnerId: string;
  currentTier: MembershipTier;
  recommendedTier: MembershipTier;
  confidence: number; // 0-100
  reasons: string[];
  actionItems: string[];
  estimatedTimeToUpgrade?: string;
  potentialBenefits: string[];
}

export function generateTierRecommendation(
  profile: ConsortiumProfile
): TierRecommendation {
  const criteria: TierAssignmentCriteria = {
    profileCompleteness: profile.engagementMetrics.profileCompleteness,
    readinessScore: profile.readinessScore.overallScore,
    engagementScore: profile.engagementMetrics.activeEngagementScore,
    pastPerformanceCount: profile.pastPerformance.length,
    federalCertifications: profile.certifications.filter((c) =>
      ["8a", "wosb", "sdvosb", "hubzone"].includes(c.type)
    ).length,
    subscriptionLevel: profile.membershipTier.tier,
  };

  const assignment = determineMembershipTier(
    criteria,
    profile.membershipTier.tier
  );

  const tierHierarchy: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
  const currentIndex = tierHierarchy.indexOf(profile.membershipTier.tier);
  const recommendedIndex = tierHierarchy.indexOf(assignment.recommendedTier);

  let confidence = 50;
  if (recommendedIndex > currentIndex) {
    confidence = 70 + (criteria.profileCompleteness / 100) * 30;
  } else if (recommendedIndex < currentIndex) {
    confidence = 60 + (criteria.engagementScore / 100) * 40;
  }

  const potentialBenefits: string[] = [];
  if (assignment.recommendedTier === "elite") {
    potentialBenefits.push("Full marketplace access");
    potentialBenefits.push("Enhanced networking opportunities");
    potentialBenefits.push("Capability promotion");
  } else if (assignment.recommendedTier === "core_capture") {
    potentialBenefits.push("AI-powered opportunity matching");
    potentialBenefits.push("Teaming recommendations");
    potentialBenefits.push("Proposal collaboration tools");
    potentialBenefits.push("1-to-1 networking");
  }

  // Estimate time to upgrade
  let estimatedTimeToUpgrade: string | undefined;
  if (assignment.estimatedUpgradePath && assignment.estimatedUpgradePath.length > 0) {
    const steps = assignment.estimatedUpgradePath.length;
    if (steps <= 2) {
      estimatedTimeToUpgrade = "1-2 weeks";
    } else if (steps <= 4) {
      estimatedTimeToUpgrade = "1-2 months";
    } else {
      estimatedTimeToUpgrade = "2-4 months";
    }
  }

  return {
    partnerId: profile.id,
    currentTier: profile.membershipTier.tier,
    recommendedTier: assignment.recommendedTier,
    confidence: Math.round(confidence),
    reasons: assignment.reasons,
    actionItems: assignment.requirements,
    estimatedTimeToUpgrade,
    potentialBenefits,
  };
}

// ============================================================================
// TIER PRICING
// ============================================================================

export interface TierPricing {
  tier: MembershipTier;
  monthlyPrice?: number;
  annualPrice?: number;
  annualSavings?: number;
  annualSavingsPercentage?: number;
}

export function getTierPricing(tier: MembershipTier): TierPricing {
  const config = MEMBERSHIP_TIER_CONFIG[tier];
  const monthlyPrice = config.pricing.monthly;
  const annualPrice = config.pricing.annual;

  let annualSavings: number | undefined;
  let annualSavingsPercentage: number | undefined;

  if (monthlyPrice && annualPrice) {
    annualSavings = monthlyPrice * 12 - annualPrice;
    annualSavingsPercentage = (annualSavings / (monthlyPrice * 12)) * 100;
  }

  return {
    tier,
    monthlyPrice,
    annualPrice,
    annualSavings,
    annualSavingsPercentage,
  };
}

export function calculatePricingDifference(
  fromTier: MembershipTier,
  toTier: MembershipTier
): {
  monthlyDifference?: number;
  annualDifference?: number;
  percentageChange?: number;
} {
  const fromPricing = getTierPricing(fromTier);
  const toPricing = getTierPricing(toTier);

  const monthlyDifference =
    fromPricing.monthlyPrice && toPricing.monthlyPrice
      ? toPricing.monthlyPrice - fromPricing.monthlyPrice
      : undefined;

  const annualDifference =
    fromPricing.annualPrice && toPricing.annualPrice
      ? toPricing.annualPrice - fromPricing.annualPrice
      : undefined;

  const percentageChange =
    fromPricing.monthlyPrice && toPricing.monthlyPrice && fromPricing.monthlyPrice > 0
      ? ((toPricing.monthlyPrice - fromPricing.monthlyPrice) / fromPricing.monthlyPrice) * 100
      : undefined;

  return {
    monthlyDifference,
    annualDifference,
    percentageChange,
  };
}

// ============================================================================
// TIER ELIGIBILITY CHECKS
// ============================================================================

export interface TierEligibility {
  tier: MembershipTier;
  eligible: boolean;
  missingRequirements: string[];
  blockingIssues: string[];
  canApply: boolean;
  autoUpgradeEligible: boolean;
}

export function checkTierEligibility(
  profile: ConsortiumProfile,
  targetTier: MembershipTier
): TierEligibility {
  const criteria: TierAssignmentCriteria = {
    profileCompleteness: profile.engagementMetrics.profileCompleteness,
    readinessScore: profile.readinessScore.overallScore,
    engagementScore: profile.engagementMetrics.activeEngagementScore,
    pastPerformanceCount: profile.pastPerformance.length,
    federalCertifications: profile.certifications.filter((c) =>
      ["8a", "wosb", "sdvosb", "hubzone"].includes(c.type)
    ).length,
  };

  const assignment = determineMembershipTier(criteria, profile.membershipTier.tier);
  const tierHierarchy: MembershipTier[] = ["standard", "elite", "core_capture", "founder"];
  const targetIndex = tierHierarchy.indexOf(targetTier);
  const recommendedIndex = tierHierarchy.indexOf(assignment.recommendedTier);

  const missingRequirements: string[] = [];
  const blockingIssues: string[] = [];

  // Founder tier blocking issue
  if (targetTier === "founder") {
    blockingIssues.push("Founder tier requires invitation from KDM leadership");
    return {
      tier: targetTier,
      eligible: false,
      missingRequirements,
      blockingIssues,
      canApply: false,
      autoUpgradeEligible: false,
    };
  }

  // Check requirements for each tier
  if (targetTier === "core_capture") {
    if (criteria.profileCompleteness < 90) {
      missingRequirements.push("Profile completeness must be 90%+");
    }
    if (criteria.readinessScore < 75) {
      missingRequirements.push("Readiness score must be 75%+");
    }
    if (criteria.engagementScore < 70) {
      missingRequirements.push("Engagement score must be 70%+");
    }
    if (criteria.pastPerformanceCount < 3) {
      missingRequirements.push("Must have 3+ documented past performance projects");
    }
    if (criteria.federalCertifications < 1) {
      missingRequirements.push("Must have at least 1 federal certification");
    }
  } else if (targetTier === "elite") {
    if (criteria.profileCompleteness < 80) {
      missingRequirements.push("Profile completeness must be 80%+");
    }
    if (criteria.readinessScore < 60) {
      missingRequirements.push("Readiness score must be 60%+");
    }
    if (criteria.engagementScore < 50) {
      missingRequirements.push("Engagement score must be 50%+");
    }
    if (criteria.pastPerformanceCount < 1) {
      missingRequirements.push("Must have at least 1 documented past performance project");
    }
  }

  const eligible = missingRequirements.length === 0 && blockingIssues.length === 0;
  const canApply = blockingIssues.length === 0;
  const autoUpgradeEligible = eligible && targetIndex <= recommendedIndex;

  return {
    tier: targetTier,
    eligible,
    missingRequirements,
    blockingIssues,
    canApply,
    autoUpgradeEligible,
  };
}
