'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DollarSign,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice?: number;
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  active: boolean;
  description: string;
}

interface PromotionalPrice {
  id: string;
  tierId: string;
  tierName: string;
  promotionalPrice: number;
  validFrom: string;
  validUntil: string;
  description: string;
  active: boolean;
}

export default function PricingAdminPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [promotionalPrices, setPromotionalPrices] = useState<PromotionalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddTierDialog, setShowAddTierDialog] = useState(false);
  const [showAddPromoDialog, setShowAddPromoDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromotionalPrice | null>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pricing');
      if (response.ok) {
        const data = await response.json();
        setTiers(data.tiers || []);
        setPromotionalPrices(data.promotionalPrices || []);
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setMessage({ type: 'error', text: 'Failed to load pricing data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTier = async (tier: PricingTier) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/pricing/tiers', {
        method: tier.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tier),
      });

      if (response.ok) {
        await fetchPricingData();
        setMessage({ type: 'success', text: 'Pricing tier saved successfully' });
        setEditingTier(null);
        setShowAddTierDialog(false);
      } else {
        setMessage({ type: 'error', text: 'Failed to save pricing tier' });
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      setMessage({ type: 'error', text: 'Error saving pricing tier' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePromo = async (promo: PromotionalPrice) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/pricing/promotions', {
        method: promo.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promo),
      });

      if (response.ok) {
        await fetchPricingData();
        setMessage({ type: 'success', text: 'Promotional price saved successfully' });
        setEditingPromo(null);
        setShowAddPromoDialog(false);
      } else {
        setMessage({ type: 'error', text: 'Failed to save promotional price' });
      }
    } catch (error) {
      console.error('Error saving promo:', error);
      setMessage({ type: 'error', text: 'Error saving promotional price' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/pricing/tiers/${tierId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPricingData();
        setMessage({ type: 'success', text: 'Pricing tier deleted successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete pricing tier' });
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
      setMessage({ type: 'error', text: 'Error deleting pricing tier' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promotional price?')) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/pricing/promotions/${promoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPricingData();
        setMessage({ type: 'success', text: 'Promotional price deleted successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete promotional price' });
      }
    } catch (error) {
      console.error('Error deleting promo:', error);
      setMessage({ type: 'error', text: 'Error deleting promotional price' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">
            Manage subscription tiers and promotional pricing
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Tiers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Subscription Tiers</h2>
          <Button onClick={() => {
            setEditingTier(null);
            setShowAddTierDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card key={tier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </div>
                  {tier.active && <Badge>Active</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-2xl font-bold">{formatCurrency(tier.monthlyPrice)}</p>
                  </div>
                  {tier.annualPrice && (
                    <div>
                      <p className="text-sm text-muted-foreground">Annual</p>
                      <p className="text-2xl font-bold">{formatCurrency(tier.annualPrice)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingTier(tier);
                      setShowAddTierDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTier(tier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Promotional Pricing Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Promotional Pricing</h2>
          <Button onClick={() => {
            setEditingPromo(null);
            setShowAddPromoDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Promotion
          </Button>
        </div>

        <div className="space-y-2">
          {promotionalPrices.map((promo) => (
            <Card key={promo.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{promo.tierName}</p>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(promo.promotionalPrice)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(promo.validFrom), 'MMM d, yyyy')} - {format(new Date(promo.validUntil), 'MMM d, yyyy')}
                      </span>
                      {promo.active && <Badge variant="secondary">Active</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPromo(promo);
                        setShowAddPromoDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePromo(promo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Tier Dialog */}
      <Dialog open={showAddTierDialog} onOpenChange={setShowAddTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}</DialogTitle>
          </DialogHeader>
          <TierForm
            tier={editingTier}
            onSave={handleSaveTier}
            onCancel={() => {
              setEditingTier(null);
              setShowAddTierDialog(false);
            }}
            saving={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Promo Dialog */}
      <Dialog open={showAddPromoDialog} onOpenChange={setShowAddPromoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Edit Promotional Price' : 'Add Promotional Price'}</DialogTitle>
            <DialogDescription>
              Set a temporary promotional price for a subscription tier
            </DialogDescription>
          </DialogHeader>
          <PromoForm
            promo={editingPromo}
            tiers={tiers}
            onSave={handleSavePromo}
            onCancel={() => {
              setEditingPromo(null);
              setShowAddPromoDialog(false);
            }}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TierForm({
  tier,
  onSave,
  onCancel,
  saving,
}: {
  tier: PricingTier | null;
  onSave: (tier: PricingTier) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<PricingTier>(
    tier || {
      id: '',
      name: '',
      monthlyPrice: 0,
      annualPrice: 0,
      active: true,
      description: '',
    }
  );

  return (
    <div className="space-y-4 py-4">
      <div>
        <label className="text-sm font-medium">Tier Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., KDM Consortium Membership"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this tier"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Monthly Price ($)</label>
          <Input
            type="number"
            value={formData.monthlyPrice / 100}
            onChange={(e) => setFormData({ ...formData, monthlyPrice: Math.round(parseFloat(e.target.value) * 100) })}
            placeholder="1250"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Annual Price ($)</label>
          <Input
            type="number"
            value={formData.annualPrice ? formData.annualPrice / 100 : ''}
            onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined })}
            placeholder="12000"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Tier
        </Button>
      </DialogFooter>
    </div>
  );
}

function PromoForm({
  promo,
  tiers,
  onSave,
  onCancel,
  saving,
}: {
  promo: PromotionalPrice | null;
  tiers: PricingTier[];
  onSave: (promo: PromotionalPrice) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState<PromotionalPrice>(
    promo || {
      id: '',
      tierId: '',
      tierName: '',
      promotionalPrice: 0,
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      description: '',
      active: true,
    }
  );

  return (
    <div className="space-y-4 py-4">
      <div>
        <label className="text-sm font-medium">Subscription Tier</label>
        <select
          value={formData.tierId}
          onChange={(e) => {
            const selectedTier = tiers.find((t) => t.id === e.target.value);
            setFormData({
              ...formData,
              tierId: e.target.value,
              tierName: selectedTier?.name || '',
            });
          }}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Select a tier</option>
          {tiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Promotional Price ($)</label>
        <Input
          type="number"
          value={formData.promotionalPrice / 100}
          onChange={(e) => setFormData({ ...formData, promotionalPrice: Math.round(parseFloat(e.target.value) * 100) })}
          placeholder="650"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Founders discount"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Valid From</label>
          <Input
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Valid Until</label>
          <Input
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Promotion
        </Button>
      </DialogFooter>
    </div>
  );
}
