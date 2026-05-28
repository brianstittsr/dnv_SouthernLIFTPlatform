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
  priceType: 'monthly' | 'annual' | 'one-time';
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
}

const COLLECTION_NAME = "consortiumPricing";

export default function ConsortiumPricingAdminPage() {
  const [prices, setPrices] = useState<MembershipPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState<string>("");
  const [priceType, setPriceType] = useState<'monthly' | 'annual' | 'one-time'>('monthly');
  const [price, setPrice] = useState<number>(1250);
  const [isPromotional, setIsPromotional] = useState(false);
  const [promotionalPrice, setPromotionalPrice] = useState<number>(650);
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [active, setActive] = useState(true);

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
        limit(10)
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
    setActive(p.active);

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
    setActive(true);
    setEditingId(null);
  };

  const handleEdit = (p: MembershipPrice) => {
    setEditingId(p.id || null);
    populateForm(p);
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
        isPromotional,
        promotionalPrice: isPromotional ? promotionalPrice * 100 : undefined, // Convert to cents
        validFrom: validFrom ? Timestamp.fromDate(new Date(validFrom)) : undefined,
        validUntil: validUntil ? Timestamp.fromDate(new Date(validUntil)) : undefined,
        description,
        active,
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pricing Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {editingId ? "Edit Pricing" : "Create New Pricing"}
            </CardTitle>
            <CardDescription>
              Set the membership price and optional promotional pricing
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
              <Select value={priceType} onValueChange={(value: 'monthly' | 'annual' | 'one-time') => setPriceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regularPrice">
                {priceType === 'monthly' ? 'Monthly Price ($)' : priceType === 'annual' ? 'Annual Price ($)' : 'One-time Price ($)'}
              </Label>
              <Input
                id="regularPrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder={priceType === 'one-time' ? "625" : "1250"}
              />
            </div>

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
              {editingId && (
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
                          {formatPrice(effectivePrice)}/month
                        </span>
                        {p.isPromotional && (
                          <Badge variant="secondary">Promotional</Badge>
                        )}
                        {p.active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Regular: {formatPrice(p.price)}
                        {p.isPromotional && p.promotionalPrice && (
                          <> → Promo: {formatPrice(p.promotionalPrice)}</>
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
