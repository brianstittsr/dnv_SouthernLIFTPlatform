"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Plus,
  X,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { FieldHint } from "@/components/ui/field-hint";
import { PscListInput } from "@/components/onboarding/psc-list-input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LIFT_SERVICE_AREAS } from "@/lib/form-builder/controls";
import { BUSINESS_NEEDS, MAX_BUSINESS_NEED_SELECTIONS } from "@/lib/lift-business-needs";
import type { UploadRef } from "@/lib/form-builder/types";

const certificationTypes = [
  { id: "8a", label: "8(a) Certified" },
  { id: "wosb", label: "WOSB" },
  { id: "edwosb", label: "EDWOSB" },
  { id: "sdvosb", label: "SDVOSB" },
  { id: "hubzone", label: "HUBZone" },
  { id: "mbe", label: "MBE (Minority Business Enterprise)" },
  { id: "dbe", label: "DBE (Disadvantaged Business Enterprise)" },
  { id: "other", label: "Other" },
];

const naicsCodes = [
  // Manufacturing subsectors (NAICS 31-33) — enables the Proof Pack step
  "311 - Food Manufacturing",
  "312 - Beverage and Tobacco Product Manufacturing",
  "313 - Textile Mills",
  "314 - Textile Product Mills",
  "315 - Apparel Manufacturing",
  "316 - Leather and Allied Product Manufacturing",
  "321 - Wood Product Manufacturing",
  "322 - Paper Manufacturing",
  "323 - Printing and Related Support Activities",
  "324 - Petroleum and Coal Products Manufacturing",
  "325 - Chemical Manufacturing",
  "326 - Plastics and Rubber Products Manufacturing",
  "327 - Nonmetallic Mineral Product Manufacturing",
  "331 - Primary Metal Manufacturing",
  "332 - Fabricated Metal Product Manufacturing",
  "333 - Machinery Manufacturing",
  "334 - Computer and Electronic Product Manufacturing",
  "335 - Electrical Equipment, Appliance, and Component Manufacturing",
  "336 - Transportation Equipment Manufacturing",
  "337 - Furniture and Related Product Manufacturing",
  "339 - Miscellaneous Manufacturing",
  // Services
  "541511 - Custom Computer Programming Services",
  "541512 - Computer Systems Design Services",
  "541513 - Computer Facilities Management Services",
  "541519 - Other Computer Related Services",
  "541611 - Administrative Management Consulting",
  "541612 - Human Resources Consulting",
  "541613 - Marketing Consulting",
  "541614 - Process, Physical Distribution, and Logistics Consulting",
  "541618 - Other Management Consulting",
  "541690 - Other Scientific and Technical Consulting",
  "541990 - All Other Professional, Scientific, and Technical Services",
  "561110 - Office Administrative Services",
  "561210 - Facilities Support Services",
  "561320 - Temporary Help Services",
  "561499 - All Other Business Support Services",
];

const businessStages = [
  "Idea",
  "Startup (under 2 years)",
  "Operating business",
  "Growing / expanding",
];

const digitalToolOptions = [
  "Website",
  "E-commerce / online sales",
  "Accounting software",
  "CRM",
  "Social media",
  "AI tools",
  "None",
];

const preferredServiceOptions = [
  "One-on-one counseling",
  "Workshops and training",
  "Capital readiness",
  "Government contracting",
  "Advanced Manufacturing program",
  "Digital and AI adoption",
];

const referralSourceOptions = [
  "Southern University",
  "Small Business Development Center (SBDC)",
  "Partner organization",
  "Event or workshop",
  "Social media",
  "Radio",
  "Referral from another business",
  "Web search",
  "Other",
];

const referredByOptions = [
  "KDM and Associates",
  "PMO",
  "AM Laboratory",
  "SBDC",
  "Other",
];

const employeeRanges = [
  "0 - just the owner(s)",
  "1-4",
  "5-9",
  "10-19",
  "20-49",
  "50-99",
  "100 or more",
];

const entityTypes = [
  "Sole proprietorship",
  "LLC",
  "Corporation",
  "S corporation",
  "Partnership",
  "Nonprofit",
  "Not registered yet",
  "Other",
];

const ownerEthnicityOptions = [
  "Black or African American",
  "Hispanic or Latino",
  "Asian",
  "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander",
  "Multi-ethnic",
  "White",
  "Other",
];

const acquisitionMethodOptions = [
  "Word of mouth",
  "Referrals",
  "Website / online",
  "Social media",
  "Bids and solicitations",
  "Networking events",
  "Other",
];

/** Intake service areas plus the catalog's "Not sure" option (B1.0.2). */
const serviceAreaOptions = [...LIFT_SERVICE_AREAS, "Not sure yet"];

interface SecondaryContact {
  name: string;
  email: string;
}

interface SMEFormData {
  companyName: string;
  businessNotRegistered: boolean;
  dba: string;
  applyingAs: string;
  dunsUei: string;
  cageCode: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  yearEstablished: string;
  employeeCount: string;
  stage: string;
  revenueLast12: string;
  certifications: string[];
  certificationsPlanned: string[];
  interestedInGovcon: string; // "yes" | "no" | ""
  samRegistered: string; // "registered" | "in-progress" | "not-registered" | "unsure" | ""
  soldToGovernment: string; // "yes" | "no" | ""
  primaryNaics: string[];
  secondaryNaics: string[];
  productsServices: string[];
  coreCapabilities: string;
  pastPerformance: string;
  keyDifferentiators: string;
  digitalTools: string[];
  capabilityStatementFileId: string;
  capabilityStatementAttachmentId: string;
  capabilityStatementFileName: string;
  wantsCapabilityStatementHelp: boolean;
  seekingCapital: string; // "yes" | "no" | ""
  capitalPurpose: string;
  capitalAmount: string;
  topNeed: string;
  barriers: string;
  goals12Months: string;
  preferredServices: string[];
  topNeeds: string[];
  serviceArea: string[];
  referralSource: string;
  referredBy: string;
  referredByOther: string;
  acquisitionMethod: string;
  openToTeaming: string; // "yes" | "no" | ""
  outOfState: string; // "yes" | "no" | ""
  inHouseBD: string; // "yes" | "no" | ""
  resourcesToInvest: string; // "yes" | "no" | ""
  aiDisclosure: boolean;
  privacyAck: boolean;
  emailOptIn: boolean;
  attachmentFiles: UploadRef[];
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  mobilePhone: string;
  linkedin: string;
  /** True when the user/company has no LinkedIn profile — satisfies the LinkedIn requirement. */
  noLinkedin: boolean;
  ownerEthnicity: string;
  /** Additional teammates invited to create accounts on the platform. */
  secondaryContacts: SecondaryContact[];
  preferredContactMethod: string;
  /** Typed digital signature (full legal name) attesting the answers are accurate. */
  signatureName: string;
  /** Checked box confirming the accuracy attestation. */
  attestationConfirmed: boolean;
}

