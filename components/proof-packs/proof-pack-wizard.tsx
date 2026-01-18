"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Target, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  Shield,
  Award,
  FileCheck,
  TrendingUp
} from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "basic-info",
    title: "Basic Information",
    description: "Name and describe your Proof Pack",
    icon: FileText,
  },
  {
    id: "lane-selection",
    title: "Lane Selection",
    description: "Choose your target market",
    icon: Target,
  },
  {
    id: "document-categories",
    title: "Document Categories",
    description: "Select required document types",
    icon: FileCheck,
  },
  {
    id: "document-upload",
    title: "Upload Documents",
    description: "Add your compliance documents",
    icon: Upload,
  },
  {
    id: "gap-analysis",
    title: "Gap Analysis",
    description: "Review your Pack Health score",
    icon: TrendingUp,
  },
];

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  weight: number;
  examples: string[];
}

const GOVERNMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: "capability-statement",
    name: "Capability Statement",
    description: "Company overview and core competencies",
    required: true,
    weight: 15,
    examples: ["Company profile", "Core capabilities", "NAICS codes"],
  },
  {
    id: "certifications",
    name: "Certifications & Registrations",
    description: "SAM.gov, CAGE code, certifications",
    required: true,
    weight: 20,
    examples: ["SAM.gov registration", "CAGE code", "8(a)", "WOSB", "SDVOSB"],
  },
  {
    id: "past-performance",
    name: "Past Performance",
    description: "Government contract history",
    required: true,
    weight: 25,
    examples: ["Contract awards", "CPARs", "Reference letters"],
  },
  {
    id: "compliance-docs",
    name: "Compliance Documentation",
    description: "ISO, CMMC, security clearances",
    required: false,
    weight: 15,
    examples: ["ISO 9001", "CMMC certification", "Facility clearance"],
  },
  {
    id: "financial-docs",
    name: "Financial Documentation",
    description: "Financial stability evidence",
    required: false,
    weight: 10,
    examples: ["D&B report", "Financial statements", "Bonding capacity"],
  },
  {
    id: "case-studies",
    name: "Case Studies",
    description: "Detailed project examples",
    required: false,
    weight: 15,
    examples: ["Project summaries", "Success stories", "Technical solutions"],
  },
];

const COMMERCIAL_CATEGORIES: DocumentCategory[] = [
  {
    id: "company-profile",
    name: "Company Profile",
    description: "Business overview and value proposition",
    required: true,
    weight: 15,
    examples: ["Company overview", "Mission/vision", "Key differentiators"],
  },
  {
    id: "certifications",
    name: "Industry Certifications",
    description: "Quality and compliance certifications",
    required: true,
    weight: 20,
    examples: ["ISO certifications", "Industry standards", "Safety certifications"],
  },
  {
    id: "customer-references",
    name: "Customer References",
    description: "Commercial client testimonials",
    required: true,
    weight: 25,
    examples: ["Reference letters", "Testimonials", "Case studies"],
  },
  {
    id: "technical-specs",
    name: "Technical Specifications",
    description: "Product/service specifications",
    required: false,
    weight: 15,
    examples: ["Product specs", "Service descriptions", "Technical capabilities"],
  },
  {
    id: "quality-assurance",
    name: "Quality Assurance",
    description: "QA processes and documentation",
    required: false,
    weight: 10,
    examples: ["QA procedures", "Testing protocols", "Quality metrics"],
  },
  {
    id: "portfolio",
    name: "Portfolio/Examples",
    description: "Work samples and deliverables",
    required: false,
    weight: 15,
    examples: ["Project portfolio", "Product samples", "Deliverable examples"],
  },
];

