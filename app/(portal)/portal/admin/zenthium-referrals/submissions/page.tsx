"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Building2,
  Zap,
  User,
  FileText,
  DollarSign,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteInformation {
  referralTitle: string;
  propertyName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: string;
  parcelNumber: string;
  acreage: string;
  squareFootage: string;
  description: string;
}

interface Infrastructure {
  powerCapacityMW: string;
  utilityProvider: string;
  fiberConnectivity: string;
  waterAccess: string;
  zoningType: string;
  environmentalConstraints: string;
}

interface OwnershipPricing {
  ownerName: string;
  ownershipType: string;
  askingPrice: string;
  pricePerAcre: string;
  availableImmediately: boolean;
  transactionType: string;
}

interface Contacts {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCompany: string;
  relationshipToProperty: string;
}

interface AdditionalNotes {
  notes: string;
  attachmentUrls: string[];
}

interface DataCenterSubmission {
  id: string;
  status: "new" | "under_review" | "approved" | "rejected";
  submittedAt: Date;
  updatedAt: Date;
  siteInformation: SiteInformation;
  infrastructure: Infrastructure;
  ownershipPricing: OwnershipPricing;
  contacts: Contacts;
  additionalNotes: AdditionalNotes;
}

const COLLECTION = "zenthiumReferralSubmissions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "object" && "toDate" in (val as object))
    return (val as Timestamp).toDate();
  if (typeof val === "number") return new Date(val);
  return new Date(val as string);
}

function fromFirestore(id: string, data: Record<string, unknown>): DataCenterSubmission {
  return {
    id,
    status: (data.status as DataCenterSubmission["status"]) || "new",
    submittedAt: toDate(data.submittedAt),
    updatedAt: toDate(data.updatedAt),
    siteInformation: (data.siteInformation as SiteInformation) || {},
    infrastructure: (data.infrastructure as Infrastructure) || {},
    ownershipPricing: (data.ownershipPricing as OwnershipPricing) || {},
    contacts: (data.contacts as Contacts) || {},
    additionalNotes: (data.additionalNotes as AdditionalNotes) || { notes: "", attachmentUrls: [] },
  } as DataCenterSubmission;
}

function getStatusBadge(status: DataCenterSubmission["status"]) {
  switch (status) {
    case "new":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />New
        </Badge>
      );
    case "under_review":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />Under Review
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />Rejected
        </Badge>
      );
  }
}

