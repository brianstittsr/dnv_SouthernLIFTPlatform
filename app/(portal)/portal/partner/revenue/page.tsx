"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, doc, Timestamp, where, orderBy } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockAttributionEvents, mockSettlements } from "@/lib/mock-data/partner-mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, DollarSign, TrendingUp, Calendar, CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

interface AttributionEvent {
  id: string;
  partnerId: string;
  smeId: string;
  buyerId: string | null;
  eventType: "lead_generated" | "service_delivered" | "introduction_facilitated" | "conversion_completed";
  revenueAmount: number;
  attributionPercentage: number;
  source: string | null;
  dealId: string | null;
  notes: string | null;
  settlementStatus: "pending" | "settled";
  settlementId: string | null;
  createdAt: any;
  createdBy: string;
}

interface RevenueSettlement {
  id: string;
  partnerId: string;
  periodStart: any;
  periodEnd: any;
  grossRevenue: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  netRevenue: number;
  eventCount: number;
  eventIds: string[];
  eventsByType: Record<string, number>;
  status: "calculated" | "paid";
  settlementDate: any;
  createdAt: any;
}

export default function RevenueDashboardPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [attributionEvents, setAttributionEvents] = useState<AttributionEvent[]>([]);
  const [settlements, setSettlements] = useState<RevenueSettlement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  const [formData, setFormData] = useState({
    eventType: "lead_generated" as const,
    revenueAmount: "",
    attributionPercentage: "100",
    smeId: "",
    buyerId: "",
    source: "",
    dealId: "",
    notes: "",
  });

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id, useMockData]);

  const loadData = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock data
        setAttributionEvents(mockAttributionEvents as AttributionEvent[]);
        setSettlements(mockSettlements as RevenueSettlement[]);
      } else {
        // Load live data from Firestore
        if (!db) {
          toast.error("Firebase not initialized");
          return;
        }
        // Load attribution events
        const eventsQuery = query(
          collection(db, "attributionEvents"),
          where("partnerId", "==", profile.id),
          orderBy("createdAt", "desc")
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttributionEvent));
        setAttributionEvents(events);

        // Load settlements
        const settlementsQuery = query(
          collection(db, "revenueSettlements"),
          where("partnerId", "==", profile.id),
          orderBy("createdAt", "desc")
        );
        const settlementsSnapshot = await getDocs(settlementsQuery);
        const setts = settlementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevenueSettlement));
        setSettlements(setts);
      }
    } catch (error) {
      console.error("Error loading revenue data:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!db || !profile?.id) return;
    if (!formData.revenueAmount || !formData.smeId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "attributionEvents"), {
        partnerId: profile.id,
        smeId: formData.smeId,
        buyerId: formData.buyerId || null,
        eventType: formData.eventType,
        revenueAmount: parseFloat(formData.revenueAmount),
        attributionPercentage: parseFloat(formData.attributionPercentage),
        source: formData.source || null,
        dealId: formData.dealId || null,
        notes: formData.notes || null,
        settlementStatus: "pending",
        settlementId: null,
        createdAt: Timestamp.now(),
        createdBy: profile.id,
        isImmutable: true,
      });

      toast.success("Attribution event recorded successfully");
      setDialogOpen(false);
      setFormData({
        eventType: "lead_generated",
        revenueAmount: "",
        attributionPercentage: "100",
        smeId: "",
        buyerId: "",
        source: "",
        dealId: "",
        notes: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding attribution event:", error);
      toast.error("Failed to record attribution event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate summary metrics
  const totalPending = attributionEvents
    .filter(e => e.settlementStatus === "pending")
    .reduce((sum, e) => sum + (e.revenueAmount * e.attributionPercentage / 100), 0);
  
  const totalSettled = attributionEvents
    .filter(e => e.settlementStatus === "settled")
    .reduce((sum, e) => sum + (e.revenueAmount * e.attributionPercentage / 100), 0);
  
  const totalRevenue = totalPending + totalSettled;
  const pendingCount = attributionEvents.filter(e => e.settlementStatus === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">Track your revenue, attribution events, and settlements</p>
        </div>
        <div className="flex items-center gap-3">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{pendingCount} events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{attributionEvents.filter(e => e.settlementStatus === "settled").length} events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settlements.length}</div>
            <p className="text-xs text-muted-foreground">Total periods</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">
            <TrendingUp className="h-4 w-4 mr-2" />
            Attribution Events ({attributionEvents.length})
          </TabsTrigger>
          <TabsTrigger value="settlements">
            <Calendar className="h-4 w-4 mr-2" />
            Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribution Events</CardTitle>
              <CardDescription>Revenue events attributed to your partnership activities</CardDescription>
            </CardHeader>
            <CardContent>
              {attributionEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attribution events yet.</p>
                  <p className="text-sm mt-2">Click "Add New" to record your first revenue event.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attributionEvents.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {event.eventType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </CardTitle>
                            <CardDescription>
                              {event.createdAt?.toDate?.()?.toLocaleDateString()} • SME: {event.smeId}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={event.settlementStatus === "settled" ? "default" : "secondary"}>
                              {event.settlementStatus === "settled" ? "Settled" : "Pending"}
                            </Badge>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                ${(event.revenueAmount * event.attributionPercentage / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {event.attributionPercentage}% of ${event.revenueAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      {(event.notes || event.source || event.dealId) && (
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {event.source && (
                              <div>
                                <span className="text-muted-foreground">Source:</span>
                                <p className="font-medium">{event.source}</p>
                              </div>
                            )}
                            {event.dealId && (
                              <div>
                                <span className="text-muted-foreground">Deal ID:</span>
                                <p className="font-medium font-mono text-xs">{event.dealId}</p>
                              </div>
                            )}
                            {event.notes && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Notes:</span>
                                <p className="text-sm mt-1">{event.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Settlements</CardTitle>
              <CardDescription>Monthly settlement periods and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No settlements processed yet.</p>
                  <p className="text-sm mt-2">Settlements are calculated monthly by platform admins.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement) => (
                    <Card key={settlement.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {settlement.periodStart?.toDate?.()?.toLocaleDateString()} - {settlement.periodEnd?.toDate?.()?.toLocaleDateString()}
                            </CardTitle>
                            <CardDescription>
                              {settlement.eventCount} events • {settlement.status === "paid" ? "Paid" : "Calculated"}
                            </CardDescription>
                          </div>
                          <Badge variant={settlement.status === "paid" ? "default" : "secondary"}>
                            {settlement.status === "paid" ? "Paid" : "Pending Payment"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Gross Revenue:</span>
                            <p className="font-bold text-lg">${settlement.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Platform Fee ({settlement.platformFeePercentage}%):</span>
                            <p className="font-medium text-red-600">-${settlement.platformFeeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Revenue:</span>
                            <p className="font-bold text-lg text-green-600">${settlement.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Settlement Date:</span>
                            <p className="font-medium">{settlement.settlementDate?.toDate?.()?.toLocaleDateString()}</p>
                          </div>
                        </div>
                        {settlement.eventsByType && Object.keys(settlement.eventsByType).length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Events by Type:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(settlement.eventsByType).map(([type, count]) => (
                                <Badge key={type} variant="outline">
                                  {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Attribution Event</DialogTitle>
            <DialogDescription>
              Record a revenue event attributed to your partnership activities
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={formData.eventType} onValueChange={(value: any) => setFormData({ ...formData, eventType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_generated">Lead Generated</SelectItem>
                  <SelectItem value="service_delivered">Service Delivered</SelectItem>
                  <SelectItem value="introduction_facilitated">Introduction Facilitated</SelectItem>
                  <SelectItem value="conversion_completed">Conversion Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="revenueAmount">Revenue Amount *</Label>
                <Input
                  id="revenueAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.revenueAmount}
                  onChange={(e) => setFormData({ ...formData, revenueAmount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attributionPercentage">Attribution % *</Label>
                <Input
                  id="attributionPercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={formData.attributionPercentage}
                  onChange={(e) => setFormData({ ...formData, attributionPercentage: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smeId">SME ID *</Label>
                <Input
                  id="smeId"
                  placeholder="SME user ID"
                  value={formData.smeId}
                  onChange={(e) => setFormData({ ...formData, smeId: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buyerId">Buyer ID</Label>
                <Input
                  id="buyerId"
                  placeholder="Buyer user ID (optional)"
                  value={formData.buyerId}
                  onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  placeholder="e.g., Website, Referral"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dealId">Deal ID</Label>
                <Input
                  id="dealId"
                  placeholder="Deal or opportunity ID"
                  value={formData.dealId}
                  onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional details about this attribution event..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
