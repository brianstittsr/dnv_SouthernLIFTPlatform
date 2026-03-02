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
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockQAReviews } from "@/lib/mock-data/qa-mock-data";
import Link from "next/link";

interface QAReview {
  id: string;
  smeId: string;
  smeCompany: string;
  reviewerId: string;
  reviewerName: string;
  reviewType: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: string;
  certifications: string[];
  findings: any[];
  score: number | null;
  completionPercentage: number;
  scheduledDate?: any;
  startedAt?: any;
  completedAt?: any;
  dueDate?: any;
  createdAt: any;
  updatedAt: any;
}

export default function MyReviewsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<QAReview[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (useMockData) {
      // Filter to only reviews assigned to current user
      const myReviews = mockQAReviews.filter(r => !r.placeholder && r.reviewerId === profile.id);
      setReviews(myReviews as QAReview[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      const q = query(
        collection(db, "qaReviews"),
        where("reviewerId", "==", profile.id),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QAReview[];
      setReviews(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    const variants: Record<string, any> = {
      scheduled: { variant: "outline", icon: Calendar, color: "text-blue-600" },
      in_progress: { variant: "default", icon: Clock, color: "text-yellow-600" },
      completed: { variant: "secondary", icon: CheckCircle2, color: "text-green-600" },
      cancelled: { variant: "destructive", icon: AlertTriangle, color: "text-red-600" },
    };
    const config = variants[status] || variants.scheduled;
    const Icon = config.icon;
    const displayText = status.replace("_", " ");
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {displayText.charAt(0).toUpperCase() + displayText.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (!priority) return null;
    const variants: Record<string, any> = {
      low: "outline",
      medium: "default",
      high: "destructive",
    };
    return (
      <Badge variant={variants[priority] || "outline"} className="text-xs">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filterReviews = (status: string) => {
    if (status === "all") return reviews;
    return reviews.filter(r => r.status === status);
  };

  const stats = {
    total: reviews.length,
    scheduled: reviews.filter(r => r.status === "scheduled").length,
    inProgress: reviews.filter(r => r.status === "in_progress").length,
    completed: reviews.filter(r => r.status === "completed").length,
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
          <h1 className="text-3xl font-bold">My QA Reviews</h1>
          <p className="text-muted-foreground">Manage your assigned quality assurance reviews</p>
        </div>
        <DataToggle onToggle={setUseMockData} defaultValue={false} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.scheduled}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.inProgress}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Reviews</CardTitle>
          <CardDescription>Quality assurance reviews assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({reviews.length})</TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled ({reviews.filter(r => r.status === "scheduled").length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({reviews.filter(r => r.status === "in_progress").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({reviews.filter(r => r.status === "completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterReviews(activeTab).length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "all" 
                      ? "No reviews assigned to you yet"
                      : `No ${activeTab.replace("_", " ")} reviews at the moment`}
                  </p>
                </div>
              ) : (
                filterReviews(activeTab).map((review) => (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{review.reviewType.replace("_", " ").toUpperCase()}</h3>
                            {getStatusBadge(review.status)}
                            {getPriorityBadge(review.priority)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Building2 className="h-4 w-4" />
                            <span>{review.smeCompany}</span>
                          </div>
                        </div>
                        {review.score !== null && review.score !== undefined && (
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">{review.score}</div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      {review.certifications && review.certifications.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Certifications
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {review.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {review.scheduledDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
                            <p className="text-sm font-medium">{formatDate(review.scheduledDate)}</p>
                          </div>
                        )}
                        {review.startedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Started</p>
                            <p className="text-sm font-medium">{formatDate(review.startedAt)}</p>
                          </div>
                        )}
                        {review.dueDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                            <p className="text-sm font-medium">{formatDate(review.dueDate)}</p>
                          </div>
                        )}
                        {review.completedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Completed</p>
                            <p className="text-sm font-medium">{formatDate(review.completedAt)}</p>
                          </div>
                        )}
                      </div>

                      {review.status === "in_progress" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Completion Progress</span>
                            <span className="font-medium">{review.completionPercentage}%</span>
                          </div>
                          <Progress value={review.completionPercentage} className="h-2" />
                        </div>
                      )}

                      {review.findings && review.findings.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-medium mb-3">Findings ({review.findings.length})</p>
                            <div className="space-y-2">
                              {review.findings.slice(0, 3).map((finding, idx) => (
                                <div key={idx} className="p-2 bg-muted rounded text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge 
                                      variant={finding.severity === "critical" ? "destructive" : finding.severity === "major" ? "default" : "outline"}
                                      className="text-xs"
                                    >
                                      {finding.severity}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{finding.category}</span>
                                  </div>
                                  <p className="text-xs">{finding.description}</p>
                                </div>
                              ))}
                              {review.findings.length > 3 && (
                                <p className="text-xs text-muted-foreground">+{review.findings.length - 3} more findings</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        <Link href={`/portal/qa/review/${review.id}`}>
                          <Button variant="default" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            {review.status === "completed" ? "View Review" : "Continue Review"}
                          </Button>
                        </Link>
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
