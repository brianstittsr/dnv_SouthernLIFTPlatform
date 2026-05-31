"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, Timestamp, setDoc } from "firebase/firestore";
import {
  OnboardingWizard,
  WizardStep,
  BusinessInfoStep,
  CertificationsStep,
  CapabilitiesStep,
  ContactInfoStep,
  ProofPackStep,
  ReviewStep,
  initialSMEFormData,
  AgencyInfoStep,
  RoleStep,
  ProcurementInterestsStep,
  ContactPreferencesStep,
  BuyerReviewStep,
  initialBuyerFormData,
} from "@/components/onboarding";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"sme" | "buyer">("sme");
  const [smeFormData, setSmeFormData] = useState(initialSMEFormData);
  const [buyerFormData, setBuyerFormData] = useState(initialBuyerFormData);

  useEffect(() => {
    if (profile.id) {
      const type = searchParams.get("type") as "sme" | "buyer" | null;
      if (type === "sme" || type === "buyer") {
        setUserType(type);
      } else {
        setUserType("sme");
      }

      // Check if onboarding is complete using optional chaining
      const profileData = profile as any;
      if (profileData.isOnboardingComplete) {
        router.push("/portal");
        return;
      }

      setLoading(false);
    }
  }, [profile, searchParams, router]);

  const handleComplete = async () => {
    if (!db || !profile.id) return;

    try {
      const updateData = userType === "sme" 
        ? {
            email: profile.email,
            firstName: smeFormData.contactName?.split(" ")[0] || "",
            lastName: smeFormData.contactName?.split(" ").slice(1).join(" ") || "",
            company: smeFormData.companyName,
            dunsUei: smeFormData.dunsUei,
            cageCode: smeFormData.cageCode,
            address: smeFormData.address,
            city: smeFormData.city,
            state: smeFormData.state,
            zip: smeFormData.zip,
            website: smeFormData.website,
            yearEstablished: smeFormData.yearEstablished,
            employeeCount: smeFormData.employeeCount,
            certifications: smeFormData.certifications,
            primaryNaics: smeFormData.primaryNaics,
            coreCapabilities: smeFormData.coreCapabilities,
            pastPerformance: smeFormData.pastPerformance,
            keyDifferentiators: smeFormData.keyDifferentiators,
            phone: smeFormData.contactPhone,
            preferredContactMethod: smeFormData.preferredContactMethod,
            isOnboardingComplete: true,
            onboardingCompletedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          }
        : {
            email: profile.email,
            firstName: "",
            lastName: "",
            company: buyerFormData.agencyName,
            agencyType: buyerFormData.agencyType,
            officeDivision: buyerFormData.officeDivision,
            address: buyerFormData.address,
            city: buyerFormData.city,
            state: buyerFormData.state,
            zip: buyerFormData.zip,
            jobTitle: buyerFormData.jobTitle,
            roleType: buyerFormData.roleType,
            procurementAuthority: buyerFormData.procurementAuthority,
            annualBudget: buyerFormData.annualBudget,
            certificationPreferences: buyerFormData.certificationPreferences,
            contractTypes: buyerFormData.contractTypes,
            geographicPreferences: buyerFormData.geographicPreferences,
            preferredContactMethod: buyerFormData.preferredContactMethod,
            availabilityForIntros: buyerFormData.availabilityForIntros,
            meetingPreferences: buyerFormData.meetingPreferences,
            isOnboardingComplete: true,
            onboardingCompletedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

      // Use Firebase Auth UID for user document
      const firebaseUid = auth?.currentUser?.uid;
      const userId = firebaseUid || profile.id;
      const userRef = doc(db, "users", userId);
      
      // Use setDoc with merge: true to create or update the document
      await setDoc(userRef, updateData, { merge: true });
      
      toast.success("Welcome to the KDM Consortium!", {
        description: "Your profile is ready. Let's get started!",
      });

      router.push(userType === "sme" ? "/portal/sme/dashboard" : "/portal/buyer/dashboard");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Failed to save profile");
    }
  };

  const handleDismiss = () => {
    router.push("/portal");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const smeSteps: WizardStep[] = [
    {
      id: "business-info",
      title: "Business Information",
      description: "Tell us about your company",
      component: <BusinessInfoStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.companyName || !smeFormData.dunsUei || !smeFormData.address || !smeFormData.city || !smeFormData.state || !smeFormData.zip) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      },
    },
    {
      id: "certifications",
      title: "Certifications",
      description: "Select your business certifications",
      component: <CertificationsStep formData={smeFormData} setFormData={setSmeFormData} />,
      isOptional: true,
    },
    {
      id: "capabilities",
      title: "Capabilities",
      description: "Describe your core capabilities and NAICS codes",
      component: <CapabilitiesStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (smeFormData.primaryNaics.length === 0 || !smeFormData.coreCapabilities) {
          toast.error("Please add at least one NAICS code and describe your capabilities");
          return false;
        }
        return true;
      },
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can buyers reach you?",
      component: <ContactInfoStep formData={smeFormData} setFormData={setSmeFormData} />,
      validate: () => {
        if (!smeFormData.contactName || !smeFormData.contactEmail || !smeFormData.contactPhone) {
          toast.error("Please fill in all required contact fields");
          return false;
        }
        return true;
      },
    },
    {
      id: "proof-pack",
      title: "Proof Pack",
      description: "Upload your capability documents",
      component: <ProofPackStep />,
      isOptional: true,
    },
    {
      id: "review",
      title: "Review",
      description: "Review your profile before completing",
      component: <ReviewStep formData={smeFormData} />,
    },
  ];

  const buyerSteps: WizardStep[] = [
    {
      id: "agency-info",
      title: "Agency Information",
      description: "Tell us about your organization",
      component: <AgencyInfoStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      validate: () => {
        if (!buyerFormData.agencyName || !buyerFormData.agencyType) {
          toast.error("Please fill in agency name and type");
          return false;
        }
        return true;
      },
    },
    {
      id: "role",
      title: "Role & Responsibilities",
      description: "Tell us about your role",
      component: <RoleStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      validate: () => {
        if (!buyerFormData.jobTitle || !buyerFormData.roleType) {
          toast.error("Please fill in your job title and role type");
          return false;
        }
        return true;
      },
    },
    {
      id: "procurement",
      title: "Procurement Interests",
      description: "What types of contractors are you looking for?",
      component: <ProcurementInterestsStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      isOptional: true,
    },
    {
      id: "contact-prefs",
      title: "Contact Preferences",
      description: "How would you like to be contacted?",
      component: <ContactPreferencesStep formData={buyerFormData} setFormData={setBuyerFormData} />,
      isOptional: true,
    },
    {
      id: "review",
      title: "Review",
      description: "Review your profile before completing",
      component: <BuyerReviewStep formData={buyerFormData} />,
    },
  ];

  return (
    <OnboardingWizard
      steps={userType === "sme" ? smeSteps : buyerSteps}
      userType={userType}
      onComplete={handleComplete}
      onDismiss={handleDismiss}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
