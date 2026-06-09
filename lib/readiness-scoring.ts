/**
 * Government Contracting Readiness Scoring System
 * 
 * This module implements the automated Government Contracting Readiness Score calculation
 * as specified in the KDM Consortium Intelligence Platform documentation.
 * 
 * The score is calculated based on 7 weighted criteria:
 * - Active SAM.gov Registration (20%)
 * - Unique Entity ID (UEI) (15%)
 * - CAGE Code (15%)
 * - NAICS Code Coverage (15%)
 * - Federal Certifications (15%)
 * - Past Performance Documentation (10%)
 * - GSA Schedule Holder Status (10%)
 */

import { Timestamp } from "firebase/firestore";
import {
  ConsortiumProfile,
  ReadinessScore,
  READINESS_SCORE_WEIGHTS,
} from "./consortium-schema";

// ============================================================================
// SAM.GOV VALIDATION
// ============================================================================

export interface SAMValidationResult {
  isValid: boolean;
  registrationStatus: "not_registered" | "pending" | "active" | "expired";
  expirationDate?: Date;
  cageCode?: string;
  uei?: string;
  lastValidated: Timestamp;
  validationErrors: string[];
}

/**
 * Validates SAM.gov registration status
 * In production, this would call the SAM.gov API
 * For now, returns a mock result based on profile data
 */
export async function validateSAMRegistration(
  profile: ConsortiumProfile
): Promise<SAMValidationResult> {
  const errors: string[] = [];
  const govProfile = profile.governmentContractingProfile;

  if (!govProfile) {
    return {
      isValid: false,
      registrationStatus: "not_registered",
      lastValidated: Timestamp.now(),
      validationErrors: ["No government contracting profile found"],
    };
  }

  // Check registration status
  if (govProfile.samRegistrationStatus !== "active") {
    errors.push(`SAM registration is ${govProfile.samRegistrationStatus}`);
  }

  // Check expiration date
  if (govProfile.samExpirationDate) {
    const expirationDate = govProfile.samExpirationDate.toDate();
    if (expirationDate < new Date()) {
      errors.push("SAM registration has expired");
    }
  }

  // Check UEI
  if (!govProfile.uei) {
    errors.push("UEI not assigned");
  }

  // Check CAGE code
  if (!govProfile.cageCode) {
    errors.push("CAGE code not assigned");
  }

  return {
    isValid: errors.length === 0,
    registrationStatus: govProfile.samRegistrationStatus,
    expirationDate: govProfile.samExpirationDate?.toDate(),
    cageCode: govProfile.cageCode,
    uei: govProfile.uei,
    lastValidated: Timestamp.now(),
    validationErrors: errors,
  };
}

// ============================================================================
// READINESS SCORE CALCULATION
// ============================================================================

export interface ReadinessScoreInput {
  samRegistrationStatus: "not_registered" | "pending" | "active" | "expired";
  samExpirationDate?: Timestamp;
  uei?: string;
  cageCode?: string;
  naicsCodes: string[];
  certifications: Array<{ type: string; isActive: boolean }>;
  pastPerformanceCount: number;
  gsaScheduleHolder: boolean;
}

