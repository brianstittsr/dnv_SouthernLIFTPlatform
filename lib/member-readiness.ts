/**
 * Member GovCon readiness helpers for the admin Team Members surface.
 *
 * Adapts TeamMemberDoc (+ linked users doc) data to the scoring engine in
 * lib/readiness-scoring.ts, which was written against consortium_profiles.
 * The admin Kanban and the readiness-scan API both consume these helpers.
 *
 * Note: computeMemberReadiness returns timestamp-free data — callers stamp
 * lastCalculated with whichever Firestore Timestamp factory they have.
 */

import type { TeamMemberDoc } from "@/lib/schema";
import { calculateReadinessScore, getReadinessCategory, type ReadinessScoreInput } from "@/lib/readiness-scoring";

export type CompanyIntelligence = NonNullable<TeamMemberDoc["companyIntelligence"]>;
export type KanbanStage = NonNullable<TeamMemberDoc["onboardingStage"]>;

export interface MemberReadinessResult {
  overallScore: number;
  breakdown: {
    samRegistration: number;
    uei: number;
    cageCode: number;
    naicsCoverage: number;
    federalCertifications: number;
    pastPerformance: number;
    gsaSchedule: number;
  };
  gaps: string[];
  remediationRecommendations: string[];
}

export const READINESS_CONTRACT_READY_THRESHOLD = 60;

export interface ReadinessBucket {
  id: "critical" | "needs_improvement" | "adequate" | "good" | "excellent";
  label: string;
  min: number;
  accent: string;
  headerBg: string;
  badgeBg: string;
}

/** Score-band columns for the Kanban (aligned with getReadinessCategory thresholds). */
export const READINESS_BUCKETS: ReadinessBucket[] = [
  { id: "critical", label: "Critical (<40)", min: 0, accent: "text-red-700", headerBg: "bg-red-50", badgeBg: "bg-red-100 text-red-800" },
  { id: "needs_improvement", label: "Needs Improvement (40–59)", min: 40, accent: "text-orange-700", headerBg: "bg-orange-50", badgeBg: "bg-orange-100 text-orange-800" },
  { id: "adequate", label: "Adequate (60–74)", min: 60, accent: "text-yellow-700", headerBg: "bg-yellow-50", badgeBg: "bg-yellow-100 text-yellow-800" },
  { id: "good", label: "Good (75–89)", min: 75, accent: "text-blue-700", headerBg: "bg-blue-50", badgeBg: "bg-blue-100 text-blue-800" },
  { id: "excellent", label: "Excellent (90+)", min: 90, accent: "text-green-700", headerBg: "bg-green-50", badgeBg: "bg-green-100 text-green-800" },
];

export function bucketForScore(score: number): ReadinessBucket["id"] {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "adequate";
  if (score >= 40) return "needs_improvement";
  return "critical";
}

export function bucketLabel(score: number): string {
  return getReadinessCategory(score).category;
}

export const STAGE_COLUMNS: { id: KanbanStage; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "readiness", label: "Readiness" },
  { id: "categorization", label: "Categorization" },
  { id: "active", label: "Active" },
  { id: "complete", label: "Complete" },
];

/** True when a member doc carries a populated Company Intelligence block. */
export function hasCompanyIntelligence(ci: CompanyIntelligence | undefined | null): ci is CompanyIntelligence {
  return !!ci && !!ci.legalCompanyName;
}

