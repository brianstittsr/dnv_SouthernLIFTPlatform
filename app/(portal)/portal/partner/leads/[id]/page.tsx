"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Phone, Calendar, FileText, Save } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  serviceType: string;
  status: string;
  source: string;
  notes: string;
  followUpDate: any;
  activities: Activity[];
}

interface Activity {
  id: string;
  activityType: string;
  details: string;
  outcome: string;
  activityDate: any;
  loggedBy: string;
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  
  const [activityType, setActivityType] = useState("note");
  const [activityDetails, setActivityDetails] = useState("");
  const [activityOutcome, setActivityOutcome] = useState("");

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/leads/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch lead");

      const data = await response.json();
      setLead(data);
      setStatus(data.status);
      setNotes(data.notes || "");
      setFollowUpDate(
        data.followUpDate
          ? new Date(data.followUpDate.toDate ? data.followUpDate.toDate() : data.followUpDate)
              .toISOString()
              .split("T")[0]
          : ""
      );
    } catch (err: any) {
      setError(err.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/leads/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          notes,
          followUpDate: followUpDate || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update lead");

      setSuccess("Lead updated successfully");
      fetchLead();
    } catch (err: any) {
      setError(err.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleLogActivity = async () => {
    if (!activityDetails.trim()) {
      setError("Activity details are required");
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/leads/${params.id}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activityType,
          details: activityDetails,
          outcome: activityOutcome || null,
          activityDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to log activity");

      setSuccess("Activity logged successfully");
      setActivityDetails("");
      setActivityOutcome("");
      fetchLead();
    } catch (err: any) {
      setError(err.message || "Failed to log activity");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-green-500",
      converted: "bg-purple-500",
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>Lead not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{lead.company}</h1>
          <p className="text-muted-foreground mt-1">
            {lead.name} • {getStatusBadge(lead.status)}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/portal/partner/leads")}>
          Back to Leads
        </Button>
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lead Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lead Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Contact Name</Label>
                  <p className="font-medium">{lead.name}</p>
                </div>
                <div>
                  <Label>Company</Label>
                  <p className="font-medium">{lead.company}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
                <div>
                  <Label className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </Label>
                  <p>{lead.phone || "—"}</p>
                </div>
                <div>
                  <Label>Industry</Label>
                  <p>{lead.industry || "—"}</p>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <p>{lead.serviceType || "—"}</p>
                </div>
                <div>
                  <Label>Source</Label>
                  <Badge variant="outline">{lead.source}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activities" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activities">
                Activity Timeline ({lead.activities?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="log">Log New Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Complete history of interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {!lead.activities || lead.activities.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No activities logged yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lead.activities.map((activity) => (
                        <div key={activity.id} className="border-l-2 border-primary pl-4 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{activity.activityType}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(
                                activity.activityDate?.toDate
                                  ? activity.activityDate.toDate()
                                  : activity.activityDate
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{activity.details}</p>
                          {activity.outcome && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Outcome:</strong> {activity.outcome}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="log">
              <Card>
                <CardHeader>
                  <CardTitle>Log New Activity</CardTitle>
                  <CardDescription>Record interactions with this lead</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Activity Type</Label>
                    <Select value={activityType} onValueChange={setActivityType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Details</Label>
                    <Textarea
                      value={activityDetails}
                      onChange={(e) => setActivityDetails(e.target.value)}
                      placeholder="Describe the activity..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Outcome (optional)</Label>
                    <Input
                      value={activityOutcome}
                      onChange={(e) => setActivityOutcome(e.target.value)}
                      placeholder="What was the result?"
                    />
                  </div>
                  <Button onClick={handleLogActivity}>Log Activity</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Lead Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>Update status and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Follow-up Date
                </Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={4}
                />
              </div>

              <Button onClick={handleUpdateLead} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activities Logged:</span>
                <span className="font-semibold">{lead.activities?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days in Pipeline:</span>
                <span className="font-semibold">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Contact:</span>
                <span className="font-semibold">
                  {lead.activities && lead.activities.length > 0
                    ? new Date(
                        lead.activities[0].activityDate?.toDate
                          ? lead.activities[0].activityDate.toDate()
                          : lead.activities[0].activityDate
                      ).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
