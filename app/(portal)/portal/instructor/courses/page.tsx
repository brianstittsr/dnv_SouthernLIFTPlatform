"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockCMMCCourses } from "@/lib/mock-data/course-mock-data";

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  duration: number;
  maxParticipants: number;
  currentEnrollment: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  price: number;
  curriculum: {
    weeknumber: number;
    title: string;
    topics: string[];
  }[];
  completionRate?: number;
  averageScore?: number;
}

interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalParticipants: number;
  averageCompletion: number;
  upcomingCourses: number;
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalParticipants: 0,
    averageCompletion: 0,
    upcomingCourses: 0,
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (useMockData) {
      setCourses(mockCMMCCourses as Course[]);
      calculateStats(mockCMMCCourses as Course[]);
      setLoading(false);
    } else {
      loadCourses();
    }
  }, [profile.id, useMockData]);

  const loadCourses = async () => {
    if (!db || !profile.id) return;
    
    try {
      // Query courses where user is the instructor
      const q = query(
        collection(db, "cmmcCourses"),
        where("instructorId", "==", profile.id),
        orderBy("startDate", "desc")
      );
      
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
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
    const now = new Date();
    const active = coursesData.filter(c => c.status === "active").length;
    const upcoming = coursesData.filter(c => 
      c.status === "published" && c.startDate.toDate() > now
    ).length;
    const totalParticipants = coursesData.reduce((sum, c) => sum + (c.currentEnrollment || 0), 0);
    const avgCompletion = coursesData.length > 0
      ? coursesData.reduce((sum, c) => sum + (c.completionRate || 0), 0) / coursesData.length
      : 0;

    setStats({
      totalCourses: coursesData.length,
      activeCourses: active,
      totalParticipants,
      averageCompletion: Math.round(avgCompletion),
      upcomingCourses: upcoming,
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
    return courses.filter(c => c.status === status);
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
          <h1 className="text-3xl font-bold">CMMC Course Management</h1>
          <p className="text-muted-foreground">Manage your 12-week CMMC certification courses</p>
        </div>
        <div className="flex items-center gap-3">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <Link href="/portal/instructor/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <CardDescription>Avg Completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.averageCompletion}%</span>
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

      {/* Courses List */}
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
                Active ({courses.filter(c => c.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="published">
                Published ({courses.filter(c => c.status === "published").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({courses.filter(c => c.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({courses.filter(c => c.status === "draft").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterCourses(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all" 
                      ? "Create your first CMMC course to get started"
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
                          </div>
                          <p className="text-muted-foreground mb-4">{course.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Start Date</div>
                              <div className="font-medium">
                                {course.startDate?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Duration</div>
                              <div className="font-medium">{course.duration} weeks</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Enrollment</div>
                              <div className="font-medium">
                                {course.currentEnrollment || 0} / {course.maxParticipants}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Price</div>
                              <div className="font-medium">${course.price?.toLocaleString()}</div>
                            </div>
                          </div>

                          {course.status === "active" && course.completionRate !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Completion Rate</span>
                                <span className="font-medium">{course.completionRate}%</span>
                              </div>
                              <Progress value={course.completionRate} className="h-2" />
                            </div>
                          )}
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
