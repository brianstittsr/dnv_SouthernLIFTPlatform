"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, Filter, TrendingUp, FileText, Award, Building2, Calendar } from "lucide-react";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockQAQueue } from "@/lib/mock-data/qa-mock-data";

interface QueueItem {
  id: string;
  title: string;
  smeId: string;
  smeCompany?: string;
  userId: string;
  status: string;
  submittedAt: any;
  packHealth: {
    overallScore: number;
    completeness?: number;
    quality?: number;
    compliance?: number;
  };
  documentCount: number;
  categories?: string[];
  certifications?: string[];
  reviewedBy?: string;
}

export default function QAQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  
  const [minScore, setMinScore] = useState<string>("all");
  const [maxScore, setMaxScore] = useState<string>("all");

  useEffect(() => {
    if (useMockData) {
      setQueue(mockQAQueue as QueueItem[]);
      setLoading(false);
    } else {
      fetchQueue();
    }
  }, [useMockData, minScore, maxScore]);

  const fetchQueue = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "proofPacks"),
        where("status", "==", "submitted"),
        orderBy("submittedAt", "asc")
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QueueItem[];

      setQueue(items);
    } catch (err: any) {
      console.error("Error fetching queue:", err);
      setError(err.message || "Failed to load QA queue");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-yellow-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "High Quality" };
    if (score >= 70) return { variant: "secondary" as const, label: "Good" };
    return { variant: "outline" as const, label: "Needs Review" };
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Apply filters
  const filteredQueue = queue.filter(item => {
    const score = item.packHealth.overallScore;
    if (minScore !== "all" && score < parseInt(minScore)) return false;
    if (maxScore !== "all" && score > parseInt(maxScore)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading QA queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">QA Review Queue</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve submitted Proof Packs
            </p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter queue by Pack Health score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Min Score</label>
              <Select value={minScore} onValueChange={setMinScore}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="70">≥70</SelectItem>
                  <SelectItem value="80">≥80</SelectItem>
                  <SelectItem value="90">≥90</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max Score</label>
              <Select value={maxScore} onValueChange={setMaxScore}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="79">≤79</SelectItem>
                  <SelectItem value="89">≤89</SelectItem>
                  <SelectItem value="99">≤99</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredQueue.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredQueue.filter((item) => item.packHealth.overallScore >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">Score ≥80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredQueue.filter((item) => item.packHealth.overallScore < 75).length}
            </div>
            <p className="text-xs text-muted-foreground">Score &lt;75</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Proof Packs</CardTitle>
          <CardDescription>
            Sorted by submission date (oldest first) • Real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQueue.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No Proof Packs in queue</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((item) => {
                const healthBadge = getHealthBadge(item.packHealth.overallScore);
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <Badge variant={healthBadge.variant}>{healthBadge.label}</Badge>
                          </div>
                          {item.smeCompany && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Building2 className="h-4 w-4" />
                              <span>{item.smeCompany}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {formatDate(item.submittedAt)}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getHealthColor(item.packHealth.overallScore)}`}>
                            {item.packHealth.overallScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Pack Health</div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Documents</p>
                          <p className="text-sm font-semibold">{item.documentCount}</p>
                        </div>
                        {item.packHealth.completeness && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Completeness</p>
                            <p className="text-sm font-semibold">{item.packHealth.completeness}%</p>
                          </div>
                        )}
                        {item.packHealth.quality && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Quality</p>
                            <p className="text-sm font-semibold">{item.packHealth.quality}%</p>
                          </div>
                        )}
                        {item.packHealth.compliance && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Compliance</p>
                            <p className="text-sm font-semibold">{item.packHealth.compliance}%</p>
                          </div>
                        )}
                      </div>

                      {item.certifications && item.certifications.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Certifications
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.categories && item.categories.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Categories
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.categories.map((cat, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => router.push(`/portal/qa/review/${item.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review Proof Pack
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
