"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, ContactMessageDoc } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Mail,
  Building,
  Calendar,
  MoreHorizontal,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type MessageStatus = "new" | "contacted" | "qualified" | "converted" | "closed";

interface ContactMessage extends Omit<ContactMessageDoc, "createdAt" | "updatedAt" | "contactedAt" | "convertedAt"> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  contactedAt?: Date;
  convertedAt?: Date;
}

const statusColors: Record<MessageStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  qualified: "bg-purple-500",
  converted: "bg-green-500",
  closed: "bg-gray-500",
};

const statusLabels: Record<MessageStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  closed: "Closed",
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<MessageStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, COLLECTIONS.CONTACT_MESSAGES),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: ContactMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          jobTitle: data.jobTitle,
          businessType: data.businessType,
          industry: data.industry,
          service: data.service,
          message: data.message,
          newsletter: data.newsletter,
          status: data.status,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          notes: data.notes,
          emailSent: data.emailSent,
          confirmationEmailSent: data.confirmationEmailSent,
          emailError: data.emailError,
          source: data.source,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referrer: data.referrer,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          contactedAt: data.contactedAt?.toDate(),
          convertedAt: data.convertedAt?.toDate(),
        };
      });
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateMessageStatus = async (messageId: string, newStatus: MessageStatus) => {
    if (!db) return;
    setUpdating(true);

    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: Timestamp.now(),
      };

      if (newStatus === "contacted") {
        updateData.contactedAt = Timestamp.now();
      } else if (newStatus === "converted") {
        updateData.convertedAt = Timestamp.now();
      }

      await updateDoc(doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId), updateData);
      toast.success(`Status updated to ${statusLabels[newStatus]}`);
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updateMessageNotes = async (messageId: string) => {
    if (!db) return;
    setUpdating(true);

    try {
      await updateDoc(doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId), {
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

  const deleteMessage = async (messageId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.CONTACT_MESSAGES, messageId));
      toast.success("Message deleted");
      setDetailsOpen(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const openDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setNotes(message.notes || "");
    setDetailsOpen(true);
  };

  const filteredMessages = messages.filter((message) => {
    const matchesStatus = filterStatus === "all" || message.status === filterStatus;
    const matchesSearch = searchQuery === "" || 
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${message.firstName} ${message.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newMessagesCount = messages.filter(m => m.status === "new").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
          <p className="text-muted-foreground">
            View and manage contact form submissions from the website
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {newMessagesCount} New
          </Badge>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, company, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as MessageStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions ({filteredMessages.length})</CardTitle>
          <CardDescription>
            Click on a submission to view details and update status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow 
                    key={message.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetails(message)}
                  >
                    <TableCell className="font-medium">
                      {message.firstName} {message.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{message.email}</span>
                        {message.phone && (
                          <span className="text-xs text-muted-foreground">{message.phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{message.company}</span>
                        {message.jobTitle && (
                          <span className="text-xs text-muted-foreground">{message.jobTitle}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{message.service}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[message.status as MessageStatus]}>
                        {statusLabels[message.status as MessageStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {message.confirmationEmailSent ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {message.confirmationEmailSent ? "Sent" : "Failed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(message.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetails(message); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMessageStatus(message.id, "contacted"); }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMessageStatus(message.id, "qualified"); }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Qualified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMessageStatus(message.id, "converted"); }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Converted
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); deleteMessage(message.id); }}
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

      {/* Message Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Contact Form Submission</DialogTitle>
            <DialogDescription>
              View and manage this submission&apos;s information
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-lg">
                      {selectedMessage.firstName} {selectedMessage.lastName}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                        {selectedMessage.email}
                      </a>
                    </p>
                    {selectedMessage.phone && (
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                          {selectedMessage.phone}
                        </a>
                      </p>
                    )}
                    {selectedMessage.jobTitle && (
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Title:</span>
                        {selectedMessage.jobTitle}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Company Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {selectedMessage.company}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">Business Type:</span>
                      {selectedMessage.businessType}
                    </p>
                    {selectedMessage.industry && (
                      <p className="flex items-center gap-2">
                        <span className="text-muted-foreground">Industry/NAICS:</span>
                        {selectedMessage.industry}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">Service:</span>
                      {selectedMessage.service}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedMessage.message && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedMessage.message}
                  </p>
                </div>
              )}

              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Submission Details</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Submitted: {format(selectedMessage.createdAt, "PPpp")}</p>
                    <p>Newsletter: {selectedMessage.newsletter ? "Yes" : "No"}</p>
                    <p>Source: {selectedMessage.source}</p>
                    {selectedMessage.ipAddress && (
                      <p>IP: {selectedMessage.ipAddress}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email Status</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {selectedMessage.emailSent ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Admin notification: {selectedMessage.emailSent ? "Sent" : "Failed"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedMessage.confirmationEmailSent ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Confirmation: {selectedMessage.confirmationEmailSent ? "Sent" : "Failed"}</span>
                    </div>
                    {selectedMessage.emailError && (
                      <p className="text-red-500 text-xs mt-1">
                        Error: {selectedMessage.emailError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h4 className="font-semibold mb-2">Update Status</h4>
                <div className="flex gap-2 flex-wrap">
                  {(["new", "contacted", "qualified", "converted", "closed"] as MessageStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={selectedMessage.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateMessageStatus(selectedMessage.id, status)}
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
                  placeholder="Add notes about this submission..."
                  rows={3}
                />
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => updateMessageNotes(selectedMessage.id)}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Notes
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMessage(selectedMessage.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Message
                </Button>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
