import { Timestamp } from "firebase/firestore";

export const mockQAReviews = [
  {
    id: "_placeholder",
    placeholder: true,
    note: "QA Reviews collection",
    createdAt: {
      type: "firestore/timestamp/1.0",
      seconds: 1768702619,
      nanoseconds: 144000000
    },
    updatedAt: {
      type: "firestore/timestamp/1.0",
      seconds: 1768702619,
      nanoseconds: 144000000
    }
  },
  {
    id: "review-1",
    smeId: "sme-123",
    smeCompany: "Precision Aerospace Manufacturing",
    reviewerId: "qa-reviewer-1",
    reviewerName: "Sarah Mitchell",
    reviewType: "certification_audit",
    status: "in_progress",
    priority: "high",
    certifications: ["AS9100", "NADCAP"],
    findings: [
      {
        id: "finding-1",
        severity: "major",
        category: "documentation",
        description: "Quality manual missing revision control procedures",
        requirement: "AS9100 Section 4.2.3",
        status: "open"
      },
      {
        id: "finding-2",
        severity: "minor",
        category: "process",
        description: "Calibration records not consistently dated",
        requirement: "AS9100 Section 7.6",
        status: "open"
      }
    ],
    score: 85,
    completionPercentage: 65,
    scheduledDate: Timestamp.fromDate(new Date("2026-02-15")),
    startedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    dueDate: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  },
  {
    id: "review-2",
    smeId: "sme-456",
    smeCompany: "Advanced Defense Systems",
    reviewerId: "qa-reviewer-2",
    reviewerName: "Michael Chen",
    reviewType: "compliance_check",
    status: "completed",
    priority: "medium",
    certifications: ["ISO 9001", "ITAR"],
    findings: [
      {
        id: "finding-3",
        severity: "minor",
        category: "training",
        description: "Employee training records incomplete for 2 staff members",
        requirement: "ISO 9001 Section 6.2",
        status: "resolved"
      }
    ],
    score: 92,
    completionPercentage: 100,
    scheduledDate: Timestamp.fromDate(new Date("2026-01-10")),
    startedAt: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
    completedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    dueDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
  },
  {
    id: "review-3",
    smeId: "sme-789",
    smeCompany: "Composite Materials Inc",
    reviewerId: "qa-reviewer-1",
    reviewerName: "Sarah Mitchell",
    reviewType: "annual_review",
    status: "scheduled",
    priority: "low",
    certifications: ["AS9100", "ISO 9001"],
    findings: [],
    score: null,
    completionPercentage: 0,
    scheduledDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    dueDate: Timestamp.fromDate(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  },
  {
    id: "review-4",
    smeId: "sme-321",
    smeCompany: "Titanium Machining Solutions",
    reviewerId: "qa-reviewer-3",
    reviewerName: "David Rodriguez",
    reviewType: "spot_audit",
    status: "in_progress",
    priority: "high",
    certifications: ["NADCAP", "ISO 9001"],
    findings: [
      {
        id: "finding-4",
        severity: "critical",
        category: "safety",
        description: "Safety equipment not properly maintained",
        requirement: "NADCAP Heat Treating Section 3.1",
        status: "open"
      },
      {
        id: "finding-5",
        severity: "major",
        category: "equipment",
        description: "Furnace temperature verification overdue",
        requirement: "NADCAP Heat Treating Section 4.2",
        status: "open"
      },
      {
        id: "finding-6",
        severity: "minor",
        category: "documentation",
        description: "Work instructions missing operator signatures",
        requirement: "ISO 9001 Section 7.5",
        status: "open"
      }
    ],
    score: 72,
    completionPercentage: 80,
    scheduledDate: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    startedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    dueDate: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  },
  {
    id: "review-5",
    smeId: "sme-654",
    smeCompany: "Electronics Assembly Corp",
    reviewerId: "qa-reviewer-2",
    reviewerName: "Michael Chen",
    reviewType: "certification_audit",
    status: "completed",
    priority: "medium",
    certifications: ["ISO 9001", "IPC-A-610"],
    findings: [],
    score: 98,
    completionPercentage: 100,
    scheduledDate: Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
    startedAt: Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
    completedAt: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    dueDate: Timestamp.fromDate(new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)),
    createdAt: Timestamp.fromDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  }
];

export const mockQAStats = {
  totalReviews: 5,
  inProgress: 2,
  completed: 2,
  scheduled: 1,
  averageScore: 87,
  criticalFindings: 1,
  majorFindings: 2,
  minorFindings: 3,
  onTimeCompletion: 80,
};
