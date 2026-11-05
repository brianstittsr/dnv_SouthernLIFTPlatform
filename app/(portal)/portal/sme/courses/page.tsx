"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Calendar, Clock, Award, PlayCircle, Search, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface MemberCourse {
  membershipId: string;
  courseId: string;
  status: string;
  progressPercentage: number;
  completedSessions: number;
  totalSessions: number;
  enrolledAt: string | null;
  completedAt: string | null;
  certificateId: string | null;
  course: {
    title: string;
    description: string;
    facilitatorName: string | null;
    thumbnailUrl: string | null;
    estimatedDurationWeeks: number | null;
    difficultyLevel: string | null;
    courseStartDate: string | null;
    courseEndDate: string | null;
  } | null;
}

export default function SMECoursesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<MemberCourse[]>([]);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) loadEnrollments();
      else setLoading(false);
    });
    return () => unsubscribe?.();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await auth?.currentUser?.getIdToken();
      const response = await fetch("/api/lms/my-courses", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load your courses");
      setEnrollments(payload.data ?? []);
    } catch (err: any) {
      console.error("Error loading enrollments:", err);
      setError(err.message || "Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (enrollment: MemberCourse) => {
    if (enrollment.status === "completed") return <Badge variant="outline">Completed</Badge>;
    if (enrollment.progressPercentage > 0) return <Badge variant="default">In Progress</Badge>;
    return <Badge variant="secondary">Enrolled</Badge>;
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Track your training progress and certificates</p>
        </div>
        <Link href="/portal/sme/courses/browse">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </Link>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={loadEnrollments}>Try again</Button>
          </CardContent>
        </Card>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground mb-4">
                You&apos;re not enrolled in any courses. Browse available programs to get started.
              </p>
              <Link href="/portal/sme/courses/browse">
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Browse Available Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.membershipId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{enrollment.course?.title || "Course"}</h3>
                      {getStatusBadge(enrollment)}
                      {enrollment.certificateId && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Certified
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">{enrollment.course?.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Start Date</div>
                        <div className="font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(enrollment.course?.courseStartDate ?? null)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.course?.estimatedDurationWeeks ? `${enrollment.course.estimatedDurationWeeks} weeks` : "Self-paced"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Sessions Completed</div>
                        <div className="font-medium">
                          {enrollment.completedSessions} / {enrollment.totalSessions || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Instructor</div>
                        <div className="font-medium">{enrollment.course?.facilitatorName || "TBD"}</div>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium">{enrollment.progressPercentage}%</span>
                      </div>
                      <Progress value={enrollment.progressPercentage} className="h-2" />
                      {enrollment.status === "completed" && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed {formatDate(enrollment.completedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/portal/sme/courses/${enrollment.courseId}`}>
                      <Button variant="default" size="sm" className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {enrollment.progressPercentage > 0 ? "Continue" : "Start"}
                      </Button>
                    </Link>
                    {enrollment.certificateId && (
                      <a href={`/api/lms/certificates/${enrollment.certificateId}/pdf`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full">
                          <Award className="mr-2 h-4 w-4" />
                          Certificate
                        </Button>
                      </a>
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
