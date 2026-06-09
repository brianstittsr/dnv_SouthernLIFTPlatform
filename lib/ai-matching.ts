/**
 * AI-Powered Capability Matching Engine
 * 
 * This module implements the AI-powered matching system for the KDM Consortium Intelligence Platform.
 * It handles three types of matching:
 * 1. Opportunity-to-Partner Matching
 * 2. Partner-to-Partner Teaming Recommendations
 * 3. Partner-to-E2G Firm Alignment
 * 
 * The engine uses vector embeddings, similarity scoring, and machine learning to provide
 * accurate match recommendations with confidence scores.
 */

import { Timestamp } from "firebase/firestore";
import {
  ConsortiumProfile,
  CapabilityMatch,
  TeamingMatch,
  E2GAlignmentMatch,
  NAICSCode,
  Certification,
  Capability,
  TeamingRole,
  E2GPillar,
  E2GRegion,
} from "./consortium-schema";

// ============================================================================
// VECTOR EMBEDDINGS
// ============================================================================

export interface TextEmbedding {
  vector: number[];
  dimension: number;
}

/**
 * Generates a text embedding for capability descriptions
 * In production, this would use a proper embedding model (e.g., OpenAI, Cohere)
 * For now, uses a simple keyword-based approach
 */
export function generateCapabilityEmbedding(text: string): TextEmbedding {
  // Simple keyword extraction for demonstration
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  // Create a simple hash-based embedding
  const dimension = 384; // Common embedding dimension
  const vector = new Array(dimension).fill(0);

  keywords.forEach((keyword) => {
    const hash = hashString(keyword);
    const index = hash % dimension;
    vector[index] += 1;
  });

  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude;
    }
  }

  return { vector, dimension };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculates cosine similarity between two embeddings
 */
