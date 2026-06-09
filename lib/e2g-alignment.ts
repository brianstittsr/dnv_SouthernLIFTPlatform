/**
 * E2G (Empower to Grow) Initiative Alignment System
 * 
 * This module implements the E2G initiative-specific features for the KDM Consortium Intelligence Platform.
 * It handles regional targeting (MD, VA, PA, WV), pillar alignment, HUBZone prioritization,
 * community relationship scoring, and rural manufacturing specialization.
 */

import { Timestamp } from "firebase/firestore";
import {
  E2GAlignment,
  E2GPillar,
  E2GRegion,
  E2G_PILLAR_DEFINITIONS,
  E2G_REGION_DEFINITIONS,
  ConsortiumProfile,
  Certification,
} from "./consortium-schema";

// ============================================================================
// E2G REGION TARGETING
// ============================================================================

export interface RegionCoverage {
  region: E2GRegion;
  statesCovered: string[];
  partnersInRegion: number;
  averageReadinessScore: number;
  hubZonePartners: number;
  ruralSpecialists: number;
}

export function calculateRegionCoverage(
  profiles: ConsortiumProfile[],
  region: E2GRegion
): RegionCoverage {
  const regionDef = E2G_REGION_DEFINITIONS[region];
  const regionProfiles = profiles.filter((p) =>
    p.e2gAlignment.targetRegions.includes(region)
  );

  const hubZonePartners = regionProfiles.filter((p) =>
    p.certifications.some((c) => c.type === "hubzone" && c.isActive)
  ).length;

  const ruralSpecialists = regionProfiles.filter(
    (p) => p.e2gAlignment.ruralManufacturingSpecialization
  ).length;

  const totalReadinessScore = regionProfiles.reduce(
    (sum, p) => sum + p.readinessScore.overallScore,
    0
  );

  return {
    region,
    statesCovered: regionDef.states,
    partnersInRegion: regionProfiles.length,
    averageReadinessScore:
      regionProfiles.length > 0 ? totalReadinessScore / regionProfiles.length : 0,
    hubZonePartners,
    ruralSpecialists,
  };
}

export function getRegionalPartnerDistribution(
  profiles: ConsortiumProfile[]
): Record<E2GRegion, RegionCoverage> {
  const regions: E2GRegion[] = ["MD", "VA", "PA", "WV", "all"];
  const distribution: Record<string, RegionCoverage> = {};

  regions.forEach((region) => {
    distribution[region] = calculateRegionCoverage(profiles, region);
  });

  return distribution as Record<E2GRegion, RegionCoverage>;
}

// ============================================================================
// E2G PILLAR ALIGNMENT
// ============================================================================

export interface PillarAlignment {
  pillar: E2GPillar;
  alignedPartners: number;
  averageCapabilityLevel: number;
  totalRelevantProjects: number;
  topPartners: string[]; // Partner IDs
  capabilityGaps: string[];
}

