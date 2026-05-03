"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  User,
  Target,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Award,
  Globe,
  Linkedin,
  Upload,
  Loader2,
} from "lucide-react";

const CERTIFICATIONS = [
  { id: "8a", label: "8(a)" },
  { id: "hubzone", label: "HUBZone" },
  { id: "sdvosb", label: "SDVOSB" },
  { id: "wosb", label: "WOSB" },
  { id: "cmmc", label: "CMMC" },
  { id: "mbe", label: "MBE" },
];

const PILLARS = [
  { id: "us-manufacturing", label: "U.S. Manufacturing", icon: Building2 },
  { id: "critical-minerals", label: "Critical Minerals", icon: Target },
  { id: "defense-contracting", label: "Defense Contracting", icon: Award },
  { id: "access-to-capital", label: "Access to Capital", icon: Briefcase },
  { id: "opportunity-zones", label: "Opportunity Zones", icon: Globe },
];

interface FormData {
  firstName: string;
  lastName: string;
  title: string;
  ceoBio: string;
  avatar: string;
  companyName: string;
  companyDescription: string;
  website: string;
  linkedIn: string;
  naicsCodes: string[];
  certifications: string[];
  pillarFocus: string[];
}

export function ConsortiumOnboardingWizard() {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    title: "",
    ceoBio: "",
    avatar: "",
    companyName: "",
    companyDescription: "",
    website: "",
    linkedIn: "",
    naicsCodes: [],
    certifications: [],
    pillarFocus: [],
  });

  // Check if user is a consortium member who needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!db || !profile.email) return;

      try {
        // Find team member by email
        const teamMembersRef = doc(db, COLLECTIONS.TEAM_MEMBERS, profile.id);
        const teamMemberSnap = await getDoc(teamMembersRef);

        if (teamMemberSnap.exists()) {
          const data = teamMemberSnap.data();
          const isConsortiumMember = data.tags?.includes("kdm-consortium");
          const onboardingComplete = data.consortiumOnboardingComplete;

          if (isConsortiumMember && !onboardingComplete) {
            setTeamMemberId(teamMemberSnap.id);
            setFormData((prev) => ({
              ...prev,
              firstName: data.firstName || profile.firstName || "",
              lastName: data.lastName || profile.lastName || "",
              avatar: data.avatar || profile.avatarUrl || "",
            }));
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [profile]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "naicsCodes" | "certifications" | "pillarFocus", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter((i) => i !== value) : [...current, value],
      };
    });
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0: // Welcome - always valid
        return true;
      case 1: // Profile
        if (!formData.firstName || !formData.lastName) {
          toast.error("Please enter your first and last name");
          return false;
        }
        return true;
      case 2: // Company
        if (!formData.companyName || !formData.companyDescription) {
          toast.error("Please enter your company name and description");
          return false;
        }
        return true;
      case 3: // Capabilities - optional
        return true;
      case 4: // Review - always valid
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    if (!db || !teamMemberId) return;

    setLoading(true);
    try {
      const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
      await updateDoc(teamMemberRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        bio: formData.ceoBio,
        avatar: formData.avatar,
        companyName: formData.companyName,
        companyDescription: formData.companyDescription,
        website: formData.website,
        linkedIn: formData.linkedIn,
        naicsCodes: formData.naicsCodes,
        certifications: formData.certifications,
        consortiumPillarFocus: formData.pillarFocus,
        consortiumOnboardingComplete: true,
        updatedAt: Timestamp.now(),
      });

      toast.success("Welcome to the KDM Consortium!", {
        description: "Your profile is complete and ready for matching.",
      });

      setIsOpen(false);
      router.push("/portal/consortium");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "welcome", title: "Welcome", description: "Welcome to KDM Consortium" },
    { id: "profile", title: "CEO Profile", description: "Tell us about yourself" },
    { id: "company", title: "Company Info", description: "Your company details" },
    { id: "capabilities", title: "Capabilities", description: "What you bring" },
    { id: "review", title: "Review", description: "Review and submit" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to the KDM Consortium!</h3>
              <p className="text-muted-foreground">
                You're now part of an exclusive network of 12-50 expert companies collaborating
                to win and deliver large government contracts.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">What happens next:</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Complete your profile for opportunity matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Join weekly Friday 3pm consortium meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Access curated contract opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Get 2 hours of concierge support monthly</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback>
                  {formData.firstName?.[0]}
                  {formData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Recommended: 400x400px</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="CEO / Founder"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ceoBio">CEO Bio</Label>
              <Textarea
                id="ceoBio"
                value={formData.ceoBio}
                onChange={(e) => updateFormData("ceoBio", e.target.value)}
                placeholder="Tell us about your background and expertise..."
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData("companyName", e.target.value)}
                placeholder="Acme Manufacturing Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description *</Label>
              <Textarea
                id="companyDescription"
                value={formData.companyDescription}
                onChange={(e) => updateFormData("companyDescription", e.target.value)}
                placeholder="Brief description of your company for public display (2-3 sentences)..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on the KDM Consortium member page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                placeholder="https://www.yourcompany.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn</Label>
              <Input
                id="linkedIn"
                value={formData.linkedIn}
                onChange={(e) => updateFormData("linkedIn", e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>NAICS Codes</Label>
                <div className="flex gap-2 flex-wrap">
                  {formData.naicsCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="gap-1">
                      {code}
                      <button
                        onClick={() => toggleArrayItem("naicsCodes", code)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add NAICS code (e.g. 541511)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.naicsCodes.includes(value)) {
                          toggleArrayItem("naicsCodes", value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Certifications</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CERTIFICATIONS.map((cert) => (
                    <div key={cert.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert.id}
                        checked={formData.certifications.includes(cert.id)}
                        onCheckedChange={() => toggleArrayItem("certifications", cert.id)}
                      />
                      <Label htmlFor={cert.id} className="text-sm font-normal cursor-pointer">
                        {cert.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>5 Pillars Focus Areas</Label>
                <p className="text-sm text-muted-foreground">Select which pillars your company serves:</p>
                <div className="grid grid-cols-1 gap-2">
                  {PILLARS.map((pillar) => {
                    const Icon = pillar.icon;
                    const selected = formData.pillarFocus.includes(pillar.id);
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => toggleArrayItem("pillarFocus", pillar.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                          selected
                            ? "border-amber-500 bg-amber-50"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${selected ? "text-amber-600" : "text-muted-foreground"}`} />
                        <span className={selected ? "font-medium" : ""}>{pillar.label}</span>
                        {selected && <CheckCircle className="w-4 h-4 text-amber-600 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Review Your Profile</h3>
            <div className="bg-muted rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                  <p className="text-muted-foreground">{formData.title || "No title"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formData.companyName}</p>
                  <p className="text-muted-foreground line-clamp-2">{formData.companyDescription}</p>
                </div>
              </div>
              {formData.naicsCodes.length > 0 && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex gap-1 flex-wrap">
                    {formData.naicsCodes.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {formData.certifications.length > 0 && (
                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex gap-1 flex-wrap">
                    {formData.certifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {CERTIFICATIONS.find((c) => c.id === cert)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {formData.pillarFocus.length > 0 && (
                <div className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex gap-1 flex-wrap">
                    {formData.pillarFocus.map((pillar) => (
                      <Badge key={pillar} variant="default" className="text-xs bg-amber-500">
                        {PILLARS.find((p) => p.id === pillar)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Your profile will be visible on the KDM Consortium member page once approved.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" hideClose>
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`h-1.5 w-8 rounded-full ${
                    idx <= currentStep ? "bg-amber-500" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderStep()}</div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="bg-amber-500 hover:bg-amber-600">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Profile
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
