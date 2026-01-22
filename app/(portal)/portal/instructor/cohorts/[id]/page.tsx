"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  Calendar,
  Settings,
  ArrowLeft,
  GraduationCap,
  MessageSquare,
  Award,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Cohort {
  id: string;
  name: string;
  description: string;
  startDate: any;
  endDate: any;
  status: string;
  instructorId: string;
  maxStudents: number;
  enrolledCount: number;
  location?: string;
  meetingSchedule?: string;
  imageUrl?: string;
}

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cohortId = params.id as string;

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCohort();
  }, [cohortId]);

  async function loadCohort() {
    if (!db) {
      toast.error("Database connection not available");
      return;
    }
    
    try {
      setLoading(true);
      const cohortDoc = await getDoc(doc(db, "cohorts", cohortId));
      
      if (!cohortDoc.exists()) {
        toast.error("Cohort not found");
        router.push("/portal/instructor/cohorts");
        return;
      }

      setCohort({
        id: cohortDoc.id,
        ...cohortDoc.data(),
      } as Cohort);
    } catch (error) {
      console.error("Error loading cohort:", error);
      toast.error("Failed to load cohort");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading cohort...</p>
        </div>
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Cohort not found</p>
          <Button onClick={() => router.push("/portal/instructor/cohorts")} className="mt-4">
            Back to Cohorts
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/portal/instructor/cohorts")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cohort.name}</h1>
            <p className="text-muted-foreground mt-1">{cohort.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(cohort.status)}>
            {cohort.status}
          </Badge>
          <Link href={`/portal/instructor/cohorts/${cohortId}/edit`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {cohort.enrolledCount || 0} / {cohort.maxStudents}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Start Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {cohort.startDate?.toDate?.()?.toLocaleDateString() || "TBD"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              End Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {cohort.endDate?.toDate?.()?.toLocaleDateString() || "TBD"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">
                {cohort.location || "Online"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Information</CardTitle>
              <CardDescription>Overview of cohort details and schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{cohort.description}</p>
              </div>

              {cohort.meetingSchedule && (
                <div>
                  <h3 className="font-semibold mb-2">Meeting Schedule</h3>
                  <p className="text-muted-foreground">{cohort.meetingSchedule}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${getStatusColor(cohort.status)} mt-1`}>
                    {cohort.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold mt-1">
                    {cohort.enrolledCount || 0} / {cohort.maxStudents} students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href={`/portal/instructor/cohorts/${cohortId}/curriculum`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Manage Curriculum</h3>
                    <p className="text-sm text-muted-foreground">
                      Add modules and sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/portal/instructor/cohorts/${cohortId}/discussion`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Discussion Board</h3>
                    <p className="text-sm text-muted-foreground">
                      View student discussions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/portal/instructor/cohorts/${cohortId}/certificates`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Award className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">Certificates</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage completion certificates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">View as Student</h3>
                  <p className="text-sm text-muted-foreground">
                    Preview student experience
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Manage student enrollment and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Student list will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>Course modules and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/portal/instructor/cohorts/${cohortId}/curriculum`}>
                <Button>Go to Curriculum Manager</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion">
          <Card>
            <CardHeader>
              <CardTitle>Discussion Board</CardTitle>
              <CardDescription>Student discussions and Q&A</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/portal/instructor/cohorts/${cohortId}/discussion`}>
                <Button>Go to Discussion Board</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>Completion certificates for students</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/portal/instructor/cohorts/${cohortId}/certificates`}>
                <Button>Manage Certificates</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
