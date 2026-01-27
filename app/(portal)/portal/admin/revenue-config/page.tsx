"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Percent,
  Calculator,
  Loader2,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Building2,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { mockCommissionRates } from "@/lib/mock-data/svp-admin-mock-data";
import { 
  CONSORTIUM_PARTNERS, 
  DEFAULT_ATTRIBUTION_PERCENTAGES,
  CONTRIBUTION_TYPE_LABELS,
  PARTNER_COLLECTIONS,
  type ConsortiumPartnerId,
  type PartnerProfileDoc,
  type PartnerAttributionDoc,
  type PayoutDoc,
} from "@/lib/partner-commission-schema";

// Mock data for partner commissions
const mockPartnerCommissions: PartnerAttributionDoc[] = [
  {
    id: "comm-1",
    transactionId: "txn-001",
    stripePaymentIntentId: "pi_123",
    clientId: "client-1",
    clientName: "ABC Manufacturing",
    clientEmail: "contact@abcmfg.com",
    transactionType: "membership",
    totalAmount: 5000,
    currency: "USD",
    attributions: [
      { partnerId: "vplus", partnerName: "Strategic Value Plus", contributionType: "service_delivery", percentage: 50, amount: 2500, status: "paid" },
      { partnerId: "ada", partnerName: "ADA Consulting", contributionType: "lead_generation", percentage: 20, amount: 1000, status: "paid" },
      { partnerId: "kdm-platform", partnerName: "KDM Platform Fee", contributionType: "platform_fee", percentage: 10, amount: 500, status: "paid" },
    ],
    totalCommissions: 4000,
    platformFee: 500,
    netAmount: 1000,
    overallStatus: "fully_paid",
    createdAt: Timestamp.fromDate(new Date("2025-01-15")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-15")),
  },
  {
    id: "comm-2",
    transactionId: "txn-002",
    stripePaymentIntentId: "pi_456",
    clientId: "client-2",
    clientName: "XYZ Defense Corp",
    clientEmail: "info@xyzdefense.com",
    transactionType: "cohort",
    totalAmount: 12000,
    currency: "USD",
    attributions: [
      { partnerId: "vplus", partnerName: "Strategic Value Plus", contributionType: "service_delivery", percentage: 50, amount: 6000, status: "pending" },
      { partnerId: "e3s", partnerName: "E3S Solutions", contributionType: "introduction", percentage: 20, amount: 2400, status: "pending" },
      { partnerId: "kdm-platform", partnerName: "KDM Platform Fee", contributionType: "platform_fee", percentage: 10, amount: 1200, status: "pending" },
    ],
    totalCommissions: 9600,
    platformFee: 1200,
    netAmount: 2400,
    overallStatus: "pending",
    createdAt: Timestamp.fromDate(new Date("2025-01-20")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-20")),
  },
];

const mockPartnerProfiles: PartnerProfileDoc[] = [
  {
    id: "partner-1",
    partnerId: "vplus",
    name: "V+",
    displayName: "Strategic Value Plus",
    contactName: "John Smith",
    contactEmail: "john@strategicvalueplus.com",
    paymentMethod: "stripe_connect",
    stripeConnectAccountId: "acct_123",
    autoPayoutEnabled: true,
    minimumPayoutAmount: 100,
    payoutFrequency: "weekly",
    holdPeriodDays: 7,
    attributionRules: [
      { contributionType: "lead_generation", percentage: 20, isActive: true },
      { contributionType: "service_delivery", percentage: 50, isActive: true },
      { contributionType: "introduction", percentage: 20, isActive: true },
    ],
    stats: { totalEarnings: 45000, pendingCommissions: 8500, paidCommissions: 36500, totalTransactions: 28 },
    isActive: true,
    createdAt: Timestamp.fromDate(new Date("2024-01-01")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-20")),
  },
  {
    id: "partner-2",
    partnerId: "ada",
    name: "ADA",
    displayName: "ADA Consulting",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@adaconsulting.com",
    paymentMethod: "paypal",
    paypalEmail: "payments@adaconsulting.com",
    autoPayoutEnabled: false,
    minimumPayoutAmount: 250,
    payoutFrequency: "monthly",
    holdPeriodDays: 14,
    attributionRules: [
      { contributionType: "lead_generation", percentage: 20, isActive: true },
      { contributionType: "service_delivery", percentage: 50, isActive: true },
      { contributionType: "introduction", percentage: 20, isActive: true },
    ],
    stats: { totalEarnings: 28000, pendingCommissions: 3200, paidCommissions: 24800, totalTransactions: 15 },
    isActive: true,
    createdAt: Timestamp.fromDate(new Date("2024-03-15")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-18")),
  },
  {
    id: "partner-3",
    partnerId: "e3s",
    name: "E3S",
    displayName: "E3S Solutions",
    contactName: "Mike Davis",
    contactEmail: "mike@e3ssolutions.com",
    paymentMethod: "bank_transfer",
    autoPayoutEnabled: false,
    minimumPayoutAmount: 500,
    payoutFrequency: "biweekly",
    holdPeriodDays: 7,
    attributionRules: [
      { contributionType: "lead_generation", percentage: 20, isActive: true },
      { contributionType: "service_delivery", percentage: 50, isActive: true },
      { contributionType: "introduction", percentage: 20, isActive: true },
    ],
    stats: { totalEarnings: 18500, pendingCommissions: 2400, paidCommissions: 16100, totalTransactions: 12 },
    isActive: true,
    createdAt: Timestamp.fromDate(new Date("2024-06-01")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-15")),
  },
];

const mockPayouts: PayoutDoc[] = [
  {
    id: "payout-1",
    partnerId: "vplus",
    partnerName: "Strategic Value Plus",
    partnerProfileId: "partner-1",
    amount: 8500,
    currency: "USD",
    paymentMethod: "stripe_connect",
    status: "completed",
    stripeTransferId: "tr_123",
    commissionIds: ["comm-1"],
    commissionCount: 1,
    scheduledDate: Timestamp.fromDate(new Date("2025-01-22")),
    completedAt: Timestamp.fromDate(new Date("2025-01-22")),
    retryCount: 0,
    requiresApproval: false,
    createdAt: Timestamp.fromDate(new Date("2025-01-15")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-22")),
  },
  {
    id: "payout-2",
    partnerId: "ada",
    partnerName: "ADA Consulting",
    partnerProfileId: "partner-2",
    amount: 3200,
    currency: "USD",
    paymentMethod: "paypal",
    status: "pending",
    commissionIds: ["comm-2"],
    commissionCount: 1,
    scheduledDate: Timestamp.fromDate(new Date("2025-01-27")),
    retryCount: 0,
    requiresApproval: true,
    createdAt: Timestamp.fromDate(new Date("2025-01-20")),
    updatedAt: Timestamp.fromDate(new Date("2025-01-20")),
  },
];

export default function RevenueConfigPage() {
  const [useMockData, setUseMockData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("commission");
  
  // Partner data states
  const [partners, setPartners] = useState<PartnerProfileDoc[]>([]);
  const [commissions, setCommissions] = useState<PartnerAttributionDoc[]>([]);
  const [payouts, setPayouts] = useState<PayoutDoc[]>([]);
  const [commissionSummary, setCommissionSummary] = useState({
    totalCommissions: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalTransactions: 0,
  });
  
  // Dialog states
  const [showAddPartnerDialog, setShowAddPartnerDialog] = useState(false);
  const [showEditPartnerDialog, setShowEditPartnerDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerProfileDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPartner, setNewPartner] = useState({
    partnerId: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    paymentMethod: "manual",
    autoPayoutEnabled: false,
    minimumPayoutAmount: 100,
  });
  
  // Transactions state
  interface StripeTransaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    description: string | null;
    customerEmail: string | null;
    customerName: string | null;
    created: number;
    metadata: Record<string, string>;
    source: 'stripe' | 'firestore';
    stripePaymentIntentId?: string;
    entityType?: string;
    entityName?: string;
  }
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  const [transactionSummary, setTransactionSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    pendingAmount: 0,
    failedCount: 0,
    succeededCount: 0,
  });
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionSource, setTransactionSource] = useState<'stripe' | 'firestore' | 'both'>('both');
  
  const [commissionRates, setCommissionRates] = useState([
    {
      id: "1",
      name: "Standard Partner",
      tier: "Standard",
      rate: 15,
      minRevenue: 0,
      maxRevenue: 100000,
      isActive: true
    },
    {
      id: "2",
      name: "Premium Partner",
      tier: "Premium",
      rate: 20,
      minRevenue: 100001,
      maxRevenue: 500000,
      isActive: true
    },
    {
      id: "3",
      name: "Elite Partner",
      tier: "Elite",
      rate: 25,
      minRevenue: 500001,
      maxRevenue: null,
      isActive: true
    }
  ]);

  useEffect(() => {
    if (useMockData) {
      loadMockData();
    } else {
      loadRealData();
    }
  }, [useMockData]);

  const loadMockData = () => {
    setLoading(true);
    setCommissionRates(mockCommissionRates);
    setPartners(mockPartnerProfiles);
    setCommissions(mockPartnerCommissions);
    setPayouts(mockPayouts);
    setCommissionSummary({
      totalCommissions: mockPartnerCommissions.reduce((s, c) => s + c.totalCommissions, 0),
      pendingAmount: mockPartnerCommissions
        .filter(c => c.overallStatus === "pending")
        .reduce((s, c) => s + c.totalCommissions, 0),
      paidAmount: mockPartnerCommissions
        .filter(c => c.overallStatus === "fully_paid")
        .reduce((s, c) => s + c.totalCommissions, 0),
      totalTransactions: mockPartnerCommissions.length,
    });
    setLoading(false);
  };

  const loadRealData = async () => {
    if (!db) {
      loadMockData();
      return;
    }

    try {
      setLoading(true);
      
      // Load commission rates
      const ratesSnapshot = await getDocs(collection(db, "commission_rates"));
      const rates = ratesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (rates.length > 0) {
        setCommissionRates(rates as any);
      }
      
      // Load partner profiles
      const partnersSnapshot = await getDocs(collection(db, PARTNER_COLLECTIONS.PARTNER_PROFILES));
      const partnerData = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerProfileDoc));
      setPartners(partnerData);
      
      // Load commissions
      const commissionsSnapshot = await getDocs(collection(db, PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS));
      const commissionData = commissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerAttributionDoc));
      setCommissions(commissionData);
      
      // Load payouts
      const payoutsSnapshot = await getDocs(collection(db, PARTNER_COLLECTIONS.PAYOUTS));
      const payoutData = payoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutDoc));
      setPayouts(payoutData);
      
      // Calculate summary
      setCommissionSummary({
        totalCommissions: commissionData.reduce((s, c) => s + c.totalCommissions, 0),
        pendingAmount: commissionData
          .filter(c => c.overallStatus === "pending")
          .reduce((s, c) => s + c.totalCommissions, 0),
        paidAmount: commissionData
          .filter(c => c.overallStatus === "fully_paid")
          .reduce((s, c) => s + c.totalCommissions, 0),
        totalTransactions: commissionData.length,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddPartner = async () => {
    if (!newPartner.partnerId || !newPartner.contactName || !newPartner.contactEmail) {
      return;
    }
    
    try {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPartners([...partners, data.partner]);
        setShowAddPartnerDialog(false);
        setNewPartner({
          partnerId: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          paymentMethod: "manual",
          autoPayoutEnabled: false,
          minimumPayoutAmount: 100,
        });
      }
    } catch (error) {
      console.error("Error adding partner:", error);
    }
  };
  
  const handleApprovePayout = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/admin/commissions/${payoutId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "admin" }),
      });
      
      if (response.ok) {
        setPayouts(payouts.map(p => 
          p.id === payoutId ? { ...p, status: "completed" as const } : p
        ));
      }
    } catch (error) {
      console.error("Error approving payout:", error);
    }
  };

  const handleEditPartner = (partner: PartnerProfileDoc) => {
    setEditingPartner({ ...partner });
    setShowEditPartnerDialog(true);
  };

  const handleUpdatePartner = async () => {
    if (!editingPartner) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/partners/${editingPartner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: editingPartner.contactName,
          contactEmail: editingPartner.contactEmail,
          contactPhone: editingPartner.contactPhone,
          paymentMethod: editingPartner.paymentMethod,
          stripeConnectAccountId: editingPartner.stripeConnectAccountId,
          paypalEmail: editingPartner.paypalEmail,
          autoPayoutEnabled: editingPartner.autoPayoutEnabled,
          minimumPayoutAmount: editingPartner.minimumPayoutAmount,
          payoutFrequency: editingPartner.payoutFrequency,
          holdPeriodDays: editingPartner.holdPeriodDays,
          isActive: editingPartner.isActive,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPartners(partners.map(p => 
          p.id === editingPartner.id ? data.partner : p
        ));
        setShowEditPartnerDialog(false);
        setEditingPartner(null);
      } else {
        const error = await response.json();
        console.error("Error updating partner:", error);
      }
    } catch (error) {
      console.error("Error updating partner:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm("Are you sure you want to delete this partner? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setPartners(partners.filter(p => p.id !== partnerId));
        if (editingPartner?.id === partnerId) {
          setShowEditPartnerDialog(false);
          setEditingPartner(null);
        }
      } else {
        const error = await response.json();
        console.error("Error deleting partner:", error);
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
    }
  };

  const handleTogglePartnerActive = async (partner: PartnerProfileDoc) => {
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !partner.isActive }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPartners(partners.map(p => 
          p.id === partner.id ? data.partner : p
        ));
      }
    } catch (error) {
      console.error("Error toggling partner status:", error);
    }
  };

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await fetch(`/api/admin/transactions?source=${transactionSource}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setTransactionSummary(data.summary || {
          totalTransactions: 0,
          totalAmount: 0,
          pendingAmount: 0,
          failedCount: 0,
          succeededCount: 0,
        });
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800">Succeeded</Badge>;
      case 'pending':
      case 'requires_payment_method':
      case 'requires_confirmation':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'canceled':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "No limit";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Revenue Configuration</h1>
          <p className="text-muted-foreground">
            Configure commission rates, revenue sharing, and payment rules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="mock-data"
              checked={useMockData}
              onCheckedChange={setUseMockData}
            />
            <Label htmlFor="mock-data" className="cursor-pointer">
              {useMockData ? "Mock Data" : "Live Data"}
            </Label>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Commission Tier
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v);
        if (v === 'transactions' && transactions.length === 0) {
          loadTransactions();
        }
      }} className="mb-6">
        <TabsList className="grid grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="commission">Commission Rates</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="sharing">Attribution</TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rate Tiers</CardTitle>
              <CardDescription>
                Configure commission rates based on revenue tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissionRates.map((tier) => (
                  <div key={tier.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700">
                        <Percent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{tier.name}</h3>
                          <Badge variant="outline">{tier.tier}</Badge>
                          <Badge variant={tier.isActive ? "default" : "secondary"}>
                            {tier.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium text-lg text-green-600">{tier.rate}%</span>
                          <span>•</span>
                          <span>
                            {formatCurrency(tier.minRevenue)} - {formatCurrency(tier.maxRevenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Commission Paid
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$234,567</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Commission Rate
                </CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5%</div>
                <p className="text-xs text-muted-foreground">
                  Across all partners
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Partners
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  +5 this quarter
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Stripe Transactions</h2>
              <p className="text-sm text-muted-foreground">View all payment transactions from Stripe and Firestore</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={transactionSource} onValueChange={(v: 'stripe' | 'firestore' | 'both') => setTransactionSource(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">All Sources</SelectItem>
                  <SelectItem value="stripe">Stripe Only</SelectItem>
                  <SelectItem value="firestore">Firestore Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadTransactions} disabled={loadingTransactions}>
                {loadingTransactions ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(transactionSummary.totalAmount)}</div>
                <p className="text-xs text-muted-foreground">From succeeded payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(transactionSummary.pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">Awaiting completion</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Succeeded</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionSummary.succeededCount}</div>
                <p className="text-xs text-muted-foreground">Successful payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{transactionSummary.failedCount}</div>
                <p className="text-xs text-muted-foreground">Failed or canceled</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                {transactions.length} transactions loaded from {transactionSource === 'both' ? 'Stripe & Firestore' : transactionSource}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                  <Button variant="outline" className="mt-4" onClick={loadTransactions}>
                    Load Transactions
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{formatDate(tx.created)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.customerName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{tx.customerEmail || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.description || tx.type}</p>
                            {tx.entityName && (
                              <p className="text-xs text-muted-foreground">{tx.entityName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(tx.amount)} {tx.currency}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tx.source === 'stripe' ? 'border-purple-500 text-purple-600' : 'border-orange-500 text-orange-600'}>
                            {tx.source === 'stripe' ? 'Stripe' : 'Firestore'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tx.source === 'stripe' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://dashboard.stripe.com/payments/${tx.id}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Consortium Partners</h2>
              <p className="text-sm text-muted-foreground">Manage partner profiles and payout settings</p>
            </div>
            <Dialog open={showAddPartnerDialog} onOpenChange={setShowAddPartnerDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Partner</DialogTitle>
                  <DialogDescription>Configure a new consortium partner for revenue sharing</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Partner</Label>
                    <Select value={newPartner.partnerId} onValueChange={(v) => setNewPartner({ ...newPartner, partnerId: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONSORTIUM_PARTNERS).filter(([id]) => id !== 'kdm-platform').map(([id, info]) => (
                          <SelectItem key={id} value={id}>{info.displayName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Contact Name</Label>
                    <Input 
                      className="mt-1" 
                      value={newPartner.contactName}
                      onChange={(e) => setNewPartner({ ...newPartner, contactName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input 
                      type="email" 
                      className="mt-1" 
                      value={newPartner.contactEmail}
                      onChange={(e) => setNewPartner({ ...newPartner, contactEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={newPartner.paymentMethod} onValueChange={(v) => setNewPartner({ ...newPartner, paymentMethod: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe_connect">Stripe Connect</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-Payout Enabled</Label>
                    <Switch 
                      checked={newPartner.autoPayoutEnabled}
                      onCheckedChange={(v) => setNewPartner({ ...newPartner, autoPayoutEnabled: v })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPartnerDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddPartner}>Add Partner</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-700">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{partner.displayName}</h3>
                          <Badge variant={partner.isActive ? "default" : "secondary"}>
                            {partner.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {partner.autoPayoutEnabled && (
                            <Badge variant="outline" className="text-green-600 border-green-600">Auto-Payout</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{partner.contactName} • {partner.contactEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(partner.stats.totalEarnings)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-lg font-semibold text-yellow-600">{formatCurrency(partner.stats.pendingCommissions)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-lg font-semibold">{partner.stats.totalTransactions}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPartner(partner)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePartner(partner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Partner Dialog */}
          <Dialog open={showEditPartnerDialog} onOpenChange={setShowEditPartnerDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Partner: {editingPartner?.displayName}</DialogTitle>
                <DialogDescription>Update partner profile and payout settings</DialogDescription>
              </DialogHeader>
              {editingPartner && (
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Name</Label>
                      <Input 
                        className="mt-1" 
                        value={editingPartner.contactName}
                        onChange={(e) => setEditingPartner({ ...editingPartner, contactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Contact Email</Label>
                      <Input 
                        type="email" 
                        className="mt-1" 
                        value={editingPartner.contactEmail}
                        onChange={(e) => setEditingPartner({ ...editingPartner, contactEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Contact Phone</Label>
                      <Input 
                        className="mt-1" 
                        value={editingPartner.contactPhone || ""}
                        onChange={(e) => setEditingPartner({ ...editingPartner, contactPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Select 
                        value={editingPartner.paymentMethod} 
                        onValueChange={(v) => setEditingPartner({ ...editingPartner, paymentMethod: v as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe_connect">Stripe Connect</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {editingPartner.paymentMethod === "stripe_connect" && (
                    <div>
                      <Label>Stripe Connect Account ID</Label>
                      <Input 
                        className="mt-1" 
                        placeholder="acct_..."
                        value={editingPartner.stripeConnectAccountId || ""}
                        onChange={(e) => setEditingPartner({ ...editingPartner, stripeConnectAccountId: e.target.value })}
                      />
                    </div>
                  )}
                  
                  {editingPartner.paymentMethod === "paypal" && (
                    <div>
                      <Label>PayPal Email</Label>
                      <Input 
                        type="email"
                        className="mt-1" 
                        value={editingPartner.paypalEmail || ""}
                        onChange={(e) => setEditingPartner({ ...editingPartner, paypalEmail: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Minimum Payout ($)</Label>
                      <Input 
                        type="number"
                        className="mt-1" 
                        value={editingPartner.minimumPayoutAmount}
                        onChange={(e) => setEditingPartner({ ...editingPartner, minimumPayoutAmount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Hold Period (days)</Label>
                      <Input 
                        type="number"
                        className="mt-1" 
                        value={editingPartner.holdPeriodDays}
                        onChange={(e) => setEditingPartner({ ...editingPartner, holdPeriodDays: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Payout Frequency</Label>
                      <Select 
                        value={editingPartner.payoutFrequency} 
                        onValueChange={(v) => setEditingPartner({ ...editingPartner, payoutFrequency: v as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Auto-Payout Enabled</Label>
                      <p className="text-sm text-muted-foreground">Automatically process payouts when threshold is met</p>
                    </div>
                    <Switch 
                      checked={editingPartner.autoPayoutEnabled}
                      onCheckedChange={(v) => setEditingPartner({ ...editingPartner, autoPayoutEnabled: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Partner Active</Label>
                      <p className="text-sm text-muted-foreground">Inactive partners will not receive new commissions</p>
                    </div>
                    <Switch 
                      checked={editingPartner.isActive}
                      onCheckedChange={(v) => setEditingPartner({ ...editingPartner, isActive: v })}
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Partner Statistics</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Earnings</p>
                        <p className="font-semibold text-green-600">{formatCurrency(editingPartner.stats.totalEarnings)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-semibold text-yellow-600">{formatCurrency(editingPartner.stats.pendingCommissions)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid</p>
                        <p className="font-semibold">{formatCurrency(editingPartner.stats.paidCommissions)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-semibold">{editingPartner.stats.totalTransactions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditPartnerDialog(false)}>Cancel</Button>
                <Button onClick={handleUpdatePartner} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="mt-6">
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(commissionSummary.totalCommissions)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(commissionSummary.pendingAmount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(commissionSummary.paidAmount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissionSummary.totalTransactions}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission History</CardTitle>
                  <CardDescription>All partner commission attributions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{commission.createdAt.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{commission.clientName}</p>
                          <p className="text-sm text-muted-foreground">{commission.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{commission.transactionType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(commission.totalAmount)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {commission.attributions.filter(a => a.partnerId !== 'kdm-platform').map((attr, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{attr.partnerName}:</span>{" "}
                              <span className="text-green-600">{formatCurrency(attr.amount)}</span>
                              <span className="text-muted-foreground ml-1">({attr.percentage}%)</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          commission.overallStatus === "fully_paid" ? "default" :
                          commission.overallStatus === "pending" ? "secondary" : "outline"
                        }>
                          {commission.overallStatus === "fully_paid" ? "Paid" : 
                           commission.overallStatus === "pending" ? "Pending" : "Partial"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payouts.filter(p => p.status === "pending").length} payouts awaiting processing
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(payouts.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payouts.filter(p => p.status === "completed").length} successful payouts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(payouts.filter(p => p.status === "failed").reduce((s, p) => s + p.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payouts.filter(p => p.status === "failed").length} payouts need attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payout Queue</CardTitle>
              <CardDescription>Manage and approve partner payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.partnerName}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payout.paymentMethod === "stripe_connect" ? "Stripe" :
                           payout.paymentMethod === "paypal" ? "PayPal" :
                           payout.paymentMethod === "bank_transfer" ? "Bank" : "Manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>{payout.scheduledDate.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          payout.status === "completed" ? "default" :
                          payout.status === "pending" ? "secondary" :
                          payout.status === "failed" ? "destructive" : "outline"
                        }>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payout.status === "pending" && payout.requiresApproval && (
                          <Button size="sm" onClick={() => handleApprovePayout(payout.id)}>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        )}
                        {payout.status === "failed" && (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="mr-1 h-4 w-4" />
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attribution Rules</CardTitle>
              <CardDescription>
                Configure default attribution percentages for partner contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <Label className="text-base font-semibold mb-4 block">
                    Default Attribution Percentages
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    These percentages determine how revenue is attributed to partners based on their contribution type.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label>Lead Generation</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue={DEFAULT_ATTRIBUTION_PERCENTAGES.lead_generation} className="bg-white" />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Partner who sourced the lead</p>
                    </div>
                    <div>
                      <Label>Service Delivery</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue={DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery} className="bg-white" />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Partner delivering the service</p>
                    </div>
                    <div>
                      <Label>Introduction</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue={DEFAULT_ATTRIBUTION_PERCENTAGES.introduction} className="bg-white" />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Partner who made the introduction</p>
                    </div>
                    <div>
                      <Label>Platform Fee</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="number" defaultValue={DEFAULT_ATTRIBUTION_PERCENTAGES.platform_fee} className="bg-white" />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">KDM Platform operational fee</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-semibold mb-4 block">
                    Payout Settings
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Default Hold Period (days)</Label>
                      <Input type="number" defaultValue="7" className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">Days before commission is eligible for payout</p>
                    </div>
                    <div>
                      <Label>Minimum Payout Amount</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground">$</span>
                        <Input type="number" defaultValue="100" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Minimum balance required for payout</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-semibold mb-4 block">
                    Notification Settings
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notify on Pending Commission</Label>
                        <p className="text-xs text-muted-foreground">Email partners when a commission is pending</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notify on Payout Completion</Label>
                        <p className="text-xs text-muted-foreground">Email partners when payout is processed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notify on Payout Failure</Label>
                        <p className="text-xs text-muted-foreground">Email partners and admins on payout failures</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <Button>Save Attribution Rules</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
