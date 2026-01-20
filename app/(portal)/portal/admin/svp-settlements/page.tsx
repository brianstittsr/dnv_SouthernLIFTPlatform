"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Search,
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";
import { mockSettlements } from "@/lib/mock-data/svp-admin-mock-data";

export default function SVPSettlementsPage() {
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [settlements, setSettlements] = useState([
    {
      id: "SET-001",
      partner: "Acme Defense Corp",
      amount: 12500,
      period: "Q4 2025",
      status: "paid",
      paidDate: "2026-01-15",
      invoiceNumber: "INV-2026-001"
    },
    {
      id: "SET-002",
      partner: "TechSolutions LLC",
      amount: 8750,
      period: "Q4 2025",
      status: "pending",
      paidDate: null,
      invoiceNumber: "INV-2026-002"
    },
    {
      id: "SET-003",
      partner: "BuildRight Inc",
      amount: 15200,
      period: "Q4 2025",
      status: "processing",
      paidDate: null,
      invoiceNumber: "INV-2026-003"
    },
    {
      id: "SET-004",
      partner: "SkyTech Industries",
      amount: 9800,
      period: "Q3 2025",
      status: "paid",
      paidDate: "2025-10-15",
      invoiceNumber: "INV-2025-045"
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
    setSettlements(mockSettlements);
    setLoading(false);
  };

  const loadRealData = async () => {
    if (!db) {
      loadMockData();
      return;
    }

    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "settlements"));
      const settlementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSettlements(settlementsData as any);
    } catch (error) {
      console.error("Error loading settlements:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      paid: { variant: "default", label: "Paid", icon: CheckCircle },
      pending: { variant: "secondary", label: "Pending", icon: Clock },
      processing: { variant: "outline", label: "Processing", icon: Clock }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalPaid = settlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPending = settlements
    .filter(s => s.status !== 'paid')
    .reduce((sum, s) => sum + s.amount, 0);

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
          <h1 className="text-3xl font-bold mb-2">SVP Settlements</h1>
          <p className="text-muted-foreground">
            Manage partner settlements and commission payments
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
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paid
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Settlements
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settlements.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by partner, invoice, or period..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({settlements.length})</TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({settlements.filter(s => s.status === 'paid').length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({settlements.filter(s => s.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({settlements.filter(s => s.status === 'processing').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Settlements</CardTitle>
              <CardDescription>Complete settlement history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settlements.map((settlement) => (
                  <div key={settlement.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{settlement.partner}</h3>
                          {getStatusBadge(settlement.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>ID: {settlement.id}</span>
                          <span>•</span>
                          <span>{settlement.invoiceNumber}</span>
                          <span>•</span>
                          <span>Period: {settlement.period}</span>
                          {settlement.paidDate && (
                            <>
                              <span>•</span>
                              <span>Paid: {settlement.paidDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(settlement.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
