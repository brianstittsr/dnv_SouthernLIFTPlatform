"use client";

import { useState, useEffect } from "react";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  FileBarChart,
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
} from "lucide-react";

interface AnalyticsSnapshot {
  id: string;
  projectId: string;
  environment: string;
  from: string;
  to: string;
  totalVisitors: number;
  totalPageviews: number;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  topPages: { path: string; views: number; visitors: number }[];
  topSources: { source: string; visitors: number }[];
  fetchedBy?: string;
  createdAt: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  enabled: boolean;
  projectId: string;
  environment: string;
  days: number;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  includePdf: boolean;
  subject?: string;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  createdAt?: string;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PlatformAnalyticsPage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);

  const [sendingReport, setSendingReport] = useState(false);
  const [recipientsInput, setRecipientsInput] = useState("brianstittsr@gmail.com");
  const [manualDays, setManualDays] = useState(7);
  const [manualEnvironment, setManualEnvironment] = useState("production");
  const [manualIncludePdf, setManualIncludePdf] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formEditingId, setFormEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("Weekly Analytics Report");
  const [formProjectId, setFormProjectId] = useState(process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || "");
  const [formEnvironment, setFormEnvironment] = useState("production");
  const [formDays, setFormDays] = useState(7);
  const [formFrequency, setFormFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [formDayOfWeek, setFormDayOfWeek] = useState(1);
  const [formDayOfMonth, setFormDayOfMonth] = useState(1);
  const [formRecipients, setFormRecipients] = useState("brianstittsr@gmail.com");
  const [formIncludePdf, setFormIncludePdf] = useState(true);
  const [formSubject, setFormSubject] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const getToken = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) throw new Error("You must be signed in");
    return currentUser.getIdToken();
  };

  const fetchSnapshots = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/analytics/snapshots?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load snapshots");
      setSnapshots(data.data || []);
    } catch (error) {
      console.error("Error loading snapshots:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load snapshots");
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/analytics/schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load schedules");
      setSchedules(data.data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load schedules");
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchSnapshots(), fetchSchedules()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!profile.id) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const sendAnalyticsReport = async () => {
    setSendingReport(true);
    try {
      const token = await getToken();
      const recipients = recipientsInput
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/analytics/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipients,
          days: manualDays,
          environment: manualEnvironment,
          includePdf: manualIncludePdf,
          saveSnapshot: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send report");
      toast.success(`Analytics report sent to ${recipients.length} recipient(s)`);
      await fetchSnapshots();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send report";
      toast.error(message);
    } finally {
      setSendingReport(false);
    }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const token = await getToken();
      const recipients = formRecipients
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      if (recipients.length === 0) throw new Error("At least one recipient is required");
      if (!formName.trim()) throw new Error("Report name is required");

      const body = {
        id: formEditingId || undefined,
        name: formName.trim(),
        projectId: formProjectId.trim() || process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID,
        environment: formEnvironment,
        days: formDays,
        frequency: formFrequency,
        dayOfWeek: formFrequency === "weekly" ? formDayOfWeek : undefined,
        dayOfMonth: formFrequency === "monthly" ? formDayOfMonth : undefined,
        recipients,
        includePdf: formIncludePdf,
        subject: formSubject.trim() || undefined,
        enabled: formEnabled,
      };

      const res = await fetch("/api/admin/analytics/schedule", {
        method: formEditingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save schedule");
      toast.success(formEditingId ? "Schedule updated" : "Schedule created");
      resetForm();
      await fetchSchedules();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save schedule";
      toast.error(message);
    } finally {
      setSavingSchedule(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/analytics/schedule?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete schedule");
      toast.success("Schedule deleted");
      await fetchSchedules();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete schedule");
    }
  };

  const resetForm = () => {
    setFormOpen(false);
    setFormEditingId(null);
    setFormName("Weekly Analytics Report");
    setFormProjectId(process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || "");
    setFormEnvironment("production");
    setFormDays(7);
    setFormFrequency("weekly");
    setFormDayOfWeek(1);
    setFormDayOfMonth(1);
    setFormRecipients("brianstittsr@gmail.com");
    setFormIncludePdf(true);
    setFormSubject("");
    setFormEnabled(true);
  };

  const editSchedule = (schedule: ScheduledReport) => {
    setFormOpen(true);
    setFormEditingId(schedule.id);
    setFormName(schedule.name);
    setFormProjectId(schedule.projectId);
    setFormEnvironment(schedule.environment);
    setFormDays(schedule.days);
    setFormFrequency(schedule.frequency);
    setFormDayOfWeek(schedule.dayOfWeek ?? 1);
    setFormDayOfMonth(schedule.dayOfMonth ?? 1);
    setFormRecipients(schedule.recipients.join(", "));
    setFormIncludePdf(schedule.includePdf);
    setFormSubject(schedule.subject || "");
    setFormEnabled(schedule.enabled);
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return "N/A";
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Vercel Site Analytics</h1>
        <p className="text-muted-foreground">
          Capture site analytics, store snapshots in Firebase, and schedule PDF reports.
        </p>
      </div>

      {/* Manual Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Report Now
          </CardTitle>
          <CardDescription>
            Fetch the latest Vercel analytics and email a report to multiple recipients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="recipients">Recipients (comma separated)</Label>
              <Input
                id="recipients"
                value={recipientsInput}
                onChange={(e) => setRecipientsInput(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={90}
                value={manualDays}
                onChange={(e) => setManualDays(parseInt(e.target.value || "7", 10))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={manualEnvironment} onValueChange={setManualEnvironment}>
                <SelectTrigger id="environment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="includePdf"
              checked={manualIncludePdf}
              onCheckedChange={(checked) => setManualIncludePdf(checked === true)}
            />
            <Label htmlFor="includePdf" className="font-normal">
              Attach PDF report
            </Label>
          </div>

          <Button onClick={sendAnalyticsReport} disabled={sendingReport || !recipientsInput.trim()}>
            {sendingReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Report
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Reports
              </CardTitle>
              <CardDescription>
                Automatically send analytics reports on a recurring schedule.
              </CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formOpen && (
            <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
              <h3 className="font-semibold">
                {formEditingId ? "Edit Schedule" : "New Schedule"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="formName">Report Name</Label>
                  <Input id="formName" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formProjectId">Vercel Project ID</Label>
                  <Input
                    id="formProjectId"
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    placeholder={process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || "project-id"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formEnvironment">Environment</Label>
                  <Select value={formEnvironment} onValueChange={setFormEnvironment}>
                    <SelectTrigger id="formEnvironment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formDays">Lookback Days</Label>
                  <Input
                    id="formDays"
                    type="number"
                    min={1}
                    max={90}
                    value={formDays}
                    onChange={(e) => setFormDays(parseInt(e.target.value || "7", 10))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formFrequency">Frequency</Label>
                  <Select value={formFrequency} onValueChange={(v) => setFormFrequency(v as "daily" | "weekly" | "monthly")}>
                    <SelectTrigger id="formFrequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formFrequency === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="formDayOfWeek">Day of Week</Label>
                    <Select
                      value={String(formDayOfWeek)}
                      onValueChange={(v) => setFormDayOfWeek(parseInt(v, 10))}
                    >
                      <SelectTrigger id="formDayOfWeek">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map((day, index) => (
                          <SelectItem key={day} value={String(index)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formFrequency === "monthly" && (
                  <div className="space-y-2">
                    <Label htmlFor="formDayOfMonth">Day of Month</Label>
                    <Input
                      id="formDayOfMonth"
                      type="number"
                      min={1}
                      max={31}
                      value={formDayOfMonth}
                      onChange={(e) => setFormDayOfMonth(parseInt(e.target.value || "1", 10))}
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="formRecipients">Recipients (comma separated)</Label>
                  <Input
                    id="formRecipients"
                    value={formRecipients}
                    onChange={(e) => setFormRecipients(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="formSubject">Custom Subject (optional)</Label>
                  <Input
                    id="formSubject"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="KDM Website Analytics Report"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="formIncludePdf"
                    checked={formIncludePdf}
                    onCheckedChange={(checked) => setFormIncludePdf(checked === true)}
                  />
                  <Label htmlFor="formIncludePdf" className="font-normal">
                    Attach PDF
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="formEnabled"
                    checked={formEnabled}
                    onCheckedChange={(checked) => setFormEnabled(checked === true)}
                  />
                  <Label htmlFor="formEnabled" className="font-normal">
                    Enabled
                  </Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveSchedule} disabled={savingSchedule}>
                  {savingSchedule ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {formEditingId ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scheduled reports yet. Click &quot;Add Schedule&quot; to configure one.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{schedule.name}</span>
                      <Badge variant={schedule.enabled ? "default" : "secondary"}>
                        {schedule.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {schedule.includePdf && (
                        <Badge variant="outline">PDF</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {FREQUENCY_LABELS[schedule.frequency]} · {schedule.days} days ·{" "}
                      {schedule.recipients.length} recipient(s)
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Next run: {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : "Not scheduled"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => editSchedule(schedule)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Snapshots */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Stored Snapshots
              </CardTitle>
              <CardDescription>
                Analytics data captured from Vercel and saved to Firebase.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={fetchSnapshots}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No snapshots stored yet. Send a report to capture the first snapshot.
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.slice(0, 20).map((snapshot) => (
                <div key={snapshot.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-medium">
                        {snapshot.from} → {snapshot.to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {snapshot.environment} · {new Date(snapshot.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">{snapshot.fetchedBy || "manual"}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Visitors</p>
                      <p className="font-semibold">{formatNumber(snapshot.totalVisitors)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pageviews</p>
                      <p className="font-semibold">{formatNumber(snapshot.totalPageviews)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bounce Rate</p>
                      <p className="font-semibold">
                        {snapshot.bounceRate !== null
                          ? `${(snapshot.bounceRate * 100).toFixed(1)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. Duration</p>
                      <p className="font-semibold">
                        {snapshot.avgSessionDuration !== null
                          ? `${Math.floor(snapshot.avgSessionDuration / 60)}m ${Math.floor(
                              snapshot.avgSessionDuration % 60
                            )}s`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
