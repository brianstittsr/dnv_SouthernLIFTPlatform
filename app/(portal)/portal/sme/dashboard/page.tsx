"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  Users,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { 
  mockSMEDashboardStats,
  mockSMEIntroductions,
  mockSMERecentActivity,
  mockSMEProofPacks,
  mockSMEPerformanceMetrics
} from "@/lib/mock-data/sme-mock-data";
import Link from "next/link";

export default function SMEDashboardPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [introductions, setIntroductions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [proofPacks, setProofPacks] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadMockData = () => {
    setStats(mockSMEDashboardStats);
    setIntroductions(mockSMEIntroductions);
    setRecentActivity(mockSMERecentActivity);
    setProofPacks(mockSMEProofPacks);
    setPerformanceMetrics(mockSMEPerformanceMetrics);
    setLoading(false);
  };

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      
      // Load introductions
      const introsQuery = query(
        collection(db, "introductions"),
        where("smeId", "==", profile.id)
      );
      const introsSnapshot = await getDocs(introsQuery);
      const introsData = introsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setIntroductions(introsData);

      // Calculate stats from live data
      const activeIntros = introsData.filter((i: any) => i.status === "accepted" && i.stage !== "award").length;
      const pendingIntros = introsData.filter((i: any) => i.status === "pending").length;
      const totalRevenue = introsData
        .filter((i: any) => i.stage === "award")
        .reduce((sum: number, i: any) => sum + (i.estimatedValue || 0), 0);

      setStats({
        activeIntroductions: activeIntros,
        pendingResponses: pendingIntros,
        totalRevenue,
        monthlyRevenue: 0, // Would need time-based calculation
        proofPackViews: 0,
        profileViews: 0,
        certifications: 0,
        completionRate: 0,
      });

      // Load recent activity (would need separate collection)
      setRecentActivity([]);
      setProofPacks([]);
      setPerformanceMetrics(null);
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getTimeSince = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(timestamp);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", icon: Clock, color: "text-yellow-600" },
      accepted: { variant: "default", icon: CheckCircle2, color: "text-green-600" },
      declined: { variant: "destructive", icon: XCircle, color: "text-red-600" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      introduction_received: Clock,
      meeting_scheduled: Calendar,
      proposal_submitted: FileText,
      contract_signed: CheckCircle2,
      proof_pack_viewed: Eye,
      profile_updated: Activity,
    };
    return icons[type] || Activity;
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
            <h1 className="text-3xl font-bold">SME Dashboard</h1>
            <p className="text-muted-foreground">Overview of your business performance</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Introductions</p>
                  <p className="text-2xl font-bold">{stats.activeIntroductions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Responses</p>
                  <p className="text-2xl font-bold">{stats.pendingResponses}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">{stats.profileViews}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Introductions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Introductions</CardTitle>
                  <CardDescription>Manage your buyer connections</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portal/sme/introductions">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {introductions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No active introductions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {introductions.slice(0, 3).map((intro) => (
                    <div key={intro.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{intro.buyerCompany}</h4>
                          <p className="text-sm text-muted-foreground">{intro.projectDescription}</p>
                        </div>
                        {getStatusBadge(intro.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(intro.estimatedValue)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(intro.requestedAt)}
                        </div>
                        {intro.priority && (
                          <Badge variant={intro.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                            {intro.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proof Packs */}
          {proofPacks.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Proof Packs</CardTitle>
                    <CardDescription>Your compliance documentation</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/portal/sme/proof-packs">Manage</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proofPacks.map((pack) => (
                    <div key={pack.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold">{pack.title}</h4>
                          <p className="text-sm text-muted-foreground">{pack.description}</p>
                        </div>
                        <Badge variant="default">{pack.packHealth.overallScore}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {pack.documentCount} docs
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {pack.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Updated {formatDate(pack.lastUpdated)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTimeSince(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Your key metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="text-sm font-semibold">{performanceMetrics.responseTime}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Acceptance Rate</span>
                    <span className="text-sm font-semibold">{performanceMetrics.acceptanceRate}%</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="text-sm font-semibold">{performanceMetrics.completionRate}%</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Avg Project Value</span>
                    <span className="text-sm font-semibold">{formatCurrency(performanceMetrics.averageProjectValue)}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="text-sm font-semibold">{performanceMetrics.customerSatisfaction}/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
