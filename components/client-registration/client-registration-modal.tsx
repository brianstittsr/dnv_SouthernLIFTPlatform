"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, User, Building2, Phone, DollarSign, Target, ClipboardList, CheckCircle, Upload, Camera } from "lucide-react";

type Step = "ownership" | "professional" | "company" | "business" | "strategy" | "review";

interface ClientRegistrationFormData {
  prefix: string; firstName: string; middleName: string; lastName: string;
  title: string; companyOwnerEthnicity: string; minorityBusinessCertification: string; linkedInUrl: string;
  companyName: string; streetAddress: string; streetAddress2: string; city: string; state: string; zipCode: string;
  mobilePhone: string; companyPhone: string; companyEmail: string; websiteUrl: string;
  samRegistration: string; cageCodes: string[]; dunsNumber: string; naicsCodes: string[];
  approximateAnnualRevenue: string; applyingAs: string; ableToWorkOutOfState: boolean;
  hasInHouseBDTeam: boolean; currentBusinessAcquisitionMethod: string; referredBy: string; howFoundKDMAssociates: string;
  openToTeamingArrangement: boolean; hasResourcesToInvest: boolean;
  helpNeededFromKDM: string; servicesInterestedIn: string[]; topCompanyNeed: string;
  interestedInCertifications: string[]; interestedInLoans: boolean; targetAgencies: string[];
  oemManufacturers: string[];
  kdmRepAssigned: string; notes: string;
}

interface ClientRegistrationModalProps {
  open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void;
  initialData?: Partial<ClientRegistrationFormData>; registrationId?: string; mode?: "create" | "edit";
}

const INITIAL_FORM_DATA: ClientRegistrationFormData = {
  prefix: "", firstName: "", middleName: "", lastName: "",
  title: "", companyOwnerEthnicity: "", minorityBusinessCertification: "", linkedInUrl: "",
  companyName: "", streetAddress: "", streetAddress2: "", city: "", state: "", zipCode: "",
  mobilePhone: "", companyPhone: "", companyEmail: "", websiteUrl: "",
  samRegistration: "", cageCodes: [], dunsNumber: "", naicsCodes: [],
  approximateAnnualRevenue: "", applyingAs: "prime_contractor", ableToWorkOutOfState: false,
  hasInHouseBDTeam: false, currentBusinessAcquisitionMethod: "", referredBy: "", howFoundKDMAssociates: "",
  openToTeamingArrangement: false, hasResourcesToInvest: false,
  helpNeededFromKDM: "", servicesInterestedIn: [], topCompanyNeed: "",
  interestedInCertifications: [], interestedInLoans: false, targetAgencies: [],
  oemManufacturers: [],
  kdmRepAssigned: "", notes: "",
};

const PREFIX_OPTIONS = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
const ETHNICITY_OPTIONS = ["Black or African American", "Hispanic or Latino", "Asian", "Native American or Alaska Native", "Native Hawaiian or Pacific Islander", "Multi-ethnic", "Other"];
const MINORITY_CERT_OPTIONS = ["8(a) Certified", "MBE Certified", "DBE Certified", "SBE Certified", "WBE Certified", "HUBZone Certified", "SDVOSB Certified", "VOSB Certified", "None", "In Process"];
const REVENUE_OPTIONS = ["Under $100K", "$100K - $500K", "$500K - $1M", "$1M - $5M", "$5M - $10M", "$10M - $25M", "$25M - $50M", "Over $50M"];
const SERVICES_OPTIONS = ["Government Contracting Training", "Proposal Writing Support", "Capability Statement Development", "SAM Registration Assistance", "Certification Support", "Business Development Strategy", "Teaming Partner Matching", "Financing Assistance", "Legal/Compliance Support", "Marketing & Branding"];
const CERTIFICATION_INTEREST_OPTIONS = ["8(a) Business Development", "HUBZone Certification", "Women-Owned Small Business (WOSB)", "Service-Disabled Veteran-Owned (SDVOSB)", "Minority Business Enterprise (MBE)", "Disadvantaged Business Enterprise (DBE)", "Small Business Enterprise (SBE)"];
const STATE_OPTIONS = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"];
const GOVERNMENT_AGENCIES = [
  "Department of Defense (DoD)",
  "Department of Veterans Affairs (VA)",
  "Department of Homeland Security (DHS)",
  "Department of Health and Human Services (HHS)",
  "Department of Energy (DOE)",
  "Department of Transportation (DOT)",
  "Department of Justice (DOJ)",
  "Department of Agriculture (USDA)",
  "Department of Commerce (DOC)",
  "Department of Education",
  "Department of Housing and Urban Development (HUD)",
  "Department of Labor (DOL)",
  "Department of State",
  "Department of the Treasury",
  "Department of the Interior",
  "Environmental Protection Agency (EPA)",
  "National Aeronautics and Space Administration (NASA)",
  "General Services Administration (GSA)",
  "National Institutes of Health (NIH)",
  "Federal Bureau of Investigation (FBI)",
  "Other",
];

