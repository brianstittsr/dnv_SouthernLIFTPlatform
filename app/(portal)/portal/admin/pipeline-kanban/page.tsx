"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Building2,
  Clock,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  COLLECTIONS,
  type ConsortiumMemberDoc,
  type MarketPlaceOrderDoc,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  PHASES,
  type PhaseId,
  deriveMemberPhase as derivePhase,
  emptyPhaseMap,
  getInitials,
  timeAgo,
  toDate,
  formatCurrency,
  TIER_LABELS,
} from "@/lib/pipeline";

/* ============================================================================
 * Page
 * ========================================================================== */

export default function PipelineKanbanPage() {
  const [members, setMembers] = useState<ConsortiumMemberDoc[]>([]);
  const [abandonedOrders, setAbandonedOrders] = useState<MarketPlaceOrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [memberSnap, orderSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.CONSORTIUM_MEMBERS)),
        getDocs(
          query(
            collection(db, COLLECTIONS.MARKETPLACE_ORDERS),
            where("paymentStatus", "==", "pending")
          )
        ),
      ]);

      setMembers(
        memberSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as ConsortiumMemberDoc)
        )
      );
      setAbandonedOrders(
        orderSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as MarketPlaceOrderDoc)
        )
      );
    } catch (error) {
      console.error("Error loading pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group members into phases, applying the search filter
  const grouped = useMemo(() => {
    const map = emptyPhaseMap<ConsortiumMemberDoc>();
    const term = search.trim().toLowerCase();
    for (const m of members) {
      if (term) {
        const haystack = `${m.firstName ?? ""} ${m.lastName ?? ""} ${
          m.company ?? ""
        } ${m.emailPrimary ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) continue;
      }
      map[derivePhase(m)].push(m);
    }
    return map;
  }, [members, search]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return abandonedOrders;
    return abandonedOrders.filter((o) =>
      `${o.buyerName ?? ""} ${o.buyerCompany ?? ""} ${o.buyerEmail ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [abandonedOrders, search]);

  const totalTracked = members.length;
  const abandonedValue = abandonedOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Track every organization across the End-to-End Platform Process Flow,
            plus abandoned marketplace checkouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
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
            <p className="text-sm text-muted-foreground">Organizations Tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {grouped.match_activate.length +
                grouped.engage_deliver.length +
                grouped.track_improve.length}
            </div>
            <p className="text-sm text-muted-foreground">Active / Matched</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{abandonedOrders.length}</div>
            <p className="text-sm text-muted-foreground">Abandoned Carts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(abandonedValue)}
            </div>
            <p className="text-sm text-muted-foreground">Cart Recovery Value</p>
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
                    No organizations in this phase
                  </div>
                ) : (
                  cards.map((m) => (
                    <MemberCard key={m.id} member={m} accent={phase.accent} />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Abandoned Carts column */}
        <div className="flex w-[300px] shrink-0 flex-col rounded-lg border-2 border-dashed border-rose-200 bg-rose-50/40">
          <div className="rounded-t-lg border-b border-rose-200 bg-rose-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-rose-700" />
                <h3 className="font-semibold text-rose-700">Abandoned Carts</h3>
              </div>
              <Badge variant="secondary" className="bg-rose-100 text-rose-800">
                {filteredOrders.length}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-snug">
              Marketplace checkouts started but not completed (pending payment).
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
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
                No abandoned carts
              </div>
            ) : (
              filteredOrders.map((order) => (
                <AbandonedCartCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Cards
 * ========================================================================== */

function MemberCard({
  member,
  accent,
}: {
  member: ConsortiumMemberDoc;
  accent: string;
}) {
  const name =
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
    member.company ||
    member.emailPrimary ||
    "Unknown";
  const updated = toDate(member.updatedAt);

  return (
    <Card className="border bg-background shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            {member.avatar ? (
              <AvatarImage src={member.avatar} alt={name} />
            ) : null}
            <AvatarFallback className="text-xs">
              {getInitials(member.firstName, member.lastName, member.company)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            {member.company && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                {member.company}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          {member.membershipTier && (
            <Badge variant="outline" className={cn("text-[10px]", accent)}>
              {TIER_LABELS[member.membershipTier] ?? member.membershipTier}
            </Badge>
          )}
          {member.membershipStatus && (
            <Badge variant="secondary" className="text-[10px] capitalize">
              {member.membershipStatus}
            </Badge>
          )}
          {typeof member.engagementScore === "number" && (
            <Badge variant="outline" className="text-[10px]">
              Engagement {member.engagementScore}
            </Badge>
          )}
        </div>

        {updated && (
          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Updated {timeAgo(updated)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AbandonedCartCard({ order }: { order: MarketPlaceOrderDoc }) {
  const created = toDate(order.createdAt);
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) ?? 0;
  const name = order.buyerName || order.buyerEmail || "Unknown buyer";

  return (
    <Card className="border bg-background shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {order.buyerCompany && (
              <p className="truncate text-xs text-muted-foreground">
                {order.buyerCompany}
              </p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold text-rose-700">
            {formatCurrency(order.totalAmount || 0, order.currency || "USD")}
          </span>
        </div>

        {order.items?.length > 0 && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {order.items[0].title}
            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
          {created && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(created)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
