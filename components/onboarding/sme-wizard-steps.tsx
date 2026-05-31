"use client";

import { useState } from "react";
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
import { Plus, X, Upload, FileText, CheckCircle2 } from "lucide-react";

const certificationTypes = [
  { id: "8a", label: "8(a) Certified" },
  { id: "wosb", label: "WOSB" },
  { id: "edwosb", label: "EDWOSB" },
  { id: "sdvosb", label: "SDVOSB" },
  { id: "hubzone", label: "HUBZone" },
  { id: "other", label: "Other" },
];

const naicsCodes = [
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

interface SMEFormData {
  companyName: string;
  dunsUei: string;
  cageCode: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  yearEstablished: string;
  employeeCount: string;
  certifications: string[];
  primaryNaics: string[];
  secondaryNaics: string[];
  coreCapabilities: string;
  pastPerformance: string;
  keyDifferentiators: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  secondaryContactName: string;
  secondaryContactEmail: string;
  preferredContactMethod: string;
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
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Your Company, LLC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dunsUei">DUNS/UEI number *</Label>
          <Input
            id="dunsUei"
            value={formData.dunsUei}
            onChange={(e) => setFormData({ ...formData, dunsUei: e.target.value })}
            placeholder="123456789"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cageCode">CAGE Code</Label>
          <Input
            id="cageCode"
            value={formData.cageCode}
            onChange={(e) => setFormData({ ...formData, cageCode: e.target.value })}
            placeholder="1ABC2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://yourcompany.com"
          />
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeCount">number of Employees</Label>
          <Select
            value={formData.employeeCount}
            onValueChange={(value) => setFormData({ ...formData, employeeCount: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10</SelectItem>
              <SelectItem value="11-50">11-50</SelectItem>
              <SelectItem value="51-100">51-100</SelectItem>
              <SelectItem value="101-250">101-250</SelectItem>
              <SelectItem value="251-500">251-500</SelectItem>
              <SelectItem value="500+">500+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function CertificationsStep({ formData, setFormData }: StepProps) {
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

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Select Your Certifications</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose all certifications that apply to your business
        </p>
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

      <p className="text-sm text-muted-foreground">
        You'll be able to upload certification documents in a later step.
      </p>
    </div>
  );
}

export function CapabilitiesStep({ formData, setFormData }: StepProps) {
  const [selectedNaics, setSelectedNaics] = useState("");

  const addPrimaryNaics = () => {
    if (selectedNaics && !formData.primaryNaics.includes(selectedNaics) && formData.primaryNaics.length < 5) {
      setFormData({
        ...formData,
        primaryNaics: [...formData.primaryNaics, selectedNaics],
      });
      setSelectedNaics("");
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
          Select up to 5 primary NAICS codes that best describe your services
        </p>
        <div className="flex gap-2">
          <Select value={selectedNaics} onValueChange={setSelectedNaics} disabled={maxCodesReached}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select NAICS code" />
            </SelectTrigger>
            <SelectContent>
              {naicsCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={addPrimaryNaics}
            disabled={!selectedNaics || maxCodesReached}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
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
        <Label htmlFor="coreCapabilities">Core Capabilities *</Label>
        <Textarea
          id="coreCapabilities"
          value={formData.coreCapabilities}
          onChange={(e) => setFormData({ ...formData, coreCapabilities: e.target.value })}
          placeholder="Describe your company's core capabilities and services..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pastPerformance">Past Performance Summary</Label>
        <Textarea
          id="pastPerformance"
          value={formData.pastPerformance}
          onChange={(e) => setFormData({ ...formData, pastPerformance: e.target.value })}
          placeholder="Summarize your relevant past performance and contract experience..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyDifferentiators">Key Differentiators</Label>
        <Textarea
          id="keyDifferentiators"
          value={formData.keyDifferentiators}
          onChange={(e) => setFormData({ ...formData, keyDifferentiators: e.target.value })}
          placeholder="What makes your company unique? What sets you apart from competitors?"
          rows={3}
        />
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
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
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4">Secondary Contact (Optional)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="secondaryContactName">Full Name</Label>
            <Input
              id="secondaryContactName"
              value={formData.secondaryContactName}
              onChange={(e) => setFormData({ ...formData, secondaryContactName: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryContactEmail">Email</Label>
            <Input
              id="secondaryContactEmail"
              type="email"
              value={formData.secondaryContactEmail}
              onChange={(e) => setFormData({ ...formData, secondaryContactEmail: e.target.value })}
              placeholder="jane@company.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProofPackStep() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">Upload Your Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop files here, or click to browse
        </p>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Choose Files
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Recommended Documents:</h4>
        <div className="space-y-2">
          {[
            { name: "Capability Statement", required: true },
            { name: "W-9 Form", required: false },
            { name: "Certificate of Insurance", required: false },
            { name: "Past Performance References", required: false },
            { name: "Certification Documents", required: false },
          ].map((doc) => (
            <div
              key={doc.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span>{doc.name}</span>
                {doc.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                Upload
              </Button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        You can always add more documents later from your profile.
      </p>
    </div>
  );
}

export function ReviewStep({ formData }: { formData: SMEFormData }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Almost Done!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Review your information below and click Complete to finish setup.
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
          <h4 className="font-medium mb-2">Primary Contact</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{formData.contactName || "Not provided"}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{formData.contactEmail || "Not provided"}</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{formData.contactPhone || "Not provided"}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export const initialSMEFormData: SMEFormData = {
  companyName: "",
  dunsUei: "",
  cageCode: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  website: "",
  yearEstablished: "",
  employeeCount: "",
  certifications: [],
  primaryNaics: [],
  secondaryNaics: [],
  coreCapabilities: "",
  pastPerformance: "",
  keyDifferentiators: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  secondaryContactName: "",
  secondaryContactEmail: "",
  preferredContactMethod: "",
};