export function calculatePillarAlignment(
  profiles: ConsortiumProfile[],
  pillar: E2GPillar
): PillarAlignment {
  const pillarDef = E2G_PILLAR_DEFINITIONS[pillar];
  const alignedPartners = profiles.filter((p) =>
    p.e2gAlignment.pillarCapabilities.some((pc) => pc.pillar === pillar)
  );

  const totalCapabilityLevel = alignedPartners.reduce((sum, p) => {
    const pillarCap = p.e2gAlignment.pillarCapabilities.find(
      (pc) => pc.pillar === pillar
    );
    const levelScore =
      pillarCap?.capabilityLevel === "advanced"
        ? 4
        : pillarCap?.capabilityLevel === "intermediate"
        ? 3
        : pillarCap?.capabilityLevel === "basic"
        ? 2
        : 1;
    return sum + levelScore;
  }, 0);

  const averageCapabilityLevel =
    alignedPartners.length > 0
      ? totalCapabilityLevel / alignedPartners.length
      : 0;

  const totalRelevantProjects = alignedPartners.reduce((sum, p) => {
    const pillarCap = p.e2gAlignment.pillarCapabilities.find(
      (pc) => pc.pillar === pillar
    );
    return sum + (pillarCap?.relevantProjects || 0);
  }, 0);

  // Get top partners by capability level
  const topPartners = alignedPartners
    .sort((a, b) => {
      const aCap = a.e2gAlignment.pillarCapabilities.find(
        (pc) => pc.pillar === pillar
      );
      const bCap = b.e2gAlignment.pillarCapabilities.find(
        (pc) => pc.pillar === pillar
      );
      const aLevel =
        aCap?.capabilityLevel === "advanced"
          ? 4
          : aCap?.capabilityLevel === "intermediate"
          ? 3
          : aCap?.capabilityLevel === "basic"
          ? 2
          : 1;
      const bLevel =
        bCap?.capabilityLevel === "advanced"
          ? 4
          : bCap?.capabilityLevel === "intermediate"
          ? 3
          : bCap?.capabilityLevel === "basic"
          ? 2
          : 1;
      return bLevel - aLevel;
    })
    .slice(0, 5)
    .map((p) => p.id);

  // Identify capability gaps
  const capabilityGaps: string[] = [];
  if (averageCapabilityLevel < 2) {
    capabilityGaps.push(`Limited ${pillarDef.name} expertise across partners`);
  }
  if (alignedPartners.length < 3) {
    capabilityGaps.push(`Insufficient partners with ${pillarDef.name} capabilities`);
  }

  return {
    pillar,
    alignedPartners: alignedPartners.length,
    averageCapabilityLevel,
    totalRelevantProjects,
    topPartners,
    capabilityGaps,
  };
}

export function getAllPillarAlignments(
  profiles: ConsortiumProfile[]
): Record<E2GPillar, PillarAlignment> {
  const pillars: E2GPillar[] = [
    "ai_automation",
    "agricultural_modernization",
    "workforce_development",
    "quality_systems",
    "business_growth",
  ];
  const alignments: Record<string, PillarAlignment> = {};

  pillars.forEach((pillar) => {
    alignments[pillar] = calculatePillarAlignment(profiles, pillar);
  });

  return alignments as Record<E2GPillar, PillarAlignment>;
}

// ============================================================================
// HUBZONE PRIORITIZATION
// ============================================================================

export interface HUBZonePartner {
  partnerId: string;
  companyName: string;
  region: E2GRegion;
  ruralExperience: boolean;
  communityRelationshipScore: number;
  readinessScore: number;
  capabilities: E2GPillar[];
}

export function getHUBZonePartners(
  profiles: ConsortiumProfile[]
): HUBZonePartner[] {
  return profiles
    .filter((p) =>
      p.certifications.some((c) => c.type === "hubzone" && c.isActive)
    )
    .map((p) => ({
      partnerId: p.id,
      companyName: p.companyIdentity.legalCompanyName,
      region: p.e2gAlignment.targetRegions[0] || "all",
      ruralExperience: p.e2gAlignment.ruralDeploymentExperience,
      communityRelationshipScore: p.e2gAlignment.communityRelationshipStrength,
      readinessScore: p.readinessScore.overallScore,
      capabilities: p.e2gAlignment.pillarCapabilities.map((pc) => pc.pillar),
    }))
    .sort((a, b) => b.communityRelationshipScore - a.communityRelationshipScore);
}

