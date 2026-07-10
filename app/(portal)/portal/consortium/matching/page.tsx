"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Zap,
  Settings,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";


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
                0 Members Analyzed
              </Badge>
              <p className="text-sm text-muted-foreground">
                AI matching data will appear here once members complete their readiness profiles
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Members Grid - Empty State */}
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Matching Data Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              AI-powered member matching will display here once consortium members complete their readiness profiles and matching preferences.
            </p>
          </CardContent>
        </Card>
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
            Select the contract sizes you&apos;re interested in pursuing
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
            Select the types of partnerships you&apos;re interested in
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
