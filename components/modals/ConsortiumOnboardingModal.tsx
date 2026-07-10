"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sparkles,
  UserPlus,
  ClipboardList,
  Zap,
  Trophy,
  Loader2,
} from "lucide-react";
import { UserType, ProfileFormData, INDUSTRY_OPTIONS, CONTRACT_TYPE_OPTIONS, CERTIFICATION_OPTIONS } from "@/lib/types/consortium";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";

interface ConsortiumOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: UserType;
  userId: string;
}

export function ConsortiumOnboardingModal({
  open,
  onOpenChange,
  userType,
  userId,
}: ConsortiumOnboardingModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    companyName: "",
    industry: "",
    capabilities: "",
    certifications: [],
    contractTypes: [],
    annualSpend: "",
  });

  const journeySteps = [
    { step: 1, label: "Join", desc: "You're here!", active: true, icon: UserPlus },
    { step: 2, label: "Complete Profile", desc: "5 min", active: false, icon: ClipboardList },
    { step: 3, label: "Get Matched", desc: "AI-powered", active: false, icon: Zap },
    { step: 4, label: "Win Contracts", desc: "$2.5M avg", active: false, icon: Trophy },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!db) {
        throw new Error("Database not initialized");
      }

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        profileComplete: true,
        onboardingStatus: "profile_complete",
        profileData: {
          companyName: formData.companyName,
          industry: formData.industry,
          capabilities: formData.capabilities ? formData.capabilities.split(",").map(c => c.trim()) : [],
          certifications: formData.certifications,
          contractTypes: formData.contractTypes,
          annualSpend: formData.annualSpend,
        },
        updatedAt: Timestamp.now(),
      });

      toast.success("Profile completed successfully!");
      onOpenChange(false);
      router.push("/portal/payment");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationToggle = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...(prev.certifications || []), cert],
    }));
  };

  const handleContractTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      contractTypes: prev.contractTypes?.includes(type)
        ? prev.contractTypes.filter(t => t !== type)
        : [...(prev.contractTypes || []), type],
    }));
  };

  const buyerContent = {
    title: "🎯 Be Among the First to Access Verified Suppliers",
    description: `The KDM Consortium is curating a select network of:
• CMMC Level 2+ certified manufacturers
• Critical minerals suppliers (titanium, rare earth elements)
• Opportunity Zone-based production facilities
• SDVOSB, WOSB, and diverse certified vendors

Complete your profile NOW to:
→ Get early access to supplier profiles before public launch
→ Receive AI-matched supplier recommendations within 48 hours
→ Skip the 6-month vetting process with pre-verified partners
→ Access $50M+ in shared contract opportunities`,
  };

  const supplierContent = {
    title: "🚀 Get Discovered by Prime Contractors & Government Buyers",
    description: `The KDM Consortium connects you directly with:
• Boeing, Northrop Grumman, and major prime procurement teams
• Government agencies with simplified procurement pathways
• Capital partners for contract financing

Complete your profile NOW to:
→ Appear in buyer search results immediately
→ Receive RFP alerts matching your capabilities
→ Get introduced to buyers seeking your specific expertise
→ Access $2.5M average contract value opportunities`,
  };

  const content = userType === "buyer" ? buyerContent : supplierContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center mb-6">
            <Badge className="mb-2 bg-amber-100 text-amber-800 border-amber-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Early Access Priority
            </Badge>
            <DialogTitle className="text-2xl font-bold">
              Welcome to the KDM Consortium
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              Complete your profile to unlock priority matching with{" "}
              {userType === "buyer" ? "verified suppliers" : "government buyers"}
            </p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 mb-8">
          {journeySteps.map((item) => (
            <div
              key={item.step}
              className={`text-center p-3 rounded-lg border ${
                item.active
                  ? "bg-primary/10 border-primary/20"
                  : "bg-muted border-muted"
              }`}
            >
              <item.icon
                className={`h-5 w-5 mx-auto mb-1 ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <div className="text-xs font-semibold">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 p-4 bg-primary/5 rounded-lg">
          <h3 className="font-semibold mb-2">{content.title}</h3>
          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {content.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="companyName">
              {userType === "buyer" ? "Organization Name" : "Company Name"} *
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <Label htmlFor="industry">
              {userType === "buyer" ? "Primary Industry" : "Industry Sector"} *
            </Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData({ ...formData, industry: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userType === "buyer" ? (
            <>
              <div>
                <Label>Contract Types Interested In</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CONTRACT_TYPE_OPTIONS.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`contract-${type}`}
                        checked={formData.contractTypes?.includes(type)}
                        onCheckedChange={() => handleContractTypeToggle(type)}
                      />
                      <label
                        htmlFor={`contract-${type}`}
                        className="text-sm cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="annualSpend">Annual Procurement Budget</Label>
                <Select
                  value={formData.annualSpend}
                  onValueChange={(value) =>
                    setFormData({ ...formData, annualSpend: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$0-500K">$0-500K</SelectItem>
                    <SelectItem value="$500K-2M">$500K-2M</SelectItem>
                    <SelectItem value="$2M-10M">$2M-10M</SelectItem>
                    <SelectItem value="$10M+">$10M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Current Certifications</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={formData.certifications?.includes(cert)}
                        onCheckedChange={() => handleCertificationToggle(cert)}
                      />
                      <label
                        htmlFor={`cert-${cert}`}
                        className="text-sm cursor-pointer"
                      >
                        {cert}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="capabilities">Key Capabilities</Label>
                <Textarea
                  id="capabilities"
                  value={formData.capabilities}
                  onChange={(e) =>
                    setFormData({ ...formData, capabilities: e.target.value })
                  }
                  placeholder="e.g., CNC Machining, Titanium Processing, Software Development"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple capabilities with commas
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Skip for Now
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile & Continue"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
