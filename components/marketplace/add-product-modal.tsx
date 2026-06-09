"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Package, DollarSign, Settings, Zap, AlertCircle, CheckCircle, Upload, X, Image as ImageIcon } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "basic" | "pricing" | "integration" | "review";

interface ProductFormData {
  // Basic Info
  title: string;
  shortDescription: string;
  description: string;
  type: "service" | "product" | "subscription";
  categories: string[];
  naicsCodes: string[];
  images: string[];  // Array of image URLs
  
  // Pricing
  pricingType: "one-time" | "subscription" | "usage-based";
  basePrice: number;
  priceUnit: string;
  
  // Subscription Pricing
  subscriptionInterval?: "monthly" | "yearly";
  trialDays?: number;
  
  // Usage-based Pricing
  usageUnit?: string;
  usagePrice?: number;
  tieredPricing?: Array<{ minUnits: number; maxUnits: number; price: number }>;
  
  // Integration
  integrationType: "kdm-platform" | "third-party";
  requiresVendorAssistance: boolean;
  integrationNotes?: string;
  
  // Stripe
  stripeProductId?: string;
  stripePriceId?: string;
  revenueShare?: number;
}

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    shortDescription: "",
    description: "",
    type: "service",
    categories: [],
    naicsCodes: [],
    images: [],
    pricingType: "one-time",
    basePrice: 0,
    priceUnit: "per unit",
    subscriptionInterval: "monthly",
    trialDays: 0,
    usageUnit: "",
    usagePrice: 0,
    tieredPricing: [],
    integrationType: "kdm-platform",
    requiresVendorAssistance: false,
    integrationNotes: "",
    revenueShare: 0,
  });

  const [loading, setLoading] = useState(false);

  const steps: { id: Step; title: string; icon: any }[] = [
    { id: "basic", title: "Basic Info", icon: Package },
    { id: "pricing", title: "Pricing", icon: DollarSign },
    { id: "integration", title: "Integration", icon: Settings },
    { id: "review", title: "Review", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case "basic":
        return formData.title && formData.shortDescription && formData.description;
      case "pricing":
        return formData.basePrice > 0 && formData.priceUnit;
      case "integration":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStep(steps[currentStepIndex + 1].id);
      }
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call to save product
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Product added successfully!");
      onOpenChange(false);
      setCurrentStep("basic");
      setFormData({
        title: "",
        shortDescription: "",
        description: "",
        type: "service",
        categories: [],
        naicsCodes: [],
        images: [],
        pricingType: "one-time",
        basePrice: 0,
        priceUnit: "per unit",
        subscriptionInterval: "monthly",
        trialDays: 0,
        usageUnit: "",
        usagePrice: 0,
        tieredPricing: [],
        integrationType: "kdm-platform",
        requiresVendorAssistance: false,
        integrationNotes: "",
        revenueShare: 0,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Marketplace Product</DialogTitle>
          <DialogDescription>
            Create a new product listing for the KDM Consortium marketplace
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === "basic" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details about your product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      placeholder="e.g., CMMC Level 2 Assessment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Product Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => updateFormData("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => updateFormData("shortDescription", e.target.value)}
                      placeholder="Brief description for listing cards"
                      maxLength={150}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.shortDescription.length}/150 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      placeholder="Detailed description of your product..."
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categories">Categories</Label>
                    <Input
                      id="categories"
                      value={formData.categories.join(", ")}
                      onChange={(e) =>
                        updateFormData(
                          "categories",
                          e.target.value.split(",").map((c) => c.trim()).filter(Boolean)
                        )
                      }
                      placeholder="e.g., CMMC, Compliance, Certification"
                    />
                  </div>
                  <div>
                    <Label htmlFor="naicsCodes">NAICS Codes</Label>
                    <Input
                      id="naicsCodes"
                      value={formData.naicsCodes.join(", ")}
                      onChange={(e) =>
                        updateFormData(
                          "naicsCodes",
                          e.target.value.split(",").map((c) => c.trim()).filter(Boolean)
                        )
                      }
                      placeholder="e.g., 541512, 541511"
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <Label>Product Images</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload images to showcase your product. First image will be the main display image.
                    </p>
                    
                    {/* Upload Area */}
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const imageUrls = files.map(file => URL.createObjectURL(file));
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, ...imageUrls]
                          }));
                        }}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload images</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>

                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {index === 0 && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="text-xs">Main</Badge>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "pricing" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>
                    Set up pricing and payment options with Stripe integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="pricingType">Pricing Type *</Label>
                    <Select
                      value={formData.pricingType}
                      onValueChange={(value: any) => updateFormData("pricingType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time Payment</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="usage-based">Usage-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {formData.pricingType === "one-time" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="basePrice">Base Price *</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">$</span>
                          <Input
                            id="basePrice"
                            type="number"
                            value={formData.basePrice}
                            onChange={(e) => updateFormData("basePrice", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="priceUnit">Price Unit *</Label>
                        <Input
                          id="priceUnit"
                          value={formData.priceUnit}
                          onChange={(e) => updateFormData("priceUnit", e.target.value)}
                          placeholder="e.g., per assessment, per hour, flat fee"
                        />
                      </div>
                    </div>
                  )}

                  {formData.pricingType === "subscription" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="basePrice">Monthly Price *</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">$</span>
                          <Input
                            id="basePrice"
                            type="number"
                            value={formData.basePrice}
                            onChange={(e) => updateFormData("basePrice", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subscriptionInterval">Billing Interval</Label>
                        <Select
                          value={formData.subscriptionInterval}
                          onValueChange={(value: any) => updateFormData("subscriptionInterval", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="trialDays">Free Trial Days</Label>
                        <Input
                          id="trialDays"
                          type="number"
                          value={formData.trialDays}
                          onChange={(e) => updateFormData("trialDays", parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {formData.pricingType === "usage-based" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="usageUnit">Usage Unit *</Label>
                        <Input
                          id="usageUnit"
                          value={formData.usageUnit}
                          onChange={(e) => updateFormData("usageUnit", e.target.value)}
                          placeholder="e.g., per API call, per GB, per user"
                        />
                      </div>
                      <div>
                        <Label htmlFor="usagePrice">Price per Unit *</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">$</span>
                          <Input
                            id="usagePrice"
                            type="number"
                            value={formData.usagePrice}
                            onChange={(e) => updateFormData("usagePrice", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm font-semibold mb-2">Tiered Pricing (Optional)</p>
                        <p className="text-xs text-muted-foreground">
                          Add volume discounts for higher usage tiers
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label htmlFor="revenueShare">Revenue Share (%)</Label>
                    <Input
                      id="revenueShare"
                      type="number"
                      value={formData.revenueShare}
                      onChange={(e) => updateFormData("revenueShare", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Percentage of revenue shared with KDM Consortium
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "integration" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Configuration</CardTitle>
                  <CardDescription>
                    Define how this product integrates with the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="integrationType">Integration Type *</Label>
                    <Select
                      value={formData.integrationType}
                      onValueChange={(value: any) => updateFormData("integrationType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kdm-platform">
                          <div className="flex flex-col">
                            <span>KDM Platform Integration</span>
                            <span className="text-xs text-muted-foreground">
                              Native integration with KDM Consortium platform
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="third-party">
                          <div className="flex flex-col">
                            <span>Third-Party Integration</span>
                            <span className="text-xs text-muted-foreground">
                              External service requiring vendor assistance
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.integrationType === "kdm-platform" && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-900 dark:text-green-100">
                            Native Platform Integration
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            This product will be seamlessly integrated into the KDM Consortium
                            platform with automatic user provisioning and SSO support.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.integrationType === "third-party" && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-amber-900 dark:text-amber-100">
                              Third-Party Integration
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              This product requires additional setup and may need vendor
                              assistance for integration.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiresVendorAssistance"
                          checked={formData.requiresVendorAssistance}
                          onCheckedChange={(checked) =>
                            updateFormData("requiresVendorAssistance", checked)
                          }
                        />
                        <Label
                          htmlFor="requiresVendorAssistance"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Requires vendor assistance for setup
                        </Label>
                      </div>
                      <div>
                        <Label htmlFor="integrationNotes">Integration Notes</Label>
                        <Textarea
                          id="integrationNotes"
                          value={formData.integrationNotes}
                          onChange={(e) => updateFormData("integrationNotes", e.target.value)}
                          placeholder="Describe any special integration requirements..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Product</CardTitle>
                  <CardDescription>
                    Review all details before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span>{formData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {formData.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categories:</span>
                        <div className="flex gap-1">
                          {formData.categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pricing Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {formData.pricingType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Price:</span>
                        <span className="font-semibold">
                          ${formData.basePrice.toLocaleString()}
                        </span>
                      </div>
                      {formData.pricingType === "subscription" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interval:</span>
                            <span className="capitalize">{formData.subscriptionInterval}</span>
                          </div>
                          {(formData.trialDays || 0) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Free Trial:</span>
                              <span>{formData.trialDays} days</span>
                            </div>
                          )}
                        </>
                      )}
                      {(formData.revenueShare || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue Share:</span>
                          <span>{formData.revenueShare}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Integration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge
                          variant={formData.integrationType === "kdm-platform" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {formData.integrationType === "kdm-platform"
                            ? "KDM Platform"
                            : "Third-Party"}
                        </Badge>
                      </div>
                      {formData.requiresVendorAssistance && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Requires vendor assistance</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {currentStep === "review" ? (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
