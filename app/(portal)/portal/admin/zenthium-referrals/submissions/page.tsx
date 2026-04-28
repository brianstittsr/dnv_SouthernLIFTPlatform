"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, updateDoc, doc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, type DataCenterSubmissionDoc } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Building2,
  ChevronRight,
  Save,
  Zap,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";

type SubmissionStatus = "new" | "under_review" | "approved" | "rejected" | "contacted";

interface Submission extends DataCenterSubmissionDoc {
  id: string;
}

const statusLabels: Record<SubmissionStatus, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  contacted: "Contacted",
};

const statusBadgeVariants: Record<SubmissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  under_review: "secondary",
  approved: "default",
  rejected: "destructive",
  contacted: "outline",
};

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === undefined || value === null || value === ""
      ? "—"
      : typeof value === "boolean"
      ? value ? "Yes" : "No"
      : String(value);
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm">{display}</p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-semibold text-sm uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export default function DataCenterSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [reviewNotesDraft, setReviewNotesDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSubmissions = async () => {
    if (!db) { toast.error("Database not initialized"); return; }
    try {
      setLoading(true);
      const q = query(collection(db, COLLECTIONS.DATA_CENTER_SUBMISSIONS), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setSubmissions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Submission[]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter !== "all" && sub.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sub.referralTitle?.toLowerCase().includes(q) ||
        sub.propertyName?.toLowerCase().includes(q) ||
        sub.city?.toLowerCase().includes(q) ||
        sub.state?.toLowerCase().includes(q) ||
        sub.submittedByEmail?.toLowerCase().includes(q) ||
        sub.ownerEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    underReview: submissions.filter((s) => s.status === "under_review").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const updateStatus = async (submissionId: string, status: SubmissionStatus) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, COLLECTIONS.DATA_CENTER_SUBMISSIONS, submissionId), {
        status,
        updatedAt: Timestamp.now(),
      });
      toast.success(`Status updated to ${statusLabels[status]}`);
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status } : s)));
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission((prev) => prev ? { ...prev, status } : prev);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const saveReviewNotes = async () => {
    if (!db || !selectedSubmission) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, COLLECTIONS.DATA_CENTER_SUBMISSIONS, selectedSubmission.id), {
        reviewNotes: reviewNotesDraft,
        updatedAt: Timestamp.now(),
      });
      toast.success("Review notes saved");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? { ...s, reviewNotes: reviewNotesDraft } : s))
      );
      setSelectedSubmission((prev) => prev ? { ...prev, reviewNotes: reviewNotesDraft } : prev);
      setEditingNotes(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const openViewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewNotesDraft(submission.reviewNotes || "");
    setEditingNotes(false);
    setViewDialogOpen(true);
  };

  const formatDate = (ts: Timestamp | undefined) => {
    if (!ts) return "—";
    try {
      return (typeof ts.toDate === "function" ? ts.toDate() : new Date(ts as any)).toLocaleDateString();
    } catch { return "—"; }
  };

  const fmt = (n?: number) => (n !== undefined && n !== null ? n.toLocaleString() : "—");

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span>Zenthium Referrals</span>
            <ChevronRight className="h-4 w-4" />
            <span>Submissions</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Data Center Location Submissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage property submissions for Zenthium data center evaluation
          </p>
        </div>
        <Button variant="outline" onClick={fetchSubmissions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "New", value: stats.new, color: "text-blue-600" },
          { label: "Under Review", value: stats.underReview, color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, property, city, state, or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubmissionStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Review and manage data center location submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No submissions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Submissions will appear here when properties are submitted"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral Title</TableHead>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Acreage / Sq Ft</TableHead>
                  <TableHead>Power (MW)</TableHead>
                  <TableHead>Sale / Lease</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">{sub.referralTitle}</TableCell>
                    <TableCell className="max-w-[140px] truncate">{sub.propertyName}</TableCell>
                    <TableCell className="whitespace-nowrap">{sub.city}, {sub.state} {sub.zipCode || ""}</TableCell>
                    <TableCell>
                      {sub.acreage ? `${sub.acreage} ac` : "—"}
                      {sub.squareFootage ? (
                        <div className="text-xs text-muted-foreground">{sub.squareFootage.toLocaleString()} ft²</div>
                      ) : null}
                    </TableCell>
                    <TableCell>{sub.powerAvailableMW != null ? `${sub.powerAvailableMW} MW` : "—"}</TableCell>
                    <TableCell>
                      {sub.saleOrLease
                        ? { sale: "Sale", lease: "Lease", both: "Sale & Lease" }[sub.saleOrLease]
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariants[sub.status]}>{statusLabels[sub.status]}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(sub.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(sub)}>
                            <Eye className="h-4 w-4 mr-2" />View All Fields
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateStatus(sub.id, "under_review")}>
                            <Clock className="h-4 w-4 mr-2" />Mark Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(sub.id, "approved")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(sub.id, "contacted")}>
                            <MessageSquare className="h-4 w-4 mr-2" />Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(sub.id, "rejected")}>
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />Reject
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

      {/* ── Full Detail Dialog ─────────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-primary" />
                  {selectedSubmission.referralTitle}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3">
                  <span>{selectedSubmission.propertyName}</span>
                  <span>·</span>
                  <span>{selectedSubmission.city}, {selectedSubmission.state}</span>
                  <span>·</span>
                  <Badge variant={statusBadgeVariants[selectedSubmission.status]}>
                    {statusLabels[selectedSubmission.status]}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 py-2">

                {/* ── Step 1: Site Information ── */}
                <div className="space-y-4">
                  <SectionHeading icon={MapPin} title="Step 1 — Site Information" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Referral Title" value={selectedSubmission.referralTitle} />
                    <Field label="Property Name" value={selectedSubmission.propertyName} />
                  </div>
                  <Field label="Street Address" value={selectedSubmission.streetAddress} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Field label="City" value={selectedSubmission.city} />
                    <Field label="State" value={selectedSubmission.state} />
                    <Field label="ZIP Code" value={selectedSubmission.zipCode} />
                    <Field label="Country" value={selectedSubmission.country} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Coordinates (lat,lng)" value={selectedSubmission.coordinates} />
                    <Field label="Parcel Number" value={selectedSubmission.parcelNumber} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Acreage" value={selectedSubmission.acreage != null ? `${selectedSubmission.acreage} acres` : undefined} />
                    <Field label="Square Footage" value={selectedSubmission.squareFootage != null ? `${fmt(selectedSubmission.squareFootage)} ft²` : undefined} />
                  </div>
                  <Field label="Description" value={selectedSubmission.description} />
                </div>

                <Separator />

                {/* ── Step 2: Infrastructure ── */}
                <div className="space-y-4">
                  <SectionHeading icon={Zap} title="Step 2 — Infrastructure" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Power Available (MW)" value={selectedSubmission.powerAvailableMW} />
                    <Field label="Substation Distance" value={selectedSubmission.powerSubstationDistance} />
                    <Field label="Water Available (GPM)" value={selectedSubmission.waterAvailableGPM} />
                  </div>
                  <Field label="Fiber Connectivity" value={selectedSubmission.fiberConnectivity} />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Natural Gas Available" value={selectedSubmission.naturalGasAvailable} />
                    <Field label="Zoning Classification" value={selectedSubmission.zoningClassification} />
                    <Field label="Flood Zone" value={selectedSubmission.floodZone} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Building Condition" value={selectedSubmission.buildingCondition} />
                    <Field label="Ceiling Height (ft)" value={selectedSubmission.ceilingHeightFt} />
                    <Field label="Loading Docks" value={selectedSubmission.loadingDocks} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Raised Floor Available" value={selectedSubmission.raisedFloorAvailable} />
                    <Field label="Backup Generator" value={selectedSubmission.backupGeneratorAvailable} />
                    <Field label="Cooling Infrastructure" value={selectedSubmission.hasCoolingInfrastructure} />
                  </div>
                  <Field label="Environmental Notes" value={selectedSubmission.environmentalNotes} />
                </div>

                <Separator />

                {/* ── Step 3: Ownership & Pricing ── */}
                <div className="space-y-4">
                  <SectionHeading icon={DollarSign} title="Step 3 — Ownership & Pricing" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Ownership Type" value={
                      selectedSubmission.ownershipType
                        ? { fee_simple: "Fee Simple", leasehold: "Leasehold", ground_lease: "Ground Lease", other: "Other" }[selectedSubmission.ownershipType]
                        : undefined
                    } />
                    <Field label="Sale or Lease" value={
                      selectedSubmission.saleOrLease
                        ? { sale: "For Sale", lease: "For Lease", both: "Sale & Lease" }[selectedSubmission.saleOrLease]
                        : undefined
                    } />
                    <Field label="Closing Timeline (weeks)" value={selectedSubmission.closingTimelineWeeks} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Asking Price (USD)" value={selectedSubmission.askingPriceUSD != null ? `$${fmt(selectedSubmission.askingPriceUSD)}` : undefined} />
                    <Field label="Lease Price ($/sqft/mo)" value={selectedSubmission.leasePricePerSqFtMonthly != null ? `$${selectedSubmission.leasePricePerSqFtMonthly}` : undefined} />
                    <Field label="Annual Property Tax (USD)" value={selectedSubmission.propertyTaxAnnualUSD != null ? `$${fmt(selectedSubmission.propertyTaxAnnualUSD)}` : undefined} />
                  </div>
                  <Field label="Incentives Available" value={selectedSubmission.incentivesAvailable} />
                  <Field label="Title Encumbrances" value={selectedSubmission.titleEncumbrances} />
                </div>

                <Separator />

                {/* ── Step 4: Contacts ── */}
                <div className="space-y-4">
                  <SectionHeading icon={Users} title="Step 4 — Contacts" />
                  <p className="text-xs font-semibold text-muted-foreground">Owner / Seller</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="First Name" value={selectedSubmission.ownerFirstName} />
                    <Field label="Last Name" value={selectedSubmission.ownerLastName} />
                    <Field label="Company" value={selectedSubmission.ownerCompany} />
                    <Field label="Email" value={selectedSubmission.ownerEmail} />
                    <Field label="Phone" value={selectedSubmission.ownerPhone} />
                    <Field label="Preferred Contact" value={selectedSubmission.preferredContactMethod} />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground pt-2">Broker (if applicable)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="First Name" value={selectedSubmission.brokerFirstName} />
                    <Field label="Last Name" value={selectedSubmission.brokerLastName} />
                    <Field label="Company" value={selectedSubmission.brokerCompany} />
                    <Field label="Email" value={selectedSubmission.brokerEmail} />
                    <Field label="Phone" value={selectedSubmission.brokerPhone} />
                    <Field label="License Number" value={selectedSubmission.brokerLicenseNumber} />
                  </div>
                </div>

                <Separator />

                {/* ── Step 5: Additional Notes ── */}
                <div className="space-y-4">
                  <SectionHeading icon={FileText} title="Step 5 — Additional Notes" />
                  <Field label="Additional Notes" value={selectedSubmission.additionalNotes} />
                  <Field label="Documents Available" value={selectedSubmission.documentsAvailable} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Video Tour URL" value={selectedSubmission.videoTourUrl} />
                    <Field label="Aerial Imagery URL" value={selectedSubmission.aerialImageryUrl} />
                  </div>
                  <Field label="Nearby Data Centers" value={selectedSubmission.nearbyDataCenters} />
                  <Field label="Development Timeline Notes" value={selectedSubmission.developmentTimelineNotes} />
                  <Field label="Referred By" value={selectedSubmission.referredBy} />
                </div>

                <Separator />

                {/* ── Admin: Review Notes ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionHeading icon={MessageSquare} title="Admin Review Notes" />
                    {!editingNotes && (
                      <Button variant="outline" size="sm" onClick={() => setEditingNotes(true)}>
                        Edit Notes
                      </Button>
                    )}
                  </div>
                  {editingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={reviewNotesDraft}
                        onChange={(e) => setReviewNotesDraft(e.target.value)}
                        placeholder="Add internal review notes..."
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveReviewNotes} disabled={saving} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Notes"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingNotes(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedSubmission.reviewNotes || "No review notes yet."}
                    </p>
                  )}
                </div>

                {/* ── Submission Metadata ── */}
                <div className="bg-muted/40 rounded-md p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Submission Metadata</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Submitted By" value={selectedSubmission.submittedBy} />
                    <Field label="Submitter Email" value={selectedSubmission.submittedByEmail} />
                    <Field label="Submitted On" value={formatDate(selectedSubmission.createdAt)} />
                    <Field label="Last Updated" value={formatDate(selectedSubmission.updatedAt)} />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                <div className="flex gap-2 flex-1 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => updateStatus(selectedSubmission.id, "under_review")}>
                    <Clock className="h-4 w-4 mr-1" />Under Review
                  </Button>
                  <Button size="sm" onClick={() => updateStatus(selectedSubmission.id, "approved")}>
                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => updateStatus(selectedSubmission.id, "contacted")}>
                    <MessageSquare className="h-4 w-4 mr-1" />Contacted
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => updateStatus(selectedSubmission.id, "rejected")}>
                    <XCircle className="h-4 w-4 mr-1" />Reject
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
