"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceOrderDoc } from "@/lib/schema";
import { Search, Download, RefreshCw, DollarSign, TrendingUp, Package, ArrowRight, AlertTriangle, CheckCircle, X } from "lucide-react";

export default function AdminPurchasesPage() {
  const [orders, setOrders] = useState<MarketPlaceOrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MarketPlaceOrderDoc | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!db) return;
    
    setLoading(true);
    try {
      const ordersQuery = query(
        collection(db, COLLECTIONS.MARKETPLACE_ORDERS),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MarketPlaceOrderDoc)
      );
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || !db || !auth?.currentUser) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (amount > selectedOrder.totalAmount) {
      toast.error("Refund amount cannot exceed order total");
      return;
    }

    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    setProcessingRefund(true);
    try {
      const orderRef = doc(db, COLLECTIONS.MARKETPLACE_ORDERS, selectedOrder.id);
      
      // Determine new payment status
      const newStatus = amount === selectedOrder.totalAmount ? "refunded" : "partially_refunded";
      
      await updateDoc(orderRef, {
        paymentStatus: newStatus,
        refundAmount: amount,
        refundReason,
        refundedAt: Timestamp.now(),
        refundedBy: auth.currentUser.uid,
        updatedAt: Timestamp.now(),
      });

      toast.success("Refund processed successfully");
      setRefundDialogOpen(false);
      setSelectedOrder(null);
      setRefundAmount("");
      setRefundReason("");
      fetchOrders();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setProcessingRefund(false);
    }
  };

  const openRefundDialog = (order: MarketPlaceOrderDoc) => {
    setSelectedOrder(order);
    setRefundAmount(order.totalAmount.toString());
    setRefundDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerCompany?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
      refunded: { variant: "outline", label: "Refunded" },
      partially_refunded: { variant: "outline", label: "Partially Refunded" },
    };
    const config = statusConfig[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate totals
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "completed" || o.paymentStatus === "partially_refunded")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalRefunds = orders
    .filter((o) => o.refundAmount)
    .reduce((sum, o) => sum + (o.refundAmount || 0), 0);

  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchases Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track all marketplace purchases and process refunds
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {totalOrders} orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRefunds.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Processed refunds
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, buyer name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No orders have been placed yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 space-y-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{order.orderNumber}</span>
                        {getStatusBadge(order.paymentStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.buyerName} {order.buyerCompany && `(${order.buyerCompany})`}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex items-center justify-between text-sm py-2 border-t"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize text-xs">
                            {item.type}
                          </Badge>
                          <span>{item.title}</span>
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Refund Info */}
                  {order.refundAmount && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold">Refunded: ${order.refundAmount.toLocaleString()}</span>
                      </div>
                      {order.refundReason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {order.refundReason}
                        </p>
                      )}
                      {order.refundedAt && (
                        <p className="text-xs text-muted-foreground">
                          Refunded on: {formatDate(order.refundedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    {(order.paymentStatus === "completed" ||
                      order.paymentStatus === "partially_refunded") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRefundDialog(order)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Process Refund
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">$</span>
                <Input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  max={selectedOrder?.totalAmount}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Order total: ${selectedOrder?.totalAmount?.toLocaleString()}
              </p>
            </div>
            <div>
              <Label htmlFor="refundReason">Refund Reason</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explain why this refund is being processed..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRefundDialogOpen(false);
                setSelectedOrder(null);
                setRefundAmount("");
                setRefundReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={processingRefund}
            >
              {processingRefund ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Refund
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