export function prioritizeHUBZonePartners(
  profiles: ConsortiumProfile[],
  targetRegion?: E2GRegion,
  requiredPillar?: E2GPillar
): HUBZonePartner[] {
  let hubZonePartners = getHUBZonePartners(profiles);

  // Filter by region if specified
  if (targetRegion && targetRegion !== "all") {
    hubZonePartners = hubZonePartners.filter(
      (p) => p.region === targetRegion || p.region === "all"
    );
  }

  // Filter by pillar if specified
  if (requiredPillar) {
    hubZonePartners = hubZonePartners.filter((p) =>
      p.capabilities.includes(requiredPillar)
    );
  }

  // Sort by combined score (community relationship + readiness)
  return hubZonePartners.sort((a, b) => {
    const aScore = a.communityRelationshipScore * 0.6 + a.readinessScore * 0.4;
    const bScore = b.communityRelationshipScore * 0.6 + b.readinessScore * 0.4;
    return bScore - aScore;
  });
}

// ============================================================================
// COMMUNITY RELATIONSHIP SCORING
// ============================================================================

export interface CommunityRelationshipFactors {
  localPresence: number; // 0-100
  communityEngagement: number; // 0-100
  localPartnerships: number; // 0-100
  ruralExperience: number; // 0-100
  communityImpact: number; // 0-100
}

export function calculateCommunityRelationshipScore(
  profile: ConsortiumProfile
): number {
  const factors: CommunityRelationshipFactors = {
    localPresence: calculateLocalPresence(profile),
    communityEngagement: calculateCommunityEngagement(profile),
    localPartnerships: calculateLocalPartnerships(profile),
    ruralExperience: calculateRuralExperience(profile),
    communityImpact: calculateCommunityImpact(profile),
  };

  // Weighted average
  const score =
    factors.localPresence * 0.25 +
    factors.communityEngagement * 0.20 +
    factors.localPartnerships * 0.20 +
    factors.ruralExperience * 0.20 +
    factors.communityImpact * 0.15;

  return Math.round(score);
}

function calculateLocalPresence(profile: ConsortiumProfile): number {
  // Check if partner serves E2G target regions
  const targetRegions = ["MD", "VA", "PA", "WV"];
  const servesTargetRegions = profile.e2gAlignment.targetRegions.some((r) =>
    targetRegions.includes(r)
  );

  if (servesTargetRegions) {
    return 80;
  } else if (profile.e2gAlignment.targetRegions.includes("all")) {
    return 70;
  } else {
    return 30;
  }
}

function calculateCommunityEngagement(profile: ConsortiumProfile): number {
  // Based on engagement metrics
  const engagementScore = profile.engagementMetrics.activeEngagementScore;
  const meetingsAttended = profile.engagementMetrics.meetingsAttended;
  const meetingsHosted = profile.engagementMetrics.meetingsHosted;

  let score = engagementScore * 0.5;
  if (meetingsAttended > 5) score += 20;
  if (meetingsHosted > 2) score += 15;
  if (meetingsAttended > 10) score += 10;

  return Math.min(score, 100);
}

function calculateLocalPartnerships(profile: ConsortiumProfile): number {
  // Based on teaming requests and connections
  const teamingRequestsAccepted = profile.engagementMetrics.teamingRequestsAccepted;
  const connections = profile.engagementMetrics.connections;

  let score = 0;
  if (teamingRequestsAccepted > 3) score += 40;
  else if (teamingRequestsAccepted > 1) score += 25;
  else if (teamingRequestsAccepted > 0) score += 10;

  if (connections > 10) score += 30;
  else if (connections > 5) score += 20;
  else if (connections > 2) score += 10;

  return Math.min(score, 100);
}

function calculateRuralExperience(profile: ConsortiumProfile): number {
  if (profile.e2gAlignment.ruralDeploymentExperience) {
    const ruralRegions = profile.e2gAlignment.ruralRegionsServed.length;
    if (ruralRegions > 3) return 100;
    else if (ruralRegions > 1) return 80;
    else return 60;
  }
  return 20;
}

