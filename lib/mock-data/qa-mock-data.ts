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

export const mockReviewHistory = [
  {
    id: "history-1",
    proofPackId: "pack-completed-1",
    proofPackTitle: "AS9100 Rev D Quality Management System",
    smeId: "sme-aerospace-101",
    smeCompany: "Precision Aerospace Manufacturing",
    reviewerId: "qa-reviewer-1",
    reviewerName: "Sarah Mitchell",
    reviewDate: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
    decision: "approved",
    packHealth: {
      overallScore: 92,
      completeness: 95,
      quality: 91,
      compliance: 90
    },
    documentCount: 14,
    certifications: ["AS9100 Rev D", "ISO 9001:2015"],
    reviewNotes: "Excellent documentation quality. All procedures are well-defined and compliant with AS9100 requirements. Minor formatting improvements suggested but not required.",
    findings: [],
    reviewDuration: 180, // minutes
  },
  {
    id: "history-2",
    proofPackId: "pack-completed-2",
    proofPackTitle: "CMMC Level 2 Security Documentation",
    smeId: "sme-defense-202",
    smeCompany: "SecureDefense Systems Inc",
    reviewerId: "qa-reviewer-2",
    reviewerName: "Michael Chen",
    reviewDate: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
    decision: "approved_with_conditions",
    packHealth: {
      overallScore: 78,
      completeness: 82,
      quality: 76,
      compliance: 76
    },
    documentCount: 19,
    certifications: ["CMMC Level 2", "NIST 800-171"],
    reviewNotes: "Documentation meets minimum requirements. Approved with condition that incident response procedures be updated within 30 days.",
    findings: [
      {
        id: "finding-h2-1",
        severity: "minor",
        category: "documentation",
        description: "Incident response plan lacks detailed escalation procedures",
        requirement: "CMMC Practice IR.2.093",
        status: "open"
      }
    ],
    reviewDuration: 240,
  },
  {
    id: "history-3",
    proofPackId: "pack-completed-3",
    proofPackTitle: "ISO 13485 Medical Device QMS Package",
    smeId: "sme-medical-303",
    smeCompany: "MedTech Quality Systems",
    reviewerId: "qa-reviewer-1",
    reviewerName: "Sarah Mitchell",
    reviewDate: Timestamp.fromDate(new Date(Date.now() - 22 * 24 * 60 * 60 * 1000)),
    decision: "approved",
    packHealth: {
      overallScore: 96,
      completeness: 98,
      quality: 95,
      compliance: 95
    },
    documentCount: 17,
    certifications: ["ISO 13485:2016", "FDA 21 CFR Part 820"],
    reviewNotes: "Outstanding documentation. Comprehensive risk management files and design controls. Exemplary compliance with both ISO 13485 and FDA requirements.",
    findings: [],
    reviewDuration: 210,
  },
  {
    id: "history-4",
    proofPackId: "pack-completed-4",
    proofPackTitle: "NADCAP Heat Treating Compliance",
    smeId: "sme-heattreat-404",
    smeCompany: "Titanium Heat Treating Specialists",
    reviewerId: "qa-reviewer-3",
    reviewerName: "David Rodriguez",
    reviewDate: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    decision: "rejected",
    packHealth: {
      overallScore: 62,
      completeness: 68,
      quality: 58,
      compliance: 60
    },
    documentCount: 11,
    certifications: ["NADCAP Heat Treating"],
    reviewNotes: "Documentation does not meet NADCAP requirements. Critical gaps in equipment calibration records and process validation. Resubmission required after addressing all findings.",
    findings: [
      {
        id: "finding-h4-1",
        severity: "critical",
        category: "equipment",
        description: "Furnace calibration records incomplete for past 6 months",
        requirement: "NADCAP AC7110 Section 4.2",
        status: "open"
      },
      {
        id: "finding-h4-2",
        severity: "major",
        category: "process",
        description: "Heat treatment process validation missing statistical analysis",
        requirement: "NADCAP AC7110 Section 3.5",
        status: "open"
      },
      {
        id: "finding-h4-3",
        severity: "minor",
        category: "training",
        description: "Operator training records not consistently signed",
        requirement: "NADCAP AC7110 Section 5.1",
        status: "open"
      }
    ],
    reviewDuration: 195,
  },
  {
    id: "history-5",
    proofPackId: "pack-completed-5",
    proofPackTitle: "ITAR Export Control Documentation",
    smeId: "sme-defense-505",
    smeCompany: "Defense Technology Partners",
    reviewerId: "qa-reviewer-2",
    reviewerName: "Michael Chen",
    reviewDate: Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)),
    decision: "approved",
    packHealth: {
      overallScore: 88,
      completeness: 90,
      quality: 87,
      compliance: 87
    },
    documentCount: 15,
    certifications: ["ITAR", "EAR"],
    reviewNotes: "Comprehensive export control procedures. Security measures well-documented. Training program meets all ITAR requirements.",
    findings: [],
    reviewDuration: 165,
  },
  {
    id: "history-6",
    proofPackId: "pack-completed-6",
    proofPackTitle: "ISO 9001:2015 Initial Certification",
    smeId: "sme-manufacturing-606",
    smeCompany: "Advanced Manufacturing Solutions",
    reviewerId: "qa-reviewer-1",
    reviewerName: "Sarah Mitchell",
    reviewDate: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    decision: "approved_with_conditions",
    packHealth: {
      overallScore: 82,
      completeness: 85,
      quality: 80,
      compliance: 81
    },
    documentCount: 13,
    certifications: ["ISO 9001:2015"],
    reviewNotes: "Good foundation for ISO 9001 certification. Approved with condition to complete internal audit cycle within 60 days and submit audit reports.",
    findings: [
      {
        id: "finding-h6-1",
        severity: "minor",
        category: "audit",
        description: "Internal audit schedule incomplete for Q2",
        requirement: "ISO 9001 Clause 9.2",
        status: "open"
      }
    ],
    reviewDuration: 150,
  }
];