export function cosineSimilarity(embedding1: TextEmbedding, embedding2: TextEmbedding): number {
  if (embedding1.dimension !== embedding2.dimension) {
    throw new Error("Embedding dimensions must match");
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.dimension; i++) {
    dotProduct += embedding1.vector[i] * embedding2.vector[i];
    magnitude1 += embedding1.vector[i] * embedding1.vector[i];
    magnitude2 += embedding2.vector[i] * embedding2.vector[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

// ============================================================================
// OPPORTUNITY-TO-PARTNER MATCHING
// ============================================================================

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  naicsCodes: string[];
  requiredCertifications?: string[];
  geographicRequirements?: string[];
  contractType?: string;
  contractValue?: string;
  setAside?: string;
  deadline?: Timestamp;
}

export interface OpportunityMatchInput {
  opportunity: Opportunity;
  partner: ConsortiumProfile;
}

export interface OpportunityMatchWeights {
  naicsAlignment: number;
  certificationMatch: number;
  geographicCoverage: number;
  pastPerformance: number;
  capabilitySimilarity: number;
  readinessScore: number;
}

export const DEFAULT_OPPORTUNITY_MATCH_WEIGHTS: OpportunityMatchWeights = {
  naicsAlignment: 0.25,
  certificationMatch: 0.20,
  geographicCoverage: 0.15,
  pastPerformance: 0.15,
  capabilitySimilarity: 0.15,
  readinessScore: 0.10,
};

export function calculateOpportunityMatch(
  input: OpportunityMatchInput,
  weights: OpportunityMatchWeights = DEFAULT_OPPORTUNITY_MATCH_WEIGHTS
): CapabilityMatch {
  const { opportunity, partner } = input;
  const matchReasons: string[] = [];
  const gaps: string[] = [];
  const recommendedActions: string[] = [];

  let totalScore = 0;

  // 1. NAICS Alignment (25%)
  const naicsAlignment = calculateNAICSAlignment(
    opportunity.naicsCodes,
    partner.naicsCodes.map((n) => n.code)
  );
  totalScore += naicsAlignment * weights.naicsAlignment;
  if (naicsAlignment > 0.7) {
    matchReasons.push(`Strong NAICS code alignment (${Math.round(naicsAlignment * 100)}%)`);
  } else if (naicsAlignment > 0.4) {
    matchReasons.push(`Moderate NAICS code alignment (${Math.round(naicsAlignment * 100)}%)`);
  } else {
    gaps.push("Limited NAICS code alignment");
  }

  // 2. Certification Match (20%)
  const certificationMatch = calculateCertificationMatch(
    opportunity.requiredCertifications || [],
    partner.certifications
  );
  totalScore += certificationMatch * weights.certificationMatch;
  if (certificationMatch > 0.7) {
    matchReasons.push(`Meets required certifications (${Math.round(certificationMatch * 100)}%)`);
  } else if (certificationMatch > 0.4) {
    matchReasons.push(`Partial certification match (${Math.round(certificationMatch * 100)}%)`);
  } else {
    gaps.push("Missing required certifications");
    recommendedActions.push("Consider obtaining required certifications");
  }

  // 3. Geographic Coverage (15%)
  const geographicMatch = calculateGeographicMatch(
    opportunity.geographicRequirements || [],
    partner.geographicCoverage.statesServed
  );
  totalScore += geographicMatch * weights.geographicCoverage;
  if (geographicMatch > 0.7) {
    matchReasons.push(`Serves required geographic area (${Math.round(geographicMatch * 100)}%)`);
  } else if (geographicMatch > 0.4) {
    matchReasons.push(`Partial geographic coverage (${Math.round(geographicMatch * 100)}%)`);
  } else {
    gaps.push("Does not serve required geographic area");
  }

  // 4. Past Performance (15%)
  const pastPerformanceScore = calculatePastPerformanceScore(partner.pastPerformance);
  totalScore += pastPerformanceScore * weights.pastPerformance;
  if (pastPerformanceScore > 0.7) {
    matchReasons.push(`Strong past performance record (${Math.round(pastPerformanceScore * 100)}%)`);
  } else if (pastPerformanceScore > 0.4) {
    matchReasons.push(`Documented past performance (${Math.round(pastPerformanceScore * 100)}%)`);
  } else {
    gaps.push("Limited past performance documentation");
    recommendedActions.push("Document past federal contracts and projects");
  }

  // 5. Capability Similarity (15%)
  const capabilityEmbedding = generateCapabilityEmbedding(opportunity.description);
  const partnerCapabilitiesText = partner.capabilities
    .map((c) => `${c.name} ${c.description}`)
    .join(" ");
  const partnerEmbedding = generateCapabilityEmbedding(partnerCapabilitiesText);
  const capabilitySimilarity = cosineSimilarity(capabilityEmbedding, partnerEmbedding);
  totalScore += capabilitySimilarity * weights.capabilitySimilarity;
  if (capabilitySimilarity > 0.6) {
    matchReasons.push(`High capability similarity (${Math.round(capabilitySimilarity * 100)}%)`);
  } else if (capabilitySimilarity > 0.3) {
    matchReasons.push(`Moderate capability similarity (${Math.round(capabilitySimilarity * 100)}%)`);
  }

  // 6. Readiness Score (10%)
  const readinessScore = partner.readinessScore.overallScore / 100;
  totalScore += readinessScore * weights.readinessScore;
  if (readinessScore > 0.8) {
    matchReasons.push(`Excellent government contracting readiness (${Math.round(readinessScore * 100)}%)`);
  } else if (readinessScore > 0.6) {
    matchReasons.push(`Good government contracting readiness (${Math.round(readinessScore * 100)}%)`);
  } else {
    gaps.push("Government contracting readiness needs improvement");
    recommendedActions.push("Improve readiness score by addressing gaps");
  }

  // Calculate confidence based on match consistency
  const confidence = calculateMatchConfidence(
    naicsAlignment,
    certificationMatch,
    geographicMatch,
    pastPerformanceScore,
    capabilitySimilarity,
    readinessScore
  );

  return {
    opportunityId: opportunity.id,
    partnerId: partner.id,
    matchScore: Math.round(totalScore * 100),
    confidence: Math.round(confidence * 100),
    matchReasons,
    gaps,
    recommendedActions,
    calculatedAt: Timestamp.now(),
  };
}

function calculateNAICSAlignment(opportunityNAICS: string[], partnerNAICS: string[]): number {
  if (opportunityNAICS.length === 0 || partnerNAICS.length === 0) {
    return 0;
  }

  // Check for exact matches
  const exactMatches = opportunityNAICS.filter((code) => partnerNAICS.includes(code));
  if (exactMatches.length > 0) {
    return 1.0;
  }

  // Check for partial matches (first 2-4 digits)
  const partialMatches = opportunityNAICS.filter((oppCode) =>
    partnerNAICS.some((partnerCode) => {
      const oppPrefix = oppCode.substring(0, 4);
      const partnerPrefix = partnerCode.substring(0, 4);
      return oppPrefix === partnerPrefix;
    })
  );

  return partialMatches.length / opportunityNAICS.length;
}

function calculateCertificationMatch(
  required: string[],
  partnerCerts: Certification[]
): number {
  if (required.length === 0) {
    return 1.0; // No requirements, so fully matched
  }

  if (partnerCerts.length === 0) {
    return 0;
  }

  const activeCertTypes = partnerCerts
    .filter((c) => c.isActive)
    .map((c) => c.type as string);

  const matches = required.filter((req) => activeCertTypes.includes(req));
  return matches.length / required.length;
}

function calculateGeographicMatch(
  required: string[],
  partnerServes: string[]
): number {
  if (required.length === 0) {
    return 1.0; // No geographic requirements
  }

  if (partnerServes.length === 0) {
    return 0;
  }

  const matches = required.filter((req) => partnerServes.includes(req));
  return matches.length / required.length;
}

function calculatePastPerformanceScore(pastPerformance: any[]): number {
  if (!pastPerformance || pastPerformance.length === 0) {
    return 0;
  }

  // Score based on number of past performance entries
  if (pastPerformance.length >= 5) {
    return 1.0;
  } else if (pastPerformance.length >= 3) {
    return 0.8;
  } else if (pastPerformance.length >= 1) {
    return 0.6;
  }

  return 0;
}

function calculateMatchConfidence(...scores: number[]): number {
  // Confidence is based on consistency of scores
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  // Lower variance = higher confidence
  const confidence = 1 - Math.min(standardDeviation, 1);
  return confidence;
}

// ============================================================================
// PARTNER-TO-PARTNER TEAMING MATCHING
// ============================================================================

export interface TeamingMatchInput {
  partner1: ConsortiumProfile;
  partner2: ConsortiumProfile;
  opportunityId?: string;
}

export interface TeamingMatchWeights {
  capabilityComplementarity: number;
  geographicAlignment: number;
  certificationSynergy: number;
  teamingPreferenceMatch: number;
  sizeCompatibility: number;
  pastCollaboration: number;
}

export const DEFAULT_TEAMING_MATCH_WEIGHTS: TeamingMatchWeights = {
  capabilityComplementarity: 0.30,
  geographicAlignment: 0.20,
  certificationSynergy: 0.15,
  teamingPreferenceMatch: 0.15,
  sizeCompatibility: 0.10,
  pastCollaboration: 0.10,
};

export function calculateTeamingMatch(
  input: TeamingMatchInput,
  weights: TeamingMatchWeights = DEFAULT_TEAMING_MATCH_WEIGHTS
): TeamingMatch {
  const { partner1, partner2 } = input;
  const complementaryStrengths: string[] = [];
  const potentialSynergies: string[] = [];

  let totalScore = 0;

  // 1. Capability Complementarity (30%)
  const complementarity = calculateCapabilityComplementarity(
    partner1.capabilities,
    partner2.capabilities
  );
  totalScore += complementarity * weights.capabilityComplementarity;
  if (complementarity > 0.7) {
    complementaryStrengths.push("Highly complementary capabilities");
    potentialSynergies.push("Can combine technical expertise for comprehensive solutions");
  } else if (complementarity > 0.4) {
    complementaryStrengths.push("Moderately complementary capabilities");
  }

  // 2. Geographic Alignment (20%)
  const geographicAlignment = calculateGeographicAlignment(
    partner1.geographicCoverage.statesServed,
    partner2.geographicCoverage.statesServed
  );
  totalScore += geographicAlignment * weights.geographicAlignment;
  if (geographicAlignment > 0.7) {
    complementaryStrengths.push("Strong geographic alignment");
    potentialSynergies.push("Can jointly serve multi-region opportunities");
  } else if (geographicAlignment > 0.4) {
    complementaryStrengths.push("Partial geographic alignment");
  }

  // 3. Certification Synergy (15%)
  const certificationSynergy = calculateCertificationSynergy(
    partner1.certifications,
    partner2.certifications
  );
  totalScore += certificationSynergy * weights.certificationSynergy;
  if (certificationSynergy > 0.7) {
    complementaryStrengths.push("Complementary certification portfolio");
    potentialSynergies.push("Combined certifications increase set-aside eligibility");
  } else if (certificationSynergy > 0.4) {
    complementaryStrengths.push("Some certification synergy");
  }

  // 4. Teaming Preference Match (15%)
  const teamingPreferenceMatch = calculateTeamingPreferenceMatch(
    partner1.teamingPreferences,
    partner2.teamingPreferences
  );
  totalScore += teamingPreferenceMatch * weights.teamingPreferenceMatch;
  if (teamingPreferenceMatch > 0.7) {
    complementaryStrengths.push("Compatible teaming preferences");
  } else if (teamingPreferenceMatch > 0.4) {
    complementaryStrengths.push("Moderate teaming preference alignment");
  }

  // 5. Size Compatibility (10%)
  const sizeCompatibility = calculateSizeCompatibility(
    partner1.companyIdentity.employeeCountRange,
    partner2.companyIdentity.employeeCountRange
  );
  totalScore += sizeCompatibility * weights.sizeCompatibility;
  if (sizeCompatibility > 0.7) {
    complementaryStrengths.push("Compatible organizational sizes");
  }

  // 6. Past Collaboration (10%)
  const pastCollaboration = 0; // Would be calculated from collaboration history
  totalScore += pastCollaboration * weights.pastCollaboration;

  // Determine recommended roles
  const recommendedRoles = determineRecommendedRoles(
    partner1,
    partner2,
    complementarity,
    certificationSynergy
  );

  const confidence = calculateMatchConfidence(
    complementarity,
    geographicAlignment,
    certificationSynergy,
    teamingPreferenceMatch,
    sizeCompatibility,
    pastCollaboration
  );

  return {
    partner1Id: partner1.id,
    partner2Id: partner2.id,
    matchScore: Math.round(totalScore * 100),
    confidence: Math.round(confidence * 100),
    complementaryStrengths,
    potentialSynergies,
    recommendedRoles,
    calculatedAt: Timestamp.now(),
  };
}

function calculateCapabilityComplementarity(
  capabilities1: Capability[],
  capabilities2: Capability[]
): number {
  if (capabilities1.length === 0 || capabilities2.length === 0) {
    return 0;
  }

  const cats1 = new Set(capabilities1.map((c) => c.category));
  const cats2 = new Set(capabilities2.map((c) => c.category));

  // Complementarity = 1 - overlap
  const intersection = new Set([...cats1].filter((x) => cats2.has(x)));
  const union = new Set([...cats1, ...cats2]);
  const overlap = intersection.size / union.size;

  return 1 - overlap; // Higher complementarity = lower overlap
}

function calculateGeographicAlignment(states1: string[], states2: string[]): number {
  if (states1.length === 0 || states2.length === 0) {
    return 0;
  }

  const intersection = states1.filter((s) => states2.includes(s));
  const union = new Set([...states1, ...states2]);

  return intersection.length / union.size;
}

function calculateCertificationSynergy(
  certs1: Certification[],
  certs2: Certification[]
): number {
  const activeCerts1 = new Set(
    certs1.filter((c) => c.isActive).map((c) => c.type)
  );
  const activeCerts2 = new Set(
    certs2.filter((c) => c.isActive).map((c) => c.type)
  );

  const union = new Set([...activeCerts1, ...activeCerts2]);
  const intersection = new Set([...activeCerts1].filter((x) => activeCerts2.has(x)));

  // Synergy = combined unique certifications
  return union.size / (intersection.size || 1);
}

function calculateTeamingPreferenceMatch(
  prefs1: any,
  prefs2: any
): number {
  let matches = 0;
  let total = 0;

  // Check prime/sub compatibility
  if (prefs1.willingToPrime && prefs2.willingToSub) {
    matches++;
  }
  if (prefs1.willingToSub && prefs2.willingToPrime) {
    matches++;
  }
  total += 2;

  // Check seeking partners
  if (prefs1.seekingPartners && prefs2.seekingPartners) {
    matches++;
  }
  total++;

  return total > 0 ? matches / total : 0;
}

function calculateSizeCompatibility(size1: string, size2: string): number {
  // Simple size compatibility check
  const sizeOrder = ["1-10", "11-50", "51-200", "200+"];
  const idx1 = sizeOrder.indexOf(size1);
  const idx2 = sizeOrder.indexOf(size2);

  if (idx1 === -1 || idx2 === -1) {
    return 0.5; // Unknown sizes get neutral score
  }

  const diff = Math.abs(idx1 - idx2);
  return Math.max(0, 1 - diff * 0.25); // Decrease score with size difference
}

function determineRecommendedRoles(
  partner1: ConsortiumProfile,
  partner2: ConsortiumProfile,
  complementarity: number,
  certificationSynergy: number
): {
  partner1Role: TeamingRole;
  partner2Role: TeamingRole;
} {
  // Simple role determination based on certifications and experience
  const certs1 = partner1.certifications.filter((c) => c.isActive).length;
  const certs2 = partner2.certifications.filter((c) => c.isActive).length;
  const pastPerf1 = partner1.pastPerformance.length;
  const pastPerf2 = partner2.pastPerformance.length;

  const score1 = certs1 * 2 + pastPerf1;
  const score2 = certs2 * 2 + pastPerf2;

  if (score1 > score2) {
    return {
      partner1Role: "prime",
      partner2Role: "subcontractor",
    };
  } else if (score2 > score1) {
    return {
      partner1Role: "subcontractor",
      partner2Role: "prime",
    };
  } else {
    return {
      partner1Role: "joint_venture",
      partner2Role: "joint_venture",
    };
  }
}

// ============================================================================
// PARTNER-TO-E2G FIRM ALIGNMENT
// ============================================================================

export interface E2GFirm {
  id: string;
  name: string;
  industry: string;
  needs: string[];
  geographicLocation: string;
  e2gPillars: E2GPillar[];
  manufacturingFocus: boolean;
  ruralLocation: boolean;
}

export interface E2GAlignmentInput {
  partner: ConsortiumProfile;
  e2gFirm?: E2GFirm;
  targetRegion?: E2GRegion;
}

export interface E2GAlignmentWeights {
  pillarAlignment: number;
  geographicAlignment: number;
  ruralExperience: number;
  specializationMatch: number;
  readinessScore: number;
  communityRelationship: number;
}

export const DEFAULT_E2G_ALIGNMENT_WEIGHTS: E2GAlignmentWeights = {
  pillarAlignment: 0.25,
  geographicAlignment: 0.20,
  ruralExperience: 0.20,
  specializationMatch: 0.15,
  readinessScore: 0.10,
  communityRelationship: 0.10,
};

export function calculateE2GAlignment(
  input: E2GAlignmentInput,
  weights: E2GAlignmentWeights = DEFAULT_E2G_ALIGNMENT_WEIGHTS
): E2GAlignmentMatch {
  const { partner, e2gFirm, targetRegion } = input;
  const pillarAlignment: E2GPillar[] = [];
  const specializationMatch: string[] = [];

  let totalScore = 0;

  // 1. Pillar Alignment (25%)
  const pillarScore = calculatePillarAlignment(
    partner.consortiumPillarAlignment.pillars,
    e2gFirm?.e2gPillars || []
  );
  totalScore += pillarScore * weights.pillarAlignment;
  if (pillarScore > 0.7) {
    pillarAlignment.push(...partner.consortiumPillarAlignment.pillars);
  }

  // 2. Geographic Alignment (20%)
  const geographicScore = calculateE2GGeographicAlignment(
    partner.e2gAlignment.targetRegions,
    targetRegion || "all",
    e2gFirm?.geographicLocation,
    partner
  );
  totalScore += geographicScore * weights.geographicAlignment;

  // 3. Rural Experience (20%)
  const ruralScore = partner.e2gAlignment.ruralDeploymentExperience ? 1.0 : 0.5;
  totalScore += ruralScore * weights.ruralExperience;

  // 4. Specialization Match (15%)
  const specializationScore = calculateSpecializationMatch(
    partner,
    e2gFirm
  );
  totalScore += specializationScore * weights.specializationMatch;
  if (specializationScore > 0.6) {
    specializationMatch.push("Industry-specific expertise");
  }

  // 5. Readiness Score (10%)
  const readinessScore = partner.readinessScore.overallScore / 100;
  totalScore += readinessScore * weights.readinessScore;

  // 6. Community Relationship (10%)
  const communityScore = partner.e2gAlignment.communityRelationshipStrength / 100;
  totalScore += communityScore * weights.communityRelationship;

  const confidence = calculateMatchConfidence(
    pillarScore,
    geographicScore,
    ruralScore,
    specializationScore,
    readinessScore,
    communityScore
  );

  return {
    partnerId: partner.id,
    e2gFirmId: e2gFirm?.id,
    matchScore: Math.round(totalScore * 100),
    confidence: Math.round(confidence * 100),
    pillarAlignment,
    geographicAlignment: geographicScore > 0.5,
    ruralExperience: partner.e2gAlignment.ruralDeploymentExperience,
    specializationMatch,
    calculatedAt: Timestamp.now(),
  };
}

function calculatePillarAlignment(
  partnerPillars: E2GPillar[],
  firmPillars: E2GPillar[]
): number {
  if (firmPillars.length === 0) {
    return 1.0; // No specific pillar requirements
  }

  if (partnerPillars.length === 0) {
    return 0;
  }

  const intersection = partnerPillars.filter((p) => firmPillars.includes(p));
  return intersection.length / firmPillars.length;
}

function calculateE2GGeographicAlignment(
  partnerRegions: E2GRegion[],
  targetRegion: E2GRegion,
  firmLocation?: string,
  partner?: ConsortiumProfile
): number {
  if (partnerRegions.includes("all") || partnerRegions.includes(targetRegion)) {
    return 1.0;
  }

  // Check if partner serves the firm's location
  if (firmLocation && partner?.e2gAlignment.ruralRegionsServed.includes(firmLocation)) {
    return 0.8;
  }

  return 0.3; // Partial alignment
}

function calculateSpecializationMatch(
  partner: ConsortiumProfile,
  e2gFirm?: E2GFirm
): number {
  if (!e2gFirm) {
    return 0.5; // Neutral score if no firm specified
  }

  // Check if partner has relevant industry experience
  const relevantNAICS = partner.naicsCodes.some((naics) => {
    // Simple check - in production would use more sophisticated matching
    return naics.description.toLowerCase().includes(e2gFirm.industry.toLowerCase());
  });

  if (relevantNAICS) {
    return 0.8;
  }

  // Check capabilities
  const relevantCapability = partner.capabilities.some((cap) =>
    cap.description.toLowerCase().includes(e2gFirm.industry.toLowerCase())
  );

  if (relevantCapability) {
    return 0.6;
  }

  return 0.3;
}

// ============================================================================
// BATCH MATCHING
// ============================================================================

export interface BatchMatchOptions {
  threshold?: number;
  limit?: number;
  weights?: any;
}

export function batchOpportunityMatching(
  opportunity: Opportunity,
  partners: ConsortiumProfile[],
  options: BatchMatchOptions = {}
): CapabilityMatch[] {
  const { threshold = 50, limit = 10 } = options;

  const matches = partners
    .map((partner) => calculateOpportunityMatch({ opportunity, partner }))
    .filter((match) => match.matchScore >= threshold)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return matches;
}

export function batchTeamingMatching(
  partner: ConsortiumProfile,
  allPartners: ConsortiumProfile[],
  options: BatchMatchOptions = {}
): TeamingMatch[] {
  const { threshold = 50, limit = 10 } = options;

  const matches = allPartners
    .filter((p) => p.id !== partner.id)
    .map((otherPartner) =>
      calculateTeamingMatch({ partner1: partner, partner2: otherPartner })
    )
    .filter((match) => match.matchScore >= threshold)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return matches;
}

export function batchE2GAlignment(
  partners: ConsortiumProfile[],
  e2gFirms: E2GFirm[],
  options: BatchMatchOptions = {}
): E2GAlignmentMatch[] {
  const { threshold = 50, limit = 10 } = options;

  const matches: E2GAlignmentMatch[] = [];

  for (const partner of partners) {
    for (const firm of e2gFirms) {
      const match = calculateE2GAlignment({ partner, e2gFirm: firm });
      if (match.matchScore >= threshold) {
        matches.push(match);
      }
    }
  }

  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
