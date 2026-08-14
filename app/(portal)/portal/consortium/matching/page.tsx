"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  RefreshCw,
  Calendar,
  ExternalLink,
  Mail,
  FileSearch,
  Handshake,
} from "lucide-react";
import { toast } from "sonner";

interface MatchedOpportunity {
  id: string;
  title: string;
  agency: string;
  solicitationNumber: string;
  noticeType: string;
  postedDate: string;
  deadline: string;
  location: string;
  naicsCodes: string[];
  matchedNaicsCodes: string[];
  matchScore: number;
  setAside?: string;
  description: string;
  url?: string;
  isMockData: boolean;
}

interface TeamingPartnerMatch {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  avatarUrl: string;
  email: string;
  naicsCodes: string[];
  matchedNaicsCodes: string[];
  matchScore: number;
}

function OpportunityMatchesTab({ naicsCodes }: { naicsCodes: string[] }) {
  const [opportunities, setOpportunities] = useState<MatchedOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [samGovConfigured, setSamGovConfigured] = useState(true);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/consortium/matching/naics-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naicsCodes }),
      });
      const data = await response.json();
      setOpportunities(data.opportunities || []);
      setSamGovConfigured(data.samGovConfigured !== false);
      if (data.message) {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error("Failed to load matched opportunities");
    } finally {
      setLoading(false);
    }
  }, [naicsCodes]);

  useEffect(() => {
    if (naicsCodes.length > 0) {
      loadMatches();
    }
  }, [naicsCodes, loadMatches]);

  if (naicsCodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No NAICS Codes on File</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add your NAICS codes in the{" "}
            <a href="/portal/profile" className="underline font-medium">
              Company Intel
            </a>{" "}
            tab of your profile to see matched SAM.gov opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Matching against NAICS codes: {naicsCodes.map((c) => (
            <Badge key={c} variant="outline" className="ml-1">{c}</Badge>
          ))}
        </p>
        <Button variant="outline" size="sm" onClick={loadMatches} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {!samGovConfigured && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-sm text-blue-900">
            SAM.gov API is not configured yet (Settings &gt; Integrations). Showing sample matched
            RFI/RFP notices based on your NAICS codes for demonstration.
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileSearch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
            <p className="text-muted-foreground">
              No active RFI/RFP notices currently match your NAICS codes.
            </p>
          </CardContent>
        </Card>
      ) : (
        opportunities.map((opp) => (
          <Card key={opp.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{opp.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-4 w-4" />
                        {opp.agency}
                        {opp.solicitationNumber && (
                          <>
                            <span>•</span>
                            <span>{opp.solicitationNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-purple-600 hover:bg-purple-600">
                      {opp.matchScore}% Match
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 my-2">
                    <Badge variant="secondary">{opp.noticeType}</Badge>
                    {opp.setAside && <Badge variant="outline">{opp.setAside}</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {opp.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{opp.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {opp.naicsCodes.map((code) => (
                      <Badge
                        key={code}
                        variant={opp.matchedNaicsCodes.includes(code) ? "default" : "outline"}
                        className="text-xs"
                      >
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {opp.url ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={opp.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View on SAM.gov
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Sample Notice
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function TeamingPartnersTab({ naicsCodes, userId }: { naicsCodes: string[]; userId: string }) {
  const [partners, setPartners] = useState<TeamingPartnerMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/consortium/matching/teaming-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naicsCodes, excludeUserId: userId }),
      });
      const data = await response.json();
      setPartners(data.partners || []);
      if (data.message) {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error("Failed to load teaming partner matches");
    } finally {
      setLoading(false);
    }
  }, [naicsCodes, userId]);

  useEffect(() => {
    if (naicsCodes.length > 0) {
      loadPartners();
    }
  }, [naicsCodes, loadPartners]);

  if (naicsCodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No NAICS Codes on File</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add your NAICS codes in the{" "}
            <a href="/portal/profile" className="underline font-medium">
              Company Intel
            </a>{" "}
            tab of your profile to find KDM members with similar capabilities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Finding KDM Consortium members with overlapping NAICS codes for teaming.
        </p>
        <Button variant="outline" size="sm" onClick={loadPartners} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : partners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Teaming Matches Yet</h3>
            <p className="text-muted-foreground">
              No other consortium members currently share overlapping NAICS codes with your profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {partners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={partner.avatarUrl} />
                    <AvatarFallback>
                      {(partner.firstName?.[0] || "") + (partner.lastName?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {partner.firstName} {partner.lastName}
                      </h3>
                      <Badge className="bg-purple-600 hover:bg-purple-600">
                        {partner.matchScore}% Match
                      </Badge>
                    </div>
                    {(partner.jobTitle || partner.company) && (
                      <p className="text-sm text-muted-foreground">
                        {partner.jobTitle}
                        {partner.jobTitle && partner.company ? " at " : ""}
                        {partner.company}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {partner.naicsCodes.map((code) => (
                        <Badge
                          key={code}
                          variant={partner.matchedNaicsCodes.includes(code) ? "default" : "outline"}
                          className="text-xs"
                        >
                          {code}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {partner.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${partner.email}`}>
                            <Mail className="h-4 w-4 mr-1" />
                            Contact
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" disabled>
                        <Handshake className="h-4 w-4 mr-1" />
                        Propose Teaming
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsortiumMatchingPage() {
  const { profile } = useUserProfile();
  const [saving, setSaving] = useState(false);
  const naicsCodes = profile.naicsCodes || [];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Matching Setup</h1>
        <p className="text-muted-foreground mt-1">
          Opportunity matches, teaming partner recommendations, and preferences powered by your
          Company Intelligence NAICS codes
        </p>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="opportunities">
            <FileSearch className="h-4 w-4 mr-1" />
            Opportunity Matches
          </TabsTrigger>
          <TabsTrigger value="teaming">
            <Users className="h-4 w-4 mr-1" />
            Like People Matches
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-1" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Layer 1: SAM.gov NAICS opportunity matching */}
        <TabsContent value="opportunities" className="space-y-4">
          <OpportunityMatchesTab naicsCodes={naicsCodes} />
        </TabsContent>

        {/* Layer 2: Like People Matches — teaming with other KDM members */}
        <TabsContent value="teaming" className="space-y-4">
          <TeamingPartnersTab naicsCodes={naicsCodes} userId={profile.id} />
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
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
                    Configure your preferences to fine-tune AI-powered opportunity matching
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  <Star className="h-3 w-3 mr-1" />
                  {naicsCodes.length} NAICS Codes on File
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Complete your preferences below to refine your matches
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
                  <p className="font-medium">NAICS Opportunity Matching</p>
                  <p className="text-sm text-muted-foreground">
                    Your Company Intelligence NAICS codes are matched against live SAM.gov RFI/RFP notices
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Like People Teaming Matches</p>
                  <p className="text-sm text-muted-foreground">
                    Other KDM Consortium members with overlapping NAICS codes are surfaced for teaming
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-semibold text-sm">3</span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
