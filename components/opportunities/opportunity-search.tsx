"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface Opportunity {
  id: string;
  title: string;
  agency: string;
  solicitationNumber: string;
  naicsCodes: string[];
  description: string;
  postedDate: string;
  dueDate: string;
  value: string;
  location: string;
  setAside: string;
  matchScore: number;
  matchReason: string;
  status: string;
}

export function OpportunitySearch() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [setAsideFilter, setSetAsideFilter] = useState<string>("all");
  const [minMatchScore, setMinMatchScore] = useState<number>(70);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    checkOnboardingAndSearch();
  }, []);

  const checkOnboardingAndSearch = async () => {
    if (!profile?.id) {
      return;
    }

    // Check if onboarding is complete
    if (!profile.isOnboardingComplete) {
      toast.error("Please complete onboarding to access opportunity matching", {
        description: "You'll be redirected to onboarding",
        duration: 3000,
      });
      setTimeout(() => {
        router.push("/portal/onboarding");
      }, 1000);
      return;
    }

    // Check if user has NAICS codes
    if (!profile.primaryNaics || profile.primaryNaics.length === 0) {
      toast.error("No NAICS codes found in your profile", {
        description: "Please complete onboarding with your NAICS codes",
      });
      return;
    }

    // Search for opportunities
    await searchOpportunities();
  };

  const searchOpportunities = async (forceRefresh = false) => {
    if (!auth?.currentUser) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/opportunities/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ forceRefresh }),
      });

      const data = await response.json();

      if (response.ok) {
        setOpportunities(data.opportunities || []);
        setFromCache(data.fromCache || false);
        setLastUpdated(data.lastUpdated || null);
        
        if (data.requiresOnboarding) {
          toast.error("Onboarding required", {
            description: "Redirecting to onboarding...",
          });
          router.push(data.redirectUrl);
        }
      } else {
        toast.error(data.error || "Failed to search opportunities");
      }
    } catch (error) {
      console.error("Error searching opportunities:", error);
      toast.error("Failed to search opportunities");
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      searchQuery === "" ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.agency.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSetAside =
      setAsideFilter === "all" || opp.setAside === setAsideFilter;

    const matchesScore = opp.matchScore >= minMatchScore;

    return matchesSearch && matchesSetAside && matchesScore;
  });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Good Match";
    if (score >= 70) return "Moderate Match";
    return "Low Match";
  };

  const daysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return diff;
  };

  const getUrgencyBadge = (dueDate: string) => {
    const days = daysUntilDue(dueDate);
    if (days < 7) {
      return <Badge variant="destructive">{days} days left</Badge>;
    } else if (days < 14) {
      return <Badge className="bg-orange-500">{days} days left</Badge>;
    } else if (days < 30) {
      return <Badge className="bg-yellow-500">{days} days left</Badge>;
    }
    return <Badge variant="outline">{days} days left</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI-Powered Opportunity Search</h1>
          <p className="text-muted-foreground">
            SAM.gov opportunities matched to your NAICS codes and certifications
          </p>
        </div>
        <Button onClick={() => searchOpportunities(true)} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Matches
        </Button>
      </div>

      {/* Onboarding Warning */}
      {!profile?.isOnboardingComplete && (
        <Card className="border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">Onboarding Required</p>
                <p className="text-sm text-orange-700">
                  Complete your onboarding to access AI-powered opportunity matching
                </p>
              </div>
              <Button
                className="ml-auto"
                onClick={() => router.push("/portal/onboarding")}
              >
                Complete Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {opportunities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{opportunities.length}</div>
              <p className="text-sm text-muted-foreground">Matched Opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {opportunities.filter((o) => o.matchScore >= 90).length}
              </div>
              <p className="text-sm text-muted-foreground">Excellent Matches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {opportunities.filter((o) => daysUntilDue(o.dueDate) < 14).length}
              </div>
              <p className="text-sm text-muted-foreground">Urgent (&lt; 14 days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {fromCache ? "Cached" : "Fresh"}
              </div>
              <p className="text-sm text-muted-foreground">
                {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleDateString()}` : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Set-Aside Type</Label>
              <Select value={setAsideFilter} onValueChange={setSetAsideFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="8(a)">8(a)</SelectItem>
                  <SelectItem value="HUBZone">HUBZone</SelectItem>
                  <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                  <SelectItem value="WOSB">WOSB</SelectItem>
                  <SelectItem value="Small Business">Small Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum Match Score: {minMatchScore}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Searching for opportunities...
            </div>
          </CardContent>
        </Card>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center p-6">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No opportunities found</h3>
            <p className="text-center text-sm text-muted-foreground">
              {opportunities.length === 0
                ? "Click 'Refresh Matches' to search for opportunities matched to your profile"
                : "Try adjusting your filters to see more results"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.agency} • {opportunity.solicitationNumber}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getMatchScoreColor(opportunity.matchScore)}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {opportunity.matchScore}% - {getMatchScoreLabel(opportunity.matchScore)}
                        </Badge>
                        {getUrgencyBadge(opportunity.dueDate)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm mb-4">{opportunity.description}</p>

                    {/* Details */}
                    <div className="grid gap-2 md:grid-cols-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due: {new Date(opportunity.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{opportunity.setAside}</Badge>
                      </div>
                    </div>

                    {/* Match Reason */}
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Why this match:</span> {opportunity.matchReason}
                    </div>

                    {/* NAICS Codes */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {opportunity.naicsCodes.map((code) => (
                        <Badge key={code} variant="secondary" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button size="sm" asChild>
                      <a
                        href={`https://sam.gov/search/?keywords=${opportunity.solicitationNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on SAM.gov
                      </a>
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Track
                    </Button>
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
