"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  RefreshCw,
  Building2,
  Clock,
  ShieldCheck,
  MailWarning,
  BarChart3,
  ListTodo,
  UserX,
  Radar,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { getInitials, timeAgo, toDate } from "@/lib/pipeline";
import { ReadinessScanDialog } from "@/components/admin/readiness-scan-dialog";
import {
  READINESS_BUCKETS,
  STAGE_COLUMNS,
  READINESS_CONTRACT_READY_THRESHOLD,
  bucketForScore,
  bucketLabel,
  deriveReadinessStage,
  computeMemberReadiness,
  resolveMemberCi,
  hasCompanyIntelligence,
  type CompanyIntelligence,
  type KanbanStage,
  type StageSource,
} from "@/lib/member-readiness";

type ViewMode = "score" | "stage";

interface Column {
  id: string;
  label: string;
  description: string;
  headerBg: string;
  accent: string;
  badgeBg: string;
  members: TeamMemberDoc[];
}

const STAGE_META: Record<KanbanStage, { description: string; headerBg: string; accent: string; badgeBg: string }> = {
  profile: { description: "No Company Intelligence on file yet.", headerBg: "bg-slate-50", accent: "text-slate-700", badgeBg: "bg-slate-100 text-slate-800" },
  readiness: { description: "Company Intelligence submitted; readiness under review.", headerBg: "bg-amber-50", accent: "text-amber-700", badgeBg: "bg-amber-100 text-amber-800" },
  categorization: { description: "Readiness validated; awaiting tier/pillar categorization.", headerBg: "bg-blue-50", accent: "text-blue-700", badgeBg: "bg-blue-100 text-blue-800" },
  active: { description: "AI matching activated — receiving opportunities.", headerBg: "bg-indigo-50", accent: "text-indigo-700", badgeBg: "bg-indigo-100 text-indigo-800" },
  complete: { description: "Onboarding complete and validated.", headerBg: "bg-green-50", accent: "text-green-700", badgeBg: "bg-green-100 text-green-800" },
};

type LinkedMember = StageSource & { emailPrimary?: string };

interface PortalUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  svpRole?: string;
  onboardingComplete?: boolean;
  consortiumOnboardingComplete?: boolean;
  companyIntelligence?: CompanyIntelligence;
}