export function ClientRegistrationModal({ open, onOpenChange, onSuccess, initialData, registrationId, mode = "create" }: ClientRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("ownership");
  const [formData, setFormData] = useState<ClientRegistrationFormData>({ ...INITIAL_FORM_DATA, ...initialData });
  const [loading, setLoading] = useState(false);
  const [serviceInput, setServiceInput] = useState("");
  const [agencyInput, setAgencyInput] = useState("");
  const [naicsCodeInput, setNaicsCodeInput] = useState("");
  const [cageCodeInput, setCageCodeInput] = useState("");
  const [oemManufacturerInput, setOemManufacturerInput] = useState("");

  const steps: { id: Step; title: string; icon: React.ElementType }[] = [
    { id: "ownership", title: "Ownership", icon: User },
    { id: "professional", title: "Professional", icon: Building2 },
    { id: "company", title: "Company", icon: ClipboardList },
    { id: "business", title: "Business", icon: Phone },
    { id: "strategy", title: "Strategy", icon: Target },
    { id: "review", title: "Review", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const updateFormData = <K extends keyof ClientRegistrationFormData>(field: K, value: ClientRegistrationFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => { if (currentStepIndex < steps.length - 1) setCurrentStep(steps[currentStepIndex + 1].id); };
  const handleBack = () => { if (currentStepIndex > 0) setCurrentStep(steps[currentStepIndex - 1].id); };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = mode === "edit" && registrationId ? `/api/client-registrations/${registrationId}` : "/api/client-registrations";
      const method = mode === "edit" ? "PUT" : "POST";
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (response.ok) {
        toast.success(mode === "edit" ? "Registration updated!" : "Registration submitted!");
        onOpenChange(false); setFormData(INITIAL_FORM_DATA); setCurrentStep("ownership"); onSuccess?.();
      } else { toast.error("Failed to submit"); }
    } catch (error) { toast.error("Failed to submit"); }
    finally { setLoading(false); }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "ownership": return formData.firstName && formData.lastName && formData.prefix;
      case "professional": return formData.title && formData.companyOwnerEthnicity;
      case "company": return formData.companyName && formData.streetAddress && formData.city && formData.state && formData.zipCode;
      case "business": return formData.mobilePhone && formData.companyEmail && formData.naicsCodes.length > 0;
      case "strategy": return formData.helpNeededFromKDM && formData.topCompanyNeed;
      default: return true;
    }
  };

  const toggleArrayItem = (field: "servicesInterestedIn" | "interestedInCertifications" | "targetAgencies" | "naicsCodes" | "cageCodes" | "oemManufacturers", value: string) => {
    const current = formData[field];
    if (current.includes(value)) updateFormData(field, current.filter((i) => i !== value));
    else updateFormData(field, [...current, value]);
  };

  const addAgency = () => {
    if (agencyInput.trim() && !formData.targetAgencies.includes(agencyInput.trim())) {
      updateFormData("targetAgencies", [...formData.targetAgencies, agencyInput.trim()]);
      setAgencyInput("");
    }
  };

  const addNaicsCode = () => {
    if (naicsCodeInput.trim() && !formData.naicsCodes.includes(naicsCodeInput.trim())) {
      updateFormData("naicsCodes", [...formData.naicsCodes, naicsCodeInput.trim()]);
      setNaicsCodeInput("");
    }
  };

  const addCageCode = () => {
    if (cageCodeInput.trim() && !formData.cageCodes.includes(cageCodeInput.trim())) {
      updateFormData("cageCodes", [...formData.cageCodes, cageCodeInput.trim()]);
      setCageCodeInput("");
    }
  };

  const addOemManufacturer = () => {
    if (oemManufacturerInput.trim() && !formData.oemManufacturers.includes(oemManufacturerInput.trim())) {
      updateFormData("oemManufacturers", [...formData.oemManufacturers, oemManufacturerInput.trim()]);
      setOemManufacturerInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Client Registration" : "Client Registration"}</DialogTitle>
          <DialogDescription>{mode === "edit" ? "Update the client registration" : "Register as a client with KDM & Associates"}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between mb-4 px-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${index <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                </div>
                <span className="text-[10px] mt-1">{step.title}</span>
              </div>
              {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <div className="min-h-[450px]">
          {currentStep === "ownership" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Ownership Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div><Label className="pb-1">Prefix *</Label><Select value={formData.prefix} onValueChange={(v) => updateFormData("prefix", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PREFIX_OPTIONS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
                  <div><Label className="pb-1">First Name *</Label><Input value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} /></div>
                  <div><Label className="pb-1">Middle Name</Label><Input value={formData.middleName} onChange={(e) => updateFormData("middleName", e.target.value)} /></div>
                  <div><Label className="pb-1">Last Name *</Label><Input value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>
          )}
          {currentStep === "professional" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5" />Professional Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Title *</Label><Input value={formData.title} onChange={(e) => updateFormData("title", e.target.value)} placeholder="e.g., CEO" /></div>
                  <div><Label className="pb-1">LinkedIn URL</Label><Input value={formData.linkedInUrl} onChange={(e) => updateFormData("linkedInUrl", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Owner Ethnicity *</Label><Select value={formData.companyOwnerEthnicity} onValueChange={(v) => updateFormData("companyOwnerEthnicity", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ETHNICITY_OPTIONS.map((e) => (<SelectItem key={e} value={e}>{e}</SelectItem>))}</SelectContent></Select></div>
                  <div><Label className="pb-1">Certifications</Label><Select value={formData.minorityBusinessCertification} onValueChange={(v) => updateFormData("minorityBusinessCertification", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MINORITY_CERT_OPTIONS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
                </div>
              </CardContent>
            </Card>
          )}
          {currentStep === "company" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="h-5 w-5" />Company Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="pb-1">Company Name *</Label><Input value={formData.companyName} onChange={(e) => updateFormData("companyName", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Street Address *</Label><Input value={formData.streetAddress} onChange={(e) => updateFormData("streetAddress", e.target.value)} /></div>
                  <div><Label className="pb-1">Address Line 2</Label><Input value={formData.streetAddress2} onChange={(e) => updateFormData("streetAddress2", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="pb-1">City *</Label><Input value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} /></div>
                  <div><Label className="pb-1">State *</Label><Select value={formData.state} onValueChange={(v) => updateFormData("state", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATE_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
                  <div><Label className="pb-1">Zip Code *</Label><Input value={formData.zipCode} onChange={(e) => updateFormData("zipCode", e.target.value)} /></div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Mobile Phone *</Label><Input value={formData.mobilePhone} onChange={(e) => updateFormData("mobilePhone", e.target.value)} /></div>
                  <div><Label className="pb-1">Company Phone</Label><Input value={formData.companyPhone} onChange={(e) => updateFormData("companyPhone", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Company Email *</Label><Input type="email" value={formData.companyEmail} onChange={(e) => updateFormData("companyEmail", e.target.value)} /></div>
                  <div><Label className="pb-1">Website URL</Label><Input value={formData.websiteUrl} onChange={(e) => updateFormData("websiteUrl", e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>
          )}
          {currentStep === "business" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5" />Business Identifiers</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="pb-1">SAM Registration</Label><Input value={formData.samRegistration} onChange={(e) => updateFormData("samRegistration", e.target.value)} /></div>
                  <div><Label className="pb-1">DUNS Number</Label><Input value={formData.dunsNumber} onChange={(e) => updateFormData("dunsNumber", e.target.value)} /></div>
                </div>
                <div>
                  <Label className="pb-1">NAICS Codes *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={naicsCodeInput} onChange={(e) => setNaicsCodeInput(e.target.value)} placeholder="e.g., 541511" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNaicsCode())} />
                    <Button type="button" onClick={addNaicsCode} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.naicsCodes.map((code) => (
                      <Badge key={code} variant="secondary">{code} <button onClick={() => toggleArrayItem("naicsCodes", code)} className="ml-1">×</button></Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="pb-1">CAGE Codes</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={cageCodeInput} onChange={(e) => setCageCodeInput(e.target.value)} placeholder="e.g., 1ABC2" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCageCode())} />
                    <Button type="button" onClick={addCageCode} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.cageCodes.map((code) => (
                      <Badge key={code} variant="secondary">{code} <button onClick={() => toggleArrayItem("cageCodes", code)} className="ml-1">×</button></Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Annual Revenue</Label><Select value={formData.approximateAnnualRevenue} onValueChange={(v) => updateFormData("approximateAnnualRevenue", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REVENUE_OPTIONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent></Select></div>
                  <div><Label className="pb-1">Applying As</Label><Select value={formData.applyingAs} onValueChange={(v) => updateFormData("applyingAs", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="prime_contractor">Prime</SelectItem><SelectItem value="subcontractor">Subcontractor</SelectItem><SelectItem value="joint_venture">Joint Venture</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                </div>
                <div className="flex items-center space-x-2"><Checkbox id="ableToWorkOutOfState" checked={formData.ableToWorkOutOfState} onCheckedChange={(c) => updateFormData("ableToWorkOutOfState", c as boolean)} /><Label htmlFor="ableToWorkOutOfState" className="text-sm font-normal">Able to work outside your state?</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="hasInHouseBDTeam" checked={formData.hasInHouseBDTeam} onCheckedChange={(c) => updateFormData("hasInHouseBDTeam", c as boolean)} /><Label htmlFor="hasInHouseBDTeam" className="text-sm font-normal">Have in-house BD team?</Label></div>
                <div><Label className="pb-1">How do you currently get business?</Label><Textarea value={formData.currentBusinessAcquisitionMethod} onChange={(e) => updateFormData("currentBusinessAcquisitionMethod", e.target.value)} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="pb-1">Referred By</Label><Input value={formData.referredBy} onChange={(e) => updateFormData("referredBy", e.target.value)} /></div>
                  <div><Label className="pb-1">How found KDM & Associates *</Label><Input value={formData.howFoundKDMAssociates} onChange={(e) => updateFormData("howFoundKDMAssociates", e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>
          )}
          {currentStep === "strategy" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5" />Strategy & Needs</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2"><Checkbox id="openToTeaming" checked={formData.openToTeamingArrangement} onCheckedChange={(c) => updateFormData("openToTeamingArrangement", c as boolean)} /><Label htmlFor="openToTeaming" className="text-sm font-normal">Open to teaming arrangement?</Label></div>
                <div className="flex items-center space-x-2"><Checkbox id="hasResources" checked={formData.hasResourcesToInvest} onCheckedChange={(c) => updateFormData("hasResourcesToInvest", c as boolean)} /><Label htmlFor="hasResources" className="text-sm font-normal">Have resources to invest if recommended?</Label></div>
                <div><Label className="pb-1">Help needed from KDM & Associates *</Label><Textarea value={formData.helpNeededFromKDM} onChange={(e) => updateFormData("helpNeededFromKDM", e.target.value)} rows={2} /></div>
                <div><Label className="pb-1">Top company need *</Label><Input value={formData.topCompanyNeed} onChange={(e) => updateFormData("topCompanyNeed", e.target.value)} /></div>
                <div><Label className="pb-1">Services Interested In</Label><div className="flex flex-wrap gap-2 mt-2">{SERVICES_OPTIONS.map((s) => (<Badge key={s} variant={formData.servicesInterestedIn.includes(s) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleArrayItem("servicesInterestedIn", s)}>{s}</Badge>))}</div></div>
                <div><Label className="pb-1">Certifications Interested In</Label><div className="flex flex-wrap gap-2 mt-2">{CERTIFICATION_INTEREST_OPTIONS.map((c) => (<Badge key={c} variant={formData.interestedInCertifications.includes(c) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleArrayItem("interestedInCertifications", c)}>{c}</Badge>))}</div></div>
                <div className="flex items-center space-x-2"><Checkbox id="interestedInLoans" checked={formData.interestedInLoans} onCheckedChange={(c) => updateFormData("interestedInLoans", c as boolean)} /><Label htmlFor="interestedInLoans" className="text-sm font-normal">Interested in loans/financing?</Label></div>
                <div>
                  <Label className="pb-1">Target Government Agencies</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {GOVERNMENT_AGENCIES.map((agency) => (
                      <Badge key={agency} variant={formData.targetAgencies.includes(agency) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleArrayItem("targetAgencies", agency)}>{agency}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="pb-1">OEM Manufacturers</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={oemManufacturerInput} onChange={(e) => setOemManufacturerInput(e.target.value)} placeholder="e.g., Boeing, Lockheed Martin" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOemManufacturer())} />
                    <Button type="button" onClick={addOemManufacturer} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.oemManufacturers.map((mfg) => (
                      <Badge key={mfg} variant="secondary">{mfg} <button onClick={() => toggleArrayItem("oemManufacturers", mfg)} className="ml-1">×</button></Badge>
                    ))}
                  </div>
                </div>
                <div><Label className="pb-1">Notes</Label><Textarea value={formData.notes} onChange={(e) => updateFormData("notes", e.target.value)} rows={2} /></div>
              </CardContent>
            </Card>
          )}
          {currentStep === "review" && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CheckCircle className="h-5 w-5" />Review</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-muted-foreground">Name</p><p className="font-medium">{formData.prefix} {formData.firstName} {formData.middleName} {formData.lastName}</p></div>
                  <div><p className="text-muted-foreground">Company</p><p className="font-medium">{formData.companyName}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-muted-foreground">Email</p><p className="font-medium">{formData.companyEmail}</p></div>
                  <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{formData.mobilePhone}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-muted-foreground">NAICS Codes</p><p className="font-medium">{formData.naicsCodes.join(", ") || "Not specified"}</p></div>
                  <div><p className="text-muted-foreground">Revenue</p><p className="font-medium">{formData.approximateAnnualRevenue || "Not specified"}</p></div>
                </div>
                <div><p className="text-muted-foreground">Services Needed</p><div className="flex flex-wrap gap-1 mt-1">{formData.servicesInterestedIn.map((s) => (<Badge key={s} variant="secondary" className="text-xs">{s}</Badge>))}</div></div>
                <div><p className="text-muted-foreground">Top Need</p><p>{formData.topCompanyNeed}</p></div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleBack} disabled={currentStepIndex === 0}><ChevronLeft className="h-4 w-4 mr-2" />Back</Button>
          <div className="flex gap-2">
            {currentStep === "review" ? (
              <Button onClick={handleSubmit} disabled={loading || !canProceed()}>{loading ? "Submitting..." : mode === "edit" ? "Update" : "Submit"}</Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>Next<ChevronRight className="h-4 w-4 ml-2" /></Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
