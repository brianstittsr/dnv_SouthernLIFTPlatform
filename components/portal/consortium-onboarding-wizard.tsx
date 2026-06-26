"use client";

import { useState, useEffect, useRef } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, Timestamp, getDoc } from "firebase/firestore";
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
  FileText,
  ChevronLeft,
  Briefcase,
  Award,
  Globe,
  Linkedin,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CERTIFICATIONS = [
  { id: "8a", label: "8(a)" },
  { id: "hubzone", label: "HUBZone" },
  { id: "sdvosb", label: "SDVOSB" },
  { id: "wosb", label: "WOSB" },
  { id: "cmmc", label: "CMMC" },
  { id: "mbe", label: "MBE" },
];

const COMMON_NAICS_CODES = [
  { code: "332710", description: "Machine Shops" },
  { code: "332810", description: "Coating, Engraving, Heat Treating" },
  { code: "333120", description: "Commercial Air Conditioning" },
  { code: "333131", description: "Industrial Machinery Manufacturing" },
  { code: "333511", description: "Industrial Mold Manufacturing" },
  { code: "336411", description: "Aircraft Manufacturing" },
  { code: "336413", description: "Aircraft Engine and Engine Parts" },
  { code: "541330", description: "Engineering Services" },
  { code: "541511", description: "Custom Computer Programming" },
  { code: "541512", description: "Computer Systems Design" },
  { code: "541611", description: "Administrative Management" },
  { code: "541690", description: "Other Scientific and Technical Consulting" },
  { code: "541712", description: "Research and Development in Physical Sciences" },
  { code: "562910", description: "Remediation and Other Waste Management" },
  { code: "236220", description: "Commercial and Institutional Building" },
  { code: "237310", description: "Highway, Street, and Bridge Construction" },
  { code: "237990", description: "Heavy and Civil Engineering Construction" },
  { code: "541330", description: "Engineering Services" },
  { code: "541512", description: "Computer Systems Design" },
  { code: "541519", description: "Other Computer Related Services" },
  { code: "541611", description: "Administrative Management" },
  { code: "541612", description: "Human Resources Consulting" },
  { code: "541618", description: "Other Management Consulting" },
  { code: "541690", description: "Other Scientific and Technical Consulting" },
  { code: "541712", description: "Research and Development in Physical Sciences" },
  { code: "541715", description: "Research and Development in Life Sciences" },
  { code: "541720", description: "Research and Development in Social Sciences" },
  { code: "541990", description: "All Other Professional Services" },
  { code: "561110", description: "Office Administrative Services" },
  { code: "561210", description: "Facilities Support Services" },
  { code: "561320", description: "Temporary Help Services" },
  { code: "561410", description: "Document Preparation Services" },
  { code: "561430", description: "Business Support Services" },
  { code: "561490", description: "Other Professional Services" },
  { code: "561710", description: "Travel Agencies" },
  { code: "561720", description: "Tour Operators" },
  { code: "561730", description: "Convention and Trade Show Organizers" },
  { code: "561740", description: "Event Promotion" },
  { code: "561790", description: "Other Travel Arrangement" },
  { code: "561990", description: "All Other Support Services" },
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
  // Stage 4: Readiness Documents
  readinessDocuments: {
    type: "sam_registration" | "duns_number" | "cage_code" | "capability_statement" | "past_performance" | "certifications" | "financials" | "insurance" | "other";
    fileName: string;
    fileUrl: string;
  }[];
  // Stage 5: Matching Preferences
  targetContractSizes: string[];
  targetAgencies: string[];
  targetRegions: string[];
}

// ─── Readiness Step sub-component ────────────────────────────────────────────

type ReadinessDocType = FormData["readinessDocuments"][number]["type"];

interface ReadinessDocEntry {
  type: ReadinessDocType;
  fileName: string;
  fileUrl: string;
}

const READINESS_DOC_TYPES: { type: ReadinessDocType; label: string }[] = [
  { type: "sam_registration", label: "SAM Registration" },
  { type: "duns_number", label: "DUNS Number" },
  { type: "cage_code", label: "CAGE Code" },
  { type: "capability_statement", label: "Capability Statement" },
  { type: "past_performance", label: "Past Performance References" },
  { type: "certifications", label: "Certifications (CMMC, ISO, etc.)" },
  { type: "financials", label: "Financial Statements" },
  { type: "insurance", label: "Insurance Certificates" },
];

