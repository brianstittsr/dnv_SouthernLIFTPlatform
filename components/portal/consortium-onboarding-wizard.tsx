"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Download,
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

// ─── Readiness Step sub-component ────────────────────────────────────────────

export type ReadinessDocType =
  | "sam_registration"
  | "duns_number"
  | "cage_code"
  | "capability_statement"
  | "past_performance"
  | "certifications"
  | "financials"
  | "insurance"
  | "other";

export interface ReadinessDocEntry {
  type: ReadinessDocType;
  fileName?: string;
  /** Legacy external file URL (e.g. Firebase Storage). Presence without dataBase64
   *  or textValue indicates a record that predates the base64/text migration. */
  fileUrl?: string;
  attachmentId?: string;
  markdownExtracted?: boolean;
  /** Plain text value — used for SAM/DUNS/CAGE and other manually entered fields */
  textValue?: string;
  /** Base64 data URI of the uploaded document, stored directly in Firestore */
  dataBase64?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: any;
  status?: "pending" | "under_review" | "approved" | "rejected" | "pending_review" | "needs_update";
}

// Fields captured as plain text (registration numbers, not documents)
export const READINESS_TEXT_FIELDS: { type: ReadinessDocType; label: string; placeholder: string }[] = [
  { type: "sam_registration", label: "SAM Registration", placeholder: "Enter your SAM UEI / registration number" },
  { type: "duns_number", label: "DUNS Number", placeholder: "Enter your DUNS number" },
  { type: "cage_code", label: "CAGE Code", placeholder: "Enter your CAGE code" },
];

// Fields captured as uploaded documents, stored as base64 in Firestore
export const READINESS_FILE_FIELDS: { type: ReadinessDocType; label: string }[] = [
  { type: "capability_statement", label: "Capability Statement" },
  { type: "past_performance", label: "Past Performance References" },
  { type: "certifications", label: "Certifications (CMMC, ISO, etc.)" },
  { type: "financials", label: "Financial Statements" },
  { type: "insurance", label: "Insurance Certificates" },
];

export const READINESS_DOC_TYPES: { type: ReadinessDocType; label: string }[] = [
  ...READINESS_TEXT_FIELDS.map(({ type, label }) => ({ type, label })),
  ...READINESS_FILE_FIELDS,
];

/** Minimal shape shared by ReadinessDocEntry and the lighter
 *  ReadinessDocumentRecord (defined in contexts/user-profile-context.tsx) so
 *  alignment/download helpers can operate on either. */
export interface ReadinessEntryLike {
  type: string;
  fileName?: string;
  fileUrl?: string;
  attachmentId?: string;
  textValue?: string;
  dataBase64?: string;
}

/**
 * A record is "misaligned" if it was created under the old storage scheme
 * (external fileUrl only) and hasn't been migrated to the new text/base64
 * storage. These records should be flagged so the user can update them.
 */
export function isReadinessEntryMisaligned(entry?: ReadinessEntryLike): boolean {
  if (!entry) return false;
  const isTextType = READINESS_TEXT_FIELDS.some((f) => f.type === entry.type);
  if (isTextType) {
    return !entry.textValue && !!(entry.fileUrl || entry.fileName);
  }
  return !entry.dataBase64 && !!(entry.fileUrl || entry.attachmentId);
}

