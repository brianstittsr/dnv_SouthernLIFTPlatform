"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Plus, Check, AlertCircle, Building2, Users, Package, Factory } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessProfile {
  businessType: 'contractor' | 'buyer' | 'supplier' | 'oem';
  companyName: string;
  samUEI: string;
  naicsCodes: NAICSCode[];
  certifications: Certification[];
  capabilities: string[];
  companyDescription: string;
  contactInfo: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };
}

interface NAICSCode {
  code: string;
  description: string;
  relevance: 'primary' | 'secondary';
  experience: number;
}

interface Certification {
  type: 'CMMC' | 'ISO' | '8(a)' | 'WOSB' | 'HUBZone' | 'Other';
  level?: string;
  issuedBy: string;
  issuedDate: string;
  expiresDate?: string;
  documentUrl?: string;
}

const BUSINESS_TYPES = [
  { value: 'contractor', label: 'Government Contractor', icon: Building2 },
  { value: 'buyer', label: 'Government Buyer', icon: Users },
  { value: 'supplier', label: 'Manufacturing Supplier', icon: Package },
  { value: 'oem', label: 'Manufacturing OEM', icon: Factory },
];

const CERTIFICATION_TYPES = [
  'CMMC', 'ISO', '8(a)', 'WOSB', 'HUBZone', 'Other'
];

const COMMON_NAICS_CODES = [
  { code: '541330', description: 'Engineering Services' },
  { code: '541519', description: 'Other Computer Related Services' },
  { code: '541690', description: 'Other Scientific and Technical Consulting Services' },
  { code: '561210', description: 'Facilities Support Services' },
  { code: '811212', description: 'Electronic and Precision Equipment Repair and Maintenance' },
  { code: '332994', description: 'Small Arms Ammunition Manufacturing' },
  { code: '332991', description: 'Small Arms Manufacturing' },
  { code: '336413', description: 'Aircraft Engine and Engine Parts Manufacturing' },
];

