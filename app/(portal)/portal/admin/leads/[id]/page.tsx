"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  RefreshCw, 
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Tag,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  StickyNote
} from "lucide-react";
import Link from "next/link";
import type { SubscriptionLead } from "@/lib/subscription-leads/types";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-gray-100 text-gray-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-orange-100 text-orange-800",
  low: "bg-gray-100 text-gray-800",
};

const TIER_NAMES: Record<string, string> = {
  dwy: "DWY (Done With You)",
  dfy: "DFY (Done For You)",
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<SubscriptionLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit state
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");
  const [noteType, setNoteType] = useState<string>("general");

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/subscription/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch lead");
      }

      const data = await response.json();
      const leadData = data.data;
      setLead(leadData);
      
      // Initialize edit state
      setStatus(leadData.status);
      setPriority(leadData.priority);
      setAssignedTo(leadData.assignedTo || "");
    } catch (err: any) {
      setError(err.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      
      const updates: any = {
        status,
        priority,
        assignedTo: assignedTo || null,
      };

      // Add note if provided
      if (newNote.trim()) {
        updates.addNote = {
          content: newNote.trim(),
          type: noteType,
          author: currentUser.displayName || "Admin",
        };
      }

      const response = await fetch(`/api/subscription/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }

      setSuccess("Lead updated successfully");
      setNewNote("");
      fetchLead();
    } catch (err: any) {
      setError(err.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth?.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      
      const response = await fetch(`/api/subscription/leads/${leadId}/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to sync lead");
      }

      setSuccess("Lead synced to SVP successfully");
      fetchLead();
    } catch (err: any) {
      setError(err.message || "Failed to sync lead");
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className="container mx-auto py-8 px-4 max-w-9xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/portal/admin/leads">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{lead.companyName}</h1>
            <div className="flex items-center gap-3">
              <Badge className={STATUS_COLORS[lead.status]}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </Badge>
              <Badge variant="outline">{TIER_NAMES[lead.tier]}</Badge>
              <Badge className={PRIORITY_COLORS[lead.priority]}>
                {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSyncIcon(lead.svpSync?.syncStatus || "pending")}
            <span className="text-sm capitalize">{lead.svpSync?.syncStatus || "Pending"}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync} 
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Re-sync to SVP"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Lead Info */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
              </div>

              {lead.contactInfo?.phone && (
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${lead.contactInfo.phone}`} className="text-primary hover:underline">
                      {lead.contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {lead.contactInfo?.website && (
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={lead.contactInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lead.contactInfo.website}
                    </a>
                  </div>
                </div>
              )}

              {lead.contactInfo?.address && (
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {lead.contactInfo.address.street && <div>{lead.contactInfo.address.street}</div>}
                      <div>
                        {lead.contactInfo.address.city}, {lead.contactInfo.address.state} {lead.contactInfo.address.zip}
                      </div>
                      {lead.contactInfo.address.country && <div>{lead.contactInfo.address.country}</div>}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <Label className="text-muted-foreground">Industry</Label>
                <div className="font-medium">{lead.industry}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">User Type</Label>
                <div className="font-medium">
                  {lead.userType === "sme" ? "SME / Supplier" : "Buyer / Government"}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Role Tag</Label>
                <div className="font-medium">{lead.roleTag}</div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Plan</Label>
                <div className="font-medium">{lead.tierName}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Monthly Price</Label>
                <div className="font-medium">${lead.price}/month</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="font-medium capitalize">{lead.subscriptionStatus}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Lead Source</Label>
                <div className="font-medium capitalize">{lead.source.replace("_", " ")}</div>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground">Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(lead.createdAt)}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(lead.updatedAt)}
                </div>
              </div>

              {lead.convertedAt && (
                <div>
                  <Label className="text-muted-foreground">Converted</Label>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {formatDate(lead.convertedAt)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Edit Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Management</CardTitle>
              <CardDescription>Update lead status and assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned To</Label>
                <Input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter assignee name or email"
                />
              </div>

              <Separator />

              <div>
                <Label>Add Note</Label>
                <div className="mb-2">
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Note type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="status_change">Status Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter note content..."
                  rows={4}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleUpdate} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Update Lead
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Proof Pack Context */}
          {lead.proofPackContext && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Proof Pack Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.proofPackContext.packName && (
                  <div>
                    <Label className="text-muted-foreground">Pack Name</Label>
                    <div className="font-medium">{lead.proofPackContext.packName}</div>
                  </div>
                )}

                {lead.proofPackContext.packHealth !== undefined && (
                  <div>
                    <Label className="text-muted-foreground">Pack Health Score</Label>
                    <div className={`font-medium ${lead.proofPackContext.packHealth >= 70 ? "text-green-600" : lead.proofPackContext.packHealth >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                      {lead.proofPackContext.packHealth}%
                    </div>
                  </div>
                )}

                {lead.proofPackContext.capabilities && lead.proofPackContext.capabilities.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Capabilities</Label>
                    <div className="flex flex-wrap gap-1">
                      {lead.proofPackContext.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lead.proofPackContext.certifications && lead.proofPackContext.certifications.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Certifications</Label>
                    <div className="flex flex-wrap gap-1">
                      {lead.proofPackContext.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lead.proofPackContext.naicsCodes && lead.proofPackContext.naicsCodes.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">NAICS Codes</Label>
                    <div className="text-sm">{lead.proofPackContext.naicsCodes.join(", ")}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Notes */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Activity & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {lead.followUp?.notes && lead.followUp.notes.length > 0 ? (
                    lead.followUp.notes.map((note) => (
                      <div key={note.id} className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{note.author}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <Badge variant="outline" className="mb-2 text-xs capitalize">
                          {note.type.replace("_", " ")}
                        </Badge>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <StickyNote className="h-12 w-12 mx-auto mb-4" />
                      <p>No notes yet</p>
                      <p className="text-sm">Add notes to track your interactions with this lead</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
