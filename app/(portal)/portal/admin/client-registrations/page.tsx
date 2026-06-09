"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientRegistrationModal } from "@/components/client-registration";
import {
  User, Building2, Phone, Mail, MapPin, Calendar, MoreHorizontal, Trash2, Eye, Edit, CheckCircle, XCircle, Loader2, Search, Filter, Download, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type RegistrationStatus = "pending" | "approved" | "rejected" | "under_review";

interface ClientRegistration {
  id: string;
  prefix: string; firstName: string; middleName: string; lastName: string;
  companyName: string;
  title: string;
  companyOwnerEthnicity: string;
  minorityBusinessCertification: string;
  mobilePhone: string;
  companyEmail: string;
  city: string; state: string;
  naicsCodes: string[];
  cageCodes: string[];
  approximateAnnualRevenue: string;
  status: RegistrationStatus;
  helpNeededFromKDM: string;
  topCompanyNeed: string;
  servicesInterestedIn: string[];
  kdmRepAssigned: string;
  notes: string;
  assignedTo: string;
  reviewedBy: string;
  submissionDate: string;
  lastUpdateDate: string;
  reviewedAt: string;
  oemManufacturers: string[];
}

const statusColors: Record<RegistrationStatus, string> = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  under_review: "bg-blue-500",
};

const statusLabels: Record<RegistrationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  under_review: "Under Review",
};

