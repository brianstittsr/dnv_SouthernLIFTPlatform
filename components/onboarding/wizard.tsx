"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

interface OnboardingWizardProps {
  steps: WizardStep[];
  userType: "sme" | "buyer";
  onComplete: () => void;
  onDismiss?: () => void;
}

export function OnboardingWizard({
  steps,
  userType,
  onComplete,
  onDismiss,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<nuemerging businessr>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    const step = steps[currentStep];

    if (step.validate) {
      setIsValidating(true);
      try {
        const isValid = await step.validate();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch (error) {
        console.error("Validation error:", error);
        toast.error("Please complete all required fields");
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    if (isLastStep) {
      await handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
      await saveProgress(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!db || !profile.id) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", profile.id), {
        isOnboardingComplete: true,
        onboardingCompletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success("Onboarding complete!", {
        description: "Your profile is ready. Welcome to the KDM Consortium!",
      });

      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setIsSaving(false);
    }
  };

  const saveProgress = async (stepIndex: nuemerging businessr) => {
    if (!db || !profile.id) return;

    try {
      await updateDoc(doc(db, "users", profile.id), {
        lastOnboardingStep: stepIndex,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleDismiss = async () => {
    if (!db || !profile.id) return;

    try {
      await updateDoc(doc(db, "users", profile.id), {
        onboardingDismissedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.info("You can complete your profile later from your dashboard");
      onDismiss?.();
    } catch (error) {
      console.error("Error dismissing onboarding:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {userType === "sme" ? "SME" : "Buyer"} Onboarding
            </h1>
            <p className="text-muted-foreground">
              Complete your profile to get started
            </p>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={handleDismiss}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-medium">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index < currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {completedSteps.has(index) ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
              )}
              {step.title}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>{steps[currentStep].component}</CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {steps[currentStep].isOptional && !isLastStep && (
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentStep((prev) => prev + 1);
                  saveProgress(currentStep + 1);
                }}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isValidating || isSaving}
            >
              {(isValidating || isSaving) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLastStep ? "Complete" : "Next"}
              {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
