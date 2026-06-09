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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Upload,
  X,
  Award,
  Target,
  MapPin,
  Handshake,
  DollarSign,
  Users,
  FileText,
  Globe,
  Briefcase,
  Star,
} from "lucide-react";

const REVENUE_RANGES = [
  "$0-1M",
  "$1M-5M",
  "$5M-10M",
  "$10M-25M",
  "$25M-50M",
  "$50M-100M",
  "$100M+",
];

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-100",
  "101-250",
  "251-500",
  "500+",
];

const CONTRACT_TYPES = [
  "fixed-price",
  "cost-plus",
  "time-and-materials",
] as const;

const CONTRACT_SIZES = [
  "$0-100K",
  "$100K-500K",
  "$500K-1M",
  "$1M-5M",
  "$5M-10M",
  "$10M+",
];

const SET_ASIDES = [
  "8(a)",
  "WOSB",
  "SDVOSB",
  "HUBZone",
  "None",
];

const PILLARS = [
  { id: "manufacturing", label: "Advanced Manufacturing", icon: Briefcase },
  { id: "cybersecurity", label: "Cybersecurity & CMMC", icon: Award },
  { id: "logistics", label: "Logistics & Supply Chain", icon: Globe },
  { id: "consulting", label: "Professional Services", icon: Users },
  { id: "technology", label: "Technology & Innovation", icon: Target },
];

interface CompanyIntelligenceData {
  // Basic Company Information
  legalCompanyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  companyDescription: string;
  ceoBiography: string;
  companyLogo?: string;
  yearsInBusiness: number;
  annualRevenueRange: string;
  employeeCountRange: string;
  
  // NAICS Codes
  primaryNaicsCodes: string[];
  
  // Certifications and Designations
  federalDesignations: {
    eightA: boolean;
    wosb: boolean;
    sdvosb: boolean;
    hubzone: boolean;
    mbe: boolean;
    otherDesignations: string[];
  };
  certifications: {
    cmmcLevel?: string;
    isoCertifications: string[];
    otherCertifications: string[];
  };
  
  // Technical Expertise
  technicalExpertise: string[];
  serviceOfferings: string[];
  technologySpecializations: string[];
  industryFocusAreas: string[];
  
  // Past Performance
  notableContracts: Array<{
    contractTitle: string;
    client: string;
    description: string;
    value?: number;
    outcomes: string[];
  }>;
  clientReferences: string[];
  keyDifferentiators: string[];
  
  // Government Contracting Details
  cageCode?: string;
  uei?: string;
  samRegistrationStatus: "active" | "inactive" | "pending";
  gsaScheduleHolder: boolean;
  gsaScheduleNumbers: string[];
  preferredContractTypes: string[];
  
  // Geographic Service Area
  statesServed: string[];
  regionsServed: string[];
  geographicServiceArea: string;
  willingToDeployRural: boolean;
  willingToDeployRemote: boolean;
  
  // Partnership Preferences
  willingToPrime: boolean;
  willingToSub: boolean;
  seekingPartners: boolean;
  idealPartnerProfile: string;
  contractSizePreferences: string[];
  setAsidePreferences: string[];
  
  // Consortium and Marketplace
  consortiumPillarsServed: string[];
  marketplaceSellerEnabled: boolean;
  primaryServiceCategories: string[];
}

