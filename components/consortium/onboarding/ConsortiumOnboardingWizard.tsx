"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp, setDoc } from "firebase/firestore";
import { CONSORTIUM_COLLECTIONS } from "@/lib/consortium-schema";
import { calculateReadinessScore } from "@/lib/readiness-scoring";
import { determineMembershipTier } from "@/lib/membership-tiers";
import { assessE2GReadiness } from "@/lib/e2g-alignment";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  MapPin,
  FileText,
  Shield,
  Users,
  Handshake,
  Sparkles,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  CompanyIdentity,
  NAICSCode,
  Certification,
  Capability,
  PastPerformance,
  GovernmentContractingProfile,
  GeographicCoverage,
  TeamingPreferences,
  ConsortiumPillarAlignment,
  E2GAlignment,
  OnboardingStage,
  OnboardingStatus,
  ReferralSource,
  ReadinessScore,
  MembershipTier,
  ContractType,
  TeamingRole,
  E2GPillar,
  E2GRegion,
  CertificationType,
} from "@/lib/consortium-schema";

// ============================================================================
// CONSTANTS
// ============================================================================

const CERTIFICATION_OPTIONS: { id: CertificationType; label: string }[] = [
  { id: "8a", label: "8(a)" },
  { id: "wosb", label: "WOSB" },
  { id: "sdvosb", label: "SDVOSB" },
  { id: "hubzone", label: "HUBZone" },
  { id: "cmmc_level1", label: "CMMC Level 1" },
  { id: "cmmc_level2", label: "CMMC Level 2" },
  { id: "cmmc_level3", label: "CMMC Level 3" },
  { id: "mbe", label: "MBE" },
  { id: "dbe", label: "DBE" },
  { id: "iso_9001", label: "ISO 9001" },
  { id: "iso_27001", label: "ISO 27001" },
];

const E2G_PILLAR_OPTIONS: { id: E2GPillar; label: string; icon: any }[] = [
  { id: "ai_automation", label: "AI & Automation", icon: Sparkles },
  { id: "agricultural_modernization", label: "Agricultural Modernization", icon: Target },
  { id: "workforce_development", label: "Workforce Development", icon: Users },
  { id: "quality_systems", label: "Quality Systems", icon: Shield },
  { id: "business_growth", label: "Business Growth", icon: Briefcase },
];

const E2G_REGION_OPTIONS: { id: E2GRegion; label: string }[] = [
  { id: "MD", label: "Maryland" },
  { id: "VA", label: "Virginia" },
  { id: "PA", label: "Pennsylvania" },
  { id: "WV", label: "West Virginia" },
  { id: "all", label: "All Regions" },
];

const CONTRACT_TYPE_OPTIONS: { id: ContractType; label: string }[] = [
  { id: "fixed_price", label: "Fixed Price" },
  { id: "cost_plus", label: "Cost Plus" },
  { id: "time_and_materials", label: "Time & Materials" },
];

const REVENUE_RANGES = [
  "$0-500K",
  "$500K-2M",
  "$2M-10M",
  "$10M-50M",
  "$50M+",
];

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

const REFERRAL_SOURCES: { id: ReferralSource; label: string }[] = [
  { id: "hcnc_network", label: "HCNC Network" },
  { id: "sba_district_office", label: "SBA District Office" },
  { id: "industry_event", label: "Industry Event" },
  { id: "existing_member", label: "Existing Member" },
  { id: "direct_marketing", label: "Direct Marketing" },
  { id: "other", label: "Other" },
];

// ============================================================================
// FORM DATA INTERFACE
// ============================================================================

interface ComprehensiveFormData {
  // Stage 1: Discovery & Intake
  referralSource: ReferralSource;
  referralDetails: string;

  // Stage 2: Account Creation (handled by signup)

  // Stage 3: Company Identity
  legalCompanyName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  companyDescription: string;
  ceoBiography: string;
  companyLogo: string;
  yearsInBusiness: number;
  annualRevenueRange: string;
  employeeCountRange: string;
  website: string;
  dunsNumber: string;

  // Industry Classification
  naicsCodes: string[];

  // Certifications
  certifications: Array<{
    type: CertificationType;
    certificationNumber: string;
    issuingAgency: string;
    isActive: boolean;
  }>;

  // Core Capabilities
  capabilities: Array<{
    name: string;
    description: string;
    category: string;
    yearsExperience: number;
  }>;

