"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Save, AlertTriangle, CheckCircle, Bell, BellOff } from "lucide-react";

interface AlertConfig {
  id: string;
  apiResponseTimeThreshold: number;
  errorRateThreshold: number;
  uptimeThreshold: number;
  dbQueryTimeThreshold: number;
  consecutiveMinutesRequired: number;
  emailEnabled: boolean;
  adminEmails: string[];
  cooldownMinutes: number;
  isActive: boolean;
}

interface ActiveAlert {
  id: string;
  type: string;
  severity: "warning" | "critical";
  currentValue: number;
  threshold: number;
  message: string;
  status: string;
  triggeredAt: any;
  emailSent: boolean;
}

export default function AlertsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch configuration and active alerts
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alert configuration");
      }

      const data = await response.json();
      setConfig(data.config);
      setActiveAlerts(data.activeAlerts);
    } catch (err: any) {
      setError(err.message || "Failed to load alert configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // Save configuration
  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/alerts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      setSuccess("Alert configuration updated successfully");
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  // Acknowledge alert
  const handleAcknowledge = async (alertId: string) => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "acknowledge", alertId }),
      });

      if (!response.ok) {
        throw new Error("Failed to acknowledge alert");
      }

      // Refresh alerts
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to acknowledge alert");
    }
  };

  // Resolve alert
  const handleResolve = async (alertId: string) => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "resolve", alertId }),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      // Refresh alerts
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to resolve alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    return severity === "critical" ? "destructive" : "default";
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading alert configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Performance Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Configure automated alerts for system performance degradation
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
            <CardDescription>
              Current performance alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Current:</span> {alert.currentValue.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Threshold:</span> {alert.threshold}
                    </div>
                    <div>
                      <span className="font-medium">Triggered:</span>{" "}
                      {formatTimestamp(alert.triggeredAt)}
                    </div>
                  </div>
                  {alert.emailSent && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      Email notification sent
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Configuration */}
      {config && (
        <div className="space-y-6">
          {/* Alert Status */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Status</CardTitle>
              <CardDescription>
                Enable or disable automated performance alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config.isActive ? (
                    <Bell className="h-5 w-5 text-green-600" />
                  ) : (
                    <BellOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      Alerts {config.isActive ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {config.isActive
                        ? "System is monitoring performance metrics"
                        : "Alert monitoring is currently disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.isActive}
                  onCheckedChange={(checked) => {
                    setConfig({ ...config, isActive: checked });
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>
                Configure performance thresholds that trigger alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    API Response Time (ms)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={config.apiResponseTimeThreshold}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        apiResponseTimeThreshold: parseInt(e.target.value),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: 500ms (95th percentile)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Error Rate (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.errorRateThreshold}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        errorRateThreshold: parseFloat(e.target.value),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: 1%
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Uptime Threshold (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={config.uptimeThreshold}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        uptimeThreshold: parseFloat(e.target.value),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: 99.9% (SLA target)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Database Query Time (ms)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={config.dbQueryTimeThreshold}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        dbQueryTimeThreshold: parseInt(e.target.value),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default: 1000ms (95th percentile)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Conditions</CardTitle>
              <CardDescription>
                Configure when alerts are triggered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Consecutive Minutes Required
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={config.consecutiveMinutesRequired}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        consecutiveMinutesRequired: parseInt(e.target.value),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Threshold must be exceeded for this many consecutive minutes
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Alert Cooldown (minutes)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="1440"
                    value={config.cooldownMinutes}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        cooldownMinutes: parseInt(e.target.value),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum time between duplicate alerts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure email alerts for platform admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send email alerts when thresholds are exceeded
                    </p>
                  </div>
                  <Switch
                    checked={config.emailEnabled}
                    onCheckedChange={(checked) => {
                      setConfig({ ...config, emailEnabled: checked });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Admin Email Addresses
                  </label>
                  <Input
                    placeholder="admin1@example.com, admin2@example.com"
                    value={config.adminEmails.join(", ")}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        adminEmails: e.target.value
                          .split(",")
                          .map((email) => email.trim())
                          .filter((email) => email.length > 0),
                      });
                      setHasChanges(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated list of email addresses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
