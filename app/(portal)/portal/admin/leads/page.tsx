"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Building2,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Upload
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { LeadListItem } from "@/lib/subscription-leads/types";

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
  dwy: "DWY",
  dfy: "DFY",
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    tier: "",
    priority: "",
    search: "",
  });
  const [migrating, setMigrating] = useState(false);

  const limit = 20;

  useEffect(() => {
    fetchLeads();
  }, [offset, filters.status, filters.tier, filters.priority]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();
      
      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());
      if (filters.status) queryParams.set("status", filters.status);
      if (filters.tier) queryParams.set("tier", filters.tier);
      if (filters.priority) queryParams.set("priority", filters.priority);
      if (filters.search) queryParams.set("q", filters.search);

      const response = await fetch(`/api/subscription/leads?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchLeads();
  };

  const handleMigrateBookCallLeads = async () => {
    try {
      setMigrating(true);
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/migrate-book-call-leads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to migrate leads");
      }

      toast.success(data.message || `Migrated ${data.migrated} leads`);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message || "Failed to migrate leads");
    } finally {
      setMigrating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-9xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Subscription Leads</h1>
            <p className="text-muted-foreground">
              Manage DWY and DFY subscription leads and track follow-ups
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleMigrateBookCallLeads}
            disabled={migrating}
          >
            {migrating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Migrate Book Call Leads
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
              <Input
                placeholder="Search by company or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Filter className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters({ ...filters, status: value });
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.tier}
              onValueChange={(value) => {
                setFilters({ ...filters, tier: value });
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tiers</SelectItem>
                <SelectItem value="dwy">DWY</SelectItem>
                <SelectItem value="dfy">DFY</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => {
                setFilters({ ...filters, priority: value });
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchLeads} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground">Total Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter((l) => l.status === "new").length}
            </div>
            <div className="text-sm text-muted-foreground">New</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {leads.filter((l) => l.status === "contacted").length}
            </div>
            <div className="text-sm text-muted-foreground">Contacted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {leads.filter((l) => l.status === "converted").length}
            </div>
            <div className="text-sm text-muted-foreground">Converted</div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-muted-foreground">
                {filters.status || filters.tier || filters.search
                  ? "Try adjusting your filters"
                  : "Leads will appear when users subscribe to DWY or DFY plans"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>SVP Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium">{lead.companyName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TIER_NAMES[lead.tier]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[lead.status]}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[lead.priority]}>
                          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(lead.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSyncIcon(lead.syncStatus)}
                          <span className="text-sm capitalize">{lead.syncStatus}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/portal/admin/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1}-{Math.min(offset + leads.length, total)} of {total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset((prev) => prev + limit)}
                    disabled={offset + leads.length >= total}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
