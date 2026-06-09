"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  RefreshCw,
  Clock,
  Plus,
  Package,
  Wrench,
  Building2,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  COLLECTIONS,
  type ConsortiumMemberDoc,
  type MarketPlaceListingDoc,
  type MarketPlaceOrderDoc,
} from "@/lib/schema";
import { useUserProfile } from "@/contexts/user-profile-context";
import { cn } from "@/lib/utils";
import {
  PHASES,
  type PhaseId,
  deriveMemberPhase,
  deriveListingPhase,
  emptyPhaseMap,
  timeAgo,
  toDate,
  formatCurrency,
} from "@/lib/pipeline";

const PHASE_ORDER: PhaseId[] = PHASES.map((p) => p.id);

export default function MyPipelinePage() {
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [member, setMember] = useState<ConsortiumMemberDoc | null>(null);
  const [listings, setListings] = useState<MarketPlaceListingDoc[]>([]);
  const [orders, setOrders] = useState<MarketPlaceOrderDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!db || !profile.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const uid = auth?.currentUser?.uid;

      // The current member's own listings (they are the seller)
      const listingsPromise = getDocs(
        query(
          collection(db, COLLECTIONS.MARKETPLACE_LISTINGS),
          where("sellerId", "==", profile.id)
        )
      );

      // The current member's pending (abandoned) marketplace checkouts.
      // Orders store buyerId as the Firebase Auth UID (see checkout flow).
      const ordersPromise = uid
        ? getDocs(
            query(
              collection(db, COLLECTIONS.MARKETPLACE_ORDERS),
              where("buyerId", "==", uid),
              where("paymentStatus", "==", "pending")
            )
          )
        : Promise.resolve(null);

      // The current member's consortium record (for journey phase)
      const memberPromise = uid
        ? getDocs(
            query(
              collection(db, COLLECTIONS.CONSORTIUM_MEMBERS),
              where("firebaseUid", "==", uid)
            )
          )
        : Promise.resolve(null);

      const [listingSnap, orderSnap, memberSnap] = await Promise.all([
        listingsPromise,
        ordersPromise,
        memberPromise,
      ]);

      setListings(
        listingSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as MarketPlaceListingDoc)
        )
      );
      setOrders(
        orderSnap
          ? orderSnap.docs.map(
              (d) => ({ id: d.id, ...d.data() } as MarketPlaceOrderDoc)
            )
          : []
      );
      if (memberSnap && !memberSnap.empty) {
        const doc = memberSnap.docs[0];
        setMember({ id: doc.id, ...doc.data() } as ConsortiumMemberDoc);
      }
    } catch (error) {
      console.error("Error loading your pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileLoading) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile.id]);

  // Distribute the member's own listings across the phases
  const grouped = useMemo(() => {
    const map = emptyPhaseMap<MarketPlaceListingDoc>();
    for (const listing of listings) {
      map[deriveListingPhase(listing)].push(listing);
    }
    return map;
  }, [listings]);

  // The member's own current journey phase ("You are here")
  const currentPhase: PhaseId = useMemo(() => {
    if (member) return deriveMemberPhase(member);
    // Fallback inference from listings when no consortium record is found
    if (listings.some((l) => l.status === "published" && (l.inquiryCount ?? 0) > 0))
      return "engage_deliver";
    if (listings.some((l) => l.status === "published")) return "match_activate";
    if (listings.length > 0) return "build_profile";
    return "register";
  }, [member, listings]);

  const currentPhaseIndex = PHASE_ORDER.indexOf(currentPhase);

  const abandonedValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track your own listings across the platform process flow and recover
            any abandoned carts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/marketplace/create-listing/wizard">
              <Plus className="mr-2 h-4 w-4" />
              New Listing
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Journey stepper — "You are here" */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Your current stage in the platform process flow
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              const isComplete = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;
              return (
                <div key={phase.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      isCurrent
                        ? cn(phase.headerBg, phase.accent, "border-current")
                        : isComplete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-muted bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    <span>{phase.title}</span>
                  </div>
                  {idx < PHASES.length - 1 && (
                    <div className="h-px w-3 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{listings.length}</div>
            <p className="text-sm text-muted-foreground">Your Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-sm text-muted-foreground">Abandoned Carts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(abandonedValue)}
            </div>
            <p className="text-sm text-muted-foreground">Cart Value to Recover</p>
          </CardContent>
        </Card>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PHASES.map((phase) => {
          const cards = grouped[phase.id];
          const Icon = phase.icon;
          const isCurrent = phase.id === currentPhase;
          return (
            <div
              key={phase.id}
              className={cn(
                "flex w-[300px] shrink-0 flex-col rounded-lg border bg-muted/30",
                isCurrent && "ring-2 ring-offset-2 ring-primary/40"
              )}
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
                  <div className="flex items-center gap-1">
                    {isCurrent && (
                      <Badge variant="outline" className={cn("text-[10px]", phase.accent)}>
                        You
                      </Badge>
                    )}
                    <Badge variant="secondary" className={phase.badgeBg}>
                      {cards.length}
                    </Badge>
                  </div>
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
                    {isCurrent
                      ? "You're here — no listings in this stage yet"
                      : "No listings in this phase"}
                  </div>
                ) : (
                  cards.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
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
                {orders.length}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-snug">
              Your marketplace checkouts that were started but not completed.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-2 min-h-[200px]">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-8 text-center text-xs text-muted-foreground">
                No abandoned carts
              </div>
            ) : (
              orders.map((order) => (
                <AbandonedCartCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function listingTypeIcon(type: string) {
  switch (type) {
    case "product":
      return <Package className="h-3 w-3" />;
    case "service":
      return <Wrench className="h-3 w-3" />;
    default:
      return <Building2 className="h-3 w-3" />;
  }
}

function ListingCard({ listing }: { listing: MarketPlaceListingDoc }) {
  const updated = toDate(listing.updatedAt);
  return (
    <Link href={`/portal/marketplace/listings/${listing.id}`}>
      <Card className="border bg-background shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium">{listing.title}</p>
            <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
              <span className="mr-1">{listingTypeIcon(listing.listingType)}</span>
              {listing.listingType}
            </Badge>
          </div>
          {listing.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {listing.shortDescription}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span>{listing.viewCount ?? 0} views</span>
              <span>{listing.inquiryCount ?? 0} inquiries</span>
            </span>
            {updated && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(updated)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AbandonedCartCard({ order }: { order: MarketPlaceOrderDoc }) {
  const created = toDate(order.createdAt);
  const itemCount =
    order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) ?? 0;

  return (
    <Card className="border bg-background shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">
            {order.orderNumber || "Pending order"}
          </p>
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
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
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