export default function ClientRegistrationsAdminPage() {
  const [registrations, setRegistrations] = useState<ClientRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<ClientRegistration | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedRep, setAssignedRep] = useState("");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      
      const response = await fetch(`/api/client-registrations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data);
      } else {
        toast.error("Failed to load registrations");
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, newStatus: RegistrationStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/client-registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Status updated to ${statusLabels[newStatus]}`);
        fetchRegistrations();
        if (selectedRegistration?.id === id) {
          setSelectedRegistration({ ...selectedRegistration, status: newStatus });
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateNotes = async (id: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/client-registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          notes: notes,
          kdmRepAssigned: assignedRep 
        }),
      });

      if (response.ok) {
        toast.success("Registration updated");
        fetchRegistrations();
        setDetailsOpen(false);
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/client-registrations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Registration deleted");
        fetchRegistrations();
        setDeleteOpen(false);
        setDetailsOpen(false);
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setUpdating(false);
    }
  };

  const openDetails = (registration: ClientRegistration) => {
    setSelectedRegistration(registration);
    setNotes(registration.notes || "");
    setAssignedRep(registration.kdmRepAssigned || "");
    setDetailsOpen(true);
  };

  const openEdit = (registration: ClientRegistration) => {
    setSelectedRegistration(registration);
    setEditOpen(true);
  };

  const openDelete = (registration: ClientRegistration) => {
    setSelectedRegistration(registration);
    setDeleteOpen(true);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      reg.firstName?.toLowerCase().includes(searchLower) ||
      reg.lastName?.toLowerCase().includes(searchLower) ||
      reg.companyName?.toLowerCase().includes(searchLower) ||
      reg.companyEmail?.toLowerCase().includes(searchLower) ||
      reg.naicsCodes?.some(code => code.toLowerCase().includes(searchLower))
    );
  });

  const exportToCSV = () => {
    const headers = [
      "ID", "Submission Date", "Status", "First Name", "Last Name", "Company",
      "Title", "Email", "Phone", "City", "State", "NAICS", "Revenue",
      "Ethnicity", "Certification", "Top Need", "Services Interested"
    ];
    const rows = registrations.map((r) => [
      r.id, r.submissionDate, r.status, r.firstName, r.lastName, r.companyName,
      r.title, r.companyEmail, r.mobilePhone, r.city, r.state, r.naicsCodes?.join("; "),
      r.cageCodes?.join("; "), r.approximateAnnualRevenue, r.companyOwnerEthnicity, r.minorityBusinessCertification,
      r.topCompanyNeed, r.servicesInterestedIn?.join("; "), r.oemManufacturers?.join("; ")
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `client-registrations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Registrations</h1>
          <p className="text-muted-foreground mt-1">
            Manage KDM & Associates client registrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchRegistrations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, email, or NAICS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as RegistrationStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== "all" 
                  ? "Try adjusting your filters"
                  : "No client registrations have been submitted yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>NAICS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rep Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      {reg.submissionDate && format(new Date(reg.submissionDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {reg.prefix} {reg.firstName} {reg.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{reg.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{reg.companyName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {reg.city}, {reg.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{reg.companyEmail}</div>
                      <div className="text-sm text-muted-foreground">{reg.mobilePhone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {reg.naicsCodes?.slice(0, 2).map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                        ))}
                        {reg.naicsCodes?.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{reg.naicsCodes.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[reg.status]}>
                        {statusLabels[reg.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reg.kdmRepAssigned || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetails(reg)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(reg)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(reg.id, "approved")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(reg.id, "under_review")}>
                            <Loader2 className="h-4 w-4 mr-2" />
                            Mark Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(reg.id, "rejected")}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(reg)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Registration Details</DialogTitle>
            <DialogDescription>
              View and manage registration details
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Name</h4>
                  <p>{selectedRegistration.prefix} {selectedRegistration.firstName} {selectedRegistration.middleName} {selectedRegistration.lastName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Company</h4>
                  <p>{selectedRegistration.companyName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Title</h4>
                  <p>{selectedRegistration.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p>{selectedRegistration.companyEmail}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <p>{selectedRegistration.mobilePhone}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <p>{selectedRegistration.city}, {selectedRegistration.state}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">NAICS Codes</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegistration.naicsCodes?.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Revenue</h4>
                  <p>{selectedRegistration.approximateAnnualRevenue || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Ethnicity</h4>
                  <p>{selectedRegistration.companyOwnerEthnicity}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Certification</h4>
                  <p>{selectedRegistration.minorityBusinessCertification || "None"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Top Need</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedRegistration.topCompanyNeed}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Help Needed</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedRegistration.helpNeededFromKDM}</p>
              </div>

              {selectedRegistration.servicesInterestedIn?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Services Interested In</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegistration.servicesInterestedIn.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">KDM & Associates Rep Assigned</h4>
                <Input
                  value={assignedRep}
                  onChange={(e) => setAssignedRep(e.target.value)}
                  placeholder="Enter rep name"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Badge className={statusColors[selectedRegistration.status]}>
                  {statusLabels[selectedRegistration.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Submitted {selectedRegistration.submissionDate && format(new Date(selectedRegistration.submissionDate), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus(selectedRegistration!.id, "approved")}
              disabled={updating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus(selectedRegistration!.id, "rejected")}
              disabled={updating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => handleUpdateNotes(selectedRegistration!.id)}
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {selectedRegistration && (
        <ClientRegistrationModal
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          registrationId={selectedRegistration.id}
          initialData={{
            prefix: selectedRegistration.prefix,
            firstName: selectedRegistration.firstName,
            middleName: selectedRegistration.middleName,
            lastName: selectedRegistration.lastName,
            title: selectedRegistration.title,
            companyOwnerEthnicity: selectedRegistration.companyOwnerEthnicity,
            minorityBusinessCertification: selectedRegistration.minorityBusinessCertification,
            mobilePhone: selectedRegistration.mobilePhone,
            companyEmail: selectedRegistration.companyEmail,
            city: selectedRegistration.city,
            state: selectedRegistration.state,
            naicsCodes: selectedRegistration.naicsCodes || [],
            cageCodes: selectedRegistration.cageCodes || [],
            companyName: selectedRegistration.companyName,
            helpNeededFromKDM: selectedRegistration.helpNeededFromKDM,
            topCompanyNeed: selectedRegistration.topCompanyNeed,
            servicesInterestedIn: selectedRegistration.servicesInterestedIn,
            oemManufacturers: selectedRegistration.oemManufacturers || [],
            kdmRepAssigned: selectedRegistration.kdmRepAssigned,
            notes: selectedRegistration.notes,
          }}
          onSuccess={() => {
            setEditOpen(false);
            fetchRegistrations();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this registration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="py-4">
              <p className="font-medium">{selectedRegistration.firstName} {selectedRegistration.lastName}</p>
              <p className="text-muted-foreground">{selectedRegistration.companyName}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(selectedRegistration!.id)}
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
