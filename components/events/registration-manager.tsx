"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreVertical, Users, Loader2, DollarSign, Mail, Download, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/types/event-management";

interface Registration {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  dietaryRestrictions?: string;
  specialRequests?: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod?: "stripe" | "paypal" | "manual" | "free";
  stripeSessionId?: string;
  paypalOrderId?: string;
  checkedIn: boolean;
  checkedInAt?: Timestamp;
  confirmationCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface RegistrationFormData {
  ticketTypeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  quantity: number;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod: "stripe" | "paypal" | "manual" | "free";
}

const DEFAULT_FORM: RegistrationFormData = {
  ticketTypeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  quantity: 1,
  paymentStatus: "pending",
  paymentMethod: "manual",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  paid: <CheckCircle className="h-3 w-3" />,
  refunded: <RefreshCw className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

function generateConfirmationCode(): string {
  return `REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

interface RegistrationManagerProps {
  eventId: string;
  eventName: string;
}

export function RegistrationManager({ eventId, eventName }: RegistrationManagerProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<RegistrationFormData>(DEFAULT_FORM);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => { fetchData(); }, [eventId]);

  const fetchData = async () => {
    if (!db || !eventId) return;
    setLoading(true);
    try {
      const tq = query(collection(db, COLLECTIONS.EVENT_TICKET_TYPES), where("eventId", "==", eventId));
      const ts = await getDocs(tq);
      const ticketList = ts.docs.map((d) => ({ id: d.id, ...d.data() } as TicketType));
      setTicketTypes(ticketList);

      const rq = query(collection(db, COLLECTIONS.EVENT_REGISTRATIONS), where("eventId", "==", eventId), orderBy("createdAt", "desc"));
      const rs = await getDocs(rq);
      const regList = rs.docs.map((d) => {
        const data = d.data();
        const ticket = ticketList.find((t) => t.id === data.ticketTypeId);
        return { id: d.id, ...data, ticketTypeName: ticket?.name || "Unknown" } as Registration;
      });
      setRegistrations(regList);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!db || !form.firstName.trim() || !form.email.trim() || !form.ticketTypeId) {
      toast.error("Name, email, and ticket type are required");
      return;
    }
    setSaving(true);
    try {
      const ticket = ticketTypes.find((t) => t.id === form.ticketTypeId);
      const totalAmount = (ticket?.price || 0) * form.quantity;
      
      const data = {
        eventId,
        ticketTypeId: form.ticketTypeId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        company: form.company,
        jobTitle: form.jobTitle,
        quantity: form.quantity,
        totalAmount,
        currency: ticket?.currency || "USD",
        paymentStatus: totalAmount === 0 ? "paid" : form.paymentStatus,
        paymentMethod: totalAmount === 0 ? "free" : form.paymentMethod,
        checkedIn: false,
        updatedAt: Timestamp.now(),
      };

      if (editingRegistration) {
        await updateDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, editingRegistration.id), data);
        setRegistrations(registrations.map((r) => (r.id === editingRegistration.id ? { ...r, ...data, ticketTypeName: ticket?.name } as Registration : r)));
        toast.success("Registration updated");
      } else {
        const confirmationCode = generateConfirmationCode();
        const ref = await addDoc(collection(db, COLLECTIONS.EVENT_REGISTRATIONS), { ...data, confirmationCode, createdAt: Timestamp.now() });
        setRegistrations([{ ...data, id: ref.id, confirmationCode, ticketTypeName: ticket?.name, createdAt: Timestamp.now() } as Registration, ...registrations]);
        
        // Update ticket sold count
        if (ticket) {
          await updateDoc(doc(db, COLLECTIONS.EVENT_TICKET_TYPES, ticket.id), { sold: (ticket as any).sold + form.quantity });
        }
        toast.success("Registration added");
      }
      setDialogOpen(false);
      setForm(DEFAULT_FORM);
      setEditingRegistration(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async (registration: Registration) => {
    if (!db) return;
    try {
      const newStatus = !registration.checkedIn;
      await updateDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, registration.id), {
        checkedIn: newStatus,
        checkedInAt: newStatus ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });
      setRegistrations(registrations.map((r) => (r.id === registration.id ? { ...r, checkedIn: newStatus, checkedInAt: newStatus ? Timestamp.now() : undefined } : r)));
      toast.success(newStatus ? "Checked in" : "Check-in removed");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (registration: Registration) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.EVENT_REGISTRATIONS, registration.id));
      setRegistrations(registrations.filter((r) => r.id !== registration.id));
      toast.success("Deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleExport = () => {
    const headers = ["Confirmation", "Name", "Email", "Company", "Ticket", "Quantity", "Amount", "Status", "Checked In", "Date"];
    const rows = filteredRegistrations.map((r) => [
      r.confirmationCode,
      `${r.firstName} ${r.lastName}`,
      r.email,
      r.company || "",
      r.ticketTypeName || "",
      r.quantity,
      r.totalAmount,
      r.paymentStatus,
      r.checkedIn ? "Yes" : "No",
      r.createdAt?.toDate ? format(r.createdAt.toDate(), "yyyy-MM-dd HH:mm") : "",
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName.replace(/\s+/g, "_")}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendConfirmation = async (registration: Registration) => {
    toast.success(`Confirmation email would be sent to ${registration.email}`);
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch = searchQuery === "" || 
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.company || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    paid: registrations.filter((r) => r.paymentStatus === "paid").length,
    pending: registrations.filter((r) => r.paymentStatus === "pending").length,
    checkedIn: registrations.filter((r) => r.checkedIn).length,
    revenue: registrations.filter((r) => r.paymentStatus === "paid").reduce((sum, r) => sum + r.totalAmount, 0),
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-bold">{stats.paid}</p><p className="text-sm text-muted-foreground">Paid</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-500" /><div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-muted-foreground">Pending</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{stats.checkedIn}</p><p className="text-sm text-muted-foreground">Checked In</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p><p className="text-sm text-muted-foreground">Revenue</p></div></div></CardContent></Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search registrations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button onClick={() => { setEditingRegistration(null); setForm(DEFAULT_FORM); setDialogOpen(true); }} disabled={ticketTypes.length === 0}><Plus className="h-4 w-4 mr-2" />Add Registration</Button>
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p>{searchQuery || statusFilter !== "all" ? "No matching registrations" : "No registrations yet"}</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div><p className="font-medium">{reg.firstName} {reg.lastName}</p><p className="text-sm text-muted-foreground">{reg.email}</p>{reg.company && <p className="text-xs text-muted-foreground">{reg.company}</p>}</div>
                  </TableCell>
                  <TableCell>
                    <div><p className="font-medium">{reg.ticketTypeName}</p><p className="text-sm text-muted-foreground">x{reg.quantity}</p></div>
                  </TableCell>
                  <TableCell><p className="font-medium">{formatCurrency(reg.totalAmount, reg.currency)}</p></TableCell>
                  <TableCell><Badge className={statusColors[reg.paymentStatus]}><span className="flex items-center gap-1">{statusIcons[reg.paymentStatus]}{reg.paymentStatus}</span></Badge></TableCell>
                  <TableCell>
                    <Button variant={reg.checkedIn ? "default" : "outline"} size="sm" onClick={() => handleCheckIn(reg)}>
                      {reg.checkedIn ? <CheckCircle className="h-4 w-4" /> : "Check In"}
                    </Button>
                  </TableCell>
                  <TableCell><p className="text-sm">{reg.createdAt?.toDate ? format(reg.createdAt.toDate(), "MMM d, yyyy") : "-"}</p><p className="text-xs text-muted-foreground">{reg.confirmationCode}</p></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingRegistration(reg); setForm({ ticketTypeId: reg.ticketTypeId, firstName: reg.firstName, lastName: reg.lastName, email: reg.email, phone: reg.phone || "", company: reg.company || "", jobTitle: reg.jobTitle || "", quantity: reg.quantity, paymentStatus: reg.paymentStatus, paymentMethod: reg.paymentMethod || "manual" }); setDialogOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendConfirmation(reg)}><Mail className="h-4 w-4 mr-2" />Send Confirmation</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(reg)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingRegistration ? "Edit Registration" : "Add Registration"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Ticket Type *</Label>
              <Select value={form.ticketTypeId} onValueChange={(v) => setForm({ ...form, ticketTypeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select ticket" /></SelectTrigger>
                <SelectContent>{ticketTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} - {formatCurrency(t.price, t.currency)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div className="space-y-2"><Label>Job Title</Label><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2"><Label>Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="refunded">Refunded</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="manual">Manual</SelectItem><SelectItem value="stripe">Stripe</SelectItem><SelectItem value="paypal">PayPal</SelectItem><SelectItem value="free">Free</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
