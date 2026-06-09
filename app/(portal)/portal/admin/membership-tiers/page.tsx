"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Target,
  Star,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  XCircle,
  Settings,
  Lock,
  Unlock,
  Award,
  Building2,
  Brain,
  MessageSquare,
  Calendar,
  BarChart3,
} from "lucide-react";

// Membership Tier Definitions
const MEMBERSHIP_TIERS = {
  founder: {
    name: "Founder Members",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Strategic leadership and governance partners invited by KDM",
    role: "Strategic leadership and governance partners invited by KDM",
    capabilities: [
      "Full admin access",
      "Consortium oversight",
      "Strategic planning (EOS VTO)",
      "Performance tracking",
      "Team management",
      "Marketplace oversight",
      "Analytics dashboard",
      "Membership tier management",
      "Partner vetting tools",
      "Ecosystem health monitoring",
    ],
    e2gApplication: "Core consortium leadership (E3S, V+, LogiCore, VCC, HCNC). Drive strategic direction, quality oversight, and program governance for E2G delivery.",
    accessLevel: "admin",
  },
  "core-capture": {
    name: "Core Capture Members",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "High-engagement partners actively pursuing opportunities through the consortium",
    role: "High-engagement partners actively pursuing opportunities through the consortium",
    capabilities: [
      "Full marketplace access",
      "AI-powered opportunity matching",
      "Teaming partner recommendations",
      "Proposal collaboration tools",
      "1-to-1 networking",
      "Event access",
      "Partner directory search",
      "Inquiry tracking",
      "Engagement analytics",
      "Readiness score tracking",
    ],
    e2gApplication: "Active service providers delivering growth, training, and consulting to E2G firms. Vetted through full onboarding and continuously evaluated on performance.",
    accessLevel: "full",
  },
  elite: {
    name: "Elite Members",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Established partners contributing specialized expertise on an as-needed basis",
    role: "Established partners contributing specialized expertise on an as-needed basis",
    capabilities: [
      "Marketplace listings",
      "Opportunity search",
      "Networking",
      "Resource access",
      "Capability promotion",
      "Consortium directory visibility",
      "Basic analytics",
      "Event attendance",
    ],
    e2gApplication: "National SME Network contributors and regional specialists deployed for specific E2G engagements based on AI-matched capability alignment.",
    accessLevel: "standard",
  },
  standard: {
    name: "Standard Members",
    icon: Users,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "Basic consortium membership with limited access",
    role: "Basic consortium membership",
    capabilities: [
      "Consortium directory visibility",
      "Basic networking",
      "Event attendance",
      "Resource library access",
    ],
    e2gApplication: "Entry-level members exploring consortium participation and potential E2G engagement opportunities.",
    accessLevel: "basic",
  },
};

// Mock member data by tier
const MOCK_MEMBERS_BY_TIER = {
  founder: [
    { id: "1", name: "Robert Frost", company: "KDM & Associates", joined: "2024-01-15", status: "active" },
    { id: "2", name: "Sarah Chen", company: "E3S Solutions", joined: "2024-02-01", status: "active" },
  ],
  "core-capture": [
    { id: "3", name: "Acme Manufacturing", company: "Acme Manufacturing Solutions", joined: "2024-03-15", status: "active" },
    { id: "4", name: "CyberShield Technologies", company: "CyberShield Technologies", joined: "2024-04-01", status: "active" },
    { id: "5", name: "Federal Logistics Partners", company: "Federal Logistics Partners", joined: "2024-04-20", status: "active" },
  ],
  elite: [
    { id: "6", name: "Precision Components Inc", company: "Precision Components Inc", joined: "2024-05-01", status: "active" },
    { id: "7", name: "Integrated Defense Systems", company: "Integrated Defense Systems", joined: "2024-05-15", status: "active" },
  ],
  standard: [
    { id: "8", name: "Regional Manufacturing Co", company: "Regional Manufacturing Co", joined: "2024-06-01", status: "pending" },
  ],
};

