"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingUp, Users, Calendar, DollarSign, CheckCircle2, Clock, Building2, MessageSquare, FileText, Star } from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockBuyerDashboardStats } from "@/lib/mock-data/buyer-mock-data";

interface DashboardStats {
  activeIntroductions: number;
  pendingResponses: number;
  scheduledMeetings: number;
  closedDeals: number;
  totalSpend: number;
  savedSMEs: number;
  sharedProofPacks: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: any;
    smeCompany?: string;
    partnerName?: string;
  }>;
}

export default function BuyerDashboardPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setStats(mockBuyerDashboardStats as DashboardStats);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      // Fetch introductions
      const introsQuery = query(
        collection(db, "introductions"),
        where("buyerId", "==", profile.id)
      );
      const introsSnapshot = await getDocs(introsQuery);
      const introductions = introsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const activeIntros = introductions.filter((i: any) => i.status === "accepted").length;
      const pendingIntros = introductions.filter((i: any) => i.status === "pending").length;
      const scheduledMeetings = introductions.filter((i: any) => i.stage === "meeting_scheduled").length;
      const closedDeals = introductions.filter((i: any) => i.stage === "closed_won").length;
      const totalSpend = introductions
        .filter((i: any) => i.stage === "closed_won")
        .reduce((sum: number, i: any) => sum + (i.estimatedValue || 0), 0);

      // Fetch saved SMEs
      const savedQuery = query(
        collection(db, "buyerFavorites"),
        where("buyerId", "==", profile.id)
      );
      const savedSnapshot = await getDocs(savedQuery);
      const savedSMEs = savedSnapshot.size;

      // Fetch shared proof packs
      const packsQuery = query(collection(db, "proofPacks"));
      const packsSnapshot = await getDocs(packsQuery);
      const sharedProofPacks = packsSnapshot.size;

      // Build recent activity from introductions
      const recentActivity = introductions
        .sort((a: any, b: any) => {
          const aTime = a.updatedAt?.toMillis() || a.requestedAt?.toMillis() || 0;
          const bTime = b.updatedAt?.toMillis() || b.requestedAt?.toMillis() || 0;
          return bTime - aTime;
        })
        .slice(0, 5)
        .map((intro: any) => ({
          id: intro.id,
          type: intro.status === "accepted" ? "introduction_accepted" : "introduction_sent",
          message: `${intro.status === "accepted" ? "Introduction accepted" : "Introduction sent"} to ${intro.smeCompany}`,
          timestamp: intro.respondedAt || intro.requestedAt,
          smeCompany: intro.smeCompany,
        }));

      setStats({
        activeIntroductions: activeIntros,
        pendingResponses: pendingIntros,
        scheduledMeetings,
        closedDeals,
        totalSpend,
        savedSMEs,
        sharedProofPacks,
        recentActivity,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "introduction_accepted": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "meeting_scheduled": return <Calendar className="h-4 w-4 text-blue-600" />;
      case "proposal_received": return <FileText className="h-4 w-4 text-purple-600" />;
      case "proof_pack_shared": return <Star className="h-4 w-4 text-yellow-600" />;
      case "contract_signed": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

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
            <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
            <p className="text-muted-foreground">Overview of your procurement activities</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {!stats ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Start by browsing the SME Directory to request introductions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Introductions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeIntroductions}</div>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingResponses}</div>
                <p className="text-xs text-muted-foreground">Awaiting SME response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Meetings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scheduledMeetings}</div>
                <p className="text-xs text-muted-foreground">Upcoming meetings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.closedDeals}</div>
                <p className="text-xs text-muted-foreground">Successfully closed</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalSpend)}</div>
                <p className="text-xs text-muted-foreground">From closed deals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved SMEs</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.savedSMEs}</div>
                <p className="text-xs text-muted-foreground">In your favorites</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Proof Packs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sharedProofPacks}</div>
                <p className="text-xs text-muted-foreground">Available to review</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest procurement activities</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, idx) => (
                    <div key={activity.id}>
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.message}
                          </p>
                          {activity.smeCompany && (
                            <p className="text-sm text-muted-foreground">
                              {activity.smeCompany}
                            </p>
                          )}
                          {activity.partnerName && (
                            <p className="text-sm text-muted-foreground">
                              via {activity.partnerName}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                      {idx < stats.recentActivity.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
