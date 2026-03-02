"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  TrendingUp,
  Users,
  PieChart,
  AlertCircle,
  CheckCircle2,
  Target,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockServiceOverlaps } from "@/lib/mock-data/partner-mock-data";

interface ServiceOverlap {
  id: string;
  service: string;
  partnerId: string;
  otherPartners: Array<{
    id: string;
    name: string;
    clientCount: number;
  }>;
  myClientCount: number;
  totalMarketSize: number;
  marketShare: number;
  overlapPercentage: number;
  recommendations: string[];
  lastUpdated: any;
}

export default function ServiceOverlapsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [overlaps, setOverlaps] = useState<ServiceOverlap[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (useMockData) {
      setOverlaps(mockServiceOverlaps as ServiceOverlap[]);
      setLoading(false);
    } else {
      loadData();
    }
  }, [profile.id, useMockData]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, "serviceOverlaps"),
        where("partnerId", "==", profile.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceOverlap[];
      setOverlaps(data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load service overlaps");
    } finally {
      setLoading(false);
    }
  };

  const getOverlapSeverity = (percentage: number) => {
    if (percentage >= 50) return { color: "text-red-600", bg: "bg-red-50", label: "High Overlap" };
    if (percentage >= 30) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Medium Overlap" };
    return { color: "text-green-600", bg: "bg-green-50", label: "Low Overlap" };
  };

  const getMarketShareColor = (share: number) => {
    if (share >= 50) return "text-green-600";
    if (share >= 30) return "text-blue-600";
    return "text-gray-600";
  };

  const getTotalCompetitors = () => {
    return overlaps.reduce((sum, overlap) => sum + overlap.otherPartners.length, 0);
  };

  const getAverageOverlap = () => {
    if (overlaps.length === 0) return 0;
    const total = overlaps.reduce((sum, overlap) => sum + overlap.overlapPercentage, 0);
    return Math.round(total / overlaps.length);
  };

  const getHighOverlapServices = () => {
    return overlaps.filter(o => o.overlapPercentage >= 50).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Service Overlaps</h1>
            <p className="text-muted-foreground">Analyze competitive positioning and market opportunities</p>
          </div>
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services Tracked</p>
                <p className="text-2xl font-bold">{overlaps.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competitors</p>
                <p className="text-2xl font-bold">{getTotalCompetitors()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Overlap</p>
                <p className="text-2xl font-bold">{getAverageOverlap()}%</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Overlap</p>
                <p className="text-2xl font-bold">{getHighOverlapServices()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Overlaps List */}
      {overlaps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Service Overlaps</h3>
            <p className="text-muted-foreground">
              Service overlap data will appear here once you have active services.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {overlaps.map((overlap) => {
            const severity = getOverlapSeverity(overlap.overlapPercentage);
            return (
              <Card key={overlap.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{overlap.service}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {overlap.myClientCount} clients
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {overlap.totalMarketSize} total market
                        </div>
                      </div>
                    </div>
                    <Badge variant={overlap.overlapPercentage >= 50 ? "destructive" : overlap.overlapPercentage >= 30 ? "default" : "secondary"}>
                      {severity.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Market Share */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Your Market Share</span>
                      <span className={`text-lg font-bold ${getMarketShareColor(overlap.marketShare)}`}>
                        {overlap.marketShare}%
                      </span>
                    </div>
                    <Progress value={overlap.marketShare} className="h-2" />
                  </div>

                  <Separator />

                  {/* Overlap Analysis */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Service Overlap</span>
                      <span className={`text-lg font-bold ${severity.color}`}>
                        {overlap.overlapPercentage}%
                      </span>
                    </div>
                    <Progress value={overlap.overlapPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {overlap.overlapPercentage >= 50 ? "High competition - consider differentiation strategies" :
                       overlap.overlapPercentage >= 30 ? "Moderate competition - monitor closely" :
                       "Low competition - good market position"}
                    </p>
                  </div>

                  <Separator />

                  {/* Competing Partners */}
                  {overlap.otherPartners.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Competing Partners ({overlap.otherPartners.length})
                      </h4>
                      <div className="space-y-2">
                        {overlap.otherPartners.map((partner) => (
                          <div key={partner.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">{partner.name}</span>
                            <Badge variant="outline">{partner.clientCount} clients</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        No competing partners - You have exclusive positioning in this service!
                      </span>
                    </div>
                  )}

                  <Separator />

                  {/* Recommendations */}
                  {overlap.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Strategic Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {overlap.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
