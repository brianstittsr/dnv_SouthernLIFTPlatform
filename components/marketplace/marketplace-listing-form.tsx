"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Package, Briefcase, Zap } from "lucide-react";
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type MarketPlaceListingDoc } from "@/lib/schema";
import { useUserProfile } from "@/contexts/user-profile-context";
import { toast } from "sonner";

interface MarketplaceListingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingListing?: MarketPlaceListingDoc | null;
}

export function MarketplaceListingForm({
  open,
  onClose,
  onSuccess,
  editingListing,
}: MarketplaceListingFormProps) {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(editingListing?.images || []);
  const [newCategory, setNewCategory] = useState("");
  const [newNaicsCode, setNewNaicsCode] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const [formData, setFormData] = useState({
    listingType: (editingListing?.listingType as "product" | "service" | "capability") || "product",
    title: editingListing?.title || "",
    description: editingListing?.description || "",
    shortDescription: editingListing?.shortDescription || "",
    categories: editingListing?.categories || [],
    naicsCodes: editingListing?.naicsCodes || [],
    certifications: editingListing?.certifications || [],
    sku: editingListing?.sku || "",
    unitOfMeasure: editingListing?.unitOfMeasure || "each",
    serviceType: editingListing?.serviceType || "consulting",
    deliveryTimeline: editingListing?.deliveryTimeline || "",
    minimumContractSize: editingListing?.minimumContractSize || "",
    geographicServiceArea: editingListing?.geographicServiceArea || [],
    status: editingListing?.status || "draft",
    visibility: editingListing?.visibility || "consortium-only",
    targetCustomerTypes: editingListing?.targetCustomerTypes || ["consortium-member"],
  });

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData({ ...formData, categories: [...formData.categories, newCategory.trim()] });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData({ ...formData, categories: formData.categories.filter((c) => c !== category) });
  };

  const handleAddNaicsCode = () => {
    if (newNaicsCode.trim() && !formData.naicsCodes.includes(newNaicsCode.trim())) {
      setFormData({ ...formData, naicsCodes: [...formData.naicsCodes, newNaicsCode.trim()] });
      setNewNaicsCode("");
    }
  };

  const handleRemoveNaicsCode = (code: string) => {
    setFormData({ ...formData, naicsCodes: formData.naicsCodes.filter((c) => c !== code) });
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({ ...formData, certifications: [...formData.certifications, newCertification.trim()] });
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setFormData({ ...formData, certifications: formData.certifications.filter((c) => c !== cert) });
  };

  const handleAddGeographicArea = (area: string) => {
    if (area.trim() && !formData.geographicServiceArea.includes(area.trim())) {
      setFormData({ ...formData, geographicServiceArea: [...formData.geographicServiceArea, area.trim()] });
    }
  };

  const handleRemoveGeographicArea = (area: string) => {
    setFormData({ ...formData, geographicServiceArea: formData.geographicServiceArea.filter((a) => a !== area) });
  };

  const handleSubmit = async () => {
    if (!profile?.id) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    if (!db) {
      toast.error("Database not initialized");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        sellerId: profile.id,
        sellerCompanyName: profile.company || "Unknown",
        sellerLogo: profile.avatarUrl || "",
        ...formData,
        viewCount: 0,
        inquiryCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (editingListing) {
        await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, editingListing.id), {
          ...formData,
          updatedAt: Timestamp.now(),
        });
        toast.success("Listing updated successfully");
      } else {
        await addDoc(collection(db, COLLECTIONS.MARKETPLACE_LISTINGS), listingData);
        toast.success("Listing created successfully");
      }

      onSuccess?.();
      onClose();
      
      // Reset form
      if (!editingListing) {
        setFormData({
          listingType: "product",
          title: "",
          description: "",
          shortDescription: "",
          categories: [],
          naicsCodes: [],
          certifications: [],
          sku: "",
          unitOfMeasure: "each",
          serviceType: "consulting",
          deliveryTimeline: "",
          minimumContractSize: "",
          geographicServiceArea: [],
          status: "draft",
          visibility: "consortium-only",
          targetCustomerTypes: ["consortium-member"],
        });
        setImages([]);
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error("Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "service":
        return <Briefcase className="h-4 w-4" />;
      case "capability":
        return <Zap className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingListing ? "Edit Marketplace Listing" : "Create Marketplace Listing"}
          </DialogTitle>
          <DialogDescription>
            {editingListing
              ? "Update your product or service listing"
              : "List your products or services for other consortium members"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Listing Type */}
          <div className="space-y-2">
            <Label>Listing Type *</Label>
            <Select
              value={formData.listingType}
              onValueChange={(value: any) => setFormData({ ...formData, listingType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Product
                  </div>
                </SelectItem>
                <SelectItem value="service">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Service
                  </div>
                </SelectItem>
                <SelectItem value="capability">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Capability
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="CNC Machining Services"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description (150 chars) *</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value.slice(0, 150) })}
              placeholder="Brief description for listing cards"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/150</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of your product or service..."
              rows={4}
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add category (e.g., CNC Machining)"
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button type="button" variant="outline" onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* NAICS Codes */}
          <div className="space-y-2">
            <Label>NAICS Codes</Label>
            <div className="flex gap-2">
              <Input
                value={newNaicsCode}
                onChange={(e) => setNewNaicsCode(e.target.value)}
                placeholder="Add NAICS code (e.g., 332710)"
                onKeyPress={(e) => e.key === "Enter" && handleAddNaicsCode()}
              />
              <Button type="button" variant="outline" onClick={handleAddNaicsCode}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.naicsCodes.map((code) => (
                <Badge key={code} variant="outline" className="gap-1">
                  {code}
                  <button
                    type="button"
                    onClick={() => handleRemoveNaicsCode(code)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add certification (e.g., 8(a), WOSB)"
                onKeyPress={(e) => e.key === "Enter" && handleAddCertification()}
              />
              <Button type="button" variant="outline" onClick={handleAddCertification}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(cert)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Product-specific fields */}
          {formData.listingType === "product" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PROD-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Select
                    value={formData.unitOfMeasure}
                    onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="each">Each</SelectItem>
                      <SelectItem value="lot">Lot</SelectItem>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Service-specific fields */}
          {formData.listingType === "service" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value: "consulting" | "manufacturing" | "logistics" | "engineering" | "other") => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
                <Input
                  id="deliveryTimeline"
                  value={formData.deliveryTimeline}
                  onChange={(e) => setFormData({ ...formData, deliveryTimeline: e.target.value })}
                  placeholder="2-4 weeks, Custom quote, etc."
                />
              </div>
            </>
          )}

          {/* Geographic Service Area */}
          <div className="space-y-2">
            <Label>Geographic Service Area</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add state/region (e.g., Virginia, DC Metro)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddGeographicArea((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.geographicServiceArea.map((area) => (
                <Badge key={area} variant="secondary" className="gap-1">
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveGeographicArea(area)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Minimum Contract Size */}
          <div className="space-y-2">
            <Label htmlFor="minimumContractSize">Minimum Contract Size ($)</Label>
            <Input
              id="minimumContractSize"
              type="number"
              value={formData.minimumContractSize}
              onChange={(e) => setFormData({ ...formData, minimumContractSize: e.target.value })}
              placeholder="10000"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="consortium-only">Consortium Only</SelectItem>
                <SelectItem value="oem-only">OEM Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editingListing ? "Update" : "Create"} Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
