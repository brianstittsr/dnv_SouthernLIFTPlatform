"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Award, 
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface RecommendedPartner {
  userId: string;
  companyName: string;
  matchScore: number;
  sharedCapabilities: string[];
  complementaryCapabilities: string[];
  pastPerformance: PastPerformance[];
  contactInfo: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
  };
  certifications: Certification[];
  naicsCodes: NAICSCode[];
}

interface PastPerformance {
  contractTitle: string;
  agency: string;
  value: string;
  completedDate: string;
  rating: number;
}

interface Certification {
  type: string;
  level?: string;
  issuedBy: string;
}

interface NAICSCode {
  code: string;
  description: string;
  relevance: 'primary' | 'secondary';
}

interface TeamingRecommendationsProps {
  opportunityIds: string[];
  onPartnersSelected: (partners: string[]) => void;
}

export function TeamingRecommendations({ opportunityIds, onPartnersSelected }: TeamingRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedPartner[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<any>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [opportunityIds]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/opportunities/teaming-recommendations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ opportunityIds })
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      setRecommendations(data.recommendedPartners);
      setOpportunity(data.opportunity);
    } catch (error) {
      toast.error('Failed to load teaming recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    return localStorage.getItem('authToken') || '';
  };

  const handlePartnerSelection = (partnerId: string) => {
    const newSelected = new Set(selectedPartners);
    if (newSelected.has(partnerId)) {
      newSelected.delete(partnerId);
    } else {
      newSelected.add(partnerId);
    }
    setSelectedPartners(newSelected);
  };

  const handleProceedToResponse = () => {
    if (selectedPartners.size === 0) {
      toast.error('Please select at least one teaming partner');
      return;
    }
    
    onPartnersSelected(Array.from(selectedPartners));
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            AI Teaming Partner Recommendations
          </h1>
          <p className="text-slate-600">
            Recommended partners based on NAICS code alignment and complementary capabilities
          </p>
        </div>

        {/* Opportunity Overview */}
        {opportunity && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {opportunity.title}
              </CardTitle>
              <CardDescription>
                {opportunity.agency} • Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {opportunity.naicsCodes?.map((code: string) => (
                  <Badge key={code} variant="outline">{code}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selection Summary */}
        {selectedPartners.size > 0 && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedPartners.size} partner{selectedPartners.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button onClick={handleProceedToResponse}>
                  Proceed with Response
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <div className="space-y-6">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No teaming partners found</h3>
                  <p>Try adjusting your opportunity selection or contact support for assistance</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            recommendations.map((partner) => (
              <Card key={partner.userId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedPartners.has(partner.userId)}
                      onCheckedChange={() => handlePartnerSelection(partner.userId)}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      {/* Company Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/api/company-logo/${partner.userId}`} />
                            <AvatarFallback>
                              {partner.companyName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {partner.companyName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-3 w-3" />
                              {partner.contactInfo.location}
                            </div>
                          </div>
                        </div>

                        {/* Match Score */}
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getMatchScoreColor(partner.matchScore)}`}>
                            {partner.matchScore}%
                          </div>
                          <div className="text-sm text-slate-600">Match Score</div>
                          <div className={`w-16 h-2 rounded-full bg-gradient-to-r ${getMatchScoreGradient(partner.matchScore)} mt-1`} />
                        </div>
                      </div>

                      {/* Contact Person */}
                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {partner.contactInfo.firstName} {partner.contactInfo.lastName}
                            </p>
                            <p className="text-sm text-slate-600">{partner.contactInfo.title}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                            {partner.contactInfo.phone && (
                              <Button variant="outline" size="sm">
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Shared Capabilities */}
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Shared Capabilities
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {partner.sharedCapabilities.map((capability, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Complementary Capabilities */}
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            Complementary Capabilities
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {partner.complementaryCapabilities.map((capability, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* NAICS Codes */}
                      <div className="mb-4">
                        <h4 className="font-medium text-slate-900 mb-2">NAICS Codes</h4>
                        <div className="flex flex-wrap gap-1">
                          {partner.naicsCodes.map((naics) => (
                            <Badge 
                              key={naics.code} 
                              variant={naics.relevance === 'primary' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {naics.code} ({naics.relevance})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      {partner.certifications.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Certifications
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {partner.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {cert.type} {cert.level && `- ${cert.level}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Past Performance */}
                      {partner.pastPerformance.length > 0 && (
                        <div>
                          <h4 className="font-medium text-slate-900 mb-2">Recent Performance</h4>
                          <div className="space-y-2">
                            {partner.pastPerformance.slice(0, 3).map((perf, index) => (
                              <div key={index} className="flex items-center justify-between text-sm bg-slate-50 rounded p-2">
                                <div>
                                  <p className="font-medium">{perf.contractTitle}</p>
                                  <p className="text-slate-600">{perf.agency} • {perf.value}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${
                                        i < perf.rating ? 'text-yellow-500 fill-current' : 'text-slate-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Match Score Breakdown */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">AI Match Confidence</span>
                          <span className={`font-medium ${getMatchScoreColor(partner.matchScore)}`}>
                            {partner.matchScore}%
                          </span>
                        </div>
                        <Progress value={partner.matchScore} className="h-2 mt-1" />
                        <p className="text-xs text-slate-500 mt-1">
                          Based on NAICS alignment, complementary capabilities, and past performance
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        {selectedPartners.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  {selectedPartners.size} partner{selectedPartners.size > 1 ? 's' : ''} selected
                </span>
              </div>
              <Button size="lg" onClick={handleProceedToResponse}>
                Continue to Response Wizard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