export function BusinessProfileWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateProfile = useCallback((updates: Partial<BusinessProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const addNAICSCode = useCallback((code: NAICSCode) => {
    setProfile(prev => ({
      ...prev,
      naicsCodes: [...(prev.naicsCodes || []), code]
    }));
  }, []);

  const removeNAICSCode = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      naicsCodes: prev.naicsCodes?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const addCertification = useCallback((cert: Certification) => {
    setProfile(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), cert]
    }));
  }, []);

  const removeCertification = useCallback((index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error('Failed to save profile');

      toast.success('Business profile saved successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BusinessTypeStep profile={profile} updateProfile={updateProfile} />;
      case 1:
        return <CompanyInfoStep profile={profile} updateProfile={updateProfile} />;
      case 2:
        return <NAICSCodesStep 
          profile={profile} 
          addNAICSCode={addNAICSCode}
          removeNAICSCode={removeNAICSCode}
        />;
      case 3:
        return <CertificationsStep 
          profile={profile}
          addCertification={addCertification}
          removeCertification={removeCertification}
        />;
      case 4:
        return <ContactInfoStep profile={profile} updateProfile={updateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Complete Your Business Profile
          </h1>
          <p className="text-slate-600">
            Help us match you with the right opportunities
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={isSubmitting}
          >
            {currentStep === totalSteps - 1 ? 'Complete Profile' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BusinessTypeStep({ profile, updateProfile }: { profile: Partial<BusinessProfile>, updateProfile: Function }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">What type of business are you?</h2>
        <p className="text-slate-600">Select the option that best describes your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BUSINESS_TYPES.map(({ value, label, icon: Icon }) => (
          <Card
            key={value}
            className={`cursor-pointer transition-all ${
              profile.businessType === value
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-slate-50'
            }`}
            onClick={() => updateProfile({ businessType: value as any })}
          >
            <CardContent className="p-6 text-center">
              <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">{label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CompanyInfoStep({ profile, updateProfile }: { profile: Partial<BusinessProfile>, updateProfile: Function }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Company Information</h2>
        <p className="text-slate-600">Tell us about your organization</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            value={profile.companyName || ''}
            onChange={(e) => updateProfile({ companyName: e.target.value })}
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <Label htmlFor="samUEI">SAM.gov UEI *</Label>
          <Input
            id="samUEI"
            value={profile.samUEI || ''}
            onChange={(e) => updateProfile({ samUEI: e.target.value })}
            placeholder="Enter your SAM.gov Unique Entity ID"
          />
        </div>

        <div>
          <Label htmlFor="companyDescription">Company Description</Label>
          <Textarea
            id="companyDescription"
            value={profile.companyDescription || ''}
            onChange={(e) => updateProfile({ companyDescription: e.target.value })}
            placeholder="Briefly describe your company and what you do"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function NAICSCodesStep({ 
  profile, 
  addNAICSCode, 
  removeNAICSCode 
}: { 
  profile: Partial<BusinessProfile>, 
  addNAICSCode: Function,
  removeNAICSCode: Function
}) {
  const [selectedCode, setSelectedCode] = useState('');
  const [relevance, setRelevance] = useState<'primary' | 'secondary'>('primary');
  const [experience, setExperience] = useState(0);

  const handleAddCode = () => {
    const commonCode = COMMON_NAICS_CODES.find(c => c.code === selectedCode);
    if (commonCode && (profile.naicsCodes?.length || 0) < 5) {
      addNAICSCode({
        code: commonCode.code,
        description: commonCode.description,
        relevance,
        experience
      });
      setSelectedCode('');
      setExperience(0);
    }
  };

  const maxCodesReached = (profile.naicsCodes?.length || 0) >= 5;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">NAICS Codes</h2>
        <p className="text-slate-600">Add up to 5 NAICS codes for better opportunity matching</p>
      </div>

      {/* Add New Code */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="naicsCode">NAICS Code</Label>
              <Select value={selectedCode} onValueChange={setSelectedCode} disabled={maxCodesReached}>
                <SelectTrigger>
                  <SelectValue placeholder="Select NAICS code" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_NAICS_CODES.map(({ code, description }) => (
                    <SelectItem key={code} value={code}>
                      {code} - {description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="relevance">Relevance</Label>
              <Select value={relevance} onValueChange={(value: any) => setRelevance(value)} disabled={maxCodesReached}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Years Experience</Label>
              <Input
                id="experience"
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                min="0"
                disabled={maxCodesReached}
              />
            </div>
          </div>

          <Button onClick={handleAddCode} className="mt-4" disabled={!selectedCode || maxCodesReached}>
            <Plus className="h-4 w-4 mr-2" />
            Add NAICS Code
          </Button>
          
          {maxCodesReached && (
            <p className="text-sm text-muted-foreground mt-2">
              Maximum of 5 NAICS codes reached. Remove a code to add another.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Existing Codes */}
      {profile.naicsCodes && profile.naicsCodes.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Your NAICS Codes</h3>
              <Badge variant="outline">
                {profile.naicsCodes.length} / 5
              </Badge>
            </div>
            <div className="space-y-2">
              {profile.naicsCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{code.code}</div>
                    <div className="text-sm text-slate-600">{code.description}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={code.relevance === 'primary' ? 'default' : 'secondary'}>
                        {code.relevance}
                      </Badge>
                      <span className="text-xs text-slate-500">{code.experience} years</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNAICSCode(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CertificationsStep({ 
  profile, 
  addCertification, 
  removeCertification 
}: { 
  profile: Partial<BusinessProfile>, 
  addCertification: Function,
  removeCertification: Function
}) {
  const [cert, setCert] = useState<Partial<Certification>>({});

  const handleAddCertification = () => {
    if (cert.type && cert.issuedBy && cert.issuedDate) {
      addCertification(cert as Certification);
      setCert({});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Certifications</h2>
        <p className="text-slate-600">Add your business certifications and credentials</p>
      </div>

      {/* Add New Certification */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certType">Certification Type *</Label>
              <Select value={cert.type} onValueChange={(value: any) => setCert({ ...cert, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certification" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="certLevel">Level (if applicable)</Label>
              <Input
                id="certLevel"
                value={cert.level || ''}
                onChange={(e) => setCert({ ...cert, level: e.target.value })}
                placeholder="e.g., Level 2, ISO 9001"
              />
            </div>

            <div>
              <Label htmlFor="issuedBy">Issued By *</Label>
              <Input
                id="issuedBy"
                value={cert.issuedBy || ''}
                onChange={(e) => setCert({ ...cert, issuedBy: e.target.value })}
                placeholder="Organization name"
              />
            </div>

            <div>
              <Label htmlFor="issuedDate">Issue Date *</Label>
              <Input
                id="issuedDate"
                type="date"
                value={cert.issuedDate || ''}
                onChange={(e) => setCert({ ...cert, issuedDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="expiresDate">Expiration Date</Label>
              <Input
                id="expiresDate"
                type="date"
                value={cert.expiresDate || ''}
                onChange={(e) => setCert({ ...cert, expiresDate: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleAddCertification} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </CardContent>
      </Card>

      {/* Existing Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Your Certifications</h3>
            <div className="space-y-2">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{cert.type} {cert.level && `- ${cert.level}`}</div>
                    <div className="text-sm text-slate-600">
                      Issued by {cert.issuedBy} • {cert.issuedDate}
                      {cert.expiresDate && ` • Expires ${cert.expiresDate}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ContactInfoStep({ profile, updateProfile }: { profile: Partial<BusinessProfile>, updateProfile: Function }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
        <p className="text-slate-600">Primary contact person for your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={profile.contactInfo?.firstName || ''}
            onChange={(e) => updateProfile({
              contactInfo: { ...profile.contactInfo, firstName: e.target.value }
            })}
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={profile.contactInfo?.lastName || ''}
            onChange={(e) => updateProfile({
              contactInfo: { ...profile.contactInfo, lastName: e.target.value }
            })}
          />
        </div>

        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={profile.contactInfo?.title || ''}
            onChange={(e) => updateProfile({
              contactInfo: { ...profile.contactInfo, title: e.target.value }
            })}
            placeholder="e.g., CEO, Program Manager"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={profile.contactInfo?.phone || ''}
            onChange={(e) => updateProfile({
              contactInfo: { ...profile.contactInfo, phone: e.target.value }
            })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={profile.contactInfo?.email || ''}
            onChange={(e) => updateProfile({
              contactInfo: { ...profile.contactInfo, email: e.target.value }
            })}
            placeholder="contact@company.com"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Review Your Information</h4>
            <p className="text-blue-800 text-sm mt-1">
              Please ensure all information is accurate. This will be used for opportunity matching 
              and partner recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
