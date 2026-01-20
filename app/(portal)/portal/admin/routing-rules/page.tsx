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
import { 
  Target, 
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Filter,
  Loader2
} from "lucide-react";
import { mockRoutingRules } from "@/lib/mock-data/svp-admin-mock-data";

export default function LeadRoutingRulesPage() {
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([
    {
      id: "1",
      name: "Defense Contractors",
      condition: "Industry = Defense",
      assignTo: "Defense Team",
      priority: 1,
      isActive: true
    },
    {
      id: "2",
      name: "High Value Leads",
      condition: "Revenue > $1M",
      assignTo: "Senior Sales Team",
      priority: 2,
      isActive: true
    },
    {
      id: "3",
      name: "Technology Sector",
      condition: "Industry = Technology",
      assignTo: "Tech Team",
      priority: 3,
      isActive: true
    },
    {
      id: "4",
      name: "Small Business",
      condition: "Employees < 50",
      assignTo: "SMB Team",
      priority: 4,
      isActive: false
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
    setRules(mockRoutingRules);
    setLoading(false);
  };

  const loadRealData = async () => {
    if (!db) {
      loadMockData();
      return;
    }

    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "routing_rules"));
      const rulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRules(rulesData as any);
    } catch (error) {
      console.error("Error loading routing rules:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold mb-2">Lead Routing Rules</h1>
          <p className="text-muted-foreground">
            Configure automatic lead assignment rules
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
            Create Rule
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Routing Rules</CardTitle>
            <CardDescription>
              Rules are evaluated in priority order. First matching rule assigns the lead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    !rule.isActive ? 'opacity-50 bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                      {rule.priority}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-3 w-3" />
                        <span>{rule.condition}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">{rule.assignTo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.isActive} />
                    <Button variant="ghost" size="sm">
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

        <Card>
          <CardHeader>
            <CardTitle>Default Assignment</CardTitle>
            <CardDescription>
              Leads that don't match any rules will be assigned here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Default Queue</h3>
                  <p className="text-sm text-muted-foreground">
                    Unmatched leads go to general sales queue
                  </p>
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rule Statistics</CardTitle>
            <CardDescription>Performance metrics for routing rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Leads Routed</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
                <p className="text-2xl font-bold">2.5 hrs</p>
                <p className="text-xs text-green-600">-15% improvement</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold">23%</p>
                <p className="text-xs text-green-600">+5% increase</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
