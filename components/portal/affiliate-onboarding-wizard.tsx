"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db, auth as firebaseAuth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Handshake,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Users,
  Target,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  Star,
  Lightbulb,
  Award,
  Loader2,
} from "lucide-react";

// Circular progress component
function CircularProgress({ percentage, size = 100, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percentage}%</span>
      </div>
    </div>
  );
}

// Assistance areas for LIFT client service selection
const liftServiceAreas = [
  { id: "business-planning", name: "Business Planning", icon: "📋" },
  { id: "capital-readiness", name: "Capital & Financing", icon: "💰" },
  { id: "gov-contracting", name: "Government Contracting", icon: "🏛️" },
  { id: "marketing", name: "Marketing & Sales", icon: "�" },
  { id: "operations", name: "Operations & Technology", icon: "⚙️" },
  { id: "workforce", name: "Workforce & HR", icon: "👥" },
  { id: "certifications", name: "Certifications (MBE, 8(a), HUBZone)", icon: "✅" },
  { id: "growth", name: "Growth & New Markets", icon: "🌍" },
];

// Rural LIFT program participation expectations
const liftProgramExpectations = [
  {
    icon: Calendar,
    title: "Advisor Sessions",
    description: "Meet with your assigned LIFT advisor and keep scheduled advising appointments",
  },
  {
    icon: FileText,
    title: "Program Forms",
    description: "Complete required forms, including the MBDA Client Intake & Letter of Engagement and baseline survey",
  },
  {
    icon: Target,
    title: "Outcome Reporting",
    description: "Report business outcomes — jobs, contracts, and capital — at 6- and 12-month check-ins",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Respond to advisor outreach and program communications within 2 business days",
  },
  {
    icon: Users,
    title: "Rural Eligibility",
    description: "Keep your business information current, including rural location and ownership details",
  },
  {
    icon: Award,
    title: "Data & Consent",
    description: "Allow de-identified outcome data to be reported to MBDA as described in your Letter of Engagement",
  },
];

const steps = [
  { id: 1, title: "Welcome", icon: Handshake },
  { id: 2, title: "Expectations", icon: FileText },
  { id: 3, title: "Your Business", icon: Star },
  { id: 4, title: "Business Profile", icon: Users },
  { id: 5, title: "Get Started", icon: MessageSquare },
];

