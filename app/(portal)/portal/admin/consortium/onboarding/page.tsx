"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Loader2,
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface StageProgress {
  stage: string;
  label: string;
  status: "not_started" | "in_progress" | "completed" | "skipped";
  startedAt?: string;
  completedAt?: string;
}

interface Member {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  membershipTier?: string;
  membershipStatus?: string;
  avatar?: string;
  onboardedLevel: number;
  onboardedLevelLabel: string;
  currentStage?: string;
  currentStageLabel?: string;
  stageProgress: StageProgress[];
  onboardingComplete: boolean;
  readinessValidationStatus?: string;
  aiMatchingActivated?: boolean;
  engagementScore?: number;
  profileCompleteness?: number;
  updatedAt?: string;
  createdAt?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-slate-500",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-amber-500",
  4: "bg-blue-500",
  5: "bg-indigo-500",
  6: "bg-violet-500",
  7: "bg-green-500",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  inactive: "bg-slate-100 text-slate-800 border-slate-300",
  suspended: "bg-red-100 text-red-800 border-red-300",
};

const TIER_LABELS: Record<string, string> = {
  founder: "Founder",
  "core-capture": "Core Capture",
  core_capture: "Core Capture",
  elite: "Elite",
  standard: "Standard",
};

export default function ConsortiumOnboardingDashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const getToken = async () => {
    const currentUser = firebaseAuth?.currentUser;
    if (!currentUser) throw new Error("You must be signed in");
    return currentUser.getIdToken();
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/consortium/onboarding", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load members");
      setMembers(data.data || []);
    } catch (error) {
      console.error("Error loading onboarding members:", error);
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

      const matchesLevel = levelFilter === "all" || String(member.onboardedLevel) === levelFilter;
      const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [members, searchQuery, levelFilter, statusFilter]);

  const summary = useMemo(() => {
    const total = members.length;
    const complete = members.filter((m) => m.onboardingComplete).length;
    const inProgress = members.filter((m) => !m.onboardingComplete && m.onboardedLevel > 0).length;
    const notStarted = members.filter((m) => m.onboardedLevel === 0).length;
    return { total, complete, inProgress, notStarted };
  }, [members]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
  };

  const getInitials = (member: Member) => {
    const first = member.firstName?.[0] || "";
    const last = member.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "CM";
  };

  const getStageIcon = (status: StageProgress["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "skipped":
        return <ArrowRight className="h-4 w-4 text-slate-400" />;
      default:
        return <Circle className="h-4 w-4 text-slate-300" />;
    }
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
        <h1 className="text-3xl font-bold">Consortium Onboarding Tracker</h1>
        <p className="text-muted-foreground">
          Track all registered KDM Consortium members and their current onboarding completion step.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{summary.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fully Onboarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-3xl font-bold">{summary.complete}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold">{summary.inProgress}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-slate-400" />
              <span className="text-3xl font-bold">{summary.notStarted}</span>
            </div>
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
            <div className="w-full md:w-48">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="0">Not Started</SelectItem>
                  <SelectItem value="1">Discovery / Intake</SelectItem>
                  <SelectItem value="2">Account Created</SelectItem>
                  <SelectItem value="3">Profile Build</SelectItem>
                  <SelectItem value="4">Readiness Validation</SelectItem>
                  <SelectItem value="5">AI Matching Activation</SelectItem>
                  <SelectItem value="6">Active Engagement</SelectItem>
                  <SelectItem value="7">Fully Onboarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
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

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Member Onboarding Progress
          </CardTitle>
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
              {filteredMembers.map((member) => {
                const progress = Math.min(100, Math.round((member.onboardedLevel / 7) * 100));
                return (
                  <div
                    key={member.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{getInitials(member)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {member.firstName} {member.lastName}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={STATUS_BADGE[member.membershipStatus || "pending"]}>
                              {member.membershipStatus || "pending"}
                            </Badge>
                            {member.membershipTier && (
                              <Badge variant="secondary">{TIER_LABELS[member.membershipTier] || member.membershipTier}</Badge>
                            )}
                            {member.onboardingComplete && (
                              <Badge className="bg-green-100 text-green-800">Complete</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.email} · {member.company || "No company"}
                        </p>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Level {member.onboardedLevel}</span>
                            <span className="font-medium">{member.onboardedLevelLabel}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{progress}% complete</span>
                            {member.currentStageLabel && (
                              <span>Current stage: {member.currentStageLabel}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback>{getInitials(selectedMember)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {selectedMember.firstName} {selectedMember.lastName}
                    </CardTitle>
                    <CardDescription>
                      {selectedMember.email} · {selectedMember.company || "No company"}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedMember.membershipStatus || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tier</p>
                  <p className="font-medium capitalize">
                    {TIER_LABELS[selectedMember.membershipTier || ""] || selectedMember.membershipTier || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Engagement Score</p>
                  <p className="font-medium">{selectedMember.engagementScore ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profile Complete</p>
                  <p className="font-medium">
                    {selectedMember.profileCompleteness !== undefined
                      ? `${selectedMember.profileCompleteness}%`
                      : "—"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Onboarding Stages</h3>
                <div className="space-y-2">
                  {selectedMember.stageProgress.map((stage) => (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getStageIcon(stage.status)}
                        <div>
                          <p className="font-medium text-sm">{stage.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{stage.status.replace("_", " ")}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {stage.completedAt ? (
                          <span>Completed {new Date(stage.completedAt).toLocaleDateString()}</span>
                        ) : stage.startedAt ? (
                          <span>Started {new Date(stage.startedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Member since {formatDate(selectedMember.createdAt)}</p>
                <p>Last updated {formatDate(selectedMember.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
