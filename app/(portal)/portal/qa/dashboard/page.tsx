"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  Award,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockQAReviews, mockQAStats } from "@/lib/mock-data/qa-mock-data";

interface QAReview {
  id: string;
  smeId: string;
  smeCompany: string;
  reviewerId: string;
  reviewerName: string;
  reviewType: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  certifications: string[];
  findings: Array<{
    id: string;
    severity: "minor" | "major" | "critical";
    category: string;
    description: string;
    requirement: string;
    status: "open" | "resolved";
  }>;
  score: number | null;
  completionPercentage: number;
  scheduledDate: any;
  startedAt?: any;
  completedAt?: any;
  dueDate: any;
  createdAt: any;
  updatedAt: any;
}

export default function QADashboardPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<QAReview[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (useMockData) {
      const filteredReviews = mockQAReviews.filter(r => !r.placeholder) as QAReview[];
      setReviews(filteredReviews);
      setStats(mockQAStats);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const q = query(collection(db, "qaReviews"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QAReview[];
      setReviews(data);
      
      // Calculate stats from live data
      const totalReviews = data.length;
      const inProgress = data.filter(r => r.status === "in_progress").length;
      const completed = data.filter(r => r.status === "completed").length;
      const scheduled = data.filter(r => r.status === "scheduled").length;
      
      const completedReviews = data.filter(r => r.score !== null);
      const averageScore = completedReviews.length > 0
        ? Math.round(completedReviews.reduce((sum, r) => sum + (r.score || 0), 0) / completedReviews.length)
        : 0;
      
      const allFindings = data.flatMap(r => r.findings || []);
      const criticalFindings = allFindings.filter(f => f.severity === "critical").length;
      const majorFindings = allFindings.filter(f => f.severity === "major").length;
      const minorFindings = allFindings.filter(f => f.severity === "minor").length;
      
      setStats({
        totalReviews,
        inProgress,
        completed,
        scheduled,
        averageScore,
        criticalFindings,
        majorFindings,
        minorFindings,
        onTimeCompletion: 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load QA reviews");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: { variant: "outline", icon: Calendar, color: "text-blue-600" },
      in_progress: { variant: "default", icon: Clock, color: "text-yellow-600" },
      completed: { variant: "secondary", icon: CheckCircle2, color: "text-green-600" },
      cancelled: { variant: "destructive", icon: XCircle, color: "text-red-600" },
    };
    const config = variants[status] || variants.scheduled;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
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

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      minor: { variant: "outline", color: "text-blue-600" },
      major: { variant: "default", color: "text-yellow-600" },
      critical: { variant: "destructive", color: "text-red-600" },
    };
    const config = variants[severity] || variants.minor;
    return (
      <Badge variant={config.variant} className="text-xs">
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-600";
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredReviews = statusFilter === "all" 
    ? reviews 
    : reviews.filter(r => r.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">QA Dashboard</h1>
            <p className="text-muted-foreground">Quality assurance reviews and compliance tracking</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Findings</p>
                  <p className="text-2xl font-bold">{stats.criticalFindings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("scheduled")}
        >
          Scheduled
        </Button>
        <Button
          variant={statusFilter === "in_progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_progress")}
        >
          In Progress
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          Completed
        </Button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No QA Reviews</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "No quality assurance reviews found."
                : `No ${statusFilter.replace("_", " ")} reviews found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{review.smeCompany}</CardTitle>
                      {getStatusBadge(review.status)}
                      {getPriorityBadge(review.priority)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {review.reviewType.replace("_", " ").charAt(0).toUpperCase() + review.reviewType.replace("_", " ").slice(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {review.certifications.join(", ")}
                      </span>
                      <span>Reviewer: {review.reviewerName}</span>
                    </CardDescription>
                  </div>
                  {review.score !== null && (
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(review.score)}`}>
                        {review.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                {review.status !== "completed" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completion Progress</span>
                      <span className="text-sm font-semibold">{review.completionPercentage}%</span>
                    </div>
                    <Progress value={review.completionPercentage} className="h-2" />
                  </div>
                )}

                <Separator />

                {/* Dates */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Scheduled</p>
                    <p className="font-medium">{formatDate(review.scheduledDate)}</p>
                  </div>
                  {review.startedAt && (
                    <div>
                      <p className="text-muted-foreground mb-1">Started</p>
                      <p className="font-medium">{formatDate(review.startedAt)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground mb-1">Due Date</p>
                    <p className="font-medium">{formatDate(review.dueDate)}</p>
                  </div>
                  {review.completedAt && (
                    <div>
                      <p className="text-muted-foreground mb-1">Completed</p>
                      <p className="font-medium">{formatDate(review.completedAt)}</p>
                    </div>
                  )}
                </div>

                {/* Findings */}
                {review.findings && review.findings.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Findings ({review.findings.length})
                      </h4>
                      <div className="space-y-2">
                        {review.findings.map((finding) => (
                          <div key={finding.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getSeverityBadge(finding.severity)}
                                <Badge variant="outline" className="text-xs">
                                  {finding.category}
                                </Badge>
                              </div>
                              <Badge 
                                variant={finding.status === "resolved" ? "secondary" : "outline"}
                                className="text-xs"
                              >
                                {finding.status === "resolved" ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {finding.status.charAt(0).toUpperCase() + finding.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm mb-1">{finding.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Requirement: {finding.requirement}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {review.findings.length === 0 && review.status === "completed" && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        No findings - Excellent compliance!
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
