"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [useMockData, setUseMockData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [setAsideFilter, setSetAsideFilter] = useState<string>("all");

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
        // In production, fetch from API
        // const response = await fetch('/api/opportunities/sam-gov');
        // const data = await response.json();
        // setOpportunities(data);
        setOpportunities([]);
      }
    } catch (error) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

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
        toast.success("Teaming flag removed");
      }
    } catch (error) {
      toast.error("Failed to update teaming interest");
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
                  {setAsides.map((type) => (
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
                Displaying mock SAM.gov data for demonstration purposes
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
    </div>
  );
}
