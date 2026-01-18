"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Package,
  Crown,
} from "lucide-react";

interface DashboardStats {
  proofPacksCount: number;
  activeLeadsCount: number;
  introductionsCount: number;
  upcomingEventsCount: number;
  profileCompleteness: number;
  subscriptionTier: string;
  packHealthAverage: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    proofPacksCount: 0,
    activeLeadsCount: 0,
    introductionsCount: 0,
    upcomingEventsCount: 0,
    profileCompleteness: 20,
    subscriptionTier: "free",
    packHealthAverage: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: "bg-gray-500",
      diy: "bg-blue-500",
      dwy: "bg-purple-500",
      dfy: "bg-orange-500",
    };
    return (
      <Badge className={colors[tier] || "bg-gray-500"}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress and manage your CMMC compliance journey
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Profile Completeness Alert */}
      {stats.profileCompleteness < 100 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your profile is {stats.profileCompleteness}% complete.{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/portal/profile")}
            >
              Complete your profile
            </Button>{" "}
            to unlock all features.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Your current plan and features</CardDescription>
            </div>
            {getTierBadge(stats.subscriptionTier)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {stats.subscriptionTier === "free"
                  ? "You're on the Free tier. Upgrade to unlock more features."
                  : `You have access to all ${stats.subscriptionTier.toUpperCase()} tier features.`}
              </p>
              {stats.subscriptionTier === "free" && (
                <p className="text-xs text-muted-foreground">
                  Limited to 3 Proof Packs • Basic Pack Health scoring
                </p>
              )}
            </div>
            <Button onClick={() => router.push("/portal/subscription")}>
              {stats.subscriptionTier === "free" ? "Upgrade Plan" : "Manage Subscription"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proof Packs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proofPacksCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.subscriptionTier === "free" ? "3 max on Free tier" : "Unlimited"}
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => router.push("/portal/proof-packs")}
            >
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeadsCount}</div>
            <p className="text-xs text-muted-foreground">
              Potential buyer connections
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => router.push("/portal/leads")}
            >
              View leads <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Introductions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.introductionsCount}</div>
            <p className="text-xs text-muted-foreground">
              Partner connections made
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => router.push("/portal/introductions")}
            >
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEventsCount}</div>
            <p className="text-xs text-muted-foreground">
              Cohorts and training
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2"
              onClick={() => router.push("/portal/events")}
            >
              View calendar <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completeness */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Completeness</CardTitle>
          <CardDescription>Complete your profile to improve matching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-bold">{stats.profileCompleteness}%</span>
              </div>
              <Progress value={stats.profileCompleteness} />
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Basic information added</span>
              </div>
              {stats.profileCompleteness >= 40 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Company description added</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Add company description</span>
                </div>
              )}
              {stats.profileCompleteness >= 60 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Certifications added</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Add certifications</span>
                </div>
              )}
              {stats.profileCompleteness >= 80 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Capabilities listed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Add capabilities and services</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/portal/profile")}
            >
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pack Health Overview */}
      {stats.proofPacksCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pack Health Overview</CardTitle>
            <CardDescription>Average health score across all Proof Packs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">
                  {stats.packHealthAverage.toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.packHealthAverage >= 70
                    ? "Good - Eligible for introductions"
                    : "Needs improvement"}
                </p>
              </div>
              <Button onClick={() => router.push("/portal/proof-packs")}>
                View Proof Packs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/portal/proof-packs/new")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create New Proof Pack
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/portal/profile")}
            >
              <Users className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/portal/events")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Browse Events
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/portal/subscription")}
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