function calculateCommunityImpact(profile: ConsortiumProfile): number {
  // Based on proposals won and past performance
  const proposalsWon = profile.engagementMetrics.proposalsWon;
  const pastPerformance = profile.pastPerformance.length;

  let score = 0;
  if (proposalsWon > 5) score += 50;
  else if (proposalsWon > 2) score += 35;
  else if (proposalsWon > 0) score += 20;

  if (pastPerformance > 5) score += 30;
  else if (pastPerformance > 2) score += 20;
  else if (pastPerformance > 0) score += 10;

  return Math.min(score, 100);
}

// ============================================================================
// RURAL MANUFACTURING SPECIALIZATION
// ============================================================================

export interface RuralManufacturingSpecialist {
  partnerId: string;
  companyName: string;
  regionsServed: string[];
  manufacturingNAICS: string[];
  ruralProjectsCount: number;
  communityRelationshipScore: number;
  readinessScore: number;
}

export function getRuralManufacturingSpecialists(
  profiles: ConsortiumProfile[]
): RuralManufacturingSpecialist[] {
  return profiles
    .filter((p: ConsortiumProfile) => p.e2gAlignment.ruralManufacturingSpecialization)
    .map((p: ConsortiumProfile) => ({
      partnerId: p.id,
      companyName: p.companyIdentity.legalCompanyName,
      regionsServed: p.e2gAlignment.ruralRegionsServed,
      manufacturingNAICS: p.naicsCodes
        .filter((n: any) => n.code.startsWith("31") || n.code.startsWith("32") || n.code.startsWith("33"))
        .map((n: any) => n.code),
      ruralProjectsCount: p.e2gAlignment.pillarCapabilities.reduce(
        (sum: number, pc: any) => sum + pc.relevantProjects,
        0
      ),
      communityRelationshipScore: p.e2gAlignment.communityRelationshipStrength,
      readinessScore: p.readinessScore.overallScore,
    }))
    .sort((a: RuralManufacturingSpecialist, b: RuralManufacturingSpecialist) => b.communityRelationshipScore - a.communityRelationshipScore);
}

export function identifyRuralManufacturingGaps(
  profiles: ConsortiumProfile[],
  targetRegion: E2GRegion
): {
  hasCoverage: boolean;
  specialistCount: number;
  recommendedNAICS: string[];
  recommendedRegions: string[];
} {
  const regionDef = E2G_REGION_DEFINITIONS[targetRegion];
  const specialists = getRuralManufacturingSpecialists(profiles).filter((s) =>
    s.regionsServed.some((r) => regionDef.states.includes(r))
  );

  const hasCoverage = specialists.length > 0;
  const specialistCount = specialists.length;

  // Identify NAICS codes that need coverage
  const coveredNAICS = new Set(
    specialists.flatMap((s) => s.manufacturingNAICS)
  );
  const allManufacturingNAICS = [
    "311", // Food Manufacturing
    "312", // Beverage and Tobacco Product Manufacturing
    "313", // Textile Mills
    "314", // Textile Product Mills
    "315", // Apparel Manufacturing
    "316", // Leather and Allied Product Manufacturing
    "321", // Wood Product Manufacturing
    "322", // Paper Manufacturing
    "323", // Printing and Related Support Activities
    "324", // Petroleum and Coal Products Manufacturing
    "325", // Chemical Manufacturing
    "326", // Plastics and Rubber Products Manufacturing
    "327", // Nonmetallic Mineral Product Manufacturing
    "328", // Primary Metal Manufacturing
    "331", // Fabricated Metal Product Manufacturing
    "332", // Machinery Manufacturing
    "333", // Electrical Equipment, Appliance, and Component Manufacturing
    "334", // Computer and Electronic Product Manufacturing
    "335", // Transportation Equipment Manufacturing
    "336", // Furniture and Related Product Manufacturing
    "337", // Miscellaneous Manufacturing
  ];

  const recommendedNAICS = allManufacturingNAICS.filter((naics) => !coveredNAICS.has(naics));

  // Identify regions that need coverage
  const coveredRegions = new Set(
    specialists.flatMap((s) => s.regionsServed)
  );
  const recommendedRegions = regionDef.states.filter(
    (state) => !coveredRegions.has(state)
  );

  return {
    hasCoverage,
    specialistCount,
    recommendedNAICS,
    recommendedRegions,
  };
}

