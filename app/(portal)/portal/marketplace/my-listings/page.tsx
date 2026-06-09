"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Eye,
  Archive,
  BarChart3,
  Package,
  Wrench,
  Building2,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceListingDoc } from "@/lib/schema";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { MarketplaceListingForm } from "@/components/marketplace/marketplace-listing-form";

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketPlaceListingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<MarketPlaceListingDoc | null>(null);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchMyListings(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe?.();
  }, []);

  const fetchMyListings = async (userId: string) => {
    if (!db) return;

    setLoading(true);
    try {
      // Find the team member doc for this user
      const teamMemberQuery = query(
        collection(db, COLLECTIONS.TEAM_MEMBERS),
        where("firebaseUid", "==", userId)
      );
      const teamMemberSnap = await getDocs(teamMemberQuery);

      if (teamMemberSnap.empty) {
        setListings([]);
        return;
      }

      const teamMemberId = teamMemberSnap.docs[0].id;

      // Fetch listings for this team member
      const listingsQuery = query(
        collection(db, COLLECTIONS.MARKETPLACE_LISTINGS),
        where("sellerId", "==", teamMemberId),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(listingsQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MarketPlaceListingDoc[];

      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "service":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const publishedCount = listings.filter((l) => l.status === "published").length;
  const draftCount = listings.filter((l) => l.status === "draft").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.viewCount || 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiryCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-sm text-muted-foreground">Published Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalInquiries}</div>
            <p className="text-sm text-muted-foreground">Inquiries Received</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button onClick={() => router.push("/portal/marketplace/create-listing/wizard")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Listing
        </Button>
        <Button variant="outline" asChild>
          <Link href="/portal/marketplace/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
      </div>

      {/* Listings Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedCount})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts ({draftCount})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({listings.filter((l) => l.status === "archived").length})
          </TabsTrigger>
        </TabsList>

        {["all", "published", "draft", "archived"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <Card>
                <CardContent className="flex h-64 items-center justify-center">
                  <div className="text-muted-foreground">Loading your listings...</div>
                </CardContent>
              </Card>
            ) : listings.filter((l) => tab === "all" || l.status === tab).length === 0 ? (
              <Card>
                <CardContent className="flex h-64 flex-col items-center justify-center p-6">
                  <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No listings found</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    {tab === "draft"
                      ? "You don't have any draft listings. Start creating one!"
                      : tab === "archived"
                      ? "No archived listings yet."
                      : "Get started by creating your first marketplace listing."}
                  </p>
                  {tab !== "archived" && (
                    <Button className="mt-4" onClick={() => router.push("/portal/marketplace/create-listing/wizard")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Listing
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {listings
                  .filter((l) => tab === "all" || l.status === tab)
                  .map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {/* Image Placeholder */}
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                              {listing.images?.[0] ? (
                                <img
                                  src={listing.images[0]}
                                  alt={listing.title}
                                  className="h-full w-full rounded-lg object-cover"
                                />
                              ) : (
                                getListingTypeIcon(listing.listingType)
                              )}
                            </div>

                            {/* Info */}
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                {getStatusBadge(listing.status)}
                                <Badge variant="outline" className="text-xs">
                                  {getListingTypeIcon(listing.listingType)}
                                  <span className="ml-1 capitalize">{listing.listingType}</span>
                                </Badge>
                              </div>
                              <h3 className="font-semibold">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {listing.shortDescription}
                              </p>
                              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                <span>{listing.viewCount} views</span>
                                <span>{listing.inquiryCount} inquiries</span>
                                <span>Visibility: {listing.visibility}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/portal/marketplace/listings/${listing.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingListing(listing); setFormOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {listing.status !== "archived" && (
                              <Button variant="ghost" size="sm">
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Marketplace Listing Form Dialog */}
      <MarketplaceListingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          if (currentUserId) fetchMyListings(currentUserId);
        }}
        editingListing={editingListing}
      />
    </div>
  );
}
