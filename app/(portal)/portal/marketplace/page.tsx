"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Building2, Package, Wrench, MapPin, Star, TrendingUp, ArrowRight, Percent, Sparkles, Shield, Zap } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceListingDoc } from "@/lib/schema";
import Link from "next/link";

const CATEGORIES = [
  { 
    name: "CMMC & Compliance", 
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop",
    description: "Certification & assessment services"
  },
  { 
    name: "Manufacturing", 
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop",
    description: "CNC, fabrication & production"
  },
  { 
    name: "IT & Cybersecurity", 
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&h=300&fit=crop",
    description: "Security & technology solutions"
  },
  { 
    name: "Engineering Services", 
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop",
    description: "Design, analysis & consulting"
  },
  { 
    name: "Consulting", 
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop",
    description: "Business & procurement advisory"
  },
  { 
    name: "Logistics", 
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=300&fit=crop",
    description: "Supply chain & transportation"
  },
];

const VISIBILITY_FILTERS = [
  { value: "all", label: "All Listings" },
  { value: "public", label: "Public" },
  { value: "consortium-only", label: "Consortium Only" },
  { value: "oem-only", label: "OEM Only" },
];

// Mock featured deals for advertisements
const FEATURED_DEALS = [
  {
    id: "1",
    title: "CMMC Level 2 Assessment",
    originalPrice: 15000,
    salePrice: 12000,
    discount: 20,
    seller: "KDM & Associates",
    badge: "Limited Time",
    badgeColor: "bg-red-500",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "AI Bid Analysis Tool",
    originalPrice: 599,
    salePrice: 499,
    discount: 17,
    seller: "KDM Platform",
    badge: "Best Seller",
    badgeColor: "bg-amber-500",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Consortium Membership",
    originalPrice: 1250,
    salePrice: 650,
    discount: 48,
    seller: "KDM Consortium",
    badge: "Promo",
    badgeColor: "bg-green-500",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
  },
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
    <div className="space-y-8">
      {/* Hero Banner - Amazon-style advertisement with image */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop"
            alt="Featured Deal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/80" />
        </div>
        <CardContent className="relative p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <Badge className="mb-2 bg-white text-blue-600">Featured Deal</Badge>
              <h1 className="text-3xl font-bold mb-2">CMMC Level 2 Assessment</h1>
              <p className="text-blue-100 mb-4">
                Complete CMMC Level 2 assessment preparation and certification for DoD contractors
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$12,000</span>
                  <span className="text-blue-200 line-through">$15,000</span>
                </div>
                <Badge className="bg-red-500">20% OFF</Badge>
              </div>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                View Deal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-6xl font-bold">20%</div>
              <div className="text-blue-100">OFF</div>
              <div className="text-sm text-blue-200 mt-2">Limited Time Offer</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Quick Links with Images */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <Link key={category.name} href={`/portal/marketplace/directory?category=${category.name}`}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 overflow-hidden group">
                {/* Category Image */}
                <div className="aspect-square w-full overflow-hidden bg-muted relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-semibold text-sm">{category.name}</p>
                    <p className="text-xs text-white/80">{category.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Deals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Today's Deals</h2>
          <Link href="/portal/marketplace/directory?sort=deals" className="text-sm text-primary hover:underline">
            See all deals <ArrowRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURED_DEALS.map((deal) => (
            <Card key={deal.id} className="cursor-pointer transition-all hover:shadow-lg border-2 border-red-200 overflow-hidden">
              {/* Deal Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={deal.badgeColor}>{deal.badge}</Badge>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <Percent className="h-3 w-3 mr-1" />
                    {deal.discount}% OFF
                  </Badge>
                </div>
                <CardTitle className="text-lg">{deal.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{deal.seller}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-red-600">${deal.salePrice.toLocaleString()}</span>
                  <span className="text-muted-foreground line-through">${deal.originalPrice.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filteredListings.map((listing) => (
            <Link key={listing.id} href={`/portal/marketplace/listings/${listing.id}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105 overflow-hidden">
                {/* Product Image */}
                {listing.images && listing.images.length > 0 ? (
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                
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
                    {listing.categories.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {listing.categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{listing.categories.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.geographicServiceArea?.[0] || "Nationwide"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {listing.inquiryCount} inquiries
                    </div>
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
