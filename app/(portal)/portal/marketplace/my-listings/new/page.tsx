"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X, Upload, Building2, Package, Wrench } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { COLLECTIONS, type MarketPlaceListingDoc, type TeamMemberDoc } from "@/lib/schema";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

const LISTING_TYPES = [
  { value: "product", label: "Product", icon: Package, description: "Physical goods you manufacture or supply" },
  { value: "service", label: "Service", icon: Wrench, description: "Professional services you provide" },
  { value: "capability", label: "Capability", icon: Building2, description: "Core capabilities and expertise" },
];

const CATEGORIES = [
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
  "Other",
];

const NAICS_CODES = [
  "332710 - Machine Shops",
  "332722 - Bolt, Nut, Screw Manufacturing",
  "332999 - All Other Miscellaneous Fabricated Metal Manufacturing",
  "333517 - Machine Tool Manufacturing",
  "334419 - Other Electronic Component Manufacturing",
  "336413 - Other Aircraft Parts Manufacturing",
  "336999 - All Other Transportation Equipment Manufacturing",
  "339112 - Surgical and Medical Instrument Manufacturing",
  "541330 - Engineering Services",
  "541512 - Computer Systems Design",
  "541519 - Other Computer Related Services",
  "541611 - Administrative Management Consulting",
  "561311 - Employment Placement Agencies",
  "Other",
];

const CERTIFICATIONS = [
  "8(a) Certified",
  "WOSB - Women-Owned Small Business",
  "SDVOSB - Service-Disabled Veteran-Owned",
  "HUBZone",
  "MBE - Minority Business Enterprise",
  "CMMC Level 1",
  "CMMC Level 2",
  "CMMC Level 3",
  "ISO 9001",
  "AS9100",
  "ITAR Registered",
  "FDA Registered",
  "OSHA Compliant",
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", description: "Visible to anyone visiting the marketplace" },
  { value: "consortium-only", label: "Consortium Only", description: "Visible only to KDM Consortium members" },
  { value: "oem-only", label: "OEM Only", description: "Visible only to verified OEM buyers" },
];

