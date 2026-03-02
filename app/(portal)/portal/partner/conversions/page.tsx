"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, Users, CheckCircle, Clock, XCircle, Target, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockIntroductions } from "@/lib/mock-data/partner-mock-data";

interface Introduction {
  id: string;
  buyerId: string;
  buyerCompany: string;
  smeId: string;
  smeCompany: string;
  partnerId: string | null;
  status: "pending" | "accepted" | "declined";
  stage: "intro" | "meeting_scheduling" | "meeting_held" | "rfq_sent" | "proposal_submitted" | "award";
  estimatedValue?: number;
  requestedAt: any;
  respondedAt?: any;
  meetingDate?: any;
  createdAt: any;
  updatedAt: any;
}

const STAGE_ORDER = [
  "intro",
  "meeting_scheduling",
  "meeting_held",
  "rfq_sent",
  "proposal_submitted",
  "award"
];

const STAGE_LABELS: Record<string, string> = {
  intro: "Introduction",
  meeting_scheduling: "Meeting Scheduling",
  meeting_held: "Meeting Held",
  rfq_sent: "RFQ Sent",
  proposal_submitted: "Proposal Submitted",
  award: "Award"
};

export default function ConversionTrackingPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [introductions, setIntroductions] = useState<Introduction[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id, useMockData]);

  const loadData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock data
        setIntroductions(mockIntroductions as Introduction[]);
      } else {
        // Load live data from Firestore
        if (!db) {
          toast.error("Firebase not initialized");
          return;
        }
        const q = query(
          collection(db, "introductions"),
          where("partnerId", "==", profile.id)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Introduction));
        setIntroductions(data);
      }
    } catch (error) {
      console.error("Error loading conversion data:", error);
      toast.error("Failed to load conversion data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate funnel metrics
  const totalIntros = introductions.length;
  const acceptedIntros = introductions.filter(i => i.status === "accepted").length;
  const declinedIntros = introductions.filter(i => i.status === "declined").length;
  const pendingIntros = introductions.filter(i => i.status === "pending").length;

  const stageCounts = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = introductions.filter(i => i.stage === stage && i.status === "accepted").length;
    return acc;
  }, {} as Record<string, number>);

  const conversionRates = STAGE_ORDER.slice(1).map((stage, index) => {
    const prevStage = STAGE_ORDER[index];
    const prevCount = stageCounts[prevStage];
    const currentCount = stageCounts[stage];
    return prevCount > 0 ? (currentCount / prevCount) * 100 : 0;
  });

  const totalEstimatedValue = introductions
    .filter(i => i.estimatedValue)
    .reduce((sum, i) => sum + (i.estimatedValue || 0), 0);

  const wonDeals = introductions.filter(i => i.stage === "award").length;
  const wonValue = introductions
    .filter(i => i.stage === "award" && i.estimatedValue)
    .reduce((sum, i) => sum + (i.estimatedValue || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversion Tracking</h1>
          <p className="text-muted-foreground">Track your introduction funnel and conversion metrics</p>
        </div>
        <DataToggle onToggle={setUseMockData} defaultValue={false} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Introductions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIntros}</div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-green-600">{acceptedIntros} accepted</span>
              <span className="text-red-600">{declinedIntros} declined</span>
              <span className="text-yellow-600">{pendingIntros} pending</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalIntros > 0 ? ((acceptedIntros / totalIntros) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{acceptedIntros} of {totalIntros} accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wonDeals}</div>
            <p className="text-xs text-muted-foreground">
              {acceptedIntros > 0 ? ((wonDeals / acceptedIntros) * 100).toFixed(1) : 0}% close rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEstimatedValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">${wonValue.toLocaleString()} won</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Track introductions through each stage of the sales process</CardDescription>
        </CardHeader>
        <CardContent>
          {acceptedIntros === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No accepted introductions yet.</p>
              <p className="text-sm mt-2">Conversion metrics will appear once introductions are accepted.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {STAGE_ORDER.map((stage, index) => {
                const count = stageCounts[stage];
                const percentage = acceptedIntros > 0 ? (count / acceptedIntros) * 100 : 0;
                const conversionRate = index > 0 ? conversionRates[index - 1] : 100;
                
                return (
                  <div key={stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{STAGE_LABELS[stage]}</h4>
                          <p className="text-sm text-muted-foreground">
                            {count} introductions ({percentage.toFixed(1)}% of total)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{count}</div>
                        {index > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {conversionRate.toFixed(1)}% conversion
                          </p>
                        )}
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Introductions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Introductions</CardTitle>
          <CardDescription>Latest introduction requests and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {introductions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No introductions yet.</p>
              <p className="text-sm mt-2">Introductions you facilitate will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {introductions.slice(0, 10).map((intro) => (
                <Card key={intro.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {intro.buyerCompany} → {intro.smeCompany}
                        </CardTitle>
                        <CardDescription>
                          {intro.createdAt?.toDate?.()?.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            intro.status === "accepted"
                              ? "default"
                              : intro.status === "declined"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {intro.status === "accepted" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : intro.status === "declined" ? (
                            <XCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {intro.status}
                        </Badge>
                        {intro.status === "accepted" && (
                          <Badge variant="outline">{STAGE_LABELS[intro.stage]}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {(intro.estimatedValue || intro.meetingDate) && (
                    <CardContent className="pt-0">
                      <div className="flex gap-4 text-sm">
                        {intro.estimatedValue && (
                          <div>
                            <span className="text-muted-foreground">Est. Value:</span>
                            <p className="font-bold">${intro.estimatedValue.toLocaleString()}</p>
                          </div>
                        )}
                        {intro.meetingDate && (
                          <div>
                            <span className="text-muted-foreground">Meeting:</span>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {intro.meetingDate?.toDate?.()?.toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
