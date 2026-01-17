"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, MoreVertical, Ticket, Loader2, DollarSign, Users, Star, Copy } from "lucide-react";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/types/event-management";

interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  available: number;
  sold: number;
  benefits: string[];
  earlyBirdPrice?: number;
  earlyBirdDeadline?: Timestamp;
  order: number;
  isVisible: boolean;
  featured: boolean;
  purchaseUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TicketFormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  available: number;
  benefits: string;
  earlyBirdPrice: number | undefined;
  earlyBirdDeadline: string;
  isVisible: boolean;
  featured: boolean;
  purchaseUrl: string;
}

const DEFAULT_FORM: TicketFormData = {
  name: "",
  description: "",
  price: 0,
  currency: "USD",
  available: 100,
  benefits: "",
  earlyBirdPrice: undefined,
  earlyBirdDeadline: "",
  isVisible: true,
  featured: false,
  purchaseUrl: "",
};

interface TicketManagerProps {
  eventId: string;
  eventName: string;
}

export function TicketManager({ eventId, eventName }: TicketManagerProps) {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TicketFormData>(DEFAULT_FORM);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  const fetchTickets = async () => {
    if (!db || !eventId) return;
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.EVENT_TICKET_TYPES), where("eventId", "==", eventId), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      setTickets(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TicketType)));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!db || !form.name.trim()) {
      toast.error("Ticket name is required");
      return;
    }
    setSaving(true);
    try {
      const data = {
        eventId,
        name: form.name,
        description: form.description,
        price: form.price,
        currency: form.currency,
        available: form.available,
        benefits: form.benefits.split("\n").filter(Boolean),
        earlyBirdPrice: form.earlyBirdPrice,
        earlyBirdDeadline: form.earlyBirdDeadline ? Timestamp.fromDate(new Date(form.earlyBirdDeadline)) : null,
        isVisible: form.isVisible,
        featured: form.featured,
        purchaseUrl: form.purchaseUrl,
        updatedAt: Timestamp.now(),
      };

      if (editingTicket) {
        await updateDoc(doc(db, COLLECTIONS.EVENT_TICKET_TYPES, editingTicket.id), data);
        setTickets(tickets.map((t) => (t.id === editingTicket.id ? { ...t, ...data } as TicketType : t)));
        toast.success("Ticket updated");
      } else {
        const ref = await addDoc(collection(db, COLLECTIONS.EVENT_TICKET_TYPES), { ...data, sold: 0, order: tickets.length, createdAt: Timestamp.now() });
        setTickets([...tickets, { ...data, id: ref.id, sold: 0, order: tickets.length, createdAt: Timestamp.now() } as TicketType]);
        toast.success("Ticket created");
      }
      setDialogOpen(false);
      setForm(DEFAULT_FORM);
      setEditingTicket(null);
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast.error("Failed to save ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ticket: TicketType) => {
    if (!db) return;
    if (ticket.sold > 0) {
      toast.error("Cannot delete ticket with sales");
      return;
    }
    try {
      await deleteDoc(doc(db, COLLECTIONS.EVENT_TICKET_TYPES, ticket.id));
      setTickets(tickets.filter((t) => t.id !== ticket.id));
      toast.success("Ticket deleted");
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  const openEditDialog = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setForm({
      name: ticket.name,
      description: ticket.description,
      price: ticket.price,
      currency: ticket.currency,
      available: ticket.available,
      benefits: ticket.benefits?.join("\n") || "",
      earlyBirdPrice: ticket.earlyBirdPrice,
      earlyBirdDeadline: ticket.earlyBirdDeadline ? format(ticket.earlyBirdDeadline.toDate(), "yyyy-MM-dd") : "",
      isVisible: ticket.isVisible,
      featured: ticket.featured,
      purchaseUrl: ticket.purchaseUrl || "",
    });
    setDialogOpen(true);
  };

  const totalRevenue = tickets.reduce((sum, t) => sum + t.price * t.sold, 0);
  const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Ticket className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{tickets.length}</p><p className="text-sm text-muted-foreground">Ticket Types</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{totalSold}</p><p className="text-sm text-muted-foreground">Sold</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{tickets.reduce((s, t) => s + t.available, 0)}</p><p className="text-sm text-muted-foreground">Available</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p><p className="text-sm text-muted-foreground">Revenue</p></div></div></CardContent></Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ticket Types</h2>
        <Button onClick={() => { setEditingTicket(null); setForm(DEFAULT_FORM); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Ticket</Button>
      </div>

      {tickets.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p>No tickets yet</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sold / Available</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {ticket.featured && <Star className="h-4 w-4 text-yellow-500" />}
                      <div><p className="font-medium">{ticket.name}</p><p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(ticket.price, ticket.currency)}</p>
                    {ticket.earlyBirdPrice && <p className="text-sm text-green-600">Early: {formatCurrency(ticket.earlyBirdPrice, ticket.currency)}</p>}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{ticket.sold}</span> / {ticket.available}
                    <div className="w-24 h-2 bg-muted rounded-full mt-1"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((ticket.sold / ticket.available) * 100, 100)}%` }} /></div>
                  </TableCell>
                  <TableCell><p className="font-medium">{formatCurrency(ticket.price * ticket.sold, ticket.currency)}</p></TableCell>
                  <TableCell><Badge variant={ticket.isVisible ? "default" : "secondary"}>{ticket.isVisible ? "Active" : "Hidden"}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(ticket)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}/register?ticket=${ticket.id}`)}><Copy className="h-4 w-4 mr-2" />Copy Link</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(ticket)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingTicket ? "Edit Ticket" : "Add Ticket Type"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="General Admission" /></div>
              <div className="space-y-2"><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Available Qty</Label><Input type="number" value={form.available} onChange={(e) => setForm({ ...form, available: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Early Bird Price</Label><Input type="number" value={form.earlyBirdPrice || ""} onChange={(e) => setForm({ ...form, earlyBirdPrice: parseFloat(e.target.value) || undefined })} /></div>
              <div className="space-y-2"><Label>Early Bird Deadline</Label><Input type="date" value={form.earlyBirdDeadline} onChange={(e) => setForm({ ...form, earlyBirdDeadline: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Benefits (one per line)</Label><Textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} placeholder="Access to all sessions&#10;Networking lunch" /></div>
            <div className="space-y-2"><Label>External Purchase URL (optional)</Label><Input value={form.purchaseUrl} onChange={(e) => setForm({ ...form, purchaseUrl: e.target.value })} placeholder="https://eventbrite.com/..." /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.isVisible} onCheckedChange={(v) => setForm({ ...form, isVisible: v })} /><Label>Visible</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /><Label>Featured</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
