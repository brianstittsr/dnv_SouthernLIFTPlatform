// Seed script with environment variable loading
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
const envPath = resolve(__dirname, '..', '.env.local');
console.log('📁 Loading environment from:', envPath);

try {
  const envConfig = config({ path: envPath });
  if (envConfig.error) {
    console.warn('⚠️  Could not load .env.local:', envConfig.error.message);
  } else {
    console.log('✅ Environment variables loaded\n');
  }
} catch (error) {
  console.warn('⚠️  Error loading .env.local:', error.message);
}

// Now import Firebase after env is loaded
const { initializeApp } = await import('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = await import('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.projectId) {
  console.error('❌ Error: Firebase configuration is missing!');
  console.error('   Make sure .env.local has NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  process.exit(1);
}

console.log('🔥 Initializing Firebase...');
console.log('   Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INSTRUCTOR_ID = "instructor-cmmc-001";
const INSTRUCTOR_NAME = "CMMC Expert Team";

const courses = [
  {
    title: "CMMC Level 1 Foundations",
    slug: "cmmc-level-1-foundations",
    description: "Master the fundamentals of CMMC Level 1 compliance. Learn to implement basic cybersecurity hygiene practices required for protecting Federal Contract Information (FCI).",
    priceInCents: 149900,
    compareAtPriceInCents: 199900,
    estimatedDurationWeeks: 8,
    difficultyLevel: "beginner",
    maxParticipants: 50,
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
    title: "CMMC Level 2 Advanced Implementation",
    slug: "cmmc-level-2-advanced",
    description: "Comprehensive training for CMMC Level 2 compliance. Implement advanced security practices to protect Controlled Unclassified Information (CUI) and meet DoD requirements.",
    priceInCents: 349900,
    compareAtPriceInCents: 449900,
    estimatedDurationWeeks: 12,
    difficultyLevel: "intermediate",
    maxParticipants: 40,
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
    title: "CMMC Level 3 Expert Certification",
    slug: "cmmc-level-3-expert",
    description: "Advanced training for CMMC Level 3 compliance. Master expert-level security practices for protecting highly sensitive CUI and critical national security information.",
    priceInCents: 599900,
    compareAtPriceInCents: 799900,
    estimatedDurationWeeks: 16,
    difficultyLevel: "advanced",
    maxParticipants: 25,
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

async function seedCourses() {
  console.log('\n📚 Starting CMMC courses seed...\n');

  try {
    for (const course of courses) {
      console.log(`Creating: ${course.title}...`);
      
      const cohortData = {
        title: course.title,
        slug: course.slug,
        description: course.description,
        facilitatorId: INSTRUCTOR_ID,
        facilitatorName: INSTRUCTOR_NAME,
        facilitatorBio: "Certified CMMC professionals with extensive experience in defense contractor compliance",
        cohortStartDate: Timestamp.fromDate(course.cohortStartDate),
        cohortEndDate: Timestamp.fromDate(course.cohortEndDate),
        maxParticipants: course.maxParticipants,
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

      const docRef = await addDoc(collection(db, 'cohorts'), cohortData);
      console.log(`✅ Created: ${course.title} (ID: ${docRef.id})`);
    }

    console.log('\n🎉 Success! All CMMC courses have been seeded.');
    console.log('\n📍 View them at: http://localhost:3000/cohorts');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error seeding courses:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

seedCourses();
