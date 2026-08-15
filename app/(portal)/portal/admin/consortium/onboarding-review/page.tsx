"use client";

import { useState, useEffect, useMemo, type ReactElement } from "react";
import Link from "next/link";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Search, RefreshCw, ClipboardCheck, CheckCircle2, AlertCircle, Circle } from "lucide-react";

interface ReviewMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  membershipStatus?: string;
  avatar?: string;
  onboardingReviewStatus: "not_reviewed" | "changes_requested" | "approved";
  completeness: number;
  onboardingReviewedAt?: string;
  onboardingApprovedAt?: string;
  lastReviewRequestSentAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_BADGE: Record<string, string> = {
  not_reviewed: "bg-slate-100 text-slate-800 border-slate-300",
  changes_requested: "bg-amber-100 text-amber-800 border-amber-300",
  approved: "bg-green-100 text-green-800 border-green-300",
};

const STATUS_LABEL: Record<string, string> = {
  not_reviewed: "Not Reviewed",
  changes_requested: "Changes Requested",
  approved: "Approved",
};

const STATUS_ICON: Record<string, ReactElement> = {
  not_reviewed: <Circle className="h-4 w-4 text-slate-400" />,
  changes_requested: <AlertCircle className="h-4 w-4 text-amber-600" />,
  approved: <CheckCircle2 className="h-4 w-4 text-green-600" />,
};

export default function OnboardingReviewListPage() {
  const [members, setMembers] = useState<ReviewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getToken = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) throw new Error("You must be signed in");
    return currentUser.getIdToken();
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/onboarding-review/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load members");
      setMembers(data.data || []);
    } catch (error) {
      console.error("Error loading onboarding review list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.company || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || member.onboardingReviewStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    const total = members.length;
    const notReviewed = members.filter((m) => m.onboardingReviewStatus === "not_reviewed").length;
    const changesRequested = members.filter((m) => m.onboardingReviewStatus === "changes_requested").length;
    const approved = members.filter((m) => m.onboardingReviewStatus === "approved").length;
    return { total, notReviewed, changesRequested, approved };
  }, [members]);

  const getInitials = (member: ReviewMember) => {
    const first = member.firstName?.[0] || "";
    const last = member.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "CM";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7" />
          Onboarding Review
        </h1>
        <p className="text-muted-foreground">
          Review each member&apos;s onboarding profile content for AI search, recommendation, and teaming
          sufficiency. Request updates or approve to unlock full AI access.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{summary.total}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{summary.notReviewed}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Changes Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{summary.changesRequested}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{summary.approved}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-56">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not_reviewed">Not Reviewed</SelectItem>
                  <SelectItem value="changes_requested">Changes Requested</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={fetchMembers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} matching filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No consortium members found matching your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/portal/admin/consortium/onboarding-review/${member.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email} · {member.company || "No company"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-32 hidden sm:block">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Profile</span>
                        <span>{member.completeness}%</span>
                      </div>
                      <Progress value={member.completeness} className="h-1.5" />
                    </div>
                    <Badge variant="outline" className={`flex items-center gap-1.5 ${STATUS_BADGE[member.onboardingReviewStatus]}`}>
                      {STATUS_ICON[member.onboardingReviewStatus]}
                      {STATUS_LABEL[member.onboardingReviewStatus]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
