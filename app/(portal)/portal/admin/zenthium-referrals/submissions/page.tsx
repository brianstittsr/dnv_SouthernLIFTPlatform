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
  ArrowLeft,
  ArrowRight,
  Save,
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

export default function DataCenterSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");

  // View/Edit dialog state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState<Partial<Submission>>({});

  // Fetch submissions
  const fetchSubmissions = async () => {
    if (!db) {
      toast.error("Database not initialized");
      return;
    }
    try {
      setLoading(true);
      const q = query(
        collection(db, COLLECTIONS.DATA_CENTER_SUBMISSIONS),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Submission[];
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter !== "all" && sub.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sub.referralTitle?.toLowerCase().includes(q) ||
        sub.propertyName?.toLowerCase().includes(q) ||
        sub.city?.toLowerCase().includes(q) ||
        sub.state?.toLowerCase().includes(q) ||
        sub.submittedByEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    underReview: submissions.filter((s) => s.status === "under_review").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  // Update status
  const updateStatus = async (submissionId: string, status: SubmissionStatus) => {
    if (!db) return;
    try {
      const ref = doc(db, COLLECTIONS.DATA_CENTER_SUBMISSIONS, submissionId);
      await updateDoc(ref, {
        status,
        updatedAt: Timestamp.now(),
      });
      toast.success(`Status updated to ${statusLabels[status]}`);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status } : s))
      );
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Save review notes
  const saveReviewNotes = async () => {
    if (!db || !selectedSubmission) return;
    try {
      setSaving(true);
      const ref = doc(db, COLLECTIONS.DATA_CENTER_SUBMISSIONS, selectedSubmission.id);
      await updateDoc(ref, {
        reviewNotes: formData.reviewNotes,
        updatedAt: Timestamp.now(),
      });
      toast.success("Review notes saved");
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, reviewNotes: formData.reviewNotes }
            : s
        )
      );
      setSelectedSubmission({
        ...selectedSubmission,
        reviewNotes: formData.reviewNotes,
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  // Open view dialog
  const openViewDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFormData({
      reviewNotes: submission.reviewNotes || "",
    });
    setEditMode(false);
    setViewDialogOpen(true);
  };

  // Format date
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "—";
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp as any).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>Admin</span>
            <ArrowRight className="h-4 w-4" />
            <span>Zenthium Referrals</span>
            <ArrowRight className="h-4 w-4" />
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
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
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as SubmissionStatus | "all")}
            >
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

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            Review and manage data center location submissions
          </CardDescription>
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
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {submission.referralTitle}
                    </TableCell>
                    <TableCell>{submission.propertyName}</TableCell>
                    <TableCell>
                      {submission.city}, {submission.state}
                    </TableCell>
                    <TableCell>
                      {submission.acreage ? `${submission.acreage} acres` : "—"}
                      {submission.squareFootage && (
                        <div className="text-xs text-muted-foreground">
                          {submission.squareFootage.toLocaleString()} sq ft
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariants[submission.status]}>
                        {statusLabels[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(submission.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(submission)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => updateStatus(submission.id, "under_review")}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Mark Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(submission.id, "approved")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(submission.id, "contacted")}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateStatus(submission.id, "rejected")}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Reject
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

      {/* View/Edit Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {selectedSubmission.referralTitle}
                </DialogTitle>
                <DialogDescription>
                  Property submission for Zenthium evaluation
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={statusBadgeVariants[selectedSubmission.status]}>
                    {statusLabels[selectedSubmission.status]}
                  </Badge>
                </div>

                {/* Site Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Site Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Referral Title</Label>
                      <p className="font-medium">{selectedSubmission.referralTitle}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Property Name</Label>
                      <p className="font-medium">{selectedSubmission.propertyName}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Street Address</Label>
                    <p>{selectedSubmission.streetAddress || "—"}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">City</Label>
                      <p>{selectedSubmission.city}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">State</Label>
                      <p>{selectedSubmission.state}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">ZIP Code</Label>
                      <p>{selectedSubmission.zipCode || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Country</Label>
                      <p>{selectedSubmission.country || "—"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Coordinates</Label>
                      <p>{selectedSubmission.coordinates || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Parcel Number</Label>
                      <p>{selectedSubmission.parcelNumber || "—"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Acreage</Label>
                      <p>{selectedSubmission.acreage ? `${selectedSubmission.acreage} acres` : "—"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Square Footage</Label>
                      <p>
                        {selectedSubmission.squareFootage
                          ? selectedSubmission.squareFootage.toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {selectedSubmission.description}
                    </p>
                  </div>
                </div>

                {/* Submitter Info */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Submitter Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Submitted By</Label>
                      <p>{selectedSubmission.submittedBy || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <p>{selectedSubmission.submittedByEmail || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Submission Date</Label>
                    <p>{formatDate(selectedSubmission.createdAt)}</p>
                  </div>
                </div>

                {/* Review Notes */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Review Notes
                    </h3>
                    {!editMode && (
                      <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Edit Notes
                      </Button>
                    )}
                  </div>
                  {editMode ? (
                    <div className="space-y-3">
                      <Textarea
                        value={formData.reviewNotes || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, reviewNotes: e.target.value })
                        }
                        placeholder="Add review notes here..."
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveReviewNotes} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Notes"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">
                      {selectedSubmission.reviewNotes || "No review notes added yet."}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedSubmission.id, "under_review")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Under Review
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => updateStatus(selectedSubmission.id, "approved")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selectedSubmission.id, "contacted")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacted
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selectedSubmission.id, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
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
