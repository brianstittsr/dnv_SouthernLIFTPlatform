"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Percent,
  Calculator,
  Loader2
} from "lucide-react";
import { mockCommissionRates } from "@/lib/mock-data/svp-admin-mock-data";

export default function RevenueConfigPage() {
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
  };

  const loadRealData = async () => {
    if (!db) {
      loadMockData();
      return;
    }

    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "commission_rates"));
      const rates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommissionRates(rates as any);
    } catch (error) {
      console.error("Error loading commission rates:", error);
      loadMockData();
    } finally {
      setLoading(false);
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

      <Tabs defaultValue="commission" className="mb-6">
        <TabsList>
          <TabsTrigger value="commission">Commission Rates</TabsTrigger>
          <TabsTrigger value="sharing">Revenue Sharing</TabsTrigger>
          <TabsTrigger value="payment">Payment Rules</TabsTrigger>
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

        <TabsContent value="sharing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sharing Rules</CardTitle>
              <CardDescription>
                Configure how revenue is split between parties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-semibold mb-4 block">
                    Default Revenue Split
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Platform Fee (%)</Label>
                      <Input type="number" defaultValue="10" className="mt-1" />
                    </div>
                    <div>
                      <Label>Partner Share (%)</Label>
                      <Input type="number" defaultValue="90" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-semibold mb-4 block">
                    Referral Bonuses
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>First Referral Bonus</Label>
                      <Input type="number" defaultValue="500" className="mt-1" />
                    </div>
                    <div>
                      <Label>Recurring Referral (%)</Label>
                      <Input type="number" defaultValue="5" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Rules</CardTitle>
              <CardDescription>
                Configure payment schedules and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-semibold mb-4 block">
                    Payment Schedule
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Payment Frequency</Label>
                      <Input defaultValue="Monthly" className="mt-1" />
                    </div>
                    <div>
                      <Label>Payment Day</Label>
                      <Input type="number" defaultValue="15" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-semibold mb-4 block">
                    Payment Thresholds
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Minimum Payout Amount</Label>
                      <Input type="number" defaultValue="100" className="mt-1" />
                    </div>
                    <div>
                      <Label>Hold Period (days)</Label>
                      <Input type="number" defaultValue="30" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Button>Save Payment Rules</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