export function calculateReadinessScore(input: ReadinessScoreInput): ReadinessScore {
  const breakdown = {
    samRegistration: 0,
    uei: 0,
    cageCode: 0,
    naicsCoverage: 0,
    federalCertifications: 0,
    pastPerformance: 0,
    gsaSchedule: 0,
  };

  const gaps: string[] = [];
  const remediationRecommendations: string[] = [];
  const resources: Array<{ title: string; url: string; description: string }> = [];

  // 1. SAM Registration (20%)
  if (input.samRegistrationStatus === "active") {
    // Check if not expired
    if (input.samExpirationDate) {
      const expirationDate = input.samExpirationDate.toDate();
      if (expirationDate > new Date()) {
        breakdown.samRegistration = READINESS_SCORE_WEIGHTS.samRegistration;
      } else {
        gaps.push("SAM registration has expired");
        remediationRecommendations.push("Renew SAM.gov registration before expiration");
        resources.push({
          title: "SAM.gov Renewal",
          url: "https://sam.gov",
          description: "Renew your SAM.gov registration",
        });
      }
    } else {
      breakdown.samRegistration = READINESS_SCORE_WEIGHTS.samRegistration;
    }
  } else {
    gaps.push("SAM.gov registration not active");
    remediationRecommendations.push("Complete SAM.gov registration");
    resources.push({
      title: "SAM.gov Registration Guide",
      url: "https://sam.gov/content/registration-guide",
      description: "Step-by-step guide for SAM.gov registration",
    });
  }

  // 2. UEI (15%)
  if (input.uei && input.uei.length > 0) {
    breakdown.uei = READINESS_SCORE_WEIGHTS.uei;
  } else {
    gaps.push("Unique Entity ID (UEI) not assigned");
    remediationRecommendations.push("Obtain UEI through SAM.gov registration");
    resources.push({
      title: "UEI Information",
      url: "https://sam.gov/content/uei-information",
      description: "Learn about Unique Entity ID requirements",
    });
  }

  // 3. CAGE Code (15%)
  if (input.cageCode && input.cageCode.length > 0) {
    breakdown.cageCode = READINESS_SCORE_WEIGHTS.cageCode;
  } else {
    gaps.push("CAGE code not assigned");
    remediationRecommendations.push("Apply for CAGE code through SAM.gov");
    resources.push({
      title: "CAGE Code Application",
      url: "https://sam.gov/content/cage-code-information",
      description: "Apply for Commercial and Government Entity code",
    });
  }

  // 4. NAICS Coverage (15%)
  if (input.naicsCodes && input.naicsCodes.length > 0) {
    breakdown.naicsCoverage = READINESS_SCORE_WEIGHTS.naicsCoverage;
  } else {
    gaps.push("No NAICS codes specified");
    remediationRecommendations.push("Add relevant NAICS codes to your profile");
    resources.push({
      title: "NAICS Code Search",
      url: "https://www.census.gov/naics",
      description: "Search for relevant NAICS codes for your business",
    });
  }

  // 5. Federal Certifications (15%)
  const federalCertTypes = ["8a", "wosb", "sdvosb", "hubzone", "cmmc_level1", "cmmc_level2", "cmmc_level3"];
  const hasFederalCert = input.certifications.some(
    (cert) => federalCertTypes.includes(cert.type) && cert.isActive
  );
  if (hasFederalCert) {
    breakdown.federalCertifications = READINESS_SCORE_WEIGHTS.federalCertifications;
  } else {
    gaps.push("No federal set-aside certifications");
    remediationRecommendations.push("Consider obtaining federal set-aside certifications (8(a), WOSB, SDVOSB, HUBZone)");
    resources.push({
      title: "SBA Certification Programs",
      url: "https://www.sba.gov/federal-contracting/contracting-assistance/certification-programs",
      description: "Information about SBA certification programs",
    });
  }

  // 6. Past Performance (10%)
  if (input.pastPerformanceCount > 0) {
    breakdown.pastPerformance = READINESS_SCORE_WEIGHTS.pastPerformance;
  } else {
    gaps.push("No past performance documented");
    remediationRecommendations.push("Document past federal contracts and projects");
    resources.push({
      title: "Past Performance Documentation",
      url: "https://www.acquisition.gov",
      description: "Guidance on documenting past performance",
    });
  }

  // 7. GSA Schedule (10%)
  if (input.gsaScheduleHolder) {
    breakdown.gsaSchedule = READINESS_SCORE_WEIGHTS.gsaSchedule;
  }
  // Note: GSA Schedule is not a disqualifier if absent, so no gap/recommendation

  const overallScore =
    breakdown.samRegistration +
    breakdown.uei +
    breakdown.cageCode +
    breakdown.naicsCoverage +
    breakdown.federalCertifications +
    breakdown.pastPerformance +
    breakdown.gsaSchedule;

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

// ============================================================================
// READINESS SCORE UPDATE
// ============================================================================

export interface ReadinessScoreUpdate {
  profileId: string;
  previousScore?: ReadinessScore;
  newScore: ReadinessScore;
  scoreChange: number;
  improved: boolean;
  gapsResolved: string[];
  newGaps: string[];
}

export function updateReadinessScore(
  previousScore: ReadinessScore | undefined,
  newScore: ReadinessScore
): ReadinessScoreUpdate {
  const previousOverall = previousScore?.overallScore || 0;
  const scoreChange = newScore.overallScore - previousOverall;
  const improved = scoreChange > 0;

  // Identify resolved gaps
  const gapsResolved = previousScore?.gaps.filter(
    (gap) => !newScore.gaps.includes(gap)
  ) || [];

  // Identify new gaps
  const newGaps = newScore.gaps.filter(
    (gap) => !previousScore?.gaps.includes(gap)
  );

  // Preserve score history
  const scoreHistory = previousScore?.scoreHistory || [];
  scoreHistory.push({
    score: newScore.overallScore,
    calculatedAt: newScore.lastCalculated,
  });

  // Keep only last 10 scores
  if (scoreHistory.length > 10) {
    scoreHistory.shift();
  }

  return {
    profileId: "", // Will be set by caller
    previousScore,
    newScore: {
      ...newScore,
      scoreHistory,
    },
    scoreChange,
    improved,
    gapsResolved,
    newGaps,
  };
}

// ============================================================================
// READINESS SCORE THRESHOLDS
// ============================================================================

export const READINESS_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  ADEQUATE: 60,
  NEEDS_IMPROVEMENT: 40,
  CRITICAL: 0,
} as const;

