"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Handshake,
  Building,
  Factory,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Package,
  Upload,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Welcome",
    icon: Handshake,
  },
  {
    id: 2,
    title: "What is a Proof Pack?",
    icon: Package,
  },
  {
    id: 3,
    title: "How It Works",
    icon: Users,
  },
  {
    id: 4,
    title: "Required Documents",
    icon: FileText,
  },
  {
    id: 5,
    title: "Get Started",
    icon: CheckCircle,
  },
];

interface ProofPackOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProofPackOnboardingWizard({ isOpen, onClose }: ProofPackOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Store in localStorage so it doesn't show again
    localStorage.setItem("proof_pack_onboarding_completed", "true");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Welcome to the Vendor Platform</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Everything you need to know about Proof Packs and getting connected
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between py-4 px-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      isCompleted ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="py-4">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Connect with Government & Manufacturing Buyers
                </h2>
                <p className="text-muted-foreground">
                  Your gateway to federal contracts, prime contractor partnerships, and manufacturing opportunities
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold text-sm">Government Agencies</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect directly with federal, state, and local buyers
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Factory className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold text-sm">Prime Contractors</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get discovered by major defense and manufacturing primes
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold text-sm">OEMs & Enterprises</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Access opportunities from large manufacturers and enterprises
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
                <p className="text-sm text-center">
                  <strong>Important:</strong> To be introduced to buyers, you need a complete Proof Pack with all required documentation. Let's show you how it works.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">What is a Proof Pack?</h2>
                <p className="text-muted-foreground">
                  Your digital qualification package that proves you're ready for opportunities
                </p>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Your Digital Credential Package</h3>
                  <p className="text-sm text-muted-foreground">
                    A Proof Pack is a collection of your company's essential documents, certifications, and credentials that buyers and primes review before deciding to work with you. Think of it as your digital business portfolio.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Company Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Certifications & Clearances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Past Performance</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Financial Documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">CMMC & Compliance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Capabilities Statement</span>
                  </div>
                </div>
              </div>

              <div className="bg-aemerging businessr-50 dark:bg-aemerging businessr-950/50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Remeemerging businessr:</strong> Buyers cannot request an introduction to you without a verified Proof Pack. It's your ticket to opportunities.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">How the System Works</h2>
                <p className="text-muted-foreground">
                  Your path from document upload to business introductions
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="w-0.5 h-12 bg-muted" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold">Upload Your Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete your Proof Pack with all required documents and certifications
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-0.5 h-12 bg-muted" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold">Get Verified</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team reviews your Proof Pack for completeness and accuracy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="w-0.5 h-12 bg-muted" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold">Appear in Directory</h3>
                    <p className="text-sm text-muted-foreground">
                      Government buyers and primes can find and review your verified Proof Pack
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                      4
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold">Receive Introductions</h3>
                    <p className="text-sm text-muted-foreground">
                      Interested buyers request introductions through our system—warm leads delivered to you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Required Documents</h2>
                <p className="text-muted-foreground">
                  Government SMEs, SubContractors, and Manufacturing suppliers need these documents
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-sm">Compliance & Security</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• CMMC Level 1 or 2 certification</li>
                    <li>• NIST 800-171 compliance (if applicable)</li>
                    <li>• Security clearance documentation</li>
                    <li>• ITAR/EAR registration (if applicable)</li>
                  </ul>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-sm">Certifications</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• ISO 9001, AS9100 (manufacturing)</li>
                    <li>• Small business certifications</li>
                    <li>• Socioeconomic certifications</li>
                    <li>• Industry-specific credentials</li>
                  </ul>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-sm">Financial & Past Performance</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Capability statement</li>
                    <li>• Past performance references</li>
                    <li>• Financial statements</li>
                    <li>• DCAA accounting system (if applicable)</li>
                  </ul>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-sm">Registration Documents</h3>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• SAM.gov active registration</li>
                    <li>• CAGE code documentation</li>
                    <li>• NAICS codes list</li>
                    <li>• UEI verification</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Important: You cannot receive introductions without a complete Proof Pack. Buyers need to verify your qualifications before connecting.
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
                <p className="text-muted-foreground">
                  Take the first step toward government and manufacturing contracts
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Create Your First Proof Pack</h3>
                    <p className="text-white/80 text-sm">
                      Start uploading your documents now. The sooner you complete your Proof Pack, the sooner buyers can find you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Upload all required documents</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Get verified by our team</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Start receiving buyer introductions</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Need help? Contact our support team at{" "}
                  <a href="mailto:support@kdmassociates.com" className="text-primary hover:underline">
                    support@kdmassociates.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleComplete}
            className="text-muted-foreground"
          >
            Skip Tour
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Got It, Let's Start!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if onboarding should be shown
export function useProofPackOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has already seen the onboarding
    const hasCompleted = localStorage.getItem("proof_pack_onboarding_completed");
    if (!hasCompleted) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return { showOnboarding, setShowOnboarding };
}
