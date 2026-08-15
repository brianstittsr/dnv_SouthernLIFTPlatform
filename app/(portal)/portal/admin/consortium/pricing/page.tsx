"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, DollarSign, Calendar } from "lucide-react";

interface MembershipPrice {
  id?: string;
  name: string;
  priceType: 'monthly' | 'annual' | 'one-time' | 'training';
  price: number;
  isPromotional: boolean;
  promotionalPrice?: number;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  description?: string;
  active: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  /** Special offer tag shown on public pricing (e.g., "HubZone Conference Special") */
  specialTag?: string;
  /** Features shown on the public pricing card */
  features?: string[];
  /** Maps this offer to the checkout product type */
  productType?: 'founders' | 'consortium' | 'cmmc-cohort';
  /** Call-to-action label */
  cta?: string;
  /** When set, this doc overrides one of the 3 core cards on the public /pricing page */
  coreTierId?: 'kdm-consortium' | 'founders' | 'cmmc-cohort';
  /** Annual price override (dollars) for the consortium monthly tier */
  annualPrice?: number;
}

type CoreTierId = 'kdm-consortium' | 'founders' | 'cmmc-cohort';

const CORE_TIER_DEFAULTS: Record<CoreTierId, {
  name: string;
  priceType: 'monthly' | 'one-time';
  price: number;
  annualPrice?: number;
  description: string;
  features: string[];
  productType: 'founders' | 'consortium' | 'cmmc-cohort';
  cta: string;
}> = {
  'kdm-consortium': {
    name: 'KDM Consortium Membership',
    priceType: 'monthly',
    price: 625,
    annualPrice: 6750,
    description: 'Join our exclusive network of government contractors and suppliers',
    features: [
      'Curated federal opportunity alerts',
      'Team assembly & partner matching',
      'Proposal development support',
      'Monthly buyer briefings',
      'Resource library access',
      'Member directory listing',
      'KDM Readiness Badge display',
      '2 hours concierge support/month',
      'Priority pursuit notifications',
      'Private workspace access',
      'Networking events access',
      'CMMC readiness assessment',
    ],
    productType: 'consortium',
    cta: 'Join the Consortium',
  },
  'founders': {
    name: 'KDM Founders Membership',
    priceType: 'one-time',
    price: 625,
    description: 'One-time founding member payment - Founding Member recognition and founder privileges',
    features: [
      'Founding Member recognition & badge',
      'Consortium membership benefits for the founding period',
      'Priority notification of publicly announced opportunities',
      'Founding member badge & recognition',
      'Exclusive founding member events',
      'Priority support & concierge service',
      'Direct access to KDM leadership',
      'Lifetime price guarantee',
      'Strategic partner introductions',
      'Custom opportunity matching',
      'Alumni network access',
      'Legacy benefits for future growth',
    ],
    productType: 'founders',
    cta: 'Claim Founders Spot',
  },
  'cmmc-cohort': {
    name: 'CMMC Cohort Training',
    priceType: 'one-time',
    price: 7500,
    description: 'Intensive 12-week program for CMMC 2.0 Level 2 assessment readiness',
    features: [
      '12-week guided readiness program',
      'Expert-led training sessions',
      'CMMC 2.0 Level 2 preparation',
      'Documentation templates & tools',
      'Mock assessments & gap analysis',
      '1-on-1 mentor sessions (4 hours)',
      'Access to certified RPOs',
      'Ongoing alumni support group',
      'Assessment preparation support',
      'Compliance roadmap development',
      'Policy & procedure creation',
      'C3PAO referral network',
    ],
    productType: 'cmmc-cohort',
    cta: 'Register for Cohort',
  },
};

const COLLECTION_NAME = "consortiumPricing";