function Field({ label, value }: { label: string; value?: string | boolean | null }) {
  if (!value && value !== false) return null;
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <p className="mt-0.5 text-sm">{String(value)}</p>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ZenthiumSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DataCenterSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selected, setSelected] = useState<DataCenterSubmission | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadSubmissions = useCallback(async () => {
    if (!db) {
      toast.error("Database not available");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const q = query(collection(db, COLLECTION), orderBy("submittedAt", "desc"));
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>)));
    } catch (err) {
      console.error("Error loading submissions:", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // ── Filtered ──────────────────────────────────────────────────────────────
  const filtered = submissions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.siteInformation.referralTitle?.toLowerCase().includes(q) ||
        s.siteInformation.propertyName?.toLowerCase().includes(q) ||
        s.siteInformation.city?.toLowerCase().includes(q) ||
        s.siteInformation.state?.toLowerCase().includes(q) ||
        s.contacts.contactName?.toLowerCase().includes(q) ||
        s.contacts.contactEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    underReview: submissions.filter((s) => s.status === "under_review").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  // ── Update Status ─────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: DataCenterSubmission["status"]) => {
    if (!db) return;
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: Timestamp.now() });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status, updatedAt: new Date() } : s))
      );
      if (selected?.id === id) setSelected((prev) => prev && { ...prev, status });
      toast.success("Status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selected?.id === id) { setViewDialogOpen(false); setSelected(null); }
      toast.success("Submission deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete submission");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Zenthium Data Center Submissions</h1>
            <p className="text-muted-foreground text-sm">
              Review and manage submitted data center location referrals
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadSubmissions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "New", value: stats.new, color: "text-blue-600" },
          { label: "Under Review", value: stats.underReview, color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by property, city, state, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referral Title</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "No submissions match your filters"
                    : "No submissions yet"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/50">
                  <TableCell
                    className="font-medium cursor-pointer hover:text-primary max-w-[200px] truncate"
                    onClick={() => { setSelected(sub); setViewDialogOpen(true); }}
                  >
                    {sub.siteInformation.referralTitle || "—"}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {sub.siteInformation.propertyName || "—"}
                  </TableCell>
                  <TableCell>
                    {sub.siteInformation.city && sub.siteInformation.state
                      ? `${sub.siteInformation.city}, ${sub.siteInformation.state}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{sub.contacts.contactName || "—"}</div>
                      <div className="text-xs text-muted-foreground">{sub.contacts.contactEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {sub.submittedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelected(sub); setViewDialogOpen(true); }}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(sub.id, "under_review")}>
                          <Clock className="h-4 w-4 mr-2 text-yellow-600" />Mark Under Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(sub.id, "approved")}>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(sub.id, "rejected")}>
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(sub.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          {selected && (
            <>
              <DialogHeader className="px-6 pt-6 pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <DialogTitle className="text-left text-lg">
                        {selected.siteInformation.referralTitle || "Untitled Submission"}
                      </DialogTitle>
                      <DialogDescription className="text-left">
                        Submitted {selected.submittedAt.toLocaleDateString()} ·{" "}
                        {selected.siteInformation.propertyName}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(selected.status)}
                  </div>
                </div>

                {/* Status update inline */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-muted-foreground">Update status:</span>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => updateStatus(selected.id, v as DataCenterSubmission["status"])}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-[160px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto"
                    onClick={() => handleDelete(selected.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </Button>
                </div>
              </DialogHeader>

              <ScrollArea className="h-[calc(90vh-160px)] px-6 py-4">
                <div className="space-y-6">

                  {/* Step 1 — Site Information */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-700">
                        Step 1 — Site Information
                      </h3>
                    </div>
                    <Card>
                      <CardContent className="pt-4 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Field label="Referral Title" value={selected.siteInformation.referralTitle} />
                        </div>
                        <Field label="Property Name" value={selected.siteInformation.propertyName} />
                        <Field label="Street Address" value={selected.siteInformation.streetAddress} />
                        <Field label="City" value={selected.siteInformation.city} />
                        <Field label="State" value={selected.siteInformation.state} />
                        <Field label="ZIP Code" value={selected.siteInformation.zipCode} />
                        <Field label="Country" value={selected.siteInformation.country} />
                        <Field label="Coordinates (lat, lng)" value={selected.siteInformation.coordinates} />
                        <Field label="Parcel Number" value={selected.siteInformation.parcelNumber} />
                        <Field label="Acreage" value={selected.siteInformation.acreage} />
                        <Field label="Square Footage" value={selected.siteInformation.squareFootage} />
                        <div className="col-span-2">
                          <Field label="Description" value={selected.siteInformation.description} />
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator />

                  {/* Step 2 — Infrastructure */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-700">
                        Step 2 — Infrastructure
                      </h3>
                    </div>
                    <Card>
                      <CardContent className="pt-4 grid grid-cols-2 gap-4">
                        <Field label="Power Capacity (MW)" value={selected.infrastructure.powerCapacityMW} />
                        <Field label="Utility Provider" value={selected.infrastructure.utilityProvider} />
                        <Field label="Fiber Connectivity" value={selected.infrastructure.fiberConnectivity} />
                        <Field label="Water Access" value={selected.infrastructure.waterAccess} />
                        <Field label="Zoning Type" value={selected.infrastructure.zoningType} />
                        <div className="col-span-2">
                          <Field label="Environmental Constraints" value={selected.infrastructure.environmentalConstraints} />
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator />

                  {/* Step 3 — Ownership & Pricing */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-700">
                        Step 3 — Ownership & Pricing
                      </h3>
                    </div>
                    <Card>
                      <CardContent className="pt-4 grid grid-cols-2 gap-4">
                        <Field label="Owner Name" value={selected.ownershipPricing.ownerName} />
                        <Field label="Ownership Type" value={selected.ownershipPricing.ownershipType} />
                        <Field label="Asking Price" value={selected.ownershipPricing.askingPrice} />
                        <Field label="Price Per Acre" value={selected.ownershipPricing.pricePerAcre} />
                        <Field label="Transaction Type" value={selected.ownershipPricing.transactionType} />
                        <Field
                          label="Available Immediately"
                          value={selected.ownershipPricing.availableImmediately ? "Yes" : "No"}
                        />
                      </CardContent>
                    </Card>
                  </section>

                  <Separator />

                  {/* Step 4 — Contacts */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-700">
                        Step 4 — Contacts
                      </h3>
                    </div>
                    <Card>
                      <CardContent className="pt-4 grid grid-cols-2 gap-4">
                        <Field label="Contact Name" value={selected.contacts.contactName} />
                        <Field label="Contact Email" value={selected.contacts.contactEmail} />
                        <Field label="Contact Phone" value={selected.contacts.contactPhone} />
                        <Field label="Company" value={selected.contacts.contactCompany} />
                        <div className="col-span-2">
                          <Field label="Relationship to Property" value={selected.contacts.relationshipToProperty} />
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator />

                  {/* Step 5 — Additional Notes */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-700">
                        Step 5 — Additional Notes
                      </h3>
                    </div>
                    <Card>
                      <CardContent className="pt-4 space-y-3">
                        <Field label="Notes" value={selected.additionalNotes.notes} />
                        {selected.additionalNotes.attachmentUrls?.length > 0 && (
                          <div>
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                              Attachments
                            </Label>
                            <ul className="mt-1 space-y-1">
                              {selected.additionalNotes.attachmentUrls.map((url, i) => (
                                <li key={i}>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary underline"
                                  >
                                    Attachment {i + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </section>

                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
