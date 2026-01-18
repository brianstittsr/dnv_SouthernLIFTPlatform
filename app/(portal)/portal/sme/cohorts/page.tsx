"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, doc, getDoc, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  BookOpen, 
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  Search
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Enrollment {
  id: string;
  cohortId: string;
  userId: string;
  enrolledAt: Timestamp;
  status: "enrolled" | "active" | "completed" | "dropped";
  progress: number;
  completedWeeks: number[];
  lastAccessedAt?: Timestamp;
  certificateIssued?: boolean;
}

interface CohortDetails {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number;
  currentWeek?: number;
  status: string;
}

interface EnrollmentWithCohort extends Enrollment {
  cohort?: CohortDetails;
}

export default function SMECohortsPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentWithCohort[]>([]);

  useEffect(() => {
    loadEnrollments();
  }, [profile.id]);

  const loadEnrollments = async () => {
    if (!db || !profile.id) return;
    
    try {
      // Get user's enrollments
      const enrollmentsQuery = query(
        collection(db, "cohortEnrollments"),
        where("userId", "==", profile.id)
      );
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrollmentsData: EnrollmentWithCohort[] = [];
      
      // For each enrollment, fetch the cohort details
      for (const enrollmentDoc of enrollmentsSnapshot.docs) {
        const enrollment = {
          id: enrollmentDoc.id,
          ...enrollmentDoc.data()
        } as Enrollment;
        
        // Fetch cohort details
        try {
          const cohortDoc = await getDoc(doc(db, "cmmcCohorts", enrollment.cohortId));
          if (cohortDoc.exists()) {
            enrollmentsData.push({
              ...enrollment,
              cohort: {
                id: cohortDoc.id,
                ...cohortDoc.data()
              } as CohortDetails
            });
          }
        } catch (error) {
          console.error("Error loading cohort:", error);
        }
      }
      
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      toast.error("Failed to load your cohorts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="default">In Progress</Badge>;
      case "completed": return <Badge variant="outline">Completed</Badge>;
      case "enrolled": return <Badge variant="secondary">Enrolled</Badge>;
      case "dropped": return <Badge variant="destructive">Dropped</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My CMMC Cohorts</h1>
          <p className="text-muted-foreground">Track your CMMC certification training progress</p>
        </div>
        <Link href="/portal/sme/cohorts/browse">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Browse Cohorts
          </Button>
        </Link>
      </div>

      {/* Enrollments List */}
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Cohorts Yet</h3>
              <p className="text-muted-foreground mb-4">
                You're not enrolled in any CMMC cohorts. Browse available cohorts to get started with your certification journey.
              </p>
              <Link href="/portal/sme/cohorts/browse">
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Browse Available Cohorts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{enrollment.cohort?.title || "Loading..."}</h3>
                      {getStatusBadge(enrollment.status)}
                      {enrollment.certificateIssued && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Certified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{enrollment.cohort?.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Start Date</div>
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {enrollment.cohort?.startDate?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.cohort?.duration || 12} weeks
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Completed Weeks</div>
                        <div className="font-medium">
                          {enrollment.completedWeeks?.length || 0} / {enrollment.cohort?.duration || 12}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Current Week</div>
                        <div className="font-medium">
                          Week {enrollment.cohort?.currentWeek || 1}
                        </div>
                      </div>
                    </div>

                    {enrollment.status === "active" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-medium">{enrollment.progress || 0}%</span>
                        </div>
                        <Progress value={enrollment.progress || 0} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {enrollment.status === "active" && (
                      <Link href={`/portal/sme/cohorts/${enrollment.cohortId}/curriculum`}>
                        <Button variant="default" size="sm" className="w-full">
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continue
                        </Button>
                      </Link>
                    )}
                    <Link href={`/portal/sme/cohorts/${enrollment.cohortId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    {enrollment.certificateIssued && (
                      <Link href={`/portal/sme/cohorts/${enrollment.cohortId}/certificate`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Award className="mr-2 h-4 w-4" />
                          Certificate
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
