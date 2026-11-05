/**
 * Seeds one free demo course (canonical course_* model) so the full member
 * journey can be tested end-to-end without Stripe:
 *   catalog → enroll → player → mark complete → certificate → Documents.
 *
 * Idempotent — skips if a course with the same slug already exists.
 * Run: npx tsx --env-file=.env.local scripts/seed-demo-courses.ts
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const SLUG = "lift-business-fundamentals";

const DEMO_MODULES = [
  {
    title: "Getting Started with LIFT",
    description: "Orientation to the LIFT Rural Business Center",
    weekNumber: 1,
    sortOrder: 0,
    sessions: [
      {
        title: "Welcome & Program Overview",
        description: "How LIFT supports rural small businesses",
        type: "text",
        textContent:
          "Welcome to LIFT Business Fundamentals. In this session you'll learn how the Southern University LIFT Rural Business Center helps rural entrepreneurs access training, counseling, and capital-readiness support.\n\nBy the end of this course you will know how to: navigate the client portal, complete required forms, and prepare for one-on-one advising.",
        durationMinutes: 15,
        sortOrder: 0,
      },
      {
        title: "Navigating the Client Portal",
        description: "Tour of onboarding, forms, documents, and courses",
        type: "text",
        textContent:
          "Your client portal is your home base. Key areas:\n\n• Onboarding Progress — your checklist for becoming a full LIFT client\n• My LIFT Forms — intake and lifecycle forms\n• Documents — your generated PDFs, certificates, and archived files\n• My Courses — training programs like this one",
        durationMinutes: 10,
        sortOrder: 1,
      },
    ],
  },
  {
    title: "Business Fundamentals",
    description: "Core concepts for rural small business owners",
    weekNumber: 2,
    sortOrder: 1,
    sessions: [
      {
        title: "Business Model Basics",
        description: "Define your value proposition and customer segments",
        type: "text",
        textContent:
          "Every successful business starts with a clear model. Answer these questions:\n\n1. Who is your customer?\n2. What problem do you solve for them?\n3. How do you reach them?\n4. How do you make money?\n\nWrite your answers down — your LIFT counselor will review them with you.",
        durationMinutes: 20,
        sortOrder: 0,
      },
      {
        title: "Capital Readiness Overview",
        description: "What lenders look for and how to prepare",
        type: "text",
        textContent:
          "Before approaching a lender, gather: 2–3 years of tax returns, current financial statements, a business plan, and a clear statement of how funds will be used.\n\nComplete the Capital Readiness Checklist in your portal to see exactly what to bring to your loan officer meeting.",
        durationMinutes: 20,
        sortOrder: 1,
      },
      {
        title: "Course Wrap-Up & Next Steps",
        description: "Completion requirements and your next actions",
        type: "text",
        textContent:
          "You've reached the final session. To complete this course, mark every session complete — your certificate will be generated automatically and saved to your Documents.\n\nNext steps: finish your onboarding checklist, then book a counseling session with your LIFT advisor.",
        durationMinutes: 10,
        sortOrder: 2,
      },
    ],
  },
];

async function seed() {
  console.log("Seeding demo course...");

  const existing = await db.collection("courses").where("slug", "==", SLUG).limit(1).get();
  if (!existing.empty) {
    console.log(`Course "${SLUG}" already exists (${existing.docs[0].id}) — skipping.`);
    return;
  }

  const courseRef = await db.collection("courses").add({
    title: "LIFT Business Fundamentals",
    slug: SLUG,
    description:
      "A free orientation course for LIFT clients. Learn how the LIFT Rural Business Center supports your business, how to navigate the client portal, and the fundamentals of capital readiness.",
    facilitatorName: "LIFT Instructor Team",
    facilitatorBio: "Southern University LIFT Rural Business Center",
    courseStartDate: Timestamp.now(),
    courseEndDate: Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)),
    maxParticipants: 100,
    currentParticipants: 0,
    estimatedDurationWeeks: 2,
    status: "published",
    difficultyLevel: "beginner",
    priceInCents: 0,
    isFree: true,
    isPublished: true,
    tags: ["LIFT", "Orientation", "Free"],
    learningOutcomes: [
      "Navigate the LIFT client portal",
      "Understand LIFT programs and services",
      "Describe what lenders look for in a loan package",
      "Complete the onboarding checklist",
    ],
    prerequisites: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log(`Created course: ${courseRef.id}`);

  for (const moduleData of DEMO_MODULES) {
    const { sessions, ...module } = moduleData;
    const moduleRef = await db.collection("course_modules").add({
      ...module,
      courseId: courseRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`  Module: ${module.title}`);

    for (const session of sessions) {
      await db.collection("course_sessions").add({
        ...session,
        moduleId: moduleRef.id,
        courseId: courseRef.id,
        isPublished: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    console.log(`    ${sessions.length} sessions`);
  }

  console.log(`\nDone. Free demo course "${SLUG}" ready — enroll via /portal/sme/courses/browse`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
