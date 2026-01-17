"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  DollarSign,
  Search,
  ArrowUpRight,
  Download,
  MoreHorizontal,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Plus,
  Send,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
} from "firebase/firestore";
import { COLLECTIONS, type TransactionDoc, type PaymentPlanDoc } from "@/lib/schema";
import { toast } from "sonner";

interface FinancialMetrics {
  totalRevenue: number;
  outstandingBalance: number;
  overdueAmount: number;
  collectionRate: number;
  revenueByType: Record<string, number>;
  revenueByTag: Record<string, number>;
}

export default function FinancialDashboardPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    outstandingBalance: 0,
    overdueAmount: 0,
    collectionRate: 0,
    revenueByType: {},
    revenueByTag: {},
  });
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlanDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDoc | null>(null);
  const [newTag, setNewTag] = useState("");
  const [isReminderLoading, setIsReminderLoading] = useState<string | null>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    if (!db) return;

    try {
      setLoading(true);
      
      const transRef = collection(db, COLLECTIONS.TRANSACTIONS);
      const transQ = query(transRef, orderBy("createdAt", "desc"), limit(100));
      const transSnap = await getDocs(transQ);
      const transData = transSnap.docs.map(d => ({ id: d.id, ...d.data() })) as TransactionDoc[];
      setTransactions(transData);

      const plansRef = collection(db, COLLECTIONS.PAYMENT_PLANS);
      const plansSnap = await getDocs(plansRef);
      const plansData = plansSnap.docs.map(d => ({ id: d.id, ...d.data() })) as PaymentPlanDoc[];
      setPaymentPlans(plansData);

      const totalRev = transData.reduce((sum, t) => sum + (t.amount || 0), 0);
      const outstanding = plansData.reduce((sum, p) => sum + (p.remainingBalance || 0), 0);
      
      const revByType: Record<string, number> = {};
      const revByTag: Record<string, number> = {};

      transData.forEach(t => {
        const type = t.type || "other";
        revByType[type] = (revByType[type] || 0) + (t.amount || 0);
        
        if (t.tags && Array.isArray(t.tags)) {
          t.tags.forEach((tag: string) => {
            revByTag[tag] = (revByTag[tag] || 0) + (t.amount || 0);
          });
        }
      });
      
      const now = new Date();
      const overdue = plansData.reduce((sum, p) => {
        const dueDate = p.dueDate instanceof Timestamp ? p.dueDate.toDate() : new Date(p.dueDate as unknown as string);
        if (p.status === "active" && dueDate < now) {
          return sum + (p.remainingBalance || 0);
        }
        return sum;
      }, 0);

      const totalExpected = totalRev + outstanding;
      const rate = totalExpected > 0 ? (totalRev / totalExpected) * 100 : 0;

      setMetrics({
        totalRevenue: totalRev,
        outstandingBalance: outstanding,
        overdueAmount: overdue,
        collectionRate: rate,
        revenueByType: revByType,
        revenueByTag: revByTag,
      });

    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!selectedTransaction || !newTag.trim() || !db) return;
    try {
      const transRef = doc(db, COLLECTIONS.TRANSACTIONS, selectedTransaction.id);
      await updateDoc(transRef, {
        tags: arrayUnion(newTag.trim())
      });
      setNewTag("");
      setIsTagDialogOpen(false);
      toast.success("Tag added successfully");
      fetchFinancialData();
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    }
  };

  const handleRemoveTag = async (transactionId: string, tag: string) => {
    if (!db) return;
    try {
      const transRef = doc(db, COLLECTIONS.TRANSACTIONS, transactionId);
      await updateDoc(transRef, {
        tags: arrayRemove(tag)
      });
      toast.success("Tag removed");
      fetchFinancialData();
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Failed to remove tag");
    }
  };

  const triggerManualReminder = async (plan: PaymentPlanDoc) => {
    if (!db) return;
    setIsReminderLoading(plan.id);
    try {
      const response = await fetch("/api/payments/scheduled-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id })
      });

      if (response.ok) {
        toast.success("Payment reminder sent successfully");
      } else {
        throw new Error("Failed to send reminder");
      }
    } catch (error) {
      console.error("Error triggering reminder:", error);
      toast.error("Failed to send reminder");
    } finally {
      setIsReminderLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
      case "completed":
      case "paid":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
      case "pending":
      case "active":
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "failed":
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="animate-pulse"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.entityName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchFinancialData} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="plans">Payment Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.outstandingBalance)}</div>
                <p className="text-xs text-muted-foreground">Across {paymentPlans.filter(p => p.status === "active").length} active plans</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{formatCurrency(metrics.overdueAmount)}</div>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.collectionRate.toFixed(1)}%</div>
                <Progress value={metrics.collectionRate} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by type and top tags.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">By Payment Type</h4>
                  {Object.entries(metrics.revenueByType).map(([type, amount]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{type.replace("_", " ")}</span>
                        <span className="font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <Progress value={metrics.totalRevenue > 0 ? (amount / metrics.totalRevenue) * 100 : 0} className="h-1" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Top Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(metrics.revenueByTag)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([tag, amount]) => (
                        <Badge key={tag} variant="outline" className="px-3 py-1">
                          {tag}: {formatCurrency(amount)}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payments processed.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t.userName}</p>
                        <p className="text-xs text-muted-foreground">{t.type.replace("_", " ")}</p>
                      </div>
                      <div className="ml-auto font-medium text-green-600">
                        +{formatCurrency(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Balances</CardTitle>
              <CardDescription>Payments due based on upcoming event dates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {paymentPlans
                  .filter(p => p.status === "active" && p.remainingBalance > 0)
                  .sort((a, b) => {
                    const dateA = a.dueDate instanceof Timestamp ? a.dueDate.toMillis() : new Date(a.dueDate as unknown as string).getTime();
                    const dateB = b.dueDate instanceof Timestamp ? b.dueDate.toMillis() : new Date(b.dueDate as unknown as string).getTime();
                    return dateA - dateB;
                  })
                  .slice(0, 5)
                  .map((plan) => (
                    <div key={plan.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{plan.entityName}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(plan.dueDate instanceof Timestamp ? plan.dueDate.toDate() : new Date(plan.dueDate as unknown as string), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="ml-auto font-medium text-red-500">
                        {formatCurrency(plan.remainingBalance)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>Manage and track every payment on the platform.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers or events..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="event_ticket">Event Ticket</SelectItem>
                      <SelectItem value="sponsorship">Sponsorship</SelectItem>
                      <SelectItem value="partial_payment">Partial Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]">{t.stripePaymentIntentId || t.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{t.userName}</div>
                        <div className="text-xs text-muted-foreground">{t.userEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{t.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{t.entityName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {t.tags?.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-[10px] px-1 cursor-pointer hover:bg-destructive hover:text-white transition-colors"
                              onClick={() => handleRemoveTag(t.id, tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 rounded-full"
                            onClick={() => {
                              setSelectedTransaction(t);
                              setIsTagDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(t.amount)}</TableCell>
                      <TableCell>{getStatusBadge(t.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(t.createdAt instanceof Timestamp ? t.createdAt.toDate() : new Date(t.createdAt as unknown as string), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Receipt</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTransaction(t);
                              setIsTagDialogOpen(true);
                            }}>Add Tags</DropdownMenuItem>
                            {t.paymentPlanId && (
                              <DropdownMenuItem onClick={() => {
                                toast.info("Linked to payment plan: " + t.paymentPlanId);
                              }}>
                                View Payment Plan
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Issue Refund</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Payment Plans</CardTitle>
              <CardDescription>Tracking balances and upcoming installments for partial payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event/Service</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Final Due Date</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Remind</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="font-medium text-xs truncate max-w-[100px]">{plan.userId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{plan.entityName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{plan.entityType}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(plan.totalAmount)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(plan.paidAmount)}</TableCell>
                      <TableCell className={plan.remainingBalance > 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                        {formatCurrency(plan.remainingBalance)}
                      </TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell className="text-xs">
                        {format(plan.dueDate instanceof Timestamp ? plan.dueDate.toDate() : new Date(plan.dueDate as unknown as string), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right min-w-[120px]">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-medium">{Math.round((plan.paidAmount / plan.totalAmount) * 100)}%</span>
                          <Progress value={(plan.paidAmount / plan.totalAmount) * 100} className="h-2 w-16" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={plan.remainingBalance <= 0 || isReminderLoading === plan.id}
                          onClick={() => triggerManualReminder(plan)}
                        >
                          {isReminderLoading === plan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction Tag</DialogTitle>
            <DialogDescription>
              Tags help you sort and aggregate payments in the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="e.g. Early Bird, VIP, Q1-Marketing"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTag}>Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
