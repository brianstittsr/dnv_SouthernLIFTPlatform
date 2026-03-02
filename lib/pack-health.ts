/**
 * Pack Health Scoring System
 * 
 * Calculates Pack Health scores (0-100) based on:
 * - Completeness: 40%
 * - Expiration Status: 30%
 * - Document Quality: 20%
 * - Gap Remediation: 10%
 */

import { Timestamp } from "firebase-admin/firestore";

export interface PackHealthScore {
  overallScore: number;
  completenessScore: number;
  expirationScore: number;
  qualityScore: number;
  remediationScore: number;
  breakdown: {
    completeness: { weight: number; score: number; weighted: number };
    expiration: { weight: number; score: number; weighted: number };
    quality: { weight: number; score: number; weighted: number };
    remediation: { weight: number; score: number; weighted: number };
  };
  isEligibleForIntroductions: boolean;
  calculatedAt: Timestamp;
}

export interface Document {
  id: string;
  fileName: string;
  category: string;
  mimeType: string;
  fileSize: number;
  expirationDate?: Timestamp;
  uploadedAt: Timestamp;
  metadata?: {
    documentType?: string;
    notes?: string;
  };
}

export interface GapItem {
  id: string;
  category: string;
  documentType: string;
  priority: "high" | "medium" | "low";
  recommendation: string;
  status: "open" | "acknowledged" | "not_applicable";
}

const REQUIRED_CATEGORIES = [
  "Certifications",
  "Financial",
  "Past Performance",
  "Technical",
  "Quality",
  "Safety",
  "Security",
];

const WEIGHTS = {
  completeness: 0.4,
  expiration: 0.3,
  quality: 0.2,
  remediation: 0.1,
};

/**
 * Calculate completeness score based on document coverage
 */
function calculateCompletenessScore(documents: Document[]): number {
  if (documents.length === 0) return 0;

  const categoriesWithDocs = new Set(documents.map((d) => d.category));
  const requiredCategoriesCovered = REQUIRED_CATEGORIES.filter((cat) =>
    categoriesWithDocs.has(cat)
  ).length;

  const categoryScore = (requiredCategoriesCovered / REQUIRED_CATEGORIES.length) * 100;

  // Bonus for having multiple documents per category
  const avgDocsPerCategory = documents.length / categoriesWithDocs.size;
  const volumeBonus = Math.min(avgDocsPerCategory * 5, 20);

  return Math.min(categoryScore + volumeBonus, 100);
}

/**
 * Calculate expiration score based on document freshness
 */
function calculateExpirationScore(documents: Document[]): number {
  if (documents.length === 0) return 0;

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  let expiredCount = 0;
  let expiringCount = 0;
  let validCount = 0;

  documents.forEach((doc) => {
    if (!doc.expirationDate) {
      validCount++; // No expiration = always valid
      return;
    }

    const expirationMs = doc.expirationDate.toMillis();
    const daysUntilExpiration = (expirationMs - now) / (24 * 60 * 60 * 1000);

    if (daysUntilExpiration < 0) {
      expiredCount++;
    } else if (daysUntilExpiration <= 30) {
      expiringCount++;
    } else {
      validCount++;
    }
  });

  const totalDocs = documents.length;
  const validRatio = validCount / totalDocs;
  const expiringPenalty = (expiringCount / totalDocs) * 0.3;
  const expiredPenalty = (expiredCount / totalDocs) * 0.7;

  return Math.max((validRatio - expiringPenalty - expiredPenalty) * 100, 0);
}

/**
 * Calculate quality score based on document metadata and completeness
 */
function calculateQualityScore(documents: Document[]): number {
  if (documents.length === 0) return 0;

  let qualityPoints = 0;
  const maxPointsPerDoc = 4;

  documents.forEach((doc) => {
    let docPoints = 0;

    // Has proper file name (not generic)
    if (doc.fileName && doc.fileName.length > 10 && !doc.fileName.includes("untitled")) {
      docPoints++;
    }

    // Has category assigned
    if (doc.category && doc.category !== "Other") {
      docPoints++;
    }

    // Has document type metadata
    if (doc.metadata?.documentType) {
      docPoints++;
    }

    // Has notes/description
    if (doc.metadata?.notes && doc.metadata.notes.length > 10) {
      docPoints++;
    }

    qualityPoints += docPoints;
  });

  const maxPossiblePoints = documents.length * maxPointsPerDoc;
  return (qualityPoints / maxPossiblePoints) * 100;
}

/**
 * Calculate remediation score based on gap closure
 */
function calculateRemediationScore(gaps: GapItem[]): number {
  if (gaps.length === 0) return 100; // No gaps = perfect score

  const acknowledgedOrNA = gaps.filter(
    (g) => g.status === "acknowledged" || g.status === "not_applicable"
  ).length;

  const closureRate = acknowledgedOrNA / gaps.length;
  return closureRate * 100;
}

/**
 * Calculate overall Pack Health score
 */