const MAX_READINESS_FILE_BYTES = 700 * 1024; // ~700KB keeps base64 well under Firestore's 1MB doc limit

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export function downloadReadinessEntry(entry: ReadinessEntryLike) {
  if (entry.dataBase64) {
    const link = document.createElement("a");
    link.href = entry.dataBase64;
    link.download = entry.fileName || `${entry.type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (entry.fileUrl) {
    window.open(entry.fileUrl, "_blank", "noopener,noreferrer");
  }
}

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
  readinessDocuments: ReadinessDocEntry[];
  // Stage 5: Matching Preferences
  targetContractSizes: string[];
  targetAgencies: string[];
  targetRegions: string[];
}

export function ReadinessStep({
  readinessDocuments,
  onAdd,
  onRemove,
}: {
  readinessDocuments: ReadinessDocEntry[];
  onAdd: (entry: ReadinessDocEntry) => void;
  onRemove: (type: ReadinessDocType) => void;
  userId: string;
  companyId: string;
}) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleFileChange = async (
    type: ReadinessDocType,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_READINESS_FILE_BYTES) {
      toast.error(`File too large. Please choose a file under ${Math.round(MAX_READINESS_FILE_BYTES / 1024)}KB.`);
      e.target.value = "";
      return;
    }

    setUploadingType(type);
    try {
      const dataBase64 = await readFileAsBase64(file);
      onAdd({
        type,
        fileName: file.name,
        dataBase64,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
      toast.success(`${file.name} saved`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process file");
    } finally {
      setUploadingType(null);
      e.target.value = "";
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Award className="h-12 w-12 text-amber-600 mx-auto mb-2" />
          <h3 className="text-xl font-semibold">Government Contracting Readiness</h3>
          <p className="text-sm text-muted-foreground">
            Provide documentation to validate your government contracting readiness
          </p>
        </div>

        {/* CAGE Code, UEI/SAM Registration, and DUNS Number are managed in the
            Company Intelligence profile to avoid duplicate data entry. */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Building2 className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-900">
            Your <strong>CAGE Code</strong>, <strong>UEI / SAM registration</strong>, and{" "}
            <strong>DUNS Number</strong> are managed in your Company Intelligence profile
            (Government Contracting section) so they only need to be entered once. Update the{" "}
            <strong>Company Intel</strong> tab on your profile page if these need to be added or changed.
          </p>
        </div>

        {/* File fields: documents stored as base64 */}
        <div className="space-y-4">
          <Label>Upload Documents</Label>
          <p className="text-sm text-muted-foreground">
            Upload your government contracting documentation (max {Math.round(MAX_READINESS_FILE_BYTES / 1024)}KB each). You can skip this step and upload later.
          </p>

          <div className="grid gap-3">
            {READINESS_FILE_FIELDS.map((item) => {
              const uploaded = readinessDocuments.find((d) => d.type === item.type);
              const misaligned = isReadinessEntryMisaligned(uploaded);
              const hasValidDoc = !!uploaded?.dataBase64;
              return (
                <div
                  key={item.type}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    hasValidDoc ? "border-green-400 bg-green-50" : misaligned ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`h-5 w-5 shrink-0 ${hasValidDoc ? "text-green-600" : misaligned ? "text-red-500" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        {misaligned && <Badge variant="destructive" className="text-xs">Needs Update</Badge>}
                      </div>
                      {hasValidDoc && (
                        <p className="text-xs text-green-700 truncate max-w-[180px]">{uploaded!.fileName}</p>
                      )}
                      {misaligned && (
                        <p className="text-xs text-red-600">Please re-upload this document</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasValidDoc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReadinessEntry(uploaded!)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {uploaded && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 h-7 px-2"
                        onClick={() => onRemove(item.type)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                    {uploadingType === item.type ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </div>
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
                          {hasValidDoc || misaligned ? "Replace" : "Upload"}
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
  const [companyMatches, setCompanyMatches] = useState<{ id: string; companyName: string; source: string }[]>([]);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const [linkedCompanyId, setLinkedCompanyId] = useState<string | null>(null);
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

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const MAX_AVATAR_DIMENSION = 400; // px
  const MAX_AVATAR_BYTES = 300 * 1024; // 300KB, keeps base64 well under Firestore's 1MB doc limit

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Compute proportional dimensions so the image fits within
          // MAX_AVATAR_DIMENSION x MAX_AVATAR_DIMENSION without stretching.
          let { width, height } = img;
          const scale = Math.min(
            MAX_AVATAR_DIMENSION / width,
            MAX_AVATAR_DIMENSION / height,
            1 // never upscale smaller images
          );
          width = Math.round(width * scale);
          height = Math.round(height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Progressively lower JPEG quality until under the size budget.
          let quality = 0.92;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);
          while (dataUrl.length * 0.75 > MAX_AVATAR_BYTES && quality > 0.3) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      e.target.value = "";
      return;
    }

    setAvatarUploading(true);
    try {
      const resizedDataUrl = await resizeImage(file);
      updateFormData("avatar", resizedDataUrl);
      toast.success("Photo updated");
    } catch (error) {
      console.error("Error resizing avatar:", error);
      toast.error("Failed to process image");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  // Debounced company name search for dedup suggestions
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCompanyNameChange = useCallback((value: string) => {
    updateFormData("companyName", value);
    setLinkedCompanyId(null);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (value.trim().length < 2) {
      setCompanyMatches([]);
      return;
    }

    setSearchingCompanies(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/companies/search?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        if (res.ok && data.matches) {
          setCompanyMatches(data.matches);
        }
      } catch {
        setCompanyMatches([]);
      } finally {
        setSearchingCompanies(false);
      }
    }, 400);
  }, []);

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
        linkedCompanyId: linkedCompanyId || null,
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={avatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Photo
                  </Button>
                  {formData.avatar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFormData("avatar", "")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Images are automatically resized to fit 400x400px</p>
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
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder="Acme Manufacturing Inc."
              />
              {searchingCompanies && (
                <p className="text-xs text-muted-foreground">Searching existing companies...</p>
              )}
              {!searchingCompanies && companyMatches.length > 0 && !linkedCompanyId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium text-amber-900">
                    We found existing companies with a similar name:
                  </p>
                  <p className="text-xs text-amber-700">
                    If your company is already listed, please select it to link your profile.
                  </p>
                  <div className="space-y-1">
                    {companyMatches.map((match) => (
                      <button
                        key={`${match.id}-${match.source}`}
                        onClick={() => {
                          updateFormData("companyName", match.companyName);
                          setLinkedCompanyId(match.id);
                          setCompanyMatches([]);
                        }}
                        className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-amber-100 transition-colors"
                      >
                        <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="text-sm font-medium">{match.companyName}</span>
                        <Badge variant="outline" className="text-xs ml-auto">{match.source}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {linkedCompanyId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Linked to existing company profile</span>
                  <button
                    onClick={() => {
                      setLinkedCompanyId(null);
                      updateFormData("companyName", "");
                    }}
                    className="ml-auto text-xs text-red-500 hover:text-red-700"
                  >
                    Unlink
                  </button>
                </div>
              )}
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
            userId={profile.id}
            companyId={formData.companyName}
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
