"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, CreditCard, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod: string;
}

interface PaymentPlan {
  id: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate: string;
  status: string;
  installments: Array<{
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBillingData();
  }, [page, typeFilter, startDate, endDate]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const [transactionsRes, plansRes, profileRes] = await Promise.all([
        fetch(`/api/billing/transactions?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/billing/payment-plans", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data.transactions || []);
        setTotalPages(data.totalPages || 1);
      }

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPaymentPlans(data.paymentPlans || []);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setSubscription({
          tier: data.subscriptionTier,
          status: data.subscriptionStatus,
          nextBillingDate: data.nextBillingDate,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (transactionId: string) => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/billing/invoice/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download invoice");
    }
  };

  const handleMakePayment = async (planId: string) => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/billing/payment-plans/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) throw new Error("Failed to create payment");

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      active: "default",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, view transactions, and track payment plans
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Subscription */}
      {subscription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold capitalize">{subscription.tier} Tier</p>
                <p className="text-sm text-muted-foreground">
                  Status: {getStatusBadge(subscription.status)}
                </p>
                {subscription.nextBillingDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Next billing: {format(new Date(subscription.nextBillingDate), "PPP")}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/portal/subscription")}>
                  Change Plan
                </Button>
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Payment Plans */}
      {paymentPlans.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Payment Plans</CardTitle>
            <CardDescription>Installment payments and balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{plan.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(plan.dueDate), "PPP")}
                      </p>
                    </div>
                    {getStatusBadge(plan.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">${plan.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="font-semibold text-green-600">${plan.paidAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="font-semibold text-orange-600">${plan.remainingBalance.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleMakePayment(plan.id)}>
                    Make Payment
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All your payments and charges</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="cohort">Cohort</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 space-y-2">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell className="font-semibold">${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="capitalize">{transaction.paymentMethod}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadInvoice(transaction.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
