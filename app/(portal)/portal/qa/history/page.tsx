"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Clock,
  Award,
  User
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockReviewHistory } from "@/lib/mock-data/qa-mock-data";

interface ReviewHistoryItem {
  id: string;
  proofPackId: string;
  proofPackTitle: string;
  smeId: string;
  smeCompany: string;
  reviewerId: string;
  reviewerName: string;
  reviewDate: any;
  decision: "approved" | "approved_with_conditions" | "rejected";
  packHealth: {
    overallScore: number;
    completeness?: number;
    quality?: number;
    compliance?: number;
  };
  documentCount: number;
  certifications?: string[];
  reviewNotes: string;
  findings?: any[];
  reviewDuration?: number;
}

export default function ReviewHistoryPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewHistoryItem[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [decisionFilter, setDecisionFilter] = useState<string>("all");

  useEffect(() => {
    if (useMockData) {
      setReviews(mockReviewHistory as ReviewHistoryItem[]);
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
        where("decision", "in", ["approved", "approved_with_conditions", "rejected"]),
        orderBy("reviewDate", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ReviewHistoryItem[];
      setReviews(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load review history");
    } finally {
      setLoading(false);
    }
  };

  const getDecisionBadge = (decision: string) => {
    const configs: Record<string, any> = {
      approved: { variant: "default", icon: CheckCircle2, label: "Approved", color: "text-green-600" },
      approved_with_conditions: { variant: "secondary", icon: AlertCircle, label: "Approved with Conditions", color: "text-yellow-600" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected", color: "text-red-600" },
    };
    const config = configs[decision] || configs.approved;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Apply filters
  const filteredReviews = reviews.filter(review => {
    if (decisionFilter !== "all" && review.decision !== decisionFilter) return false;
    return true;
  });

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
            <h1 className="text-3xl font-bold">Review History</h1>
            <p className="text-muted-foreground">View completed QA reviews and decisions</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter reviews by decision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Decision</label>
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="approved_with_conditions">Approved with Conditions</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReviews.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReviews.filter(r => r.decision === "approved").length}
            </div>
            <p className="text-xs text-muted-foreground">Full approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conditional</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReviews.filter(r => r.decision === "approved_with_conditions").length}
            </div>
            <p className="text-xs text-muted-foreground">With conditions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReviews.filter(r => r.decision === "rejected").length}
            </div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Review History Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Reviews</CardTitle>
          <CardDescription>Historical record of all QA reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No completed reviews found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{review.proofPackTitle}</h3>
                          {getDecisionBadge(review.decision)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{review.smeCompany}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Reviewed by {review.reviewerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(review.reviewDate)}</span>
                          </div>
                          {review.reviewDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(review.reviewDuration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getHealthColor(review.packHealth.overallScore)}`}>
                          {review.packHealth.overallScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Pack Health</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Documents</p>
                        <p className="text-sm font-semibold">{review.documentCount}</p>
                      </div>
                      {review.packHealth.completeness && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Completeness</p>
                          <p className="text-sm font-semibold">{review.packHealth.completeness}%</p>
                        </div>
                      )}
                      {review.packHealth.quality && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Quality</p>
                          <p className="text-sm font-semibold">{review.packHealth.quality}%</p>
                        </div>
                      )}
                      {review.packHealth.compliance && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Compliance</p>
                          <p className="text-sm font-semibold">{review.packHealth.compliance}%</p>
                        </div>
                      )}
                    </div>

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

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Review Notes</p>
                      <p className="text-sm text-muted-foreground">{review.reviewNotes}</p>
                    </div>

                    {review.findings && review.findings.length > 0 && (
                      <div>
                        <Separator className="my-4" />
                        <p className="text-sm font-medium mb-3">Findings ({review.findings.length})</p>
                        <div className="space-y-3">
                          {review.findings.map((finding) => (
                            <div key={finding.id} className="p-3 bg-muted rounded-lg">
                              <div className="flex items-start gap-2 mb-2">
                                <Badge 
                                  variant={finding.severity === "critical" ? "destructive" : finding.severity === "major" ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {finding.severity}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {finding.category}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">{finding.description}</p>
                              <p className="text-xs text-muted-foreground">Requirement: {finding.requirement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
