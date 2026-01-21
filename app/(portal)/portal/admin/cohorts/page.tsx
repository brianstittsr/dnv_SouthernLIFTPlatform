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
  GraduationCap, 
  Search,
  Plus,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Loader2
} from "lucide-react";
import { mockCohorts } from "@/lib/mock-data/svp-admin-mock-data";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function AllCohortsPage() {
  const router = useRouter();
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cohorts, setCohorts] = useState([
    {
      id: "1",
      title: "CMMC Level 1 Foundations",
      facilitator: "CMMC Expert Team",
      startDate: "2026-02-01",
      endDate: "2026-04-30",
      participants: 42,
      maxParticipants: 50,
      status: "active",
      price: 1499
    },
    {
      id: "2",
      title: "CMMC Level 2 Advanced",
      facilitator: "CMMC Expert Team",
      startDate: "2026-03-01",
      endDate: "2026-06-30",
      participants: 28,
      maxParticipants: 40,
      status: "enrolling",
      price: 3499
    },
    {
      id: "3",
      title: "CMMC Level 3 Expert",
      facilitator: "CMMC Expert Team",
      startDate: "2026-04-01",
      endDate: "2026-08-31",
      participants: 15,
      maxParticipants: 25,
      status: "enrolling",
      price: 5999
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
    setCohorts(mockCohorts);
    setLoading(false);
  };

  const loadRealData = async () => {
    if (!db) {
      loadMockData();
      return;
    }

    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "cohorts"));
      const cohortsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCohorts(cohortsData as any);
    } catch (error) {
      console.error("Error loading cohorts:", error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!confirm("This will delete duplicate cohorts, keeping only the newest version of each. Continue?")) {
      return;
    }

    try {
      setCleaningUp(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        toast.error("Not authenticated");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/cohorts/cleanup-duplicates", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to cleanup duplicates");
      }

      const data = await response.json();
      toast.success(data.message);
      loadRealData();
    } catch (error: any) {
      console.error("Error cleaning up duplicates:", error);
      toast.error("Failed to cleanup duplicates");
    } finally {
      setCleaningUp(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "Active" },
      enrolling: { variant: "secondary", label: "Enrolling" },
      completed: { variant: "outline", label: "Completed" },
      draft: { variant: "outline", label: "Draft" }
    };
    
    const config = variants[status] || variants.draft;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
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
          <h1 className="text-3xl font-bold mb-2">All Cohorts</h1>
          <p className="text-muted-foreground">
            Manage all training cohorts across the platform
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
          <Button 
            variant="outline" 
            onClick={handleCleanupDuplicates}
            disabled={cleaningUp}
          >
            {cleaningUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cleaning...
              </>
            ) : (
              "Remove Duplicates"
            )}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Cohort
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cohorts
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohorts.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Cohorts
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.reduce((sum, c) => sum + c.participants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrollment Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74%</div>
            <p className="text-xs text-muted-foreground">
              Average capacity
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cohorts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({cohorts.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({cohorts.filter(c => c.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="enrolling">
            Enrolling ({cohorts.filter(c => c.status === 'enrolling').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Cohorts</CardTitle>
              <CardDescription>Complete list of training cohorts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cohorts.map((cohort) => (
                  <div key={cohort.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{cohort.title}</h3>
                          {getStatusBadge(cohort.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {cohort.participants}/{cohort.maxParticipants}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {cohort.startDate} - {cohort.endDate}
                          </span>
                          <span>•</span>
                          <span>{formatCurrency(cohort.price)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Facilitator: {cohort.facilitator}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/portal/admin/cohorts/${cohort.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/portal/admin/cohorts/${cohort.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
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