export function calculatePackHealth(
  documents: Document[],
  gaps: GapItem[]
): PackHealthScore {
  const completenessScore = calculateCompletenessScore(documents);
  const expirationScore = calculateExpirationScore(documents);
  const qualityScore = calculateQualityScore(documents);
  const remediationScore = calculateRemediationScore(gaps);

  const breakdown = {
    completeness: {
      weight: WEIGHTS.completeness,
      score: completenessScore,
      weighted: completenessScore * WEIGHTS.completeness,
    },
    expiration: {
      weight: WEIGHTS.expiration,
      score: expirationScore,
      weighted: expirationScore * WEIGHTS.expiration,
    },
    quality: {
      weight: WEIGHTS.quality,
      score: qualityScore,
      weighted: qualityScore * WEIGHTS.quality,
    },
    remediation: {
      weight: WEIGHTS.remediation,
      score: remediationScore,
      weighted: remediationScore * WEIGHTS.remediation,
    },
  };

  const overallScore =
    breakdown.completeness.weighted +
    breakdown.expiration.weighted +
    breakdown.quality.weighted +
    breakdown.remediation.weighted;

  return {
    overallScore: Math.round(overallScore),
    completenessScore: Math.round(completenessScore),
    expirationScore: Math.round(expirationScore),
    qualityScore: Math.round(qualityScore),
    remediationScore: Math.round(remediationScore),
    breakdown,
    isEligibleForIntroductions: overallScore >= 70,
    calculatedAt: Timestamp.now(),
  };
}

/**
 * Identify gaps in Proof Pack
 */
export function identifyGaps(documents: Document[]): GapItem[] {
  const gaps: GapItem[] = [];
  const categoriesWithDocs = new Set(documents.map((d) => d.category));

  // Check for missing required categories
  REQUIRED_CATEGORIES.forEach((category) => {
    if (!categoriesWithDocs.has(category)) {
      gaps.push({
        id: `gap_${category.toLowerCase().replace(/\s+/g, "_")}`,
        category,
        documentType: "Any",
        priority: "high",
        recommendation: `Upload at least one ${category} document to improve Pack Health`,
        status: "open",
      });
    }
  });

  // Check for expired documents
  const now = Date.now();
  documents.forEach((doc) => {
    if (doc.expirationDate && doc.expirationDate.toMillis() < now) {
      gaps.push({
        id: `gap_expired_${doc.id}`,
        category: doc.category,
        documentType: doc.fileName,
        priority: "high",
        recommendation: `Document "${doc.fileName}" has expired. Upload a renewed version.`,
        status: "open",
      });
    }
  });

  // Check for documents expiring soon
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  documents.forEach((doc) => {
    if (doc.expirationDate) {
      const daysUntilExpiration =
        (doc.expirationDate.toMillis() - now) / (24 * 60 * 60 * 1000);
      
      if (daysUntilExpiration > 0 && daysUntilExpiration <= 30) {
        gaps.push({
          id: `gap_expiring_${doc.id}`,
          category: doc.category,
          documentType: doc.fileName,
          priority: "medium",
          recommendation: `Document "${doc.fileName}" expires in ${Math.round(daysUntilExpiration)} days. Plan to renew.`,
          status: "open",
        });
      }
    }
  });

  return gaps;
}

/**
 * Get remediation action items sorted by impact
 */
export function getRemediationActions(
  currentScore: number,
  documents: Document[],
  gaps: GapItem[]
): Array<{
  id: string;
  description: string;
  estimatedImpact: number;
  effortLevel: "low" | "medium" | "high";
  priority: number;
}> {
  const actions: Array<{
    id: string;
    description: string;
    estimatedImpact: number;
    effortLevel: "low" | "medium" | "high";
    priority: number;
  }> = [];

  // High-impact: Add documents to missing categories
  const missingCategories = gaps.filter((g) => g.priority === "high" && g.documentType === "Any");
  missingCategories.forEach((gap, index) => {
    actions.push({
      id: `action_missing_${index}`,
      description: `Add ${gap.category} documents`,
      estimatedImpact: 15,
      effortLevel: "medium",
      priority: 1,
    });
  });

  // High-impact: Replace expired documents
  const expiredDocs = gaps.filter((g) => g.id.startsWith("gap_expired_"));
  expiredDocs.forEach((gap, index) => {
    actions.push({
      id: `action_expired_${index}`,
      description: `Renew expired document: ${gap.documentType}`,
      estimatedImpact: 12,
      effortLevel: "medium",
      priority: 1,
    });
  });

  // Medium-impact: Add metadata to documents
  const docsWithoutMetadata = documents.filter((d) => !d.metadata?.documentType);
  if (docsWithoutMetadata.length > 0) {
    actions.push({
      id: "action_metadata",
      description: `Add document types and notes to ${docsWithoutMetadata.length} documents`,
      estimatedImpact: 8,
      effortLevel: "low",
      priority: 2,
    });
  }

  // Low-impact: Renew expiring documents
  const expiringDocs = gaps.filter((g) => g.id.startsWith("gap_expiring_"));
  if (expiringDocs.length > 0) {
    actions.push({
      id: "action_expiring",
      description: `Plan renewal for ${expiringDocs.length} documents expiring soon`,
      estimatedImpact: 5,
      effortLevel: "low",
      priority: 3,
    });
  }

  // Sort by priority, then by impact
  return actions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.estimatedImpact - a.estimatedImpact;
  });
}
