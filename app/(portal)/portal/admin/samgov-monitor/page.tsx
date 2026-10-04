"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { COLLECTIONS, type SamgovOpportunityDoc, type AiTeamingRecommendationDoc } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Search, Handshake, Target, PlayCircle, CheckCircle2, XCircle } from "lucide-react";

interface EnrichedOpportunity extends SamgovOpportunityDoc {
  memberName: string;
  memberEmail: string;
}

interface EnrichedRecommendation extends AiTeamingRecommendationDoc {
  requesterName: string;
}

interface SyncRun {
  id: string;
  triggeredBy: string;
  status: "running" | "completed" | "completed_with_errors";
  startedAt: string | null;
  finishedAt: string | null;
  results: {
    eligibleMembers?: number;
    opportunitiesFetched?: number;
    newMatchesDelivered?: number;
    teamingRecommendationsCreated?: number;
    errors?: string[];
    message?: string;
  } | null;
}

export default function SamgovMonitorPage() {
  const [opportunities, setOpportunities] = useState<EnrichedOpportunity[]>([]);
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  async function getIdToken(): Promise<string | null> {
    if (!auth) return null;
    if (auth.currentUser) return auth.currentUser.getIdToken();
    // Auth may not be resolved on first render — wait for it once
    return new Promise((resolve) => {
      const unsub = auth!.onAuthStateChanged(async (user) => {
        unsub();
        resolve(user ? user.getIdToken() : null);
      });
    });
  }

  async function fetchRuns() {
    try {
      const idToken = await getIdToken();
      if (!idToken) return;
      const res = await fetch("/api/admin/samgov/sync-now", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSyncRuns(data.runs || []);
    } catch (error) {
      console.error("Error loading sync runs:", error);
    }
  }

  async function runSyncNow() {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error("Not signed in");
      const res = await fetch("/api/admin/samgov/sync-now", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSyncFeedback(
        data.message ||
          `Sync complete: ${data.newMatchesDelivered ?? 0} new matches, ${data.teamingRecommendationsCreated ?? 0} teaming recs, ${data.eligibleMembers ?? 0} eligible members.${data.errors?.length ? ` (${data.errors.length} errors)` : ""}`
      );
    } catch (error) {
      setSyncFeedback(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
      await fetchRuns();
    }
  }

  useEffect(() => {
    async function fetchAll() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const [oppSnap, recSnap] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.SAMGOV_OPPORTUNITIES)),
          getDocs(collection(db, COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS)),
        ]);

        const userCache = new Map<string, { name: string; email: string }>();
        async function resolveUser(userId: string) {
          if (userCache.has(userId)) return userCache.get(userId)!;
          try {
            const userSnap = await getDoc(doc(db!, COLLECTIONS.USERS, userId));
            const data = userSnap.data();
            const resolved = {
              name: data ? [data.firstName, data.lastName].filter(Boolean).join(" ") || data.companyName || userId : userId,
              email: data?.email || "",
            };
            userCache.set(userId, resolved);
            return resolved;
          } catch {
            const fallback = { name: userId, email: "" };
            userCache.set(userId, fallback);
            return fallback;
          }
        }

        const opps: EnrichedOpportunity[] = [];
        for (const docSnap of oppSnap.docs) {
          const data = { id: docSnap.id, ...docSnap.data() } as SamgovOpportunityDoc;
          const member = await resolveUser(data.userId);
          opps.push({ ...data, memberName: member.name, memberEmail: member.email });
        }
        opps.sort((a, b) => b.deliveredAt.toMillis() - a.deliveredAt.toMillis());
        setOpportunities(opps);

        const recs: EnrichedRecommendation[] = [];
        for (const docSnap of recSnap.docs) {
          const data = { id: docSnap.id, ...docSnap.data() } as AiTeamingRecommendationDoc;
          const requester = await resolveUser(data.forMemberId);
          recs.push({ ...data, requesterName: requester.name });
        }
        recs.sort((a, b) => b.generatedAt.toMillis() - a.generatedAt.toMillis());
        setRecommendations(recs);
      } catch (error) {
        console.error("Error loading SAM.gov monitor data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
    fetchRuns();
  }, []);

  const filteredOpps = opportunities.filter(
    (o) =>
      !search ||
      o.title?.toLowerCase().includes(search.toLowerCase()) ||
      o.memberName?.toLowerCase().includes(search.toLowerCase()) ||
      o.memberEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">SAM.gov Integration Monitor</h1>
          <p className="text-muted-foreground">
            All AI-matched opportunities pushed to members and AI teaming recommendations generated.
          </p>
        </div>
        <Button onClick={runSyncNow} disabled={syncing}>
          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
          {syncing ? "Syncing…" : "Sync Now"}
        </Button>
      </div>

      {syncFeedback && (
        <p className="text-sm rounded-md border px-3 py-2 bg-muted/50">{syncFeedback}</p>
      )}

      {syncRuns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Sync Runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {syncRuns.map((run) => (
              <div key={run.id} className="flex flex-wrap items-center gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
                {run.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : run.status === "running" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-600" />
                )}
                <Badge variant="secondary" className="capitalize">{run.triggeredBy}</Badge>
                <span className="text-muted-foreground">
                  {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
                </span>
                <span className="text-muted-foreground">
                  {run.results
                    ? `${run.results.newMatchesDelivered ?? 0} new matches · ${run.results.eligibleMembers ?? 0} members · ${run.results.opportunitiesFetched ?? 0} fetched`
                    : run.status}
                </span>
                {run.results?.errors?.length ? (
                  <span className="text-xs text-amber-700">{run.results.errors.length} error(s)</span>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Opportunities Delivered</CardDescription>
            <CardTitle className="text-2xl">{opportunities.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Currently Active</CardDescription>
            <CardTitle className="text-2xl">{opportunities.filter((o) => !o.hidden).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Teaming Recommendations</CardDescription>
            <CardTitle className="text-2xl">{recommendations.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">
            <Target className="mr-1.5 h-4 w-4" /> Opportunities
          </TabsTrigger>
          <TabsTrigger value="teaming">
            <Handshake className="mr-1.5 h-4 w-4" /> Teaming Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by member or opportunity title..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOpps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No opportunities recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOpps.map((opp) => (
                        <TableRow key={opp.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{opp.memberName}</p>
                              <p className="text-xs text-muted-foreground">{opp.memberEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{opp.title}</TableCell>
                          <TableCell className="max-w-[160px] truncate">{opp.agency || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{opp.matchScore}/100</Badge>
                          </TableCell>
                          <TableCell>
                            {opp.responseDeadline ? opp.responseDeadline.toDate().toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell>
                            {opp.hidden ? (
                              <Badge variant="secondary">Hidden (expired)</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {opp.uiLink && (
                              <Link href={opp.uiLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 inline text-primary" />
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teaming" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Recommended Partner(s)</TableHead>
                      <TableHead>Match Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No teaming recommendations generated yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recommendations.map((rec) => (
                        <TableRow key={rec.id}>
                          <TableCell className="font-medium">{rec.requesterName}</TableCell>
                          <TableCell className="max-w-xs truncate">{rec.opportunityTitle}</TableCell>
                          <TableCell>
                            {rec.recommendations.map((r) => (
                              <div key={r.memberId} className="text-sm">
                                {r.companyName}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>
                            {rec.recommendations[0] && <Badge variant="outline">{rec.recommendations[0].matchScore}/100</Badge>}
                          </TableCell>
                          <TableCell>
                            {rec.recommendations.map((r) => (
                              <Badge key={r.memberId} variant="secondary" className="capitalize mr-1">
                                {r.contactStatus || "pending"}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>{rec.generatedAt.toDate().toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
