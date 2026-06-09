"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceListingDoc, type TeamMemberDoc } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Package, DollarSign, Settings, Zap, AlertCircle, CheckCircle, Upload, X, Image as ImageIcon, CreditCard, Plus, Search, ChevronDown } from "lucide-react";

type Step = "basic" | "details" | "pricing" | "integration" | "stripe" | "review";

interface ProductFormData {
  // Basic Info
  title: string;
  shortDescription: string;
  description: string;
  type: "service" | "product" | "subscription" | "capability";
  categories: string[];
  naicsCodes: string[];
  images: string[];
  
  // Product-specific fields
  sku?: string;
  unitOfMeasure?: string;
  inventoryQuantity?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  shippingInfo?: string;
  
  // Service-specific fields
  serviceType?: "consulting" | "manufacturing" | "logistics" | "engineering" | "training" | "other";
  deliveryTimeline?: string;
  certificationsRequired?: string[];
  location?: string;
  facilityInfo?: string;
  
  // Capability-specific fields
  readinessScore?: number;
  pastPerformance?: Array<{ contractTitle: string; client: string; description: string; value?: number; date?: string }>;
  
  // Subscription-specific fields
  featuresIncluded?: string[];
  
  // Common enhanced fields
  features?: string[];
  certifications?: string[];
  documents?: Array<{ name: string; url: string; type: string }>;
  minimumOrderSize?: number;
  websiteUrl?: string;
  
  // Common fields for all types
  visibility: "public" | "consortium-only" | "oem-only";
  targetCustomerTypes: ("oem" | "supplier" | "consortium-member")[];
  deliveryMode: string;
  deliveryModeDescription?: string;
  geographicServiceArea: string[];
  
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

export default function CreateListingWizardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<TeamMemberDoc | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    shortDescription: "",
    description: "",
    type: "service",
    categories: [],
    naicsCodes: [],
    images: [],
    visibility: "public",
    targetCustomerTypes: ["consortium-member"],
    deliveryMode: "",
    geographicServiceArea: ["National"],
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
    features: [],
    certifications: [],
    documents: [],
    minimumOrderSize: 0,
    websiteUrl: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const user = auth?.currentUser;
      if (!user || !db) return;

