"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle,
  Zap,
  Settings,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Users,
  Award,
  Shield,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

// Mock consortium members data
const MOCK_MEMBERS = [
  {
    id: "1",
    name: "Acme Manufacturing Solutions",
    logo: "",
    aiMatchingScore: 92,
    readinessScore: 88,
    companyIntelligenceComplete: true,
    strengths: [
      "Advanced CNC machining capabilities",
      "ISO 9001:2015 certified",
      "Strong DoD contract history",
      "CMMC Level 2 certified",
    ],
    deficiencies: [
      "Limited experience with GSA schedules",
      "Geographic coverage limited to Northeast",
    ],
    teamingRecommendations: [
      "Partner with electronics assembly firms for complete solutions",
      "Consider joint ventures with logistics providers",
    ],
    naicsCodes: ["332710", "332720", "333120"],
    certifications: ["ISO 9001", "CMMC Level 2", "8(a)"],
    regions: ["Northeast", "Mid-Atlantic"],
    contractSizes: ["$1M-5M", "$5M-10M"],
  },
  {
    id: "2",
    name: "CyberShield Technologies",
    logo: "",
    aiMatchingScore: 88,
    readinessScore: 92,
    companyIntelligenceComplete: true,
    strengths: [
      "CMMC Level 3 certified",
      "Expert cybersecurity team",
      "Federal clearance holders",
      "Strong software development capabilities",
    ],
    deficiencies: [
      "Limited manufacturing capabilities",
      "Small team size limits large contracts",
    ],
    teamingRecommendations: [
      "Partner with hardware manufacturers for integrated solutions",
      "Teaming with larger primes for major contracts",
    ],
    naicsCodes: ["541512", "541511", "334290"],
    certifications: ["CMMC Level 3", "ISO 27001", "SDVOSB"],
    regions: ["National"],
    contractSizes: ["$500K-1M", "$1M-5M"],
  },
  {
    id: "3",
    name: "Federal Logistics Partners",
    logo: "",
    aiMatchingScore: 85,
    readinessScore: 78,
    companyIntelligenceComplete: true,
    strengths: [
      "Extensive supply chain network",
      "GSA Schedule holder",
      "Large geographic coverage",
      "Proven track record with DoD",
    ],
    deficiencies: [
      "Limited technical capabilities",
      "No CMMC certification",
    ],
    teamingRecommendations: [
      "Partner with technology firms for value-added services",
      "Consider CMMC certification for cybersecurity contracts",
    ],
    naicsCodes: ["484110", "493110", "423430"],
    certifications: ["GSA Schedule", "HUBZone", "WOSB"],
    regions: ["National", "International"],
    contractSizes: ["$5M-10M", "$10M+"],
  },
  {
    id: "4",
    name: "Precision Components Inc",
    logo: "",
    aiMatchingScore: 78,
    readinessScore: 65,
    companyIntelligenceComplete: false,
    strengths: [
      "Specialized precision machining",
      "Strong aerospace experience",
      "Quality control excellence",
    ],
    deficiencies: [
      "No federal certifications",
      "Limited contract history",
      "Small operational scale",
    ],
    teamingRecommendations: [
      "Seek mentor-protégé relationship with larger contractors",
      "Pursue 8(a) certification for set-aside opportunities",
    ],
    naicsCodes: ["332710", "332813"],
    certifications: ["ISO 9001"],
    regions: ["Southeast"],
    contractSizes: ["$100K-500K", "$500K-1M"],
  },
  {
    id: "5",
    name: "Integrated Defense Systems",
    logo: "",
    aiMatchingScore: 95,
    readinessScore: 96,
    companyIntelligenceComplete: true,
    strengths: [
      "Full-system integration capabilities",
      "Multiple GSA schedules",
      "Large prime contractor experience",
      "CMMC Level 2 certified",
      "Strong financial position",
    ],
    deficiencies: [
      "High cost structure",
      "Limited flexibility on small contracts",
    ],
    teamingRecommendations: [
      "Ideal prime for large-scale opportunities",
      "Seek specialized subcontractors for niche capabilities",
    ],
    naicsCodes: ["541330", "541712", "332710"],
    certifications: ["CMMC Level 2", "GSA Schedule", "ISO 9001", "ISO 27001"],
    regions: ["National"],
    contractSizes: ["$5M-10M", "$10M+"],
  },
];

