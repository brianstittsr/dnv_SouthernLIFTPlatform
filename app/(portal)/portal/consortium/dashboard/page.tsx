"use client";

import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Handshake,
  Target,
  FileText,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function ConsortiumDashboardPage() {
  const { profile } = useUserProfile();

  const stats = [
    {
      title: "Active Partnerships",
      value: "12",
      change: "+2 this month",
      icon: Handshake,
      color: "text-blue-600",
    },
    {
      title: "Opportunities",
      value: "8",
      change: "3 new this week",
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Proposals",
      value: "5",
      change: "2 in review",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Messages",
      value: "3",
      change: "1 unread",
      icon: MessageSquare,
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "partnership",
      title: "New partnership request from Acme Manufacturing",
      time: "2 hours ago",
      status: "pending",
    },
    {
      id: "2",
      type: "opportunity",
      title: "New opportunity: CNC Machining Contract - $2.5M",
      time: "5 hours ago",
      status: "new",
    },
    {
      id: "3",
      type: "proposal",
      title: "Proposal submitted for Aerospace Components RFP",
      time: "1 day ago",
      status: "submitted",
    },
    {
      id: "4",
      type: "meeting",
      title: "Weekly consortium meeting scheduled for Friday 3pm",
      time: "2 days ago",
      status: "scheduled",
    },
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Weekly Consortium Meeting",
      date: "Friday, June 6, 2025",
      time: "3:00 PM EST",
      description: "Discuss new opportunities and partnership updates",
    },
    {
      id: "2",
      title: "Proposal Review Session",
      date: "Monday, June 9, 2025",
      time: "10:00 AM EST",
      description: "Review Aerospace Components RFP proposal",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "submitted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case "submitted":
        return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consortium Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {profile.firstName || "Member"}! Here's your consortium overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest consortium activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Your scheduled consortium events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{event.title}</h4>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </p>
                    <p className="mt-2">{event.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for consortium members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Handshake className="h-6 w-6" />
              <span>Find Partners</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Target className="h-6 w-6" />
              <span>Browse Opportunities</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <FileText className="h-6 w-6" />
              <span>Create Proposal</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Users className="h-6 w-6" />
              <span>View Members</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
