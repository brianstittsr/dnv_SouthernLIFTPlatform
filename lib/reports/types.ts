/** Shared report types — safe to import from client components (no server deps). */

export const REPORT_TYPES = [
  "monthly_internal",
  "quarterly_milestone",
  "semi_annual_mbda",
  "annual_performance",
  "lms_training",
  "freeform",
  "client_deepdive",
] as const;

export type LiftReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_LABELS: Record<LiftReportType, string> = {
  monthly_internal: "Monthly internal metrics report",
  quarterly_milestone: "Quarterly milestone report",
  semi_annual_mbda: "Semi-annual MBDA report pack",
  annual_performance: "Annual performance report",
  lms_training: "LMS training report",
  freeform: "Custom analysis",
  client_deepdive: "Client deep dive",
};

export interface ReportMetric {
  label: string;
  value: string;
  note?: string;
}

export interface ReportNarrative {
  executiveSummary: string;
  trendAnalysis: string;
  gapsAndRisks: string[];
  recommendations: string[];
  evidenceNotes: string;
}

/** LiftReportDoc after serializeFirestore — Timestamps as ISO strings. */
export interface SerializedLiftReport {
  id: string;
  type: LiftReportType;
  title: string;
  periodStart?: string;
  periodEnd?: string;
  periodLabel?: string;
  liftClientId?: string;
  clientName?: string;
  prompt?: string;
  metrics: ReportMetric[];
  narrative: ReportNarrative;
  dataPack?: Record<string, unknown>;
  source: "ai" | "fallback";
  model?: string;
  tokensUsed?: number;
  createdByUid: string;
  createdByName: string;
  createdAt: string;
  emailedTo?: { to: string[]; sentAt: string; messageId?: string }[];
}