export default function MembershipTiersPage() {
  const [selectedTier, setSelectedTier] = useState<keyof typeof MEMBERSHIP_TIERS>("core-capture");

  const TierCard = ({ tierKey, tier }: { tierKey: keyof typeof MEMBERSHIP_TIERS; tier: typeof MEMBERSHIP_TIERS[keyof typeof MEMBERSHIP_TIERS] }) => {
    const Icon = tier.icon;
    const members = MOCK_MEMBERS_BY_TIER[tierKey] || [];
    
    return (
      <Card className={`${tier.borderColor} ${tier.bgColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-lg ${tier.bgColor} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${tier.color}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {tier.name}
                  <Badge variant="outline" className="text-xs capitalize">
                    {tier.accessLevel}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">{tier.description}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Platform Capabilities</p>
            <div className="space-y-2">
              {tier.capabilities.map((capability, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-white/50 rounded-lg">
            <p className="text-sm font-medium mb-1">E2G Application</p>
            <p className="text-xs text-muted-foreground">{tier.e2gApplication}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Current Members ({members.length})</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.company}</p>
                  </div>
                  <Badge variant={member.status === "active" ? "default" : "secondary"} className="text-xs">
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CapabilityComparison = () => {
    const allCapabilities = Array.from(
      new Set(
        Object.values(MEMBERSHIP_TIERS).flatMap((tier) => tier.capabilities)
      )
    ).sort();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Capability Comparison
          </CardTitle>
          <CardDescription>
            Compare platform capabilities across membership tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Capability</th>
                  <th className="text-center p-3 font-medium text-purple-600">Founder</th>
                  <th className="text-center p-3 font-medium text-blue-600">Core Capture</th>
                  <th className="text-center p-3 font-medium text-amber-600">Elite</th>
                  <th className="text-center p-3 font-medium text-gray-600">Standard</th>
                </tr>
              </thead>
              <tbody>
                {allCapabilities.map((capability) => (
                  <tr key={capability} className="border-b hover:bg-muted/50">
                    <td className="p-3 text-sm">{capability}</td>
                    <td className="p-3 text-center">
                      {MEMBERSHIP_TIERS.founder.capabilities.includes(capability) ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {MEMBERSHIP_TIERS["core-capture"].capabilities.includes(capability) ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {MEMBERSHIP_TIERS.elite.capabilities.includes(capability) ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {MEMBERSHIP_TIERS.standard.capabilities.includes(capability) ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AccessControlMatrix = () => {
    const accessLevels = [
      { feature: "Admin Dashboard", icon: Settings },
      { feature: "Membership Management", icon: Users },
      { feature: "Partner Vetting Tools", icon: Shield },
      { feature: "Marketplace Oversight", icon: Building2 },
      { feature: "AI Matching", icon: Brain },
      { feature: "Inquiry Tracking", icon: MessageSquare },
      { feature: "Event Management", icon: Calendar },
      { feature: "Analytics Dashboard", icon: BarChart3 },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Access Control Matrix
          </CardTitle>
          <CardDescription>
            Platform feature access by membership tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessLevels.map((item) => (
              <div key={item.feature} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 font-medium">{item.feature}</div>
                <div className="flex gap-2">
                  <Badge variant={MEMBERSHIP_TIERS.founder.capabilities.includes(item.feature.toLowerCase()) ? "default" : "secondary"} className="text-xs">
                    Founder
                  </Badge>
                  <Badge variant={MEMBERSHIP_TIERS["core-capture"].capabilities.includes(item.feature.toLowerCase()) ? "default" : "secondary"} className="text-xs">
                    Core
                  </Badge>
                  <Badge variant={MEMBERSHIP_TIERS.elite.capabilities.includes(item.feature.toLowerCase()) ? "default" : "secondary"} className="text-xs">
                    Elite
                  </Badge>
                  <Badge variant={MEMBERSHIP_TIERS.standard.capabilities.includes(item.feature.toLowerCase()) ? "default" : "secondary"} className="text-xs">
                    Standard
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Membership Tiers</h1>
        <p className="text-muted-foreground mt-1">
          Manage tiered membership structure and access controls
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Founder Members</p>
                <p className="text-2xl font-bold">{MOCK_MEMBERS_BY_TIER.founder.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Core Capture</p>
                <p className="text-2xl font-bold">{MOCK_MEMBERS_BY_TIER["core-capture"].length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Elite Members</p>
                <p className="text-2xl font-bold">{MOCK_MEMBERS_BY_TIER.elite.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Standard Members</p>
                <p className="text-2xl font-bold">{MOCK_MEMBERS_BY_TIER.standard.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Capability Comparison</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(MEMBERSHIP_TIERS).map(([tierKey, tier]) => (
              <TierCard key={tierKey} tierKey={tierKey as keyof typeof MEMBERSHIP_TIERS} tier={tier} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <CapabilityComparison />
        </TabsContent>

        <TabsContent value="access">
          <AccessControlMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}
