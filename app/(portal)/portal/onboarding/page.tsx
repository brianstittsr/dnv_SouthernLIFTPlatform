"use client";

import { Suspense } from "react";
import { LiftClientOnboarding } from "@/components/onboarding";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LiftClientOnboarding />
    </Suspense>
  );
}
