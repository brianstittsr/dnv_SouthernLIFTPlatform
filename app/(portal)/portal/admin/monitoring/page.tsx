"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Database,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DataToggle } from "@/components/ui/data-toggle";
import { mockSystemHealth, mockSystemMetrics, mockUptimeRecords } from "@/lib/mock-data/system-health-mock-data";

interface SystemHealth {
  isHealthy: boolean;
  uptimePercentage: number;
  apiResponseTime95p: number;
  errorRate: number;
  concurrentUsers: number;
}

interface SystemMetric {
  id: string;
  timestamp: any;
  apiResponseTime95p: number;
  apiResponseTimeAvg: number;
  apiRequestCount: number;
  errorCount: number;
  errorRate: number;
  recentErrors: Array<{
    timestamp: any;
    endpoint: string;
    error: string;
    statusCode: number;
  }>;
  uptimePercentage: number;
  isHealthy: boolean;
  dbQueryCount: number;
  dbQueryTimeAvg: number;
  dbQueryTime95p: number;
  concurrentUsers: number;
}

interface UptimeRecord {
  date: string;
  uptimePercentage: number;
  totalDowntimeMinutes: number;
  incidentCount: number;
}

export default function MonitoringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"hour" | "day" | "week" | "month">("hour");
  const [useMockData, setUseMockData] = useState(false);
  
  const [currentHealth, setCurrentHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [uptimeRecords, setUptimeRecords] = useState<UptimeRecord[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch initial data
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(
        `/api/admin/monitoring?timeRange=${timeRange}&includeUptime=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monitoring data");
      }

      const data = await response.json();
      setCurrentHealth(data.currentHealth);
      setMetrics(data.metrics);
      setUptimeRecords(data.uptimeRecords);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (useMockData) {
      setCurrentHealth(mockSystemHealth);
      setMetrics(mockSystemMetrics as SystemMetric[]);
      setUptimeRecords(mockUptimeRecords);
      setLastUpdate(new Date());
      setLoading(false);
    } else {
      fetchMonitoringData();
    }
  }, [timeRange, useMockData]);

  // Real-time listener for system metrics (updates every 30 seconds)
  useEffect(() => {
    if (!db || useMockData) return;

    const metricsQuery = query(
      collection(db, "systemMetrics"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      metricsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const latestMetric = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          } as SystemMetric;

          // Update current health
          setCurrentHealth({
            isHealthy: latestMetric.isHealthy,
            uptimePercentage: latestMetric.uptimePercentage,
            apiResponseTime95p: latestMetric.apiResponseTime95p,
            errorRate: latestMetric.errorRate,
            concurrentUsers: latestMetric.concurrentUsers,
          });

          // Update metrics list
          setMetrics((prev) => [latestMetric, ...prev.slice(0, 99)]);
          setLastUpdate(new Date());
        }
      },
      (err) => {
        console.error("Error listening to metrics:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate average metrics
  const avgMetrics = metrics.length > 0 ? {
    apiResponseTime: metrics.reduce((sum, m) => sum + m.apiResponseTimeAvg, 0) / metrics.length,
    errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
    dbQueryTime: metrics.reduce((sum, m) => sum + m.dbQueryTimeAvg, 0) / metrics.length,
    uptime: metrics.reduce((sum, m) => sum + m.uptimePercentage, 0) / metrics.length,
  } : null;

  // Get recent errors
  const recentErrors = metrics.length > 0 && metrics[0].recentErrors
    ? metrics[0].recentErrors.slice(0, 5)
    : [];

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getHealthBadge = () => {
    if (!currentHealth) return null;
    
    if (currentHealth.isHealthy) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          Healthy
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Degraded
        </Badge>
      );
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600";
    if (uptime >= 99.0) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading && !currentHealth) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time platform performance and uptime metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DataToggle onToggle={setUseMockData} defaultValue={false} />
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          {getHealthBadge()}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">Last Hour</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUptimeColor(currentHealth?.uptimePercentage || 0)}`}>
              {currentHealth?.uptimePercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgMetrics ? `Avg: ${avgMetrics.uptime.toFixed(2)}%` : "No data"}
            </p>
            <p className="text-xs text-muted-foreground">
              Target: 99.9% SLA
            </p>
          </CardContent>
        </Card>

        {/* API Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentHealth?.apiResponseTime95p.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              95th percentile
            </p>
            <p className="text-xs text-muted-foreground">
              {avgMetrics ? `Avg: ${avgMetrics.apiResponseTime.toFixed(0)}ms` : "No data"}
            </p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (currentHealth?.errorRate || 0) > 1 ? "text-red-600" : "text-green-600"
            }`}>
              {currentHealth?.errorRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgMetrics ? `Avg: ${avgMetrics.errorRate.toFixed(2)}%` : "No data"}
            </p>
            <p className="text-xs text-muted-foreground">
              Target: &lt;1%
            </p>
          </CardContent>
        </Card>

        {/* Concurrent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concurrent Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentHealth?.concurrentUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Performance */}
      {metrics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Database Performance</CardTitle>
            <CardDescription>Firestore query metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Query Count</span>
                </div>
                <p className="text-2xl font-bold">{metrics[0].dbQueryCount}</p>
                <p className="text-xs text-muted-foreground">Last 5 minutes</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Query Time</span>
                </div>
                <p className="text-2xl font-bold">{metrics[0].dbQueryTimeAvg.toFixed(0)}ms</p>
                <p className="text-xs text-muted-foreground">
                  {avgMetrics ? `Period avg: ${avgMetrics.dbQueryTime.toFixed(0)}ms` : ""}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">95th Percentile</span>
                </div>
                <p className="text-2xl font-bold">{metrics[0].dbQueryTime95p.toFixed(0)}ms</p>
                <p className="text-xs text-muted-foreground">Slowest queries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>Last 5 errors from the past 5 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentErrors.map((error, index) => (
                <div key={index} className="border-l-2 border-red-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm">{error.endpoint}</span>
                    <Badge variant="destructive">{error.statusCode}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{error.error}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(error.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Uptime */}
      {uptimeRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Uptime</CardTitle>
            <CardDescription>Daily uptime records (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uptimeRecords.slice(0, 10).map((record) => (
                <div key={record.date} className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">{record.date}</span>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${getUptimeColor(record.uptimePercentage)}`}>
                      {record.uptimePercentage.toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {record.incidentCount} incidents
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {record.totalDowntimeMinutes}min downtime
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-refresh indicator */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Activity className="inline h-3 w-3 mr-1 animate-pulse" />
        Metrics update automatically every 30 seconds via real-time listeners
      </div>
    </div>
  );
}
