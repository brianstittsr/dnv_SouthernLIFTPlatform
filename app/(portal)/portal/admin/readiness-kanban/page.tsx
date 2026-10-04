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
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type TeamMemberDoc } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { getInitials, timeAgo, toDate } from "@/lib/pipeline";
import {
  READINESS_BUCKETS,
  STAGE_COLUMNS,
  READINESS_CONTRACT_READY_THRESHOLD,
  bucketForScore,
  deriveReadinessStage,
  hasCompanyIntelligence,
  type KanbanStage,
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

export default function ReadinessKanbanPage() {
  const [members, setMembers] = useState<TeamMemberDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("score");

  const fetchData = async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.TEAM_MEMBERS));
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMemberDoc)));
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
        const score = m.govReadinessScore?.overallScore ?? 0;
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
      cols.find((c) => c.id === deriveReadinessStage(m))?.members.push(m);
    }
    return cols;
  }, [filtered, view]);

  const scored = members.filter((m) => m.govReadinessScore);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, m) => s + (m.govReadinessScore?.overallScore ?? 0), 0) / scored.length)
    : 0;
  const contractReady = scored.filter((m) => (m.govReadinessScore?.overallScore ?? 0) >= READINESS_CONTRACT_READY_THRESHOLD).length;
  const missingCi = members.filter((m) => !hasCompanyIntelligence(m.companyIntelligence)).length;
  const reminded = members.filter((m) => m.lastReadinessReminderSentAt).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Readiness Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Government-contracting readiness for all team members. Run the readiness scan on the
            Team Members page to refresh scores.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold">{members.length}</div>
          <p className="text-sm text-muted-foreground">Members Tracked</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold">{scored.length}</div>
          <p className="text-sm text-muted-foreground">Scored</p>
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
                col.members.map((m) => <ReadinessCard key={m.id} member={m} accent={col.accent} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReadinessCard({ member, accent }: { member: TeamMemberDoc; accent: string }) {
  const name = `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || member.emailPrimary || "Unknown";
  const score = member.govReadinessScore?.overallScore;
  const topGap = member.govReadinessScore?.gaps?.[0];
  const scannedAt = toDate(member.govReadinessLastScannedAt);
  const hasCi = hasCompanyIntelligence(member.companyIntelligence);

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
          {typeof score === "number" && (
            <span className={cn("shrink-0 text-sm font-bold", accent)}>{score}</span>
          )}
        </div>

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
          <p className="mt-1 text-[10px] text-muted-foreground">Not scanned yet</p>
        )}
      </CardContent>
    </Card>
  );
}
