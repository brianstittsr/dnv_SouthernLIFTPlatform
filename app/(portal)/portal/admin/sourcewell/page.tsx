"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { SourcewellSolicitationDoc, SolicitationStatus, SolicitationCategory } from "@/lib/types/sourcewell";
import { toast } from "sonner";
import { format } from "date-fns";

const categoryOptions: { value: SolicitationCategory; label: string }[] = [
  { value: "construction", label: "Construction" },
  { value: "equipment", label: "Equipment" },
  { value: "services", label: "Services" },
  { value: "technology", label: "Technology" },
  { value: "vehicles", label: "Vehicles" },
  { value: "supplies", label: "Supplies" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

export default function SourcewellAdminPage() {
  const [solicitations, setSolicitations] = useState<SourcewellSolicitationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSolicitation, setEditingSolicitation] = useState<SourcewellSolicitationDoc | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    solicitationNumber: "",
    title: "",
    description: "",
    category: "equipment" as SolicitationCategory,
    status: "open" as SolicitationStatus,
    postedDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    estimatedValue: "",
    contractTerm: "",
    portalUrl: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    requirements: "",
    eligibility: "",
    notes: "",
    tags: "",
  });

  useEffect(() => {
    fetchSolicitations();
  }, []);

  async function fetchSolicitations() {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, COLLECTIONS.SOURCEWELL_SOLICITATIONS),
        orderBy("postedDate", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SourcewellSolicitationDoc[];
      setSolicitations(data);
    } catch (error) {
      console.error("Error fetching solicitations:", error);
      toast.error("Failed to load solicitations");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(solicitation?: SourcewellSolicitationDoc) {
    if (solicitation) {
      setEditingSolicitation(solicitation);
      setFormData({
        solicitationNumber: solicitation.solicitationNumber,
        title: solicitation.title,
        description: solicitation.description,
        category: solicitation.category,
        status: solicitation.status,
        postedDate: format(solicitation.postedDate.toDate(), "yyyy-MM-dd"),
        dueDate: solicitation.dueDate ? format(solicitation.dueDate.toDate(), "yyyy-MM-dd") : "",
        estimatedValue: solicitation.estimatedValue || "",
        contractTerm: solicitation.contractTerm || "",
        portalUrl: solicitation.portalUrl || "",
        contactName: solicitation.contactName || "",
        contactEmail: solicitation.contactEmail || "",
        contactPhone: solicitation.contactPhone || "",
        requirements: solicitation.requirements?.join("\n") || "",
        eligibility: solicitation.eligibility || "",
        notes: solicitation.notes || "",
        tags: solicitation.tags?.join(", ") || "",
      });
    } else {
      setEditingSolicitation(null);
      setFormData({
        solicitationNumber: "",
        title: "",
        description: "",
        category: "equipment",
        status: "open",
        postedDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        estimatedValue: "",
        contractTerm: "",
        portalUrl: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        requirements: "",
        eligibility: "",
        notes: "",
        tags: "",
      });
    }
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!db) return;

    if (!formData.solicitationNumber || !formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      const solicitationData = {
        solicitationNumber: formData.solicitationNumber,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        postedDate: Timestamp.fromDate(new Date(formData.postedDate)),
        dueDate: formData.dueDate ? Timestamp.fromDate(new Date(formData.dueDate)) : null,
        estimatedValue: formData.estimatedValue || null,
        contractTerm: formData.contractTerm || null,
        portalUrl: formData.portalUrl || null,
        contactName: formData.contactName || null,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        requirements: formData.requirements ? formData.requirements.split("\n").filter(r => r.trim()) : [],
        eligibility: formData.eligibility || null,
        notes: formData.notes || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(t => t) : [],
        keywords: [
          formData.title.toLowerCase(),
          formData.solicitationNumber.toLowerCase(),
          ...formData.description.toLowerCase().split(" "),
        ],
        updatedAt: Timestamp.now(),
      };

      if (editingSolicitation) {
        await updateDoc(doc(db, COLLECTIONS.SOURCEWELL_SOLICITATIONS, editingSolicitation.id), solicitationData);
        toast.success("Solicitation updated successfully");
      } else {
        await addDoc(collection(db, COLLECTIONS.SOURCEWELL_SOLICITATIONS), {
          ...solicitationData,
          createdAt: Timestamp.now(),
        });
        toast.success("Solicitation created successfully");
      }

      setDialogOpen(false);
      fetchSolicitations();
    } catch (error) {
      console.error("Error saving solicitation:", error);
      toast.error("Failed to save solicitation");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(solicitation: SourcewellSolicitationDoc) {
    if (!db) return;

    if (!confirm(`Are you sure you want to delete "${solicitation.title}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.SOURCEWELL_SOLICITATIONS, solicitation.id));
      toast.success("Solicitation deleted successfully");
      fetchSolicitations();
    } catch (error) {
      console.error("Error deleting solicitation:", error);
      toast.error("Failed to delete solicitation");
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SourceWell Solicitations Admin</h1>
          <p className="text-muted-foreground mt-2">
            Manage cooperative purchasing solicitations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSolicitations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Solicitation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSolicitation ? "Edit Solicitation" : "Add New Solicitation"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the solicitation details below
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="solicitationNumber">Solicitation Number *</Label>
                    <Input
                      id="solicitationNumber"
                      value={formData.solicitationNumber}
                      onChange={(e) => setFormData({ ...formData, solicitationNumber: e.target.value })}
                      placeholder="e.g., 11313"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value: SolicitationStatus) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Commercial Kitchen Equipment with Related Supplies and Services"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the solicitation"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value: SolicitationCategory) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portalUrl">Portal URL</Label>
                    <Input
                      id="portalUrl"
                      value={formData.portalUrl}
                      onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                      placeholder="https://proportal.sourcewell-mn.gov/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postedDate">Posted Date *</Label>
                    <Input
                      id="postedDate"
                      type="date"
                      value={formData.postedDate}
                      onChange={(e) => setFormData({ ...formData, postedDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedValue">Estimated Value</Label>
                    <Input
                      id="estimatedValue"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                      placeholder="e.g., $1M - $5M"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractTerm">Contract Term</Label>
                    <Input
                      id="contractTerm"
                      value={formData.contractTerm}
                      onChange={(e) => setFormData({ ...formData, contractTerm: e.target.value })}
                      placeholder="e.g., 4 years"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Enter each requirement on a new line"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility</Label>
                  <Textarea
                    id="eligibility"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    placeholder="Who is eligible to respond to this solicitation?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., kitchen, equipment, food service"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional information"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSolicitation ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitations</CardTitle>
          <CardDescription>
            {solicitations.length} solicitation{solicitations.length !== 1 ? 's' : ''} in database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : solicitations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No solicitations yet. Click "Add Solicitation" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitations.map((solicitation) => (
                  <TableRow key={solicitation.id}>
                    <TableCell className="font-mono text-xs">
                      {solicitation.solicitationNumber}
                    </TableCell>
                    <TableCell className="font-medium max-w-md truncate">
                      {solicitation.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        solicitation.status === "open" ? "default" :
                        solicitation.status === "pending" ? "secondary" :
                        solicitation.status === "awarded" ? "outline" : "destructive"
                      }>
                        {solicitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categoryOptions.find(c => c.value === solicitation.category)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(solicitation.postedDate.toDate(), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {solicitation.portalUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={solicitation.portalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(solicitation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(solicitation)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
