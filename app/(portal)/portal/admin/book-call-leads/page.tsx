"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, BookCallLeadDoc, type TeamMemberDoc } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  MoreHorizontal,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Send,
  UserPlus,
  X,
  Copy,
  MailCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { LeadEmailComposer, type ComposerRecipient } from "@/components/admin/lead-email-composer";

type LeadStatus = "new" | "contacted" | "scheduled" | "completed" | "cancelled";

interface Lead extends Omit<BookCallLeadDoc, "createdAt" | "updatedAt" | "scheduledCallDate" | "completedAt" | "convertedAt"> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledCallDate?: Date;
  completedAt?: Date;
  convertedAt?: Date;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
}

interface NotifyRecipient {
  id: string;
  email: string;
  label?: string;
}

const SUBSCRIPTION_PLANS: { value: string; label: string }[] = [
  { value: "founder", label: "Founder" },
  { value: "core-capture", label: "Core Capture" },
  { value: "elite", label: "Elite" },
  { value: "standard", label: "Standard" },
  { value: "other", label: "Other" },
];

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  scheduled: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-gray-500",
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function BookCallLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [sendingReport, setSendingReport] = useState(false);
  const [notifyRecipients, setNotifyRecipients] = useState<NotifyRecipient[]>([]);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [newRecipientLabel, setNewRecipientLabel] = useState("");
  const [savingRecipient, setSavingRecipient] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerRecipients, setComposerRecipients] = useState<ComposerRecipient[]>([]);
  const [dedupeOpen, setDedupeOpen] = useState(false);
  const [converted, setConverted] = useState(false);
  const [subPlan, setSubPlan] = useState("");
  const [conversionNotes, setConversionNotes] = useState("");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.BOOK_CALL_LEADS),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData: Lead[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          jobTitle: data.jobTitle,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          timezone: data.timezone,
          message: data.message,
          source: data.source,
          status: data.status,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          notes: data.notes,
          convertedToSubscription: data.convertedToSubscription,
          subscriptionPlan: data.subscriptionPlan,
          conversionNotes: data.conversionNotes,
          convertedAt: data.convertedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          scheduledCallDate: data.scheduledCallDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
        };
      });
      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const firestore = db;

    const loadRecipients = async () => {
      try {
        const q = query(
          collection(firestore, COLLECTIONS.TEAM_MEMBERS),
          where("status", "==", "active")
        );
        const snap = await getDocs(q);
        const members: Recipient[] = snap.docs
          .map((d) => {
            const data = d.data() as TeamMemberDoc;
            return {
              id: d.id,
              name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
              email: data.emailPrimary,
            };
          })
          .filter((m) => m.email);
        setRecipients(members);
      } catch (error) {
        console.error("Error loading team members:", error);
        toast.error("Failed to load team member recipients");
      }
    };

    loadRecipients();
  }, []);

  useEffect(() => {
    if (!db) return;
    const recipientsRef = collection(db, COLLECTIONS.BOOK_CALL_LEAD_EMAIL_RECIPIENTS);
    const recipientsQuery = query(recipientsRef, orderBy("createdAt", "asc"));
    return onSnapshot(recipientsQuery, (snapshot) => {
      setNotifyRecipients(
        snapshot.docs.map((d) => ({
          id: d.id,
          email: d.data().email,
          label: d.data().label,
        }))
      );
    });
  }, []);

  const addNotifyRecipient = async () => {
    if (!db || !newRecipientEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = newRecipientEmail.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return;
    }
    if (notifyRecipients.some((r) => r.email === email)) {
      toast.error("This email is already in the list");
      return;
    }
    setSavingRecipient(true);
    try {
      await addDoc(collection(db, COLLECTIONS.BOOK_CALL_LEAD_EMAIL_RECIPIENTS), {
        email,
        label: newRecipientLabel.trim() || null,
        createdAt: Timestamp.now(),
      });
      setNewRecipientEmail("");
      setNewRecipientLabel("");
      toast.success("Recipient added — they will receive new lead notifications");
    } catch (error) {
      console.error("Error adding recipient:", error);
      toast.error("Failed to add recipient");
    } finally {
      setSavingRecipient(false);
    }
  };

  const removeNotifyRecipient = async (recipientId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.BOOK_CALL_LEAD_EMAIL_RECIPIENTS, recipientId));
      toast.success("Recipient removed");
    } catch (error) {
      console.error("Error removing recipient:", error);
      toast.error("Failed to remove recipient");
    }
  };

  const saveConversion = async (leadId: string) => {
    if (!db) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.BOOK_CALL_LEADS, leadId), {
        convertedToSubscription: converted,
        subscriptionPlan: converted ? subPlan || null : null,
        conversionNotes: conversionNotes || null,
        convertedAt: converted ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });
      toast.success(converted ? "Marked as converted to KDM Subscription" : "Conversion status saved");
    } catch (error) {
      console.error("Error saving conversion:", error);
      toast.error("Failed to save conversion details");
    } finally {
      setUpdating(false);
    }
  };

  const toggleSelectLead = (leadId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(leadId);
      else next.delete(leadId);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filteredLeads.map((l) => l.id)) : new Set());
  };

  const openComposer = (targets: Lead[]) => {
    setComposerRecipients(
      targets.map((l) => ({
        name: `${l.firstName} ${l.lastName}`.trim(),
        email: l.email,
      }))
    );
    setComposerOpen(true);
  };

  const duplicateGroups = (() => {
    const byEmail = new Map<string, Lead[]>();
    for (const lead of leads) {
      const key = lead.email?.trim().toLowerCase();
      if (!key) continue;
      const group = byEmail.get(key) || [];
      group.push(lead);
      byEmail.set(key, group);
    }
    return [...byEmail.entries()].filter(([, group]) => group.length > 1);
  })();

  const removeDuplicate = async (leadId: string) => {
    await deleteLead(leadId);
  };

  const removeAllDuplicates = async () => {
    if (!db) return;
    const firestore = db;
    const toRemove = duplicateGroups.flatMap(([, group]) =>
      group.slice(1).map((l) => l.id)
    );
    try {
      await Promise.all(
        toRemove.map((id) => deleteDoc(doc(firestore, COLLECTIONS.BOOK_CALL_LEADS, id)))
      );
      toast.success(`Removed ${toRemove.length} duplicate lead${toRemove.length === 1 ? "" : "s"}`);
    } catch (error) {
      console.error("Error removing duplicates:", error);
      toast.error("Failed to remove duplicates");
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!db) return;
    setUpdating(true);

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: Timestamp.now(),
      };

      if (newStatus === "completed") {
        updateData.completedAt = Timestamp.now();
      }

      await updateDoc(doc(db, COLLECTIONS.BOOK_CALL_LEADS, leadId), updateData);
      toast.success(`Lead status updated to ${statusLabels[newStatus]}`);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead status");
    } finally {
      setUpdating(false);
    }
  };

  const updateLeadNotes = async (leadId: string) => {
    if (!db) return;
    setUpdating(true);

    try {
      await updateDoc(doc(db, COLLECTIONS.BOOK_CALL_LEADS, leadId), {
        notes,
        updatedAt: Timestamp.now(),
      });
      toast.success("Notes updated");
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update notes");
    } finally {
      setUpdating(false);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.BOOK_CALL_LEADS, leadId));
      toast.success("Lead deleted");
      setDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const openDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setNotes(lead.notes || "");
    setConverted(lead.convertedToSubscription || false);
    setSubPlan(lead.subscriptionPlan || "");
    setConversionNotes(lead.conversionNotes || "");
    setDetailsOpen(true);
  };

  const filteredLeads = filterStatus === "all" 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const newLeadsCount = leads.filter(l => l.status === "new").length;

  const sendReport = async () => {
    if (!selectedRecipient || filteredLeads.length === 0) return;
    setSendingReport(true);

    try {
      const recipient = recipients.find((r) => r.email === selectedRecipient);
      if (!recipient) {
        toast.error("Please select a valid recipient");
        return;
      }

      const response = await fetch("/api/admin/book-call-leads/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient.email,
          toName: recipient.name,
          leads: filteredLeads,
          filterStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send report");
      }

      toast.success(`Report sent to ${recipient.name}`);
    } catch (error) {
      console.error("Error sending report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send report");
    } finally {
      setSendingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-9xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Book Call Leads</h1>
          <p className="text-muted-foreground">
            Manage incoming call booking requests from the contact page
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {newLeadsCount} New
          </Badge>
          <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {recipients.length === 0 ? (
                <SelectItem value="-" disabled>No recipients loaded</SelectItem>
              ) : (
                recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.email}>
                    {recipient.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={sendReport}
            disabled={!selectedRecipient || filteredLeads.length === 0 || sendingReport}
          >
            {sendingReport ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Report
          </Button>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as LeadStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => openComposer(leads.filter((l) => selectedIds.has(l.id)))}
            disabled={selectedIds.size === 0}
          >
            <MailCheck className="h-4 w-4 mr-2" />
            Email Selected ({selectedIds.size})
          </Button>
          <Button
            variant="outline"
            onClick={() => setDedupeOpen(true)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Find Duplicates
          </Button>
        </div>
      </div>

      {/* Notification recipients — who receives each new lead's contact info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Notification Recipients
          </CardTitle>
          <CardDescription>
            These people receive the contact information for every new booked call lead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifyRecipients.length > 0 && (
            <div className="space-y-2">
              {notifyRecipients.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="text-sm">
                    {r.label && <span className="font-medium mr-2">{r.label}</span>}
                    <span className="text-muted-foreground">{r.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotifyRecipient(r.id)}
                    title="Remove recipient"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <Input
              className="w-[240px]"
              placeholder="Email address"
              type="email"
              value={newRecipientEmail}
              onChange={(e) => setNewRecipientEmail(e.target.value)}
            />
            <Input
              className="w-[200px]"
              placeholder="Name (optional)"
              value={newRecipientLabel}
              onChange={(e) => setNewRecipientLabel(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={addNotifyRecipient}
              disabled={savingRecipient || !newRecipientEmail.trim()}
            >
              {savingRecipient ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Add Recipient
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Queue ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Click on a lead to view details and update status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leads found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        filteredLeads.length > 0 &&
                        filteredLeads.every((l) => selectedIds.has(l.id))
                      }
                      onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                      aria-label="Select all leads"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Preferred Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetails(lead)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(lead.id)}
                        onCheckedChange={(checked) =>
                          toggleSelectLead(lead.id, checked === true)
                        }
                        aria-label={`Select ${lead.firstName} ${lead.lastName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{lead.email}</span>
                        {lead.phone && (
                          <span className="text-xs text-muted-foreground">{lead.phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || "-"}</TableCell>
                    <TableCell>
                      {lead.preferredDate && (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{lead.preferredDate}</span>
                          {lead.preferredTime && (
                            <span className="text-xs text-muted-foreground capitalize">
                              {lead.preferredTime}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusColors[lead.status as LeadStatus]}>
                          {statusLabels[lead.status as LeadStatus]}
                        </Badge>
                        {lead.convertedToSubscription && (
                          <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                            Subscribed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(lead.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetails(lead); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openComposer([lead]); }}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, "contacted"); }}>
                            <Phone className="mr-2 h-4 w-4" />
                            Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, "scheduled"); }}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Mark Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, "completed"); }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View and manage this lead&apos;s information
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-lg">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                        {selectedLead.email}
                      </a>
                    </p>
                    {selectedLead.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedLead.phone}`} className="text-primary hover:underline">
                          {selectedLead.phone}
                        </a>
                      </p>
                    )}
                    {selectedLead.company && (
                      <p className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {selectedLead.company}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Scheduling Preferences</h4>
                  <div className="space-y-2 text-sm">
                    {selectedLead.preferredDate && (
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {selectedLead.preferredDate}
                      </p>
                    )}
                    {selectedLead.preferredTime && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{selectedLead.preferredTime}</span>
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      Submitted: {format(selectedLead.createdAt, "PPpp")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {(["new", "contacted", "scheduled", "completed", "cancelled"] as LeadStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={selectedLead.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      disabled={updating}
                    >
                      {statusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={3}
                />
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => updateLeadNotes(selectedLead.id)}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Notes
                </Button>
              </div>

              {/* KDM Subscription Conversion */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      KDM Subscription Conversion
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Track whether this contact converted to a KDM Subscription
                    </p>
                  </div>
                  <Switch
                    checked={converted}
                    onCheckedChange={setConverted}
                    aria-label="Converted to KDM Subscription"
                  />
                </div>
                {converted && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="sub-plan">Subscription plan</Label>
                      <Select value={subPlan} onValueChange={setSubPlan}>
                        <SelectTrigger id="sub-plan">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBSCRIPTION_PLANS.map((plan) => (
                            <SelectItem key={plan.value} value={plan.value}>
                              {plan.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="conversion-notes">Conversion notes</Label>
                      <Textarea
                        id="conversion-notes"
                        rows={2}
                        value={conversionNotes}
                        onChange={(e) => setConversionNotes(e.target.value)}
                        placeholder="Plan details, sales notes..."
                      />
                    </div>
                  </>
                )}
                {selectedLead.convertedAt && selectedLead.convertedToSubscription && (
                  <p className="text-xs text-muted-foreground">
                    Converted on {format(selectedLead.convertedAt, "PPp")}
                  </p>
                )}
                <Button
                  size="sm"
                  onClick={() => saveConversion(selectedLead.id)}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Conversion Details
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteLead(selectedLead.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openComposer([selectedLead])}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email composer (single or bulk) */}
      <LeadEmailComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        recipients={composerRecipients}
      />

      {/* Duplicates dialog */}
      <Dialog open={dedupeOpen} onOpenChange={setDedupeOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Duplicate Leads</DialogTitle>
            <DialogDescription>
              Leads sharing the same email address. The most recent submission is kept.
            </DialogDescription>
          </DialogHeader>
          {duplicateGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No duplicates found
            </p>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {duplicateGroups.map(([email, group]) => (
                <div key={email} className="rounded-md border p-3 space-y-2">
                  <p className="font-medium text-sm">{email}</p>
                  {group.map((lead, idx) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {lead.firstName} {lead.lastName}
                        <span className="text-muted-foreground ml-2">
                          {format(lead.createdAt, "MMM d, yyyy")}
                        </span>
                        {idx === 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Keep
                          </Badge>
                        )}
                      </span>
                      {idx > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeDuplicate(lead.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {duplicateGroups.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <Button variant="destructive" size="sm" onClick={removeAllDuplicates}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All Duplicates
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
