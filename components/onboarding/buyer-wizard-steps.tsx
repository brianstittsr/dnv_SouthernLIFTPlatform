"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { FieldHint } from "@/components/ui/field-hint";

const agencyTypes = [
  { id: "federal", label: "Federal Government" },
  { id: "state", label: "State Government" },
  { id: "local", label: "Local Government" },
  { id: "prime", label: "Prime Contractor" },
];

const roleTypes = [
  { id: "co", label: "Contracting Officer (CO/KO)" },
  { id: "sbs", label: "Small Business Specialist" },
  { id: "pm", label: "Program Manager" },
  { id: "subk", label: "Subcontracting Manager" },
  { id: "other", label: "Other" },
];

const certificationPreferences = [
  { id: "8a", label: "8(a)" },
  { id: "wosb", label: "WOSB/EDWOSB" },
  { id: "sdvosb", label: "SDVOSB" },
  { id: "hubzone", label: "HUBZone" },
  { id: "any", label: "Any Small Business" },
];

const contractTypes = [
  { id: "ffp", label: "Firm Fixed Price (FFP)" },
  { id: "tm", label: "Time & Materials (T&M)" },
  { id: "idiq", label: "IDIQ" },
  { id: "bpa", label: "BPA" },
  { id: "gsa", label: "GSA Schedule" },
  { id: "other", label: "Other" },
];

interface BuyerFormData {
  agencyName: string;
  agencyType: string;
  officeDivision: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  jobTitle: string;
  roleType: string;
  procurementAuthority: string;
  annualBudget: string;
  naicsInterests: string[];
  certificationPreferences: string[];
  geographicPreferences: string;
  contractTypes: string[];
  preferredContactMethod: string;
  availabilityForIntros: string;
  meetingPreferences: string;
  additionalNotes: string;
}

interface StepProps {
  formData: BuyerFormData;
  setFormData: React.Dispatch<React.SetStateAction<BuyerFormData>>;
}

