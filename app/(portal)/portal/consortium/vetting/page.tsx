"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building2,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  ArrowRight,
  Award,
  MapPin,
  Star,
  Scale,
  FileText,
} from "lucide-react";

// Mock partner data
const MOCK_PARTNERS = [
  {
    id: "1",
    name: "Acme Manufacturing Solutions",
    company: "Acme Manufacturing Solutions",
    readinessScore: 92,
    aiMatchingScore: 88,
    capabilities: [
      "Advanced CNC machining",
      "ISO 9001:2015 certified",
      "Strong DoD contract history",
      "CMMC Level 2 certified",
      "Precision assembly",
      "Quality control systems",
    ],
    naicsCodes: ["332710", "332720", "333120", "332813"],
    certifications: ["ISO 9001", "CMMC Level 2", "8(a)", "HUBZone"],
    regions: ["Northeast", "Mid-Atlantic"],
    contractSizes: ["$1M-5M", "$5M-10M"],
    pastPerformance: [
      { client: "DoD", value: 4500000, completed: "2023" },
      { client: "NASA", value: 2800000, completed: "2022" },
    ],
    strengths: [
      "High readiness score (92)",
      "Strong DoD experience",
      "Multiple certifications",
      "Established quality systems",
    ],
    weaknesses: [
      "Limited geographic coverage",
      "No GSA Schedule",
      "Higher cost structure",
    ],
  },
  {
    id: "2",
    name: "CyberShield Technologies",
    company: "CyberShield Technologies",
    readinessScore: 95,
    aiMatchingScore: 92,
    capabilities: [
      "CMMC Level 3 certified",
      "Expert cybersecurity team",
      "Federal clearance holders",
      "Strong software development",
      "Network security",
      "Risk assessment",
    ],
    naicsCodes: ["541512", "541511", "334290", "541611"],
    certifications: ["CMMC Level 3", "ISO 27001", "SDVOSB", "FedRAMP"],
    regions: ["National"],
    contractSizes: ["$500K-1M", "$1M-5M"],
    pastPerformance: [
      { client: "Army", value: 3200000, completed: "2023" },
      { client: "Navy", value: 1900000, completed: "2022" },
    ],
    strengths: [
      "Highest CMMC certification (Level 3)",
      "National coverage",
      "Federal clearance holders",
      "Strong technical expertise",
    ],
    weaknesses: [
      "Small team size",
      "Limited manufacturing",
      "Higher rates",
    ],
  },
  {
    id: "3",
    name: "Federal Logistics Partners",
    company: "Federal Logistics Partners",
    readinessScore: 78,
    aiMatchingScore: 85,
    capabilities: [
      "Extensive supply chain network",
      "GSA Schedule holder",
      "Large geographic coverage",
      "Proven DoD track record",
      "Warehousing",
      "Transportation",
    ],
    naicsCodes: ["484110", "493110", "423430", "484230"],
    certifications: ["GSA Schedule", "HUBZone", "WOSB", "ISO 9001"],
    regions: ["National", "International"],
    contractSizes: ["$5M-10M", "$10M+"],
    pastPerformance: [
      { client: "Air Force", value: 8500000, completed: "2023" },
      { client: "Marine Corps", value: 6200000, completed: "2022" },
    ],
    strengths: [
      "GSA Schedule access",
      "Large scale capacity",
      "International reach",
      "Strong financial position",
    ],
    weaknesses: [
      "No CMMC certification",
      "Limited technical capabilities",
      "Complex organization",
    ],
  },
  {
    id: "4",
    name: "Precision Components Inc",
    company: "Precision Components Inc",
    readinessScore: 65,
    aiMatchingScore: 78,
    capabilities: [
      "Specialized precision machining",
      "Strong aerospace experience",
      "Quality control excellence",
      "Rapid prototyping",
      "Small batch production",
    ],
    naicsCodes: ["332710", "332813", "336413"],
    certifications: ["ISO 9001", "AS9100"],
    regions: ["Southeast"],
    contractSizes: ["$100K-500K", "$500K-1M"],
    pastPerformance: [
      { client: "Boeing", value: 450000, completed: "2023" },
      { client: "Lockheed", value: 380000, completed: "2022" },
    ],
    strengths: [
      "Specialized expertise",
      "Aerospace experience",
      "Cost competitive",
      "Flexible",
    ],
    weaknesses: [
      "Low readiness score",
      "No federal certifications",
      "Limited scale",
      "Regional only",
    ],
  },
  {
    id: "5",
    name: "Integrated Defense Systems",
    company: "Integrated Defense Systems",
    readinessScore: 96,
    aiMatchingScore: 95,
    capabilities: [
      "Full-system integration",
      "Multiple GSA schedules",
      "Large prime contractor",
      "CMMC Level 2 certified",
      "Systems engineering",
      "Program management",
    ],
    naicsCodes: ["541330", "541712", "332710", "541512"],
    certifications: ["CMMC Level 2", "GSA Schedule", "ISO 9001", "ISO 27001"],
    regions: ["National"],
    contractSizes: ["$5M-10M", "$10M+"],
    pastPerformance: [
      { client: "DoD", value: 15000000, completed: "2023" },
      { client: "DHS", value: 12000000, completed: "2022" },
    ],
    strengths: [
      "Highest readiness score (96)",
      "Prime contractor experience",
      "Multiple GSA schedules",
      "Strong financial position",
    ],
    weaknesses: [
      "High cost structure",
      "Less flexible",
      "Complex procurement",
    ],
  },
];