export const mockQAQueue = [
  {
    id: "pack-1",
    title: "AS9100 Quality Management System Documentation",
    smeId: "sme-aerospace-001",
    smeCompany: "Precision Aerospace Manufacturing",
    userId: "user-123",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    packHealth: {
      overallScore: 87,
      completeness: 92,
      quality: 85,
      compliance: 84
    },
    documentCount: 12,
    categories: ["Quality Manual", "Procedures", "Work Instructions"],
    certifications: ["AS9100", "ISO 9001"],
  },
  {
    id: "pack-2",
    title: "CMMC Level 2 Compliance Package",
    smeId: "sme-defense-002",
    smeCompany: "SecureDefense Systems Inc",
    userId: "user-456",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    packHealth: {
      overallScore: 72,
      completeness: 78,
      quality: 70,
      compliance: 68
    },
    documentCount: 18,
    categories: ["Security Policies", "Access Control", "Incident Response"],
    certifications: ["CMMC Level 2", "NIST 800-171"],
  },
  {
    id: "pack-3",
    title: "ISO 9001:2015 Certification Documents",
    smeId: "sme-manufacturing-003",
    smeCompany: "Advanced Manufacturing Solutions",
    userId: "user-789",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    packHealth: {
      overallScore: 94,
      completeness: 96,
      quality: 93,
      compliance: 93
    },
    documentCount: 15,
    categories: ["Quality Manual", "Process Documentation", "Audit Records"],
    certifications: ["ISO 9001:2015"],
  },
  {
    id: "pack-4",
    title: "NADCAP Heat Treating Compliance Package",
    smeId: "sme-heattreat-004",
    smeCompany: "Titanium Heat Treating Specialists",
    userId: "user-321",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    packHealth: {
      overallScore: 68,
      completeness: 72,
      quality: 65,
      compliance: 67
    },
    documentCount: 9,
    categories: ["Process Specifications", "Equipment Calibration", "Training Records"],
    certifications: ["NADCAP Heat Treating"],
  },
  {
    id: "pack-5",
    title: "ITAR Compliance Documentation Set",
    smeId: "sme-defense-005",
    smeCompany: "Defense Technology Partners",
    userId: "user-654",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    packHealth: {
      overallScore: 81,
      completeness: 85,
      quality: 79,
      compliance: 79
    },
    documentCount: 14,
    categories: ["Export Control", "Security Procedures", "Training Materials"],
    certifications: ["ITAR", "EAR"],
  },
  {
    id: "pack-6",
    title: "ISO 13485 Medical Device QMS",
    smeId: "sme-medical-006",
    smeCompany: "MedTech Quality Systems",
    userId: "user-987",
    status: "submitted",
    submittedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    packHealth: {
      overallScore: 89,
      completeness: 91,
      quality: 88,
      compliance: 88
    },
    documentCount: 16,
    categories: ["Quality Manual", "Risk Management", "Design Controls"],
    certifications: ["ISO 13485", "FDA 21 CFR Part 820"],
  }
];
