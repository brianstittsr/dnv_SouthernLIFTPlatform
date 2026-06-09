"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/contexts/user-profile-context";
import { useCart } from "@/contexts/cart-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  MapPin,
  Shield,
  Building2,
  Star,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Globe,
  Award,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { MOCK_LISTINGS } from "./mock-listings";

const CAPABILITY_OPTIONS = [
  "CNC Machining",
  "Precision Manufacturing",
  "Assembly",
  "Cybersecurity",
  "Software Development",
  "Network Security",
  "Supply Chain",
  "Logistics",
  "Warehousing",
  "System Integration",
  "Defense Systems",
  "Engineering",
  "Aerospace",
  "Quality Control",
];

const CERTIFICATION_OPTIONS = [
  "ISO 9001",
  "CMMC Level 2",
  "CMMC Level 3",
  "ISO 27001",
  "8(a)",
  "SDVOSB",
  "HUBZone",
  "WOSB",
  "GSA Schedule",
];

const LOCATION_OPTIONS = [
  "Northeast",
  "Mid-Atlantic",
  "Southeast",
  "Midwest",
  "Southwest",
  "West",
  "National",
  "International",
];

export default function PartnerDirectoryPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minReadinessScore, setMinReadinessScore] = useState(0);
  const [sortBy, setSortBy] = useState("rating");
  const [useMockData, setUseMockData] = useState(true);

  const handleAddToCart = (listing: any) => {
    addItem({
      id: listing.id,
      type: listing.type,
      title: listing.title,
      price: listing.price,
      priceUnit: listing.priceUnit,
      seller: listing.seller,
      sellerId: listing.sellerId,
    });
  };

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability]
    );
  };

  const toggleCertification = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert)
        ? prev.filter((c) => c !== cert)
        : [...prev, cert]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const filteredListings = useMockData ? MOCK_LISTINGS.filter((listing) => {
    const matchesSearch =
      searchQuery === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.categories.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategories =
      selectedCapabilities.length === 0 ||
      selectedCapabilities.some((cap) => listing.categories.includes(cap));

    const matchesCertifications =
      selectedCertifications.length === 0 ||
      selectedCertifications.some((cert) => listing.certifications?.includes(cert));

    const matchesLocations =
      selectedLocations.length === 0 ||
      selectedLocations.some((loc) => listing.geographicServiceArea.includes(loc));

    return (
      matchesSearch &&
      matchesCategories &&
      matchesCertifications &&
      matchesLocations
    );
  }) : [];

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "reviews":
        return b.reviews - a.reviews;
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getReadinessColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getReadinessBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800">Strong</Badge>;
    if (score >= 70) return <Badge className="bg-amber-100 text-amber-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const clearFilters = () => {
    setSelectedCapabilities([]);
    setSelectedCertifications([]);
    setSelectedLocations([]);
    setMinReadinessScore(0);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Directory</h1>
          <p className="text-muted-foreground mt-1">
            Browse government contracting services, products, and subscriptions
          </p>
        </div>
        <Button onClick={() => router.push("/portal/marketplace/create-listing/wizard")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners by name, capability, or NAICS code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="mock-data-toggle" className="text-sm">Use Mock Data</Label>
              <Switch
                id="mock-data-toggle"
                checked={useMockData}
                onCheckedChange={setUseMockData}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showFilters && (
            <div className="mt-6 space-y-6 border-t pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Capabilities Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Capabilities</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {CAPABILITY_OPTIONS.map((capability) => (
                      <div key={capability} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cap-${capability}`}
                          checked={selectedCapabilities.includes(capability)}
                          onCheckedChange={() => toggleCapability(capability)}
                        />
                        <Label
                          htmlFor={`cap-${capability}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {capability}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Certifications</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {CERTIFICATION_OPTIONS.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${cert}`}
                          checked={selectedCertifications.includes(cert)}
                          onCheckedChange={() => toggleCertification(cert)}
                        />
                        <Label
                          htmlFor={`cert-${cert}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {cert}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Locations</Label>
                  <div className="space-y-2">
                    {LOCATION_OPTIONS.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={`loc-${location}`}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={() => toggleLocation(location)}
                        />
                        <Label
                          htmlFor={`loc-${location}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {location}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Readiness Score Filter */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Minimum Readiness Score: {minReadinessScore}+
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minReadinessScore}
                  onChange={(e) => setMinReadinessScore(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedListings.length} of {MOCK_LISTINGS.length} listings
        </p>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedListings.map((listing) => (
          <Link key={listing.id} href={`/portal/marketplace/listings/${listing.id}`} className="block">
            <Card className="overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-lg hover:border-primary h-full">
              {listing.featured && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1">
                  ⭐ Featured
                </div>
              )}
              
              {/* Product Image */}
              {listing.images && listing.images.length > 0 ? (
                <div className="aspect-video w-full overflow-hidden bg-muted relative group">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-start gap-2">
                  <Badge variant={listing.type === 'subscription' ? 'default' : listing.type === 'product' ? 'secondary' : 'outline'} className="capitalize">
                    {listing.type}
                  </Badge>
                  <div className="flex-1">
                    <CardTitle className="text-lg hover:text-primary transition-colors">{listing.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{listing.seller}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">{listing.shortDescription}</p>
                
                {/* Delivery Mode */}
                {listing.deliveryMode && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Delivery
                      </Badge>
                      <span className="text-sm font-semibold">{listing.deliveryMode}</span>
                    </div>
                    {listing.deliveryModeDescription && (
                      <p className="text-xs text-muted-foreground">{listing.deliveryModeDescription}</p>
                    )}
                  </div>
                )}
              
              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">${listing.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/{listing.priceUnit}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">{listing.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({listing.reviews} reviews)</span>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {listing.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {listing.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{listing.categories.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{listing.deliveryTimeline}</span>
              </div>

              {/* Certifications */}
              {listing.certifications && listing.certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {listing.certifications?.map((cert) => (
                      <Badge key={cert} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {/* View Details Link */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Click to view details
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Button className="w-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(listing); }}>
                Add to Cart
              </Button>
            </div>
          </Card>
        </Link>
        ))}
      </div>

      {sortedListings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find listings
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