  // Past Performance
  pastPerformance: Array<{
    contractTitle: string;
    clientName: string;
    contractValue: string;
    contractType: ContractType;
    description: string;
    outcomes: string;
  }>;

  // Government Contracting Profile
  cageCode: string;
  uei: string;
  samRegistrationStatus: "not_registered" | "pending" | "active" | "expired";
  gsaScheduleHolder: boolean;
  gsaScheduleNumbers: string;
  preferredContractTypes: ContractType[];
  contractSizePreferences: string;

  // Geographic Coverage
  statesServed: string[];
  willingToDeployToRural: boolean;
  ruralDeploymentExperience: boolean;

  // Teaming Preferences
  willingToPrime: boolean;
  willingToSub: boolean;
  seekingPartners: boolean;
  idealPartnerProfile: string;

  // Consortium Pillar Alignment
  pillars: E2GPillar[];
  primaryServiceCategories: string;
  e2gFocus: boolean;
  ruralFocus: boolean;
  manufacturingFocus: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ConsortiumOnboardingWizard() {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<OnboardingStage>("discovery_intake");
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [readinessScore, setReadinessScore] = useState<ReadinessScore | null>(null);

  const [formData, setFormData] = useState<ComprehensiveFormData>({
    // Stage 1
    referralSource: "other",
    referralDetails: "",

    // Stage 3
    legalCompanyName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    companyDescription: "",
    ceoBiography: "",
    companyLogo: "",
    yearsInBusiness: 0,
    annualRevenueRange: "",
    employeeCountRange: "",
    website: "",
    dunsNumber: "",

    // Industry Classification
    naicsCodes: [],

    // Certifications
    certifications: [],

    // Capabilities
    capabilities: [],

    // Past Performance
    pastPerformance: [],

    // Government Contracting Profile
    cageCode: "",
    uei: "",
    samRegistrationStatus: "not_registered",
    gsaScheduleHolder: false,
    gsaScheduleNumbers: "",
    preferredContractTypes: [],
    contractSizePreferences: "",

    // Geographic Coverage
    statesServed: [],
    willingToDeployToRural: false,
    ruralDeploymentExperience: false,

    // Teaming Preferences
    willingToPrime: false,
    willingToSub: false,
    seekingPartners: false,
    idealPartnerProfile: "",

    // Consortium Pillar Alignment
    pillars: [],
    primaryServiceCategories: "",
    e2gFocus: false,
    ruralFocus: false,
    manufacturingFocus: false,
  });

  // Check if user needs onboarding
  useEffect(() => {
    if (profile?.role === "consortium_member" && !(profile as any).profileComplete) {
      setIsOpen(true);
    }
  }, [profile]);

  const updateFormData = (field: keyof ComprehensiveFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    // Validation logic for each step
    return true;
  };

  const handleComplete = async () => {
    if (!db || !profile?.id) return;

    setLoading(true);
    try {
      // Create comprehensive consortium profile
      const consortiumProfileRef = doc(db, CONSORTIUM_COLLECTIONS.PROFILES, profile.id);

      // Calculate readiness score
      const readinessInput = {
        samRegistrationStatus: formData.samRegistrationStatus,
        uei: formData.uei,
        cageCode: formData.cageCode,
        naicsCodes: formData.naicsCodes,
        certifications: formData.certifications.map((c) => ({
          type: c.type,
          isActive: c.isActive,
        })),
        pastPerformanceCount: formData.pastPerformance.length,
        gsaScheduleHolder: formData.gsaScheduleHolder,
      };

      const calculatedReadinessScore = calculateReadinessScore(readinessInput);
      setReadinessScore(calculatedReadinessScore);

      // Determine membership tier
      const tierCriteria = {
        profileCompleteness: 95, // Will be calculated based on completed fields
        readinessScore: calculatedReadinessScore.overallScore,
        engagementScore: 50, // Initial score
        pastPerformanceCount: formData.pastPerformance.length,
        federalCertifications: formData.certifications.filter((c) =>
          ["8a", "wosb", "sdvosb", "hubzone"].includes(c.type)
        ).length,
      };

      const tierAssignment = determineMembershipTier(tierCriteria);

      // Create E2G alignment
      const e2gAlignment: E2GAlignment = {
        partnerId: profile.id,
        targetRegions: formData.statesServed.length > 0 ? (formData.statesServed as E2GRegion[]) : ["all"],
        ruralDeploymentExperience: formData.ruralDeploymentExperience,
        ruralRegionsServed: formData.statesServed,
        pillarCapabilities: formData.pillars.map((pillar) => ({
          pillar,
          capabilityLevel: "intermediate",
          relevantProjects: 0,
        })),
        hubZoneCertified: formData.certifications.some((c) => c.type === "hubzone" && c.isActive),
        communityRelationshipStrength: 50, // Initial score
        ruralManufacturingSpecialization: formData.manufacturingFocus,
        e2gReadinessScore: 50, // Will be calculated
        lastAssessed: Timestamp.now(),
      };

      // Save comprehensive profile
      await setDoc(consortiumProfileRef, {
        id: profile.id,
        userId: profile.id,
        onboardingTracking: {
          partnerId: profile.id,
          currentStage: "matching_activation",
          status: "profile_complete",
          stageProgress: {
            discovery_intake: { status: "completed" },
            account_creation: { status: "completed" },
            profile_build: { status: "completed" },
            readiness_validation: { status: "completed" },
            matching_activation: { status: "in_progress" },
            engagement_tracking: { status: "not_started" },
          },
          referralSource: formData.referralSource,
          referralDetails: formData.referralDetails,
          initialContact: {
            date: Timestamp.now(),
            method: "web_signup",
            details: "KDM Consortium Member signup",
          },
          welcomeSequence: {
            sent: false,
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        companyIdentity: {
          legalCompanyName: formData.legalCompanyName,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
          companyDescription: formData.companyDescription,
          ceoBiography: formData.ceoBiography,
          companyLogo: formData.companyLogo,
          yearsInBusiness: formData.yearsInBusiness,
          annualRevenueRange: formData.annualRevenueRange,
          employeeCountRange: formData.employeeCountRange,
          website: formData.website,
          dunsNumber: formData.dunsNumber,
        },
        naicsCodes: formData.naicsCodes.map((code) => ({
          code,
          description: code,
          isPrimary: formData.naicsCodes.indexOf(code) === 0,
        })),
        certifications: formData.certifications,
        capabilities: formData.capabilities,
        pastPerformance: formData.pastPerformance,
        governmentContractingProfile: {
          cageCode: formData.cageCode,
          uei: formData.uei,
          samRegistrationStatus: formData.samRegistrationStatus,
          gsaScheduleHolder: formData.gsaScheduleHolder,
          gsaScheduleNumbers: formData.gsaScheduleNumbers ? [formData.gsaScheduleNumbers] : [],
          preferredContractTypes: formData.preferredContractTypes,
          contractSizePreferences: formData.contractSizePreferences,
          pastFederalContracts: formData.pastPerformance.length,
        },
        geographicCoverage: {
          statesServed: formData.statesServed,
          regionsServed: [],
          geographicServiceArea: formData.statesServed.join(", "),
          willingToDeployToRural: formData.willingToDeployToRural,
          ruralDeploymentExperience: formData.ruralDeploymentExperience,
          ruralRegionsServed: formData.statesServed,
        },
        teamingPreferences: {
          willingToPrime: formData.willingToPrime,
          willingToSub: formData.willingToSub,
          seekingPartners: formData.seekingPartners,
          idealPartnerProfile: formData.idealPartnerProfile,
          contractSizePreferences: [formData.contractSizePreferences],
          setAsidePreferences: formData.certifications.map((c) => c.type),
          teamingRolePreferences: [],
        },
        consortiumPillarAlignment: {
          pillars: formData.pillars,
          marketplaceSellerProfile: formData.primaryServiceCategories,
          primaryServiceCategories: [formData.primaryServiceCategories],
          e2gFocus: formData.e2gFocus,
          ruralFocus: formData.ruralFocus,
          manufacturingFocus: formData.manufacturingFocus,
        },
        readinessScore: calculatedReadinessScore,
        membershipTier: {
          tier: tierAssignment.recommendedTier,
          assignedAt: Timestamp.now(),
          assignmentReason: tierAssignment.reasons.join(", "),
          features: [],
          restrictions: [],
          upgradeEligible: tierAssignment.upgradeEligible,
          downgradeEligible: tierAssignment.downgradeEligible,
          autoRenew: true,
        },
        e2gAlignment,
        engagementMetrics: {
          profileCompleteness: 95,
          lastProfileUpdate: Timestamp.now(),
          marketplaceListingsCount: 0,
          opportunityWinRate: 0,
          meetingsAttended: 0,
          meetingsHosted: 0,
          teamingRequestsSent: 0,
          teamingRequestsReceived: 0,
          teamingRequestsAccepted: 0,
          proposalsSubmitted: 0,
          proposalsWon: 0,
          averageResponseTime: 0,
          activeEngagementScore: 50,
          connections: 0,
          calculatedAt: Timestamp.now(),
        },
        capabilityMatches: [],
        teamingMatches: [],
        e2gAlignmentMatches: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastActive: Timestamp.now(),
      });

      // Update user profile
      const userRef = doc(db, "users", profile.id);
      await updateDoc(userRef, {
        profileComplete: true,
        onboardingStatus: "profile_complete",
        onboardingType: "consortium_member",
        onboardingStartedAt: Timestamp.now(),
        onboardingCompletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success("Profile completed successfully!", {
        description: `Your Government Contracting Readiness Score is ${calculatedReadinessScore.overallScore}/100`,
      });

      setIsOpen(false);
      router.push("/portal/consortium/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to save your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Stage 1: Discovery & Intake
  const renderDiscoveryStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Welcome to the KDM Consortium Intelligence Platform</h3>
        <p className="text-muted-foreground">
          Join a technology-enabled ecosystem for building qualified teams and winning federal contracts.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="referralSource">How did you hear about us? *</Label>
          <Select
            value={formData.referralSource}
            onValueChange={(value) => updateFormData("referralSource", value as ReferralSource)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select referral source" />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCES.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referralDetails">Additional Details (Optional)</Label>
          <Textarea
            id="referralDetails"
            value={formData.referralDetails}
            onChange={(e) => updateFormData("referralDetails", e.target.value)}
            placeholder="Please provide any additional context..."
            rows={3}
          />
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium">What happens next:</p>
        <ul className="text-sm space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>Complete your comprehensive company profile</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>Receive your Government Contracting Readiness Score</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>Get AI-powered opportunity and teaming matches</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <span>Access the consortium marketplace and directory</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Stage 3: Company Identity
  const renderCompanyIdentityStage = () => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Information
          </h4>

          <div className="space-y-2">
            <Label htmlFor="legalCompanyName">Legal Company Name *</Label>
            <Input
              id="legalCompanyName"
              value={formData.legalCompanyName}
              onChange={(e) => updateFormData("legalCompanyName", e.target.value)}
              placeholder="Acme Manufacturing Inc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business *</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                value={formData.yearsInBusiness || ""}
                onChange={(e) => updateFormData("yearsInBusiness", parseInt(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCountRange">Employee Count *</Label>
              <Select
                value={formData.employeeCountRange}
                onValueChange={(value) => updateFormData("employeeCountRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualRevenueRange">Annual Revenue Range *</Label>
            <Select
              value={formData.annualRevenueRange}
              onValueChange={(value) => updateFormData("annualRevenueRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="ceoBiography">CEO Biography</Label>
            <Textarea
              id="ceoBiography"
              value={formData.ceoBiography}
              onChange={(e) => updateFormData("ceoBiography", e.target.value)}
              placeholder="Tell us about your CEO's background and expertise..."
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address Information
          </h4>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => updateFormData("street", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                placeholder="Baltimore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
                placeholder="MD"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => updateFormData("zip", e.target.value)}
                placeholder="21201"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Online Presence
          </h4>

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
            <Label htmlFor="dunsNumber">DUNS Number</Label>
            <Input
              id="dunsNumber"
              value={formData.dunsNumber}
              onChange={(e) => updateFormData("dunsNumber", e.target.value)}
              placeholder="123456789"
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  // Stage 3: Industry Classification & Certifications
  const renderIndustryCertificationsStage = () => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            NAICS Codes (Up to 5)
          </h4>

          <div className="flex gap-2 flex-wrap">
            {formData.naicsCodes.map((code) => (
              <Badge key={code} variant="secondary" className="gap-1">
                {code}
                <button
                  onClick={() => {
                    updateFormData(
                      "naicsCodes",
                      formData.naicsCodes.filter((c) => c !== code)
                    );
                  }}
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
              disabled={formData.naicsCodes.length >= 5}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value && !formData.naicsCodes.includes(value) && formData.naicsCodes.length < 5) {
                    updateFormData("naicsCodes", [...formData.naicsCodes, value]);
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

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications & Set-Asides
          </h4>

          <div className="grid grid-cols-2 gap-2">
            {CERTIFICATION_OPTIONS.map((cert) => (
              <div key={cert.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cert.id}
                  checked={formData.certifications.some((c) => c.type === cert.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData("certifications", [
                        ...formData.certifications,
                        {
                          type: cert.id,
                          certificationNumber: "",
                          issuingAgency: "",
                          isActive: true,
                        },
                      ]);
                    } else {
                      updateFormData(
                        "certifications",
                        formData.certifications.filter((c) => c.type !== cert.id)
                      );
                    }
                  }}
                />
                <Label htmlFor={cert.id} className="text-sm font-normal cursor-pointer">
                  {cert.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  // Stage 3: Government Contracting Profile
  const renderGovernmentContractingStage = () => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Government Contracting Profile
          </h4>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                This information will be used to calculate your Government Contracting Readiness Score.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="samRegistrationStatus">SAM.gov Registration Status *</Label>
            <Select
              value={formData.samRegistrationStatus}
              onValueChange={(value) => updateFormData("samRegistrationStatus", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_registered">Not Registered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uei">Unique Entity ID (UEI)</Label>
              <Input
                id="uei"
                value={formData.uei}
                onChange={(e) => updateFormData("uei", e.target.value)}
                placeholder="12-character UEI"
                maxLength={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cageCode">CAGE Code</Label>
              <Input
                id="cageCode"
                value={formData.cageCode}
                onChange={(e) => updateFormData("cageCode", e.target.value)}
                placeholder="5-character CAGE code"
                maxLength={5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gsaScheduleHolder"
                checked={formData.gsaScheduleHolder}
                onCheckedChange={(checked) => updateFormData("gsaScheduleHolder", checked as boolean)}
              />
              <Label htmlFor="gsaScheduleHolder" className="cursor-pointer">
                GSA Schedule Holder
              </Label>
            </div>
          </div>

          {formData.gsaScheduleHolder && (
            <div className="space-y-2">
              <Label htmlFor="gsaScheduleNumbers">GSA Schedule Numbers</Label>
              <Input
                id="gsaScheduleNumbers"
                value={formData.gsaScheduleNumbers}
                onChange={(e) => updateFormData("gsaScheduleNumbers", e.target.value)}
                placeholder="GS-00F-1234"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Preferred Contract Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {CONTRACT_TYPE_OPTIONS.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={formData.preferredContractTypes.includes(type.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("preferredContractTypes", [...formData.preferredContractTypes, type.id]);
                      } else {
                        updateFormData(
                          "preferredContractTypes",
                          formData.preferredContractTypes.filter((t) => t !== type.id)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={type.id} className="text-sm font-normal cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractSizePreferences">Contract Size Preferences</Label>
            <Select
              value={formData.contractSizePreferences}
              onValueChange={(value) => updateFormData("contractSizePreferences", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$0-100K">$0-100K</SelectItem>
                <SelectItem value="$100K-500K">$100K-500K</SelectItem>
                <SelectItem value="$500K-1M">$500K-1M</SelectItem>
                <SelectItem value="$1M-5M">$1M-5M</SelectItem>
                <SelectItem value="$5M+">$5M+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  // Stage 3: Geographic Coverage & Teaming Preferences
  const renderGeographicTeamingStage = () => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Geographic Coverage
          </h4>

          <div className="space-y-2">
            <Label>States Served (E2G Target Regions)</Label>
            <div className="grid grid-cols-2 gap-2">
              {E2G_REGION_OPTIONS.map((region) => (
                <div key={region.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={region.id}
                    checked={formData.statesServed.includes(region.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("statesServed", [...formData.statesServed, region.id]);
                      } else {
                        updateFormData("statesServed", formData.statesServed.filter((s) => s !== region.id));
                      }
                    }}
                  />
                  <Label htmlFor={region.id} className="text-sm font-normal cursor-pointer">
                    {region.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="willingToDeployToRural"
                checked={formData.willingToDeployToRural}
                onCheckedChange={(checked) => updateFormData("willingToDeployToRural", checked as boolean)}
              />
              <Label htmlFor="willingToDeployToRural" className="cursor-pointer">
                Willing to deploy to rural/remote locations
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ruralDeploymentExperience"
                checked={formData.ruralDeploymentExperience}
                onCheckedChange={(checked) => updateFormData("ruralDeploymentExperience", checked as boolean)}
              />
              <Label htmlFor="ruralDeploymentExperience" className="cursor-pointer">
                Have rural deployment experience
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Handshake className="w-4 h-4" />
            Teaming Preferences
          </h4>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="willingToPrime"
                checked={formData.willingToPrime}
                onCheckedChange={(checked) => updateFormData("willingToPrime", checked as boolean)}
              />
              <Label htmlFor="willingToPrime" className="cursor-pointer">
                Willing to Prime
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="willingToSub"
                checked={formData.willingToSub}
                onCheckedChange={(checked) => updateFormData("willingToSub", checked as boolean)}
              />
              <Label htmlFor="willingToSub" className="cursor-pointer">
                Willing to Subcontract
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="seekingPartners"
                checked={formData.seekingPartners}
                onCheckedChange={(checked) => updateFormData("seekingPartners", checked as boolean)}
              />
              <Label htmlFor="seekingPartners" className="cursor-pointer">
                Actively seeking teaming partners
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idealPartnerProfile">Ideal Partner Profile</Label>
            <Textarea
              id="idealPartnerProfile"
              value={formData.idealPartnerProfile}
              onChange={(e) => updateFormData("idealPartnerProfile", e.target.value)}
              placeholder="Describe your ideal teaming partner..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  // Stage 3: Consortium Pillar Alignment
  const renderPillarAlignmentStage = () => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" />
            E2G Pillar Alignment
          </h4>

          <p className="text-sm text-muted-foreground">
            Select which E2G strategic pillars your organization serves:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {E2G_PILLAR_OPTIONS.map((pillar) => {
              const Icon = pillar.icon;
              const selected = formData.pillars.includes(pillar.id);
              return (
                <button
                  key={pillar.id}
                  onClick={() => {
                    if (selected) {
                      updateFormData("pillars", formData.pillars.filter((p) => p !== pillar.id));
                    } else {
                      updateFormData("pillars", [...formData.pillars, pillar.id]);
                    }
                  }}
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

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Service Categories
          </h4>

          <div className="space-y-2">
            <Label htmlFor="primaryServiceCategories">Primary Service Categories</Label>
            <Textarea
              id="primaryServiceCategories"
              value={formData.primaryServiceCategories}
              onChange={(e) => updateFormData("primaryServiceCategories", e.target.value)}
              placeholder="Describe your primary service offerings..."
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Specialization Focus
          </h4>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="e2gFocus"
                checked={formData.e2gFocus}
                onCheckedChange={(checked) => updateFormData("e2gFocus", checked as boolean)}
              />
              <Label htmlFor="e2gFocus" className="cursor-pointer">
                E2G Initiative Focus
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ruralFocus"
                checked={formData.ruralFocus}
                onCheckedChange={(checked) => updateFormData("ruralFocus", checked as boolean)}
              />
              <Label htmlFor="ruralFocus" className="cursor-pointer">
                Rural Manufacturing Focus
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="manufacturingFocus"
                checked={formData.manufacturingFocus}
                onCheckedChange={(checked) => updateFormData("manufacturingFocus", checked as boolean)}
              />
              <Label htmlFor="manufacturingFocus" className="cursor-pointer">
                Manufacturing Specialization
              </Label>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  // Render current stage
  const renderStage = () => {
    switch (currentStage) {
      case "discovery_intake":
        return renderDiscoveryStage();
      case "profile_build":
        // Multi-step within profile build
        switch (currentStep) {
          case 0:
            return renderCompanyIdentityStage();
          case 1:
            return renderIndustryCertificationsStage();
          case 2:
            return renderGovernmentContractingStage();
          case 3:
            return renderGeographicTeamingStage();
          case 4:
            return renderPillarAlignmentStage();
          default:
            return null;
        }
      default:
        return null;
    }
  };

  // Stage steps
  const getStageSteps = () => {
    switch (currentStage) {
      case "discovery_intake":
        return [{ id: "discovery", title: "Discovery", description: "Tell us how you found us" }];
      case "profile_build":
        return [
          { id: "company", title: "Company Identity", description: "Your company details" },
          { id: "industry", title: "Industry & Certifications", description: "NAICS codes and certifications" },
          { id: "government", title: "Government Contracting", description: "SAM.gov and contracting profile" },
          { id: "geographic", title: "Geographic & Teaming", description: "Coverage and teaming preferences" },
          { id: "pillars", title: "Pillar Alignment", description: "E2G strategic pillars" },
        ];
      default:
        return [];
    }
  };

  const steps = getStageSteps();

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl" showCloseButton={false}>
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
          <DialogTitle>{steps[currentStep]?.title}</DialogTitle>
          <DialogDescription>{steps[currentStep]?.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderStage()}</div>

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
                  Saving Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
