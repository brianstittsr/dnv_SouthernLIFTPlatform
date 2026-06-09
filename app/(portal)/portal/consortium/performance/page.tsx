"use client";

import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Handshake,
  FileText,
  DollarSign,
  Clock,
  Award,
  Users,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Mock performance data
const MOCK_PERFORMANCE = {
  totalOpportunitiesViewed: 47,
  totalPartnershipsInitiated: 12,
  totalProposalsSubmitted: 8,
  totalContractsWon: 3,
  totalContractValue: 2450000,
  averageResponseTime: 24, // hours
  partnershipSuccessRate: 25, // percentage
  engagementScore: 72, // 0-100
  lastActivityAt: new Date(),
};

const RECENT_ACTIVITIES = [
  {
    id: "1",
    type: "opportunity_viewed",
    title: "Viewed CNC Machining Contract",
    description: "$2.5M DoD contract opportunity",
    time: "2 hours ago",
    impact: "positive",
  },
  {
    id: "2",
    type: "partnership_initiated",
    title: "Initiated partnership with Acme Manufacturing",
    description: "For aerospace components RFP",
    time: "1 day ago",
    impact: "positive",
  },
  {
    id: "3",
    type: "proposal_submitted",
    title: "Submitted proposal for Defense Logistics RFP",
    description: "Value: $1.2M",
    time: "3 days ago",
    impact: "positive",
  },
  {
    id: "4",
    type: "contract_won",
    title: "Won contract: Electronics Assembly",
    description: "Value: $850K with DoD",
    time: "1 week ago",
    impact: "high",
  },
];

const ENGAGEMENT_METRICS = [
  {
    label: "Opportunity Engagement",
    value: 47,
    total: 100,
    color: "bg-blue-500",
    icon: Target,
  },
  {
    label: "Partnership Activity",
    value: 12,
    total: 20,
    color: "bg-green-500",
    icon: Handshake,
  },
  {
    label: "Proposal Submission",
    value: 8,
    total: 15,
    color: "bg-purple-500",
    icon: FileText,
  },
  {
    label: "Contract Success",
    value: 3,
    total: 10,
    color: "bg-amber-500",
    icon: DollarSign,
  },
];

export default function ConsortiumPerformancePage() {
  const { profile } = useUserProfile();

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <Award className="h-4 w-4 text-amber-600" />;
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "neutral":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-amber-100 text-amber-800">High Impact</Badge>;
      case "positive":
        return <Badge className="bg-green-100 text-green-800">Positive</Badge>;
      case "neutral":
        return <Badge variant="secondary">Neutral</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your consortium engagement and performance metrics
        </p>
      </div>

      {/* Engagement Score Card */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Engagement Score</CardTitle>
                <CardDescription>
                  Your overall consortium engagement activity
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-amber-600">
                {MOCK_PERFORMANCE.engagementScore}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={MOCK_PERFORMANCE.engagementScore} className="h-3" />
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">
              +12% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opportunities Viewed
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PERFORMANCE.totalOpportunitiesViewed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 inline mr-1 text-green-600" />
              +8 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partnerships Initiated
            </CardTitle>
            <Handshake className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PERFORMANCE.totalPartnershipsInitiated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 inline mr-1 text-green-600" />
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Proposals Submitted
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PERFORMANCE.totalProposalsSubmitted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <ArrowUp className="h-3 w-3 inline mr-1 text-green-600" />
              +1 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contracts Won
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_PERFORMANCE.totalContractsWon}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(MOCK_PERFORMANCE.totalContractValue / 1000000).toFixed(1)}M total value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Engagement Metrics Breakdown
          </CardTitle>
          <CardDescription>
            Your activity across different consortium engagement areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {ENGAGEMENT_METRICS.map((metric) => {
              const Icon = metric.icon;
              const percentage = (metric.value / metric.total) * 100;
              return (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {metric.value} / {metric.total}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Average Response Time
            </CardTitle>
            <CardDescription>
              Time to respond to opportunities and partnership requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_PERFORMANCE.averageResponseTime}h</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                3h faster than average
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Partnership Success Rate
            </CardTitle>
            <CardDescription>
              Percentage of partnerships that result in collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_PERFORMANCE.partnershipSuccessRate}%</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                +5% from last quarter
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest consortium activities and their impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">{getImpactIcon(activity.impact)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    {getImpactBadge(activity.impact)}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>
            AI-powered recommendations to increase your engagement score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  View more opportunities in your target NAICS codes
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Increasing opportunity views by 20% could boost your engagement score by 5 points
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Handshake className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Initiate more partnerships with complementary capabilities
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Partnerships with companies in different pillars increase collaboration opportunities
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Respond to partnership requests within 24 hours
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Faster response times improve partnership success rates
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
