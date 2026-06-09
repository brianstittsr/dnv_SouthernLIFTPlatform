"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Users, Target, Sparkles, CheckCircle, AlertCircle, Building2, DollarSign, FileText } from "lucide-react";
import type { TeamingRole, TeamingAgreementType, RevenueSplit } from "@/lib/teaming-schema";

interface CreateTeamingRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: {
    id: string;
    title: string;
    agency: string;
    description: string;
    naicsCodes: string[];
    estimatedValue: number;
    dueDate: Date;
    requiredCapabilities: string[];
    requiredCompliance: string[];
  };
  targetCompany?: {
    id: string;
    name: string;
    capabilities: string[];
    certifications: string[];
    pastPerformance?: string[];
  };
  currentUserCompany?: {
    id: string;
    name: string;
    capabilities: string[];
    certifications: string[];
  };
}

type Step = "opportunity" | "partner" | "ai" | "configure" | "review";

interface TeamingFormData {
  role: TeamingRole;
  agreementType: TeamingAgreementType;
  message: string;
  proposedSplit: RevenueSplit;
}

export function CreateTeamingRequestModal({
  open,
  onOpenChange,
  opportunity,
  targetCompany,
  currentUserCompany,
}: CreateTeamingRequestModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("opportunity");
  const [formData, setFormData] = useState<TeamingFormData>({
    role: "subcontractor",
    agreementType: "teaming_agreement",
    message: "",
    proposedSplit: {
      initiatorPercentage: 50,
      partnerPercentage: 50,
      basis: "revenue",
      notes: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);

  const steps = [
    { id: "opportunity" as Step, title: "Opportunity", icon: Target },
    { id: "partner" as Step, title: "Partner", icon: Building2 },
    { id: "ai" as Step, title: "AI Insights", icon: Sparkles },
    { id: "configure" as Step, title: "Configure", icon: Users },
    { id: "review" as Step, title: "Review", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Auto-generate AI recommendation when modal opens
  useEffect(() => {
    if (open && !aiRecommendation) {
      generateAIRecommendation();
    }
  }, [open]);

  const generateAIRecommendation = async () => {
    setGeneratingRecommendation(true);
    try {
      // Simulate AI recommendation generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const recommendation = `Based on the analysis of both companies, here's why this teaming arrangement makes sense:

**Capability Alignment:**
- Your company brings ${currentUserCompany?.capabilities.slice(0, 2).join(" and ")} expertise
- ${targetCompany?.name} offers ${targetCompany?.capabilities.slice(0, 2).join(" and ")} capabilities
- Combined, you cover ${opportunity?.requiredCapabilities.length || 0} of ${opportunity?.requiredCapabilities.length || 0} required capabilities

**Complementary Strengths:**
- Your certifications (${currentUserCompany?.certifications.slice(0, 2).join(", ")}) complement their compliance posture
- Past performance indicates strong delivery capability in similar NAICS codes
- Geographic proximity enables effective collaboration

**Strategic Fit:**
- The ${opportunity?.estimatedValue?.toLocaleString()} contract value aligns well with both companies' capacity
- Set-aside requirements can be met through this partnership structure
- Revenue split of ${formData.proposedSplit.initiatorPercentage}%/${formData.proposedSplit.partnerPercentage}% reflects fair value contribution`;

      setAiRecommendation(recommendation);
    } catch (error) {
      console.error("Error generating AI recommendation:", error);
      toast.error("Failed to generate AI recommendation");
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teaming/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: targetCompany?.id,
          recipientCompanyId: targetCompany?.id,
          opportunityId: opportunity?.id,
          role: formData.role,
          agreementType: formData.agreementType,
          message: formData.message,
          proposedSplit: formData.proposedSplit,
        }),
      });

      if (response.ok) {
        toast.success("Teaming request sent successfully!");
        onOpenChange(false);
        setCurrentStep("opportunity");
        setFormData({
          role: "subcontractor",
          agreementType: "teaming_agreement",
          message: "",
          proposedSplit: {
            initiatorPercentage: 50,
            partnerPercentage: 50,
            basis: "revenue",
            notes: "",
          },
        });
        setAiRecommendation(null);
      } else {
        toast.error("Failed to send teaming request");
      }
    } catch (error) {
      console.error("Error sending teaming request:", error);
      toast.error("Failed to send teaming request");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = <K extends keyof TeamingFormData>(field: K, value: TeamingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Teaming Request</DialogTitle>
          <DialogDescription>
            Send a teaming invitation to {targetCompany?.name} for the {opportunity?.title} opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[380px]">
          {/* Step 1 – Opportunity */}
          {currentStep === "opportunity" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">{opportunity?.title}</h3>
                  <p className="text-muted-foreground">{opportunity?.agency}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Value</p>
                  <p className="text-3xl font-bold text-emerald-600">{formatCurrency(opportunity?.estimatedValue || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Proposal Due</p>
                  <p className="text-2xl font-semibold">{opportunity?.dueDate?.toLocaleDateString()}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2">Required Capabilities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity?.requiredCapabilities.map((cap) => (
                      <Badge key={cap} variant="secondary">{cap}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Required Compliance</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity?.requiredCompliance.map((comp) => (
                      <Badge key={comp} variant="outline">{comp}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">NAICS Codes</p>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity?.naicsCodes.map((code) => (
                    <Badge key={code} variant="outline">{code}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Partner */}
          {currentStep === "partner" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{targetCompany?.name}</h3>
                  <p className="text-muted-foreground text-sm">Proposed teaming partner</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetCompany?.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary">{cap}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetCompany?.certifications.map((cert) => (
                      <Badge key={cert} variant="outline">{cert}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {targetCompany?.pastPerformance && targetCompany.pastPerformance.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Past Performance</p>
                  <ul className="space-y-1">
                    {targetCompany.pastPerformance.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3 – AI Insights */}
          {currentStep === "ai" && (
            <div className="space-y-4">
              {generatingRecommendation ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  <p className="text-muted-foreground">Generating AI recommendation...</p>
                </div>
              ) : aiRecommendation ? (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-lg">Why This Teaming Works</h3>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{aiRecommendation}</pre>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Sparkles className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No recommendation available.</p>
                  <Button variant="outline" onClick={generateAIRecommendation}>Retry</Button>
                </div>
              )}
            </div>
          )}

          {currentStep === "configure" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Configure Teaming Request
                  </CardTitle>
                  <CardDescription>
                    Define the teaming arrangement and proposal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="role">Your Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: TeamingRole) => updateFormData("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prime">Prime Contractor</SelectItem>
                        <SelectItem value="subcontractor">Subcontractor</SelectItem>
                        <SelectItem value="joint_venture">Joint Venture</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="mentee">Mentee</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select your role in this teaming arrangement
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="agreementType">Agreement Type *</Label>
                    <Select
                      value={formData.agreementType}
                      onValueChange={(value: TeamingAgreementType) => updateFormData("agreementType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teaming_agreement">Teaming Agreement</SelectItem>
                        <SelectItem value="joint_venture">Joint Venture</SelectItem>
                        <SelectItem value="subcontract">Subcontract Agreement</SelectItem>
                        <SelectItem value="mentor_protege">Mentor-Protege</SelectItem>
                        <SelectItem value="consortium">Consortium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label>Revenue Split *</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="initiatorPercentage" className="text-sm">
                          Your Share (%)
                        </Label>
                        <Input
                          id="initiatorPercentage"
                          type="number"
                          value={formData.proposedSplit.initiatorPercentage}
                          onChange={(e) =>
                            updateFormData("proposedSplit", {
                              ...formData.proposedSplit,
                              initiatorPercentage: parseInt(e.target.value) || 0,
                              partnerPercentage: 100 - (parseInt(e.target.value) || 0),
                            })
                          }
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="partnerPercentage" className="text-sm">
                          {targetCompany?.name} Share (%)
                        </Label>
                        <Input
                          id="partnerPercentage"
                          type="number"
                          value={formData.proposedSplit.partnerPercentage}
                          onChange={(e) =>
                            updateFormData("proposedSplit", {
                              ...formData.proposedSplit,
                              partnerPercentage: parseInt(e.target.value) || 0,
                              initiatorPercentage: 100 - (parseInt(e.target.value) || 0),
                            })
                          }
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="basis">Split Basis</Label>
                    <Select
                      value={formData.proposedSplit.basis}
                      onValueChange={(value: "revenue" | "profit" | "hours") =>
                        updateFormData("proposedSplit", {
                          ...formData.proposedSplit,
                          basis: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="profit">Profit</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="message">Personal Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => updateFormData("message", e.target.value)}
                      placeholder="Introduce yourself and explain why you'd like to team up on this opportunity..."
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This message will be sent to {targetCompany?.name} along with your teaming request
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Review Teaming Request
                  </CardTitle>
                  <CardDescription>
                    Review all details before sending the request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Opportunity</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{opportunity?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agency:</span>
                        <span>{opportunity?.agency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(opportunity?.estimatedValue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Target Company</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{targetCompany?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capabilities:</span>
                        <div className="flex gap-1">
                          {targetCompany?.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {(targetCompany?.capabilities.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(targetCompany?.capabilities.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Teaming Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Role:</span>
                        <Badge variant="outline" className="capitalize">
                          {formData.role.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agreement Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {formData.agreementType.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue Split:</span>
                        <span className="font-semibold">
                          {formData.proposedSplit.initiatorPercentage}% / {formData.proposedSplit.partnerPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Split Basis:</span>
                        <span className="capitalize">{formData.proposedSplit.basis}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Your Message</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      {formData.message || <span className="text-muted-foreground italic">No message</span>}
                    </div>
                  </div>

                  {aiRecommendation && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          AI Recommendation
                        </h3>
                        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4 text-sm">
                          <pre className="whitespace-pre-wrap font-sans">{aiRecommendation}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {currentStep === "review" ? (
              <Button onClick={handleSubmit} disabled={loading || !formData.message}>
                {loading ? "Sending..." : "Send Request"}
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
