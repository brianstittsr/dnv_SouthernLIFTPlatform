"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Archive } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp, collection } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { COLLECTIONS, type MarketPlaceListingDoc, type TeamMemberDoc } from "@/lib/schema";
import { toast } from "sonner";

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

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<MarketPlaceListingDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");
  const [visibility, setVisibility] = useState<"public" | "consortium-only" | "oem-only">("public");
  const [deliveryTimeline, setDeliveryTimeline] = useState("");

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    if (!db || !auth?.currentUser) return;

    setLoading(true);
    try {
      const docRef = doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, listingId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as MarketPlaceListingDoc;
        setListing(data);

        // Check ownership
        const { query, where, getDocs } = await import("firebase/firestore");
        const q = query(
          collection(db, COLLECTIONS.TEAM_MEMBERS),
          where("firebaseUid", "==", auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        
        if (!snap.empty && snap.docs[0].id === data.sellerId) {
          setIsOwner(true);
          // Populate form
          setTitle(data.title);
          setShortDescription(data.shortDescription);
          setDescription(data.description);
          setSelectedCategories(data.categories || []);
          setSelectedCertifications(data.certifications || []);
          setStatus(data.status);
          setVisibility(data.visibility);
          setDeliveryTimeline(data.deliveryTimeline || "");
        } else {
          toast.error("You don't have permission to edit this listing");
          router.push("/portal/marketplace");
        }
      } else {
        toast.error("Listing not found");
        router.push("/portal/marketplace");
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!db || !listing) return;

    if (!title || !shortDescription || selectedCategories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, listing.id), {
        title,
        shortDescription,
        description,
        categories: selectedCategories,
        certifications: selectedCertifications,
        status,
        visibility,
        deliveryTimeline,
        updatedAt: Timestamp.now(),
      });

      toast.success("Listing updated successfully");
      router.push("/portal/marketplace/my-listings");
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!db || !listing) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.MARKETPLACE_LISTINGS, listing.id), {
        status: "archived",
        updatedAt: Timestamp.now(),
      });

      toast.success("Listing archived");
      router.push("/portal/marketplace/my-listings");
    } catch (error) {
      console.error("Error archiving listing:", error);
      toast.error("Failed to archive listing");
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCertToggle = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading listing...</div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/marketplace/my-listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-muted-foreground">Update your marketplace listing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {["published", "draft", "archived"].map((s) => (
                <Badge
                  key={s}
                  variant={status === s ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setStatus(s as any)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories *</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {selectedCategories.includes(category) && "✓ "}
                  {category}
                </Badge>
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
                  {selectedCertifications.includes(cert) && "✓ "}
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <div className="flex gap-2">
              {["public", "consortium-only", "oem-only"].map((v) => (
                <Badge
                  key={v}
                  variant={visibility === v ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setVisibility(v as any)}
                >
                  {v === "consortium-only" ? "Consortium" : v === "oem-only" ? "OEM Only" : "Public"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Delivery Timeline</Label>
            <Input
              id="timeline"
              value={deliveryTimeline}
              onChange={(e) => setDeliveryTimeline(e.target.value)}
              placeholder="e.g., 2-4 weeks"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleArchive} disabled={saving}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/portal/marketplace/my-listings">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