export default function ConsortiumMatchingPage() {
  const { profile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"preferences" | "members">("members");
  
  const [preferences, setPreferences] = useState({
    targetContractSizes: [] as string[],
    targetAgencies: [] as string[],
    targetRegions: [] as string[],
    preferredPartnerships: [] as string[],
  });

  const toggleArrayItem = (field: keyof typeof preferences, value: string) => {
    setPreferences((prev) => {
      const current = prev[field];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter((i) => i !== value) : [...current, value],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Matching preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleActivateAI = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("AI Matching activated! You'll start receiving matched opportunities.");
    } catch (error) {
      toast.error("Failed to activate AI matching");
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent Match</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">Strong Match</Badge>;
    if (score >= 70) return <Badge className="bg-amber-100 text-amber-800">Good Match</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low Match</Badge>;
  };

  const CONTRACT_SIZES = [
    "$0-100K",
    "$100K-500K",
    "$500K-1M",
    "$1M-5M",
    "$5M-10M",
    "$10M+",
  ];

  const AGENCIES = [
    "DoD",
    "Department of State",
    "Department of Energy",
    "NASA",
    "Department of Homeland Security",
    "Department of Transportation",
    "VA",
    "GSA",
    "Department of Education",
    "Department of Health & Human Services",
  ];

  const REGIONS = [
    "National",
    "Northeast",
    "Southeast",
    "Midwest",
    "Southwest",
    "West",
    "International",
  ];

  const PARTNERSHIP_TYPES = [
    "Prime Contractor",
    "Subcontractor",
    "Joint Venture",
    "Teaming Agreement",
    "Mentor-Protégé",
  ];

  if (viewMode === "members") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Matching Setup</h1>
            <p className="text-muted-foreground mt-1">
              View consortium members with AI Matching Scores and teaming recommendations
            </p>
          </div>
          <Button onClick={() => setViewMode("preferences")} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Preferences
          </Button>
        </div>

        {/* AI Status Card */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>AI-Powered Member Matching</CardTitle>
                <CardDescription>
                  Discover optimal teaming partners based on complementary capabilities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Star className="h-3 w-3 mr-1" />
                {MOCK_MEMBERS.length} Members Analyzed
              </Badge>
              <p className="text-sm text-muted-foreground">
                AI scores calculated based on capabilities, certifications, and compatibility
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Members Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {MOCK_MEMBERS.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.logo} />
                      <AvatarFallback>
                        <Building2 className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-2xl font-bold ${getScoreColor(member.aiMatchingScore)}`}>
                          {member.aiMatchingScore}
                        </span>
                        <span className="text-sm text-muted-foreground">AI Score</span>
                        {getScoreBadge(member.aiMatchingScore)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Request Partnership
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-2">
                  {member.naicsCodes.slice(0, 2).map((code) => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  ))}
                  {member.certifications.slice(0, 2).map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                  {member.companyIntelligenceComplete && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete Profile
                    </Badge>
                  )}
                </div>

                {/* Readiness Score */}
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Readiness Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(member.readinessScore || 0)}`}>
                    {member.readinessScore || 0}
                  </span>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {member.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deficiencies */}
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {member.deficiencies.map((deficiency, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                        {deficiency}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Teaming Recommendations */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-blue-900">
                    <Users className="h-4 w-4" />
                    Teaming Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {member.teamingRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                        <Star className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Compatibility Metrics */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capability Match</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-1.5" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Geographic Overlap</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-1.5" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contract Size Alignment</span>
                    <span className="font-medium">90%</span>
                  </div>
                  <Progress value={90} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Matching Setup</h1>
          <p className="text-muted-foreground mt-1">
            Configure your preferences for AI-powered opportunity matching
          </p>
        </div>
        <Button onClick={() => setViewMode("members")}>
          <Users className="h-4 w-4 mr-2" />
          View Members
        </Button>
      </div>

      {/* AI Status Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>AI Matching Status</CardTitle>
              <CardDescription>
                Configure your preferences to activate AI-powered opportunity matching
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Settings className="h-3 w-3 mr-1" />
              Configuration Required
            </Badge>
            <p className="text-sm text-muted-foreground">
              Complete your preferences below to activate AI matching
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contract Sizes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Target Contract Sizes</CardTitle>
          </div>
          <CardDescription>
            Select the contract sizes you're interested in pursuing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CONTRACT_SIZES.map((size) => (
              <div key={size} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <Checkbox
                  id={`size-${size}`}
                  checked={preferences.targetContractSizes.includes(size)}
                  onCheckedChange={() => toggleArrayItem("targetContractSizes", size)}
                />
                <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Agencies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Target Agencies</CardTitle>
          </div>
          <CardDescription>
            Select government agencies you want to work with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AGENCIES.map((agency) => (
              <div key={agency} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <Checkbox
                  id={`agency-${agency}`}
                  checked={preferences.targetAgencies.includes(agency)}
                  onCheckedChange={() => toggleArrayItem("targetAgencies", agency)}
                />
                <Label htmlFor={`agency-${agency}`} className="text-sm font-normal cursor-pointer">
                  {agency}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Regions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Target Regions</CardTitle>
          </div>
          <CardDescription>
            Select geographic regions you can serve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {REGIONS.map((region) => (
              <div key={region} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <Checkbox
                  id={`region-${region}`}
                  checked={preferences.targetRegions.includes(region)}
                  onCheckedChange={() => toggleArrayItem("targetRegions", region)}
                />
                <Label htmlFor={`region-${region}`} className="text-sm font-normal cursor-pointer">
                  {region}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partnership Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Partnership Preferences</CardTitle>
          </div>
          <CardDescription>
            Select the types of partnerships you're interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PARTNERSHIP_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <Checkbox
                  id={`partnership-${type}`}
                  checked={preferences.preferredPartnerships.includes(type)}
                  onCheckedChange={() => toggleArrayItem("preferredPartnerships", type)}
                />
                <Label htmlFor={`partnership-${type}`} className="text-sm font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How AI Matching Works */}
      <Card>
        <CardHeader>
          <CardTitle>How AI Matching Works</CardTitle>
          <CardDescription>
            Understanding our AI-powered opportunity matching system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium">Capability Analysis</p>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your NAICS codes, certifications, and capabilities to understand your strengths
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium">Preference Matching</p>
              <p className="text-sm text-muted-foreground">
                Opportunities are matched against your target agencies, regions, and contract size preferences
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium">Smart Recommendations</p>
              <p className="text-sm text-muted-foreground">
                Receive daily curated opportunities with match scores and partnership suggestions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-semibold text-sm">4</span>
            </div>
            <div>
              <p className="font-medium">Continuous Learning</p>
              <p className="text-sm text-muted-foreground">
                The AI learns from your feedback to improve matching accuracy over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving} variant="outline">
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
        <Button onClick={handleActivateAI} disabled={saving}>
          <Zap className="h-4 w-4 mr-2" />
          {saving ? "Activating..." : "Activate AI Matching"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
