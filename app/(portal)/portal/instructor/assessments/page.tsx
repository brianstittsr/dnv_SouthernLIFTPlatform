"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Plus, 
  FileText, 
  Clock, 
  Users, 
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  Edit,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockAssessments } from "@/lib/mock-data/assessment-mock-data";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "exam" | "assignment";
  cohortId: string;
  cohortTitle: string;
  instructorId: string;
  status: "draft" | "published" | "completed";
  totalQuestions: number;
  passingScore: number;
  timeLimit: number | null;
  attempts: number;
  dueDate: any;
  createdAt: any;
  updatedAt: any;
  submissions: number;
  averageScore: number;
  completionRate: number;
}

export default function AssessmentsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (useMockData) {
      setAssessments(mockAssessments as Assessment[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "assessments"),
        where("instructorId", "==", profile.id),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assessment[];
      setAssessments(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const configs: Record<string, any> = {
      quiz: { variant: "secondary", label: "Quiz" },
      exam: { variant: "default", label: "Exam" },
      assignment: { variant: "outline", label: "Assignment" },
    };
    const config = configs[type] || configs.quiz;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      draft: { variant: "outline", label: "Draft" },
      published: { variant: "default", label: "Published" },
      completed: { variant: "secondary", label: "Completed" },
    };
    const config = configs[status] || configs.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filterAssessments = (status: string) => {
    if (status === "all") return assessments;
    return assessments.filter(a => a.status === status);
  };

  const stats = {
    total: assessments.length,
    published: assessments.filter(a => a.status === "published").length,
    drafts: assessments.filter(a => a.status === "draft").length,
    completed: assessments.filter(a => a.status === "completed").length,
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
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Create and manage quizzes, exams, and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.published}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.drafts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assessments</CardTitle>
          <CardDescription>Manage quizzes, exams, and assignments for your cohorts</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({assessments.length})</TabsTrigger>
              <TabsTrigger value="published">
                Published ({assessments.filter(a => a.status === "published").length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({assessments.filter(a => a.status === "draft").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({assessments.filter(a => a.status === "completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterAssessments(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all" 
                      ? "Create your first assessment to get started"
                      : `No ${activeTab} assessments at the moment`}
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assessment
                  </Button>
                </div>
              ) : (
                filterAssessments(activeTab).map((assessment) => (
                  <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{assessment.title}</h3>
                            {getTypeBadge(assessment.type)}
                            {getStatusBadge(assessment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{assessment.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{assessment.cohortTitle}</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {assessment.totalQuestions > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Questions</p>
                            <p className="text-sm font-semibold">{assessment.totalQuestions}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Passing Score</p>
                          <p className="text-sm font-semibold">{assessment.passingScore}%</p>
                        </div>
                        {assessment.timeLimit && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Time Limit</p>
                            <p className="text-sm font-semibold">{assessment.timeLimit} min</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Attempts</p>
                          <p className="text-sm font-semibold">{assessment.attempts}</p>
                        </div>
                      </div>

                      {assessment.status === "published" && (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Calendar className="h-3 w-3" />
                                {formatDate(assessment.dueDate)}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Submissions</p>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Users className="h-3 w-3" />
                                {assessment.submissions}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
                              <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                                <TrendingUp className="h-3 w-3" />
                                {assessment.averageScore}%
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Completion Rate</span>
                              <span className="font-medium">{assessment.completionRate}%</span>
                            </div>
                            <Progress value={assessment.completionRate} className="h-2" />
                          </div>
                        </>
                      )}

                      {assessment.status === "completed" && (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Submissions</p>
                            <p className="text-sm font-semibold">{assessment.submissions}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
                            <p className="text-sm font-semibold text-blue-600">{assessment.averageScore}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Completion</p>
                            <p className="text-sm font-semibold text-green-600">{assessment.completionRate}%</p>
                          </div>
                        </div>
                      )}

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        <Button variant="default" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                        {assessment.status === "draft" && (
                          <Button variant="outline" size="sm">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Publish
                          </Button>
                        )}
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
