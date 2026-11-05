"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Users,
  Calendar,
  DollarSign,
  Edit,
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Award,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface RosterEntry {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  progressPercentage: number;
  completedSessions: number;
  totalSessions: number;
  enrolledAt: any;
  completedAt: any;
}

interface CertificateEntry {
  id: string;
  userName: string;
  certificateNumber: string;
  completionDate: any;
  status: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completionRate: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  async function loadCourseData() {
    if (!db) {
      toast.error("Database connection not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load course data
      const courseDoc = await getDoc(doc(db, "courses", courseId));

      if (!courseDoc.exists()) {
        toast.error("Course not found");
        router.push("/portal/admin/courses");
        return;
      }

      const courseData = { id: courseDoc.id, ...courseDoc.data() };
      setCourse(courseData);

      // Load enrollment stats
      const enrollmentsQuery = query(
        collection(db, "course_memberships"),
        where("courseId", "==", courseId)
      );
      const enrollmentsSnap = await getDocs(enrollmentsQuery);

      let totalProgress = 0;
      let activeCount = 0;
      let completedCount = 0;

      enrollmentsSnap.docs.forEach((doc) => {
        const data = doc.data();
        totalProgress += data.progressPercentage || 0;
        if (data.status === "active") activeCount++;
        if (data.status === "completed") completedCount++;
      });

      const totalStudents = enrollmentsSnap.size;
      const avgProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;
      const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

      setStats({
        totalStudents,
        activeStudents: activeCount,
        completionRate,
        averageProgress: avgProgress,
      });

      // Build the roster — resolve each member's name/email from their user doc
      const rosterRows = await Promise.all(
        enrollmentsSnap.docs.map(async (membershipDoc): Promise<RosterEntry> => {
          const m = membershipDoc.data();
          let name = "Unknown student";
          let email = "";
          try {
            const userSnap = await getDoc(doc(db!, "users", m.userId));
            if (userSnap.exists()) {
              const u = userSnap.data();
              name =
                u.displayName ||
                [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                u.email ||
                name;
              email = u.email || "";
            }
          } catch {
            // leave defaults
          }
          return {
            membershipId: membershipDoc.id,
            userId: m.userId,
            name,
            email,
            status: m.status || "active",
            progressPercentage: m.progressPercentage || 0,
            completedSessions: m.completedSessions || 0,
            totalSessions: m.totalSessions || 0,
            enrolledAt: m.enrolledAt,
            completedAt: m.completedAt,
          };
        })
      );
      setRoster(
        rosterRows.sort((a, b) => (b.enrolledAt?.toMillis?.() ?? 0) - (a.enrolledAt?.toMillis?.() ?? 0))
      );

      // Issued certificates for this course
      const certsSnap = await getDocs(
        query(collection(db, "course_certificates"), where("courseId", "==", courseId))
      );
      setCertificates(
        certsSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as CertificateEntry))
          .sort((a, b) => (b.completionDate?.toMillis?.() ?? 0) - (a.completionDate?.toMillis?.() ?? 0))
      );
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      enrolling: { variant: "secondary", label: "Enrolling" },
      completed: { variant: "outline", label: "Completed" },
      draft: { variant: "outline", label: "Draft" },
      scheduled: { variant: "secondary", label: "Scheduled" },
    };

    const config = variants[status] || variants.draft;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground mb-4">The course you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push("/portal/admin/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/portal/admin/courses")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              {getStatusBadge(course.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Facilitator: {course.facilitatorName || "Not assigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/portal/admin/courses/${courseId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Students completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.priceInCents ? formatCurrency(course.priceInCents) : "Free"}
            </div>
            <p className="text-xs text-muted-foreground">Per enrollment</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Details */}
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Basic details about this training course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(course.courseStartDate)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(course.courseEndDate)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Duration</label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{course.estimatedDurationWeeks || 12} weeks</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Capacity</label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {course.currentParticipants || 0} / {course.maxParticipants || 50}
                </span>
              </div>
            </div>
          </div>

          {course.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-sm">{course.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="curriculum">
            <BookOpen className="mr-2 h-4 w-4" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="discussion">
            <MessageSquare className="mr-2 h-4 w-4" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="mr-2 h-4 w-4" />
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                {roster.length} enrolled — progress tracked per session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roster.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No students enrolled yet</h3>
                  <p className="text-muted-foreground">
                    Students will appear here once they enroll through the course catalog.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead className="w-[200px]">Progress</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((entry) => (
                      <TableRow key={entry.membershipId}>
                        <TableCell>
                          <div className="font-medium">{entry.name}</div>
                          {entry.email && (
                            <div className="text-xs text-muted-foreground">{entry.email}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.status === "completed" ? "outline" : "default"}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.completedSessions} / {entry.totalSessions || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={entry.progressPercentage} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground w-10">
                              {entry.progressPercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(entry.enrolledAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {entry.completedAt ? formatDate(entry.completedAt) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>Modules and sessions for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Button onClick={() => router.push(`/portal/instructor/courses/${courseId}/curriculum`)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Curriculum
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion">
          <Card>
            <CardHeader>
              <CardTitle>Discussion Board</CardTitle>
              <CardDescription>Course discussions and Q&A</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Discussion Board</h3>
                <p className="text-muted-foreground mb-4">
                  Course discussions and Q&A are managed from the instructor workspace.
                </p>
                <Button onClick={() => router.push(`/portal/instructor/courses/${courseId}/discussion`)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Discussion Board
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                {certificates.length} issued — certificates are generated automatically at 100% completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No certificates issued yet</h3>
                  <p className="text-muted-foreground">
                    Certificates are issued automatically when a student completes the full curriculum.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.userName}</TableCell>
                        <TableCell className="font-mono text-xs">{cert.certificateNumber}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(cert.completionDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{cert.status || "active"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/api/lms/certificates/${cert.id}/pdf`} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
