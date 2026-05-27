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
  Eye,
  Calendar,
  Send,
  Link,
  Mail,
  FileText,
  XCircle,
  Ban,
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


export default function RevenueConfigPage() {
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
  const [selectedTransaction, setSelectedTransaction] = useState<StripeTransaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  
  // Billing history state
  interface MonthlyBillingGroup {
    month: string;
    totalRevenue: number;
    totalCustomers: number;
    records: Array<{
      customerId: string;
      customerName: string;
      customerEmail: string;
      month: string;
      amount: number;
      currency: string;
      status: string;
      invoiceId?: string;
      subscriptionId?: string;
      tier?: string;
    }>;
  }
  const [billingHistory, setBillingHistory] = useState<MonthlyBillingGroup[]>([]);
  const [billingSummary, setBillingSummary] = useState({
    totalRevenue: 0,
    uniqueCustomers: 0,
    averageMonthlyRevenue: 0,
    monthsIncluded: 0,
  });
  const [loadingBillingHistory, setLoadingBillingHistory] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  
  const [commissionRates, setCommissionRates] = useState<any[]>([]);

  // Payment request states
  interface PaymentRequest {
    id: string;
    amount: number;
    currency: string;
    status: string | null;
    customerEmail: string | null;
    customerName: string | null;
    description: string | null;
    hostedUrl: string | null;
    paymentLinkUrl: string | null;
    memo: string | null;
    dueDate: string | null;
    created: number;
    paidAt: number | null;
  }
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showCreateRequestDialog, setShowCreateRequestDialog] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    amount: "",
    currency: "usd",
    description: "",
    customerEmail: "",
    customerName: "",
    memo: "",
    dueDate: "",
  });
  const [createdRequest, setCreatedRequest] = useState<{ paymentLinkUrl?: string; hostedUrl?: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Stripe subscriptions state
  interface StripeSubscription {
    id: string;
    status: string;
    customer: {
      id: string;
      email: string;
      name: string;
    };
    items: {
      data: Array<{
        id: string;
        price: {
          id: string;
          unit_amount: number;
          currency: string;
          nickname: string;
        };
        quantity: number;
      }>;
    };
    current_period_end: number;
    cancel_at_period_end: boolean;
    created: number;
  }
  const [subscriptions, setSubscriptions] = useState<StripeSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [showCreateSubscriptionDialog, setShowCreateSubscriptionDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<StripeSubscription | null>(null);
  const [newSubscription, setNewSubscription] = useState({
    customerId: "",
    priceId: "",
    quantity: 1,
    trialDays: 0,
  });
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("requested_by_customer");
  const [creatingSubscription, setCreatingSubscription] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  // Stripe Management state
  const [stripeProducts, setStripeProducts] = useState<any[]>([]);
  const [stripeRefunds, setStripeRefunds] = useState<any[]>([]);
  const [stripeStats, setStripeStats] = useState<any>({});
  const [loadingStripeProducts, setLoadingStripeProducts] = useState(false);
  const [loadingStripeRefunds, setLoadingStripeRefunds] = useState(false);
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false);
  const [showCreateRefundDialog, setShowCreateRefundDialog] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [selectedStripeProduct, setSelectedStripeProduct] = useState<any>(null);
  const [newStripeProduct, setNewStripeProduct] = useState({
    name: '',
    description: '',
    active: true,
    prices: [
      { unit_amount: 0, currency: 'usd', recurring: { interval: 'month' } }
    ]
  });
  const [newRefund, setNewRefund] = useState({
    paymentIntentId: '',
    amount: '',
    reason: 'requested_by_customer'
  });

  const loadPaymentRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch("/api/stripe/payment-request?limit=50");
      const data = await res.json();
      if (data.requests) setPaymentRequests(data.requests);
    } catch (err) {
      console.error("Failed to load payment requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCancelRequest = async (invoiceId: string) => {
    setCancellingId(invoiceId);
    try {
      const res = await fetch("/api/stripe/payment-request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPaymentRequests(prev =>
        prev.map(r => r.id === invoiceId ? { ...r, status: data.status === "cancelled" ? "cancelled" : "void" } : r)
      );
      setConfirmCancelId(null);
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancellingId(null);
    }
  };

  // Subscription management functions
  const loadSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const res = await fetch("/api/admin/subscriptions?limit=50");
      const data = await res.json();
      if (data.subscriptions) setSubscriptions(data.subscriptions);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!newSubscription.customerId || !newSubscription.priceId) {
      return;
    }
    setCreatingSubscription(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubscription),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubscriptions(prev => [data.subscription, ...prev]);
      setShowCreateSubscriptionDialog(false);
      setNewSubscription({ customerId: "", priceId: "", quantity: 1, trialDays: 0 });
    } catch (err) {
      console.error("Failed to create subscription:", err);
    } finally {
      setCreatingSubscription(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean = true) => {
    setCancelingSubscription(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: cancelAtPeriodEnd ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: cancelAtPeriodEnd ? JSON.stringify({ cancelAtPeriodEnd: true }) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubscriptions(prev =>
        prev.map(s => s.id === subscriptionId ? data.subscription : s)
      );
      setShowCancelSubscriptionDialog(false);
      setSelectedSubscription(null);
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setCancelingSubscription(false);
    }
  };

  const handleRefundPayment = async (paymentIntentId: string) => {
    setProcessingRefund(true);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          amount: refundAmount ? parseInt(refundAmount) * 100 : undefined,
          reason: refundReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowRefundDialog(false);
      setRefundAmount("");
      setRefundReason("requested_by_customer");
      await loadSubscriptions(); // Refresh to see updated status
    } catch (err) {
      console.error("Failed to process refund:", err);
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.amount || !newRequest.customerEmail || !newRequest.description) {
      return;
    }
    setSendingRequest(true);
    try {
      const res = await fetch("/api/stripe/payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRequest,
          amount: parseFloat(newRequest.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedRequest({ paymentLinkUrl: data.paymentLink?.url, hostedUrl: data.invoice?.hostedUrl });
      setPaymentRequests(prev => [{
        id: data.invoice.id,
        amount: parseFloat(newRequest.amount),
        currency: newRequest.currency,
        status: "open", // newly sent invoice is always open (awaiting payment)
        customerEmail: newRequest.customerEmail,
        customerName: newRequest.customerName || null,
        description: newRequest.description,
        hostedUrl: data.invoice.hostedUrl,
        paymentLinkUrl: data.paymentLink?.url,
        memo: newRequest.memo || null,
        dueDate: newRequest.dueDate || null,
        created: Date.now() / 1000,
        paidAt: null,
      }, ...prev]);
      setNewRequest({ amount: "", currency: "usd", description: "", customerEmail: "", customerName: "", memo: "", dueDate: "" });
    } catch (err) {
      console.error("Failed to create payment request:", err);
    } finally {
      setSendingRequest(false);
    }
  };

  // Stripe Management functions
  const loadStripeProducts = async () => {
    setLoadingStripeProducts(true);
    try {
      const res = await fetch('/api/admin/stripe-products-simple');
      const data = await res.json();
      if (data.products) {
        setStripeProducts(data.products);
        setStripeStats(data.summary);
      }
    } catch (err) {
      console.error('Failed to load Stripe products:', err);
    } finally {
      setLoadingStripeProducts(false);
    }
  };

  const loadStripeRefunds = async () => {
    setLoadingStripeRefunds(true);
    try {
      const res = await fetch('/api/admin/stripe-refunds-simple');
      const data = await res.json();
      if (data.refunds) {
        setStripeRefunds(data.refunds);
        setStripeStats((prev: any) => ({ ...prev, refunds: data.stats }));
      }
    } catch (err) {
      console.error('Failed to load Stripe refunds:', err);
    } finally {
      setLoadingStripeRefunds(false);
    }
  };

  const handleCreateStripeProduct = async () => {
    if (!newStripeProduct.name) return;
    
    try {
      const res = await fetch('/api/admin/stripe-products-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStripeProduct)
      });
      
      if (res.ok) {
        const data = await res.json();
        setStripeProducts(prev => [data.product, ...prev]);
        setShowCreateProductDialog(false);
        setNewStripeProduct({
          name: '',
          description: '',
          active: true,
          prices: [{ unit_amount: 0, currency: 'usd', recurring: { interval: 'month' } }]
        });
      }
    } catch (err) {
      console.error('Failed to create Stripe product:', err);
    }
  };

  const handleCreateRefund = async () => {
    if (!newRefund.paymentIntentId) return;
    
    try {
      const res = await fetch('/api/admin/stripe-refunds-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRefund)
      });
      
      if (res.ok) {
        const data = await res.json();
        setStripeRefunds(prev => [data.refund, ...prev]);
        setShowCreateRefundDialog(false);
        setNewRefund({
          paymentIntentId: '',
          amount: '',
          reason: 'requested_by_customer'
        });
      }
    } catch (err) {
      console.error('Failed to create refund:', err);
    }
  };

  const handleSyncProducts = async () => {
    setSyncingProducts(true);
    try {
      const res = await fetch('/api/admin/stripe-sync-simple', {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Sync results:', data);
        await loadStripeProducts(); // Refresh the products list
      }
    } catch (err) {
      console.error('Failed to sync products:', err);
    } finally {
      setSyncingProducts(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    if (!db) {
      console.error("Firebase not initialized");
      setLoading(false);
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
      
      // Load commissions - filter out test API key transactions
      const commissionsSnapshot = await getDocs(collection(db, PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS));
      const commissionData = commissionsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PartnerAttributionDoc))
        .filter(commission => {
          // Only include transactions created with live production API key
          // Filter out test_* payment intent IDs which indicate test API key usage
          return !commission.stripePaymentIntentId?.startsWith('pi_test_');
        });
      setCommissions(commissionData);
      
      // Load payouts - filter out test API key transactions
      const payoutsSnapshot = await getDocs(collection(db, PARTNER_COLLECTIONS.PAYOUTS));
      const payoutData = payoutsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PayoutDoc))
        .filter(payout => {
          // Only include payouts from live production transactions
          return !payout.stripeTransferId?.startsWith('tr_test_');
        });
      setPayouts(payoutData);
      
      // Calculate summary - only from live production transactions
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
        
        // Filter out test API key transactions - only show live production data
        const liveTransactions = (data.transactions || []).filter((tx: StripeTransaction) => {
          // Filter out test payment intents (test_* prefix indicates test API key)
          return !tx.id?.startsWith('pi_test_') && !tx.id?.startsWith('test_');
        });
        
        // Recalculate summary for live transactions only
        const liveSummary = {
          totalTransactions: liveTransactions.length,
          totalAmount: liveTransactions
            .filter((tx: StripeTransaction) => tx.status === 'succeeded')
            .reduce((sum: number, tx: StripeTransaction) => sum + tx.amount, 0),
          pendingAmount: liveTransactions
            .filter((tx: StripeTransaction) => tx.status === 'pending' || tx.status === 'processing')
            .reduce((sum: number, tx: StripeTransaction) => sum + tx.amount, 0),
          failedCount: liveTransactions.filter((tx: StripeTransaction) => tx.status === 'failed' || tx.status === 'canceled').length,
          succeededCount: liveTransactions.filter((tx: StripeTransaction) => tx.status === 'succeeded').length,
        };
        
        setTransactions(liveTransactions);
        setTransactionSummary(liveSummary);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadBillingHistory = async () => {
    setLoadingBillingHistory(true);
    try {
      const response = await fetch('/api/admin/billing-history?monthsBack=12');
      if (response.ok) {
        const data = await response.json();
        setBillingHistory(data.monthlyBilling || []);
        setBillingSummary(data.summary || {
          totalRevenue: 0,
          uniqueCustomers: 0,
          averageMonthlyRevenue: 0,
          monthsIncluded: 0,
        });
      }
    } catch (error) {
      console.error("Error loading billing history:", error);
    } finally {
      setLoadingBillingHistory(false);
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
            Configure commission rates, revenue sharing, and payment rules (Live Data Only)
          </p>
        </div>
        <div className="flex items-center gap-4">
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
        if (v === 'billing-history' && billingHistory.length === 0) {
          loadBillingHistory();
        }
        if (v === 'payment-requests' && paymentRequests.length === 0) {
          loadPaymentRequests();
        }
        if (v === 'subscriptions' && subscriptions.length === 0) {
          loadSubscriptions();
        }
        if (v === 'stripe-management' && stripeProducts.length === 0) {
          loadStripeProducts();
          loadStripeRefunds();
        }
      }} className="mb-6">
        <TabsList className="grid grid-cols-10 w-full max-w-9xl">
          <TabsTrigger value="commission">Commission Rates</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="sharing">Attribution</TabsTrigger>
          <TabsTrigger value="subscriptions">
            <CreditCard className="h-3 w-3 mr-1" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="payment-requests">
            <Send className="h-3 w-3 mr-1" />
            Payment Requests
          </TabsTrigger>
          <TabsTrigger value="stripe-management">
            <Building2 className="h-3 w-3 mr-1" />
            Stripe Management
          </TabsTrigger>
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
                <div className="text-2xl font-bold">{formatCurrency(commissionSummary.paidAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  From live production transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Commissions
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(commissionSummary.pendingAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Partners
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partners.length}</div>
                <p className="text-xs text-muted-foreground">
                  Configured partners
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
              <p className="text-sm text-muted-foreground">Live production transactions only (test API key transactions filtered out)</p>
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
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setShowTransactionDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {tx.source === 'stripe' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://dashboard.stripe.com/payments/${tx.id}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing History Tab */}
        <TabsContent value="billing-history" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Monthly Billing History</h2>
              <p className="text-sm text-muted-foreground">KDM Consortium subscription billing by month</p>
            </div>
            <Button onClick={loadBillingHistory} disabled={loadingBillingHistory}>
              {loadingBillingHistory ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(billingSummary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(billingSummary.averageMonthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">Across {billingSummary.monthsIncluded} months</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{billingSummary.uniqueCustomers}</div>
                <p className="text-xs text-muted-foreground">Active subscribers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Months Tracked</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{billingSummary.monthsIncluded}</div>
                <p className="text-xs text-muted-foreground">Historical data</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Billing Summary</CardTitle>
              <CardDescription>
                Subscription billing history organized by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBillingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : billingHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No billing history found</p>
                  <Button variant="outline" className="mt-4" onClick={loadBillingHistory}>
                    Load Billing History
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((monthGroup) => (
                    <div key={monthGroup.month} className="border rounded-lg">
                      <button
                        onClick={() => setExpandedMonth(expandedMonth === monthGroup.month ? null : monthGroup.month)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{monthGroup.month}</h3>
                            <p className="text-sm text-muted-foreground">{monthGroup.totalCustomers} customers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(monthGroup.totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">{monthGroup.records.length} invoices</p>
                        </div>
                        <ArrowUpDown className={`h-4 w-4 ml-4 transition-transform ${expandedMonth === monthGroup.month ? 'rotate-180' : ''}`} />
                      </button>

                      {expandedMonth === monthGroup.month && (
                        <div className="border-t p-4 bg-muted/30">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {monthGroup.records.map((record, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{record.customerName}</TableCell>
                                  <TableCell className="text-sm">{record.customerEmail}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">{record.tier || 'unknown'}</Badge>
                                  </TableCell>
                                  <TableCell className="font-semibold">{formatCurrency(record.amount)}</TableCell>
                                  <TableCell>
                                    <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                                      {record.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
            <DialogContent className="max-w-5xl">
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

        {/* ── Payment Requests Tab ── */}
        <TabsContent value="payment-requests" className="mt-6 space-y-6">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Payment Requests</h2>
              <p className="text-sm text-muted-foreground">Send a Stripe-hosted invoice or payment link to any customer by email.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadPaymentRequests} disabled={loadingRequests}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingRequests ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={showCreateRequestDialog} onOpenChange={(open) => { setShowCreateRequestDialog(open); if (!open) setCreatedRequest(null); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    New Payment Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Payment Request</DialogTitle>
                    <DialogDescription>
                      A Stripe invoice will be emailed to the customer with a secure payment link.
                    </DialogDescription>
                  </DialogHeader>

                  {createdRequest ? (
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                        <div>
                          <p className="font-medium text-green-800">Payment request sent!</p>
                          <p className="text-sm text-green-700">The customer received an email with a payment link.</p>
                        </div>
                      </div>
                      {createdRequest.hostedUrl && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Hosted Invoice URL</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input value={createdRequest.hostedUrl} readOnly className="font-mono text-xs" />
                            <Button size="sm" variant="outline" onClick={() => window.open(createdRequest.hostedUrl!, "_blank")}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      {createdRequest.paymentLinkUrl && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Direct Payment Link</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input value={createdRequest.paymentLinkUrl} readOnly className="font-mono text-xs" />
                            <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdRequest.paymentLinkUrl!)}>
                              <Link className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button onClick={() => { setCreatedRequest(null); setShowCreateRequestDialog(false); }}>Done</Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label>Customer Email <span className="text-red-500">*</span></Label>
                          <Input
                            type="email"
                            placeholder="customer@example.com"
                            value={newRequest.customerEmail}
                            onChange={e => setNewRequest(p => ({ ...p, customerEmail: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Customer Name</Label>
                          <Input
                            placeholder="Full name (optional)"
                            value={newRequest.customerName}
                            onChange={e => setNewRequest(p => ({ ...p, customerName: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Amount <span className="text-red-500">*</span></Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0.50"
                              step="0.01"
                              placeholder="0.00"
                              value={newRequest.amount}
                              onChange={e => setNewRequest(p => ({ ...p, amount: e.target.value }))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Currency</Label>
                          <Select value={newRequest.currency} onValueChange={v => setNewRequest(p => ({ ...p, currency: v }))}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd">USD — US Dollar</SelectItem>
                              <SelectItem value="eur">EUR — Euro</SelectItem>
                              <SelectItem value="gbp">GBP — British Pound</SelectItem>
                              <SelectItem value="cad">CAD — Canadian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Description / Service <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="e.g. Consulting Services – April 2026"
                            value={newRequest.description}
                            onChange={e => setNewRequest(p => ({ ...p, description: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Memo / Notes</Label>
                          <Input
                            placeholder="Internal memo or message to customer (optional)"
                            value={newRequest.memo}
                            onChange={e => setNewRequest(p => ({ ...p, memo: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={newRequest.dueDate}
                            onChange={e => setNewRequest(p => ({ ...p, dueDate: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-blue-50 rounded-lg">
                        <Mail className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                        <p>A Stripe invoice email will be sent automatically. The customer can pay via card through a secure hosted page.</p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateRequestDialog(false)}>Cancel</Button>
                        <Button
                          onClick={handleCreateRequest}
                          disabled={sendingRequest || !newRequest.amount || !newRequest.customerEmail || !newRequest.description}
                        >
                          {sendingRequest ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Request</>}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Sent", value: paymentRequests.length, icon: FileText, color: "text-blue-600" },
              { label: "Paid", value: paymentRequests.filter(r => r.status === "paid").length, icon: CheckCircle, color: "text-green-600" },
              { label: "Open", value: paymentRequests.filter(r => r.status === "open").length, icon: Clock, color: "text-amber-600" },
              { label: "Total Collected", value: `$${paymentRequests.filter(r => r.status === "paid").reduce((s, r) => s + r.amount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-600" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Requests table */}
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
              <CardDescription>All payment requests sent via Stripe invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <Send className="h-10 w-10 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">No payment requests yet.</p>
                  <Button size="sm" onClick={() => setShowCreateRequestDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />Create your first request
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRequests.map(req => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{req.customerName || "—"}</p>
                            <p className="text-xs text-muted-foreground">{req.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-[180px] truncate">{req.description}</TableCell>
                        <TableCell className="font-semibold text-sm">
                          ${req.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {req.currency.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              req.status === "paid" ? "bg-green-100 text-green-800 border-green-200" :
                              req.status === "open" ? "bg-amber-100 text-amber-800 border-amber-200" :
                              req.status === "void" || req.status === "cancelled" ? "bg-gray-100 text-gray-500 border-gray-200 line-through" :
                              "bg-gray-100 text-gray-600"
                            }
                            variant="outline"
                          >
                            {(req.status === "void" || req.status === "cancelled") ? "cancelled" : (req.status ?? "unknown")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(req.created * 1000).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {req.hostedUrl && (
                              <Button size="sm" variant="ghost" onClick={() => window.open(req.hostedUrl!, "_blank")} title="View invoice">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {req.paymentLinkUrl && req.status !== "void" && (
                              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(req.paymentLinkUrl!)} title="Copy payment link">
                                <Link className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => window.open(`https://dashboard.stripe.com/invoices/${req.id}`, "_blank")} title="View in Stripe">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            {(req.status === "open" || req.status === "draft" || req.status === "paid") && (
                              confirmCancelId === req.id ? (
                                <div className="flex items-center gap-1 ml-1 border border-red-200 rounded-md px-2 py-0.5 bg-red-50">
                                  <span className="text-xs text-red-700 font-medium">Cancel?</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                                    onClick={() => handleCancelRequest(req.id)}
                                    disabled={cancellingId === req.id}
                                  >
                                    {cancellingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-gray-500 hover:bg-gray-100"
                                    onClick={() => setConfirmCancelId(null)}
                                  >
                                    No
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => setConfirmCancelId(req.id)}
                                  title="Cancel invoice"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Stripe Subscriptions</h2>
              <p className="text-sm text-muted-foreground">Manage recurring subscriptions and billing</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSubscriptions} disabled={loadingSubscriptions}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingSubscriptions ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={showCreateSubscriptionDialog} onOpenChange={setShowCreateSubscriptionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Subscription</DialogTitle>
                    <DialogDescription>
                      Create a new subscription for a customer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label>Customer ID <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="cus_xxx"
                        value={newSubscription.customerId}
                        onChange={e => setNewSubscription(p => ({ ...p, customerId: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Price ID <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="price_xxx"
                        value={newSubscription.priceId}
                        onChange={e => setNewSubscription(p => ({ ...p, priceId: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newSubscription.quantity}
                        onChange={e => setNewSubscription(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Trial Days (optional)</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newSubscription.trialDays}
                        onChange={e => setNewSubscription(p => ({ ...p, trialDays: parseInt(e.target.value) || 0 }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateSubscriptionDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateSubscription} disabled={creatingSubscription}>
                      {creatingSubscription ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                      Create Subscription
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>
                {subscriptions.length} subscriptions loaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubscriptions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subscriptions found</p>
                  <Button variant="outline" className="mt-4" onClick={loadSubscriptions}>
                    Load Subscriptions
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => {
                      const item = sub.items.data[0];
                      const price = item?.price;
                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.customer.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{sub.customer.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{price?.nickname || 'Custom Plan'}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item?.quantity || 1}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${(price?.unit_amount || 0 / 100).toFixed(2)} {price?.currency.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                sub.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                                sub.status === 'past_due' ? 'bg-red-100 text-red-800' :
                                sub.status === 'canceled' ? 'bg-gray-100 text-gray-600' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {sub.status}
                              {sub.cancel_at_period_end && ' (canceling)'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(sub.current_period_end * 1000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${sub.id}`, "_blank")}
                                title="View in Stripe"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              {sub.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedSubscription(sub);
                                      setShowRefundDialog(true);
                                    }}
                                    title="Refund latest payment"
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedSubscription(sub);
                                      setShowCancelSubscriptionDialog(true);
                                    }}
                                    title="Cancel subscription"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stripe Management Tab */}
        <TabsContent value="stripe-management" className="mt-6">
          <div className="space-y-6">
            {/* Stripe Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Stripe Management</h2>
                <p className="text-muted-foreground">Manage Stripe products, refunds, and synchronization</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSyncProducts} disabled={syncingProducts}>
                  {syncingProducts ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sync Products
                </Button>
                <Button onClick={() => setShowCreateProductDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
                <Button onClick={() => setShowCreateRefundDialog(true)} variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Create Refund
                </Button>
              </div>
            </div>

            {/* Stripe Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stripeStats.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stripeStats.activeProducts || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Prices</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stripeStats.totalPrices || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all products
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Synced Tiers</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stripeStats.syncedTiers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Connected to Firestore
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stripeStats.refunds?.totalRefunds || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stripeStats.refunds?.recentRefunds || 0} this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stripe Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Stripe Products</CardTitle>
                <CardDescription>Manage your Stripe products and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStripeProducts ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stripeProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-700">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{product.name}</h3>
                              <Badge variant={product.active ? "default" : "secondary"}>
                                {product.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium">{product.prices?.length || 0} prices</span>
                              <span>•</span>
                              <span>Created: {formatDate(product.created)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stripe Refunds Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Refunds</CardTitle>
                <CardDescription>Manage refund requests and processing</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStripeRefunds ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stripeRefunds.slice(0, 10).map((refund) => (
                        <TableRow key={refund.id}>
                          <TableCell className="font-mono text-xs">
                            {refund.id.slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            {formatCurrency(refund.amount / 100)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(refund.status)}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{refund.reason?.replace('_', ' ')}</span>
                          </TableCell>
                          <TableCell>
                            {formatDate(refund.created)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Product Dialog */}
        <Dialog open={showCreateProductDialog} onOpenChange={setShowCreateProductDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stripe Product</DialogTitle>
              <DialogDescription>
                Create a new product in Stripe with pricing options
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={newStripeProduct.name}
                    onChange={(e) => setNewStripeProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="product-active">Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="product-active"
                      checked={newStripeProduct.active}
                      onCheckedChange={(checked) => setNewStripeProduct(prev => ({ ...prev, active: checked }))}
                    />
                    <Label htmlFor="product-active">Active</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="product-description">Description</Label>
                <Input
                  id="product-description"
                  value={newStripeProduct.description}
                  onChange={(e) => setNewStripeProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                />
              </div>
              <div>
                <Label>Price Configuration</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="price-amount">Amount (USD)</Label>
                    <Input
                      id="price-amount"
                      type="number"
                      value={newStripeProduct.prices[0].unit_amount / 100}
                      onChange={(e) => setNewStripeProduct(prev => ({
                        ...prev,
                        prices: [{ ...prev.prices[0], unit_amount: parseFloat(e.target.value) * 100 }]
                      }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Billing Cycle</Label>
                    <Select 
                      value={newStripeProduct.prices[0].recurring?.interval || 'month'}
                      onValueChange={(value) => setNewStripeProduct(prev => ({
                        ...prev,
                        prices: [{ ...prev.prices[0], recurring: { interval: value } }]
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Annual</SelectItem>
                        <SelectItem value="">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value="usd" disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStripeProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Refund Dialog */}
        <Dialog open={showCreateRefundDialog} onOpenChange={setShowCreateRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Refund</DialogTitle>
              <DialogDescription>
                Process a refund for a payment intent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="payment-intent-id">Payment Intent ID</Label>
                <Input
                  id="payment-intent-id"
                  value={newRefund.paymentIntentId}
                  onChange={(e) => setNewRefund(prev => ({ ...prev, paymentIntentId: e.target.value }))}
                  placeholder="pi_..."
                />
              </div>
              <div>
                <Label htmlFor="refund-amount">Amount (USD)</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  value={newRefund.amount}
                  onChange={(e) => setNewRefund(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Leave empty for full refund"
                  min="0.50"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty for full refund</p>
              </div>
              <div>
                <Label htmlFor="refund-reason">Reason</Label>
                <Select value={newRefund.reason} onValueChange={(value) => setNewRefund(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested_by_customer">Requested by Customer</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="fraudulent">Fraudulent</SelectItem>
                    <SelectItem value="expired_authorization">Expired Authorization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateRefundDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRefund} variant="destructive">
                <DollarSign className="mr-2 h-4 w-4" />
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </Tabs>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription?
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSubscription.customer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSubscription.customer.email}</p>
                <p className="text-sm mt-2">
                  Plan: {selectedSubscription.items.data[0]?.price?.nickname || 'Custom'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCancelSubscription(selectedSubscription.id, true)}
                  disabled={cancelingSubscription}
                >
                  {cancelingSubscription ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Cancel at Period End
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelSubscription(selectedSubscription.id, false)}
                  disabled={cancelingSubscription}
                >
                  {cancelingSubscription ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Cancel Immediately
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Payment Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Process a refund for this subscription's latest payment
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSubscription.customer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSubscription.customer.email}</p>
                <p className="text-sm mt-2">
                  Plan: {selectedSubscription.items.data[0]?.price?.nickname || 'Custom'}
                </p>
              </div>
              <div>
                <Label>Refund Amount (USD)</Label>
                <Input
                  type="number"
                  min="0.50"
                  step="0.01"
                  placeholder="Leave empty for full refund"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty for full refund</p>
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested_by_customer">Requested by Customer</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="fraudulent">Fraudulent</SelectItem>
                    <SelectItem value="expired_authorization">Expired Authorization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRefundDialog(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRefundPayment(selectedSubscription.id)}
                  disabled={processingRefund}
                >
                  {processingRefund ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <DollarSign className="h-4 w-4 mr-2" />}
                  Process Refund
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono text-sm break-all">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{formatDate(selectedTransaction.created)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedTransaction.customerName || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedTransaction.customerEmail || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="font-bold text-lg">{formatCurrency(selectedTransaction.amount)} {selectedTransaction.currency}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Source</Label>
                    <Badge variant="outline" className={selectedTransaction.source === 'stripe' ? 'border-purple-500 text-purple-600' : 'border-orange-500 text-orange-600'}>
                      {selectedTransaction.source === 'stripe' ? 'Stripe' : 'Firestore'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedTransaction.description && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedTransaction.description}</p>
                </div>
              )}

              {/* Entity Information */}
              {(selectedTransaction.entityType || selectedTransaction.entityName) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Entity Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTransaction.entityType && (
                      <div>
                        <Label className="text-muted-foreground">Entity Type</Label>
                        <p className="font-medium capitalize">{selectedTransaction.entityType}</p>
                      </div>
                    )}
                    {selectedTransaction.entityName && (
                      <div>
                        <Label className="text-muted-foreground">Entity Name</Label>
                        <p className="font-medium">{selectedTransaction.entityName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Metadata</h3>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{key}:</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stripe Payment Intent ID */}
              {selectedTransaction.stripePaymentIntentId && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Stripe Payment Intent ID</Label>
                  <p className="font-mono text-sm break-all">{selectedTransaction.stripePaymentIntentId}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedTransaction?.source === 'stripe' && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://dashboard.stripe.com/payments/${selectedTransaction.id}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View in Stripe
              </Button>
            )}
            <Button onClick={() => setShowTransactionDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
