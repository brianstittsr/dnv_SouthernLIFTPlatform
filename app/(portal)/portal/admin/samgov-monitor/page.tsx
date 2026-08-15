"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
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
import { Loader2, ExternalLink, Search, Handshake, Target } from "lucide-react";

interface EnrichedOpportunity extends SamgovOpportunityDoc {
  memberName: string;
  memberEmail: string;
}

interface EnrichedRecommendation extends AiTeamingRecommendationDoc {
  requesterName: string;
}

export default function SamgovMonitorPage() {
  const [opportunities, setOpportunities] = useState<EnrichedOpportunity[]>([]);
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">SAM.gov Integration Monitor</h1>
        <p className="text-muted-foreground">
          All AI-matched opportunities pushed to members and AI teaming recommendations generated.
        </p>
      </div>

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