function ReadinessStep({
  readinessDocuments,
  onAdd,
  onRemove,
}: {
  readinessDocuments: ReadinessDocEntry[];
  onAdd: (entry: ReadinessDocEntry) => void;
  onRemove: (type: ReadinessDocType) => void;
}) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (
    type: ReadinessDocType,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onAdd({
        type,
        fileName: file.name,
        fileUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be re-selected after removal
    e.target.value = "";
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Award className="h-12 w-12 text-amber-600 mx-auto mb-2" />
          <h3 className="text-xl font-semibold">Government Contracting Readiness</h3>
          <p className="text-sm text-muted-foreground">
            Upload documentation to validate your government contracting readiness
          </p>
        </div>

        <div className="space-y-4">
          <Label>Upload Documents</Label>
          <p className="text-sm text-muted-foreground">
            Upload your government contracting documentation. You can skip this step and upload later.
          </p>

          <div className="grid gap-3">
            {READINESS_DOC_TYPES.map((item) => {
              const uploaded = readinessDocuments.find((d) => d.type === item.type);
              return (
                <div
                  key={item.type}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    uploaded ? "border-green-400 bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`h-5 w-5 shrink-0 ${uploaded ? "text-green-600" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      {uploaded && (
                        <p className="text-xs text-green-700 truncate max-w-[180px]">{uploaded.fileName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {uploaded ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 h-7 px-2"
                        onClick={() => onRemove(item.type)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[item.type] = el; }}
                          onChange={(e) => handleFileChange(item.type, e)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRefs.current[item.type]?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Documents will be reviewed by KDM staff. You'll be notified once your readiness is validated.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
    readinessDocuments: [],
    targetContractSizes: [],
    targetAgencies: [],
    targetRegions: [],
  });

  // Check if user is a consortium member who needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!db || !profile.email) return;

      try {
        // Check if user has consortium_member svpRole
        const isConsortiumMember = profile.svpRole === "consortium_member";
        
        if (!isConsortiumMember) return;

        // Check if onboarding is already complete in user document
        const userDocRef = doc(db, "users", profile.id);
        const userDocSnap = await getDoc(userDocRef);
        
        let onboardingComplete = false;
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          onboardingComplete = userData.consortiumOnboardingComplete === true;
        }

        // Also check team member document if it exists
        const teamMembersRef = doc(db, COLLECTIONS.TEAM_MEMBERS, profile.id);
        const teamMemberSnap = await getDoc(teamMembersRef);

        if (teamMemberSnap.exists()) {
          const data = teamMemberSnap.data();
          onboardingComplete = onboardingComplete || data.consortiumOnboardingComplete === true;
          setTeamMemberId(teamMemberSnap.id);
          setFormData((prev) => ({
            ...prev,
            firstName: data.firstName || profile.firstName || "",
            lastName: data.lastName || profile.lastName || "",
            avatar: data.avatar || profile.avatarUrl || "",
          }));
        } else {
          // Pre-fill from profile if no team member exists
          setFormData((prev) => ({
            ...prev,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            avatar: profile.avatarUrl || "",
          }));
        }

        if (isConsortiumMember && !onboardingComplete) {
          setIsOpen(true);
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
      case 4: // Readiness - optional for now
        return true;
      case 5: // Matching - optional for now
        return true;
      case 6: // Review - always valid
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    if (!db) return;

    // Use teamMemberId if found, otherwise fall back to the Firebase Auth UID (profile.id)
    const targetId = teamMemberId || profile.id;
    if (!targetId) {
      toast.error("User session not found. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, targetId);
      
      // Prepare readiness documents with timestamps
      const readinessDocumentsWithTimestamps = formData.readinessDocuments.map((rdoc: FormData["readinessDocuments"][number]) => ({
        ...rdoc,
        uploadedAt: Timestamp.now(),
        status: "pending" as const,
      }));

      const teamMemberData = {
        id: targetId,
        firebaseUid: profile.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailPrimary: profile.email,
        title: formData.title || "CEO",
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
        role: "affiliate" as const,
        status: "active" as const,
        membershipTier: "standard" as const,
        membershipStatus: "active" as const,
        // Set onboarding stage to "readiness" (Stage 4)
        onboardingStage: "readiness",
        onboardingStageStartedAt: Timestamp.now(),
        // Save readiness documents
        readinessDocuments: readinessDocumentsWithTimestamps,
        readinessValidationStatus: formData.readinessDocuments.length > 0 ? "in_progress" : "not_started",
        // Save matching preferences
        matchingPreferences: {
          targetContractSizes: formData.targetContractSizes,
          targetAgencies: formData.targetAgencies,
          targetRegions: formData.targetRegions,
          preferredPartnerships: [],
        },
        // Initialize performance metrics
        performanceMetrics: {
          totalOpportunitiesViewed: 0,
          totalPartnershipsInitiated: 0,
          totalProposalsSubmitted: 0,
          totalContractsWon: 0,
          totalContractValue: 0,
          averageResponseTime: 0,
          partnershipSuccessRate: 0,
          lastActivityAt: Timestamp.now(),
        },
        engagementScore: 0,
        updatedAt: Timestamp.now(),
      };

      // Use setDoc with merge so it works whether the doc exists or not
      await setDoc(teamMemberRef, teamMemberData, { merge: true });

      // Also mark the users document as onboarding complete
      const userRef = doc(db, "users", profile.id);
      await setDoc(userRef, {
        consortiumOnboardingComplete: true,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.companyName,
        jobTitle: formData.title || "CEO",
        bio: formData.ceoBio,
        updatedAt: Timestamp.now(),
      }, { merge: true });

      toast.success("Welcome to the KDM Consortium!", {
        description: "Your profile is complete. Next step: Upload government contracting documentation.",
      });

      setIsOpen(false);
      router.push("/portal/consortium/onboarding");
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
    { id: "readiness", title: "Readiness Validation", description: "Government contracting documentation" },
    { id: "matching", title: "AI Matching Setup", description: "Configure your matching preferences" },
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
                <div className="flex justify-between items-center">
                  <Label>NAICS Codes</Label>
                  <Badge variant="outline">
                    {formData.naicsCodes.length} / 5
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.naicsCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="gap-1">
                      {code}
                      <button
                        onClick={() => toggleArrayItem("naicsCodes", code)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    disabled={formData.naicsCodes.length >= 5}
                    onValueChange={(value) => {
                      if (!formData.naicsCodes.includes(value) && formData.naicsCodes.length < 5) {
                        toggleArrayItem("naicsCodes", value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select NAICS code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_NAICS_CODES
                        .filter((naics) => !formData.naicsCodes.includes(naics.code))
                        .map((naics) => (
                          <SelectItem key={naics.code} value={naics.code}>
                            {naics.code} - {naics.description}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter custom code"
                    disabled={formData.naicsCodes.length >= 5}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !formData.naicsCodes.includes(value) && formData.naicsCodes.length < 5) {
                          toggleArrayItem("naicsCodes", value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
                {formData.naicsCodes.length >= 5 && (
                  <p className="text-xs text-muted-foreground">
                    Maximum of 5 NAICS codes reached. Remove a code to add another.
                  </p>
                )}
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
        // Stage 4: Government Contracting Readiness Validation
        return (
          <ReadinessStep
            readinessDocuments={formData.readinessDocuments}
            onAdd={(entry) =>
              updateFormData("readinessDocuments", [...formData.readinessDocuments, entry])
            }
            onRemove={(type) =>
              updateFormData(
                "readinessDocuments",
                formData.readinessDocuments.filter((d) => d.type !== type)
              )
            }
          />
        );

      case 5:
        // Stage 5: Capability Categorization & AI Matching Activation
        return (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Target className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold">AI Matching Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your preferences for AI-powered opportunity matching
                </p>
              </div>

              <div className="space-y-4">
                <Label>Target Contract Sizes</Label>
                <p className="text-sm text-muted-foreground">Select the contract sizes you're interested in:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "$0-100K",
                    "$100K-500K",
                    "$500K-1M",
                    "$1M-5M",
                    "$5M-10M",
                    "$10M+",
                  ].map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={formData.targetContractSizes.includes(size)}
                        onCheckedChange={() => toggleArrayItem("targetContractSizes" as any, size)}
                      />
                      <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Target Agencies</Label>
                <p className="text-sm text-muted-foreground">Select agencies you want to work with:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "DoD",
                    "Department of State",
                    "Department of Energy",
                    "NASA",
                    "Department of Homeland Security",
                    "Department of Transportation",
                    "VA",
                    "GSA",
                  ].map((agency) => (
                    <div key={agency} className="flex items-center space-x-2">
                      <Checkbox
                        id={`agency-${agency}`}
                        checked={formData.targetAgencies.includes(agency)}
                        onCheckedChange={() => toggleArrayItem("targetAgencies" as any, agency)}
                      />
                      <Label htmlFor={`agency-${agency}`} className="text-sm font-normal cursor-pointer">
                        {agency}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Target Regions</Label>
                <p className="text-sm text-muted-foreground">Select geographic regions you can serve:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "National",
                    "Northeast",
                    "Southeast",
                    "Midwest",
                    "Southwest",
                    "West",
                    "International",
                  ].map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={formData.targetRegions.includes(region)}
                        onCheckedChange={() => toggleArrayItem("targetRegions" as any, region)}
                      />
                      <Label htmlFor={`region-${region}`} className="text-sm font-normal cursor-pointer">
                        {region}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>AI Matching:</strong> Once activated, our AI will match you with relevant opportunities based on your capabilities, certifications, and preferences.
                </p>
              </div>
            </div>
          </ScrollArea>
        );

      case 6:
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
      <DialogContent className="max-w-2xl" showCloseButton={false}>
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
