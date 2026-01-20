"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

export default function SeedCoursesPage() {
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSeedCourses = async () => {
    if (!db) {
      setError("Firebase not initialized");
      return;
    }

    if (!confirm("This will create 3 CMMC courses in your database. Continue?")) {
      return;
    }

    setSeeding(true);
    setError(null);
    setResults([]);

    try {
      const createdCourses = [];

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
        
        createdCourses.push({
          title: course.title,
          id: docRef.id,
          slug: course.slug,
        });

        console.log(`✅ Created: ${course.title} (ID: ${docRef.id})`);
      }

      setResults(createdCourses);
      toast.success("All CMMC courses created successfully!");

    } catch (err: any) {
      console.error("Error seeding courses:", err);
      setError(err.message || "Failed to seed courses");
      toast.error("Failed to seed courses");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Seed CMMC Courses</h1>
        <p className="text-muted-foreground mb-8">
          Create the 3 CMMC training courses in your database
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Courses to Create</CardTitle>
            <CardDescription>
              This will create 3 CMMC certification courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.estimatedDurationWeeks} weeks • {course.difficultyLevel} • ${(course.priceInCents / 100).toLocaleString()}
                    </p>
                  </div>
                  {results.find(r => r.title === course.title) && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <Alert className="mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Successfully created {results.length} courses!</p>
                {results.map((result, idx) => (
                  <div key={idx} className="text-sm">
                    <a 
                      href={`/cohorts/${result.slug}`}
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {result.title}
                    </a>
                    <span className="text-muted-foreground ml-2">(ID: {result.id})</span>
                  </div>
                ))}
                <p className="text-sm mt-3">
                  <a href="/cohorts" target="_blank" className="text-primary hover:underline">
                    View all courses →
                  </a>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSeedCourses}
            disabled={seeding || results.length > 0}
            size="lg"
          >
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Courses...
              </>
            ) : results.length > 0 ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Courses Created
              </>
            ) : (
              "Create CMMC Courses"
            )}
          </Button>

          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={() => window.location.href = "/cohorts"}
            >
              View Courses
            </Button>
          )}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">What happens when you click the button:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>Creates CMMC Level 1 Foundations ($1,499 - 8 weeks)</li>
            <li>Creates CMMC Level 2 Advanced ($3,499 - 12 weeks)</li>
            <li>Creates CMMC Level 3 Expert ($5,999 - 16 weeks)</li>
            <li>All courses will be published and visible in the catalog</li>
            <li>You can then add modules and sessions via the curriculum page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
