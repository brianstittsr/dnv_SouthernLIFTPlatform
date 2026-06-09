"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  Shield,
  Target,
  Award,
  MapPin,
  Building2,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";

// Mock ecosystem health data
const ECOSYSTEM_METRICS = {
  totalPartners: 127,
  activePartners: 98,
  averageReadinessScore: 82,
  averageAIMatchingScore: 85,
  totalEngagements: 342,
  conversionRate: 67,
  marketplaceListings: 156,
  activeInquiries: 23,
  partnerDistribution: {
    byRegion: [
      { region: "Northeast", count: 35, percentage: 28 },
      { region: "Mid-Atlantic", count: 28, percentage: 22 },
      { region: "Southeast", count: 25, percentage: 20 },
      { region: "Midwest", count: 18, percentage: 14 },
      { region: "West", count: 12, percentage: 10 },
      { region: "International", count: 9, percentage: 6 },
    ],
    byCapability: [
      { capability: "Manufacturing", count: 45, percentage: 35 },
      { capability: "Cybersecurity", count: 32, percentage: 25 },
      { capability: "Logistics", count: 28, percentage: 22 },
      { capability: "Engineering", count: 22, percentage: 17 },
    ],
    byReadiness: [
      { level: "Excellent (90+)", count: 38, percentage: 30 },
      { level: "Strong (75-89)", count: 45, percentage: 35 },
      { level: "Good (60-74)", count: 28, percentage: 22 },
      { level: "Needs Improvement (<60)", count: 16, percentage: 13 },
    ],
  },
  recentActivity: [
    { type: "new_partner", description: "Acme Manufacturing joined the consortium", time: "2 hours ago" },
    { type: "readiness_complete", description: "CyberShield Technologies achieved 92% readiness score", time: "4 hours ago" },
    { type: "ai_match", description: "3 new AI-powered teaming matches generated", time: "6 hours ago" },
    { type: "engagement", description: "Federal Logistics Partners engaged for E2G opportunity", time: "8 hours ago" },
    { type: "marketplace", description: "5 new capability listings published", time: "12 hours ago" },
  ],
  complianceMetrics: {
    totalSelectionRationales: 342,
    documentedRationales: 328,
    complianceRate: 96,
    averageRationaleQuality: 4.2,
  },
};

export default function EcosystemHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partner Ecosystem Health Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Whole Team Approach: Systematic, data-driven partner ecosystem for E2G delivery
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ECOSYSTEM_METRICS.totalPartners}</div>
              <div className="text-sm text-muted-foreground">Total Partners</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ECOSYSTEM_METRICS.averageReadinessScore}</div>
              <div className="text-sm text-muted-foreground">Avg Readiness Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ECOSYSTEM_METRICS.averageAIMatchingScore}</div>
              <div className="text-sm text-muted-foreground">Avg AI Match Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-amber-100 p-3">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ECOSYSTEM_METRICS.conversionRate}%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Whole Team Approach Summary */}
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Whole Team Approach Implementation
          </CardTitle>
          <CardDescription>
            Systematic, technology-enabled, data-driven partner ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Structured Company Intelligence
              </h4>
              <p className="text-sm text-muted-foreground">
                {ECOSYSTEM_METRICS.activePartners} partners with complete profiles containing verified organizational data from onboarding
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Automated Qualification Validation
              </h4>
              <p className="text-sm text-muted-foreground">
                Readiness scores calculated through document validation and qualification verification
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                AI-Powered Capability Matching
              </h4>
              <p className="text-sm text-muted-foreground">
                Strategic alignment of partners to program needs through AI matching algorithms
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                Single System of Record
              </h4>
              <p className="text-sm text-muted-foreground">
                {ECOSYSTEM_METRICS.totalEngagements} engagements tracked with transparent audit trail
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Distribution */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* By Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              By Region
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ECOSYSTEM_METRICS.partnerDistribution.byRegion.map((item) => (
              <div key={item.region}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.region}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Capability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              By Capability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ECOSYSTEM_METRICS.partnerDistribution.byCapability.map((item) => (
              <div key={item.capability}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.capability}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              By Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ECOSYSTEM_METRICS.partnerDistribution.byReadiness.map((item) => (
              <div key={item.level}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.level}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Federal Compliance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Federal Compliance & Accountability
          </CardTitle>
          <CardDescription>
            Transparent audit trail for SBA confidence in E2G investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-green-600">{ECOSYSTEM_METRICS.complianceMetrics.complianceRate}%</div>
              <div className="text-sm text-muted-foreground mt-1">Compliance Rate</div>
              <p className="text-xs text-muted-foreground mt-2">
                Selection rationales documented
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{ECOSYSTEM_METRICS.complianceMetrics.totalSelectionRationales}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Engagements</div>
              <p className="text-xs text-muted-foreground mt-2">
                Partner selections tracked
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{ECOSYSTEM_METRICS.complianceMetrics.documentedRationales}</div>
              <div className="text-sm text-muted-foreground mt-1">Documented</div>
              <p className="text-xs text-muted-foreground mt-2">
                With selection rationale
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{ECOSYSTEM_METRICS.complianceMetrics.averageRationaleQuality}/5</div>
              <div className="text-sm text-muted-foreground mt-1">Avg Quality</div>
              <p className="text-xs text-muted-foreground mt-2">
                Rationale detail score
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Transparency & Accountability:</strong> Every partner selection is documented with selection rationale, meeting logs, and engagement tracking. This creates a transparent audit trail showing how and why each partner was selected for E2G roles, supporting federal compliance requirements and giving SBA confidence that federal E2G investment is directed through a rigorously evaluated ecosystem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Marketplace & Capability Exchange
          </CardTitle>
          <CardDescription>
            Curated, quality-controlled environment for partner discovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{ECOSYSTEM_METRICS.marketplaceListings}</div>
              <div className="text-sm text-muted-foreground mt-1">Capability Listings</div>
              <p className="text-xs text-muted-foreground mt-2">
                Verified capability descriptions
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{ECOSYSTEM_METRICS.activeInquiries}</div>
              <div className="text-sm text-muted-foreground mt-1">Active Inquiries</div>
              <p className="text-xs text-muted-foreground mt-2">
                Partner engagement tracking
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Quality Controlled</div>
              <p className="text-xs text-muted-foreground mt-2">
                Backed by verified data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Ecosystem Activity
          </CardTitle>
          <CardDescription>
            Continuous improvement and partner ecosystem growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ECOSYSTEM_METRICS.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="mt-0.5">
                  {activity.type === "new_partner" && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === "readiness_complete" && <Shield className="h-4 w-4 text-green-600" />}
                  {activity.type === "ai_match" && <Target className="h-4 w-4 text-purple-600" />}
                  {activity.type === "engagement" && <Award className="h-4 w-4 text-amber-600" />}
                  {activity.type === "marketplace" && <Building2 className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scalability Note */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ready to Scale Across New Regions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-900">
            The KDM Consortium Intelligence and Partner Vetting Platform is built, operational, and ready to scale as the replicable model for rural America expands. The systematic, technology-enabled approach ensures that every organization delivering growth, training, and consulting services to rural manufacturers has been rigorously evaluated and strategically aligned to program needs. This gives SBA confidence that federal E2G investment is directed through a transparent, accountable, and continuously improving partner ecosystem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
