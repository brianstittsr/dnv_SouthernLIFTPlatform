import { Timestamp } from "firebase/firestore";

export const mockCMMCCohorts = [
  {
    id: "cohort-cmmc-1",
    title: "CMMC Level 1 Certification - Spring 2026",
    description: "Comprehensive 12-week program covering all CMMC Level 1 requirements for defense contractors",
    instructorId: "instructor-1",
    instructorName: "Sarah Mitchell",
    startDate: Timestamp.fromDate(new Date("2026-03-15")),
    endDate: Timestamp.fromDate(new Date("2026-06-07")),
    duration: 12,
    maxParticipants: 25,
    currentEnrollment: 18,
    status: "active" as const,
    price: 4500,
    level: "Level 1",
    curriculum: [
      {
        weekNumber: 1,
        title: "Introduction to CMMC",
        topics: ["CMMC Framework Overview", "Certification Process", "Scoping"]
      },
      {
        weekNumber: 2,
        title: "Access Control",
        topics: ["User Authentication", "Authorization", "Least Privilege"]
      },
      {
        weekNumber: 3,
        title: "Identification and Authentication",
        topics: ["User Identification", "Multi-Factor Authentication", "Password Management"]
      }
    ],
    completionRate: 65,
    averageScore: 82,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  },
  {
    id: "cohort-cmmc-2",
    title: "CMMC Level 2 Advanced Training",
    description: "Advanced 12-week cohort for organizations pursuing CMMC Level 2 certification with enhanced security requirements",
    instructorId: "instructor-1",
    instructorName: "Sarah Mitchell",
    startDate: Timestamp.fromDate(new Date("2026-04-01")),
    endDate: Timestamp.fromDate(new Date("2026-06-24")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 12,
    status: "active" as const,
    price: 6500,
    level: "Level 2",
    curriculum: [
      {
        weekNumber: 1,
        title: "CMMC Level 2 Overview",
        topics: ["Level 2 Requirements", "Assessment Process", "Documentation"]
      },
      {
        weekNumber: 2,
        title: "Advanced Access Control",
        topics: ["Role-Based Access", "Privileged Access Management", "Remote Access"]
      }
    ],
    completionRate: 45,
    averageScore: 78,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  },
  {
    id: "cohort-cmmc-3",
    title: "CMMC Fundamentals - Fast Track",
    description: "Accelerated 8-week program for small businesses new to CMMC compliance",
    instructorId: "instructor-1",
    instructorName: "Sarah Mitchell",
    startDate: Timestamp.fromDate(new Date("2026-02-01")),
    endDate: Timestamp.fromDate(new Date("2026-03-29")),
    duration: 8,
    maxParticipants: 30,
    currentEnrollment: 28,
    status: "completed" as const,
    price: 3500,
    level: "Level 1",
    curriculum: [
      {
        weekNumber: 1,
        title: "CMMC Basics",
        topics: ["What is CMMC", "Why it Matters", "Getting Started"]
      },
      {
        weekNumber: 2,
        title: "Essential Controls",
        topics: ["Basic Security", "Access Management", "Incident Response"]
      }
    ],
    completionRate: 100,
    averageScore: 88,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  },
  {
    id: "cohort-cmmc-4",
    title: "CMMC Level 2 - Summer Intensive",
    description: "Intensive 12-week summer program for defense contractors requiring Level 2 certification",
    instructorId: "instructor-1",
    instructorName: "Sarah Mitchell",
    startDate: Timestamp.fromDate(new Date("2026-06-15")),
    endDate: Timestamp.fromDate(new Date("2026-09-07")),
    duration: 12,
    maxParticipants: 20,
    currentEnrollment: 8,
    status: "published" as const,
    price: 6500,
    level: "Level 2",
    curriculum: [
      {
        weekNumber: 1,
        title: "Level 2 Introduction",
        topics: ["Requirements Overview", "Gap Analysis", "Implementation Planning"]
      }
    ],
    completionRate: 0,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  },
  {
    id: "cohort-cmmc-5",
    title: "CMMC Policy Development Workshop",
    description: "Specialized 12-week cohort focused on developing compliant security policies and procedures",
    instructorId: "instructor-1",
    instructorName: "Sarah Mitchell",
    startDate: Timestamp.fromDate(new Date("2026-05-01")),
    endDate: Timestamp.fromDate(new Date("2026-07-24")),
    duration: 12,
    maxParticipants: 25,
    currentEnrollment: 0,
    status: "draft" as const,
    price: 5000,
    level: "Level 1 & 2",
    curriculum: [
      {
        weekNumber: 1,
        title: "Policy Framework",
        topics: ["Policy Structure", "Compliance Requirements", "Best Practices"]
      }
    ],
    completionRate: 0,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
    updatedAt: Timestamp.now(),
  }
];