export function getReadinessCategory(score: number): {
  category: string;
  color: string;
  description: string;
} {
  if (score >= READINESS_THRESHOLDS.EXCELLENT) {
    return {
      category: "Excellent",
      color: "green",
      description: "Fully prepared for federal contracting",
    };
  } else if (score >= READINESS_THRESHOLDS.GOOD) {
    return {
      category: "Good",
      color: "blue",
      description: "Well-prepared with minor gaps",
    };
  } else if (score >= READINESS_THRESHOLDS.ADEQUATE) {
    return {
      category: "Adequate",
      color: "yellow",
      description: "Basic readiness with improvement needed",
    };
  } else if (score >= READINESS_THRESHOLDS.NEEDS_IMPROVEMENT) {
    return {
      category: "Needs Improvement",
      color: "orange",
      description: "Significant gaps requiring attention",
    };
  } else {
    return {
      category: "Critical",
      color: "red",
      description: "Major deficiencies - immediate action required",
    };
  }
}

// ============================================================================
// READINESS SCORE NOTIFICATIONS
// ============================================================================

export interface ReadinessScoreNotification {
  type: "score_improved" | "score_declined" | "below_threshold" | "gap_resolved" | "new_gap";
  message: string;
  priority: "low" | "medium" | "high";
  actionRequired: boolean;
}

export function generateReadinessNotifications(
  update: ReadinessScoreUpdate
): ReadinessScoreNotification[] {
  const notifications: ReadinessScoreNotification[] = [];

  // Score improved significantly
  if (update.scoreChange >= 10) {
    notifications.push({
      type: "score_improved",
      message: `Your readiness score improved by ${update.scoreChange} points to ${update.newScore.overallScore}`,
      priority: "medium",
      actionRequired: false,
    });
  }

  // Score declined significantly
  if (update.scoreChange <= -10) {
    notifications.push({
      type: "score_declined",
      message: `Your readiness score declined by ${Math.abs(update.scoreChange)} points to ${update.newScore.overallScore}`,
      priority: "high",
      actionRequired: true,
    });
  }

  // Score below adequate threshold
  if (update.newScore.overallScore < READINESS_THRESHOLDS.ADEQUATE) {
    notifications.push({
      type: "below_threshold",
      message: `Your readiness score (${update.newScore.overallScore}) is below the adequate threshold (${READINESS_THRESHOLDS.ADEQUATE})`,
      priority: "high",
      actionRequired: true,
    });
  }

  // Gaps resolved
  if (update.gapsResolved.length > 0) {
    notifications.push({
      type: "gap_resolved",
      message: `Resolved ${update.gapsResolved.length} readiness gap(s): ${update.gapsResolved.join(", ")}`,
      priority: "low",
      actionRequired: false,
    });
  }

  // New gaps
  if (update.newGaps.length > 0) {
    notifications.push({
      type: "new_gap",
      message: `New readiness gap(s) identified: ${update.newGaps.join(", ")}`,
      priority: "medium",
      actionRequired: true,
    });
  }

  return notifications;
}

// ============================================================================
// READINESS SCORE REPORTING
// ============================================================================

export interface ReadinessScoreReport {
  profileId: string;
  currentScore: ReadinessScore;
  category: ReturnType<typeof getReadinessCategory>;
  trend: "improving" | "stable" | "declining";
  trendPercentage: number;
  topGaps: string[];
  topRecommendations: string[];
  estimatedTimeToFullReadiness: string;
}

export type { ReadinessScore } from "./consortium-schema";

export function generateReadinessScoreReport(
  profileId: string,
  score: ReadinessScore
): ReadinessScoreReport {
  const category = getReadinessCategory(score.overallScore);

  // Calculate trend based on score history
  let trend: "improving" | "stable" | "declining" = "stable";
  let trendPercentage = 0;

  if (score.scoreHistory.length >= 2) {
    const recent = score.scoreHistory[score.scoreHistory.length - 1].score;
    const previous = score.scoreHistory[score.scoreHistory.length - 2].score;
    const change = recent - previous;
    trendPercentage = (change / previous) * 100;

    if (change > 5) {
      trend = "improving";
    } else if (change < -5) {
      trend = "declining";
    }
  }

  // Top gaps (prioritized by impact)
  const topGaps = score.gaps.slice(0, 3);

  // Top recommendations
  const topRecommendations = score.remediationRecommendations.slice(0, 3);

  // Estimate time to full readiness
  const missingPoints = 100 - score.overallScore;
  let estimatedTimeToFullReadiness = "Unknown";
  if (missingPoints <= 10) {
    estimatedTimeToFullReadiness = "1-2 weeks";
  } else if (missingPoints <= 25) {
    estimatedTimeToFullReadiness = "1-2 months";
  } else if (missingPoints <= 50) {
    estimatedTimeToFullReadiness = "2-4 months";
  } else {
    estimatedTimeToFullReadiness = "4-6 months";
  }

  return {
    profileId,
    currentScore: score,
    category,
    trend,
    trendPercentage,
    topGaps,
    topRecommendations,
    estimatedTimeToFullReadiness,
  };
}