      try {
        const q = query(
          collection(db, COLLECTIONS.TEAM_MEMBERS),
          where("firebaseUid", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data() as TeamMemberDoc;
          setCurrentUser({ ...data, id: snap.docs[0].id });
          // Pre-populate with user's existing data
          const userNaics = (data as { naicsCodes?: string[] }).naicsCodes;
          const userCerts = (data as { certifications?: string[] }).certifications;
          setFormData((prev) => ({
            ...prev,
            naicsCodes: userNaics?.length ? userNaics : prev.naicsCodes,
            certifications: userCerts?.length ? userCerts : prev.certifications,
          }));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  const steps: { id: Step; title: string; icon: any }[] = [
    { id: "basic", title: "Basic Info", icon: Package },
    { id: "details", title: "Details", icon: Settings },
    { id: "pricing", title: "Pricing", icon: DollarSign },
    { id: "integration", title: "Integration", icon: Zap },
    { id: "stripe", title: "Stripe Setup", icon: CreditCard },
    { id: "review", title: "Review", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case "basic":
        return formData.title && formData.shortDescription && formData.description;
      case "details":
        return formData.deliveryMode && formData.geographicServiceArea.length > 0;
      case "pricing":
        return formData.basePrice > 0 && formData.priceUnit;
      case "integration":
        return true;
      case "stripe":
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
    if (!db || !currentUser) {
      toast.error("Unable to create listing. Please sign in and try again.");
      return;
    }

    if (!formData.title || !formData.shortDescription || !formData.description || formData.categories.length === 0) {
      toast.error("Please fill in title, descriptions, and at least one category");
      return;
    }

    setLoading(true);
    try {
      // Map wizard type to schema listingType (subscription is treated as a service)
      const listingType: MarketPlaceListingDoc["listingType"] =
        formData.type === "subscription" ? "service" : formData.type;

      const listingData: Omit<MarketPlaceListingDoc, "id"> = {
        sellerId: currentUser.id,
        sellerCompanyName: currentUser.company || "",
        sellerLogo: currentUser.avatar || "",
        listingType,
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categories: formData.categories,
        naicsCodes: formData.naicsCodes,
        certifications: formData.certifications || [],
        images: formData.images,
        documents: (formData.documents || []).map((d) => ({ name: d.name, url: d.url })),
        status: "published",
        visibility: formData.visibility,
        targetCustomerTypes: formData.targetCustomerTypes,
        geographicServiceArea: formData.geographicServiceArea,
        ...(formData.sku ? { sku: formData.sku } : {}),
        ...(formData.unitOfMeasure ? { unitOfMeasure: formData.unitOfMeasure } : {}),
        ...(formData.serviceType
          ? { serviceType: formData.serviceType === "training" ? "other" : formData.serviceType }
          : {}),
        ...(formData.deliveryTimeline ? { deliveryTimeline: formData.deliveryTimeline } : {}),
        ...(formData.minimumOrderSize ? { minimumContractSize: formData.minimumOrderSize } : {}),
        ...(formData.readinessScore ? { readinessScore: formData.readinessScore } : {}),
        ...(formData.pastPerformance && formData.pastPerformance.length > 0
          ? {
              pastPerformanceReferences: formData.pastPerformance.map((p) => ({
                contractTitle: p.contractTitle,
                client: p.client,
                description: p.description,
                ...(p.value ? { value: p.value } : {}),
              })),
            }
          : {}),
        viewCount: 0,
        inquiryCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, COLLECTIONS.MARKETPLACE_LISTINGS), listingData);
      toast.success("Listing created successfully!");
      router.push("/portal/marketplace/my-listings");
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Common NAICS codes for government contracting
  const NAICS_OPTIONS = [
    { code: "541511", description: "Custom Computer Programming Services" },
    { code: "541512", description: "Computer Systems Design Services" },
    { code: "541513", description: "Computer Facilities Management" },
    { code: "541519", description: "Other Computer Related Services" },
    { code: "541330", description: "Engineering Services" },
    { code: "541340", description: "Drafting Services" },
    { code: "541350", description: "Building Inspection Services" },
    { code: "541360", description: "Geophysical Surveying & Mapping" },
    { code: "541370", description: "Surveying & Mapping (Except Geophysical)" },
    { code: "541380", description: "Testing Laboratories" },
    { code: "541611", description: "Administrative Management Consulting" },
    { code: "541612", description: "Human Resources Consulting" },
    { code: "541613", description: "Marketing Consulting" },
    { code: "541614", description: "Process, Physical Distribution Consulting" },
    { code: "541618", description: "Other Management Consulting Services" },
    { code: "541620", description: "Environmental Consulting" },
    { code: "541690", description: "Other Scientific & Technical Consulting" },
    { code: "541910", description: "Marketing Research & Public Opinion Polling" },
    { code: "541920", description: "Photography Services" },
    { code: "541930", description: "Translation & Interpretation Services" },
    { code: "541990", description: "All Other Professional, Scientific, Technical Services" },
    { code: "561210", description: "Facilities Support Services" },
    { code: "561499", description: "All Other Business Support Services" },
    { code: "611420", description: "Computer Training" },
    { code: "611430", description: "Professional & Management Development Training" },
    { code: "238210", description: "Electrical Contractors" },
    { code: "238220", description: "Plumbing, Heating, Air-Conditioning Contractors" },
    { code: "332312", description: "Fabricated Structural Metal Manufacturing" },
    { code: "332710", description: "Machine Shops" },
    { code: "334118", description: "Computer Terminal & Other Computer Peripheral Equipment" },
    { code: "335311", description: "Power, Distribution, Specialty Transformer Manufacturing" },
    { code: "336411", description: "Aircraft Manufacturing" },
    { code: "336412", description: "Aircraft Engine & Engine Parts Manufacturing" },
    { code: "336413", description: "Other Aircraft Parts & Auxiliary Equipment" },
    { code: "423430", description: "Computer & Computer Peripheral Equipment Merchant Wholesalers" },
    { code: "423830", description: "Industrial Machinery & Equipment Merchant Wholesalers" },
    { code: "541710", description: "Research & Development in Physical, Engineering, Life Sciences" },
    { code: "541720", description: "Research & Development in Social Sciences, Humanities" },
    { code: "561110", description: "Office Administrative Services" },
    { code: "561312", description: "Executive Search Services" },
    { code: "561320", description: "Temporary Help Services" },
    { code: "561730", description: "Landscaping Services" },
    { code: "561740", description: "Carpet & Upholstery Cleaning Services" },
    { code: "562111", description: "Solid Waste Collection" },
    { code: "611519", description: "Other Technical & Trade Schools" },
    { code: "621111", description: "Offices of Physicians" },
    { code: "621210", description: "Offices of Dentists" },
    { code: "624410", description: "Child Day Care Services" },
  ];

  // Marketplace categories
  const CATEGORY_OPTIONS = [
    "CMMC & Cybersecurity",
    "Compliance & Certification",
    "Consulting Services",
    "Engineering Services",
    "IT & Software Development",
    "Manufacturing",
    "Logistics & Supply Chain",
    "Professional Services",
    "Research & Development",
    "Training & Education",
    "Cloud & Infrastructure",
    "Data Analytics",
    "Artificial Intelligence",
    "Project Management",
    "Risk Management",
    "Quality Assurance",
    "Testing & Inspection",
    "Maintenance & Repair",
    "Technical Writing",
    "Translation Services",
    "Marketing & Communications",
    "Human Resources",
    "Legal Services",
    "Financial Services",
    "Administrative Support",
    "Facilities Management",
    "Environmental Services",
    "Healthcare Services",
    "Construction",
    "Telecommunications",
    "Electronics",
    "Aerospace & Defense",
    "Energy & Utilities",
    "Transportation",
    "Security Services",
    "Event Planning",
    "Other Services",
  ];

  // Certifications options
  const CERTIFICATION_OPTIONS = [
    "ISO 9001",
    "ISO 14001",
    "ISO 27001",
    "CMMC Level 1",
    "CMMC Level 2",
    "CMMC Level 3",
    "NIST 800-171",
    "FedRAMP",
    "ITAR",
    "FAR/DFARS",
    "AS9100",
    "AS9120",
    "8(a) Program",
    "HubZone",
    "WOSB",
    "EDWOSB",
    "VOSB",
    "SDVOSB",
    "SDB",
    "HUBZone Certified",
    "Native American Owned",
    "Alaskan Native Owned",
    "Service-Disabled Veteran",
    "Woman Owned Small Business",
    "Minority Owned Business",
    "Small Disadvantaged Business",
    "DBE",
    "MBE",
    "SWaM",
    "GSA Schedule",
    "SEWP",
    "CIO-SP3",
    "ALLIANT 2",
    "ITES-3S",
    "ENCORE III",
  ];

  const toggleArrayValue = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter(v => v !== value) : [...current, value]
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Marketplace Listing</h1>
        <p className="text-muted-foreground mt-1">
          Create a new product listing for the KDM Consortium marketplace
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Step {currentStepIndex + 1} of {steps.length}</span>
              <span className="text-muted-foreground">{steps[currentStepIndex].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about your product using the tabs below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="categories">Categories & NAICS</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="media">Media & Web</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-4 mt-4">
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
                        <SelectItem value="capability">Capability</SelectItem>
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
                </TabsContent>

                {/* Categories & NAICS Tab */}
                <TabsContent value="categories" className="space-y-4 mt-4">
                  <div>
                    <Label className="mb-2 block">Categories *</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select all applicable categories (multiple allowed)
                    </p>
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORY_OPTIONS.map((category) => (
                          <div
                            key={category}
                            className={`flex items-start space-x-2 p-2 rounded cursor-pointer transition-colors ${
                              formData.categories.includes(category)
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => toggleArrayValue("categories", category)}
                          >
                            <Checkbox
                              checked={formData.categories.includes(category)}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) => {
                                if (checked !== formData.categories.includes(category)) {
                                  toggleArrayValue("categories", category);
                                }
                              }}
                            />
                            <Label className="text-sm font-normal cursor-pointer leading-tight">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {formData.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {formData.categories.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                            <button
                              onClick={() => toggleArrayValue("categories", cat)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3 inline" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-2 block">NAICS Codes *</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select relevant NAICS codes for government contracting (multiple allowed)
                    </p>
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <div className="space-y-2">
                        {NAICS_OPTIONS.map((naics) => (
                          <div
                            key={naics.code}
                            className={`flex items-start space-x-3 p-2 rounded cursor-pointer transition-colors ${
                              formData.naicsCodes.includes(naics.code)
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => toggleArrayValue("naicsCodes", naics.code)}
                          >
                            <Checkbox
                              checked={formData.naicsCodes.includes(naics.code)}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) => {
                                if (checked !== formData.naicsCodes.includes(naics.code)) {
                                  toggleArrayValue("naicsCodes", naics.code);
                                }
                              }}
                            />
                            <div className="flex-1">
                              <Label className="text-sm font-medium cursor-pointer">
                                {naics.code}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {naics.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {formData.naicsCodes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {formData.naicsCodes.map((code) => (
                          <Badge key={code} variant="secondary" className="text-xs">
                            {code}
                            <button
                              onClick={() => toggleArrayValue("naicsCodes", code)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3 inline" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="certifications" className="space-y-4 mt-4">
                  <div>
                    <Label className="mb-2 block">Certifications & Standards</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select all relevant certifications your business holds (multiple allowed)
                    </p>
                    <ScrollArea className="h-[400px] border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {CERTIFICATION_OPTIONS.map((cert) => (
                          <div
                            key={cert}
                            className={`flex items-start space-x-2 p-2 rounded cursor-pointer transition-colors ${
                              formData.certifications?.includes(cert)
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => toggleArrayValue("certifications", cert)}
                          >
                            <Checkbox
                              checked={formData.certifications?.includes(cert) || false}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) => {
                                if (checked !== (formData.certifications?.includes(cert) || false)) {
                                  toggleArrayValue("certifications", cert);
                                }
                              }}
                            />
                            <Label className="text-sm font-normal cursor-pointer leading-tight">
                              {cert}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {formData.certifications && formData.certifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {formData.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            {cert}
                            <button
                              onClick={() => toggleArrayValue("certifications", cert)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3 inline" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Media & Web Tab */}
                <TabsContent value="media" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl || ""}
                      onChange={(e) => updateFormData("websiteUrl", e.target.value)}
                      placeholder="https://your-company-website.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link to your company website or product page
                    </p>
                  </div>

                  <Separator />

                  {/* Image Upload */}
                  <div>
                    <Label>Product Images</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload images to showcase your product. First image will be the main display image.
                    </p>

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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {currentStep === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Provide specific details based on your product type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Common Fields for All Types */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Visibility & Targeting</h3>
                
                <div>
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: any) => updateFormData("visibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (Anyone)</SelectItem>
                      <SelectItem value="consortium-only">Consortium Members Only</SelectItem>
                      <SelectItem value="oem-only">OEM Partners Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Customer Types</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="target-oem"
                        checked={formData.targetCustomerTypes.includes("oem")}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...formData.targetCustomerTypes, "oem"]
                            : formData.targetCustomerTypes.filter(t => t !== "oem");
                          updateFormData("targetCustomerTypes", newTypes);
                        }}
                      />
                      <Label htmlFor="target-oem" className="text-sm font-normal cursor-pointer">OEMs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="target-supplier"
                        checked={formData.targetCustomerTypes.includes("supplier")}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...formData.targetCustomerTypes, "supplier"]
                            : formData.targetCustomerTypes.filter(t => t !== "supplier");
                          updateFormData("targetCustomerTypes", newTypes);
                        }}
                      />
                      <Label htmlFor="target-supplier" className="text-sm font-normal cursor-pointer">Suppliers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="target-consortium"
                        checked={formData.targetCustomerTypes.includes("consortium-member")}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...formData.targetCustomerTypes, "consortium-member"]
                            : formData.targetCustomerTypes.filter(t => t !== "consortium-member");
                          updateFormData("targetCustomerTypes", newTypes);
                        }}
                      />
                      <Label htmlFor="target-consortium" className="text-sm font-normal cursor-pointer">Consortium Members</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Delivery Information</h3>
                
                <div>
                  <Label htmlFor="deliveryMode">Delivery Mode *</Label>
                  <Select
                    value={formData.deliveryMode}
                    onValueChange={(value) => updateFormData("deliveryMode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Digital SaaS">Digital SaaS - Cloud-based instant access</SelectItem>
                      <SelectItem value="Digital Platform">Digital Platform - Online tools & resources</SelectItem>
                      <SelectItem value="Virtual Consulting">Virtual Consulting - Remote service delivery</SelectItem>
                      <SelectItem value="Hybrid Service">Hybrid Service - Virtual + On-site</SelectItem>
                      <SelectItem value="On-site Assessment">On-site Assessment - In-person at client location</SelectItem>
                      <SelectItem value="Physical Manufacturing">Physical Manufacturing - Made to order & shipped</SelectItem>
                      <SelectItem value="Structured Training">Structured Training - Scheduled program delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.deliveryMode && (
                  <div>
                    <Label htmlFor="deliveryModeDescription">Delivery Description</Label>
                    <Textarea
                      id="deliveryModeDescription"
                      value={formData.deliveryModeDescription}
                      onChange={(e) => updateFormData("deliveryModeDescription", e.target.value)}
                      placeholder="Describe how this product/service will be delivered to customers..."
                      rows={2}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="geographicServiceArea">Geographic Service Area *</Label>
                  <Input
                    id="geographicServiceArea"
                    value={formData.geographicServiceArea.join(", ")}
                    onChange={(e) =>
                      updateFormData(
                        "geographicServiceArea",
                        e.target.value.split(",").map((c) => c.trim()).filter(Boolean)
                      )
                    }
                    placeholder="e.g., National, Northeast, International"
                  />
                </div>
              </div>

              <Separator />

              {/* Key Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Key Features</h3>
                <div>
                  <Label htmlFor="features">Features & Capabilities</Label>
                  <Textarea
                    id="features"
                    value={formData.features?.join("\n") || ""}
                    onChange={(e) =>
                      updateFormData(
                        "features",
                        e.target.value.split("\n").map((c) => c.trim()).filter(Boolean)
                      )
                    }
                    placeholder="List key features and capabilities (one per line)...&#10;• Feature 1&#10;• Feature 2&#10;• Feature 3"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter each feature on a new line. These will be displayed as bullet points on your listing.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Documents & Resources</h3>
                <p className="text-xs text-muted-foreground">
                  Add downloadable documents to help buyers understand your offering
                </p>
                
                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              documents: prev.documents?.filter((_, i) => i !== index) || []
                            }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="docName"
                    placeholder="Document name (e.g., Capability Statement)"
                  />
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="doc">Word Document</SelectItem>
                      <SelectItem value="xls">Excel Spreadsheet</SelectItem>
                      <SelectItem value="ppt">PowerPoint</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  id="docUrl"
                  placeholder="Document URL (link to download)"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const nameInput = document.getElementById("docName") as HTMLInputElement;
                    const urlInput = document.getElementById("docUrl") as HTMLInputElement;
                    if (nameInput?.value && urlInput?.value) {
                      setFormData(prev => ({
                        ...prev,
                        documents: [...(prev.documents || []), {
                          name: nameInput.value,
                          url: urlInput.value,
                          type: "pdf"
                        }]
                      }));
                      nameInput.value = "";
                      urlInput.value = "";
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>

              <Separator />

              {/* Type-Specific Fields */}
              {formData.type === "product" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Product Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku || ""}
                        onChange={(e) => updateFormData("sku", e.target.value)}
                        placeholder="Stock Keeping Unit"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                      <Select
                        value={formData.unitOfMeasure || "each"}
                        onValueChange={(value) => updateFormData("unitOfMeasure", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="each">Each</SelectItem>
                          <SelectItem value="lot">Lot</SelectItem>
                          <SelectItem value="case">Case</SelectItem>
                          <SelectItem value="pallet">Pallet</SelectItem>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inventoryQuantity">Inventory Quantity</Label>
                    <Input
                      id="inventoryQuantity"
                      type="number"
                      value={formData.inventoryQuantity || ""}
                      onChange={(e) => updateFormData("inventoryQuantity", parseInt(e.target.value) || 0)}
                      placeholder="Available stock quantity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shippingInfo">Shipping Information</Label>
                    <Textarea
                      id="shippingInfo"
                      value={formData.shippingInfo || ""}
                      onChange={(e) => updateFormData("shippingInfo", e.target.value)}
                      placeholder="Shipping methods, estimated delivery time, special handling requirements..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {(formData.type === "service" || formData.type === "capability") && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Service Details</h3>
                  
                  <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceType || "other"}
                      onValueChange={(value: any) => updateFormData("serviceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
                    <Input
                      id="deliveryTimeline"
                      value={formData.deliveryTimeline || ""}
                      onChange={(e) => updateFormData("deliveryTimeline", e.target.value)}
                      placeholder="e.g., 2-4 weeks, 6-8 weeks, Custom quote"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location / Facility</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => updateFormData("location", e.target.value)}
                      placeholder="Your business location or facility address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facilityInfo">Facility Information</Label>
                    <Textarea
                      id="facilityInfo"
                      value={formData.facilityInfo || ""}
                      onChange={(e) => updateFormData("facilityInfo", e.target.value)}
                      placeholder="Facility capabilities, certifications, equipment, square footage..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="certificationsRequired">Certifications & Standards</Label>
                    <Input
                      id="certificationsRequired"
                      value={(formData.certificationsRequired || []).join(", ")}
                      onChange={(e) =>
                        updateFormData(
                          "certificationsRequired",
                          e.target.value.split(",").map((c) => c.trim()).filter(Boolean)
                        )
                      }
                      placeholder="e.g., ISO 9001, AS9100, CMMC Level 2, ITAR"
                    />
                  </div>
                </div>
              )}

              {formData.type === "capability" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Capability Details</h3>
                  
                  <div>
                    <Label htmlFor="readinessScore">Readiness Score (0-100)</Label>
                    <Input
                      id="readinessScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.readinessScore || ""}
                      onChange={(e) => updateFormData("readinessScore", parseInt(e.target.value) || 0)}
                      placeholder="Government contracting readiness score"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Self-assessed readiness level for government contracting
                    </p>
                  </div>

                  <Separator />

                  {/* Past Performance */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Past Performance References</h4>
                    <p className="text-xs text-muted-foreground">
                      Add relevant contract history to showcase your capabilities (optional)
                    </p>
                    
                    {formData.pastPerformance && formData.pastPerformance.length > 0 && (
                      <div className="space-y-2">
                        {formData.pastPerformance.map((perf, index) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{perf.contractTitle}</p>
                                <p className="text-xs text-muted-foreground">Client: {perf.client}</p>
                                {perf.value && (
                                  <p className="text-xs text-muted-foreground">
                                    Value: ${perf.value.toLocaleString()}
                                  </p>
                                )}
                                {perf.date && (
                                  <p className="text-xs text-muted-foreground">Date: {perf.date}</p>
                                )}
                                <p className="text-xs mt-1">{perf.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    pastPerformance: prev.pastPerformance?.filter((_, i) => i !== index) || []
                                  }));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 border rounded-lg p-4">
                      <div>
                        <Label htmlFor="ppContractTitle" className="text-sm">Contract Title</Label>
                        <Input
                          id="ppContractTitle"
                          placeholder="e.g., DoD Manufacturing Contract"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ppClient" className="text-sm">Client/Agency</Label>
                        <Input
                          id="ppClient"
                          placeholder="e.g., Department of Defense"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="ppValue" className="text-sm">Contract Value ($)</Label>
                          <Input
                            id="ppValue"
                            type="number"
                            placeholder="e.g., 500000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="ppDate" className="text-sm">Completion Date</Label>
                          <Input
                            id="ppDate"
                            type="text"
                            placeholder="e.g., 2023"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ppDescription" className="text-sm">Description</Label>
                        <Textarea
                          id="ppDescription"
                          placeholder="Brief description of work performed..."
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const titleInput = document.getElementById("ppContractTitle") as HTMLInputElement;
                          const clientInput = document.getElementById("ppClient") as HTMLInputElement;
                          const valueInput = document.getElementById("ppValue") as HTMLInputElement;
                          const dateInput = document.getElementById("ppDate") as HTMLInputElement;
                          const descInput = document.getElementById("ppDescription") as HTMLTextAreaElement;
                          
                          if (titleInput?.value && clientInput?.value) {
                            setFormData(prev => ({
                              ...prev,
                              pastPerformance: [...(prev.pastPerformance || []), {
                                contractTitle: titleInput.value,
                                client: clientInput.value,
                                value: parseFloat(valueInput?.value || "0") || undefined,
                                date: dateInput?.value,
                                description: descInput?.value || ""
                              }]
                            }));
                            titleInput.value = "";
                            clientInput.value = "";
                            valueInput.value = "";
                            dateInput.value = "";
                            descInput.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Past Performance
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === "subscription" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Subscription Details</h3>
                  
                  <div>
                    <Label htmlFor="featuresIncluded">Features Included</Label>
                    <Textarea
                      id="featuresIncluded"
                      value={(formData.featuresIncluded || []).join("\n")}
                      onChange={(e) =>
                        updateFormData(
                          "featuresIncluded",
                          e.target.value.split("\n").map((c) => c.trim()).filter(Boolean)
                        )
                      }
                      placeholder="List key features included in the subscription (one per line)..."
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter each feature on a new line
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === "pricing" && (
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

              <Separator />

              <div>
                <Label htmlFor="minimumOrderSize">Minimum Contract/Order Size ($)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">$</span>
                  <Input
                    id="minimumOrderSize"
                    type="number"
                    value={formData.minimumOrderSize || ""}
                    onChange={(e) => updateFormData("minimumOrderSize", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum order value or contract size you will accept
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "integration" && (
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
        )}

        {currentStep === "stripe" && (
          <Card>
            <CardHeader>
              <CardTitle>Stripe Integration</CardTitle>
              <CardDescription>
                Configure Stripe product and pricing for payment processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      Automatic Stripe Setup
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Stripe products and prices will be automatically created when you
                      publish this listing. You can manage them from your Stripe dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="stripeProductId">Stripe Product ID (Optional)</Label>
                <Input
                  id="stripeProductId"
                  value={formData.stripeProductId}
                  onChange={(e) => updateFormData("stripeProductId", e.target.value)}
                  placeholder="prod_xxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to auto-generate a new Stripe product
                </p>
              </div>

              <div>
                <Label htmlFor="stripePriceId">Stripe Price ID (Optional)</Label>
                <Input
                  id="stripePriceId"
                  value={formData.stripePriceId}
                  onChange={(e) => updateFormData("stripePriceId", e.target.value)}
                  placeholder="price_xxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to auto-generate a new Stripe price
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Payment Settings</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="accept-cards" defaultChecked />
                  <Label htmlFor="accept-cards" className="text-sm font-normal">
                    Accept Credit Cards
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="accept-invoice" />
                  <Label htmlFor="accept-invoice" className="text-sm font-normal">
                    Accept Invoice Payments
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Review Listing</CardTitle>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Images:</span>
                    <span>{formData.images.length} uploaded</span>
                  </div>
                  {formData.certifications && formData.certifications.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certifications:</span>
                      <span>{formData.certifications.join(", ")}</span>
                    </div>
                  )}
                  {formData.websiteUrl && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website:</span>
                      <span className="text-primary">{formData.websiteUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility:</span>
                    <Badge variant="outline" className="capitalize">
                      {formData.visibility.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Mode:</span>
                    <span>{formData.deliveryMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Area:</span>
                    <span>{formData.geographicServiceArea.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Customers:</span>
                    <span>{formData.targetCustomerTypes.map(t => t.replace("-", " ")).join(", ")}</span>
                  </div>
                  {formData.type === "product" && formData.sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span>{formData.sku}</span>
                    </div>
                  )}
                  {(formData.type === "service" || formData.type === "capability") && formData.serviceType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Type:</span>
                      <span className="capitalize">{formData.serviceType}</span>
                    </div>
                  )}
                  {(formData.type === "service" || formData.type === "capability") && formData.deliveryTimeline && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Timeline:</span>
                      <span>{formData.deliveryTimeline}</span>
                    </div>
                  )}
                  {formData.type === "capability" && formData.readinessScore && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Readiness Score:</span>
                      <span>{formData.readinessScore}/100</span>
                    </div>
                  )}
                  {formData.features && formData.features.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Key Features:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {formData.features.slice(0, 3).map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{f.substring(0, 20)}...</Badge>
                        ))}
                        {formData.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{formData.features.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {formData.documents && formData.documents.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documents:</span>
                      <span>{formData.documents.length} uploaded</span>
                    </div>
                  )}
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
                  {(formData.minimumOrderSize || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. Order Size:</span>
                      <span>${formData.minimumOrderSize?.toLocaleString()}</span>
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

              {formData.type === "capability" && formData.pastPerformance && formData.pastPerformance.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Past Performance ({formData.pastPerformance.length})</h3>
                    <div className="space-y-2 text-sm">
                      {formData.pastPerformance.slice(0, 2).map((perf, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{perf.contractTitle.substring(0, 25)}...</span>
                          <span>{perf.client}</span>
                        </div>
                      ))}
                      {formData.pastPerformance.length > 2 && (
                        <div className="text-xs text-muted-foreground text-right">
                          +{formData.pastPerformance.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Stripe Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product ID:</span>
                    <span className="font-mono text-xs">
                      {formData.stripeProductId || "Auto-generated"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price ID:</span>
                    <span className="font-mono text-xs">
                      {formData.stripePriceId || "Auto-generated"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <Button
            variant="outline"
            onClick={() => router.push("/portal/marketplace/directory")}
          >
            Cancel
          </Button>
          {currentStep === "review" ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
