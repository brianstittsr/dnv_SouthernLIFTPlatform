'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

interface Meemerging businessrship {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  tier: 'core-capture' | 'pursuit-pack' | 'custom';
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  amount: nuemerging businessr;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: Timestamp;
}

const STATUS_CONFIG = {
  'active': { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'trialing': { label: 'Trial', color: 'bg-blue-100 text-blue-800', icon: Clock },
  'past_due': { label: 'Past Due', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const TIER_CONFIG = {
  'core-capture': { label: 'Core Capture', color: 'bg-blue-100 text-blue-800' },
  'pursuit-pack': { label: 'Pursuit Pack', color: 'bg-green-100 text-green-800' },
  'custom': { label: 'Custom', color: 'bg-purple-100 text-purple-800' },
};

export default function Meemerging businessrshipsAdminPage() {
  const [meemerging businessrships, setMeemerging businessrships] = useState<Meemerging businessrship[]>([]);
  const [filteredMeemerging businessrships, setFilteredMeemerging businessrships] = useState<Meemerging businessrship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedMeemerging businessrship, setSelectedMeemerging businessrship] = useState<Meemerging businessrship | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchMeemerging businessrships();
  }, []);

  useEffect(() => {
    filterMeemerging businessrships();
  }, [meemerging businessrships, searchQuery, statusFilter, tierFilter]);

  const fetchMeemerging businessrships = async () => {
    if (!db) {
      // Sample data for demo
      setSampleData();
      return;
    }

    try {
      const meemerging businessrshipsRef = collection(db, COLLECTIONS.MEemerging businessRSHIPS);
      const q = query(meemerging businessrshipsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const meemerging businessrshipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meemerging businessrship[];

      // Fetch user details for each meemerging businessrship
      for (const meemerging businessrship of meemerging businessrshipsData) {
        try {
          const userRef = doc(db, COLLECTIONS.USERS, meemerging businessrship.userId);
          const userSnap = await getDocs(query(collection(db, COLLECTIONS.USERS)));
          const user = userSnap.docs.find(d => d.id === meemerging businessrship.userId);
          if (user) {
            const userData = user.data();
            meemerging businessrship.userName = userData.name;
            meemerging businessrship.userEmail = userData.email;
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }

      if (meemerging businessrshipsData.length === 0) {
        setSampleData();
      } else {
        setMeemerging businessrships(meemerging businessrshipsData);
      }
    } catch (error) {
      console.error('Error fetching meemerging businessrships:', error);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const now = new Date();
    const sampleMeemerging businessrships: Meemerging businessrship[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@techforward.com',
        tier: 'core-capture',
        status: 'active',
        billingCycle: 'monthly',
        amount: 175000,
        stripeSubscriptionId: 'sub_1234',
        stripeCustomerId: 'cus_1234',
        currentPeriodStart: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        currentPeriodEnd: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() + 1, 1)),
        cancelAtPeriodEnd: false,
        createdAt: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 3, 15)),
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Michael Chen',
        userEmail: 'mchen@precisionmfg.com',
        tier: 'core-capture',
        status: 'active',
        billingCycle: 'annual',
        amount: 1890000,
        stripeSubscriptionId: 'sub_2345',
        stripeCustomerId: 'cus_2345',
        currentPeriodStart: Timestamp.fromDate(new Date(now.getFullYear(), 0, 1)),
        currentPeriodEnd: Timestamp.fromDate(new Date(now.getFullYear() + 1, 0, 1)),
        cancelAtPeriodEnd: false,
        createdAt: Timestamp.fromDate(new Date(now.getFullYear() - 1, 11, 20)),
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Amanda Williams',
        userEmail: 'awilliams@strategiccg.com',
        tier: 'pursuit-pack',
        status: 'active',
        billingCycle: 'monthly',
        amount: 50000,
        stripeSubscriptionId: 'sub_3456',
        stripeCustomerId: 'cus_3456',
        currentPeriodStart: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 10)),
        currentPeriodEnd: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() + 1, 10)),
        cancelAtPeriodEnd: false,
        createdAt: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'James Rodriguez',
        userEmail: 'jrodriguez@buildright.com',
        tier: 'core-capture',
        status: 'trialing',
        billingCycle: 'monthly',
        amount: 175000,
        stripeSubscriptionId: 'sub_4567',
        stripeCustomerId: 'cus_4567',
        currentPeriodStart: Timestamp.fromDate(now),
        currentPeriodEnd: Timestamp.fromDate(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)),
        cancelAtPeriodEnd: false,
        createdAt: Timestamp.fromDate(now),
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Lisa Park',
        userEmail: 'lpark@healthtechinno.com',
        tier: 'custom',
        status: 'past_due',
        billingCycle: 'monthly',
        amount: 250000,
        stripeSubscriptionId: 'sub_5678',
        stripeCustomerId: 'cus_5678',
        currentPeriodStart: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 1, 5)),
        currentPeriodEnd: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 5)),
        cancelAtPeriodEnd: false,
        createdAt: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth() - 6, 5)),
      },
    ];
    setMeemerging businessrships(sampleMeemerging businessrships);
    setLoading(false);
  };

  const filterMeemerging businessrships = () => {
    let filtered = [...meemerging businessrships];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.userName?.toLowerCase().includes(query) ||
        m.userEmail?.toLowerCase().includes(query) ||
        m.stripeCustomerId?.includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(m => m.tier === tierFilter);
    }

    setFilteredMeemerging businessrships(filtered);
  };

  const handleCancelMeemerging businessrship = async (immediate: boolean) => {
    if (!selectedMeemerging businessrship) return;

    try {
      const response = await fetch(`/api/meemerging businessrships/${selectedMeemerging businessrship.id}?immediate=${immediate}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMeemerging businessrships();
        setShowCancelDialog(false);
        setSelectedMeemerging businessrship(null);
      }
    } catch (error) {
      console.error('Error cancelling meemerging businessrship:', error);
    }
  };

  const formatCurrency = (value: nuemerging businessr) => {
    return new Intl.Nuemerging businessrFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const getStats = () => {
    const active = meemerging businessrships.filter(m => m.status === 'active').length;
    const trialing = meemerging businessrships.filter(m => m.status === 'trialing').length;
    const pastDue = meemerging businessrships.filter(m => m.status === 'past_due').length;
    const mrr = meemerging businessrships
      .filter(m => m.status === 'active' && m.billingCycle === 'monthly')
      .reduce((sum, m) => sum + m.amount, 0);
    const arr = meemerging businessrships
      .filter(m => m.status === 'active')
      .reduce((sum, m) => sum + (m.billingCycle === 'monthly' ? m.amount * 12 : m.amount), 0);

    return { active, trialing, pastDue, mrr, arr };
  };

  const stats = getStats();

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
          <h1 className="text-3xl font-bold">Meemerging businessrship Management</h1>
          <p className="text-muted-foreground">
            Manage consortium meemerging businessrships and subscriptions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Meemerging businessr
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Meemerging businessrs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trialing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Past Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pastDue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Annual Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.arr)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {Object.entries(TIER_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Meemerging businessrships Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meemerging businessr</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeemerging businessrships.map(meemerging businessrship => {
                const statusConfig = STATUS_CONFIG[meemerging businessrship.status];
                const tierConfig = TIER_CONFIG[meemerging businessrship.tier];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={meemerging businessrship.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{meemerging businessrship.userName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{meemerging businessrship.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      {meemerging businessrship.cancelAtPeriodEnd && (
                        <p className="text-xs text-red-500 mt-1">Cancels at period end</p>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{meemerging businessrship.billingCycle}</TableCell>
                    <TableCell>{formatCurrency(meemerging businessrship.amount)}</TableCell>
                    <TableCell>
                      {format(meemerging businessrship.currentPeriodEnd.toDate(), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="h-4 w-4 mr-2" />
                            View in Stripe
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Change Tier</DropdownMenuItem>
                          <DropdownMenuItem>Extend Trial</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedMeemerging businessrship(meemerging businessrship);
                              setShowCancelDialog(true);
                            }}
                          >
                            Cancel Meemerging businessrship
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Meemerging businessrship</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the meemerging businessrship for {selectedMeemerging businessrship?.userName}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Choose how to cancel this meemerging businessrship:
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleCancelMeemerging businessrship(false)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Cancel at period end
                <span className="ml-auto text-xs text-muted-foreground">
                  {selectedMeemerging businessrship && format(selectedMeemerging businessrship.currentPeriodEnd.toDate(), 'MMM d, yyyy')}
                </span>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => handleCancelMeemerging businessrship(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel immediately
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>
              Keep Meemerging businessrship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
