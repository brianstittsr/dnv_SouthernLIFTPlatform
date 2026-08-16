"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  Users,
  Handshake,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AIMatchingDisplay } from "@/components/consortium/matching/AIMatchingDisplay";
import { useUserProfile } from "@/contexts/user-profile-context";

interface Opportunity {
  id: string;
  title: string;
  agency: string;
  solicitationNumber: string;
  postedDate: string;
  deadline: string;
  location: string;
  value: string;
  naicsCodes: string[];
  description: string;
  setAside?: string;
  interestedInTeaming: boolean;
  teamingCount: number;
  isMockData: boolean;
}

interface CompanyIntelligence {
  legalCompanyName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  companyDescription?: string;
  primaryNaicsCodes?: string[];
  federalDesignations?: {
    eightA?: boolean;
    wosb?: boolean;
    sdvosb?: boolean;
    hubzone?: boolean;
    mbe?: boolean;
    otherDesignations?: string[];
  };
  certifications?: {
    cmmcLevel?: string;
    isoCertifications?: string[];
    otherCertifications?: string[];
  };
  technicalExpertise?: string[];
  serviceOfferings?: string[];
  technologySpecializations?: string[];
  industryFocusAreas?: string[];
  cageCode?: string;
  uei?: string;
  dunsNumber?: string;
  samRegistrationStatus?: "active" | "inactive" | "pending";
  gsaScheduleHolder?: boolean;
  preferredContractTypes?: string[];
  statesServed?: string[];
  regionsServed?: string[];
  willingToPrime?: boolean;
  willingToSub?: boolean;
  seekingPartners?: boolean;
  contractSizePreferences?: string[];
  setAsidePreferences?: string[];
  annualRevenueRange?: string;
  employeeCountRange?: string;
}

const mockSAMOpportunities: Opportunity[] = [
  {
    id: "sam_1",
    title: "Cybersecurity Services for Federal Agency",
    agency: "Department of Defense",
    solicitationNumber: "HQ0034-24-R-0001",
    postedDate: "2024-06-01",
    deadline: "2024-07-15",
    location: "Washington, DC",
    value: "$2,500,000",
    naicsCodes: ["541512", "541513"],
    description: "Provide comprehensive cybersecurity services including network security, vulnerability assessments, and compliance support for federal agency systems.",
    setAside: "8(a)",
    interestedInTeaming: false,
    teamingCount: 3,
    isMockData: true,
  },
  {
    id: "sam_2",
    title: "IT Infrastructure Modernization",
    agency: "Department of Veterans Affairs",
    solicitationNumber: "VA-362-24-A-0002",
    postedDate: "2024-05-28",
    deadline: "2024-07-30",
    location: "Remote",
    value: "$5,000,000",
    naicsCodes: ["541511", "541512"],
    description: "Modernize IT infrastructure including cloud migration, network upgrades, and system integration for VA medical centers.",
    setAside: "SDVOSB",
    interestedInTeaming: true,
    teamingCount: 5,
    isMockData: true,
  },
  {
    id: "sam_3",
    title: "Manufacturing Support Services",
    agency: "Department of Energy",
    solicitationNumber: "DE-SOL-2024-0003",
    postedDate: "2024-06-03",
    deadline: "2024-08-15",
    location: "Oak Ridge, TN",
    value: "$1,200,000",
    naicsCodes: ["541611", "541690"],
    description: "Provide manufacturing support services including quality assurance, process improvement, and supply chain management.",
    setAside: "HUBZone",
    interestedInTeaming: false,
    teamingCount: 2,
    isMockData: true,
  },
  {
    id: "sam_4",
    title: "Data Analytics and Business Intelligence",
    agency: "Department of Transportation",
    solicitationNumber: "DOT-2024-0004",
    postedDate: "2024-05-20",
    deadline: "2024-07-01",
    location: "Washington, DC",
    value: "$3,750,000",
    naicsCodes: ["541512", "541519"],
    description: "Develop and implement data analytics solutions and business intelligence tools for transportation data analysis.",
    setAside: "WOSB",
    interestedInTeaming: true,
    teamingCount: 4,
    isMockData: true,
  },
  {
    id: "sam_5",
    title: "Professional Engineering Services",
    agency: "Army Corps of Engineers",
    solicitationNumber: "W912DY-24-R-0005",
    postedDate: "2024-06-05",
    deadline: "2024-08-01",
    location: "Multiple Locations",
    value: "$8,000,000",
    naicsCodes: ["541330"],
    description: "Provide professional engineering services for civil works projects including design, construction management, and environmental compliance.",
    setAside: "8(a)",
    interestedInTeaming: false,
    teamingCount: 1,
    isMockData: true,
  },
];