export function AgencyInfoStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agencyName">Agency/Organization Name *</Label>
          <Input
            id="agencyName"
            value={formData.agencyName}
            onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
            placeholder="Department of Defense"
          />
          <FieldHint>
            The agency or prime you buy for — small businesses use this to
            identify relevant contracting partners.
          </FieldHint>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agencyType">Agency Type *</Label>
          <Select
            value={formData.agencyType}
            onValueChange={(value) => setFormData({ ...formData, agencyType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {agencyTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHint>
            Determines which suppliers and small-business programs are
            matched to you.
          </FieldHint>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="officeDivision">Office/Division</Label>
        <Input
          id="officeDivision"
          value={formData.officeDivision}
          onChange={(e) => setFormData({ ...formData, officeDivision: e.target.value })}
          placeholder="Office of Small Business Programs"
        />
        <FieldHint>
          Routes introductions to the right buyers inside your organization.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="1400 Defense Pentagon"
        />
        <FieldHint>
          Used for geographic matching with nearby small businesses.
        </FieldHint>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Washington"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="DC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            placeholder="20301"
          />
        </div>
      </div>
    </div>
  );
}

export function RoleStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="Contracting Officer"
          />
          <FieldHint>
            Shown to businesses so they know who they&apos;re connecting with.
          </FieldHint>
        </div>
        <div className="space-y-2">
          <Label htmlFor="roleType">Role Type *</Label>
          <Select
            value={formData.roleType}
            onValueChange={(value) => setFormData({ ...formData, roleType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roleTypes.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldHint>
            Tells the matcher what kind of supplier relationships to suggest.
          </FieldHint>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="procurementAuthority">Procurement Authority Level</Label>
          <Select
            value={formData.procurementAuthority}
            onValueChange={(value) => setFormData({ ...formData, procurementAuthority: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unlimited">Unlimited</SelectItem>
              <SelectItem value="10m">Up to $10M</SelectItem>
              <SelectItem value="1m">Up to $1M</SelectItem>
              <SelectItem value="250k">Up to $250K</SelectItem>
              <SelectItem value="micropurchase">Micro-purchase only</SelectItem>
              <SelectItem value="none">No direct authority</SelectItem>
            </SelectContent>
          </Select>
          <FieldHint>
            Sets expectations for the contract sizes suppliers pursue with
            you.
          </FieldHint>
        </div>
        <div className="space-y-2">
          <Label htmlFor="annualBudget">Annual Procurement Budget Range</Label>
          <Select
            value={formData.annualBudget}
            onValueChange={(value) => setFormData({ ...formData, annualBudget: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100m+">$100M+</SelectItem>
              <SelectItem value="50m-100m">$50M - $100M</SelectItem>
              <SelectItem value="10m-50m">$10M - $50M</SelectItem>
              <SelectItem value="1m-10m">$1M - $10M</SelectItem>
              <SelectItem value="under1m">Under $1M</SelectItem>
              <SelectItem value="unknown">Unknown/Varies</SelectItem>
            </SelectContent>
          </Select>
          <FieldHint>
            Helps the matcher prioritize suppliers ready for your typical
            award sizes.
          </FieldHint>
        </div>
      </div>
    </div>
  );
}

export function ProcurementInterestsStep({ formData, setFormData }: StepProps) {
  const toggleCertPref = (certId: string) => {
    const current = formData.certificationPreferences;
    if (current.includes(certId)) {
      setFormData({
        ...formData,
        certificationPreferences: current.filter((c) => c !== certId),
      });
    } else {
      setFormData({
        ...formData,
        certificationPreferences: [...current, certId],
      });
    }
  };

  const toggleContractType = (typeId: string) => {
    const current = formData.contractTypes;
    if (current.includes(typeId)) {
      setFormData({
        ...formData,
        contractTypes: current.filter((c) => c !== typeId),
      });
    } else {
      setFormData({
        ...formData,
        contractTypes: [...current, typeId],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base">Certification Preferences</Label>
        <FieldHint className="mb-4">
          What types of certified businesses are you looking for? The matcher
          filters supplier suggestions to these set-asides.
        </FieldHint>
        <div className="grid md:grid-cols-2 gap-3">
          {certificationPreferences.map((cert) => (
            <div
              key={cert.id}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.certificationPreferences.includes(cert.id)
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
              onClick={() => toggleCertPref(cert.id)}
            >
              <Checkbox
                checked={formData.certificationPreferences.includes(cert.id)}
                onCheckedChange={() => toggleCertPref(cert.id)}
              />
              <Label className="cursor-pointer">{cert.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base">Contract Types</Label>
        <FieldHint className="mb-4">
          What contract vehicles do you typically use? Matches you with
          businesses experienced on those vehicles.
        </FieldHint>
        <div className="grid md:grid-cols-3 gap-3">
          {contractTypes.map((type) => (
            <div
              key={type.id}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.contractTypes.includes(type.id)
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
              }`}
              onClick={() => toggleContractType(type.id)}
            >
              <Checkbox
                checked={formData.contractTypes.includes(type.id)}
                onCheckedChange={() => toggleContractType(type.id)}
              />
              <Label className="cursor-pointer">{type.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="geographicPreferences">Geographic Preferences</Label>
        <Input
          id="geographicPreferences"
          value={formData.geographicPreferences}
          onChange={(e) => setFormData({ ...formData, geographicPreferences: e.target.value })}
          placeholder="e.g., DMV area, Nationwide, Specific states..."
        />
        <FieldHint>
          Limits supplier matches to the regions you operate in.
        </FieldHint>
      </div>
    </div>
  );
}

export function ContactPreferencesStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
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
          <FieldHint>
            How suppliers should reach you about opportunities.
          </FieldHint>
        </div>
        <div className="space-y-2">
          <Label htmlFor="availabilityForIntros">Availability for Introductions</Label>
          <Select
            value={formData.availabilityForIntros}
            onValueChange={(value) => setFormData({ ...formData, availabilityForIntros: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediately available</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="asneeded">As needed</SelectItem>
            </SelectContent>
          </Select>
          <FieldHint>
            How quickly you want supplier introductions scheduled.
          </FieldHint>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meetingPreferences">Meeting Preferences</Label>
        <Select
          value={formData.meetingPreferences}
          onValueChange={(value) => setFormData({ ...formData, meetingPreferences: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="virtual">Virtual Only</SelectItem>
            <SelectItem value="inperson">In-Person Only</SelectItem>
            <SelectItem value="phone">Phone Only</SelectItem>
            <SelectItem value="any">Any Format</SelectItem>
          </SelectContent>
        </Select>
        <FieldHint>
          How you prefer first meetings with matched suppliers.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          placeholder="Any additional information about your procurement needs or preferences..."
          rows={4}
        />
        <FieldHint>
          Anything else that improves match quality — niches, timelines,
          upcoming requirements.
        </FieldHint>
      </div>
    </div>
  );
}

export function BuyerReviewStep({ formData }: { formData: BuyerFormData }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Almost Done!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Review your information below and click Complete to start browsing SMEs.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Agency Information</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Agency</dt>
            <dd>{formData.agencyName || "Not provided"}</dd>
            <dt className="text-muted-foreground">Type</dt>
            <dd>
              {agencyTypes.find((t) => t.id === formData.agencyType)?.label || "Not provided"}
            </dd>
            <dt className="text-muted-foreground">Office</dt>
            <dd>{formData.officeDivision || "Not provided"}</dd>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Role</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Title</dt>
            <dd>{formData.jobTitle || "Not provided"}</dd>
            <dt className="text-muted-foreground">Role Type</dt>
            <dd>
              {roleTypes.find((r) => r.id === formData.roleType)?.label || "Not provided"}
            </dd>
          </dl>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Procurement Interests</h4>
          {formData.certificationPreferences.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.certificationPreferences.map((certId) => {
                const cert = certificationPreferences.find((c) => c.id === certId);
                return (
                  <Badge key={certId} variant="secondary">
                    {cert?.label}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No preferences selected</p>
          )}
        </div>
      </div>
    </div>
  );
}

export const initialBuyerFormData: BuyerFormData = {
  agencyName: "",
  agencyType: "",
  officeDivision: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  jobTitle: "",
  roleType: "",
  procurementAuthority: "",
  annualBudget: "",
  naicsInterests: [],
  certificationPreferences: [],
  geographicPreferences: "",
  contractTypes: [],
  preferredContactMethod: "",
  availabilityForIntros: "",
  meetingPreferences: "",
  additionalNotes: "",
};
