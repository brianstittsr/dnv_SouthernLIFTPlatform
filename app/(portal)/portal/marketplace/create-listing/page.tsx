"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Upload,
  X,
  Plus,
  FileText,
  Shield,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const LISTING_TYPES = [
  { value: "capability", label: "Capability" },
  { value: "service", label: "Service" },
  { value: "product", label: "Product" },
] as const;

const SERVICE_TYPES = [
  "consulting",
  "manufacturing",
  "logistics",
  "engineering",
  "other",
] as const;

const VISIBILITY_OPTIONS = [
  { value: "consortium-only", label: "Consortium Only", description: "Visible only to vetted consortium members" },
  { value: "public", label: "Public", description: "Visible to all platform users" },
] as const;

export default function CreateMarketplaceListingPage() {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  
  const [formData, setFormData] = useState({
    listingType: "capability" as "capability" | "service" | "product",
    title: "",
    description: "",
    shortDescription: "",
    categories: [] as string[],
    naicsCodes: [] as string[],
    certifications: [] as string[],
    serviceType: "" as string,
    deliveryTimeline: "",
    unitOfMeasure: "",
    sku: "",
    minimumContractSize: "",
    geographicServiceArea: [] as string[],
    visibility: "consortium-only" as "consortium-only" | "public",
    engagementTerms: "",
    images: [] as string[],
    documents: [] as Array<{ name: string; url: string }>,
  });

  const [tempInput, setTempInput] = useState("");

  // Consolidated: this route now redirects to the canonical listing wizard
  useEffect(() => {
    router.replace("/portal/marketplace/create-listing/wizard");
  }, [router]);

  const toggleArrayItem = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter((i) => i !== value) : [...current, value],
      };
    });
  };

  const addArrayItem = (field: keyof typeof formData, value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()],
    }));
    setTempInput("");
  };

  const removeArrayItem = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((i) => i !== value),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.shortDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // In production, save to Firestore
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Listing created successfully!");
      router.push("/portal/marketplace");
    } catch (error) {
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirecting to the canonical wizard; render nothing meaningful here
  return (
    <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
      Redirecting to the listing wizard...
    </div>
  );

  // eslint-disable-next-line no-unreachable
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Marketplace Listing</h1>
          <p className="text-muted-foreground mt-1">
            Publish your capabilities and services to the KDM Consortium marketplace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="mock-data-toggle" className="text-sm">Use Mock Data</Label>
          <Switch
            id="mock-data-toggle"
            checked={useMockData}
            onCheckedChange={setUseMockData}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="space-y-6 max-w-4xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the core details about your listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="listingType">Listing Type *</Label>
                <Select
                  value={formData.listingType}
                  onValueChange={(value) => setFormData({ ...formData, listingType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced CNC Machining Services"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description * (150 characters)</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  maxLength={150}
                  placeholder="Brief description for listing cards"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.shortDescription.length}/150 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your capability or service..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card>
            <CardHeader>
              <CardTitle>Categorization</CardTitle>
              <CardDescription>
                Help others find your listing through categories and codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., CNC Machining, Defense, Aerospace"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("categories", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("categories", tempInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-sm">
                        {cat}
                        <button
                          onClick={() => removeArrayItem("categories", cat)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>NAICS Codes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 332710"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("naicsCodes", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("naicsCodes", tempInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.naicsCodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.naicsCodes.map((code) => (
                      <Badge key={code} variant="outline" className="text-sm">
                        {code}
                        <button
                          onClick={() => removeArrayItem("naicsCodes", code)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., ISO 9001, CMMC Level 2"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("certifications", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("certifications", tempInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-sm">
                        <Shield className="h-3 w-3 mr-1" />
                        {cert}
                        <button
                          onClick={() => removeArrayItem("certifications", cert)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service/Product Details */}
          {formData.listingType === "service" && (
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Specific information about your service offering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
                  <Input
                    id="deliveryTimeline"
                    value={formData.deliveryTimeline}
                    onChange={(e) => setFormData({ ...formData, deliveryTimeline: e.target.value })}
                    placeholder="e.g., 2-4 weeks, Custom quote"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {formData.listingType === "product" && (
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Specific information about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ""}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Product SKU"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Input
                    id="unitOfMeasure"
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    placeholder="e.g., each, lot, hour, project"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Geographic & Contract Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic & Contract Preferences</CardTitle>
              <CardDescription>
                Define where you can serve and contract requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Geographic Service Area</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="States or regions (e.g., VA, MD, DC, Northeast)"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("geographicServiceArea", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("geographicServiceArea", tempInput)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.geographicServiceArea.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.geographicServiceArea.map((area) => (
                      <Badge key={area} variant="outline" className="text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {area}
                        <button
                          onClick={() => removeArrayItem("geographicServiceArea", area)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumContractSize">Minimum Contract Size ($)</Label>
                <Input
                  id="minimumContractSize"
                  type="number"
                  value={formData.minimumContractSize}
                  onChange={(e) => setFormData({ ...formData, minimumContractSize: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visibility & Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility & Engagement</CardTitle>
              <CardDescription>
                Control who can see your listing and engagement terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Visibility</Label>
                {VISIBILITY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.visibility === option.value
                        ? "border-amber-500 bg-amber-50"
                        : "border-border hover:bg-muted"
                    }`}
                    onClick={() => setFormData({ ...formData, visibility: option.value as any })}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {formData.visibility === option.value ? (
                          <CheckCircle className="h-5 w-5 text-amber-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="engagementTerms">Engagement Terms</Label>
                <Textarea
                  id="engagementTerms"
                  rows={3}
                  value={formData.engagementTerms}
                  onChange={(e) => setFormData({ ...formData, engagementTerms: e.target.value })}
                  placeholder="Terms for engagement, payment terms, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Add images and documents to showcase your listing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop images here, or click to browse
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Files
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Documents</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload spec sheets, brochures, or other documents (PDF)
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
