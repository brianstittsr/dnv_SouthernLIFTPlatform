"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between w-full">
        {steps.map((step, index) => (
          <li key={step.id} className={cn(
            "relative",
            index !== steps.length - 1 ? "flex-1" : ""
          )}>
            {index !== steps.length - 1 && (
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className={cn(
                  "h-0.5 w-full",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )} />
              </div>
            )}
            <div
              className="relative flex items-center justify-center group"
              onClick={() => onStepClick?.(index)}
            >
              <span className="h-9 flex items-center">
                <span
                  className={cn(
                    "relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                    index < currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : index === currentStep
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-background border-2 border-muted text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </span>
              </span>
              <span className="absolute -bottom-6 w-max text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {step.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
