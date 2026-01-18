"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Filter, TrendingUp } from "lucide-react";

interface QueueItem {
  id: string;
  title: string;
  smeId: string;
  userId: string;
  submittedAt: any;
  packHealth: {
    overallScore: number;
  };
  documentCount: number;
  reviewedBy?: string;
}

export default function QAQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  
  const [minScore, setMinScore] = useState<string>("all");
  const [maxScore, setMaxScore] = useState<string>("all");

  useEffect(() => {
    fetchQueue();
    setupRealtimeListener();
  }, [minScore, maxScore]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams();
      if (minScore !== "all") params.append("minScore", minScore);
      if (maxScore !== "all") params.append("maxScore", maxScore);

      const response = await fetch(`/api/qa/queue?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch QA queue");

      const data = await response.json();
      setQueue(data.queue || []);
    } catch (err: any) {
      setError(err.message || "Failed to load QA queue");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!db) return;

    const q = query(
      collection(db, "proofPacks"),
      where("status", "==", "submitted"),
      orderBy("submittedAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QueueItem[];

        setQueue(items);
      },
      (err) => {
        console.error("Error listening to queue:", err);
      }
    );

    return () => unsubscribe();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-yellow-600";
  };

  if (loading && queue.length === 0) {
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
        <h1 className="text-3xl font-bold">QA Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve submitted Proof Packs
        </p>
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
            <div className="text-2xl font-bold">{queue.length}</div>
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
              {queue.filter((item) => item.packHealth.overallScore >= 80).length}
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
              {queue.filter((item) => item.packHealth.overallScore < 75).length}
            </div>
            <p className="text-xs text-muted-foreground">Score &lt;75</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Proof Packs</CardTitle>
          <CardDescription>
            Sorted by submission date (oldest first) • Real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Proof Packs in queue</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>SME ID</TableHead>
                  <TableHead>Pack Health</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="font-mono text-xs">{item.smeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getHealthColor(item.packHealth.overallScore)}`}>
                          {item.packHealth.overallScore}
                        </span>
                        {item.packHealth.overallScore >= 70 && (
                          <Badge variant="default">Eligible</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.documentCount}</TableCell>
                    <TableCell>
                      {new Date(
                        item.submittedAt?.toDate
                          ? item.submittedAt.toDate()
                          : item.submittedAt
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/portal/qa/review/${item.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
