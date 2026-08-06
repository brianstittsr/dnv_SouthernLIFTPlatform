"use client";

import { useEffect, useState } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { AlertCircle, FileText, ArrowRight, X } from "lucide-react";

const REQUIRED_DOCUMENTS = [
  "SAM Registration",
  "CAGE Code Documentation",
  "Capability Statement",
  "Past Performance References",
  "Certifications (CMMC, ISO, 8(a), etc.)",
  "Financial Statements",
  "Insurance Certificates",
];

export function OnboardingPrepBanner() {
  const { profile, isLoading } = useUserProfile();
  const [dismissed, setDismissed] = useState(false);
  const [showDocList, setShowDocList] = useState(false);

  useEffect(() => {
    const dismissedAt = sessionStorage.getItem("onboarding-prep-banner-dismissed");
    if (dismissedAt) setDismissed(true);
  }, []);

  if (isLoading || dismissed) return null;

  const onboardingStatus = profile?.onboardingStatus;
  const isOnboardingComplete = profile?.isOnboardingComplete;

  if (isOnboardingComplete) return null;
  if (onboardingStatus === "completed") return null;
  if (onboardingStatus === "in_progress") return null;

  const handleDismiss = () => {
    sessionStorage.setItem("onboarding-prep-banner-dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">
              Ready to start your KDM onboarding?
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Prepare your documents in PDF format to speed up the process.
            </p>

            {showDocList && (
              <div className="mt-3 bg-white rounded-lg border border-amber-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Documents to Prepare (PDF Format):
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  {REQUIRED_DOCUMENTS.map((doc, i) => (
                    <li key={i} className="text-sm text-gray-700">{doc}</li>
                  ))}
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                  The AI-powered platform uses these documents to match you with relevant SAM.gov RFI and RFP opportunities.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowDocList(!showDocList)}
              className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              <FileText className="h-4 w-4" />
              {showDocList ? "Hide" : "Document List"}
            </button>
            <a
              href="/portal/consortium/onboarding"
              className="flex items-center gap-1 text-xs font-bold bg-amber-600 text-white px-3 py-1.5 rounded-md hover:bg-amber-700 transition-colors"
            >
              Start Onboarding
              <ArrowRight className="h-3 w-3" />
            </a>
            <button
              onClick={handleDismiss}
              className="text-amber-400 hover:text-amber-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
