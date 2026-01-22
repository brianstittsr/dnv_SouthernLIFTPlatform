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
import { toast } from "sonner";

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cohortId = params.id as string;

  const [cohort, setCohort] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completionRate: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    loadCohortData();
  }, [cohortId]);

  async function loadCohortData() {
    if (!db) {
      toast.error("Database connection not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load cohort data
      const cohortDoc = await getDoc(doc(db, "cohorts", cohortId));

      if (!cohortDoc.exists()) {
        toast.error("Cohort not found");
        router.push("/portal/admin/cohorts");
        return;
      }

      const cohortData = { id: cohortDoc.id, ...cohortDoc.data() };
      setCohort(cohortData);

      // Load enrollment stats
      const enrollmentsQuery = query(
        collection(db, "cohort_memberships"),
        where("cohortId", "==", cohortId)
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
    } catch (error) {
      console.error("Error loading cohort:", error);
      toast.error("Failed to load cohort data");
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
          <p className="text-muted-foreground">Loading cohort details...</p>
        </div>
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Cohort Not Found</h2>
        <p className="text-muted-foreground mb-4">The cohort you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/portal/admin/cohorts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cohorts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/portal/admin/cohorts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{cohort.title}</h1>
              {getStatusBadge(cohort.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Facilitator: {cohort.facilitatorName || "Not assigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/portal/admin/cohorts/${cohortId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Cohort
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
              {cohort.priceInCents ? formatCurrency(cohort.priceInCents) : "Free"}
            </div>
            <p className="text-xs text-muted-foreground">Per enrollment</p>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Details */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Information</CardTitle>
          <CardDescription>Basic details about this training cohort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(cohort.cohortStartDate)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(cohort.cohortEndDate)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Duration</label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{cohort.estimatedDurationWeeks || 12} weeks</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Capacity</label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {cohort.currentParticipants || 0} / {cohort.maxParticipants || 50}
                </span>
              </div>
            </div>
          </div>

          {cohort.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-sm">{cohort.description}</p>
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
              <CardDescription>Manage student enrollments and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Student management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>Modules and sessions for this cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Button onClick={() => router.push(`/portal/instructor/cohorts/${cohortId}/curriculum`)}>
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
              <CardDescription>Cohort discussions and Q&A</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Discussion board coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>Issued completion certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Certificate management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
