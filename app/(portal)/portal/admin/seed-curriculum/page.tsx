"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";

// Import curriculum data from the original seed script
import { cmmcLevel1Modules, cmmcLevel2Modules, cmmcLevel3Modules } from "./curriculum-data";

export default function SeedCurriculumPage() {
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSeedCurriculum = async () => {
    if (!db) {
      setError("Firebase not initialized");
      return;
    }

    if (!confirm("This will add complete curriculum (modules and sessions) to all CMMC courses. Continue?")) {
      return;
    }

    setSeeding(true);
    setError(null);
    setResults([]);
    setProgress(0);

    try {
      // Find all CMMC cohorts
      setCurrentStep("Finding CMMC courses...");
      const cohortsQuery = query(
        collection(db, "cohorts"),
        where("slug", "in", ["cmmc-level-1-foundations", "cmmc-level-2-advanced", "cmmc-level-3-expert"])
      );
      
      const cohortsSnapshot = await getDocs(cohortsQuery);
      
      if (cohortsSnapshot.empty) {
        throw new Error("No CMMC courses found. Please seed courses first.");
      }

      const cohorts = cohortsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const totalSteps = cohorts.length;
      let completedSteps = 0;

      const courseResults = [];

      for (const cohort of cohorts) {
        const cohortData: any = cohort;
        let modulesData: any[] = [];
        
        // Determine which curriculum to use
        if (cohortData.slug === "cmmc-level-1-foundations") {
          modulesData = cmmcLevel1Modules;
        } else if (cohortData.slug === "cmmc-level-2-advanced") {
          modulesData = cmmcLevel2Modules;
        } else if (cohortData.slug === "cmmc-level-3-expert") {
          modulesData = cmmcLevel3Modules;
        }

        setCurrentStep(`Building curriculum for ${cohortData.title}...`);
        
        let moduleCount = 0;
        let sessionCount = 0;

        for (const moduleData of modulesData) {
          const { sessions, ...module } = moduleData;
          
          // Create module
          const moduleRef = await addDoc(collection(db, "cohort_modules"), {
            ...module,
            cohortId: cohort.id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          
          moduleCount++;

          // Create sessions for this module
          if (sessions) {
            for (const session of sessions) {
              await addDoc(collection(db, "cohort_sessions"), {
                ...session,
                moduleId: moduleRef.id,
                cohortId: cohort.id,
                scheduledDate: null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });
              sessionCount++;
            }
          }
        }

        courseResults.push({
          title: cohortData.title,
          modules: moduleCount,
          sessions: sessionCount,
        });

        completedSteps++;
        setProgress((completedSteps / totalSteps) * 100);
      }

      setResults(courseResults);
      setCurrentStep("Complete!");
      toast.success("Curriculum seeded successfully!");

    } catch (err: any) {
      console.error("Error seeding curriculum:", err);
      setError(err.message || "Failed to seed curriculum");
      toast.error("Failed to seed curriculum");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Seed CMMC Curriculum</h1>
        <p className="text-muted-foreground mb-8">
          Add complete curriculum (modules and sessions) to all CMMC courses
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Curriculum Overview</CardTitle>
            <CardDescription>
              This will create modules and sessions for all CMMC courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-semibold">CMMC Level 1</h3>
                  <p className="text-sm text-muted-foreground">
                    8 modules • 24 sessions
                  </p>
                </div>
                {results.find(r => r.title.includes("Level 1")) && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-semibold">CMMC Level 2</h3>
                  <p className="text-sm text-muted-foreground">
                    12 modules • 36 sessions
                  </p>
                </div>
                {results.find(r => r.title.includes("Level 2")) && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-semibold">CMMC Level 3</h3>
                  <p className="text-sm text-muted-foreground">
                    16 modules • 48 sessions
                  </p>
                </div>
                {results.find(r => r.title.includes("Level 3")) && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {seeding && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{currentStep}</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className="font-semibold">Successfully created curriculum!</p>
                {results.map((result, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{result.title}:</span>
                    <span className="text-muted-foreground ml-2">
                      {result.modules} modules, {result.sessions} sessions
                    </span>
                  </div>
                ))}
                <p className="text-sm mt-3">
                  <a href="/portal/instructor/cohorts" className="text-primary hover:underline">
                    View cohorts →
                  </a>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSeedCurriculum}
            disabled={seeding || results.length > 0}
            size="lg"
          >
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Curriculum...
              </>
            ) : results.length > 0 ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Curriculum Created
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-5 w-5" />
                Create Curriculum
              </>
            )}
          </Button>

          {results.length > 0 && (
            <Button
              variant="outline"
              onClick={() => window.location.href = "/portal/instructor/cohorts"}
            >
              View Cohorts
            </Button>
          )}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Prerequisites:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>CMMC courses must be seeded first (use /portal/admin/seed-courses)</li>
            <li>This will create all modules and sessions for each course</li>
            <li>Total: 36 modules and 108 sessions across all 3 courses</li>
            <li>Each session includes title, description, content type, and duration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