/** Map a Company Intelligence block to the scoring engine's input shape. */
export function ciToScoringInput(ci: CompanyIntelligence | undefined): ReadinessScoreInput {
  if (!ci) {
    return {
      samRegistrationStatus: "not_registered",
      naicsCodes: [],
      certifications: [],
      pastPerformanceCount: 0,
      gsaScheduleHolder: false,
    };
  }

  const samStatus = ci.samRegistration?.status;
  const samRegistrationStatus: ReadinessScoreInput["samRegistrationStatus"] =
    samStatus === "active" ? "active" : samStatus === "pending" ? "pending" : "not_registered";

  const certifications: { type: string; isActive: boolean }[] = [];
  if (ci.federalDesignations) {
    if (ci.federalDesignations.eightA) certifications.push({ type: "8a", isActive: true });
    if (ci.federalDesignations.wosb) certifications.push({ type: "wosb", isActive: true });
    if (ci.federalDesignations.sdvosb) certifications.push({ type: "sdvosb", isActive: true });
    if (ci.federalDesignations.hubzone) certifications.push({ type: "hubzone", isActive: true });
  }
  const cmmcLevel = ci.certifications?.cmmcLevel?.toLowerCase();
  if (cmmcLevel) {
    const level = cmmcLevel.includes("3") ? "cmmc_level3" : cmmcLevel.includes("2") ? "cmmc_level2" : "cmmc_level1";
    certifications.push({ type: level, isActive: true });
  }

  return {
    samRegistrationStatus,
    samExpirationDate: ci.samRegistration?.expirationDate as ReadinessScoreInput["samExpirationDate"],
    uei: ci.uei,
    cageCode: ci.cageCode,
    naicsCodes: ci.primaryNaicsCodes ?? [],
    certifications,
    pastPerformanceCount: ci.notableContracts?.length ?? 0,
    gsaScheduleHolder: ci.gsaSchedule?.isHolder ?? false,
  };
}

/**
 * Merge a member's own companyIntelligence with a linked users doc's
 * companyIntelligence (matched by email). Member fields win; user fields
 * fill gaps — the wizard writes the same shape to both collections.
 */
export function mergeCompanyIntelligence(
  memberCi: CompanyIntelligence | undefined,
  userCi: CompanyIntelligence | undefined
): CompanyIntelligence | undefined {
  if (!memberCi) return userCi;
  if (!userCi) return memberCi;
  return {
    ...userCi,
    ...memberCi,
    samRegistration: memberCi.samRegistration?.status !== undefined ? memberCi.samRegistration : userCi.samRegistration,
    federalDesignations: { ...userCi.federalDesignations, ...memberCi.federalDesignations },
    certifications: { ...userCi.certifications, ...memberCi.certifications },
    gsaSchedule: { ...userCi.gsaSchedule, ...memberCi.gsaSchedule },
    primaryNaicsCodes: memberCi.primaryNaicsCodes?.length ? memberCi.primaryNaicsCodes : userCi.primaryNaicsCodes,
    notableContracts: memberCi.notableContracts?.length ? memberCi.notableContracts : userCi.notableContracts,
  };
}

/**
 * Score a member. `userCi` is the linked users doc's companyIntelligence, when
 * the member has a portal account matched by email.
 */
export function computeMemberReadiness(
  member: TeamMemberDoc,
  userCi?: CompanyIntelligence
): MemberReadinessResult {
  const ci = mergeCompanyIntelligence(member.companyIntelligence, userCi);
  const score = calculateReadinessScore(ciToScoringInput(ci));

  const gaps = [...score.gaps];
  const recommendations = [...score.remediationRecommendations];
  if (!hasCompanyIntelligence(ci)) {
    gaps.unshift("Company Intelligence profile not completed");
    recommendations.unshift("Complete the onboarding wizard to build your Company Intelligence profile");
  }

  return {
    overallScore: score.overallScore,
    breakdown: score.breakdown,
    gaps,
    remediationRecommendations: recommendations,
  };
}

/** Best-effort stage derivation when `onboardingStage` is unset on the doc. */
export function deriveReadinessStage(member: TeamMemberDoc): KanbanStage {
  if (member.onboardingStage) return member.onboardingStage;
  if (member.consortiumOnboardingComplete || member.onboardingComplete) return "complete";
  if (member.aiMatchingActivated) return "active";
  if (member.readinessValidationStatus === "approved") return "categorization";
  if (hasCompanyIntelligence(member.companyIntelligence)) return "readiness";
  return "profile";
}

/** Members due a reminder: below contract-ready or missing CI, and no reminder in the last `cooldownDays`. */
export function isReminderDue(
  member: TeamMemberDoc,
  result: MemberReadinessResult,
  cooldownDays = 14,
  now = Date.now()
): boolean {
  const incomplete = !hasCompanyIntelligence(member.companyIntelligence);
  const belowReady = result.overallScore < READINESS_CONTRACT_READY_THRESHOLD;
  if (!incomplete && !belowReady) return false;

  const last = member.lastReadinessReminderSentAt;
  const lastMs = (last as { toDate?: () => Date } | undefined)?.toDate?.()?.getTime();
  if (lastMs && now - lastMs < cooldownDays * 86400000) return false;
  return true;
}