interface ProofPackWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export function ProofPackWizard({ onComplete, onCancel }: ProofPackWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lane: "", // "government" or "commercial"
    selectedCategories: [] as string[],
    documents: {} as Record<string, File[]>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const categories = formData.lane === "government" ? GOVERNMENT_CATEGORIES : COMMERCIAL_CATEGORIES;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStepData.id === "basic-info") {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }
    }

    if (currentStepData.id === "lane-selection") {
      if (!formData.lane) {
        newErrors.lane = "Please select a lane";
      }
    }

    if (currentStepData.id === "document-categories") {
      const requiredCategories = categories.filter(c => c.required);
      const selectedRequired = requiredCategories.filter(c => 
        formData.selectedCategories.includes(c.id)
      );
      if (selectedRequired.length < requiredCategories.length) {
        newErrors.categories = "Please select all required categories";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < WIZARD_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleComplete = () => {
    const packHealthScore = calculatePackHealth();
    onComplete({
      ...formData,
      packHealth: packHealthScore,
    });
  };

  const calculatePackHealth = () => {
    let totalScore = 0;
    let maxScore = 0;

    categories.forEach(category => {
      maxScore += category.weight;
      if (formData.selectedCategories.includes(category.id)) {
        const docs = formData.documents[category.id] || [];
        if (docs.length > 0) {
          totalScore += category.weight;
        } else {
          // Partial credit for selecting but not uploading
          totalScore += category.weight * 0.3;
        }
      }
    });

    const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const isEligibleForIntroductions = overallScore >= 70;

    return {
      overallScore,
      isEligibleForIntroductions,
      categoryScores: categories.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        hasDocuments: (formData.documents[cat.id] || []).length > 0,
        isSelected: formData.selectedCategories.includes(cat.id),
      })),
    };
  };

  const handleFileUpload = (categoryId: string, files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [categoryId]: [...(prev.documents[categoryId] || []), ...fileArray],
      },
    }));
  };

  const removeFile = (categoryId: string, fileIndex: number) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [categoryId]: prev.documents[categoryId].filter((_, i) => i !== fileIndex),
      },
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "basic-info":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Proof Pack Title *</Label>
              <Input
                id="title"
                placeholder="e.g., DoD Manufacturing Capabilities 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this Proof Pack demonstrates (capabilities, certifications, target buyers, etc.)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                This helps buyers understand your focus and qualifications at a glance.
              </p>
            </div>
          </div>
        );

      case "lane-selection":
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select the lane that best matches your target market. This determines which document categories are required.
              </AlertDescription>
            </Alert>

            <RadioGroup
              value={formData.lane}
              onValueChange={(value) => setFormData({ ...formData, lane: value, selectedCategories: [] })}
            >
              <Card className={`cursor-pointer transition-all ${formData.lane === "government" ? "border-primary ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="government" id="government" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <Label htmlFor="government" className="text-lg font-semibold cursor-pointer">
                          Government Lane
                        </Label>
                      </div>
                      <CardDescription>
                        For DoD, federal agencies, and government procurement opportunities. Requires SAM.gov registration, CAGE code, and government-specific compliance documentation.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className={`cursor-pointer transition-all ${formData.lane === "commercial" ? "border-primary ring-2 ring-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value="commercial" id="commercial" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-green-600" />
                        <Label htmlFor="commercial" className="text-lg font-semibold cursor-pointer">
                          Commercial Lane
                        </Label>
                      </div>
                      <CardDescription>
                        For Battery/EV OEMs, Biopharma, and commercial procurement opportunities. Focuses on industry certifications, customer references, and technical capabilities.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </RadioGroup>

            {errors.lane && (
              <p className="text-sm text-red-500">{errors.lane}</p>
            )}
          </div>
        );

      case "document-categories":
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select the document categories you'll include. Required categories are marked with an asterisk (*) and have higher weight in your Pack Health score.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all ${
                    formData.selectedCategories.includes(category.id)
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={formData.selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">
                            {category.name}
                            {category.required && <span className="text-red-500">*</span>}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {category.weight}% weight
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {category.description}
                        </CardDescription>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {category.examples.map((example, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-secondary px-2 py-0.5 rounded"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {errors.categories && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.categories}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "document-upload":
        return (
          <div className="space-y-6">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Upload documents for each selected category. Your Pack Health score increases as you add documents. You can add more documents later.
              </AlertDescription>
            </Alert>

            {formData.selectedCategories.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No categories selected. Please go back and select document categories first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {categories
                  .filter(cat => formData.selectedCategories.includes(cat.id))
                  .map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          {category.name}
                          {category.required && <span className="text-red-500">*</span>}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(category.id, e.target.files)}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Accepted: PDF, Word, Images (Max 10MB per file)
                          </p>
                        </div>

                        {formData.documents[category.id]?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Uploaded ({formData.documents[category.id].length}):
                            </p>
                            {formData.documents[category.id].map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-secondary rounded text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(category.id, idx);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        );

      case "gap-analysis":
        const packHealth = calculatePackHealth();
        const missingRequired = categories
          .filter(cat => cat.required && !formData.selectedCategories.includes(cat.id));
        const selectedWithoutDocs = categories
          .filter(cat => 
            formData.selectedCategories.includes(cat.id) && 
            (formData.documents[cat.id] || []).length === 0
          );

        return (
          <div className="space-y-6">
            <Card className={packHealth.isEligibleForIntroductions ? "border-green-500" : "border-yellow-500"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Pack Health Score</CardTitle>
                  <div className={`text-4xl font-bold ${
                    packHealth.overallScore >= 70 ? "text-green-600" :
                    packHealth.overallScore >= 40 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {packHealth.overallScore}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={packHealth.overallScore} className="h-3" />
                
                {packHealth.isEligibleForIntroductions ? (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Excellent!</strong> Your Pack Health score is ≥70. You're eligible for buyer introductions!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Almost there!</strong> You need a score of ≥70 to be eligible for buyer introductions. Add more documents to improve your score.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {missingRequired.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Required Categories:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {missingRequired.map(cat => (
                      <li key={cat.id}>{cat.name} ({cat.weight}% weight)</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {selectedWithoutDocs.length > 0 && (
              <Alert className="border-yellow-500">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Categories Without Documents:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {selectedWithoutDocs.map(cat => (
                      <li key={cat.id}>{cat.name} - Upload documents to gain {cat.weight}% score</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {packHealth.categoryScores.map((score) => {
                    const category = categories.find(c => c.id === score.categoryId);
                    if (!category || !score.isSelected) return null;

                    return (
                      <div key={score.categoryId} className="flex items-center justify-between p-3 bg-secondary rounded">
                        <div className="flex items-center gap-2">
                          {score.hasDocuments ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="font-medium">{score.categoryName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {category.weight}% weight
                          </span>
                          {score.hasDocuments ? (
                            <Badge variant="default">Complete</Badge>
                          ) : (
                            <Badge variant="secondary">Needs Documents</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> After creating this Proof Pack, you can continue adding documents to improve your score. Once you reach ≥70, you can submit for QA review and become eligible for buyer introductions.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create Proof Pack</h2>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mb-6">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : isComplete
                    ? "border-green-500 bg-green-50"
                    : "border-border bg-background"
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                    ? "bg-green-500 text-white"
                    : "bg-muted"
                }`}>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${isActive ? "text-primary" : ""}`}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = currentStepData.icon;
              return <Icon className="h-6 w-6 text-primary" />;
            })()}
            <div>
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button onClick={handleNext}>
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Create Proof Pack
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
