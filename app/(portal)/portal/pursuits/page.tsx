'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Target, 
  Search, 
  Filter, 
  Building2, 
  DollarSign, 
  Calendar,
  Users,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';
import { useUserProfile } from '@/contexts/user-profile-context';

interface PursuitBrief {
  id: string;
  title: string;
  description: string;
  agency: string;
  naicsCode: string;
  setAside?: string;
  estimatedValue: number;
  dueDate: Timestamp;
  requiredCapabilities: string[];
  requiredCompliance: string[];
  geographicPreference?: string;
  status: 'published' | 'team-forming' | 'proposal-phase' | 'submitted' | 'won' | 'lost' | 'cancelled';
  teamMembers: string[];
  interestedMembers: string[];
  publishedAt: Timestamp;
  solicitation?: {
    number: string;
    url: string;
  };
}

const STATUS_CONFIG = {
  'published': { label: 'Open', color: 'bg-green-100 text-green-800', icon: Target },
  'team-forming': { label: 'Team Forming', color: 'bg-blue-100 text-blue-800', icon: Users },
  'proposal-phase': { label: 'Proposal Phase', color: 'bg-yellow-100 text-yellow-800', icon: Briefcase },
  'submitted': { label: 'Submitted', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  'won': { label: 'Won', color: 'bg-emerald-100 text-emerald-800', icon: Star },
  'lost': { label: 'Lost', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const SET_ASIDE_OPTIONS = [
  { value: 'all', label: 'All Set-Asides' },
  { value: '8a', label: '8(a)' },
  { value: 'hubzone', label: 'HUBZone' },
  { value: 'sdvosb', label: 'SDVOSB' },
  { value: 'wosb', label: 'WOSB' },
  { value: 'small-business', label: 'Small Business' },
  { value: 'full-open', label: 'Full & Open' },
];

export default function PursuitsPage() {
  const { profile } = useUserProfile();
  const [pursuits, setPursuits] = useState<PursuitBrief[]>([]);
  const [filteredPursuits, setFilteredPursuits] = useState<PursuitBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [setAsideFilter, setSetAsideFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPursuits();
  }, []);

  useEffect(() => {
    filterPursuits();
  }, [pursuits, searchQuery, statusFilter, setAsideFilter, activeTab]);

  const fetchPursuits = async () => {
    if (!db) return;

    try {
      const pursuitsRef = collection(db, COLLECTIONS.PURSUIT_BRIEFS);
      const q = query(
        pursuitsRef,
        orderBy('publishedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const pursuitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PursuitBrief[];

      setPursuits(pursuitsData);
    } catch (error) {
      console.error('Error fetching pursuits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPursuits = () => {
    let filtered = [...pursuits];

    // Filter by tab
    if (activeTab === 'interested') {
      filtered = filtered.filter(p => p.interestedMembers?.includes(profile.id || ''));
    } else if (activeTab === 'my-team') {
      filtered = filtered.filter(p => p.teamMembers?.includes(profile.id || ''));
    } else if (activeTab === 'open') {
      filtered = filtered.filter(p => p.status === 'published' || p.status === 'team-forming');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.agency.toLowerCase().includes(query) ||
        p.naicsCode?.includes(query) ||
        p.requiredCapabilities?.some(c => c.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filter by set-aside
    if (setAsideFilter !== 'all') {
      filtered = filtered.filter(p => p.setAside === setAsideFilter);
    }

    setFilteredPursuits(filtered);
  };

  const handleExpressInterest = async (pursuitId: string) => {
    try {
      const response = await fetch('/api/pursuits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pursuitId,
          action: 'express-interest',
          userId: profile.id,
        }),
      });

      if (response.ok) {
        // Refresh pursuits
        fetchPursuits();
      }
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  };

  const handleWithdrawInterest = async (pursuitId: string) => {
    try {
      const response = await fetch('/api/pursuits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pursuitId,
          action: 'withdraw-interest',
          userId: profile.id,
        }),
      });

      if (response.ok) {
        fetchPursuits();
      }
    } catch (error) {
      console.error('Error withdrawing interest:', error);
    }
  };

  const getDaysUntilDue = (dueDate: Timestamp) => {
    const now = new Date();
    const due = dueDate.toDate();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pursuit Board</h1>
          <p className="text-muted-foreground">
            Browse opportunities and join pursuit teams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Target className="h-4 w-4 mr-2" />
            {pursuits.filter(p => p.status === 'published' || p.status === 'team-forming').length} Open Pursuits
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Pursuits</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="interested">My Interest</TabsTrigger>
          <TabsTrigger value="my-team">My Teams</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, agency, NAICS, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={setAsideFilter} onValueChange={setSetAsideFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Set-Aside" />
            </SelectTrigger>
            <SelectContent>
              {SET_ASIDE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pursuit Cards */}
      {filteredPursuits.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No pursuits found</h3>
          <p className="text-muted-foreground">
            {activeTab === 'interested' 
              ? "You haven't expressed interest in any pursuits yet."
              : activeTab === 'my-team'
              ? "You're not on any pursuit teams yet."
              : "No pursuits match your current filters."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredPursuits.map(pursuit => {
            const statusConfig = STATUS_CONFIG[pursuit.status];
            const StatusIcon = statusConfig.icon;
            const daysUntilDue = getDaysUntilDue(pursuit.dueDate);
            const isInterested = pursuit.interestedMembers?.includes(profile.id || '');
            const isOnTeam = pursuit.teamMembers?.includes(profile.id || '');
            const teamProgress = pursuit.teamMembers?.length || 0;

            return (
              <Card key={pursuit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {pursuit.setAside && (
                          <Badge variant="outline">{pursuit.setAside}</Badge>
                        )}
                        {isOnTeam && (
                          <Badge className="bg-primary">On Team</Badge>
                        )}
                        {isInterested && !isOnTeam && (
                          <Badge variant="secondary">Interested</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{pursuit.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {pursuit.agency}
                        </span>
                        {pursuit.naicsCode && (
                          <span className="text-sm">NAICS: {pursuit.naicsCode}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(pursuit.estimatedValue)}
                      </div>
                      <div className="text-sm text-muted-foreground">Est. Value</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pursuit.description}
                  </p>

                  {/* Capabilities */}
                  {pursuit.requiredCapabilities && pursuit.requiredCapabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pursuit.requiredCapabilities.slice(0, 5).map(cap => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {pursuit.requiredCapabilities.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{pursuit.requiredCapabilities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={daysUntilDue <= 7 ? 'text-red-600 font-medium' : ''}>
                          {daysUntilDue > 0 
                            ? `${daysUntilDue} days left`
                            : 'Past due'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{teamProgress} on team</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>{pursuit.interestedMembers?.length || 0} interested</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    {!isOnTeam && !isInterested && (pursuit.status === 'published' || pursuit.status === 'team-forming') && (
                      <Button 
                        variant="default"
                        onClick={() => handleExpressInterest(pursuit.id)}
                      >
                        Express Interest
                      </Button>
                    )}
                    {isInterested && !isOnTeam && (
                      <Button 
                        variant="outline"
                        onClick={() => handleWithdrawInterest(pursuit.id)}
                      >
                        Withdraw Interest
                      </Button>
                    )}
                    {isOnTeam && (
                      <Button variant="default">
                        View Team Workspace
                      </Button>
                    )}
                  </div>
                  <Link href={`/portal/pursuits/${pursuit.id}`}>
                    <Button variant="ghost">
                      View Details <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
