"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Search, Star, CheckCircle, TrendingUp } from "lucide-react";

interface SME {
  id: string;
  smeId: string;
  companyName: string;
  industry: string;
  description: string;
  certifications: string[];
  capabilities: string[];
  packHealth: {
    overallScore: number;
  };
  proofPackId: string;
}

export default function BuyerDirectoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smes, setSmes] = useState<SME[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [industryFilter, setIndustryFilter] = useState("all");
  const [certificationFilter, setCertificationFilter] = useState("all");
  const [minScore, setMinScore] = useState("70");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedSme, setSelectedSme] = useState<SME | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [preferredContact, setPreferredContact] = useState("email");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDirectory();
  }, [page, industryFilter, certificationFilter, minScore]);

  const fetchDirectory = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (industryFilter !== "all") params.append("industry", industryFilter);
      if (certificationFilter !== "all") params.append("certification", certificationFilter);
      if (minScore) params.append("minScore", minScore);

      const response = await fetch(`/api/buyer/directory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch directory");

      const data = await response.json();
      setSmes(data.smes || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestIntroduction = async () => {
    if (!selectedSme || !projectDescription.trim()) {
      setError("Project description is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/introductions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smeId: selectedSme.smeId,
          projectDescription,
          timeline: timeline || null,
          budgetRange: budgetRange || null,
          preferredContactMethod: preferredContact,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to request introduction");
      }

      setShowRequestDialog(false);
      setProjectDescription("");
      setTimeline("");
      setBudgetRange("");
      alert("Introduction request submitted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to request introduction");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSmes = smes.filter((sme) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        sme.companyName.toLowerCase().includes(query) ||
        sme.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-yellow-600";
  };

  if (loading && smes.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">SME Directory</h1>
        <p className="text-muted-foreground mt-1">
          Discover vetted SMEs with Pack Health ≥70
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Aerospace">Aerospace</SelectItem>
                <SelectItem value="Defense">Defense</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={certificationFilter} onValueChange={setCertificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Certifications</SelectItem>
                <SelectItem value="8(a)">8(a)</SelectItem>
                <SelectItem value="WOSB">WOSB</SelectItem>
                <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                <SelectItem value="HUBZone">HUBZone</SelectItem>
                <SelectItem value="ISO">ISO</SelectItem>
                <SelectItem value="CMMC">CMMC</SelectItem>
              </SelectContent>
            </Select>
            <Select value={minScore} onValueChange={setMinScore}>
              <SelectTrigger>
                <SelectValue placeholder="Min Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="70">≥70 (Eligible)</SelectItem>
                <SelectItem value="80">≥80 (High Quality)</SelectItem>
                <SelectItem value="90">≥90 (Excellent)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SME Grid */}
      {filteredSmes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No SMEs Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {filteredSmes.map((sme) => (
              <Card key={sme.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{sme.companyName}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Add to favorites"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{sme.industry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm line-clamp-3">
                    {sme.description || "No description available"}
                  </p>

                  <div>
                    <p className="text-sm font-medium mb-2">Pack Health Score</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getHealthColor(sme.packHealth.overallScore)}`}>
                        {sme.packHealth.overallScore}
                      </span>
                      <Progress value={sme.packHealth.overallScore} className="flex-1" />
                    </div>
                    {sme.packHealth.overallScore >= 70 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Intro-eligible</span>
                      </div>
                    )}
                  </div>

                  {sme.certifications && sme.certifications.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {sme.certifications.slice(0, 3).map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {sme.certifications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{sme.certifications.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {sme.capabilities && sme.capabilities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {sme.capabilities.slice(0, 2).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {sme.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{sme.capabilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/share/${sme.proofPackId}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setSelectedSme(sme);
                        setShowRequestDialog(true);
                      }}
                    >
                      Request Intro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Request Introduction Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Introduction</DialogTitle>
            <DialogDescription>
              Request a warm introduction to {selectedSme?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Description *</Label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project and requirements..."
                rows={4}
              />
            </div>
            <div>
              <Label>Timeline</Label>
              <Input
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g., Q2 2026, 6 months, ASAP"
              />
            </div>
            <div>
              <Label>Budget Range</Label>
              <Input
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                placeholder="e.g., $50K-$100K, TBD"
              />
            </div>
            <div>
              <Label>Preferred Contact Method</Label>
              <Select value={preferredContact} onValueChange={setPreferredContact}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestIntroduction} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
