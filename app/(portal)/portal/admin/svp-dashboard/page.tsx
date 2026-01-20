"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Package, 
  ClipboardCheck, 
  DollarSign, 
  TrendingUp,
  Activity,
  GraduationCap,
  AlertCircle,
  Loader2
} from "lucide-react";
import { mockDashboardStats, mockRecentActivity } from "@/lib/mock-data/svp-admin-mock-data";

export default function SVPAdminDashboard() {
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Proof Packs",
      value: "89",
      change: "+5%",
      icon: Package,
      trend: "up"
    },
    {
      title: "Pending QA Reviews",
      value: "23",
      change: "-8%",
      icon: ClipboardCheck,
      trend: "down"
    },
    {
      title: "Revenue This Month",
      value: "$45,678",
      change: "+18%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Active Cohorts",
      value: "12",
      change: "+3",
      icon: GraduationCap,
      trend: "up"
    },
    {
      title: "System Health",
      value: "98.5%",
      change: "Excellent",
      icon: Activity,
      trend: "up"
    }
  ]);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      loadRealData();
    }
  }, [useMockData]);

  const loadMockData = () => {
    setLoading(true);
    setStats([
      {
        title: "Total Users",
        value: mockDashboardStats.totalUsers.toString(),
        change: "+12%",
        icon: Users,
        trend: "up"
      },
      {
        title: "Active Proof Packs",
        value: mockDashboardStats.activeProofPacks.toString(),
        change: "+5%",
        icon: Package,
        trend: "up"
      },
      {
        title: "Pending QA Reviews",
        value: mockDashboardStats.pendingQAReviews.toString(),
        change: "-8%",
        icon: ClipboardCheck,
        trend: "down"
      },
      {
        title: "Revenue This Month",
        value: `$${mockDashboardStats.revenueThisMonth.toLocaleString()}`,
        change: "+18%",
        icon: DollarSign,
        trend: "up"
      },
      {
        title: "Active Cohorts",
        value: mockDashboardStats.activeCohorts.toString(),
        change: "+3",
        icon: GraduationCap,
        trend: "up"
      },
      {
        title: "System Health",
        value: `${mockDashboardStats.systemHealth}%`,
        change: "Excellent",
        icon: Activity,
        trend: "up"
      }
    ]);
    setLoading(false);
  };

  const loadRealData = async () => {
    if (!db) {
      loadMockData();
      return;
    }

    try {
      setLoading(true);

      // Fetch real data from Firebase
      const usersSnapshot = await getDocs(collection(db, "users"));
      const proofPacksSnapshot = await getDocs(collection(db, "proof_packs"));
      const cohortsSnapshot = await getDocs(collection(db, "cohorts"));

      const totalUsers = usersSnapshot.size;
      const activeProofPacks = proofPacksSnapshot.docs.filter(doc => 
        doc.data().status === "active" || doc.data().status === "pending"
      ).length;
      const activeCohorts = cohortsSnapshot.docs.filter(doc => 
        doc.data().status === "active" || doc.data().status === "enrolling"
      ).length;

      setStats([
        {
          title: "Total Users",
          value: totalUsers.toString(),
          change: "+12%",
          icon: Users,
          trend: "up"
        },
        {
          title: "Active Proof Packs",
          value: activeProofPacks.toString(),
          change: "+5%",
          icon: Package,
          trend: "up"
        },
        {
          title: "Pending QA Reviews",
          value: "0",
          change: "0%",
          icon: ClipboardCheck,
          trend: "up"
        },
        {
          title: "Revenue This Month",
          value: "$0",
          change: "0%",
          icon: DollarSign,
          trend: "up"
        },
        {
          title: "Active Cohorts",
          value: activeCohorts.toString(),
          change: "+3",
          icon: GraduationCap,
          trend: "up"
        },
        {
          title: "System Health",
          value: "99.9%",
          change: "Excellent",
          icon: Activity,
          trend: "up"
        }
      ]);
    } catch (error) {
      console.error("Error loading real data:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">SVP Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform metrics and system health
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="mock-data"
              checked={useMockData}
              onCheckedChange={setUseMockData}
            />
            <Label htmlFor="mock-data" className="cursor-pointer">
              {useMockData ? "Mock Data" : "Live Data"}
            </Label>
          </div>
          <Badge variant="default" className="text-sm">
            SVP Admin
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Package className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Proof pack submitted</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">QA review completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Scheduled Maintenance</p>
                  <p className="text-xs text-muted-foreground">
                    System maintenance scheduled for Sunday 2:00 AM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">High Traffic Detected</p>
                  <p className="text-xs text-muted-foreground">
                    Platform experiencing 150% normal traffic
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
