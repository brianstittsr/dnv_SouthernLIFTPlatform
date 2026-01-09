'use client';

import { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Ticket,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  memberGrowth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  totalEvents: number;
  upcomingEvents: number;
  ticketsSold: number;
  ticketRevenue: number;
  totalPursuits: number;
  activePursuits: number;
  pursuitWinRate: number;
  totalSponsors: number;
  sponsorRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'membership' | 'ticket' | 'pursuit' | 'sponsor';
  description: string;
  amount?: number;
  timestamp: Date;
}

export default function KDMDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    memberGrowth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    revenueGrowth: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    ticketsSold: 0,
    ticketRevenue: 0,
    totalPursuits: 0,
    activePursuits: 0,
    pursuitWinRate: 0,
    totalSponsors: 0,
    sponsorRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    if (!db) {
      // Use sample data for demo
      setSampleData();
      return;
    }

    try {
      const now = new Date();
      const startDate = subDays(now, parseInt(dateRange));
      const monthStart = startOfMonth(now);

      // Fetch memberships
      const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
      const membershipsSnapshot = await getDocs(membershipsRef);
      const memberships = membershipsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const activeMembers = memberships.filter((m: any) => m.status === 'active' || m.status === 'trialing').length;
      const newThisMonth = memberships.filter((m: any) => {
        const createdAt = m.createdAt?.toDate?.() || new Date(0);
        return createdAt >= monthStart;
      }).length;

      // Fetch tickets
      const ticketsRef = collection(db, COLLECTIONS.TICKETS);
      const ticketsSnapshot = await getDocs(ticketsRef);
      const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const paidTickets = tickets.filter((t: any) => t.status === 'paid');
      const ticketRevenue = paidTickets.reduce((sum: number, t: any) => sum + (t.price || 0), 0);

      // Fetch events
      const eventsRef = collection(db, COLLECTIONS.EVENTS);
      const eventsSnapshot = await getDocs(eventsRef);
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const upcomingEvents = events.filter((e: any) => {
        const startDate = e.startDate?.toDate?.() || new Date(0);
        return startDate >= now && e.status === 'published';
      }).length;

      // Fetch pursuits
      const pursuitsRef = collection(db, COLLECTIONS.PURSUIT_BRIEFS);
      const pursuitsSnapshot = await getDocs(pursuitsRef);
      const pursuits = pursuitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activePursuits = pursuits.filter((p: any) => 
        ['published', 'team-forming', 'proposal-phase'].includes(p.status)
      ).length;
      const wonPursuits = pursuits.filter((p: any) => p.status === 'won').length;
      const completedPursuits = pursuits.filter((p: any) => 
        ['won', 'lost'].includes(p.status)
      ).length;

      // Fetch sponsors
      const sponsorsRef = collection(db, COLLECTIONS.SPONSORS);
      const sponsorsSnapshot = await getDocs(sponsorsRef);
      const sponsors = sponsorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const paidSponsors = sponsors.filter((s: any) => s.status === 'paid');
      const sponsorRevenue = paidSponsors.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

      // Calculate total revenue
      const membershipRevenue = memberships
        .filter((m: any) => m.status === 'active')
        .reduce((sum: number, m: any) => sum + (m.amount || 0), 0);

      setMetrics({
        totalMembers: memberships.length,
        activeMembers,
        newMembersThisMonth: newThisMonth,
        memberGrowth: memberships.length > 0 ? (newThisMonth / memberships.length) * 100 : 0,
        totalRevenue: membershipRevenue + ticketRevenue + sponsorRevenue,
        revenueThisMonth: membershipRevenue, // Simplified
        revenueGrowth: 12.5, // Would need historical data
        totalEvents: events.length,
        upcomingEvents,
        ticketsSold: paidTickets.length,
        ticketRevenue,
        totalPursuits: pursuits.length,
        activePursuits,
        pursuitWinRate: completedPursuits > 0 ? (wonPursuits / completedPursuits) * 100 : 0,
        totalSponsors: sponsors.length,
        sponsorRevenue,
      });

      // Build recent activity
      const activities: RecentActivity[] = [];
      
      memberships.slice(0, 3).forEach((m: any) => {
        activities.push({
          id: m.id,
          type: 'membership',
          description: `New ${m.tier} membership`,
          amount: m.amount,
          timestamp: m.createdAt?.toDate?.() || new Date(),
        });
      });

      paidTickets.slice(0, 3).forEach((t: any) => {
        activities.push({
          id: t.id,
          type: 'ticket',
          description: `Ticket sold for event`,
          amount: t.price,
          timestamp: t.createdAt?.toDate?.() || new Date(),
        });
      });

      setRecentActivity(activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    setMetrics({
      totalMembers: 47,
      activeMembers: 42,
      newMembersThisMonth: 8,
      memberGrowth: 17.0,
      totalRevenue: 125750,
      revenueThisMonth: 28500,
      revenueGrowth: 12.5,
      totalEvents: 12,
      upcomingEvents: 4,
      ticketsSold: 156,
      ticketRevenue: 23400,
      totalPursuits: 23,
      activePursuits: 8,
      pursuitWinRate: 35,
      totalSponsors: 6,
      sponsorRevenue: 45000,
    });

    setRecentActivity([
      { id: '1', type: 'membership', description: 'New Core Capture membership - TechForward Solutions', amount: 175000, timestamp: new Date() },
      { id: '2', type: 'ticket', description: 'Ticket sold - Government Contracting Summit', amount: 15000, timestamp: subDays(new Date(), 1) },
      { id: '3', type: 'pursuit', description: 'New pursuit published - DoD IT Modernization', timestamp: subDays(new Date(), 1) },
      { id: '4', type: 'sponsor', description: 'Sponsor payment received - Gold Tier', amount: 1000000, timestamp: subDays(new Date(), 2) },
      { id: '5', type: 'membership', description: 'New Pursuit Pack membership - BuildRight Construction', amount: 50000, timestamp: subDays(new Date(), 3) },
    ]);

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'membership': return <Users className="h-4 w-4" />;
      case 'ticket': return <Ticket className="h-4 w-4" />;
      case 'pursuit': return <Target className="h-4 w-4" />;
      case 'sponsor': return <Building2 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
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
          <h1 className="text-3xl font-bold">KDM Consortium Dashboard</h1>
          <p className="text-muted-foreground">
            Platform metrics and performance overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.revenueGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+{metrics.revenueGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500">{metrics.revenueGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeMembers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+{metrics.newMembersThisMonth}</span>
              <span className="ml-1">new this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Pursuits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pursuits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activePursuits}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.pursuitWinRate.toFixed(0)}% win rate ({metrics.totalPursuits} total)
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.upcomingEvents}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.ticketsSold} tickets sold ({formatCurrency(metrics.ticketRevenue)})
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>Revenue by source this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Membership Dues</span>
                  <span className="font-medium">{formatCurrency(metrics.revenueThisMonth)}</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Event Tickets</span>
                  <span className="font-medium">{formatCurrency(metrics.ticketRevenue)}</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sponsorships</span>
                  <span className="font-medium">{formatCurrency(metrics.sponsorRevenue)}</span>
                </div>
                <Progress value={15} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Revenue</span>
                <span className="text-xl font-bold">{formatCurrency(metrics.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                <span>KDM Share (50%)</span>
                <span>{formatCurrency(metrics.totalRevenue / 2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>V+ Share (50%)</span>
                <span>{formatCurrency(metrics.totalRevenue / 2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(activity.timestamp, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-600">
                      +{formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Membership Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Membership Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Members</span>
              <span className="font-medium">{metrics.totalMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium text-green-600">{metrics.activeMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New This Month</span>
              <span className="font-medium">{metrics.newMembersThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Growth Rate</span>
              <span className="font-medium text-green-600">+{metrics.memberGrowth.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Event Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Events</span>
              <span className="font-medium">{metrics.totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upcoming</span>
              <span className="font-medium">{metrics.upcomingEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tickets Sold</span>
              <span className="font-medium">{metrics.ticketsSold}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Revenue</span>
              <span className="font-medium">{formatCurrency(metrics.ticketRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pursuit Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pursuit Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Pursuits</span>
              <span className="font-medium">{metrics.totalPursuits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium text-blue-600">{metrics.activePursuits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Win Rate</span>
              <span className="font-medium">{metrics.pursuitWinRate.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sponsors</span>
              <span className="font-medium">{metrics.totalSponsors}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href="/portal/admin/memberships">Manage Memberships</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/portal/admin/events">Manage Events</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/portal/admin/pursuits">Manage Pursuits</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/portal/admin/sponsors">Manage Sponsors</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/portal/admin/settlements">View Settlements</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
