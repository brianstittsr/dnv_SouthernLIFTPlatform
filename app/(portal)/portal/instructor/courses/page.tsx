"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Award,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description?: string;
  facilitatorId?: string;
  instructorId?: string;
  courseStartDate?: Timestamp;
  courseEndDate?: Timestamp;
  estimatedDurationWeeks?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  priceInCents?: number;
  isFree?: boolean;
}

interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalParticipants: number;
  upcomingCourses: number;
}

export default function InstructorCoursesPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalParticipants: 0,
    upcomingCourses: 0,
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (profile.authUid) loadCourses();
  }, [profile.authUid]);

  const loadCourses = async () => {
    if (!db || !profile.authUid) return;

    try {
      // Canonical courses where this user is the facilitator (legacy instructorId kept for older docs)
      const [byFacilitator, byInstructor] = await Promise.all([
        getDocs(query(collection(db, "courses"), where("facilitatorId", "==", profile.authUid))),
        getDocs(query(collection(db, "courses"), where("instructorId", "==", profile.authUid))),
      ]);

      const byId = new Map<string, Course>();
      [...byFacilitator.docs, ...byInstructor.docs].forEach((courseDoc) => {
        byId.set(courseDoc.id, { id: courseDoc.id, ...courseDoc.data() } as Course);
      });
      const coursesData = [...byId.values()].sort(
        (a, b) => (b.courseStartDate?.toMillis() ?? 0) - (a.courseStartDate?.toMillis() ?? 0)
      );

      setCourses(coursesData);
      calculateStats(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (coursesData: Course[]) => {
    const now = Date.now();
    setStats({
      totalCourses: coursesData.length,
      activeCourses: coursesData.filter((c) => c.status === "active").length,
      totalParticipants: coursesData.reduce((sum, c) => sum + (c.currentParticipants || 0), 0),
      upcomingCourses: coursesData.filter(
        (c) => c.status === "published" && (c.courseStartDate?.toMillis() ?? 0) > now
      ).length,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "published": return "secondary";
      case "completed": return "outline";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Clock className="h-4 w-4" />;
      case "published": return <Calendar className="h-4 w-4" />;
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "draft": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const filterCourses = (status: string) => {
    if (status === "all") return courses;
    return courses.filter((c) => c.status === status);
  };

  const formatPrice = (course: Course) =>
    course.isFree ? "Free" : `$${((course.priceInCents ?? 0) / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Manage your training courses</p>
        </div>
        <Link href="/portal/instructor/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalCourses}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.activeCourses}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Participants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalParticipants}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{stats.upcomingCourses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Manage curriculum, track participant progress, and monitor completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({courses.filter((c) => c.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="published">
                Published ({courses.filter((c) => c.status === "published").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({courses.filter((c) => c.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({courses.filter((c) => c.status === "draft").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterCourses(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all"
                      ? "Create your first course to get started"
                      : `No ${activeTab} courses at the moment`}
                  </p>
                  <Link href="/portal/instructor/courses/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Course
                    </Button>
                  </Link>
                </div>
              ) : (
                filterCourses(activeTab).map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{course.title}</h3>
                            <Badge variant={getStatusColor(course.status)} className="flex items-center gap-1">
                              {getStatusIcon(course.status)}
                              {course.status}
                            </Badge>
                            {course.isFree && <Badge variant="outline">Free</Badge>}
                          </div>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Start Date</div>
                              <div className="font-medium">
                                {course.courseStartDate
                                  ? course.courseStartDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                  : "TBD"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Duration</div>
                              <div className="font-medium">
                                {course.estimatedDurationWeeks ? `${course.estimatedDurationWeeks} weeks` : "Self-paced"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Enrollment</div>
                              <div className="font-medium">
                                {course.currentParticipants || 0} / {course.maxParticipants ?? "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Price</div>
                              <div className="font-medium">{formatPrice(course)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/portal/instructor/courses/${course.id}`}>
                            <Button variant="default" size="sm" className="w-full">
                              <Users className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </Link>
                          <Link href={`/portal/instructor/courses/${course.id}/curriculum`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Curriculum
                            </Button>
                          </Link>
                          <Link href={`/portal/instructor/courses/${course.id}/discussion`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Discussion
                            </Button>
                          </Link>
                          {course.status === "completed" && (
                            <Link href={`/portal/instructor/courses/${course.id}/certificates`}>
                              <Button variant="outline" size="sm" className="w-full">
                                <Award className="mr-2 h-4 w-4" />
                                Certificates
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