export default function SAMOpportunitiesPage() {
  const { profile } = useUserProfile();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [useMockData, setUseMockData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [setAsideFilter, setSetAsideFilter] = useState<string>("all");
  const [showAIMatching, setShowAIMatching] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [companyIntelligence, setCompanyIntelligence] = useState<CompanyIntelligence | null>(null);

  useEffect(() => {
    loadOpportunities();
  }, [useMockData]);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, searchQuery, agencyFilter, setAsideFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock SAM.gov data
        setOpportunities(mockSAMOpportunities);
      } else {
        // Fetch live data from SAM.gov API proxy
        const response = await fetch("/api/opportunities/sam-gov", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: searchQuery || undefined,
            is_active: true,
            size: 25,
            page: 0,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        const mapped: Opportunity[] = (data.opportunitiesData || []).map((opp: Record<string, unknown>) => ({
          id: opp.noticeId as string || "",
          title: opp.title as string || "Untitled",
          agency: (opp.organizationHierarchy || opp.department || "Unknown Agency").toString().split("::").pop() || "Unknown Agency",
          solicitationNumber: opp.solicitationNumber as string || "",
          postedDate: opp.postedDate as string || "",
          deadline: opp.responseDeadLine as string || "",
          location: opp.placeOfPerformance
            ? `${(opp.placeOfPerformance as { city?: string; state?: string }).city || ""}, ${(opp.placeOfPerformance as { city?: string; state?: string }).state || ""}`.replace(/^, |, $/g, "")
            : "Not specified",
          value: "See solicitation",
          naicsCodes: opp.naicsCode ? [opp.naicsCode as string] : [],
          description: opp.description as string || "",
          setAside: opp.typeOfSetAsideDescription as string || undefined,
          interestedInTeaming: false,
          teamingCount: 0,
          isMockData: false,
        }));
        setOpportunities(mapped);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load opportunities";
      toast.error(message);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const firestore = db;
    if (!firestore || !profile.id) return;

    const loadCompanyIntelligence = async () => {
      try {
        const snap = await getDoc(doc(firestore, COLLECTIONS.USERS, profile.id));
        const data = snap.data()?.companyIntelligence as CompanyIntelligence | undefined;
        setCompanyIntelligence(data || null);
      } catch (error) {
        console.error("Failed to load Company Intelligence:", error);
      }
    };

    loadCompanyIntelligence();
  }, [profile.id]);

  const { recommendTeaming, teamingReasons } = useMemo(() => {
    if (!companyIntelligence) {
      return { recommendTeaming: false, teamingReasons: ["No Company Intelligence data available"] };
    }

    const reasons: string[] = [];

    if (companyIntelligence.seekingPartners) {
      reasons.push("Actively seeking partners");
    }
    if (companyIntelligence.willingToSub && !companyIntelligence.willingToPrime) {
      reasons.push("Prefer to work as a subcontractor");
    }
    if (companyIntelligence.willingToPrime && !companyIntelligence.willingToSub) {
      reasons.push("Prefer to act as prime contractor");
    }
    if (companyIntelligence.employeeCountRange && ["1-10", "11-50"].includes(companyIntelligence.employeeCountRange)) {
      reasons.push("Smaller team size may benefit from partners");
    }
    if (companyIntelligence.contractSizePreferences?.some((range) => range.includes("1M") || range.includes("5M") || range.includes("10M"))) {
      reasons.push("Contract size preferences include larger opportunities");
    }

    const recommend =
      !!companyIntelligence.seekingPartners ||
      (companyIntelligence.willingToSub === true && companyIntelligence.willingToPrime !== true) ||
      (["1-10", "11-50"].includes(companyIntelligence.employeeCountRange || "") && !companyIntelligence.willingToPrime) ||
      companyIntelligence.contractSizePreferences?.some((range) => range.includes("1M") || range.includes("5M") || range.includes("10M")) ||
      false;

    if (reasons.length === 0) {
      reasons.push("No strong Company Intelligence signal for teaming");
    }

    return { recommendTeaming: recommend, teamingReasons: reasons };
  }, [companyIntelligence]);

  const filterOpportunities = () => {
    let filtered = [...opportunities];

    if (searchQuery) {
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.solicitationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (agencyFilter !== "all") {
      filtered = filtered.filter((opp) => opp.agency === agencyFilter);
    }

    if (setAsideFilter !== "all") {
      filtered = filtered.filter((opp) => opp.setAside === setAsideFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const toggleTeamingInterest = async (opportunityId: string) => {
    try {
      // In production, update in Firestore
      setOpportunities(
        opportunities.map((opp) =>
          opp.id === opportunityId
            ? { ...opp, interestedInTeaming: !opp.interestedInTeaming }
            : opp
        )
      );

      const opportunity = opportunities.find((opp) => opp.id === opportunityId);
      if (opportunity?.interestedInTeaming) {
        toast.success("Flagged for teaming - other partners can now see your interest");
      } else {
        toast.info("Teaming flag removed");
      }
    } catch (error) {
      toast.error("Failed to update teaming interest");
    }
  };

  const handleAIMatching = async (opportunity: Opportunity) => {
    if (!profile?.id) {
      toast.error("You must be logged in to use AI matching");
      return;
    }

    setSelectedOpportunity(opportunity);
    setShowAIMatching(true);
    setAiLoading(true);

    try {
      const response = await fetch("/api/consortium/matching/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: {
            id: opportunity.id,
            title: opportunity.title,
            description: opportunity.description,
            naicsCodes: opportunity.naicsCodes,
            setAside: opportunity.setAside,
          },
          options: { threshold: 50, limit: 10 },
        }),
      });

      const data = await response.json();
      setAiMatches(data.matches || []);
      toast.success(`Found ${data.matches?.length || 0} matching partners`);
    } catch (error) {
      toast.error("Failed to get AI matches");
    } finally {
      setAiLoading(false);
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (days: number) => {
    if (days <= 7) return "text-red-600";
    if (days <= 30) return "text-yellow-600";
    return "text-green-600";
  };

  const agencies = Array.from(new Set(opportunities.map((opp) => opp.agency)));
  const setAsides = Array.from(new Set(opportunities.map((opp) => opp.setAside).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SAM.gov Opportunities</h1>
          <p className="text-muted-foreground">
            Browse government contracting opportunities from SAM.gov
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="mockData">Use Mock Data</Label>
            <Switch
              id="mockData"
              checked={useMockData}
              onCheckedChange={setUseMockData}
            />
          </div>
          <Button onClick={loadOpportunities} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Filter Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Active Search &amp; Filter Variables
          </CardTitle>
          <CardDescription>
            Variables from your Company Intelligence and current filter selections used to find opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!companyIntelligence ? (
            <p className="text-sm text-muted-foreground">Loading Company Intelligence...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{companyIntelligence.legalCompanyName || profile.company || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Primary NAICS</p>
                <div className="flex flex-wrap gap-1">
                  {(companyIntelligence.primaryNaicsCodes || profile.naicsCodes || []).length > 0 ? (
                    (companyIntelligence.primaryNaicsCodes || profile.naicsCodes || []).map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {companyIntelligence.city ? `${companyIntelligence.city}, ${companyIntelligence.state}` : profile.state || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">States Served</p>
                <p className="font-medium">{(companyIntelligence.statesServed || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Federal Designations</p>
                <div className="flex flex-wrap gap-1">
                  {companyIntelligence.federalDesignations ? (
                    <>
                      {companyIntelligence.federalDesignations.eightA && <Badge variant="outline" className="text-xs">8(a)</Badge>}
                      {companyIntelligence.federalDesignations.wosb && <Badge variant="outline" className="text-xs">WOSB</Badge>}
                      {companyIntelligence.federalDesignations.sdvosb && <Badge variant="outline" className="text-xs">SDVOSB</Badge>}
                      {companyIntelligence.federalDesignations.hubzone && <Badge variant="outline" className="text-xs">HUBZone</Badge>}
                      {companyIntelligence.federalDesignations.mbe && <Badge variant="outline" className="text-xs">MBE</Badge>}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Size Preferences</p>
                <p className="font-medium">{(companyIntelligence.contractSizePreferences || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Set-Aside Preferences</p>
                <p className="font-medium">{(companyIntelligence.setAsidePreferences || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CMMC Level</p>
                <p className="font-medium">{companyIntelligence.certifications?.cmmcLevel ? `Level ${companyIntelligence.certifications.cmmcLevel}` : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Other Certifications</p>
                <p className="font-medium">{(companyIntelligence.certifications?.otherCertifications || []).join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">SAM Registration</p>
                <p className="font-medium">{companyIntelligence.samRegistrationStatus || profile.samRegistrationStatus || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CAGE / UEI</p>
                <p className="font-medium">{`${companyIntelligence.cageCode || profile.cageCode || "—"} / ${companyIntelligence.uei || profile.uei || "—"}`}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Service Offerings</p>
                <p className="font-medium">{(companyIntelligence.serviceOfferings || []).join(", ") || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Technology Specializations</p>
                <p className="font-medium">{(companyIntelligence.technologySpecializations || []).join(", ") || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Industry Focus Areas</p>
                <p className="font-medium">{(companyIntelligence.industryFocusAreas || []).join(", ") || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Capabilities Statement</p>
                <p className="font-medium">{companyIntelligence.companyDescription || profile.companyDescription || "—"}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Readiness / Capabilities Documents</p>
                <div className="flex flex-wrap gap-2">
                  {profile.readinessDocuments && profile.readinessDocuments.length > 0 ? (
                    profile.readinessDocuments.map((doc, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{doc.type}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground">Current UI Filters</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Search: {searchQuery || "—"}</Badge>
                  <Badge variant="secondary" className="text-xs">Agency: {agencyFilter}</Badge>
                  <Badge variant="secondary" className="text-xs">Set-Aside: {setAsideFilter}</Badge>
                  <Badge variant="secondary" className="text-xs">{useMockData ? "Mock Data" : "Live SAM.gov"}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teaming Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Teaming Recommendation
          </CardTitle>
          <CardDescription>
            Suggested default for the &quot;Flag for Teaming&quot; switch based on your Company Intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${recommendTeaming ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {recommendTeaming ? <Handshake className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {recommendTeaming ? "Teaming is recommended (toggle ON)" : "Teaming is not recommended by default (toggle OFF)"}
              </p>
              <p className="text-sm text-muted-foreground">{teamingReasons.join(" • ")}</p>
            </div>
            <Badge variant={recommendTeaming ? "default" : "secondary"}>
              {recommendTeaming ? "ON" : "OFF"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="agency">Agency</Label>
              <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                <SelectTrigger id="agency">
                  <SelectValue placeholder="All Agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label htmlFor="setAside">Set-Aside</Label>
              <Select value={setAsideFilter} onValueChange={setSetAsideFilter}>
                <SelectTrigger id="setAside">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {setAsides.filter((type: string | undefined): type is string => type !== undefined).map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock Data Notice */}
      {useMockData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-900">
              <Filter className="h-4 w-4" />
              <span className="text-sm">
                Displaying mock SAM.gov data for demonstration. Toggle off &quot;Use Mock Data&quot; to fetch live opportunities (requires SAM.gov API key in Settings &gt; Integrations).
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opportunity) => {
            const daysUntilDeadline = getDaysUntilDeadline(opportunity.deadline);
            return (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{opportunity.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {opportunity.agency}
                            <span>•</span>
                            <span>{opportunity.solicitationNumber}</span>
                          </div>
                        </div>
                        {opportunity.setAside && (
                          <Badge variant="secondary">{opportunity.setAside}</Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Deadline</div>
                            <div className={`font-medium ${getDeadlineColor(daysUntilDeadline)}`}>
                              {daysUntilDeadline} days
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Location</div>
                            <div className="font-medium">{opportunity.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Value</div>
                            <div className="font-medium">{opportunity.value}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Teaming Interest</div>
                            <div className="font-medium">{opportunity.teamingCount} partners</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {opportunity.description}
                      </p>

                      {/* NAICS Codes */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.naicsCodes.map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                      </div>

                      {/* Teaming Flag */}
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Switch
                          checked={opportunity.interestedInTeaming}
                          onCheckedChange={() => toggleTeamingInterest(opportunity.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Handshake className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">
                              {opportunity.interestedInTeaming
                                ? "Interested in Teaming"
                                : "Flag for Teaming"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opportunity.interestedInTeaming
                              ? "Other partners on the platform can see your interest"
                              : "Flag this opportunity to find teaming partners"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {profile?.role === "consortium_member" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAIMatching(opportunity)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          AI Match Partners
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View on SAM.gov
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* AI Matching Display */}
      {showAIMatching && (
        <div className="mt-6">
          <AIMatchingDisplay
            opportunityMatches={aiMatches}
            loading={aiLoading}
            onContactPartner={(partnerId) => {
              toast.info(`Contact partner ${partnerId}`);
            }}
            onViewProfile={(partnerId) => {
              toast.info(`View profile ${partnerId}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
