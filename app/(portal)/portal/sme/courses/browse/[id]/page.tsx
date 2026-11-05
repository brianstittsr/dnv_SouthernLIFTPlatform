"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ArrowLeft,
  Award,
} from "lucide-react";
import Link from "next/link";

interface CourseDetail {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  facilitatorName: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  estimatedDurationWeeks: number | null;
  status: string;
  difficultyLevel: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  isFree: boolean;
  thumbnailUrl: string | null;
  tags: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  outline: { id: string; title: string; description?: string; sessions: { id: string; title: string; type?: string }[] }[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/lms/courses/${id}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Course not found");
      setCourse(payload.data);
    } catch (err: any) {
      console.error("Error loading course:", err);
      setError(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBD";

  const formatPrice = () =>
    !course ? "" : course.isFree ? "Free" : `$${(course.priceInCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const spotsRemaining = () => (course?.maxParticipants ? course.maxParticipants - course.currentParticipants : null);
  const enrollmentPercentage = () =>
    course?.maxParticipants ? Math.round((course.currentParticipants / course.maxParticipants) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">{error || "The requested course could not be found."}</p>
            <Button asChild>
              <Link href="/portal/sme/courses/browse">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spots = spotsRemaining();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/portal/sme/courses/browse">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.difficultyLevel && (
            <Badge variant={course.difficultyLevel === "advanced" ? "destructive" : "secondary"}>
              {course.difficultyLevel}
            </Badge>
          )}
          {course.isFree && <Badge variant="outline">Free</Badge>}
        </div>
        <p className="text-xl text-muted-foreground mb-4">{course.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Outcomes</CardTitle>
                  <CardDescription>What you&apos;ll achieve in this course</CardDescription>
                </CardHeader>
                <CardContent>
                  {course.learningOutcomes.length > 0 ? (
                    <ul className="space-y-2">
                      {course.learningOutcomes.map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Details will be provided upon enrollment.</p>
                  )}
                </CardContent>
              </Card>

              {course.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="syllabus" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Syllabus</CardTitle>
                  <CardDescription>
                    {course.estimatedDurationWeeks ? `${course.estimatedDurationWeeks}-week program` : "Self-paced program"} — enroll to access content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.outline.length > 0 ? (
                    <div className="space-y-4">
                      {course.outline.map((module, idx) => (
                        <div key={module.id} className="flex gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {idx + 1}. {module.title}
                            </p>
                            {module.sessions.length > 0 && (
                              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {module.sessions.map((session) => (
                                  <li key={session.id}>• {session.title}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Syllabus details will be provided upon enrollment.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{course.facilitatorName || "LIFT Instructor"}</h3>
                      <p className="text-muted-foreground">Southern University LIFT Rural Business Center</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold">{formatPrice()}</span>
                </div>
                {!course.isFree && <p className="text-sm text-muted-foreground">One-time payment</p>}
              </div>

              <Separator />

              {course.maxParticipants && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Enrollment</span>
                    <span className="text-sm font-semibold">
                      {course.currentParticipants}/{course.maxParticipants}
                    </span>
                  </div>
                  <Progress value={enrollmentPercentage()} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{spots} spots remaining</p>
                </div>
              )}

              <Separator />

              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push(`/portal/sme/courses/enroll/${course.id}`)}
                disabled={spots === 0}
              >
                {spots === 0 ? "Course Full" : course.isFree ? "Enroll Free" : "Enroll Now"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(course.courseStartDate)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(course.courseEndDate)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {course.estimatedDurationWeeks ? `${course.estimatedDurationWeeks} weeks` : "Self-paced"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Enrolled</p>
                  <p className="text-sm text-muted-foreground">{course.currentParticipants} participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
