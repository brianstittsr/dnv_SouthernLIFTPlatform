"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Plus, 
  FileText, 
  Users, 
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Copy,
  Archive,
  BarChart3,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSurveys } from "@/lib/mock-data/survey-mock-data";
import { Survey } from "@/lib/types/survey";
import Link from "next/link";

export default function SurveysPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (useMockData) {
      setSurveys(mockSurveys as Survey[]);
      setLoading(false);
    } else {
      loadSurveys();
    }
  }, [profile.id, useMockData]);

  const loadSurveys = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "surveys"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Survey[];
      setSurveys(data);
    } catch (error) {
      console.error("Error loading surveys:", error);
      toast.error("Failed to load surveys");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "outline", label: "Draft" },
      active: { variant: "default", label: "Active" },
      paused: { variant: "secondary", label: "Paused" },
      closed: { variant: "secondary", label: "Closed" },
      archived: { variant: "outline", label: "Archived" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filterSurveys = (status: string) => {
    if (status === "all") return surveys;
    return surveys.filter(s => s.status === status);
  };

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === "active").length,
    drafts: surveys.filter(s => s.status === "draft").length,
    closed: surveys.filter(s => s.status === "closed").length,
    totalResponses: surveys.reduce((sum, s) => sum + s.currentResponses, 0),
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
          <h1 className="text-3xl font-bold">Survey Manager</h1>
          <p className="text-muted-foreground">Create and manage professional surveys with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <Link href="/portal/admin/surveys/templates">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/portal/admin/surveys/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </Link>
          <Link href="/portal/admin/surveys/ai-create">
            <Button variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Sparkles className="mr-2 h-4 w-4" />
              Create with AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Surveys</CardDescription>
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
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.active}</span>
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
            <CardDescription>Closed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold">{stats.closed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalResponses}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Surveys</CardTitle>
          <CardDescription>Manage and analyze your surveys</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({surveys.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({surveys.filter(s => s.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Drafts ({surveys.filter(s => s.status === "draft").length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({surveys.filter(s => s.status === "closed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterSurveys(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No surveys found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all" 
                      ? "Create your first survey to get started"
                      : `No ${activeTab} surveys at the moment`}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Link href="/portal/admin/surveys/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Survey
                      </Button>
                    </Link>
                    <Link href="/portal/admin/surveys/ai-create">
                      <Button variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create with AI
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                filterSurveys(activeTab).map((survey) => (
                  <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{survey.title}</h3>
                            {getStatusBadge(survey.status)}
                            {survey.templateName && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {survey.templateName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{survey.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Created by {survey.createdByName}</span>
                            <span>•</span>
                            <span>{formatDate(survey.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Responses</p>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-semibold">
                              {survey.currentResponses}
                              {survey.maxResponses && ` / ${survey.maxResponses}`}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-semibold">{survey.completionRate}%</p>
                          </div>
                        </div>
                        {survey.averageTimeToComplete && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Avg Time</p>
                            <p className="text-sm font-semibold">{survey.averageTimeToComplete} min</p>
                          </div>
                        )}
                        {survey.startDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Active Period</p>
                            <p className="text-sm font-semibold">
                              {formatDate(survey.startDate)} - {formatDate(survey.endDate)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/portal/admin/surveys/${survey.id}/edit`}>
                          <Button variant="default" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/portal/admin/surveys/${survey.id}/analytics`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/portal/admin/surveys/${survey.id}/responses`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Responses
                          </Button>
                        </Link>
                        {survey.shareUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(survey.shareUrl!);
                              toast.success("Share URL copied to clipboard");
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
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