// ============================================================================
// E2G READINESS ASSESSMENT
// ============================================================================

export interface E2GReadinessAssessment {
  partnerId: string;
  overallReadiness: number; // 0-100
  regionalReadiness: number; // 0-100
  pillarReadiness: number; // 0-100
  communityReadiness: number; // 0-100
  readinessCategory: "excellent" | "good" | "adequate" | "needs_improvement";
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export function assessE2GReadiness(profile: ConsortiumProfile): E2GReadinessAssessment {
  // Regional readiness
  const regionalReadiness = calculateRegionalReadiness(profile);

  // Pillar readiness
  const pillarReadiness = calculatePillarReadiness(profile);

  // Community readiness
  const communityReadiness = profile.e2gAlignment.communityRelationshipStrength;

  // Overall readiness (weighted average)
  const overallReadiness =
    regionalReadiness * 0.30 +
    pillarReadiness * 0.30 +
    communityReadiness * 0.25 +
    (profile.readinessScore.overallScore * 0.15);

  // Determine category
  let readinessCategory: "excellent" | "good" | "adequate" | "needs_improvement";
  if (overallReadiness >= 80) {
    readinessCategory = "excellent";
  } else if (overallReadiness >= 65) {
    readinessCategory = "good";
  } else if (overallReadiness >= 50) {
    readinessCategory = "adequate";
  } else {
    readinessCategory = "needs_improvement";
  }

  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (regionalReadiness >= 75) strengths.push("Strong regional coverage");
  else weaknesses.push("Limited regional coverage");

  if (pillarReadiness >= 75) strengths.push("Strong pillar capabilities");
  else weaknesses.push("Limited pillar capabilities");

  if (communityReadiness >= 75) strengths.push("Strong community relationships");
  else weaknesses.push("Weak community relationships");

  if (profile.e2gAlignment.hubZoneCertified) {
    strengths.push("HUBZone certified");
  }

  if (profile.e2gAlignment.ruralManufacturingSpecialization) {
    strengths.push("Rural manufacturing specialization");
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (regionalReadiness < 60) {
    recommendations.push("Expand coverage to E2G target regions (MD, VA, PA, WV)");
  }
  if (pillarReadiness < 60) {
    recommendations.push("Develop capabilities in E2G priority pillars");
  }
  if (communityReadiness < 60) {
    recommendations.push("Increase community engagement and local partnerships");
  }
  if (!profile.e2gAlignment.hubZoneCertified) {
    recommendations.push("Consider HUBZone certification for enhanced E2G opportunities");
  }

  return {
    partnerId: profile.id,
    overallReadiness: Math.round(overallReadiness),
    regionalReadiness: Math.round(regionalReadiness),
    pillarReadiness: Math.round(pillarReadiness),
    communityReadiness: Math.round(communityReadiness),
    readinessCategory,
    strengths,
    weaknesses,
    recommendations,
  };
}

function calculateRegionalReadiness(profile: ConsortiumProfile): number {
  const targetRegions = profile.e2gAlignment.targetRegions;
  const ruralRegions = profile.e2gAlignment.ruralRegionsServed.length;

  let score = 0;
  if (targetRegions.includes("all")) score += 40;
  else if (targetRegions.length >= 3) score += 35;
  else if (targetRegions.length >= 2) score += 25;
  else if (targetRegions.length >= 1) score += 15;

  if (ruralRegions > 3) score += 30;
  else if (ruralRegions > 1) score += 20;
  else if (ruralRegions > 0) score += 10;

  if (profile.e2gAlignment.ruralDeploymentExperience) score += 20;
  else score += 10;

  return Math.min(score, 100);
}

function calculatePillarReadiness(profile: ConsortiumProfile): number {
  const pillarCapabilities = profile.e2gAlignment.pillarCapabilities;
  const totalRelevantProjects = pillarCapabilities.reduce(
    (sum, pc) => sum + pc.relevantProjects,
    0
  );

  let score = 0;
  if (pillarCapabilities.length >= 4) score += 30;
  else if (pillarCapabilities.length >= 3) score += 25;
  else if (pillarCapabilities.length >= 2) score += 15;
  else if (pillarCapabilities.length >= 1) score += 5;

  const advancedCapabilities = pillarCapabilities.filter(
    (pc) => pc.capabilityLevel === "advanced"
  ).length;
  if (advancedCapabilities >= 2) score += 30;
  else if (advancedCapabilities >= 1) score += 20;

  if (totalRelevantProjects > 5) score += 25;
  else if (totalRelevantProjects > 2) score += 15;
  else if (totalRelevantProjects > 0) score += 5;

  return Math.min(score, 100);
}

// ============================================================================
// E2G IMPACT TRACKING
// ============================================================================

export interface E2GImpactMetrics {
  totalPartners: number;
  hubZonePartners: number;
  ruralSpecialists: number;
  regionalCoverage: Record<E2GRegion, number>;
  pillarCoverage: Record<E2GPillar, number>;
  averageE2GReadiness: number;
  totalRuralProjects: number;
  communityEngagementScore: number;
}

export function calculateE2GImpactMetrics(
  profiles: ConsortiumProfile[]
): E2GImpactMetrics {
  const totalPartners = profiles.length;
  const hubZonePartners = profiles.filter((p) => p.e2gAlignment.hubZoneCertified).length;
  const ruralSpecialists = profiles.filter(
    (p) => p.e2gAlignment.ruralManufacturingSpecialization
  ).length;

  // Regional coverage
  const regionalCoverage: Record<string, number> = {
    MD: 0,
    VA: 0,
    PA: 0,
    WV: 0,
    all: 0,
  };
  profiles.forEach((p) => {
    p.e2gAlignment.targetRegions.forEach((region) => {
      regionalCoverage[region]++;
    });
  });

  // Pillar coverage
  const pillarCoverage: Record<string, number> = {
    ai_automation: 0,
    agricultural_modernization: 0,
    workforce_development: 0,
    quality_systems: 0,
    business_growth: 0,
  };
  profiles.forEach((p) => {
    p.e2gAlignment.pillarCapabilities.forEach((pc) => {
      pillarCoverage[pc.pillar]++;
    });
  });

  // Average E2G readiness
  const totalE2GReadiness = profiles.reduce((sum, p) => {
    const assessment = assessE2GReadiness(p);
    return sum + assessment.overallReadiness;
  }, 0);
  const averageE2GReadiness =
    totalPartners > 0 ? totalE2GReadiness / totalPartners : 0;

  // Total rural projects
  const totalRuralProjects = profiles.reduce((sum, p) => {
    return (
      sum +
      p.e2gAlignment.pillarCapabilities.reduce(
        (pillarSum, pc) => pillarSum + pc.relevantProjects,
        0
      )
    );
  }, 0);

  // Community engagement score
  const totalCommunityScore = profiles.reduce(
    (sum, p) => sum + p.e2gAlignment.communityRelationshipStrength,
    0
  );
  const communityEngagementScore =
    totalPartners > 0 ? totalCommunityScore / totalPartners : 0;

  return {
    totalPartners,
    hubZonePartners,
    ruralSpecialists,
    regionalCoverage: regionalCoverage as Record<E2GRegion, number>,
    pillarCoverage: pillarCoverage as Record<E2GPillar, number>,
    averageE2GReadiness: Math.round(averageE2GReadiness),
    totalRuralProjects,
    communityEngagementScore: Math.round(communityEngagementScore),
  };
}
