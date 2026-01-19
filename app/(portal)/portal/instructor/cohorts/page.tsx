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
import { mockCMMCCohorts } from "@/lib/mock-data/cohort-mock-data";

interface Cohort {
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
    weekNumber: number;
    title: string;
    topics: string[];
  }[];
  completionRate?: number;
  averageScore?: number;
}

interface CohortStats {
  totalCohorts: number;
  activeCohorts: number;
  totalParticipants: number;
  averageCompletion: number;
  upcomingCohorts: number;
}

export default function InstructorCohortsPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [stats, setStats] = useState<CohortStats>({
    totalCohorts: 0,
    activeCohorts: 0,
    totalParticipants: 0,
    averageCompletion: 0,
    upcomingCohorts: 0,
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (useMockData) {
      setCohorts(mockCMMCCohorts as Cohort[]);
      calculateStats(mockCMMCCohorts as Cohort[]);
      setLoading(false);
    } else {
      loadCohorts();
    }
  }, [profile.id, useMockData]);

  const loadCohorts = async () => {
    if (!db || !profile.id) return;
    
    try {
      // Query cohorts where user is the instructor
      const q = query(
        collection(db, "cmmcCohorts"),
        where("instructorId", "==", profile.id),
        orderBy("startDate", "desc")
      );
      
      const snapshot = await getDocs(q);
      const cohortsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cohort[];
      
      setCohorts(cohortsData);
      calculateStats(cohortsData);
    } catch (error) {
      console.error("Error loading cohorts:", error);
      toast.error("Failed to load cohorts");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cohortsData: Cohort[]) => {
    const now = new Date();
    const active = cohortsData.filter(c => c.status === "active").length;
    const upcoming = cohortsData.filter(c => 
      c.status === "published" && c.startDate.toDate() > now
    ).length;
    const totalParticipants = cohortsData.reduce((sum, c) => sum + (c.currentEnrollment || 0), 0);
    const avgCompletion = cohortsData.length > 0
      ? cohortsData.reduce((sum, c) => sum + (c.completionRate || 0), 0) / cohortsData.length
      : 0;

    setStats({
      totalCohorts: cohortsData.length,
      activeCohorts: active,
      totalParticipants,
      averageCompletion: Math.round(avgCompletion),
      upcomingCohorts: upcoming,
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

  const filterCohorts = (status: string) => {
    if (status === "all") return cohorts;
    return cohorts.filter(c => c.status === status);
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
          <h1 className="text-3xl font-bold">CMMC Cohort Management</h1>
          <p className="text-muted-foreground">Manage your 12-week CMMC certification cohorts</p>
        </div>
        <div className="flex items-center gap-3">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <Link href="/portal/instructor/cohorts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Cohort
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Cohorts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalCohorts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Cohorts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.activeCohorts}</span>
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
              <span className="text-2xl font-bold">{stats.upcomingCohorts}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohorts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Cohorts</CardTitle>
          <CardDescription>
            Manage curriculum, track participant progress, and monitor completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({cohorts.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({cohorts.filter(c => c.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="published">
                Published ({cohorts.filter(c => c.status === "published").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({cohorts.filter(c => c.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({cohorts.filter(c => c.status === "draft").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterCohorts(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cohorts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all" 
                      ? "Create your first CMMC cohort to get started"
                      : `No ${activeTab} cohorts at the moment`}
                  </p>
                  <Link href="/portal/instructor/cohorts/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Cohort
                    </Button>
                  </Link>
                </div>
              ) : (
                filterCohorts(activeTab).map((cohort) => (
                  <Card key={cohort.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{cohort.title}</h3>
                            <Badge variant={getStatusColor(cohort.status)} className="flex items-center gap-1">
                              {getStatusIcon(cohort.status)}
                              {cohort.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{cohort.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Start Date</div>
                              <div className="font-medium">
                                {cohort.startDate?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Duration</div>
                              <div className="font-medium">{cohort.duration} weeks</div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Enrollment</div>
                              <div className="font-medium">
                                {cohort.currentEnrollment || 0} / {cohort.maxParticipants}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Price</div>
                              <div className="font-medium">${cohort.price?.toLocaleString()}</div>
                            </div>
                          </div>

                          {cohort.status === "active" && cohort.completionRate !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Completion Rate</span>
                                <span className="font-medium">{cohort.completionRate}%</span>
                              </div>
                              <Progress value={cohort.completionRate} className="h-2" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/portal/instructor/cohorts/${cohort.id}`}>
                            <Button variant="default" size="sm" className="w-full">
                              <Users className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </Link>
                          <Link href={`/portal/instructor/cohorts/${cohort.id}/curriculum`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <BookOpen className="mr-2 h-4 w-4" />
                              Curriculum
                            </Button>
                          </Link>
                          <Link href={`/portal/instructor/cohorts/${cohort.id}/discussion`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Discussion
                            </Button>
                          </Link>
                          {cohort.status === "completed" && (
                            <Link href={`/portal/instructor/cohorts/${cohort.id}/certificates`}>
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