export function CompanyIntelligenceWizard() {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [teamMemberId, setTeamMemberId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CompanyIntelligenceData>({
    legalCompanyName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    companyDescription: "",
    ceoBiography: "",
    companyLogo: "",
    yearsInBusiness: 0,
    annualRevenueRange: "",
    employeeCountRange: "",
    primaryNaicsCodes: [],
    federalDesignations: {
      eightA: false,
      wosb: false,
      sdvosb: false,
      hubzone: false,
      mbe: false,
      otherDesignations: [],
    },
    certifications: {
      cmmcLevel: "",
      isoCertifications: [],
      otherCertifications: [],
    },
    technicalExpertise: [],
    serviceOfferings: [],
    technologySpecializations: [],
    industryFocusAreas: [],
    notableContracts: [],
    clientReferences: [],
    keyDifferentiators: [],
    cageCode: "",
    uei: "",
    samRegistrationStatus: "pending",
    gsaScheduleHolder: false,
    gsaScheduleNumbers: [],
    preferredContractTypes: [],
    statesServed: [],
    regionsServed: [],
    geographicServiceArea: "",
    willingToDeployRural: false,
    willingToDeployRemote: false,
    willingToPrime: false,
    willingToSub: false,
    seekingPartners: false,
    idealPartnerProfile: "",
    contractSizePreferences: [],
    setAsidePreferences: [],
    consortiumPillarsServed: [],
    marketplaceSellerEnabled: false,
    primaryServiceCategories: [],
  });

  const [tempInput, setTempInput] = useState("");

  // Check if user needs to complete company intelligence
  useEffect(() => {
    const checkCompanyIntelligenceStatus = async () => {
      if (!db || !profile.email) return;

      try {
        // Check if user is a consortium member
        const isConsortiumMember = profile.svpRole === "consortium_member";
        if (!isConsortiumMember) return;

        // Get team member document
        const teamMembersQuery = await getDoc(
          doc(db, COLLECTIONS.TEAM_MEMBERS, profile.id)
        );

        if (teamMembersQuery.exists()) {
          const teamMemberData = teamMembersQuery.data();
          setTeamMemberId(profile.id);

          // Check if company intelligence is missing or incomplete
          const hasCompanyIntelligence = teamMemberData.companyIntelligence;
          const isComplete = hasCompanyIntelligence && 
            hasCompanyIntelligence.legalCompanyName &&
            hasCompanyIntelligence.address &&
            hasCompanyIntelligence.city &&
            hasCompanyIntelligence.state &&
            hasCompanyIntelligence.zip &&
            hasCompanyIntelligence.companyDescription &&
            hasCompanyIntelligence.primaryNaicsCodes?.length > 0;

          // Show wizard if incomplete
          if (!isComplete) {
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("Error checking company intelligence status:", error);
      }
    };

    checkCompanyIntelligenceStatus();
  }, [db, profile.email, profile.id, profile.svpRole]);

  const toggleArrayItem = (field: keyof CompanyIntelligenceData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter((i) => i !== value) : [...current, value],
      };
    });
  };

  const addArrayItem = (field: keyof CompanyIntelligenceData, value: string) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()],
    }));
    setTempInput("");
  };

  const removeArrayItem = (field: keyof CompanyIntelligenceData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((i) => i !== value),
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!db || !teamMemberId) return;

    setLoading(true);
    try {
      const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberId);
      
      await updateDoc(teamMemberRef, {
        companyIntelligence: {
          ...formData,
          samRegistration: {
            status: formData.samRegistrationStatus,
          },
          gsaSchedule: {
            isHolder: formData.gsaScheduleHolder,
            scheduleNumbers: formData.gsaScheduleNumbers,
          },
          marketplaceSellerProfile: {
            enabled: formData.marketplaceSellerEnabled,
            primaryServiceCategories: formData.primaryServiceCategories,
          },
        },
        updatedAt: Timestamp.now(),
      });

      toast.success("Company Intelligence saved successfully!");
      setIsOpen(false);
      router.push("/portal/consortium/dashboard");
    } catch (error) {
      console.error("Error saving company intelligence:", error);
      toast.error("Failed to save company intelligence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "basic", title: "Basic Information", description: "Company details and profile" },
    { id: "naics", title: "NAICS Codes", description: "Industry classification" },
    { id: "certifications", title: "Certifications", description: "Federal designations and certifications" },
    { id: "expertise", title: "Technical Expertise", description: "Capabilities and focus areas" },
    { id: "performance", title: "Past Performance", description: "Contracts and references" },
    { id: "government", title: "Government Contracting", description: "SAM, GSA, and contract details" },
    { id: "geographic", title: "Geographic Service", description: "Service area and deployment" },
    { id: "partnership", title: "Partnership Preferences", description: "Collaboration preferences" },
    { id: "consortium", title: "Consortium & Marketplace", description: "Pillars and marketplace setup" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalCompanyName">Legal Company Name *</Label>
                  <Input
                    id="legalCompanyName"
                    value={formData.legalCompanyName}
                    onChange={(e) => setFormData({ ...formData, legalCompanyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    value={formData.yearsInBusiness || ""}
                    onChange={(e) => setFormData({ ...formData, yearsInBusiness: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP *</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description (Public Pitch) *</Label>
                <Textarea
                  id="companyDescription"
                  rows={3}
                  value={formData.companyDescription}
                  onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  placeholder="Describe your company for public view..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ceoBiography">CEO Biography *</Label>
                <Textarea
                  id="ceoBiography"
                  rows={3}
                  value={formData.ceoBiography}
                  onChange={(e) => setFormData({ ...formData, ceoBiography: e.target.value })}
                  placeholder="Brief biography of the CEO..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualRevenueRange">Annual Revenue Range *</Label>
                  <select
                    id="annualRevenueRange"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.annualRevenueRange}
                    onChange={(e) => setFormData({ ...formData, annualRevenueRange: e.target.value })}
                  >
                    <option value="">Select range</option>
                    {REVENUE_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeCountRange">Employee Count Range *</Label>
                  <select
                    id="employeeCountRange"
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.employeeCountRange}
                    onChange={(e) => setFormData({ ...formData, employeeCountRange: e.target.value })}
                  >
                    <option value="">Select range</option>
                    {EMPLOYEE_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-sm text-muted-foreground">Recommended: 400x400px</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      case 1:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Primary NAICS Codes (up to 5) *</Label>
                <p className="text-sm text-muted-foreground">
                  Select up to 5 NAICS codes that best describe your business
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter NAICS code (e.g., 332710)"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (formData.primaryNaicsCodes.length < 5) {
                          addArrayItem("primaryNaicsCodes", tempInput);
                        } else {
                          toast.error("Maximum of 5 NAICS codes reached");
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (formData.primaryNaicsCodes.length < 5) {
                        addArrayItem("primaryNaicsCodes", tempInput);
                      } else {
                        toast.error("Maximum of 5 NAICS codes reached");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                {formData.primaryNaicsCodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.primaryNaicsCodes.map((code) => (
                      <Badge key={code} variant="secondary" className="text-sm">
                        {code}
                        <button
                          onClick={() => removeArrayItem("primaryNaicsCodes", code)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {formData.primaryNaicsCodes.length >= 5 && (
                  <p className="text-sm text-amber-600">
                    Maximum of 5 NAICS codes reached
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        );

      case 2:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Federal Designations</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "eightA", label: "8(a) Certified" },
                    { key: "wosb", label: "WOSB Certified" },
                    { key: "sdvosb", label: "SDVOSB Certified" },
                    { key: "hubzone", label: "HUBZone Certified" },
                    { key: "mbe", label: "MBE Certified" },
                  ].map((designation) => (
                    <div key={designation.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={designation.key}
                        checked={formData.federalDesignations[designation.key as keyof typeof formData.federalDesignations] as boolean}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            federalDesignations: {
                              ...formData.federalDesignations,
                              [designation.key]: checked,
                            },
                          });
                        }}
                      />
                      <Label htmlFor={designation.key} className="text-sm font-normal cursor-pointer">
                        {designation.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>CMMC Level</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.certifications.cmmcLevel || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    certifications: {
                      ...formData.certifications,
                      cmmcLevel: e.target.value,
                    },
                  })}
                >
                  <option value="">Select CMMC Level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label>ISO Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., ISO 9001, ISO 27001"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("certifications.isoCertifications" as any, tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("certifications.isoCertifications" as any, tempInput)}>
                    Add
                  </Button>
                </div>
                {formData.certifications.isoCertifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.isoCertifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-sm">
                        {cert}
                        <button
                          onClick={() => removeArrayItem("certifications.isoCertifications" as any, cert)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Other Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Other certifications"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("certifications.otherCertifications" as any, tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("certifications.otherCertifications" as any, tempInput)}>
                    Add
                  </Button>
                </div>
                {formData.certifications.otherCertifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.otherCertifications.map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-sm">
                        {cert}
                        <button
                          onClick={() => removeArrayItem("certifications.otherCertifications" as any, cert)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        );

      case 3:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Technical Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Areas of technical expertise"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("technicalExpertise", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("technicalExpertise", tempInput)}>Add</Button>
                </div>
                {formData.technicalExpertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technicalExpertise.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                        <button onClick={() => removeArrayItem("technicalExpertise", item)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Service Offerings</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Services you offer"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("serviceOfferings", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("serviceOfferings", tempInput)}>Add</Button>
                </div>
                {formData.serviceOfferings.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.serviceOfferings.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                        <button onClick={() => removeArrayItem("serviceOfferings", item)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Technology Specializations</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Technology specializations"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("technologySpecializations", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("technologySpecializations", tempInput)}>Add</Button>
                </div>
                {formData.technologySpecializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologySpecializations.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                        <button onClick={() => removeArrayItem("technologySpecializations", item)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Industry Focus Areas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Industry focus areas"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("industryFocusAreas", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("industryFocusAreas", tempInput)}>Add</Button>
                </div>
                {formData.industryFocusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.industryFocusAreas.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                        <button onClick={() => removeArrayItem("industryFocusAreas", item)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        );

      case 4:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Key Differentiators</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="What makes your company unique?"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("keyDifferentiators", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("keyDifferentiators", tempInput)}>Add</Button>
                </div>
                {formData.keyDifferentiators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keyDifferentiators.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                        <button onClick={() => removeArrayItem("keyDifferentiators", item)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Client References</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Client names or organizations"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("clientReferences", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("clientReferences", tempInput)}>Add</Button>
                </div>
                {formData.clientReferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.clientReferences.map((item) => (
                      <Badge key={item} variant="secondary" className="text-sm">
                        {item}
                        <button onClick={() => removeArrayItem("clientReferences", item)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Notable Contracts</Label>
                <p className="text-sm text-muted-foreground">Add your most significant government contracts</p>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Contract
                </Button>
              </div>
            </div>
          </ScrollArea>
        );

      case 5:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cageCode">CAGE Code</Label>
                  <Input
                    id="cageCode"
                    value={formData.cageCode}
                    onChange={(e) => setFormData({ ...formData, cageCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uei">UEI (Unique Entity ID)</Label>
                  <Input
                    id="uei"
                    value={formData.uei}
                    onChange={(e) => setFormData({ ...formData, uei: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="samRegistrationStatus">SAM.gov Registration Status</Label>
                <select
                  id="samRegistrationStatus"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.samRegistrationStatus}
                  onChange={(e) => setFormData({ ...formData, samRegistrationStatus: e.target.value as any })}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label>GSA Schedule Holder</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gsaScheduleHolder"
                    checked={formData.gsaScheduleHolder}
                    onCheckedChange={(checked) => setFormData({ ...formData, gsaScheduleHolder: checked as boolean })}
                  />
                  <Label htmlFor="gsaScheduleHolder" className="text-sm font-normal cursor-pointer">
                    We are a GSA Schedule holder
                  </Label>
                </div>
                {formData.gsaScheduleHolder && (
                  <div className="mt-2">
                    <Input
                      placeholder="GSA Schedule numbers (comma-separated)"
                      value={formData.gsaScheduleNumbers.join(", ")}
                      onChange={(e) => setFormData({
                        ...formData,
                        gsaScheduleNumbers: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Preferred Contract Types</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTRACT_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`contract-${type}`}
                        checked={formData.preferredContractTypes.includes(type)}
                        onCheckedChange={() => toggleArrayItem("preferredContractTypes", type)}
                      />
                      <Label htmlFor={`contract-${type}`} className="text-sm font-normal cursor-pointer capitalize">
                        {type.replace("-", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      case 6:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>States Served</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="State abbreviations (e.g., VA, MD, DC)"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("statesServed", tempInput.toUpperCase());
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("statesServed", tempInput.toUpperCase())}>Add</Button>
                </div>
                {formData.statesServed.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.statesServed.map((state) => (
                      <Badge key={state} variant="secondary" className="text-sm">
                        {state}
                        <button onClick={() => removeArrayItem("statesServed", state)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Regions Served</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Regions (e.g., Northeast, Mid-Atlantic)"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("regionsServed", tempInput);
                      }
                    }}
                  />
                  <Button onClick={() => addArrayItem("regionsServed", tempInput)}>Add</Button>
                </div>
                {formData.regionsServed.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.regionsServed.map((region) => (
                      <Badge key={region} variant="secondary" className="text-sm">
                        {region}
                        <button onClick={() => removeArrayItem("regionsServed", region)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="geographicServiceArea">Geographic Service Area Description</Label>
                <Textarea
                  id="geographicServiceArea"
                  rows={2}
                  value={formData.geographicServiceArea}
                  onChange={(e) => setFormData({ ...formData, geographicServiceArea: e.target.value })}
                  placeholder="Describe your overall service area..."
                />
              </div>

              <div className="space-y-3">
                <Label>Deployment Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rural"
                      checked={formData.willingToDeployRural}
                      onCheckedChange={(checked) => setFormData({ ...formData, willingToDeployRural: checked as boolean })}
                    />
                    <Label htmlFor="rural" className="text-sm font-normal cursor-pointer">
                      Willing to deploy to rural locations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={formData.willingToDeployRemote}
                      onCheckedChange={(checked) => setFormData({ ...formData, willingToDeployRemote: checked as boolean })}
                    />
                    <Label htmlFor="remote" className="text-sm font-normal cursor-pointer">
                      Willing to deploy to remote locations
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      case 7:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Partnership Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prime"
                      checked={formData.willingToPrime}
                      onCheckedChange={(checked) => setFormData({ ...formData, willingToPrime: checked as boolean })}
                    />
                    <Label htmlFor="prime" className="text-sm font-normal cursor-pointer">
                      Willing to serve as Prime Contractor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sub"
                      checked={formData.willingToSub}
                      onCheckedChange={(checked) => setFormData({ ...formData, willingToSub: checked as boolean })}
                    />
                    <Label htmlFor="sub" className="text-sm font-normal cursor-pointer">
                      Willing to serve as Subcontractor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seeking"
                      checked={formData.seekingPartners}
                      onCheckedChange={(checked) => setFormData({ ...formData, seekingPartners: checked as boolean })}
                    />
                    <Label htmlFor="seeking" className="text-sm font-normal cursor-pointer">
                      Actively seeking partners
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idealPartnerProfile">Ideal Partner Profile</Label>
                <Textarea
                  id="idealPartnerProfile"
                  rows={3}
                  value={formData.idealPartnerProfile}
                  onChange={(e) => setFormData({ ...formData, idealPartnerProfile: e.target.value })}
                  placeholder="Describe your ideal partner..."
                />
              </div>

              <div className="space-y-3">
                <Label>Contract Size Preferences</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTRACT_SIZES.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={formData.contractSizePreferences.includes(size)}
                        onCheckedChange={() => toggleArrayItem("contractSizePreferences", size)}
                      />
                      <Label htmlFor={`size-${size}`} className="text-sm font-normal cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Set-Aside Preferences</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SET_ASIDES.map((setAside) => (
                    <div key={setAside} className="flex items-center space-x-2">
                      <Checkbox
                        id={`setaside-${setAside}`}
                        checked={formData.setAsidePreferences.includes(setAside)}
                        onCheckedChange={() => toggleArrayItem("setAsidePreferences", setAside)}
                      />
                      <Label htmlFor={`setaside-${setAside}`} className="text-sm font-normal cursor-pointer">
                        {setAside}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        );

      case 8:
        return (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>KDM Consortium Pillars Served</Label>
                <p className="text-sm text-muted-foreground">Select which strategic pillars your organization serves</p>
                <div className="grid grid-cols-1 gap-2">
                  {PILLARS.map((pillar) => {
                    const Icon = pillar.icon;
                    const selected = formData.consortiumPillarsServed.includes(pillar.id);
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => toggleArrayItem("consortiumPillarsServed", pillar.id)}
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

              <div className="space-y-3">
                <Label>Marketplace Seller Profile</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketplaceEnabled"
                    checked={formData.marketplaceSellerEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, marketplaceSellerEnabled: checked as boolean })}
                  />
                  <Label htmlFor="marketplaceEnabled" className="text-sm font-normal cursor-pointer">
                    Enable marketplace seller profile
                  </Label>
                </div>
                {formData.marketplaceSellerEnabled && (
                  <div className="mt-2">
                    <Label>Primary Service Categories</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Service categories"
                        value={tempInput}
                        onChange={(e) => setTempInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addArrayItem("primaryServiceCategories", tempInput);
                          }
                        }}
                      />
                      <Button onClick={() => addArrayItem("primaryServiceCategories", tempInput)}>Add</Button>
                    </div>
                    {formData.primaryServiceCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.primaryServiceCategories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-sm">
                            {category}
                            <button onClick={() => removeArrayItem("primaryServiceCategories", category)} className="ml-2 hover:text-red-600">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Company Intelligence</DialogTitle>
          <DialogDescription>
            Complete your company profile for better opportunity matching
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between flex-shrink-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium flex-shrink-0 ${
                    index <= currentStep
                      ? "bg-amber-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="w-3 h-3" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${
                      index < currentStep ? "bg-amber-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="flex-shrink-0">
            <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          {/* Step Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? "Saving..." : "Complete"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