export function AffiliateOnboardingWizard() {
  const { profile, updateProfile, networkingCompletion, showAffiliateOnboarding, setShowAffiliateOnboarding } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [acknowledgedCommitments, setAcknowledgedCommitments] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile.networkingProfile.categories || []);
  const [expertise, setExpertise] = useState<string>(profile.networkingProfile.expertise.join(", ") || "");
  const [networkingData, setNetworkingData] = useState({
    idealReferralPartner: profile.networkingProfile.idealReferralPartner || "",
    topReferralSources: profile.networkingProfile.topReferralSources || "",
    goalsThisQuarter: profile.networkingProfile.goalsThisQuarter || "",
    uniqueValueProposition: profile.networkingProfile.uniqueValueProposition || "",
    targetClientProfile: profile.networkingProfile.targetClientProfile || "",
    problemsYouSolve: profile.networkingProfile.problemsYouSolve || "",
    successStory: profile.networkingProfile.successStory || "",
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNetworkingChange = (field: string, value: string) => {
    setNetworkingData((prev) => ({ ...prev, [field]: value }));
  };

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

  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    setIsSaving(true);

    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }

      const networkingProfile = {
        categories: selectedCategories,
        expertise: expertise.split(",").map((e) => e.trim()).filter((e) => e),
        ...networkingData,
      };

      const teammemberData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        emailPrimary: profile.email,
        mobile: profile.phone || "",
        expertise: expertise,
        title: profile.jobTitle || "",
        company: profile.company || "",
        location: profile.location || "",
        bio: profile.bio || "",
        avatar: profile.avatarUrl || "",
        linkedIn: "",
        website: "",
        role: "affiliate" as const,
        status: "active" as const,
        networkingProfile,
        affiliateOnboardingComplete: true,
        affiliateAgreementSigned: true,
        affiliateAgreementDate: new Date().toISOString(),
        updatedAt: Timestamp.now(),
      };

      // Look for an existing team member linked to this user
      let teamMemberDocId: string | null = profile.id || null;
      let existingTeamMemberId: string | null = null;

      const firebaseUid = firebaseAuth?.currentUser?.uid;
      if (firebaseUid) {
        const uidQuery = query(
          collection(db, COLLECTIONS.TEAM_MEMBERS),
          where("firebaseUid", "==", firebaseUid)
        );
        const uidSnapshot = await getDocs(uidQuery);
        if (!uidSnapshot.empty) {
          existingTeamMemberId = uidSnapshot.docs[0].id;
        }
      }

      if (!existingTeamMemberId && profile.email) {
        const emailQuery = query(
          collection(db, COLLECTIONS.TEAM_MEMBERS),
          where("emailPrimary", "==", profile.email)
        );
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          existingTeamMemberId = emailSnapshot.docs[0].id;
        }
      }

      if (existingTeamMemberId) {
        // Update existing team member
        const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, existingTeamMemberId);
        await updateDoc(teamMemberRef, teammemberData);
        teamMemberDocId = existingTeamMemberId;
        console.log("Updated existing team member:", existingTeamMemberId);
      } else {
        // Create new team member
        const docRef = await addDoc(collection(db, COLLECTIONS.TEAM_MEMBERS), {
          ...teammemberData,
          createdAt: Timestamp.now(),
        });
        teamMemberDocId = docRef.id;
        console.log("Created new team member:", docRef.id);
      }

      // Update the user document to mark onboarding complete
      if (firebaseUid) {
        const userRef = doc(db, COLLECTIONS.USERS, firebaseUid);
        await setDoc(
          userRef,
          {
            affiliateOnboardingComplete: true,
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      }

      // Update local profile state
      updateProfile({
        ...(teamMemberDocId ? { id: teamMemberDocId } : {}),
        affiliateOnboardingComplete: true,
        networkingProfile,
      });

      setShowAffiliateOnboarding(false);
    } catch (error) {
      console.error("Error saving affiliate data to Firebase:", error);
      // Still update local state even if Firebase fails
      updateProfile({
        affiliateOnboardingComplete: true,
        networkingProfile: {
          ...profile.networkingProfile,
          categories: selectedCategories,
          expertise: expertise.split(",").map((e) => e.trim()).filter((e) => e),
          ...networkingData,
        },
      });
      setShowAffiliateOnboarding(false);
    } finally {
      setIsSaving(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return acknowledgedCommitments;
      case 3:
        return selectedCategories.length > 0 && expertise.trim() !== "";
      case 4:
        return (
          networkingData.idealReferralPartner.trim() !== "" &&
          networkingData.uniqueValueProposition.trim() !== "" &&
          networkingData.problemsYouSolve.trim() !== ""
        );
      case 5:
        return true;
      default:
        return true;
    }
  };

  const getStepProgress = () => {
    return Math.round((currentStep / steps.length) * 100);
  };

  return (
    <Dialog open={showAffiliateOnboarding} onOpenChange={setShowAffiliateOnboarding}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <Handshake className="h-5 w-5 text-white" />
            </div>
            LIFT Client Onboarding
          </DialogTitle>
          <DialogDescription>
            Welcome to the Southern University MBDA LIFT Rural Business Center! Let&apos;s get your business set up for success.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="space-y-6 px-2">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Handshake className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Welcome to the Rural LIFT Program!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you for enrolling with the Southern University MBDA LIFT Rural Business Center. This onboarding will help you understand how the program works and set up your business profile so our advisors can support you.
                  </p>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">What to expect:</p>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          <li>• Review the program participation expectations</li>
                          <li>• Tell us about your business and the assistance you need</li>
                          <li>• Complete your business profile for advisor matching</li>
                          <li>• Get ready to connect with your LIFT advisor team</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {profile.affiliateAgreementDate && (
                  <p className="text-sm text-center text-muted-foreground">
                    Agreement signed on: {new Date(profile.affiliateAgreementDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Commitments */}
            {currentStep === 2 && (
              <div className="space-y-4 px-2">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Program Participation Expectations</h3>
                  <p className="text-sm text-muted-foreground">
                    As a Rural LIFT client, we ask you to commit to the following:
                  </p>
                </div>

                <div className="grid gap-3">
                  {liftProgramExpectations.map((commitment, index) => {
                    const Icon = commitment.icon;
                    return (
                      <Card key={index} className="bg-muted/30">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{commitment.title}</p>
                            <p className="text-sm text-muted-foreground">{commitment.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Checkbox
                    id="acknowledge"
                    checked={acknowledgedCommitments}
                    onCheckedChange={(checked) => setAcknowledgedCommitments(checked as boolean)}
                  />
                  <Label htmlFor="acknowledge" className="text-sm">
                    I understand and acknowledge the Rural LIFT program participation expectations
                  </Label>
                </div>
              </div>
            )}

            {/* Step 3: Expertise */}
            {currentStep === 3 && (
              <div className="space-y-6 px-2">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Where Your Business Needs Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the areas where your business needs assistance
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {liftServiceAreas.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedCategories.includes(category.id)
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                        {selectedCategories.includes(category.id) && (
                          <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">What does your business do? (comma separated) *</Label>
                  <Input
                    id="expertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g., Landscaping services, specialty food products, custom metal fabrication"
                  />
                  <p className="text-xs text-muted-foreground">
                    List your products, services, and any certifications
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Networking Profile */}
            {currentStep === 4 && (
              <div className="space-y-4 px-2">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Your Business Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    This information helps your LIFT advisor team understand your business and tailor assistance
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idealReferralPartner">What types of support or partnerships would help your business grow? *</Label>
                    <Textarea
                      id="idealReferralPartner"
                      value={networkingData.idealReferralPartner}
                      onChange={(e) => handleNetworkingChange("idealReferralPartner", e.target.value)}
                      placeholder="e.g., introductions to lenders, contract opportunities, mentors, or suppliers..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uniqueValueProposition">What does your business offer, and what makes it unique? *</Label>
                    <Textarea
                      id="uniqueValueProposition"
                      value={networkingData.uniqueValueProposition}
                      onChange={(e) => handleNetworkingChange("uniqueValueProposition", e.target.value)}
                      placeholder="Describe your products or services and what sets your business apart"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemsYouSolve">What challenges is your business facing right now? *</Label>
                    <Textarea
                      id="problemsYouSolve"
                      value={networkingData.problemsYouSolve}
                      onChange={(e) => handleNetworkingChange("problemsYouSolve", e.target.value)}
                      placeholder="e.g., access to capital, winning contracts, finding customers, operations..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetClientProfile">Who are your customers?</Label>
                    <Textarea
                      id="targetClientProfile"
                      value={networkingData.targetClientProfile}
                      onChange={(e) => handleNetworkingChange("targetClientProfile", e.target.value)}
                      placeholder="Industries, locations, contract types you serve or want to serve..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goalsThisQuarter">What are your goals for the next 12 months?</Label>
                    <Textarea
                      id="goalsThisQuarter"
                      value={networkingData.goalsThisQuarter}
                      onChange={(e) => handleNetworkingChange("goalsThisQuarter", e.target.value)}
                      placeholder="e.g., win a first contract, secure financing, hire employees..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Ready to Connect */}
            {currentStep === 5 && (
              <div className="space-y-6 px-2">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">You&apos;re All Set!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your LIFT client onboarding is complete. Your advisor team will review your profile and reach out to schedule your first session.
                  </p>
                </div>

                <div className="flex justify-center">
                  <CircularProgress percentage={networkingCompletion} />
                </div>

                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Complete the MBDA Client Intake & Letter of Engagement
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Complete your baseline survey
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Meet your assigned LIFT advisor
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Browse upcoming workshops and training
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Onboarding
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