export default function PartnerVettingPage() {
  const [partner1, setPartner1] = useState<string>("");
  const [partner2, setPartner2] = useState<string>("");

  const selectedPartner1 = MOCK_PARTNERS.find((p) => p.id === partner1);
  const selectedPartner2 = MOCK_PARTNERS.find((p) => p.id === partner2);

  const calculateVettingScore = (partner: typeof MOCK_PARTNERS[0]) => {
    let score = 0;
    score += partner.readinessScore * 0.3;
    score += partner.aiMatchingScore * 0.2;
    score += partner.certifications.length * 5;
    score += partner.capabilities.length * 3;
    score += partner.pastPerformance.reduce((sum, pp) => sum + (pp.value / 1000000) * 2, 0);
    return Math.min(Math.round(score), 100);
  };

  const compareCapabilities = () => {
    if (!selectedPartner1 || !selectedPartner2) return [];
    
    const allCapabilities = Array.from(
      new Set([...selectedPartner1.capabilities, ...selectedPartner2.capabilities])
    );
    
    return allCapabilities.map((cap) => ({
      capability: cap,
      partner1Has: selectedPartner1.capabilities.includes(cap),
      partner2Has: selectedPartner2.capabilities.includes(cap),
    }));
  };

  const compareNAICS = () => {
    if (!selectedPartner1 || !selectedPartner2) return [];
    
    const allNAICS = Array.from(
      new Set([...selectedPartner1.naicsCodes, ...selectedPartner2.naicsCodes])
    );
    
    return allNAICS.map((code) => ({
      code,
      partner1Has: selectedPartner1.naicsCodes.includes(code),
      partner2Has: selectedPartner2.naicsCodes.includes(code),
    }));
  };

  const generateProsCons = () => {
    if (!selectedPartner1 || !selectedPartner2) return { partner1: { pros: [], cons: [] }, partner2: { pros: [], cons: [] } };
    
    return {
      partner1: {
        pros: selectedPartner1.strengths,
        cons: selectedPartner1.weaknesses,
      },
      partner2: {
        pros: selectedPartner2.strengths,
        cons: selectedPartner2.weaknesses,
      },
    };
  };

  const getRecommendation = () => {
    if (!selectedPartner1 || !selectedPartner2) return null;
    
    const score1 = calculateVettingScore(selectedPartner1);
    const score2 = calculateVettingScore(selectedPartner2);
    
    if (score1 > score2 + 10) {
      return {
        winner: selectedPartner1,
        reason: `Significantly higher vetting score (${score1} vs ${score2})`,
        confidence: "High",
      };
    } else if (score2 > score1 + 10) {
      return {
        winner: selectedPartner2,
        reason: `Significantly higher vetting score (${score2} vs ${score1})`,
        confidence: "High",
      };
    } else if (score1 > score2) {
      return {
        winner: selectedPartner1,
        reason: `Slightly higher vetting score (${score1} vs ${score2})`,
        confidence: "Medium",
      };
    } else if (score2 > score1) {
      return {
        winner: selectedPartner2,
        reason: `Slightly higher vetting score (${score2} vs ${score1})`,
        confidence: "Medium",
      };
    } else {
      return {
        winner: null,
        reason: "Both partners have equivalent vetting scores",
        confidence: "Low",
      };
    }
  };

  const recommendation = getRecommendation();
  const prosCons = generateProsCons();
  const capabilityComparison = compareCapabilities();
  const naicsComparison = compareNAICS();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partner Vetting & Comparison</h1>
        <p className="text-muted-foreground mt-1">
          Compare partners based on capabilities, NAICS codes, and vetting criteria
        </p>
      </div>

      {/* Partner Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Partners to Compare</CardTitle>
          <CardDescription>
            Choose two consortium members to compare their capabilities and vetting scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner 1</label>
              <Select value={partner1} onValueChange={setPartner1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first partner" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PARTNERS.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner 2</label>
              <Select value={partner2} onValueChange={setPartner2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second partner" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PARTNERS.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedPartner1 && selectedPartner2 && (
        <>
          {/* Vetting Scores */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className={recommendation?.winner?.id === selectedPartner1.id ? "border-2 border-green-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {selectedPartner1.name}
                  </CardTitle>
                  {recommendation?.winner?.id === selectedPartner1.id && (
                    <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Readiness Score</p>
                    <p className="text-2xl font-bold">{selectedPartner1.readinessScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Match Score</p>
                    <p className="text-2xl font-bold">{selectedPartner1.aiMatchingScore}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Overall Vetting Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateVettingScore(selectedPartner1)} className="flex-1" />
                    <span className="text-lg font-bold">{calculateVettingScore(selectedPartner1)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner1.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner1.regions.map((region) => (
                    <Badge key={region} variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={recommendation?.winner?.id === selectedPartner2.id ? "border-2 border-green-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {selectedPartner2.name}
                  </CardTitle>
                  {recommendation?.winner?.id === selectedPartner2.id && (
                    <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Readiness Score</p>
                    <p className="text-2xl font-bold">{selectedPartner2.readinessScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Match Score</p>
                    <p className="text-2xl font-bold">{selectedPartner2.aiMatchingScore}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Overall Vetting Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={calculateVettingScore(selectedPartner2)} className="flex-1" />
                    <span className="text-lg font-bold">{calculateVettingScore(selectedPartner2)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner2.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner2.regions.map((region) => (
                    <Badge key={region} variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Vetting Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {recommendation.winner
                      ? `Recommended: ${recommendation.winner.name}`
                      : "No clear recommendation"}
                  </p>
                  <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                  <Badge variant={recommendation.confidence === "High" ? "default" : "secondary"}>
                    Confidence: {recommendation.confidence}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Capability Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Capability Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {capabilityComparison.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="flex-1 font-medium">{item.capability}</div>
                    <div className="flex items-center gap-2">
                      {item.partner1Has ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground w-20">
                        {selectedPartner1.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.partner2Has ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground w-20">
                        {selectedPartner2.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* NAICS Code Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                NAICS Code Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {naicsComparison.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="flex-1 font-mono">{item.code}</div>
                    <div className="flex items-center gap-2">
                      {item.partner1Has ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground w-20">
                        {selectedPartner1.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.partner2Has ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground w-20">
                        {selectedPartner2.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pros and Cons */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {selectedPartner1.name} - Pros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prosCons.partner1.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {selectedPartner2.name} - Pros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prosCons.partner2.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  {selectedPartner1.name} - Cons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prosCons.partner1.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  {selectedPartner2.name} - Cons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prosCons.partner2.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Past Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Past Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold">{selectedPartner1.name}</h4>
                  {selectedPartner1.pastPerformance.map((pp, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pp.client}</span>
                        <span className="text-sm text-muted-foreground">{pp.completed}</span>
                      </div>
                      <p className="text-lg font-bold mt-1">${(pp.value / 1000000).toFixed(1)}M</p>
                    </div>
                  ))}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold">
                      ${(selectedPartner1.pastPerformance.reduce((sum, pp) => sum + pp.value, 0) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">{selectedPartner2.name}</h4>
                  {selectedPartner2.pastPerformance.map((pp, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pp.client}</span>
                        <span className="text-sm text-muted-foreground">{pp.completed}</span>
                      </div>
                      <p className="text-lg font-bold mt-1">${(pp.value / 1000000).toFixed(1)}M</p>
                    </div>
                  ))}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-xl font-bold">
                      ${(selectedPartner2.pastPerformance.reduce((sum, pp) => sum + pp.value, 0) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
