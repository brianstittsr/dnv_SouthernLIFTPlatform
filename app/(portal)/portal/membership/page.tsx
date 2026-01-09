'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { 
  CreditCard, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  ArrowUpRight,
  Settings,
  FileText,
  Users,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';
import { useUserProfile } from '@/contexts/user-profile-context';

interface Membership {
  id: string;
  tier: 'core-capture' | 'pursuit-pack' | 'custom';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  metadata?: {
    conciergeHoursUsed?: number;
    conciergeHoursLimit?: number;
  };
  createdAt: Timestamp;
}

const TIER_CONFIG = {
  'core-capture': {
    name: 'Core Capture Member',
    icon: Star,
    color: 'bg-blue-100 text-blue-800',
    features: [
      { icon: Target, label: 'Curated opportunity intelligence' },
      { icon: Users, label: 'Best-fit team assembly access' },
      { icon: FileText, label: 'Proposal orchestration support' },
      { icon: Calendar, label: 'Monthly buyer briefings' },
      { icon: Shield, label: 'Resource library access' },
    ],
  },
  'pursuit-pack': {
    name: 'Pursuit Pack',
    icon: Target,
    color: 'bg-green-100 text-green-800',
    features: [
      { icon: Target, label: 'Single pursuit access' },
      { icon: Users, label: 'Team assembly for one opportunity' },
      { icon: FileText, label: 'Proposal workspace access' },
    ],
  },
  'custom': {
    name: 'Enterprise',
    icon: Zap,
    color: 'bg-purple-100 text-purple-800',
    features: [
      { icon: Star, label: 'Everything in Core Capture' },
      { icon: Users, label: 'Unlimited concierge hours' },
      { icon: Shield, label: 'Dedicated account manager' },
    ],
  },
};

const STATUS_CONFIG = {
  'active': { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'trialing': { label: 'Trial', color: 'bg-blue-100 text-blue-800', icon: Clock },
  'past_due': { label: 'Past Due', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function MyMembershipPage() {
  const { profile } = useUserProfile();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembership();
  }, [profile.id]);

  const fetchMembership = async () => {
    if (!db || !profile.id) {
      // Use sample data for demo
      setSampleData();
      return;
    }

    try {
      const membershipsRef = collection(db, COLLECTIONS.MEMBERSHIPS);
      const q = query(
        membershipsRef,
        where('userId', '==', profile.id),
        where('status', 'in', ['active', 'trialing', 'past_due'])
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const membershipData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } as Membership;
        setMembership(membershipData);
      } else {
        setSampleData();
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const now = new Date();
    setMembership({
      id: 'sample-1',
      tier: 'core-capture',
      status: 'active',
      billingCycle: 'monthly',
      amount: 175000,
      currentPeriodStart: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      currentPeriodEnd: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() + 1, 1)),
      cancelAtPeriodEnd: false,
      metadata: {
        conciergeHoursUsed: 0.5,
        conciergeHoursLimit: 2,
      },
      createdAt: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 3, 15)),
    });
    setLoading(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Membership</h1>
          <p className="text-muted-foreground">
            Manage your KDM Consortium membership
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Membership</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join the KDM Consortium to access curated opportunities, 
              connect with teaming partners, and accelerate your government contracting success.
            </p>
            <Link href="/membership">
              <Button size="lg">
                View Membership Options
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[membership.tier];
  const statusConfig = STATUS_CONFIG[membership.status];
  const TierIcon = tierConfig.icon;
  const StatusIcon = statusConfig.icon;
  const daysRemaining = differenceInDays(
    membership.currentPeriodEnd.toDate(),
    new Date()
  );
  const conciergeUsed = membership.metadata?.conciergeHoursUsed || 0;
  const conciergeLimit = membership.metadata?.conciergeHoursLimit || 2;
  const conciergePercent = (conciergeUsed / conciergeLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Membership</h1>
          <p className="text-muted-foreground">
            Manage your KDM Consortium membership
          </p>
        </div>
        <Badge className={statusConfig.color} variant="outline">
          <StatusIcon className="h-4 w-4 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Membership Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TierIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{tierConfig.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {membership.billingCycle} billing
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(membership.amount)}</div>
                  <div className="text-sm text-muted-foreground">
                    /{membership.billingCycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Period */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Billing Period</span>
                  <span className="text-sm text-muted-foreground">
                    {daysRemaining} days remaining
                  </span>
                </div>
                <Progress value={((30 - daysRemaining) / 30) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{format(membership.currentPeriodStart.toDate(), 'MMM d, yyyy')}</span>
                  <span>{format(membership.currentPeriodEnd.toDate(), 'MMM d, yyyy')}</span>
                </div>
              </div>

              {/* Concierge Hours (if applicable) */}
              {membership.tier === 'core-capture' && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Concierge Hours</span>
                    <span className="text-sm text-muted-foreground">
                      {conciergeUsed} / {conciergeLimit} hours used
                    </span>
                  </div>
                  <Progress value={conciergePercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Hours reset at the start of each billing period
                  </p>
                </div>
              )}

              {/* Cancel Warning */}
              {membership.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Membership Ending</p>
                      <p className="text-sm text-yellow-700">
                        Your membership will end on {format(membership.currentPeriodEnd.toDate(), 'MMMM d, yyyy')}. 
                        You'll lose access to all member benefits after this date.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Keep My Membership
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Your Benefits</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {tierConfig.features.map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
              {membership.tier !== 'custom' && (
                <Link href="/membership">
                  <Button variant="default">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pursuits Joined
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 active, 1 won</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Events Attended
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">2 upcoming</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resources Downloaded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { date: 'Dec 1, 2025', amount: 175000, status: 'Paid' },
                { date: 'Nov 1, 2025', amount: 175000, status: 'Paid' },
                { date: 'Oct 1, 2025', amount: 175000, status: 'Paid' },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{invoice.date}</p>
                    <p className="text-muted-foreground">{formatCurrency(invoice.amount)}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {invoice.status}
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full">
                View All Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-lg font-medium">
                  {format(membership.createdAt.toDate(), 'MMMM yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Need Help?</p>
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
