"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, addDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { logTeamMemberAdded } from "@/lib/activity-logger";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/profile/avatar-upload";

// Circular progress component
function CircularProgress({ percentage, size = 120, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
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
        <span className="text-2xl font-bold">{percentage}%</span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

const steps = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Contact", icon: Phone },
  { id: 3, title: "Company", icon: Building },
  { id: 4, title: "About You", icon: FileText },
];

export function ProfileCompletionWizard() {
  const { profile, updateProfile, profileCompletion, showProfileWizard, setShowProfileWizard, linkedTeamMember } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    location: "",
    bio: "",
    avatarUrl: "",
  });

  // Initialize form data from profile when wizard opens
  useEffect(() => {
    if (showProfileWizard && profile.id) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        company: profile.company || "",
        jobTitle: profile.jobTitle || "",
        location: profile.location || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [showProfileWizard, profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (base64Image: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: base64Image }));
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

  const handleComplete = async () => {
    if (!auth?.currentUser || !db) {
      toast.error("Authentication required");
      return;
    }

    setSaving(true);
    try {
      const now = Timestamp.now();
      
      // 1. Create or Update User Profile (users collection)
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        location: formData.location,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        profileCompletedAt: now,
        updatedAt: now,
        createdAt: now,
      }, { merge: true });
      console.log("User profile created/updated in users collection:", auth.currentUser.uid);

      // 2. Update or Create Team Member (teamMembers collection)
      if (linkedTeamMember?.id) {
        const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, linkedTeamMember.id);
        await updateDoc(teamMemberRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: formData.phone,
          company: formData.company,
          title: formData.jobTitle,
          location: formData.location,
          bio: formData.bio,
          avatar: formData.avatarUrl,
          updatedAt: now,
        });
        console.log("Team Member profile updated:", linkedTeamMember.id);
      } else {
        // Try to find Team Member by email and update
        const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
        const emailQuery = query(teamMembersRef, where("emailPrimary", "==", formData.email));
        const snapshot = await getDocs(emailQuery);
        
        if (!snapshot.empty) {
          const teamMemberDoc = snapshot.docs[0];
          await updateDoc(doc(db, COLLECTIONS.TEAM_MEMBERS, teamMemberDoc.id), {
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobile: formData.phone,
            company: formData.company,
            title: formData.jobTitle,
            location: formData.location,
            bio: formData.bio,
            avatar: formData.avatarUrl,
            firebaseUid: auth.currentUser.uid, // Link the accounts
            updatedAt: now,
          });
          console.log("Team Member found by email and updated:", teamMemberDoc.id);
        } else {
          // Create new Team Member record for this user
          const newTeamMemberRef = await addDoc(collection(db, COLLECTIONS.TEAM_MEMBERS), {
            firebaseUid: auth.currentUser.uid,
            firstName: formData.firstName,
            lastName: formData.lastName,
            emailPrimary: formData.email,
            mobile: formData.phone,
            company: formData.company,
            title: formData.jobTitle,
            location: formData.location,
            bio: formData.bio,
            avatar: formData.avatarUrl,
            expertise: formData.jobTitle || "General", // Use job title as initial expertise
            role: "affiliate" as const, // Default role for new registrations
            status: "active" as const,
            createdAt: now,
            updatedAt: now,
          });
          console.log("New Team Member created:", newTeamMemberRef.id);
          // Log activity for new team member
          await logTeamMemberAdded(newTeamMemberRef.id, `${formData.firstName} ${formData.lastName}`);
        }
      }

      // Update local profile context with all fields
      updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        location: formData.location,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        profileCompletedAt: new Date().toISOString(),
      });

      toast.success("Profile completed successfully!");
      
      // Close the wizard after a short delay to ensure state updates
      setTimeout(() => {
        setShowProfileWizard(false);
      }, 100);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!auth?.currentUser || !db) {
      setShowProfileWizard(false);
      return;
    }

    setSaving(true);
    try {
      const now = Timestamp.now();
      
      // Save partial progress to Firebase (users collection)
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userUpdates: any = {
        email: formData.email,
        updatedAt: now,
        createdAt: now,
      };

      // Only update fields that have values
      if (formData.firstName) userUpdates.firstName = formData.firstName;
      if (formData.lastName) userUpdates.lastName = formData.lastName;
      if (formData.phone) userUpdates.phone = formData.phone;
      if (formData.company) userUpdates.company = formData.company;
      if (formData.jobTitle) userUpdates.jobTitle = formData.jobTitle;
      if (formData.location) userUpdates.location = formData.location;
      if (formData.bio) userUpdates.bio = formData.bio;

      await setDoc(userRef, userUpdates, { merge: true });

      // Also update Team Member if linked
      if (linkedTeamMember?.id) {
        const teamMemberUpdates: any = { updatedAt: now };
        if (formData.firstName) teamMemberUpdates.firstName = formData.firstName;
        if (formData.lastName) teamMemberUpdates.lastName = formData.lastName;
        if (formData.phone) teamMemberUpdates.mobile = formData.phone;
        if (formData.company) teamMemberUpdates.company = formData.company;
        if (formData.jobTitle) teamMemberUpdates.title = formData.jobTitle;
        if (formData.location) teamMemberUpdates.location = formData.location;
        if (formData.bio) teamMemberUpdates.bio = formData.bio;

        const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, linkedTeamMember.id);
        await updateDoc(teamMemberRef, teamMemberUpdates);
      }

      // Update local profile context
      updateProfile(formData);

      setShowProfileWizard(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setShowProfileWizard(false);
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "";
      case 2:
        return formData.phone.trim() !== "";
      case 3:
        return formData.company.trim() !== "" && formData.jobTitle.trim() !== "";
      case 4:
        return formData.location.trim() !== "" && formData.bio.trim() !== "";
      default:
        return true;
    }
  };

  const getStepProgress = () => {
    const totalSteps = steps.length;
    return Math.round((currentStep / totalSteps) * 100);
  };

  return (
    <Dialog open={showProfileWizard} onOpenChange={setShowProfileWizard}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <User className="h-5 w-5 text-white" />
            </div>
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Help us personalize your experience by completing your profile
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <CircularProgress percentage={profileCompletion} />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mb-8 px-4">
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
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="space-y-4 px-4">
            {currentStep === 1 && (
              <>
                <div className="flex justify-center mb-6">
                  <AvatarUpload
                    currentAvatar={formData.avatarUrl}
                    initials={`${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase() || "U"}
                    onUpload={handleAvatarUpload}
                    size="xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      placeholder="you@company.com"
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Your company name"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      placeholder="Your job title"
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, State"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself and your expertise..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip} disabled={saving}>
            Skip for now
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={saving}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={!isStepValid() || saving}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!isStepValid() || saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Profile
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