export default function ConsortiumPricingAdminPage() {
  const [prices, setPrices] = useState<MembershipPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState<string>("");
  const [priceType, setPriceType] = useState<'monthly' | 'annual' | 'one-time' | 'training'>('monthly');
  const [price, setPrice] = useState<number>(1250);
  const [isPromotional, setIsPromotional] = useState(false);
  const [promotionalPrice, setPromotionalPrice] = useState<number>(650);
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [specialTag, setSpecialTag] = useState<string>("");
  const [features, setFeatures] = useState<string>("");
  const [productType, setProductType] = useState<'founders' | 'consortium' | 'cmmc-cohort'>('founders');
  const [cta, setCta] = useState<string>("");
  const [active, setActive] = useState(true);
  const [coreTierId, setCoreTierId] = useState<CoreTierId | undefined>(undefined);
  const [annualPrice, setAnnualPrice] = useState<number>(0);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    if (!db) {
      toast.error("Database not initialized");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);

      const loadedPrices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MembershipPrice[];

      setPrices(loadedPrices);

      // If there's an active price, populate the form
      const activePrice = loadedPrices.find((p) => p.active);
      if (activePrice) {
        populateForm(activePrice);
      }
    } catch (error) {
      console.error("Error loading prices:", error);
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (p: MembershipPrice) => {
    setName(p.name || "");
    setPriceType(p.priceType || 'monthly');
    setPrice(p.price);
    setIsPromotional(p.isPromotional);
    setPromotionalPrice(p.promotionalPrice ? p.promotionalPrice / 100 : 650); // Convert from cents to dollars
    setDescription(p.description || "");
    setSpecialTag(p.specialTag || "");
    setFeatures(p.features ? p.features.join("\n") : "");
    setProductType(p.productType || 'founders');
    setCta(p.cta || "");
    setActive(p.active);
    setCoreTierId(p.coreTierId);
    setAnnualPrice(p.annualPrice || 0);

    if (p.validFrom) {
      const date = p.validFrom.toDate();
      setValidFrom(date.toISOString().split("T")[0]);
    }
    if (p.validUntil) {
      const date = p.validUntil.toDate();
      setValidUntil(date.toISOString().split("T")[0]);
    }
  };

  const resetForm = () => {
    setPrice(1250);
    setIsPromotional(false);
    setPromotionalPrice(650);
    setValidFrom("");
    setValidUntil("");
    setDescription("");
    setSpecialTag("");
    setFeatures("");
    setProductType('founders');
    setCta("");
    setActive(true);
    setCoreTierId(undefined);
    setAnnualPrice(0);
    setEditingId(null);
  };

  const handleEditCoreTier = (tierId: CoreTierId) => {
    const existing = prices.find((p) => p.coreTierId === tierId);
    if (existing) {
      handleEdit(existing);
      setCoreTierId(tierId);
      return;
    }

    resetForm();
    const def = CORE_TIER_DEFAULTS[tierId];
    setName(def.name);
    setPriceType(def.priceType);
    setPrice(def.price);
    setAnnualPrice(def.annualPrice || 0);
    setDescription(def.description);
    setFeatures(def.features.join("\n"));
    setProductType(def.productType);
    setCta(def.cta);
    setActive(true);
    setCoreTierId(tierId);
  };

  const getCoreTierEffective = (tierId: CoreTierId) => {
    const override = prices.find((p) => p.coreTierId === tierId);
    const def = CORE_TIER_DEFAULTS[tierId];
    return {
      price: override?.price ?? def.price,
      annualPrice: override?.annualPrice ?? def.annualPrice,
      active: override ? override.active !== false : true,
      hasOverride: !!override,
      override,
    };
  };

  const handleEdit = (p: MembershipPrice) => {
    setEditingId(p.id || null);
    populateForm(p);
  };

  /**
   * One-click show/hide for a core pricing tier card. If no override doc
   * exists yet, creates one seeded from the tier defaults with the flipped
   * `active` value. If an override already exists, just flips its `active`
   * field. This does not touch any other field on the override.
   */
  const handleToggleCoreTierActive = async (tierId: CoreTierId) => {
    if (!db) {
      toast.error("Database not initialized");
      return;
    }

    const effective = getCoreTierEffective(tierId);
    const nextActive = !effective.active;

    try {
      if (effective.override?.id) {
        await updateDoc(doc(db, COLLECTION_NAME, effective.override.id), {
          active: nextActive,
          updatedAt: Timestamp.now(),
        });
      } else {
        const def = CORE_TIER_DEFAULTS[tierId];
        await addDoc(collection(db, COLLECTION_NAME), {
          name: def.name,
          priceType: def.priceType,
          price: def.price,
          annualPrice: def.annualPrice,
          description: def.description,
          features: def.features,
          productType: def.productType,
          cta: def.cta,
          coreTierId: tierId,
          isPromotional: false,
          active: nextActive,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      toast.success(`${CORE_TIER_DEFAULTS[tierId].name} ${nextActive ? "shown" : "hidden"} on the public pricing page`);
      loadPrices();
    } catch (error) {
      console.error("Error toggling core tier visibility:", error);
      const message = error instanceof Error ? error.message : "Failed to update visibility";
      toast.error(
        message.includes("permission")
          ? "Permission denied — your admin role may need to be refreshed. Try signing out and back in."
          : message
      );
    }
  };

  const handleSave = async () => {
    if (!db) {
      toast.error("Database not initialized");
      return;
    }

    try {
      setSaving(true);

      const priceData: Omit<MembershipPrice, "id"> = {
        name,
        priceType,
        price,
        annualPrice: annualPrice || undefined,
        isPromotional,
        promotionalPrice: isPromotional ? promotionalPrice * 100 : undefined, // Convert to cents
        validFrom: validFrom ? Timestamp.fromDate(new Date(validFrom)) : undefined,
        validUntil: validUntil ? Timestamp.fromDate(new Date(validUntil)) : undefined,
        description,
        specialTag: specialTag || undefined,
        features: features.trim() ? features.split("\n").map((f) => f.trim()).filter(Boolean) : undefined,
        productType,
        cta: cta || undefined,
        active,
        coreTierId: coreTierId || undefined,
        updatedAt: Timestamp.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, COLLECTION_NAME, editingId), priceData);
        toast.success("Pricing updated successfully");
      } else {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...priceData,
          createdAt: Timestamp.now(),
        });
        toast.success("Pricing created successfully");
      }

      resetForm();
      loadPrices();
    } catch (error) {
      console.error("Error saving price:", error);
      toast.error("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;

    if (!confirm("Are you sure you want to delete this pricing?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      toast.success("Pricing deleted");
      loadPrices();
    } catch (error) {
      console.error("Error deleting price:", error);
      toast.error("Failed to delete pricing");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        active: !currentActive,
        updatedAt: Timestamp.now(),
      });
      toast.success(`Pricing ${currentActive ? "deactivated" : "activated"}`);
      loadPrices();
    } catch (error) {
      console.error("Error toggling active status:", error);
      toast.error("Failed to update status");
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleDateString();
  };

  // Get effective price (promotional or regular)
  const getEffectivePrice = (p: MembershipPrice) => {
    if (!p.isPromotional || !p.promotionalPrice) return p.price;
    
    const now = new Date();
    const from = p.validFrom?.toDate();
    const until = p.validUntil?.toDate();
    
    if (from && until && now >= from && now <= until) {
      return p.promotionalPrice / 100; // Convert from cents to dollars for display
    }
    return p.price;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Consortium Membership Pricing</h1>
        <p className="text-muted-foreground">
          Manage membership prices and promotional offers
        </p>
      </div>

      {/* Core Pricing Tiers - the 3 main cards shown on the public /pricing page */}
      <div className="mb-8 space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Core Pricing Tiers</h2>
          <p className="text-sm text-muted-foreground">
            These are the three main cards shown on the public <strong>/pricing</strong> page. Edit any tier to override its price, description, features, or CTA. Deactivate a tier to hide it from the public page entirely.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(CORE_TIER_DEFAULTS) as CoreTierId[]).map((tierId) => {
            const def = CORE_TIER_DEFAULTS[tierId];
            const effective = getCoreTierEffective(tierId);
            return (
              <Card key={tierId} className={!effective.active ? "opacity-60" : undefined}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{def.name}</CardTitle>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Switch
                        checked={effective.active}
                        onCheckedChange={() => handleToggleCoreTierActive(tierId)}
                        aria-label={effective.active ? "Hide from pricing page" : "Show on pricing page"}
                      />
                    </div>
                  </div>
                  <Badge className={effective.active ? "bg-green-500 w-fit" : "bg-gray-400 w-fit"}>
                    {effective.active ? "Shown on Pricing Page" : "Hidden from Pricing Page"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-2xl font-bold">
                    {formatPrice(effective.price)}
                    {def.priceType === 'monthly' ? '/mo' : ''}
                  </p>
                  {def.priceType === 'monthly' && effective.annualPrice ? (
                    <p className="text-xs text-muted-foreground">or {formatPrice(effective.annualPrice)}/yr</p>
                  ) : null}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditCoreTier(tierId)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    {effective.hasOverride && effective.override?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(effective.override!.id!)}
                      >
                        Reset to Default
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {coreTierId ? `Editing Core Tier: ${CORE_TIER_DEFAULTS[coreTierId].name}` : editingId ? "Edit Pricing" : "Create New Pricing"}
            </CardTitle>
            <CardDescription>
              {coreTierId ? "Overriding one of the 3 core cards on the public /pricing page" : "Set the membership price and optional promotional pricing"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pricing Tier Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., KDM Founders Membership"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceType">Price Type</Label>
              <Select value={priceType} onValueChange={(value: 'monthly' | 'annual' | 'one-time' | 'training') => setPriceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regularPrice">
                {priceType === 'monthly' ? 'Monthly Price ($)' : 
                 priceType === 'annual' ? 'Annual Price ($)' : 
                 priceType === 'training' ? 'Training Price ($)' : 
                 'One-time Price ($)'}
              </Label>
              <Input
                id="regularPrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder={
                  priceType === 'one-time' ? "625" : 
                  priceType === 'training' ? "2500" : 
                  "1250"
                }
              />
            </div>

            {priceType === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="annualPrice">Annual Price ($) (optional)</Label>
                <Input
                  id="annualPrice"
                  type="number"
                  value={annualPrice}
                  onChange={(e) => setAnnualPrice(Number(e.target.value))}
                  placeholder="6750"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="promotional"
                checked={isPromotional}
                onCheckedChange={setIsPromotional}
              />
              <Label htmlFor="promotional">Enable Promotional Pricing</Label>
            </div>

            {isPromotional && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="promoPrice">Promotional Price ($)</Label>
                  <Input
                    id="promoPrice"
                    type="number"
                    value={promotionalPrice}
                    onChange={(e) => setPromotionalPrice(Number(e.target.value))}
                    placeholder="650"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Founders discount - 50% off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialTag">Special Offer Tag (optional)</Label>
              <Input
                id="specialTag"
                value={specialTag}
                onChange={(e) => setSpecialTag(e.target.value)}
                placeholder="e.g., HubZone Conference Special"
              />
              <p className="text-xs text-muted-foreground">Shown as a badge on the public pricing page.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Public Pricing Features (one per line, optional)</Label>
              <textarea
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Lifetime Founding Member status&#10;All Consortium membership benefits&#10;..."
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">Checkout Product Mapping</Label>
              <Select value={productType} onValueChange={(value: 'founders' | 'consortium' | 'cmmc-cohort') => setProductType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select checkout product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founders">Founders Membership (one-time)</SelectItem>
                  <SelectItem value="consortium">Consortium Membership (subscription)</SelectItem>
                  <SelectItem value="cmmc-cohort">CMMC Cohort Training (one-time)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call-to-Action Label (optional)</Label>
              <Input
                id="cta"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="e.g., Claim Founders Spot"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingId ? "Update" : "Save"}
              </Button>
              {(editingId || coreTierId) && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Pricing Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Effective Price</CardTitle>
            <CardDescription>
              The price currently displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prices.filter((p) => p.active).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active pricing configured.</p>
                <p className="text-sm">
                  Using default: <strong>{formatPrice(650)}</strong>/month
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {prices
                  .filter((p) => p.active)
                  .map((p) => {
                    const effectivePrice = getEffectivePrice(p);
                    const isPromoActive =
                      p.isPromotional && effectivePrice === p.promotionalPrice;

                    return (
                      <div key={p.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-bold">
                            {formatPrice(effectivePrice)}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                          {isPromoActive && (
                            <Badge className="bg-green-500">Promo Active</Badge>
                          )}
                        </div>

                        {isPromoActive && p.price !== effectivePrice && (
                          <p className="text-sm text-muted-foreground">
                            <span className="line-through">
                              {formatPrice(p.price)}
                            </span>{" "}
                            <span className="text-green-600 font-medium">
                              Save {formatPrice(p.price - effectivePrice)}/month
                            </span>
                          </p>
                        )}

                        {p.description && (
                          <p className="text-sm text-muted-foreground">
                            {p.description}
                          </p>
                        )}

                        {p.isPromotional && p.validFrom && p.validUntil && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(p.validFrom)} - {formatDate(p.validUntil)}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pricing History</CardTitle>
          <CardDescription>All configured pricing options</CardDescription>
        </CardHeader>
        <CardContent>
          {prices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pricing history yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prices.map((p) => {
                const effectivePrice = getEffectivePrice(p);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      p.active ? "bg-green-50 border-green-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatPrice(effectivePrice)}
                          {p.priceType === 'monthly' ? '/month' : 
                           p.priceType === 'annual' ? '/year' : 
                           p.priceType === 'training' ? '/training' : 
                           ''}
                        </span>
                        {p.coreTierId && (
                          <Badge className="bg-blue-500 text-white">
                            Core Tier: {CORE_TIER_DEFAULTS[p.coreTierId].name}
                          </Badge>
                        )}
                        {p.specialTag && (
                          <Badge className="bg-amber-500 text-white">{p.specialTag}</Badge>
                        )}
                        {p.isPromotional && (
                          <Badge variant="secondary">Promotional</Badge>
                        )}
                        <Badge variant="outline" className={
                          p.priceType === 'training' ? 'bg-blue-100 text-blue-700' :
                          p.priceType === 'one-time' ? 'bg-green-100 text-green-700' :
                          p.priceType === 'annual' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {p.priceType === 'training' ? 'Training' :
                           p.priceType === 'one-time' ? 'One-time' :
                           p.priceType === 'annual' ? 'Annual' :
                           'Monthly'}
                        </Badge>
                        {p.active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p.name && <><strong>{p.name}</strong> - </>}
                        Regular: {formatPrice(p.price)}
                        {p.priceType === 'monthly' ? '/month' : 
                         p.priceType === 'annual' ? '/year' : 
                         p.priceType === 'training' ? '/training' : 
                         ''}
                        {p.isPromotional && p.promotionalPrice && (
                          <> → Promo: {formatPrice(p.promotionalPrice)}
                          {p.priceType === 'monthly' ? '/month' : 
                           p.priceType === 'annual' ? '/year' : 
                           p.priceType === 'training' ? '/training' : 
                           ''}
                          </>
                        )}
                      </p>
                      {p.description && (
                        <p className="text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(p.id!, p.active)}
                      >
                        {p.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id!)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