interface StepProps {
  formData: SMEFormData;
  setFormData: React.Dispatch<React.SetStateAction<SMEFormData>>;
}

export function BusinessInfoStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Company Name {formData.businessNotRegistered ? "" : "*"}
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            disabled={formData.businessNotRegistered}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder={formData.businessNotRegistered ? "Not registered yet" : "Your Company, LLC"}
          />
          <FieldHint>
            Your registered legal name — used to link teammates from the same
            company and match public records.
          </FieldHint>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="businessNotRegistered"
              checked={formData.businessNotRegistered}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  businessNotRegistered: checked === true,
                  companyName: checked === true ? "" : formData.companyName,
                  applyingAs: checked === true ? "Not registered yet" : formData.applyingAs,
                })
              }
            />
            <Label htmlFor="businessNotRegistered" className="cursor-pointer text-sm font-normal">
              My business is not registered yet
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dba">Trade Name (DBA)</Label>
          <Input
            id="dba"
            value={formData.dba}
            onChange={(e) => setFormData({ ...formData, dba: e.target.value })}
            placeholder="If different from legal name"
          />
          <FieldHint>
            The name customers know you by — helps matching connect listings
            and opportunities to the right business.
          </FieldHint>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applyingAs">Business Entity Type *</Label>
          <Select
            value={formData.applyingAs}
            onValueChange={(value) => setFormData({ ...formData, applyingAs: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHint>
            Your legal structure affects eligibility for certain programs and
            contracting set-asides.
          </FieldHint>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Business Stage *</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => setFormData({ ...formData, stage: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {businessStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHint>
            Tells your advisor and the matcher where you are so
            recommendations fit your stage.
          </FieldHint>
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://yourcompany.com"
          />
          <FieldHint>
            Lets our tools better understand your offerings when scoring
            opportunity fit.
          </FieldHint>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Main Street"
        />
        <FieldHint>
          Your physical location determines rural eligibility, your parish,
          and which set-asides (like HUBZone) apply.
        </FieldHint>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Washington"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="DC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code *</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            placeholder="20001"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="yearEstablished">Year Established</Label>
          <Input
            id="yearEstablished"
            value={formData.yearEstablished}
            onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
            placeholder="2015"
          />
          <FieldHint>
            Some contracting programs and financing options require a minimum
            operating history.
          </FieldHint>
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeCount">Full-Time Employees (incl. owners) *</Label>
          <Select
            value={formData.employeeCount}
            onValueChange={(value) => setFormData({ ...formData, employeeCount: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {employeeRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHint>
            SBA size standards use headcount to decide small-business
            eligibility for set-aside contracts.
          </FieldHint>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="revenueLast12">Revenue — Last 12 Months ($)</Label>
        <Input
          id="revenueLast12"
          type="number"
          inputMode="decimal"
          min={0}
          value={formData.revenueLast12}
          onChange={(e) => setFormData({ ...formData, revenueLast12: e.target.value })}
          placeholder="Approximate is fine — e.g. 250000"
        />
        <FieldHint>
          A rough figure is fine — the matcher uses it to flag which
          opportunity sizes you realistically qualify for.
        </FieldHint>
      </div>
    </div>
  );
}

export function GovconStep({ formData, setFormData }: StepProps) {
  const toggleCertification = (certId: string) => {
    const current = formData.certifications;
    if (current.includes(certId)) {
      setFormData({
        ...formData,
        certifications: current.filter((c) => c !== certId),
      });
    } else {
      setFormData({
        ...formData,
        certifications: [...current, certId],
      });
    }
  };

  const interested = formData.interestedInGovcon === "yes";

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-muted/30">
        <Label className="text-base">
          Is your business interested in government contracting? *
        </Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Federal, state, and local agencies buy goods and services from small
          businesses. Your LIFT advisor can help you get registered and ready —
          answer &quot;No&quot; if contracting isn&apos;t a goal right now.
        </p>
        <div className="flex gap-3">
          {[
            { value: "yes", label: "Yes, I'm interested" },
            { value: "no", label: "Not right now" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, interestedInGovcon: opt.value })
              }
              className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                formData.interestedInGovcon === opt.value
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {formData.interestedInGovcon === "no" && (
        <p className="text-sm text-muted-foreground">
          No problem — you can update this later from your profile. Your advisor
          will focus on your other growth goals instead.
        </p>
      )}

      {interested && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dunsUei">UEI (Unique Entity ID)</Label>
              <Input
                id="dunsUei"
                value={formData.dunsUei}
                onChange={(e) => setFormData({ ...formData, dunsUei: e.target.value })}
                placeholder="Found in your SAM.gov registration"
              />
              <FieldHint>
                Required for federal awards — also links teammates from the
                same company to one shared record.
              </FieldHint>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cageCode">CAGE Code</Label>
              <Input
                id="cageCode"
                value={formData.cageCode}
                onChange={(e) => setFormData({ ...formData, cageCode: e.target.value })}
                placeholder="1ABC2"
              />
              <FieldHint>
                Assigned automatically when you register in SAM.gov — leave
                blank if you don&apos;t have one yet.
              </FieldHint>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="samRegistered">SAM.gov Registration Status *</Label>
            <Select
              value={formData.samRegistered}
              onValueChange={(value) => setFormData({ ...formData, samRegistered: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">Registered and active</SelectItem>
                <SelectItem value="in-progress">Registration in progress</SelectItem>
                <SelectItem value="not-registered">Not registered yet</SelectItem>
                <SelectItem value="unsure">Not sure</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              SAM.gov registration is free and required for federal contracts.
              Your LIFT advisor can walk you through it.
            </p>
          </div>

          <CapabilityStatementUpload formData={formData} setFormData={setFormData} />

          <div>
            <Label className="text-base">Socioeconomic Certifications</Label>
            <FieldHint className="mb-4">
              Certifications unlock set-aside opportunities — the matcher
              prioritizes contracts that require the ones you hold.
            </FieldHint>
            <div className="grid md:grid-cols-2 gap-3">
              {certificationTypes.map((cert) => (
                <div
                  key={cert.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.certifications.includes(cert.id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleCertification(cert.id)}
                >
                  <Checkbox
                    checked={formData.certifications.includes(cert.id)}
                    onCheckedChange={() => toggleCertification(cert.id)}
                  />
                  <Label className="cursor-pointer">{cert.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {formData.certifications.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Selected Certifications</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((certId) => {
                  const cert = certificationTypes.find((c) => c.id === certId);
                  return (
                    <Badge key={certId} variant="secondary">
                      {cert?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label className="text-base">Certifications You Plan to Pursue</Label>
            <FieldHint className="mb-4">
              Your advisor can help you apply — planned certifications shape
              which future opportunities we prepare you for.
            </FieldHint>
            <div className="grid md:grid-cols-2 gap-3">
              {certificationTypes.map((cert) => (
                <div
                  key={`planned-${cert.id}`}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.certificationsPlanned.includes(cert.id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    const current = formData.certificationsPlanned;
                    setFormData({
                      ...formData,
                      certificationsPlanned: current.includes(cert.id)
                        ? current.filter((c) => c !== cert.id)
                        : [...current, cert.id],
                    });
                  }}
                >
                  <Checkbox
                    checked={formData.certificationsPlanned.includes(cert.id)}
                    onCheckedChange={() => {
                      const current = formData.certificationsPlanned;
                      setFormData({
                        ...formData,
                        certificationsPlanned: current.includes(cert.id)
                          ? current.filter((c) => c !== cert.id)
                          : [...current, cert.id],
                      });
                    }}
                  />
                  <Label className="cursor-pointer">{cert.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              Have you sold to government agencies, prime contractors, or large companies before?
            </Label>
            <FieldHint>
              Past contract wins significantly improve fit scoring for similar
              opportunities.
            </FieldHint>
            <div className="flex gap-3">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, soldToGovernment: opt.value })}
                  className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                    formData.soldToGovernment === opt.value
                      ? "border-primary bg-primary/10 font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastPerformance">Contract & Past Performance Experience</Label>
            <Textarea
              id="pastPerformance"
              value={formData.pastPerformance}
              onChange={(e) => setFormData({ ...formData, pastPerformance: e.target.value })}
              placeholder="Summarize any government or commercial contract experience — or write 'None yet' if you're just getting started..."
              rows={4}
            />
            <FieldHint>
              A sentence or two is enough — feeds your service plan and
              past-performance matching. &quot;None yet&quot; is fine.
            </FieldHint>
          </div>
        </>
      )}
    </div>
  );
}

export function CapabilitiesStep({ formData, setFormData }: StepProps) {
  const [naicsOpen, setNaicsOpen] = useState(false);
  const [enhancing, setEnhancing] = useState<
    "coreCapabilities" | "keyDifferentiators" | null
  >(null);

  const addPrimaryNaics = (code: string) => {
    if (!formData.primaryNaics.includes(code) && formData.primaryNaics.length < 5) {
      setFormData({
        ...formData,
        primaryNaics: [...formData.primaryNaics, code],
      });
    }
    setNaicsOpen(false);
  };

  const enhanceField = async (
    field: "coreCapabilities" | "keyDifferentiators",
    prompt: string
  ) => {
    const text = formData[field].trim();
    if (!text) {
      toast.error("Add a few bullet points first, then click Enhance with AI.");
      return;
    }
    setEnhancing(field);
    try {
      const res = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context: { type: "business_capability" },
          prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.enhancedText) {
        throw new Error(data.error || "Enhancement failed");
      }
      setFormData({ ...formData, [field]: data.enhancedText });
      toast.success("Enhanced with AI — review and edit as needed.");
    } catch (error) {
      console.error("AI enhance error:", error);
      toast.error("AI enhancement failed. Your text was left unchanged.");
    } finally {
      setEnhancing(null);
    }
  };

  const removePrimaryNaics = (code: string) => {
    setFormData({
      ...formData,
      primaryNaics: formData.primaryNaics.filter((c) => c !== code),
    });
  };

  const maxCodesReached = formData.primaryNaics.length >= 5;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Primary NAICS Codes *</Label>
          <Badge variant="outline">
            {formData.primaryNaics.length} / 5
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Search by NAICS code or keyword (e.g. &quot;332&quot; or
          &quot;metal&quot;), then click a result to add it. Add up to 5 codes
          that best describe your services.
        </p>
        <FieldHint>
          NAICS codes are the #1 key the AI matcher uses to score SAM.gov
          opportunities against your business — pick the ones buyers use for
          your work.
        </FieldHint>
        <Popover open={naicsOpen} onOpenChange={setNaicsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={naicsOpen}
              disabled={maxCodesReached}
              className="w-full justify-between font-normal"
            >
              {maxCodesReached
                ? "Maximum of 5 codes reached"
                : "Search and select NAICS codes..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Type a code or keyword..." />
              <CommandList>
                <CommandEmpty>No NAICS code found.</CommandEmpty>
                <CommandGroup>
                  {naicsCodes.map((code) => {
                    const alreadyAdded = formData.primaryNaics.includes(code);
                    return (
                      <CommandItem
                        key={code}
                        value={code}
                        disabled={alreadyAdded}
                        onSelect={() => addPrimaryNaics(code)}
                      >
                        <CheckCircle2
                          className={cn(
                            "mr-2 h-4 w-4",
                            alreadyAdded ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {code}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {maxCodesReached && (
          <p className="text-xs text-muted-foreground mt-2">
            Maximum of 5 NAICS codes reached. Remove a code to add another.
          </p>
        )}
        {formData.primaryNaics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.primaryNaics.map((code) => (
              <Badge key={code} variant="secondary" className="gap-1">
                {code.split(" - ")[0]}
                <button onClick={() => removePrimaryNaics(code)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Products & Services *</Label>
        <PscListInput
          value={formData.productsServices}
          onChange={(items) => setFormData({ ...formData, productsServices: items })}
        />
        <p className="text-xs text-muted-foreground">
          Search the federal PSC catalog by code or description, or type your
          own entry and click +.
        </p>
        <FieldHint>
          Be specific — the matcher reads these to score how well each
          opportunity fits what you actually sell.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="coreCapabilities">Core Capabilities *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              enhanceField(
                "coreCapabilities",
                "Convert these bullet points into 2-4 polished, professional sentences describing the company's core capabilities and services, suitable for a business capability statement. Write in third person, stay factual, and do not invent capabilities that are not listed."
              )
            }
            disabled={enhancing !== null}
          >
            {enhancing === "coreCapabilities" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Enhance with AI
          </Button>
        </div>
        <Textarea
          id="coreCapabilities"
          value={formData.coreCapabilities}
          onChange={(e) => setFormData({ ...formData, coreCapabilities: e.target.value })}
          placeholder="- Custom metal fabrication&#10;- CNC machining and welding&#10;- Prototype and short-run production"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Tip: list your capabilities as bullet points (one per line), then
          click &quot;Enhance with AI&quot; to turn them into polished sentences.
          You can edit the result and enhance it again.
        </p>
        <FieldHint>
          This becomes the core of your capability statement and the text the
          matcher compares to opportunity descriptions.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="keyDifferentiators">Key Differentiators</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              enhanceField(
                "keyDifferentiators",
                "Convert these bullet points into 2-3 polished, professional sentences explaining what makes this company unique and sets it apart from competitors, suitable for a business capability statement. Write in third person, stay factual, and do not invent claims that are not listed."
              )
            }
            disabled={enhancing !== null}
          >
            {enhancing === "keyDifferentiators" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Enhance with AI
          </Button>
        </div>
        <Textarea
          id="keyDifferentiators"
          value={formData.keyDifferentiators}
          onChange={(e) => setFormData({ ...formData, keyDifferentiators: e.target.value })}
          placeholder="- 20 years serving rural parishes&#10;- Only certified shop in the region&#10;- Same-week turnaround"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Tip: list what sets you apart as bullet points, then click
          &quot;Enhance with AI&quot; to turn them into sentences you can edit.
        </p>
        <FieldHint>
          Differentiators strengthen AI-drafted capability statements and
          proposals — buyers see why you over competitors.
        </FieldHint>
      </div>

      <div>
        <Label className="text-base">Digital Tools You Use Today</Label>
        <FieldHint className="mb-4">
          Select all that apply — helps your advisor plan digital and AI
          adoption support; it doesn&apos;t affect opportunity matching.
        </FieldHint>
        <div className="grid md:grid-cols-2 gap-3">
          {digitalToolOptions.map((tool) => (
            <div
              key={tool}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.digitalTools.includes(tool)
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                const current = formData.digitalTools;
                setFormData({
                  ...formData,
                  digitalTools: current.includes(tool)
                    ? current.filter((t) => t !== tool)
                    : [...current, tool],
                });
              }}
            >
              <Checkbox
                checked={formData.digitalTools.includes(tool)}
                onCheckedChange={() => {
                  const current = formData.digitalTools;
                  setFormData({
                    ...formData,
                    digitalTools: current.includes(tool)
                      ? current.filter((t) => t !== tool)
                      : [...current, tool],
                  });
                }}
              />
              <Label className="cursor-pointer">{tool}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactInfoStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Primary Contact</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Full Name *</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="John Smith"
            />
            <FieldHint>
              The person match alerts and advisor messages go to.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactTitle">Title / Role</Label>
            <Input
              id="contactTitle"
              value={formData.contactTitle}
              onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
              placeholder="e.g., Owner, CEO"
            />
            <FieldHint>
              Helps advisors and partners know who they&apos;re working with.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="john@company.com"
            />
            <FieldHint>
              Where opportunity matches and program updates are sent.
            </FieldHint>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone *</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="(202) 555-1234"
            />
            <FieldHint>
              For advisor follow-ups and time-sensitive opportunity alerts.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredContactMethod">Preferred Contact Method *</Label>
            <Select
              value={formData.preferredContactMethod}
              onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="either">Either</SelectItem>
              </SelectContent>
            </Select>
            <FieldHint>
              How you&apos;d like us to reach you with matches and updates.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Mobile Phone (if different)</Label>
            <Input
              id="mobilePhone"
              type="tel"
              value={formData.mobilePhone}
              onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
              placeholder="(202) 555-1234"
            />
            <FieldHint>
              Optional backup number for urgent contract deadlines.
            </FieldHint>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile *</Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://www.linkedin.com/in/your-profile"
              disabled={formData.noLinkedin}
            />
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="noLinkedin"
                checked={formData.noLinkedin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, noLinkedin: checked === true })
                }
              />
              <Label htmlFor="noLinkedin" className="text-sm font-normal cursor-pointer">
                No LinkedIn profile (personal or company)
              </Label>
            </div>
            <FieldHint>
              Enriches your business record for advisor and partner matching —
              check the box if you don&apos;t have one.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEthnicity">Owner Ethnicity *</Label>
            <Select
              value={formData.ownerEthnicity}
              onValueChange={(value) => setFormData({ ...formData, ownerEthnicity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                {ownerEthnicityOptions.map((ethnicity) => (
                  <SelectItem key={ethnicity} value={ethnicity}>
                    {ethnicity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used to prefill the MBDA enrollment form — you can confirm or change it there.
            </p>
            <FieldHint>
              Optional — identifies minority-business certifications and
              set-asides you may qualify for.
            </FieldHint>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Additional Contacts (Optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFormData({
                ...formData,
                secondaryContacts: [...formData.secondaryContacts, { name: "", email: "" }],
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" />
            Add contact
          </Button>
        </div>
        {formData.secondaryContacts.length === 0 ? (
          <FieldHint>
            Add teammates or partners — we&apos;ll email each one a link to
            create their own account on the platform.
          </FieldHint>
        ) : (
          <div className="space-y-3">
            {formData.secondaryContacts.map((contact, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="grid md:grid-cols-2 gap-4 flex-1">
                  <Input
                    value={contact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryContacts: formData.secondaryContacts.map((item, i) =>
                          i === index ? { ...item, name: e.target.value } : item,
                        ),
                      })
                    }
                    placeholder="Full name"
                    aria-label={`Contact ${index + 1} name`}
                  />
                  <Input
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryContacts: formData.secondaryContacts.map((item, i) =>
                          i === index ? { ...item, email: e.target.value } : item,
                        ),
                      })
                    }
                    placeholder="jane@company.com"
                    aria-label={`Contact ${index + 1} email`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      secondaryContacts: formData.secondaryContacts.filter((_, i) => i !== index),
                    })
                  }
                  aria-label={`Remove contact ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <FieldHint>
              Each contact is emailed a link to create their own account on
              the platform when you finish onboarding.
            </FieldHint>
          </div>
        )}
      </div>
    </div>
  );
}

function CapabilityStatementUpload({ formData, setFormData }: StepProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const uid = auth?.currentUser?.uid;
    if (!uid) {
      toast.error("Please sign in again before uploading files");
      return;
    }
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("userId", uid);
      body.append("category", "onboarding");
      body.append("attachmentType", "capability_statement");

      const response = await fetch("/api/upload-file", { method: "POST", body });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await response.json();
      setFormData({
        ...formData,
        capabilityStatementFileId: data.fileId,
        capabilityStatementAttachmentId: data.attachmentId ?? "",
        capabilityStatementFileName: data.fileName,
        wantsCapabilityStatementHelp: false,
      });
      toast.success("Capability statement uploaded");
    } catch (error) {
      console.error("Capability statement upload failed:", error);
      toast.error("Upload failed — you can try again or add it later");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      capabilityStatementFileId: "",
      capabilityStatementAttachmentId: "",
      capabilityStatementFileName: "",
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">Capability Statement (optional)</Label>
      <p className="text-sm text-muted-foreground">
        A capability statement is a one-page overview of your business — what
        you do, your differentiators, and your codes/certifications — that
        buyers and primes ask for. PDF is best: we extract the text so your
        advisor and our AI tools can work with it.
      </p>

      {formData.capabilityStatementFileName ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-700" />
            <span className="text-sm font-medium">
              {formData.capabilityStatementFileName}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile} type="button">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 text-sm cursor-pointer transition-colors ${
            isUploading ? "opacity-60 cursor-wait" : "hover:bg-muted"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Uploading..." : "Upload your capability statement"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      )}

      <div className="flex items-center space-x-3">
        <Checkbox
          id="wantsCapabilityStatementHelp"
          checked={formData.wantsCapabilityStatementHelp}
          disabled={Boolean(formData.capabilityStatementFileName)}
          onCheckedChange={(checked) =>
            setFormData({
              ...formData,
              wantsCapabilityStatementHelp: checked === true,
            })
          }
        />
        <Label htmlFor="wantsCapabilityStatementHelp" className="cursor-pointer text-sm font-normal">
          I don&apos;t have a capability statement — I&apos;d like help creating one
        </Label>
      </div>
    </div>
  );
}

/** Free-text list input: type an item, press Enter or "+", items appear as removable rows. */
const LIFT_UPLOAD_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp";

/** Uploads supporting documents to the LIFT intake pipeline (base64 + AI analysis). */
function AttachmentsUpload({ formData, setFormData }: StepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = Math.max(0, 5 - formData.attachmentFiles.length);
    setIsUploading(true);
    const uploaded: UploadRef[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: files must be smaller than 10 MB`);
        continue;
      }
      try {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/lift/forms/by-slug/lift-intake/uploads", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
        uploaded.push(data.data as UploadRef);
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload failed"}`);
      }
    }
    setIsUploading(false);
    if (uploaded.length) {
      setFormData({ ...formData, attachmentFiles: [...formData.attachmentFiles, ...uploaded] });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remaining = Math.max(0, 5 - formData.attachmentFiles.length);

  return (
    <div className="space-y-3">
      <Label className="text-base">Supporting Documents (optional)</Label>
      <p className="text-sm text-muted-foreground">
        For example, a business plan, financial statement, or capability
        statement. Our AI reads each file and summarizes it for your advisor.
        Do not upload Social Security numbers or controlled (CUI) documents.
      </p>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        multiple
        accept={LIFT_UPLOAD_TYPES}
        disabled={isUploading || remaining === 0}
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isUploading || remaining === 0}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isUploading ? "Uploading..." : remaining === 0 ? "File limit reached" : "Choose file"}
      </Button>
      <p className="text-xs text-muted-foreground">Up to 5 files, 10 MB each. PDF, Word, Excel, CSV, or image.</p>
      {formData.attachmentFiles.length > 0 && (
        <ul className="space-y-1" aria-label="Uploaded files">
          {formData.attachmentFiles.map((file) => (
            <li key={file.uploadId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.fileName}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${file.fileName}`}
                onClick={() =>
                  setFormData({
                    ...formData,
                    attachmentFiles: formData.attachmentFiles.filter((item) => item.uploadId !== file.uploadId),
                  })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NeedsGoalsStep({ formData, setFormData }: StepProps) {
  const [enhancing, setEnhancing] = useState(false);
  const seeking = formData.seekingCapital === "yes";

  const enhanceCapitalPurpose = async () => {
    const text = formData.capitalPurpose.trim();
    if (!text) {
      toast.error("Add a few notes first, then click Enhance with AI.");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context: { type: "business_capability" },
          prompt:
            "Convert these notes into polished, professional sentences describing what the financing will be used for, suitable for a small business intake form. Stay factual and do not invent details.",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.enhancedText) throw new Error(data.error || "Enhancement failed");
      setFormData({ ...formData, capitalPurpose: data.enhancedText });
      toast.success("Enhanced with AI — review and edit as needed.");
    } catch (error) {
      console.error("AI enhance error:", error);
      toast.error("AI enhancement failed. Your text was left unchanged.");
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
        <Label className="text-base">Are you seeking financing or investment? *</Label>
        <FieldHint>
          Routes you to capital-readiness support alongside contracting help.
        </FieldHint>
        <div className="flex gap-3">
          {[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, seekingCapital: opt.value })}
              className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                formData.seekingCapital === opt.value
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {seeking && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="capitalPurpose">What would the financing be used for?</Label>
              <Button type="button" variant="outline" size="sm" onClick={enhanceCapitalPurpose} disabled={enhancing}>
                {enhancing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Enhance with AI
              </Button>
            </div>
            <Textarea
              id="capitalPurpose"
              value={formData.capitalPurpose}
              onChange={(e) => setFormData({ ...formData, capitalPurpose: e.target.value })}
              placeholder="- Raw materials&#10;- Payroll&#10;- New equipment"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Tip: jot bullet points, then enhance them into sentences you can edit.
            </p>
            <FieldHint>
              Lenders and advisors use this to match you with the right
              financing programs.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capitalAmount">About how much financing are you seeking? ($)</Label>
            <Input
              id="capitalAmount"
              type="number"
              inputMode="decimal"
              min={0}
              value={formData.capitalAmount}
              onChange={(e) => setFormData({ ...formData, capitalAmount: e.target.value })}
              placeholder="e.g. 50000"
            />
            <FieldHint>
              A rough figure is fine — guides which loan and grant programs fit.
            </FieldHint>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="topNeed">What is the single most important thing your business needs right now? *</Label>
        <Textarea
          id="topNeed"
          value={formData.topNeed}
          onChange={(e) => setFormData({ ...formData, topNeed: e.target.value })}
          placeholder="Be specific — this drives your advisor's first recommendations"
          rows={3}
        />
        <FieldHint>
          The single biggest driver of your service plan and the
          recommendations you see first.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="barriers">What is holding your business back? *</Label>
        <Textarea
          id="barriers"
          value={formData.barriers}
          onChange={(e) => setFormData({ ...formData, barriers: e.target.value })}
          placeholder="Challenges, constraints, or gaps you're facing"
          rows={3}
        />
        <FieldHint>
          We flag resources, training, and programs that specifically address
          the barriers you list.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals12Months">What do you want to achieve in the next 12 months? *</Label>
        <Textarea
          id="goals12Months"
          value={formData.goals12Months}
          onChange={(e) => setFormData({ ...formData, goals12Months: e.target.value })}
          placeholder="Revenue, contracts, hiring, certifications — whatever success looks like"
          rows={3}
        />
        <FieldHint>
          Your goals become the measurable outcomes your advisor works toward
          with you.
        </FieldHint>
      </div>

      <div>
        <Label className="text-base">Which kinds of help interest you? *</Label>
        <FieldHint className="mb-4">
          Select all that apply — shapes your advisor assignment and the
          workshops and tools we surface first.
        </FieldHint>
        <div className="grid md:grid-cols-2 gap-3">
          {preferredServiceOptions.map((service) => (
            <div
              key={service}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.preferredServices.includes(service)
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                const current = formData.preferredServices;
                setFormData({
                  ...formData,
                  preferredServices: current.includes(service)
                    ? current.filter((s) => s !== service)
                    : [...current, service],
                });
              }}
            >
              <Checkbox
                checked={formData.preferredServices.includes(service)}
                onCheckedChange={() => {
                  const current = formData.preferredServices;
                  setFormData({
                    ...formData,
                    preferredServices: current.includes(service)
                      ? current.filter((s) => s !== service)
                      : [...current, service],
                  });
                }}
              />
              <Label className="cursor-pointer">{service}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <Label className="text-base">
            Which business needs are most important to your company?
          </Label>
          <span className={cn(
            "text-xs font-medium",
            formData.topNeeds.length >= MAX_BUSINESS_NEED_SELECTIONS ? "text-primary" : "text-muted-foreground"
          )}>
            {formData.topNeeds.length} of {MAX_BUSINESS_NEED_SELECTIONS} selected
          </span>
        </div>
        <FieldHint className="mb-4">
          The priority list for Louisiana companies — pick your top {MAX_BUSINESS_NEED_SELECTIONS}.
          This drives which advisors, trainings, and resources we prioritize for you.
        </FieldHint>
        <div className="grid md:grid-cols-2 gap-3">
          {BUSINESS_NEEDS.map((need) => {
            const selected = formData.topNeeds.includes(need.label);
            const atCap = formData.topNeeds.length >= MAX_BUSINESS_NEED_SELECTIONS;
            return (
              <div
                key={need.rank}
                className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                  selected
                    ? "border-primary bg-primary/5"
                    : atCap
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:bg-muted"
                }`}
                onClick={() => {
                  if (!selected && atCap) return;
                  setFormData({
                    ...formData,
                    topNeeds: selected
                      ? formData.topNeeds.filter((item) => item !== need.label)
                      : [...formData.topNeeds, need.label],
                  });
                }}
              >
                <Checkbox
                  checked={selected}
                  disabled={!selected && atCap}
                  onCheckedChange={() => {
                    if (!selected && atCap) return;
                    setFormData({
                      ...formData,
                      topNeeds: selected
                        ? formData.topNeeds.filter((item) => item !== need.label)
                        : [...formData.topNeeds, need.label],
                    });
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Label className={selected || !atCap ? "cursor-pointer" : "cursor-not-allowed"}>
                      {need.label}
                    </Label>
                    <Badge
                      variant={need.priority === "Critical" ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0 shrink-0"
                    >
                      {need.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {need.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Yes/No button row used by several intake questions. */
function YesNoField({
  label,
  hint,
  value,
  onChange,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-base">
        {label} {required ? "*" : ""}
      </Label>
      {hint && <FieldHint>{hint}</FieldHint>}
      <div className="flex gap-3">
        {[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
              value === opt.value ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OperationsStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        A few operational questions the MBDA enrollment form asks — answering
        them once here means you won&apos;t have to repeat them there.
      </p>

      <div className="space-y-2">
        <Label htmlFor="acquisitionMethod">How do you currently get business? *</Label>
        <Select
          value={formData.acquisitionMethod}
          onValueChange={(value) => setFormData({ ...formData, acquisitionMethod: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {acquisitionMethodOptions.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldHint>
          Shows whether you&apos;re already bid-driven or need help finding
          and pursuing opportunities.
        </FieldHint>
      </div>

      <YesNoField
        label="Is your company open to a teaming arrangement if suggested?"
        hint="Teaming is how small businesses win larger contracts — the matcher can suggest partners from the network."
        required
        value={formData.openToTeaming}
        onChange={(value) => setFormData({ ...formData, openToTeaming: value })}
      />
      <YesNoField
        label="Is your company able to perform work outside your current state?"
        hint="Controls whether match suggestions extend beyond Louisiana."
        required
        value={formData.outOfState}
        onChange={(value) => setFormData({ ...formData, outOfState: value })}
      />
      <YesNoField
        label="Does your company have an in-house business development team?"
        hint="Helps gauge how much hands-on capture and proposal support you'll need."
        required
        value={formData.inHouseBD}
        onChange={(value) => setFormData({ ...formData, inHouseBD: value })}
      />
      <YesNoField
        label="Does your company have resources to invest if recommended?"
        hint="Helps advisors recommend realistic next steps — tools, registrations, travel."
        required
        value={formData.resourcesToInvest}
        onChange={(value) => setFormData({ ...formData, resourcesToInvest: value })}
      />
    </div>
  );
}

export function ProgramStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Which LIFT service(s) best match what you need? *</Label>
        <FieldHint className="mb-4">
          Select all that apply — choosing &quot;Government contracting&quot;
          enables AI opportunity matching for your business.
        </FieldHint>
        <div className="grid gap-3">
          {serviceAreaOptions.map((area) => (
            <div
              key={area}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.serviceArea.includes(area)
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
              onClick={() => {
                const current = formData.serviceArea;
                setFormData({
                  ...formData,
                  serviceArea: current.includes(area)
                    ? current.filter((a) => a !== area)
                    : [...current, area],
                });
              }}
            >
              <Checkbox
                checked={formData.serviceArea.includes(area)}
                onCheckedChange={() => {
                  const current = formData.serviceArea;
                  setFormData({
                    ...formData,
                    serviceArea: current.includes(area)
                      ? current.filter((a) => a !== area)
                      : [...current, area],
                  });
                }}
              />
              <Label className="cursor-pointer">{area}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referralSource">How did you hear about the LIFT Center? *</Label>
        <Select
          value={formData.referralSource}
          onValueChange={(value) => setFormData({ ...formData, referralSource: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            {referralSourceOptions.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldHint>
          Helps LIFT measure outreach — doesn&apos;t affect your matches or
          service plan.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referredBy">Which organization referred you to the Southern LIFT program? *</Label>
        <Select
          value={formData.referredBy}
          onValueChange={(value) => setFormData({ ...formData, referredBy: value, referredByOther: value === "Other" ? formData.referredByOther : "" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select the referring organization" />
          </SelectTrigger>
          <SelectContent>
            {referredByOptions.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.referredBy === "Other" && (
          <Input
            value={formData.referredByOther}
            onChange={(event) => setFormData({ ...formData, referredByOther: event.target.value })}
            placeholder="Name of the organization or person who referred you"
          />
        )}
        <FieldHint>
          Lets the LIFT Center credit the partner organization that sent you —
          a trackable program metric.
        </FieldHint>
      </div>

      <AttachmentsUpload formData={formData} setFormData={setFormData} />

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox
            id="privacyAck"
            checked={formData.privacyAck}
            onCheckedChange={(checked) => setFormData({ ...formData, privacyAck: checked === true })}
          />
          <Label htmlFor="privacyAck" className="cursor-pointer text-sm font-normal leading-relaxed">
            I acknowledge the LIFT Center&apos;s privacy notice and consent to
            be contacted about its services. *
          </Label>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox
            id="aiDisclosure"
            checked={formData.aiDisclosure}
            onCheckedChange={(checked) => setFormData({ ...formData, aiDisclosure: checked === true })}
          />
          <Label htmlFor="aiDisclosure" className="cursor-pointer text-sm font-normal leading-relaxed">
            I understand an AI assistant will summarize my answers and LIFT staff
            will review them before any decision is made. *
          </Label>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <Checkbox
            id="emailOptIn"
            checked={formData.emailOptIn}
            onCheckedChange={(checked) => setFormData({ ...formData, emailOptIn: checked === true })}
          />
          <Label htmlFor="emailOptIn" className="cursor-pointer text-sm font-normal leading-relaxed">
            I agree to receive emails from the Southern LIFT program in the
            future.
          </Label>
        </div>
      </div>
    </div>
  );
}

export function ReviewStep({ formData, setFormData }: { formData: SMEFormData; setFormData: React.Dispatch<React.SetStateAction<SMEFormData>> }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Almost Done!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Review your information below and click Complete to finish setup.
          This profile powers your AI opportunity matching — the more
          complete it is, the better your matches.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Business Information</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Company</dt>
            <dd>{formData.companyName || "Not provided"}</dd>
            <dt className="text-muted-foreground">DUNS/UEI</dt>
            <dd>{formData.dunsUei || "Not provided"}</dd>
            <dt className="text-muted-foreground">Location</dt>
            <dd>
              {formData.city && formData.state
                ? `${formData.city}, ${formData.state}`
                : "Not provided"}
            </dd>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Government Contracting</h4>
          {formData.interestedInGovcon === "yes" ? (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">UEI</dt>
              <dd>{formData.dunsUei || "Not provided"}</dd>
              <dt className="text-muted-foreground">CAGE Code</dt>
              <dd>{formData.cageCode || "Not provided"}</dd>
              <dt className="text-muted-foreground">SAM.gov Status</dt>
              <dd>
                {formData.samRegistered === "registered" && "Registered and active"}
                {formData.samRegistered === "in-progress" && "Registration in progress"}
                {formData.samRegistered === "not-registered" && "Not registered yet"}
                {formData.samRegistered === "unsure" && "Not sure"}
                {!formData.samRegistered && "Not provided"}
              </dd>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not pursuing government contracting right now
            </p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Certifications</h4>
          {formData.certifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((certId) => {
                const cert = certificationTypes.find((c) => c.id === certId);
                return (
                  <Badge key={certId} variant="secondary">
                    {cert?.label}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No certifications selected</p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Needs & Goals</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Seeking financing</dt>
            <dd>{formData.seekingCapital === "yes" ? "Yes" : formData.seekingCapital === "no" ? "No" : "Not provided"}</dd>
            <dt className="text-muted-foreground">Top need</dt>
            <dd>{formData.topNeed || "Not provided"}</dd>
            <dt className="text-muted-foreground">Help wanted</dt>
            <dd>{formData.preferredServices.length > 0 ? formData.preferredServices.join(", ") : "Not provided"}</dd>
            <dt className="text-muted-foreground">Top needs</dt>
            <dd>{formData.topNeeds.length > 0 ? formData.topNeeds.join(", ") : "Not provided"}</dd>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">LIFT Program</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Service areas</dt>
            <dd>{formData.serviceArea.length > 0 ? formData.serviceArea.join(", ") : "Not provided"}</dd>
            <dt className="text-muted-foreground">Heard about us</dt>
            <dd>{formData.referralSource || "Not provided"}</dd>
            <dt className="text-muted-foreground">Referred by</dt>
            <dd>{formData.referredBy ? (formData.referredBy === "Other" && formData.referredByOther ? `${formData.referredBy} — ${formData.referredByOther}` : formData.referredBy) : "Not provided"}</dd>
            <dt className="text-muted-foreground">Documents</dt>
            <dd>{formData.attachmentFiles.length > 0 ? formData.attachmentFiles.map((f) => f.fileName).join(", ") : "None"}</dd>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Operations</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Gets business via</dt>
            <dd>{formData.acquisitionMethod || "Not provided"}</dd>
            <dt className="text-muted-foreground">Open to teaming</dt>
            <dd>{formData.openToTeaming === "yes" ? "Yes" : formData.openToTeaming === "no" ? "No" : "Not provided"}</dd>
            <dt className="text-muted-foreground">Works out of state</dt>
            <dd>{formData.outOfState === "yes" ? "Yes" : formData.outOfState === "no" ? "No" : "Not provided"}</dd>
            <dt className="text-muted-foreground">In-house BD team</dt>
            <dd>{formData.inHouseBD === "yes" ? "Yes" : formData.inHouseBD === "no" ? "No" : "Not provided"}</dd>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Primary Contact</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{formData.contactName || "Not provided"}</dd>
            <dt className="text-muted-foreground">Title</dt>
            <dd>{formData.contactTitle || "Not provided"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{formData.contactEmail || "Not provided"}</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{formData.contactPhone || "Not provided"}</dd>
            <dt className="text-muted-foreground">LinkedIn</dt>
            <dd>{formData.noLinkedin ? "None" : formData.linkedin || "Not provided"}</dd>
            <dt className="text-muted-foreground">Owner ethnicity</dt>
            <dd>{formData.ownerEthnicity || "Not provided"}</dd>
            <dt className="text-muted-foreground">Additional contacts</dt>
            <dd>
              {formData.secondaryContacts.length > 0
                ? formData.secondaryContacts
                    .map((c) => (c.name ? `${c.name} (${c.email})` : c.email))
                    .join(", ")
                : "None"}
            </dd>
          </dl>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <div>
          <h4 className="font-medium">Signature &amp; attestation <span className="text-red-500">*</span></h4>
          <p className="text-sm text-muted-foreground mt-1">
            By signing below, I certify that the information provided in this
            onboarding is true, accurate, and complete to the best of my
            knowledge, and I understand it will be used to determine my
            business&apos;s needs and LIFT program services.
          </p>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={formData.attestationConfirmed}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, attestationConfirmed: checked === true })
            }
            className="mt-0.5"
          />
          I certify that all information provided is accurate and complete.
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signatureName">Digital signature — type your full legal name</Label>
            <Input
              id="signatureName"
              value={formData.signatureName}
              onChange={(e) => setFormData({ ...formData, signatureName: e.target.value })}
              placeholder={formData.contactName || "Full legal name"}
              className="italic"
            />
            <FieldHint>
              Typing your name acts as your electronic signature, recorded with today&apos;s date.
            </FieldHint>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={new Date().toLocaleDateString("en-US")} disabled readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Returns true when any selected NAICS code is in the manufacturing sector (31-33). */
export function isManufacturingBusiness(primaryNaics: string[]): boolean {
  return primaryNaics.some((code) => /^(31|32|33)/.test(code.trim()));
}

export const initialSMEFormData: SMEFormData = {
  companyName: "",
  businessNotRegistered: false,
  dba: "",
  applyingAs: "",
  dunsUei: "",
  cageCode: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  website: "",
  yearEstablished: "",
  employeeCount: "",
  stage: "",
  revenueLast12: "",
  certifications: [],
  certificationsPlanned: [],
  interestedInGovcon: "",
  samRegistered: "",
  soldToGovernment: "",
  primaryNaics: [],
  secondaryNaics: [],
  productsServices: [],
  coreCapabilities: "",
  pastPerformance: "",
  keyDifferentiators: "",
  digitalTools: [],
  capabilityStatementFileId: "",
  capabilityStatementAttachmentId: "",
  capabilityStatementFileName: "",
  wantsCapabilityStatementHelp: false,
  seekingCapital: "",
  capitalPurpose: "",
  capitalAmount: "",
  topNeed: "",
  barriers: "",
  goals12Months: "",
  preferredServices: [],
  topNeeds: [],
  serviceArea: [],
  referralSource: "",
  referredBy: "",
  referredByOther: "",
  acquisitionMethod: "",
  openToTeaming: "",
  outOfState: "",
  inHouseBD: "",
  resourcesToInvest: "",
  aiDisclosure: false,
  privacyAck: false,
  emailOptIn: false,
  attachmentFiles: [],
  contactName: "",
  contactTitle: "",
  contactEmail: "",
  contactPhone: "",
  mobilePhone: "",
  linkedin: "",
  noLinkedin: false,
  ownerEthnicity: "",
  secondaryContacts: [],
  preferredContactMethod: "",
  signatureName: "",
  attestationConfirmed: false,
};
