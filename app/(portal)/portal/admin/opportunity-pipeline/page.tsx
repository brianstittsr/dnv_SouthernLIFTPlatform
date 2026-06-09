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
  DollarSign,
  Users,
  Target,
  Briefcase,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  COLLECTIONS,
  type OpportunityDoc,
  type PursuitBriefDoc,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  PHASES,
  type PhaseId,
  deriveOpportunityPhase,
  derivePursuitPhase,
  emptyPhaseMap,
  getInitials,
  timeAgo,
  toDate,
  formatCurrency,
} from "@/lib/pipeline";

type OpportunityCard = {
  id: string;
  type: "individual" | "teaming";
  title: string;
  organization?: string;
  value: number;
  stage: string;
  status: string;
  expectedClose?: Date;
  dueDate?: Date;
  updatedAt?: Date;
  nextAction?: string;
  teamSize?: number;
  interestedCount?: number;
};

/* ============================================================================
 * Page
 * ========================================================================== */

export default function OpportunityPipelinePage() {
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [oppSnap, pursuitSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.OPPORTUNITIES)),
        getDocs(collection(db, COLLECTIONS.PURSUIT_BRIEFS)),
      ]);

      const cards: OpportunityCard[] = [];

      // Process individual opportunities
      oppSnap.docs.forEach((doc) => {
        const data = doc.data() as OpportunityDoc;
        cards.push({
          id: doc.id,
          type: "individual",
          title: data.name || "Unnamed Opportunity",
          organization: (data as any).organizationName || "",
          value: data.value || 0,
          stage: data.stage || "lead",
          status: data.stage || "lead",
          expectedClose: toDate(data.expectedCloseDate) || undefined,
          updatedAt: toDate(data.updatedAt) || undefined,
          nextAction: getNextActionForOpportunity(data),
        });
      });

      // Process teaming pursuits
      pursuitSnap.docs.forEach((doc) => {
        const data = doc.data() as PursuitBriefDoc;
        cards.push({
          id: doc.id,
          type: "teaming",
          title: data.title || "Unnamed Pursuit",
          organization: data.agency || "",
          value: data.estimatedValue || 0,
          stage: data.status || "published",
          status: data.status || "published",
          dueDate: toDate(data.dueDate) || undefined,
          updatedAt: toDate(data.updatedAt) || undefined,
          nextAction: getNextActionForPursuit(data),
          teamSize: data.teamMembers?.length || 0,
          interestedCount: data.interestedMembers?.length || 0,
        });
      });

      setOpportunities(cards);
    } catch (error) {
      console.error("Error loading opportunity pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group opportunities into phases, applying the search filter
  const grouped = useMemo(() => {
    const map = emptyPhaseMap<OpportunityCard>();
    const term = search.trim().toLowerCase();
    for (const opp of opportunities) {
      if (term) {
        const haystack = `${opp.title} ${opp.organization || ""}`.toLowerCase();
        if (!haystack.includes(term)) continue;
      }
      const phase =
        opp.type === "individual"
          ? deriveOpportunityPhase(opp as any)
          : derivePursuitPhase(opp as any);
      map[phase].push(opp);
    }
    return map;
  }, [opportunities, search]);

  const totalTracked = opportunities.length;
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const individualCount = opportunities.filter((o) => o.type === "individual").length;
  const teamingCount = opportunities.filter((o) => o.type === "teaming").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunity Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track individual opportunity pursuits and teaming opportunities across
            the End-to-End Platform Process Flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[240px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalTracked}</div>
            <p className="text-sm text-muted-foreground">Total Opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{individualCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Individual Pursuits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{teamingCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Teaming Opportunities</p>
          </CardContent>
        </Card>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PHASES.map((phase) => {
          const cards = grouped[phase.id];
          const Icon = phase.icon;
          return (
            <div
              key={phase.id}
              className="flex w-[300px] shrink-0 flex-col rounded-lg border bg-muted/30"
            >
              <div className={cn("rounded-t-lg border-b p-3", phase.headerBg)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                        phase.badgeBg
                      )}
                    >
                      {phase.number}
                    </span>
                    <Icon className={cn("h-4 w-4", phase.accent)} />
                    <h3 className={cn("font-semibold", phase.accent)}>
                      {phase.title}
                    </h3>
                  </div>
                  <Badge variant="secondary" className={phase.badgeBg}>
                    {cards.length}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-snug">
                  {phase.description}
                </p>
              </div>

              <div className="flex flex-col gap-2 p-2 min-h-[200px]">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-md bg-muted"
                      />
                    ))}
                  </div>
                ) : cards.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
                    No opportunities in this phase
                  </div>
                ) : (
                  cards.map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} accent={phase.accent} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * Cards
 * ========================================================================== */

function OpportunityCard({
  opp,
  accent,
}: {
  opp: OpportunityCard;
  accent: string;
}) {
  const isTeaming = opp.type === "teaming";
  const updated = opp.updatedAt;
  const dueDate = opp.dueDate || opp.expectedClose;

  return (
    <Card className="border bg-background shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isTeaming ? (
                <Users className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              ) : (
                <Target className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              )}
              <p className="truncate text-sm font-medium">{opp.title}</p>
            </div>
            {opp.organization && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                {opp.organization}
              </p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold text-emerald-700">
            {formatCurrency(opp.value)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          <Badge
            variant={isTeaming ? "default" : "outline"}
            className={cn(
              "text-[10px]",
              isTeaming ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : accent
            )}
          >
            {isTeaming ? "Teaming" : "Individual"}
          </Badge>
          <Badge variant="secondary" className="text-[10px] capitalize">
            {opp.status.replace(/-/g, " ")}
          </Badge>
          {isTeaming && opp.teamSize !== undefined && (
            <Badge variant="outline" className="text-[10px]">
              Team: {opp.teamSize}
            </Badge>
          )}
          {isTeaming && opp.interestedCount !== undefined && opp.interestedCount > 0 && (
            <Badge variant="outline" className="text-[10px]">
              Interested: {opp.interestedCount}
            </Badge>
          )}
        </div>

        {opp.nextAction && (
          <div className="mt-2 flex items-start gap-1.5">
            <Briefcase className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground line-clamp-2">
              {opp.nextAction}
            </p>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          {dueDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(dueDate)}
            </span>
          )}
          {updated && (
            <span className="flex items-center gap-1">
              Updated {timeAgo(updated)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================================
 * Next Action Helpers
 * ========================================================================== */

function getNextActionForOpportunity(opp: OpportunityDoc): string {
  const stage = opp.stage || "lead";
  switch (stage) {
    case "lead":
      return "Schedule discovery call";
    case "discovery":
      return "Qualify opportunity";
    case "proposal":
      return "Submit proposal";
    case "negotiation":
      return "Finalize terms";
    case "closed-won":
      return "Hand off to delivery";
    case "closed-lost":
      return "Review lessons learned";
    default:
      return "Review opportunity";
  }
}

function getNextActionForPursuit(pursuit: PursuitBriefDoc): string {
  const status = pursuit.status || "published";
  switch (status) {
    case "published":
      return "Review opportunity details";
    case "team-forming":
      return "Recruit team members";
    case "proposal-active":
      return "Develop proposal";
    case "submitted":
      return "Await award decision";
    case "won":
      return "Kick off project";
    case "lost":
      return "Review debrief";
    case "archived":
      return "Archive complete";
    default:
      return "Review pursuit";
  }
}
