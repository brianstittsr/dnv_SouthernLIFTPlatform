"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Building2, 
  Users, 
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  agency: string;
  postedDate: Date;
  deadline: Date;
  budget: string;
  naicsCodes: string[];
  matchScore: number;
  matchReasons: string[];
  status: 'new' | 'viewed' | 'interested' | 'responding' | 'responded';
  responseOption: 'single' | 'teaming';
}

export function OpportunityDashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('matchScore');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities/matched', {
        headers: { Authorization: `Bearer ${await getAuthToken()}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      setOpportunities(data.opportunities.map((opp: any) => ({
        ...opp,
        postedDate: opp.postedDate.toDate(),
        deadline: opp.deadline?.toDate(),
        responseOption: 'single' // Default, will be updated from opportunity data
      })));
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    // Get auth token from localStorage or context
    return localStorage.getItem('authToken') || '';
  };

  const handleSelectOpportunity = (opportunityId: string) => {
    const newSelected = new Set(selectedOpportunities);
    if (newSelected.has(opportunityId)) {
      newSelected.delete(opportunityId);
    } else {
      newSelected.add(opportunityId);
    }
    setSelectedOpportunities(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOpportunities(new Set(filteredOpportunities.map(o => o.id)));
    } else {
      setSelectedOpportunities(new Set());
    }
  };

  const handleResponseAction = async (action: 'single' | 'teaming') => {
    if (selectedOpportunities.size === 0) {
      toast.error('Please select at least one opportunity');
      return;
    }

    try {
      const response = await fetch('/api/opportunities/select-for-response', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          opportunityIds: Array.from(selectedOpportunities),
          responseType: action
        })
      });

      if (!response.ok) throw new Error('Failed to process selection');

      if (action === 'teaming') {
        // Navigate to teaming recommendations
        window.location.href = `/opportunities/teaming?opportunities=${Array.from(selectedOpportunities).join(',')}`;
      } else {
        // Navigate to single response wizard
        window.location.href = `/opportunities/respond/${Array.from(selectedOpportunities)[0]}`;
      }
    } catch (error) {
      toast.error('Failed to process selection');
    }
  };

  const updateOpportunityStatus = async (opportunityId: string, status: string) => {
    try {
      await fetch(`/api/opportunities/${opportunityId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({ status })
      });

      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId ? { ...opp, status: status as any } : opp
        )
      );
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Filter and sort opportunities
  const filteredOpportunities = opportunities
    .filter(opp => {
      const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.agency.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || opp.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'deadline':
          return a.deadline.getTime() - b.deadline.getTime();
        case 'postedDate':
          return b.postedDate.getTime() - a.postedDate.getTime();
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-gray-100 text-gray-800';
      case 'interested': return 'bg-yellow-100 text-yellow-800';
      case 'responding': return 'bg-purple-100 text-purple-800';
      case 'responded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Expired', color: 'text-red-600' };
    if (days <= 7) return { text: `${days} days`, color: 'text-orange-600' };
    return { text: `${days} days`, color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
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
            Your Opportunity Dashboard
          </h1>
          <p className="text-slate-600">
            Opportunities matched to your NAICS codes and capabilities
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Matches</p>
                  <p className="text-2xl font-bold text-slate-900">{opportunities.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">New Opportunities</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {opportunities.filter(o => o.status === 'new').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">High Matches (80%+)</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {opportunities.filter(o => o.matchScore >= 80).length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Urgent (< 7 days)</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {opportunities.filter(o => {
                      const days = Math.ceil((o.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return days > 0 && days <= 7;
                    }).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="responding">Responding</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matchScore">Match Score</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="postedDate">Posted Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedOpportunities.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleResponseAction('single')}
                  disabled={selectedOpportunities.size > 1}
                >
                  Respond Individually
                </Button>
                <Button
                  onClick={() => handleResponseAction('teaming')}
                  disabled={selectedOpportunities.size === 0}
                >
                  Find Team Partners
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-slate-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <Checkbox
                  id="select-all"
                  checked={selectedOpportunities.size === filteredOpportunities.length && filteredOpportunities.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({filteredOpportunities.length})
                </label>
                <span className="text-sm text-slate-500">
                  {selectedOpportunities.size} selected
                </span>
              </div>

              {/* Opportunity Cards */}
              {filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedOpportunities.has(opportunity.id)}
                        onCheckedChange={() => handleSelectOpportunity(opportunity.id)}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                              {opportunity.title}
                            </h3>
                            <p className="text-slate-600 mb-3 line-clamp-2">
                              {opportunity.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">{opportunity.agency}</Badge>
                              <Badge className={getStatusColor(opportunity.status)}>
                                {opportunity.status}
                              </Badge>
                              <div className={`flex items-center gap-1 text-sm font-medium ${getMatchScoreColor(opportunity.matchScore)}`}>
                                <TrendingUp className="h-3 w-3" />
                                {opportunity.matchScore}% match
                              </div>
                            </div>

                            {/* Match Reasons */}
                            {opportunity.matchReasons.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-slate-700 mb-1">Why this matches:</p>
                                <div className="flex flex-wrap gap-1">
                                  {opportunity.matchReasons.map((reason, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* NAICS Codes */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {opportunity.naicsCodes.slice(0, 3).map((code) => (
                                <Badge key={code} variant="outline" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                              {opportunity.naicsCodes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{opportunity.naicsCodes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>Posted: {opportunity.postedDate.toLocaleDateString()}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className={getDaysUntilDeadline(opportunity.deadline).color}>
                                  {getDaysUntilDeadline(opportunity.deadline).text}
                                </span>
                              </div>

                              {opportunity.budget && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="h-4 w-4 text-slate-400" />
                                  <span>{opportunity.budget}</span>
                                </div>
                              )}

                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateOpportunityStatus(opportunity.id, 'viewed')}
                                >
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOpportunities(new Set([opportunity.id]));
                                    handleResponseAction('single');
                                  }}
                                >
                                  Respond
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Match Score Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Match Score</span>
                            <span>{opportunity.matchScore}%</span>
                          </div>
                          <Progress 
                            value={opportunity.matchScore} 
                            className="h-2"
                            // Color based on score
                            style={{
                              background: opportunity.matchScore >= 80 ? '#10b981' : 
                                           opportunity.matchScore >= 60 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
