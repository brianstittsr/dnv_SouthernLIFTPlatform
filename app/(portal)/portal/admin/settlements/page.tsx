'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { 
  DollarSign, 
  Calendar,
  FileText,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/schema';

interface Settlement {
  id: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  programRevenues: {
    membershipDues: number;
    eventTickets: number;
    sponsorFees: number;
    pursuitPacks: number;
    other: number;
    total: number;
  };
  directProgramCosts: {
    processorFees: number;
    chargebacks: number;
    refunds: number;
    fraudLosses: number;
    thirdPartyCosts: number;
    total: number;
  };
  platformRunCostAllowance: number;
  costRecoveryPool: number;
  netProgramRevenue: number;
  kdmShare: number;
  vplusShare: number;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  pdfUrl?: string;
  notes?: string;
  createdAt: Timestamp;
}

const STATUS_CONFIG = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  'pending': { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'approved': { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  'paid': { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function SettlementsAdminPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    if (!db) {
      setSampleData();
      return;
    }

    try {
      const settlementsRef = collection(db, COLLECTIONS.SETTLEMENTS);
      const q = query(settlementsRef, orderBy('periodEnd', 'desc'));
      const snapshot = await getDocs(q);

      const settlementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Settlement[];

      if (settlementsData.length === 0) {
        setSampleData();
      } else {
        setSettlements(settlementsData);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const now = new Date();
    const sampleSettlements: Settlement[] = [];

    // Generate last 6 months of settlements
    for (let i = 1; i <= 6; i++) {
      const periodEnd = endOfMonth(subMonths(now, i));
      const periodStart = startOfMonth(subMonths(now, i));
      
      const membershipDues = 7500000 + Math.floor(Math.random() * 2000000);
      const eventTickets = 1500000 + Math.floor(Math.random() * 500000);
      const sponsorFees = 2000000 + Math.floor(Math.random() * 1000000);
      const pursuitPacks = 500000 + Math.floor(Math.random() * 300000);
      const other = Math.floor(Math.random() * 100000);
      const total = membershipDues + eventTickets + sponsorFees + pursuitPacks + other;

      const processorFees = Math.floor(total * 0.029);
      const chargebacks = Math.floor(Math.random() * 50000);
      const refunds = Math.floor(Math.random() * 100000);
      const fraudLosses = 0;
      const thirdPartyCosts = Math.floor(Math.random() * 50000);
      const costsTotal = processorFees + chargebacks + refunds + fraudLosses + thirdPartyCosts;

      const platformRunCostAllowance = 0;
      const costRecoveryPool = 0;
      const netProgramRevenue = total - costsTotal - platformRunCostAllowance - costRecoveryPool;
      const kdmShare = Math.floor(netProgramRevenue * 0.5);
      const vplusShare = netProgramRevenue - kdmShare;

      sampleSettlements.push({
        id: `settlement-${i}`,
        periodStart: Timestamp.fromDate(periodStart),
        periodEnd: Timestamp.fromDate(periodEnd),
        programRevenues: {
          membershipDues,
          eventTickets,
          sponsorFees,
          pursuitPacks,
          other,
          total,
        },
        directProgramCosts: {
          processorFees,
          chargebacks,
          refunds,
          fraudLosses,
          thirdPartyCosts,
          total: costsTotal,
        },
        platformRunCostAllowance,
        costRecoveryPool,
        netProgramRevenue,
        kdmShare,
        vplusShare,
        status: i === 1 ? 'draft' : i === 2 ? 'pending' : 'paid',
        createdAt: Timestamp.fromDate(new Date(periodEnd.getTime() + 5 * 24 * 60 * 60 * 1000)),
      });
    }

    setSettlements(sampleSettlements);
    setLoading(false);
  };

  const handleStatusChange = async (settlementId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/settlements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchSettlements();
      }
    } catch (error) {
      console.error('Error updating settlement:', error);
    }
  };

  const handleCreateSettlement = async () => {
    const now = new Date();
    const periodEnd = endOfMonth(subMonths(now, 1));
    const periodStart = startOfMonth(subMonths(now, 1));

    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          programRevenues: {
            membershipDues: 0,
            eventTickets: 0,
            sponsorFees: 0,
            pursuitPacks: 0,
            other: 0,
          },
          directProgramCosts: {
            processorFees: 0,
            chargebacks: 0,
            refunds: 0,
            fraudLosses: 0,
            thirdPartyCosts: 0,
          },
        }),
      });

      if (response.ok) {
        fetchSettlements();
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const getYearlyTotals = () => {
    const yearSettlements = settlements.filter(s => 
      s.periodEnd.toDate().getFullYear().toString() === yearFilter
    );

    return {
      totalRevenue: yearSettlements.reduce((sum, s) => sum + s.programRevenues.total, 0),
      totalCosts: yearSettlements.reduce((sum, s) => sum + s.directProgramCosts.total, 0),
      totalNet: yearSettlements.reduce((sum, s) => sum + s.netProgramRevenue, 0),
      kdmTotal: yearSettlements.reduce((sum, s) => sum + s.kdmShare, 0),
      vplusTotal: yearSettlements.reduce((sum, s) => sum + s.vplusShare, 0),
    };
  };

  const yearlyTotals = getYearlyTotals();
  const years = [...new Set(settlements.map(s => s.periodEnd.toDate().getFullYear()))].sort((a, b) => b - a);

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
          <h1 className="text-3xl font-bold">Settlement Statements</h1>
          <p className="text-muted-foreground">
            Monthly revenue settlements between KDM and V+
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Settlement
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(yearlyTotals.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(yearlyTotals.totalCosts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(yearlyTotals.totalNet)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">KDM Share (50%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(yearlyTotals.kdmTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">V+ Share (50%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(yearlyTotals.vplusTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settlements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Settlements</CardTitle>
          <CardDescription>Click on a settlement to view details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Gross Revenue</TableHead>
                <TableHead className="text-right">Costs</TableHead>
                <TableHead className="text-right">Net Revenue</TableHead>
                <TableHead className="text-right">KDM Share</TableHead>
                <TableHead className="text-right">V+ Share</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements
                .filter(s => s.periodEnd.toDate().getFullYear().toString() === yearFilter)
                .map(settlement => {
                  const statusConfig = STATUS_CONFIG[settlement.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow 
                      key={settlement.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedSettlement(settlement);
                        setShowDetailDialog(true);
                      }}
                    >
                      <TableCell>
                        <div className="font-medium">
                          {format(settlement.periodStart.toDate(), 'MMM yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(settlement.periodStart.toDate(), 'MMM d')} - {format(settlement.periodEnd.toDate(), 'MMM d')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(settlement.programRevenues.total)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        ({formatCurrency(settlement.directProgramCosts.total)})
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(settlement.netProgramRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(settlement.kdmShare)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(settlement.vplusShare)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          {settlement.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleStatusChange(settlement.id, 'pending')}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Settlement Statement - {selectedSettlement && format(selectedSettlement.periodStart.toDate(), 'MMMM yyyy')}
            </DialogTitle>
            <DialogDescription>
              Revenue sharing statement between KDM & Associates and V+
            </DialogDescription>
          </DialogHeader>
          
          {selectedSettlement && (
            <div className="space-y-6">
              {/* Period & Status */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {format(selectedSettlement.periodStart.toDate(), 'MMMM d, yyyy')} - {format(selectedSettlement.periodEnd.toDate(), 'MMMM d, yyyy')}
                  </p>
                </div>
                <Badge className={STATUS_CONFIG[selectedSettlement.status].color}>
                  {STATUS_CONFIG[selectedSettlement.status].label}
                </Badge>
              </div>

              <Separator />

              {/* Revenue Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Program Revenues</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Membership Dues</span>
                    <span>{formatCurrency(selectedSettlement.programRevenues.membershipDues)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Tickets</span>
                    <span>{formatCurrency(selectedSettlement.programRevenues.eventTickets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sponsor Fees</span>
                    <span>{formatCurrency(selectedSettlement.programRevenues.sponsorFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pursuit Packs</span>
                    <span>{formatCurrency(selectedSettlement.programRevenues.pursuitPacks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>{formatCurrency(selectedSettlement.programRevenues.other)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(selectedSettlement.programRevenues.total)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Costs Breakdown */}
              <div>
                <h4 className="font-medium mb-3">Direct Program Costs</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Payment Processor Fees</span>
                    <span className="text-red-600">({formatCurrency(selectedSettlement.directProgramCosts.processorFees)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chargebacks</span>
                    <span className="text-red-600">({formatCurrency(selectedSettlement.directProgramCosts.chargebacks)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refunds</span>
                    <span className="text-red-600">({formatCurrency(selectedSettlement.directProgramCosts.refunds)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Third-Party Costs</span>
                    <span className="text-red-600">({formatCurrency(selectedSettlement.directProgramCosts.thirdPartyCosts)})</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Costs</span>
                    <span className="text-red-600">({formatCurrency(selectedSettlement.directProgramCosts.total)})</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Net & Split */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Net Program Revenue</span>
                    <span className="text-green-600">{formatCurrency(selectedSettlement.netProgramRevenue)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>KDM Share (50%)</span>
                    <span className="font-medium">{formatCurrency(selectedSettlement.kdmShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>V+ Share (50%)</span>
                    <span className="font-medium">{formatCurrency(selectedSettlement.vplusShare)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {selectedSettlement?.status === 'draft' && (
              <Button onClick={() => {
                handleStatusChange(selectedSettlement.id, 'pending');
                setShowDetailDialog(false);
              }}>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
            {selectedSettlement?.status === 'pending' && (
              <Button onClick={() => {
                handleStatusChange(selectedSettlement.id, 'approved');
                setShowDetailDialog(false);
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Settlement</DialogTitle>
            <DialogDescription>
              Generate a new settlement statement for the previous month.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will create a draft settlement for {format(startOfMonth(subMonths(new Date(), 1)), 'MMMM yyyy')}.
              Revenue data will be automatically aggregated from platform transactions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSettlement}>
              <Plus className="h-4 w-4 mr-2" />
              Create Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
