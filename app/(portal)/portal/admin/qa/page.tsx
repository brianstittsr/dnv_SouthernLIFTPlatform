"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardCheck, 
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from "lucide-react";

export default function QAManagementPage() {
  const stats = [
    {
      title: "Total Reviews",
      value: "342",
      change: "+23 this week",
      icon: ClipboardCheck
    },
    {
      title: "Active Reviewers",
      value: "12",
      change: "8 online now",
      icon: Users
    },
    {
      title: "Avg Review Time",
      value: "2.5 hrs",
      change: "-15% improvement",
      icon: Clock
    },
    {
      title: "Approval Rate",
      value: "87%",
      change: "+5% this month",
      icon: TrendingUp
    }
  ];

  const reviewers = [
    {
      name: "John Doe",
      email: "john@example.com",
      reviewsCompleted: 45,
      avgScore: 92,
      status: "active"
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      reviewsCompleted: 38,
      avgScore: 88,
      status: "active"
    },
    {
      name: "Mike Johnson",
      email: "mike@example.com",
      reviewsCompleted: 52,
      avgScore: 95,
      status: "offline"
    },
    {
      name: "Sarah Williams",
      email: "sarah@example.com",
      reviewsCompleted: 41,
      avgScore: 90,
      status: "active"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">QA Management</h1>
          <p className="text-muted-foreground">
            Manage quality assurance reviewers and review processes
          </p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add Reviewer
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="reviewers" className="mb-6">
        <TabsList>
          <TabsTrigger value="reviewers">QA Reviewers</TabsTrigger>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="reviewers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>QA Reviewers</CardTitle>
              <CardDescription>Manage quality assurance team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewers.map((reviewer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {reviewer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{reviewer.name}</h3>
                          <Badge variant={reviewer.status === 'active' ? 'default' : 'secondary'}>
                            {reviewer.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{reviewer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{reviewer.reviewsCompleted} reviews</p>
                        <p className="text-xs text-muted-foreground">Avg Score: {reviewer.avgScore}%</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Queue</CardTitle>
              <CardDescription>Pending proof packs awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Queue Management</h3>
                <p className="text-muted-foreground mb-4">
                  View and manage the review queue
                </p>
                <Button>Go to QA Queue</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>QA team performance analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed performance metrics and trends
                </p>
                <Button>View Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
