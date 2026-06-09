/**
 * Shared configuration and helpers for the End-to-End Platform Process Flow
 * Kanban boards (admin-wide and member-scoped views).
 */

import type { ComponentType } from "react";
import {
  Compass,
  UserPlus,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Rocket,
  TrendingUp,
} from "lucide-react";
import type { ConsortiumMemberDoc, MarketPlaceListingDoc, OpportunityDoc, PursuitBriefDoc } from "@/lib/schema";

export type PhaseId =
  | "discover"
  | "register"
  | "build_profile"
  | "validate"
  | "match_activate"
  | "engage_deliver"
  | "track_improve";

export interface PhaseConfig {
  id: PhaseId;
  number: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent: string; // border + header text color
  headerBg: string; // header background tint
  badgeBg: string; // count badge tint
}

export const PHASES: PhaseConfig[] = [
  {
    id: "discover",
    number: 1,
    title: "Discover",
    description:
      "Entered via marketing, HCNC referral, SBA, event, or member referral.",
    icon: Compass,
    accent: "text-slate-700",
    headerBg: "bg-slate-100",
    badgeBg: "bg-slate-200 text-slate-800",
  },
  {
    id: "register",
    number: 2,
    title: "Register",
    description: "Account created. Credentials provisioned. Identity verified.",
    icon: UserPlus,
    accent: "text-sky-700",
    headerBg: "bg-sky-50",
    badgeBg: "bg-sky-100 text-sky-800",
  },
  {
    id: "build_profile",
    number: 3,
    title: "Build Profile",
    description:
      "Company intelligence captured: NAICS, certs, capabilities, past performance.",
    icon: ClipboardList,
    accent: "text-indigo-700",
    headerBg: "bg-indigo-50",
    badgeBg: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "validate",
    number: 4,
    title: "Validate",
    description:
      "Government Contracting Readiness scored. Gaps identified and remediated.",
    icon: ShieldCheck,
    accent: "text-amber-700",
    headerBg: "bg-amber-50",
    badgeBg: "bg-amber-100 text-amber-800",
  },
  {
    id: "match_activate",
    number: 5,
    title: "Match & Activate",
    description:
      "AI engine activated. Matched to opportunities. Marketplace listing published.",
    icon: Sparkles,
    accent: "text-violet-700",
    headerBg: "bg-violet-50",
    badgeBg: "bg-violet-100 text-violet-800",
  },
  {
    id: "engage_deliver",
    number: 6,
    title: "Engage & Deliver",
    description:
      "Deployed to E2G engagements. Engagement tracked. Performance measured.",
    icon: Rocket,
    accent: "text-emerald-700",
    headerBg: "bg-emerald-50",
    badgeBg: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "track_improve",
    number: 7,
    title: "Track & Improve",
    description:
      "Continuous monitoring of activity, performance, and engagement outcomes.",
    icon: TrendingUp,
    accent: "text-teal-700",
    headerBg: "bg-teal-50",
    badgeBg: "bg-teal-100 text-teal-800",
  },
];

export function emptyPhaseMap<T>(): Record<PhaseId, T[]> {
  return {
    discover: [],
    register: [],
    build_profile: [],
    validate: [],
    match_activate: [],
    engage_deliver: [],
    track_improve: [],
  };
}

/**
 * Derive an organization's current phase from its ConsortiumMemberDoc.
 * Evaluated from the most advanced phase down to the least.
 */
export function deriveMemberPhase(m: ConsortiumMemberDoc): PhaseId {
  const perf = m.performanceMetrics;
  const hasEngagement =
    !!perf &&
    ((perf.totalPartnershipsInitiated ?? 0) > 0 ||
      (perf.totalProposalsSubmitted ?? 0) > 0 ||
      (perf.totalContractsWon ?? 0) > 0);

  if (
    m.onboardingStage === "complete" ||
    (typeof m.engagementScore === "number" && hasEngagement) ||
    (perf?.totalContractsWon ?? 0) > 0
  ) {
    return "track_improve";
  }

  if (m.aiMatchingActivated && hasEngagement) {
    return "engage_deliver";
  }

  if (m.aiMatchingActivated || m.onboardingStage === "active") {
    return "match_activate";
  }

  const validating =
    (m.readinessValidationStatus &&
      m.readinessValidationStatus !== "not_started") ||
    m.onboardingStage === "readiness" ||
    m.onboardingStage === "categorization" ||
    (m.readinessDocuments && m.readinessDocuments.length > 0);
  if (validating) {
    return "validate";
  }

  if (m.companyIntelligence || m.onboardingStage === "profile") {
    return "build_profile";
  }

  if (m.firebaseUid || m.membershipStatus === "active") {
    return "register";
  }

  return "discover";
}

/**
 * Derive the phase for a single marketplace listing based on its lifecycle.
 * Used by the member-scoped board where the member's own listings are the cards.
 */
export function deriveListingPhase(listing: MarketPlaceListingDoc): PhaseId {
  if (listing.status === "archived") return "track_improve";
  if (listing.status === "draft") return "build_profile";
  // published
  if ((listing.inquiryCount ?? 0) > 0) return "engage_deliver";
  return "match_activate";
}

/**
 * Derive the phase for an individual opportunity (OpportunityDoc) based on its sales stage.
 * Maps traditional sales pipeline stages to the 7-phase end-to-end process flow.
 */
export function deriveOpportunityPhase(opp: OpportunityDoc): PhaseId {
  const stage = opp.stage || "lead";
  
  switch (stage) {
    case "closed-won":
    case "closed-lost":
      return "track_improve";
    case "negotiation":
      return "engage_deliver";
    case "proposal":
      return "match_activate";
    case "discovery":
      return "validate";
    case "lead":
    default:
      return "discover";
  }
}

/**
 * Derive the phase for a teaming pursuit (PursuitBriefDoc) based on its status.
 * Maps pursuit brief statuses to the 7-phase end-to-end process flow.
 */
export function derivePursuitPhase(pursuit: PursuitBriefDoc): PhaseId {
  const status = pursuit.status || "published";
  
  switch (status) {
    case "won":
    case "lost":
    case "archived":
      return "track_improve";
    case "submitted":
      return "engage_deliver";
    case "proposal-active":
      return "match_activate";
    case "team-forming":
      return "validate";
    case "published":
    default:
      return "discover";
  }
}

/* -------------------------------------------------------------------------- */
/* Display helpers                                                            */
/* -------------------------------------------------------------------------- */

export const TIER_LABELS: Record<string, string> = {
  founder: "Founder",
  "core-capture": "Core Capture",
  elite: "Elite",
  standard: "Standard",
};

export function getInitials(
  first?: string,
  last?: string,
  company?: string
): string {
  if (first || last) {
    return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
  }
  if (company) return company.slice(0, 2).toUpperCase();
  return "?";
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours}h ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function toDate(ts?: { toDate?: () => Date }): Date | null {
  if (!ts || typeof ts.toDate !== "function") return null;
  try {
    return ts.toDate();
  } catch {
    return null;
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