const TARGET_CUSTOMERS = [
  { value: "oem", label: "OEMs", description: "Original Equipment Manufacturers seeking suppliers" },
  { value: "supplier", label: "Suppliers", description: "Other suppliers seeking partnerships" },
  { value: "consortium-member", label: "Consortium Members", description: "Fellow KDM Consortium members" },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<TeamMemberDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [listingType, setListingType] = useState<"product" | "service" | "capability">("product");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedNaicsCodes, setSelectedNaicsCodes] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "consortium-only" | "oem-only">("public");
  const [targetCustomerTypes, setTargetCustomerTypes] = useState<string[]>(["oem", "consortium-member"]);
  const [deliveryTimeline, setDeliveryTimeline] = useState("");
  const [geographicArea, setGeographicArea] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

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
          // Pre-populate with user's data
          if (data.naicsCodes) setSelectedNaicsCodes(data.naicsCodes);
          if (data.certifications) setSelectedCertifications(data.certifications);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadCurrentUser();
  }, []);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleNaicsToggle = (code: string) => {
    setSelectedNaicsCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleCertToggle = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleTargetCustomerToggle = (type: string) => {
    setTargetCustomerTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (!db || !currentUser) {
      toast.error("Unable to create listing. Please try again.");
      return;
    }

    if (!title || !shortDescription || !description || selectedCategories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const listingData: Omit<MarketPlaceListingDoc, "id"> = {
        sellerId: currentUser.id,
        sellerCompanyName: currentUser.companyName || currentUser.company || "",
        sellerLogo: currentUser.companyLogo || currentUser.avatar || "",
        listingType,
        title,
        description,
        shortDescription,
        categories: selectedCategories,
        naicsCodes: selectedNaicsCodes,
        certifications: selectedCertifications,
        images: images,
        documents: [],
        status: "published",
        visibility,
        targetCustomerTypes: targetCustomerTypes as ("oem" | "supplier" | "consortium-member")[],
        deliveryTimeline,
        geographicServiceArea: geographicArea,
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

  const nextStep = () => {
    if (step === 1 && (!title || !shortDescription)) {
      toast.error("Please fill in the title and description");
      return;
    }
    if (step === 2 && selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/marketplace/my-listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Listings
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Create New Listing</h1>
        <p className="text-muted-foreground">
          Showcase your products, services, or capabilities to the KDM ecosystem
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Basic Information</CardTitle>
            <CardDescription>Tell us what you're offering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Listing Type */}
            <div className="space-y-2">
              <Label>Listing Type</Label>
              <div className="grid gap-4 md:grid-cols-3">
                {LISTING_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.value}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        listingType === type.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setListingType(type.value as any)}
                    >
                      <Icon className="mb-2 h-6 w-6" />
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Precision CNC Machining Services"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="short-desc">
                Short Description * <span className="text-xs text-muted-foreground">(max 150 chars)</span>
              </Label>
              <Textarea
                id="short-desc"
                placeholder="Brief summary for listing cards..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value.slice(0, 150))}
                maxLength={150}
                rows={2}
              />
              <div className="text-right text-xs text-muted-foreground">
                {shortDescription.length}/150
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of your offering, capabilities, differentiators..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Categories & Codes */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Categorization</CardTitle>
            <CardDescription>Help buyers find your listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories * <span className="text-xs text-muted-foreground">(Select all that apply)</span></Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {selectedCategories.includes(category) && (
                      <Plus className="mr-1 h-3 w-3 rotate-45" />
                    )}
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* NAICS Codes */}
            <div className="space-y-2">
              <Label>NAICS Codes <span className="text-xs text-muted-foreground">(Your industry classification)</span></Label>
              <div className="space-y-2">
                {NAICS_CODES.map((code) => (
                  <div key={code} className="flex items-center gap-2">
                    <Checkbox
                      id={`naics-${code}`}
                      checked={selectedNaicsCodes.includes(code)}
                      onCheckedChange={() => handleNaicsToggle(code)}
                    />
                    <Label htmlFor={`naics-${code}`} className="cursor-pointer text-sm font-normal">
                      {code}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Certifications */}
            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => (
                  <Badge
                    key={cert}
                    variant={selectedCertifications.includes(cert) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => handleCertToggle(cert)}
                  >
                    {selectedCertifications.includes(cert) && (
                      <Plus className="mr-1 h-3 w-3 rotate-45" />
                    )}
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Target Audience */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Target Audience & Visibility</CardTitle>
            <CardDescription>Who should see your listing?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visibility */}
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="grid gap-4">
                {VISIBILITY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      visibility === option.value
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setVisibility(option.value as any)}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Target Customer Types */}
            <div className="space-y-2">
              <Label>Target Customer Types</Label>
              <div className="space-y-2">
                {TARGET_CUSTOMERS.map((type) => (
                  <div key={type.value} className="flex items-start gap-2">
                    <Checkbox
                      id={`target-${type.value}`}
                      checked={targetCustomerTypes.includes(type.value)}
                      onCheckedChange={() => handleTargetCustomerToggle(type.value)}
                    />
                    <div>
                      <Label htmlFor={`target-${type.value}`} className="cursor-pointer font-medium">
                        {type.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Delivery Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline">Typical Delivery Timeline</Label>
              <Input
                id="timeline"
                placeholder="e.g., 2-4 weeks, Custom quote based on scope"
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Publish */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Review & Publish</CardTitle>
            <CardDescription>Preview your listing before publishing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-semibold">{title || "Untitled Listing"}</h3>
              <p className="text-sm text-muted-foreground">{shortDescription || "No description"}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <div>Type: {listingType}</div>
                <div>Visibility: {visibility}</div>
                <div>Targets: {targetCustomerTypes.join(", ")}</div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="font-medium text-amber-900">What happens next?</h4>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
                <li>Your listing will be visible based on your visibility settings</li>
                <li>Interested buyers can express interest and send inquiries</li>
                <li>You'll receive email notifications for new inquiries</li>
                <li>You can edit or archive your listing anytime</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={step === 1}>
          Previous
        </Button>
        {step < 4 ? (
          <Button onClick={nextStep}>Next Step</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Publish Listing"}
          </Button>
        )}
      </div>
    </div>
  );
}
