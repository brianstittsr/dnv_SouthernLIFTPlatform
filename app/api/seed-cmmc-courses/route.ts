import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const INSTRUCTOR_ID = "instructor-cmmc-001";
const INSTRUCTOR_NAME = "CMMC Expert Team";

// Import the course data from the script
const cmmcCourses = [
  {
    level: 1,
    title: "CMMC Level 1 Foundations",
    slug: "cmmc-level-1-foundations",
    description: "Master the fundamentals of CMMC Level 1 compliance. Learn to implement basic cybersecurity hygiene practices required for protecting Federal Contract Information (FCI).",
    priceInCents: 149900,
    compareAtPriceInCents: 199900,
    estimatedDurationWeeks: 8,
    difficultyLevel: "beginner",
    cohortStartDate: new Date('2026-02-01'),
    cohortEndDate: new Date('2026-04-30'),
    tags: ["CMMC", "Level 1", "Cybersecurity", "Compliance", "FCI"],
    learningOutcomes: [
      "Understand CMMC Level 1 requirements and scope",
      "Implement 17 basic security practices",
      "Protect Federal Contract Information (FCI)",
      "Establish access control procedures",
      "Implement identification and authentication",
      "Conduct media protection",
      "Establish physical protection measures",
      "Implement system and communications protection",
      "Prepare for CMMC Level 1 assessment"
    ],
    prerequisites: [
      "Basic understanding of cybersecurity concepts",
      "Access to company IT systems",
      "Management support for implementation"
    ],
  },
  {
    level: 2,
    title: "CMMC Level 2 Advanced Implementation",
    slug: "cmmc-level-2-advanced",
    description: "Comprehensive training for CMMC Level 2 compliance. Implement advanced security practices to protect Controlled Unclassified Information (CUI) and meet DoD requirements.",
    priceInCents: 349900,
    compareAtPriceInCents: 449900,
    estimatedDurationWeeks: 12,
    difficultyLevel: "intermediate",
    cohortStartDate: new Date('2026-03-01'),
    cohortEndDate: new Date('2026-06-30'),
    tags: ["CMMC", "Level 2", "CUI", "NIST 800-171", "Advanced Security"],
    learningOutcomes: [
      "Master all 110 CMMC Level 2 security requirements",
      "Implement NIST SP 800-171 controls",
      "Protect Controlled Unclassified Information (CUI)",
      "Establish comprehensive security program",
      "Implement incident response procedures",
      "Conduct risk assessments",
      "Manage security configurations",
      "Establish continuous monitoring",
      "Prepare for CMMC Level 2 certification"
    ],
    prerequisites: [
      "CMMC Level 1 knowledge or equivalent",
      "IT security experience recommended",
      "Access to organizational systems",
      "Executive sponsorship for implementation"
    ],
  },
  {
    level: 3,
    title: "CMMC Level 3 Expert Certification",
    slug: "cmmc-level-3-expert",
    description: "Advanced training for CMMC Level 3 compliance. Master expert-level security practices for protecting highly sensitive CUI and critical national security information.",
    priceInCents: 599900,
    compareAtPriceInCents: 799900,
    estimatedDurationWeeks: 16,
    difficultyLevel: "advanced",
    cohortStartDate: new Date('2026-04-01'),
    cohortEndDate: new Date('2026-08-31'),
    tags: ["CMMC", "Level 3", "Advanced Security", "APT Protection", "Expert"],
    learningOutcomes: [
      "Master all CMMC Level 3 requirements (130+ practices)",
      "Implement advanced threat protection",
      "Establish proactive security posture",
      "Implement advanced persistent threat (APT) defenses",
      "Conduct advanced threat hunting",
      "Implement security orchestration and automation",
      "Establish threat intelligence program",
      "Conduct red team exercises",
      "Prepare for CMMC Level 3 certification"
    ],
    prerequisites: [
      "CMMC Level 2 certification or equivalent",
      "Advanced IT security experience required",
      "Security architecture knowledge",
      "Executive and board-level sponsorship"
    ],
  }
];

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (you should implement proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SEED_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin token required' },
        { status: 401 }
      );
    }

    const results = [];

    for (const course of cmmcCourses) {
      // Create cohort
      const cohortData = {
        title: course.title,
        slug: course.slug,
        description: course.description,
        facilitatorId: INSTRUCTOR_ID,
        facilitatorName: INSTRUCTOR_NAME,
        facilitatorBio: "Certified CMMC professionals with extensive experience in defense contractor compliance",
        cohortStartDate: Timestamp.fromDate(course.cohortStartDate),
        cohortEndDate: Timestamp.fromDate(course.cohortEndDate),
        maxParticipants: course.level === 1 ? 50 : course.level === 2 ? 40 : 25,
        currentParticipants: 0,
        estimatedDurationWeeks: course.estimatedDurationWeeks,
        status: "published",
        difficultyLevel: course.difficultyLevel,
        priceInCents: course.priceInCents,
        compareAtPriceInCents: course.compareAtPriceInCents,
        isFree: false,
        tags: course.tags,
        learningOutcomes: course.learningOutcomes,
        prerequisites: course.prerequisites,
        isPublished: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const cohortRef = await db.collection('cohorts').add(cohortData);
      
      results.push({
        level: course.level,
        cohortId: cohortRef.id,
        title: course.title,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'CMMC courses seeded successfully',
      courses: results,
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed courses' },
      { status: 500 }
    );
  }
}
