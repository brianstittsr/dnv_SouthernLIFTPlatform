"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, MoreVertical, Building2, Loader2, DollarSign } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, orderBy } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { toast } from "sonner";
import { formatCurrency, SPONSORSHIP_TIER_LABELS, type SponsorshipTier } from "@/lib/types/event-management";

interface SponsorshipPackage {
  id: string;
  eventId: string;
  name: string;
  tier: SponsorshipTier;
  price: number;
  currency: string;
  benefits: string[];
  maxSponsors: number;
  currentSponsors: number;
  order: number;
  isVisible: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Sponsor {
  id: string;
  eventId: string;
  packageId: string;
  companyName: string;
  logo: string;
  website: string;
  description: string;
  contactName: string;
  contactEmail: string;
  tier: SponsorshipTier;
  paymentStatus: "pending" | "paid" | "refunded";
  isVisible: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PackageFormData {
  name: string;
  tier: SponsorshipTier;
  price: number;
  benefits: string;
  maxSponsors: number;
  isVisible: boolean;
}

interface SponsorFormData {
  packageId: string;
  companyName: string;
  logo: string;
  website: string;
  description: string;
  contactName: string;
  contactEmail: string;
  paymentStatus: "pending" | "paid" | "refunded";
  isVisible: boolean;
}

const DEFAULT_PACKAGE: PackageFormData = { name: "", tier: "gold", price: 0, benefits: "", maxSponsors: 5, isVisible: true };
const DEFAULT_SPONSOR: SponsorFormData = { packageId: "", companyName: "", logo: "", website: "", description: "", contactName: "", contactEmail: "", paymentStatus: "pending", isVisible: true };

const tierColors: Record<SponsorshipTier, string> = {
  titanium: "bg-slate-200 text-slate-800",
  platinum: "bg-slate-100 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  silver: "bg-gray-100 text-gray-800",
  bronze: "bg-orange-100 text-orange-800",
  custom: "bg-purple-100 text-purple-800",
};

interface SponsorManagerProps {
  eventId: string;
}

export function SponsorManager({ eventId }: SponsorManagerProps) {
  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [packageForm, setPackageForm] = useState<PackageFormData>(DEFAULT_PACKAGE);
  const [sponsorForm, setSponsorForm] = useState<SponsorFormData>(DEFAULT_SPONSOR);
  const [editingPackage, setEditingPackage] = useState<SponsorshipPackage | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("packages");

  useEffect(() => { fetchData(); }, [eventId]);

  const fetchData = async () => {
    if (!db || !eventId) return;
    setLoading(true);
    try {
      const pq = query(collection(db, COLLECTIONS.EVENT_SPONSORSHIP_PACKAGES), where("eventId", "==", eventId), orderBy("order", "asc"));
      const ps = await getDocs(pq);
      setPackages(ps.docs.map((d) => ({ id: d.id, ...d.data() } as SponsorshipPackage)));
      const sq = query(collection(db, COLLECTIONS.EVENT_SPONSORS), where("eventId", "==", eventId), orderBy("order", "asc"));
      const ss = await getDocs(sq);
      setSponsors(ss.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsor)));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async () => {
    if (!db || !packageForm.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      const data = { eventId, name: packageForm.name, tier: packageForm.tier, price: packageForm.price, currency: "USD", benefits: packageForm.benefits.split("\n").filter(Boolean), maxSponsors: packageForm.maxSponsors, isVisible: packageForm.isVisible, updatedAt: Timestamp.now() };
      if (editingPackage) {
        await updateDoc(doc(db, COLLECTIONS.EVENT_SPONSORSHIP_PACKAGES, editingPackage.id), data);
        setPackages(packages.map((p) => (p.id === editingPackage.id ? { ...p, ...data } as SponsorshipPackage : p)));
        toast.success("Updated");
      } else {
        const ref = await addDoc(collection(db, COLLECTIONS.EVENT_SPONSORSHIP_PACKAGES), { ...data, currentSponsors: 0, order: packages.length, createdAt: Timestamp.now() });
        setPackages([...packages, { ...data, id: ref.id, currentSponsors: 0, order: packages.length, createdAt: Timestamp.now() } as SponsorshipPackage]);
        toast.success("Created");
      }
      setPackageDialogOpen(false);
      setPackageForm(DEFAULT_PACKAGE);
      setEditingPackage(null);
    } catch (error) { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleSaveSponsor = async () => {
    if (!db || !sponsorForm.companyName.trim() || !sponsorForm.packageId) { toast.error("Company and package required"); return; }
    setSaving(true);
    try {
      const pkg = packages.find((p) => p.id === sponsorForm.packageId);
      const data = { eventId, packageId: sponsorForm.packageId, companyName: sponsorForm.companyName, logo: sponsorForm.logo, website: sponsorForm.website, description: sponsorForm.description, contactName: sponsorForm.contactName, contactEmail: sponsorForm.contactEmail, tier: pkg?.tier || "bronze", paymentStatus: sponsorForm.paymentStatus, isVisible: sponsorForm.isVisible, updatedAt: Timestamp.now() };
      if (editingSponsor) {
        await updateDoc(doc(db, COLLECTIONS.EVENT_SPONSORS, editingSponsor.id), data);
        setSponsors(sponsors.map((s) => (s.id === editingSponsor.id ? { ...s, ...data } as Sponsor : s)));
        toast.success("Updated");
      } else {
        const ref = await addDoc(collection(db, COLLECTIONS.EVENT_SPONSORS), { ...data, order: sponsors.length, createdAt: Timestamp.now() });
        setSponsors([...sponsors, { ...data, id: ref.id, order: sponsors.length, createdAt: Timestamp.now() } as Sponsor]);
        if (pkg) await updateDoc(doc(db, COLLECTIONS.EVENT_SPONSORSHIP_PACKAGES, pkg.id), { currentSponsors: (pkg.currentSponsors || 0) + 1 });
        toast.success("Added");
      }
      setSponsorDialogOpen(false);
      setSponsorForm(DEFAULT_SPONSOR);
      setEditingSponsor(null);
    } catch (error) { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleDeletePackage = async (pkg: SponsorshipPackage) => {
    if (!db) return;
    if (sponsors.some((s) => s.packageId === pkg.id)) { toast.error("Has sponsors"); return; }
    try { await deleteDoc(doc(db, COLLECTIONS.EVENT_SPONSORSHIP_PACKAGES, pkg.id)); setPackages(packages.filter((p) => p.id !== pkg.id)); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  const handleDeleteSponsor = async (sponsor: Sponsor) => {
    if (!db) return;
    try { await deleteDoc(doc(db, COLLECTIONS.EVENT_SPONSORS, sponsor.id)); setSponsors(sponsors.filter((s) => s.id !== sponsor.id)); toast.success("Deleted"); } catch { toast.error("Failed"); }
  };

  const totalRevenue = sponsors.filter((s) => s.paymentStatus === "paid").reduce((sum, s) => { const pkg = packages.find((p) => p.id === s.packageId); return sum + (pkg?.price || 0); }, 0);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{packages.length}</p><p className="text-sm text-muted-foreground">Packages</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{sponsors.length}</p><p className="text-sm text-muted-foreground">Sponsors</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-muted-foreground" /><div><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p><p className="text-sm text-muted-foreground">Revenue</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="packages">Packages</TabsTrigger><TabsTrigger value="sponsors">Sponsors</TabsTrigger></TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="flex justify-between"><h3 className="text-lg font-semibold">Sponsorship Packages</h3><Button onClick={() => { setEditingPackage(null); setPackageForm(DEFAULT_PACKAGE); setPackageDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Package</Button></div>
          {packages.length === 0 ? <Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p>No packages</p></CardContent></Card> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div><Badge className={tierColors[pkg.tier]}>{SPONSORSHIP_TIER_LABELS[pkg.tier]}</Badge><h4 className="font-semibold mt-2">{pkg.name}</h4><p className="text-2xl font-bold">{formatCurrency(pkg.price)}</p></div>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingPackage(pkg); setPackageForm({ name: pkg.name, tier: pkg.tier, price: pkg.price, benefits: pkg.benefits?.join("\n") || "", maxSponsors: pkg.maxSponsors, isVisible: pkg.isVisible }); setPackageDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => handleDeletePackage(pkg)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pkg.currentSponsors || 0} / {pkg.maxSponsors} spots filled</p>
                    {pkg.benefits?.length > 0 && <ul className="text-sm space-y-1">{pkg.benefits.slice(0, 3).map((b, i) => <li key={i}>• {b}</li>)}{pkg.benefits.length > 3 && <li className="text-muted-foreground">+{pkg.benefits.length - 3} more</li>}</ul>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-4">
          <div className="flex justify-between"><h3 className="text-lg font-semibold">Sponsors</h3><Button onClick={() => { setEditingSponsor(null); setSponsorForm(DEFAULT_SPONSOR); setSponsorDialogOpen(true); }} disabled={packages.length === 0}><Plus className="h-4 w-4 mr-2" />Add Sponsor</Button></div>
          {sponsors.length === 0 ? <Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p>No sponsors</p></CardContent></Card> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((sponsor) => {
                const pkg = packages.find((p) => p.id === sponsor.packageId);
                return (
                  <Card key={sponsor.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.companyName} className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 bg-muted rounded flex items-center justify-center"><Building2 className="h-6 w-6" /></div>}
                          <div><h4 className="font-semibold">{sponsor.companyName}</h4><Badge className={tierColors[sponsor.tier]}>{SPONSORSHIP_TIER_LABELS[sponsor.tier]}</Badge></div>
                        </div>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingSponsor(sponsor); setSponsorForm({ packageId: sponsor.packageId, companyName: sponsor.companyName, logo: sponsor.logo, website: sponsor.website, description: sponsor.description, contactName: sponsor.contactName, contactEmail: sponsor.contactEmail, paymentStatus: sponsor.paymentStatus, isVisible: sponsor.isVisible }); setSponsorDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSponsor(sponsor)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 text-sm"><p className="text-muted-foreground">{pkg?.name}</p><Badge variant={sponsor.paymentStatus === "paid" ? "default" : "secondary"}>{sponsor.paymentStatus}</Badge></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingPackage ? "Edit Package" : "Add Package"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Name *</Label><Input value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tier</Label><Select value={packageForm.tier} onValueChange={(v) => setPackageForm({ ...packageForm, tier: v as SponsorshipTier })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(SPONSORSHIP_TIER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Price</Label><Input type="number" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Max Sponsors</Label><Input type="number" value={packageForm.maxSponsors} onChange={(e) => setPackageForm({ ...packageForm, maxSponsors: parseInt(e.target.value) || 1 })} /></div></div>
            <div className="space-y-2"><Label>Benefits (one per line)</Label><Textarea value={packageForm.benefits} onChange={(e) => setPackageForm({ ...packageForm, benefits: e.target.value })} rows={4} /></div>
            <div className="flex items-center gap-2"><Switch checked={packageForm.isVisible} onCheckedChange={(v) => setPackageForm({ ...packageForm, isVisible: v })} /><Label>Visible</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPackageDialogOpen(false)}>Cancel</Button><Button onClick={handleSavePackage} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingSponsor ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Package *</Label><Select value={sponsorForm.packageId} onValueChange={(v) => setSponsorForm({ ...sponsorForm, packageId: v })}><SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent>{packages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Company Name *</Label><Input value={sponsorForm.companyName} onChange={(e) => setSponsorForm({ ...sponsorForm, companyName: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Logo URL</Label><Input value={sponsorForm.logo} onChange={(e) => setSponsorForm({ ...sponsorForm, logo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={sponsorForm.website} onChange={(e) => setSponsorForm({ ...sponsorForm, website: e.target.value })} /></div></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={sponsorForm.description} onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Contact Name</Label><Input value={sponsorForm.contactName} onChange={(e) => setSponsorForm({ ...sponsorForm, contactName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Contact Email</Label><Input value={sponsorForm.contactEmail} onChange={(e) => setSponsorForm({ ...sponsorForm, contactEmail: e.target.value })} /></div></div>
            <div className="space-y-2"><Label>Payment Status</Label><Select value={sponsorForm.paymentStatus} onValueChange={(v) => setSponsorForm({ ...sponsorForm, paymentStatus: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="refunded">Refunded</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSponsorDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveSponsor} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