export default function ReadinessKanbanPage() {
  const [members, setMembers] = useState<TeamMemberDoc[]>([]);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [consortiumDocs, setConsortiumDocs] = useState<LinkedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("score");
  const [scanOpen, setScanOpen] = useState(false);

  const fetchData = async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [snap, userSnap, consortiumSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.TEAM_MEMBERS)),
        getDocs(collection(db, COLLECTIONS.USERS)),
        getDocs(collection(db, COLLECTIONS.CONSORTIUM_MEMBERS)),
      ]);
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMemberDoc)));
      setPortalUsers(userSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PortalUser, "id">) })));
      setConsortiumDocs(
        consortiumSnap.docs.map((d) => ({ ...(d.data() as LinkedMember) }))
      );
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((m) =>
      `${m.firstName ?? ""} ${m.lastName ?? ""} ${m.company ?? ""} ${m.emailPrimary ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [members, search]);

  // Email-join maps: consortium members and portal users carry the Company
  // Intelligence that the readiness model scores.
  const consortiumByEmail = useMemo(() => {
    const map = new Map<string, LinkedMember>();
    for (const c of consortiumDocs) {
      const email = c.emailPrimary?.trim().toLowerCase();
      if (email) map.set(email, c);
    }
    return map;
  }, [consortiumDocs]);

  const userCiByEmail = useMemo(() => {
    const map = new Map<string, CompanyIntelligence>();
    for (const u of portalUsers) {
      const email = u.email?.trim().toLowerCase();
      if (email && u.companyIntelligence) map.set(email, u.companyIntelligence);
    }
    return map;
  }, [portalUsers]);

  const linkedFor = (m: TeamMemberDoc): LinkedMember | undefined => {
    const email = m.emailPrimary?.trim().toLowerCase();
    return email ? consortiumByEmail.get(email) : undefined;
  };

  // Persisted govReadinessScore wins when the server-side scan has run;
  // otherwise compute on the fly so the board is never empty.
  const memberScores = useMemo(() => {
    const map = new Map<string, { score: number; topGap?: string; scanned: boolean }>();
    for (const m of members) {
      if (m.govReadinessScore) {
        map.set(m.id, {
          score: m.govReadinessScore.overallScore,
          topGap: m.govReadinessScore.gaps?.[0],
          scanned: true,
        });
        continue;
      }
      const email = m.emailPrimary?.trim().toLowerCase();
      const r = computeMemberReadiness(
        m,
        email ? consortiumByEmail.get(email)?.companyIntelligence : undefined,
        email ? userCiByEmail.get(email) : undefined
      );
      map.set(m.id, { score: r.overallScore, topGap: r.gaps[0], scanned: false });
    }
    return map;
  }, [members, consortiumByEmail, userCiByEmail]);

  const hasEffectiveCi = (m: TeamMemberDoc): boolean => {
    const linked = linkedFor(m);
    const email = m.emailPrimary?.trim().toLowerCase();
    return hasCompanyIntelligence(
      resolveMemberCi(m, linked?.companyIntelligence, email ? userCiByEmail.get(email) : undefined)
    );
  };

  const columns = useMemo<Column[]>(() => {
    if (view === "score") {
      const ranges: Record<string, string> = {
        critical: "Score 0–39 — major registration gaps",
        needs_improvement: "Score 40–59 — not yet contract-ready",
        adequate: "Score 60–74 — baseline contract-ready",
        good: "Score 75–89 — strong readiness",
        excellent: "Score 90–100 — fully ready",
      };
      const cols: Column[] = READINESS_BUCKETS.map((b) => ({
        id: b.id,
        label: b.label,
        description: ranges[b.id],
        headerBg: b.headerBg,
        accent: b.accent,
        badgeBg: b.badgeBg,
        members: [],
      }));
      for (const m of filtered) {
        const score = memberScores.get(m.id)?.score ?? 0;
        cols.find((c) => c.id === bucketForScore(score))?.members.push(m);
      }
      return cols;
    }
    const cols: Column[] = STAGE_COLUMNS.map((s) => ({
      id: s.id,
      label: s.label,
      description: STAGE_META[s.id].description,
      headerBg: STAGE_META[s.id].headerBg,
      accent: STAGE_META[s.id].accent,
      badgeBg: STAGE_META[s.id].badgeBg,
      members: [],
    }));
    for (const m of filtered) {
      cols.find((c) => c.id === deriveReadinessStage(m, linkedFor(m)))?.members.push(m);
    }
    return cols;
  }, [filtered, view, memberScores, consortiumByEmail]);

  // Portal users who haven't completed onboarding: either no teamMembers
  // record exists for them, or neither side carries the completion flag.
  const notOnboarded = useMemo(() => {
    const memberEmails = new Set(
      members.map((m) => m.emailPrimary?.trim().toLowerCase()).filter(Boolean) as string[]
    );
    const memberByEmail = new Map(
      members
        .filter((m) => m.emailPrimary)
        .map((m) => [m.emailPrimary!.trim().toLowerCase(), m])
    );
    const memberIds = new Set(members.map((m) => m.id));

    return portalUsers
      .map((u) => {
        const email = u.email?.trim().toLowerCase();
        const member = (email && memberByEmail.get(email)) || (memberIds.has(u.id) ? members.find((m) => m.id === u.id) : undefined);
        const memberExists = !!member || (email ? memberEmails.has(email) : false) || memberIds.has(u.id);
        const done = !!(
          u.consortiumOnboardingComplete ||
          u.onboardingComplete ||
          member?.consortiumOnboardingComplete ||
          member?.onboardingComplete
        );
        return { user: u, memberExists, done };
      })
      .filter((x) => !x.done);
  }, [portalUsers, members]);

  const scannedCount = members.filter((m) => m.govReadinessScore).length;
  const avgScore = members.length
    ? Math.round(members.reduce((s, m) => s + (memberScores.get(m.id)?.score ?? 0), 0) / members.length)
    : 0;
  const contractReady = members.filter((m) => (memberScores.get(m.id)?.score ?? 0) >= READINESS_CONTRACT_READY_THRESHOLD).length;
  const missingCi = members.filter((m) => !hasEffectiveCi(m)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Readiness Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Government-contracting readiness for all team members. Scores are computed live;
            run a scan to persist them and email reminders.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setScanOpen(true)}>
            <Radar className="h-4 w-4 mr-2" />
            Scan Readiness
          </Button>
          <div className="inline-flex rounded-lg border p-1 bg-muted/50">
            <Button
              variant={view === "score" ? "default" : "ghost"}
              size="sm"
              className="gap-1"
              onClick={() => setView("score")}
            >
              <BarChart3 className="h-4 w-4" /> Score
            </Button>
            <Button
              variant={view === "stage" ? "default" : "ghost"}
              size="sm"
              className="gap-1"
              onClick={() => setView("stage")}
            >
              <ListTodo className="h-4 w-4" /> Stage
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[220px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold">{members.length}</div>
          <p className="text-sm text-muted-foreground">Members Tracked</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold">{scannedCount}</div>
          <p className="text-sm text-muted-foreground">Scan-Persisted</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold">{avgScore}</div>
          <p className="text-sm text-muted-foreground">Avg Score /100</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold text-green-700">{contractReady}</div>
          <p className="text-sm text-muted-foreground">Contract-Ready (≥{READINESS_CONTRACT_READY_THRESHOLD})</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold text-amber-700">{missingCi}</div>
          <p className="text-sm text-muted-foreground">Missing Company Intel</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold text-red-700">{notOnboarded.length}</div>
          <p className="text-sm text-muted-foreground">Not Onboarded</p>
        </CardContent></Card>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex w-[300px] shrink-0 flex-col rounded-lg border bg-muted/30">
            <div className={cn("rounded-t-lg border-b p-3", col.headerBg)}>
              <div className="flex items-center justify-between">
                <h3 className={cn("font-semibold text-sm", col.accent)}>{col.label}</h3>
                <Badge variant="secondary" className={col.badgeBg}>{col.members.length}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-snug">{col.description}</p>
            </div>
            <div className="flex flex-col gap-2 p-2 min-h-[200px]">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-md bg-muted" />)}
                </div>
              ) : col.members.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
                  No members here
                </div>
              ) : (
                col.members.map((m) => (
                  <ReadinessCard
                    key={m.id}
                    member={m}
                    accent={col.accent}
                    scoreInfo={memberScores.get(m.id)}
                    hasCi={hasEffectiveCi(m)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Portal users who haven't finished onboarding */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserX className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold">Portal Users Without Completed Onboarding</h3>
            <Badge variant="secondary">{notOnboarded.length}</Badge>
          </div>
          {notOnboarded.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every portal user has completed onboarding.
            </p>
          ) : (
            <div className="divide-y rounded-md border">
              {notOnboarded
                .filter(({ user }) => {
                  const term = search.trim().toLowerCase();
                  if (!term) return true;
                  return `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.email ?? ""}`
                    .toLowerCase()
                    .includes(term);
                })
                .map(({ user, memberExists }) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || user.id}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(user.role || user.svpRole) && (
                        <Badge variant="outline" className="text-xs">
                          {user.role || user.svpRole}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className={memberExists ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}
                      >
                        {memberExists ? "Onboarding incomplete" : "No team member record"}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReadinessScanDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onScanComplete={fetchData}
      />
    </div>
  );
}

function ReadinessCard({
  member,
  accent,
  scoreInfo,
  hasCi,
}: {
  member: TeamMemberDoc;
  accent: string;
  scoreInfo?: { score: number; topGap?: string; scanned: boolean };
  hasCi: boolean;
}) {
  const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.emailPrimary || "Unknown";
  const score = scoreInfo?.score;
  const topGap = scoreInfo?.topGap;
  const scannedAt = toDate(member.govReadinessLastScannedAt);
  const bucket = READINESS_BUCKETS.find((b) => b.id === bucketForScore(score ?? 0));

  return (
    <Card className="border bg-background shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            {member.avatar ? <AvatarImage src={member.avatar} alt={name} /> : null}
            <AvatarFallback className="text-xs">
              {getInitials(member.firstName, member.lastName, member.company)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            {member.company && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />{member.company}
              </p>
            )}
          </div>
          {typeof score === "number" && bucket && (
            <div className={cn("shrink-0 rounded-md px-2 py-1 text-center", bucket.badgeBg)} title={bucket.label}>
              <div className="text-base font-bold leading-none">{score}</div>
              <div className="text-[9px] leading-tight">/100</div>
            </div>
          )}
        </div>

        {typeof score === "number" && (
          <div className="mt-2">
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  score >= 90 ? "bg-green-500" : score >= 75 ? "bg-blue-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className={cn("mt-1 text-[10px] font-medium", bucket?.accent)}>{bucketLabel(score)}</p>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1">
          {!hasCi && <Badge variant="secondary" className="text-[10px]">No Company Intel</Badge>}
          {member.readinessValidationStatus === "approved" && (
            <Badge variant="outline" className="text-[10px] gap-1"><ShieldCheck className="h-3 w-3" />Validated</Badge>
          )}
          {member.lastReadinessReminderSentAt && (
            <Badge variant="outline" className="text-[10px] gap-1"><MailWarning className="h-3 w-3" />Reminded</Badge>
          )}
        </div>

        {topGap && <p className="mt-2 truncate text-xs text-muted-foreground">Gap: {topGap}</p>}
        {scannedAt ? (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />Scanned {timeAgo(scannedAt)}
          </p>
        ) : (
          <p className="mt-1 text-[10px] text-muted-foreground">Live score — not persisted</p>
        )}
      </CardContent>
    </Card>
  );
}
