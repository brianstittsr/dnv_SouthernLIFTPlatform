"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  ClipboardCheck, 
  DollarSign, 
  TrendingUp,
  Activity,
  GraduationCap,
  AlertCircle
} from "lucide-react";

export default function SVPAdminDashboard() {
  const stats = [
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
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">SVP Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform metrics and system health
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          SVP Admin
        </Badge>
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
