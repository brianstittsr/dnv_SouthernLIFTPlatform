"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, type SamgovOpportunityDoc, type AiTeamingRecommendationDoc } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ExternalLink, Clock, Handshake, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

function formatDeadline(deadline: Timestamp | null): { label: string; urgent: boolean } {
  if (!deadline) return { label: "No deadline listed", urgent: false };
  const date = deadline.toDate();
  const diffDays = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return { label: "Deadline passed", urgent: true };
  if (diffDays === 0) return { label: "Due today", urgent: true };
  if (diffDays <= 3) return { label: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`, urgent: true };
  return { label: `Due ${date.toLocaleDateString()}`, urgent: false };
}

export function SamgovOpportunitiesView({ initialTab = "opportunities" }: { initialTab?: "opportunities" | "teaming" }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<SamgovOpportunityDoc[]>([]);
  const [recommendations, setRecommendations] = useState<AiTeamingRecommendationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState<"not_reviewed" | "changes_requested" | "approved" | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
      if (!user) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId || !db) return;
    const currentUserId = userId;

    async function fetchData() {
      setLoading(true);
      try {
        const userDocSnap = await getDoc(doc(db!, COLLECTIONS.USERS, currentUserId));
        setReviewStatus(
          (userDocSnap.data()?.onboardingReviewStatus as "not_reviewed" | "changes_requested" | "approved" | undefined) ||
            "not_reviewed"
        );

        const oppSnap = await getDocs(
          query(collection(db!, COLLECTIONS.SAMGOV_OPPORTUNITIES), where("userId", "==", userId))
        );
        const opps = oppSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as SamgovOpportunityDoc))
          .filter((o) => !o.hidden)
          .sort((a, b) => b.matchScore - a.matchScore);
        setOpportunities(opps);

        const recSnap = await getDocs(
          query(collection(db!, COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS), where("forMemberId", "==", userId))
        );
        const recAsRequester = recSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AiTeamingRecommendationDoc));

        // Also find recommendations where this member is the recommended partner
        const allRecSnap = await getDocs(collection(db!, COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS));
        const recAsPartner = allRecSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as AiTeamingRecommendationDoc))
          .filter((r) => r.forMemberId !== userId && r.recommendations?.some((rec) => rec.memberId === userId));

        const combined = [...recAsRequester, ...recAsPartner];
        const dedupedMap = new Map(combined.map((r) => [r.id, r]));
        setRecommendations(Array.from(dedupedMap.values()));
      } catch (error) {
        console.error("Error loading SAM.gov data:", error);
        toast.error("Failed to load SAM.gov opportunities");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  async function respondToRecommendation(rec: AiTeamingRecommendationDoc, status: "interested" | "not-interested") {
    if (!db) return;
    try {
      const updatedRecs = rec.recommendations.map((r) =>
        r.memberId === userId || rec.forMemberId === userId
          ? { ...r, contacted: true, contactStatus: status }
          : r
      );
      await updateDoc(doc(db, COLLECTIONS.AI_TEAMMING_RECOMMENDATIONS, rec.id), {
        recommendations: updatedRecs,
        updatedAt: Timestamp.now(),
      });
      setRecommendations((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, recommendations: updatedRecs } : r))
      );
      toast.success(status === "interested" ? "Marked as interested" : "Marked as not interested");
    } catch (error) {
      console.error("Error updating recommendation:", error);
      toast.error("Failed to update recommendation");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Please sign in to view your SAM.gov opportunities.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          SAM.gov Opportunities
        </h1>
        <p className="text-muted-foreground">
          AI-matched federal opportunities and teaming recommendations based on your company profile.
        </p>
      </div>

      {reviewStatus !== "approved" ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Pending Admin Approval</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {reviewStatus === "changes_requested"
                ? "Our team requested a few profile updates before AI matching can be activated. Check your email or visit your Profile page for details."
                : "Our team is reviewing your onboarding profile. Once approved, AI-matched SAM.gov opportunities and teaming recommendations will appear here."}
            </p>
            <Button variant="outline" asChild className="mt-2">
              <Link href="/portal/profile">Go to Profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="teaming">Teaming Recommendations ({recommendations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No active opportunities yet. Our AI reviews SAM.gov daily and will deliver matches here as they're found.
              </CardContent>
            </Card>
          ) : (
            opportunities.map((opp) => {
              const deadline = formatDeadline(opp.responseDeadline);
              return (
                <Card key={opp.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{opp.title}</CardTitle>
                        <CardDescription>{opp.agency || "Federal Agency"}</CardDescription>
                      </div>
                      <Badge variant="default" className="shrink-0">
                        {opp.matchScore}/100 Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {opp.naicsCode && <Badge variant="outline">NAICS {opp.naicsCode}</Badge>}
                      {opp.typeOfSetAsideDescription && (
                        <Badge variant="outline">{opp.typeOfSetAsideDescription}</Badge>
                      )}
                      <span className={`flex items-center gap-1 ${deadline.urgent ? "text-destructive font-medium" : ""}`}>
                        <Clock className="h-3.5 w-3.5" />
                        {deadline.label}
                      </span>
                    </div>
                    {opp.matchReasons?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Why this matches your profile:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                          {opp.matchReasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {opp.uiLink && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={opp.uiLink} target="_blank" rel="noopener noreferrer">
                          View on SAM.gov <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="teaming" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No teaming recommendations yet. Our AI will suggest complementary KDM Consortium partners as new opportunities are matched to you.
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => {
              const isRequester = rec.forMemberId === userId;
              const recEntry = rec.recommendations.find((r) => (isRequester ? true : r.memberId === userId));
              if (!recEntry) return null;
              return (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Handshake className="h-5 w-5 text-primary" />
                          {isRequester ? recEntry.companyName : "Teaming Opportunity"}
                        </CardTitle>
                        <CardDescription>
                          {isRequester
                            ? `Suggested partner for: ${rec.opportunityTitle}`
                            : `Someone may want to team with you on: ${rec.opportunityTitle}`}
                        </CardDescription>
                      </div>
                      <Badge>{recEntry.matchScore}/100 Fit</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recEntry.matchReasons?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Why we recommended this:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                          {recEntry.matchReasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {recEntry.contactStatus || "pending"}
                      </Badge>
                      {(!recEntry.contactStatus || recEntry.contactStatus === "pending") && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => respondToRecommendation(rec, "interested")}>
                            <ThumbsUp className="mr-1.5 h-3.5 w-3.5" /> Interested
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => respondToRecommendation(rec, "not-interested")}>
                            <ThumbsDown className="mr-1.5 h-3.5 w-3.5" /> Not Interested
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
