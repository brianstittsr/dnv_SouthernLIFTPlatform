"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Building2, Package, Wrench, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceListingDoc } from "@/lib/schema";
import Link from "next/link";

const CATEGORIES = [
  "All Categories",
  "CNC Machining",
  "Metal Fabrication",
  "Plastic & Injection Molding",
  "Electronics Manufacturing",
  "Automotive Parts",
  "Aerospace Components",
  "Medical Devices",
  "Packaging",
  "Casting & Foundry",
  "Contract Assembly",
  "Engineering Services",
  "Logistics & Supply Chain",
  "IT & Cybersecurity",
  "Consulting",
];

const VISIBILITY_FILTERS = [
  { value: "all", label: "All Listings" },
  { value: "public", label: "Public" },
  { value: "consortium-only", label: "Consortium Only" },
  { value: "oem-only", label: "OEM Only" },
];

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<MarketPlaceListingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [listingType, setListingType] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    if (!db) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, COLLECTIONS.MARKETPLACE_LISTINGS),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MarketPlaceListingDoc[];
      
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.sellerCompanyName.toLowerCase().includes(query) ||
        listing.categories.some((c) => c.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      if (!listing.categories.includes(selectedCategory)) return false;
    }

    // Type filter
    if (listingType !== "all" && listing.listingType !== listingType) return false;

    // Visibility filter
    if (visibilityFilter !== "all" && listing.visibility !== visibilityFilter) return false;

    return true;
  });

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

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Badge variant="secondary">Public</Badge>;
      case "consortium-only":
        return <Badge className="bg-blue-100 text-blue-800">Consortium</Badge>;
      case "oem-only":
        return <Badge className="bg-amber-100 text-amber-800">OEM Only</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings, companies, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_FILTERS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={listingType} onValueChange={setListingType} className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All Types</TabsTrigger>
              <TabsTrigger value="product">Products</TabsTrigger>
              <TabsTrigger value="service">Services</TabsTrigger>
              <TabsTrigger value="capability">Capabilities</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading listings...</div>
        </div>
      ) : filteredListings.length === 0 ? (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center p-6">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No listings found</h3>
            <p className="text-center text-sm text-muted-foreground">
              Try adjusting your search or filters, or check back later for new listings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/portal/marketplace/listings/${listing.id}`}>
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getListingTypeIcon(listing.listingType)}
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {listing.listingType}
                      </span>
                    </div>
                    {getVisibilityBadge(listing.visibility)}
                  </div>

                  {/* Title & Company */}
                  <h3 className="mb-1 font-semibold line-clamp-2">{listing.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{listing.sellerCompanyName}</p>

                  {/* Description */}
                  <p className="mb-3 line-clamp-2 text-sm">{listing.shortDescription}</p>

                  {/* Categories */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {listing.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {listing.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{listing.categories.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.geographicServiceArea?.[0] || "Nationwide"}
                    </div>
                    <div>{listing.inquiryCount} inquiries</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
