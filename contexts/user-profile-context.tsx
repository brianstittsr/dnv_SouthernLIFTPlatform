"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getTeammemberByAuthUid, findAndLinkTeammember } from "@/lib/auth-team-member-link";
import type { TeamMemberDoc } from "@/lib/schema";

// User profile fields
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  jobTitle: string;
  location: string;
  bio: string;
  avatarUrl: string;
  role: "admin" | "affiliate" | "customer" | "team_member";
  
  // SVP Platform role
  svpRole?: "platform_admin" | "sme_user" | "partner_user" | "buyer" | "qa_reviewer" | "cmmc_instructor";
  
  // Onboarding fields
  isOnboardingComplete?: boolean;
  primaryNaics?: string[];
  certifications?: string[];
  
  // Affiliate-specific fields
  isAffiliate: boolean;
  affiliateOnboardingComplete: boolean;
  affiliateAgreementSigned: boolean;
  affiliateAgreementDate: string | null;
  
  // Networking profile (for affiliates)
  networkingProfile: {
    expertise: string[];
    categories: string[];
    idealReferralPartner: string;
    topReferralSources: string;
    goalsThisQuarter: string;
    uniqueValueProposition: string;
    targetClientProfile: string;
    problemsYouSolve: string;
    successStory: string;
  };
  
  // Profile completion tracking
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Default empty profile
const defaultProfile: UserProfile = {
  id: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  company: "",
  jobTitle: "",
  location: "",
  bio: "",
  avatarUrl: "",
  role: "team_member",
  isAffiliate: false,
  affiliateOnboardingComplete: false,
  affiliateAgreementSigned: false,
  affiliateAgreementDate: null,
  networkingProfile: {
    expertise: [],
    categories: [],
    idealReferralPartner: "",
    topReferralSources: "",
    goalsThisQuarter: "",
    uniqueValueProposition: "",
    targetClientProfile: "",
    problemsYouSolve: "",
    successStory: "",
  },
  profileCompletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Calculate profile completion percentage
export function calculateProfileCompletion(profile: UserProfile): number {
  const requiredFields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.company,
    profile.jobTitle,
    profile.location,
    profile.bio,
  ];
  
  const completedFields = requiredFields.filter((field) => field && field.trim() !== "").length;
  return Math.round((completedFields / requiredFields.length) * 100);
}

// Calculate affiliate networking profile completion
export function calculateNetworkingCompletion(profile: UserProfile): number {
  if (!profile.isAffiliate) return 100;
  
  const networkingFields = [
    profile.networkingProfile.expertise.length > 0,
    profile.networkingProfile.categories.length > 0,
    profile.networkingProfile.idealReferralPartner,
    profile.networkingProfile.topReferralSources,
    profile.networkingProfile.goalsThisQuarter,
    profile.networkingProfile.uniqueValueProposition,
    profile.networkingProfile.targetClientProfile,
    profile.networkingProfile.problemsYouSolve,
  ];
  
  const completedFields = networkingFields.filter((field) => {
    if (typeof field === "boolean") return field;
    return field && String(field).trim() !== "";
  }).length;
  
  return Math.round((completedFields / networkingFields.length) * 100);
}

// Check if profile is complete
export function isProfileComplete(profile: UserProfile): boolean {
  return calculateProfileCompletion(profile) === 100;
}

// Check if User Profile and Team member data are synced
export function areProfilesSynced(profile: UserProfile, teammember: TeamMemberDoc | null): boolean {
  // If no team member linked, only check if user profile is complete
  if (!teammember) {
    return isProfileComplete(profile);
  }
  
  // Check if all key fields match between User Profile and Team member
  const fieldsMatch = 
    profile.firstName === (teammember.firstName || "") &&
    profile.lastName === (teammember.lastName || "") &&
    profile.phone === (teammember.mobile || "") &&
    profile.company === (teammember.company || "") &&
    profile.jobTitle === (teammember.title || "") &&
    profile.location === (teammember.location || "") &&
    profile.bio === (teammember.bio || "");
  
  // Profiles are synced if user profile is complete AND fields match team member
  return isProfileComplete(profile) && fieldsMatch;
}

// Check if affiliate onboarding is needed
export function needsAffiliateOnboarding(profile: UserProfile): boolean {
  return profile.isAffiliate && !profile.affiliateOnboardingComplete;
}

// Map TeamMemberDoc to UserProfile
function mapTeammemberToProfile(teammember: TeamMemberDoc): Partial<UserProfile> {
  // Map team member role to SVP role
  let svpRole: UserProfile["svpRole"] = undefined;
  if (teammember.role === "sme_user") {
    svpRole = "sme_user";
  } else if (teammember.role === "admin") {
    svpRole = "platform_admin";
  } else if (teammember.role === "affiliate" || teammember.role === "consultant") {
    svpRole = "partner_user";
  } else if (teammember.role === "team") {
    svpRole = "partner_user"; // Default for team members
  }
  
  return {
    id: teammember.id,
    email: teammember.emailPrimary || "",
    firstName: teammember.firstName || "",
    lastName: teammember.lastName || "",
    phone: teammember.mobile || "",
    company: teammember.company || "",
    jobTitle: teammember.title || "",
    location: teammember.location || "",
    bio: teammember.bio || "",
    avatarUrl: teammember.avatar || "",
    role: teammember.role === "admin" ? "admin" : 
          teammember.role === "affiliate" ? "affiliate" : 
          teammember.role === "consultant" ? "affiliate" : 
          teammember.role === "sme_user" ? "team_member" : "team_member",
    svpRole,
    isAffiliate: teammember.role === "affiliate" || teammember.role === "consultant",
  };
}

// Context type
interface UserProfileContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  profileCompletion: number;
  networkingCompletion: number;
  isComplete: boolean;
  needsOnboarding: boolean;
  showProfileWizard: boolean;
  setShowProfileWizard: (show: boolean) => void;
  showAffiliateOnboarding: boolean;
  setShowAffiliateOnboarding: (show: boolean) => void;
  getDisplayName: () => string;
  getInitials: () => string;
  isLoading: boolean;
  isAuthenticated: boolean;
  linkedTeammember: TeamMemberDoc | null;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showAffiliateOnboarding, setShowAffiliateOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [linkedTeammember, setLinkedTeammember] = useState<TeamMemberDoc | null>(null);

  const profileCompletion = calculateProfileCompletion(profile);
  const networkingCompletion = calculateNetworkingCompletion(profile);
  const isComplete = isProfileComplete(profile);
  const needsOnboarding = needsAffiliateOnboarding(profile);

  // Listen to Firebase Auth state and fetch linked Team member
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setIsAuthenticated(true);
        console.log("User authenticated:", firebaseUser.uid, firebaseUser.email);
        
        try {
          // Fetch user document from Firestore to get full profile data
          let userDoc = null;
          let svpRole = undefined;
          if (db) {
            try {
              const userDocRef = doc(db, "users", firebaseUser.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                userDoc = userDocSnap.data();
                svpRole = userDoc.svpRole;
                console.log("User document loaded from Firebase:", {
                  svpRole,
                  hasAvatar: !!userDoc.avatarUrl,
                  firstName: userDoc.firstName,
                  lastName: userDoc.lastName
                });
              }
            } catch (error) {
              console.error("Error fetching user document:", error);
            }
          }
          
          // Try to find and link Team member by UID first, then by email
          let teammember = await getTeammemberByAuthUid(firebaseUser.uid);
          
          if (!teammember && firebaseUser.email) {
            // Try to find and link by email
            teammember = await findAndLinkTeammember(firebaseUser.email, firebaseUser.uid);
          }
          
          if (teammember) {
            console.log("Linked Team member found:", teammember.id, teammember.firstName, teammember.lastName);
            setLinkedTeammember(teammember);
            
            // Map Team member data to profile, but prioritize user document data
            const mappedProfile = mapTeammemberToProfile(teammember);
            setProfile((prev) => ({
              ...prev,
              ...mappedProfile,
              // Override with user document data if available
              ...(userDoc && {
                firstName: userDoc.firstName || mappedProfile.firstName,
                lastName: userDoc.lastName || mappedProfile.lastName,
                phone: userDoc.phone || mappedProfile.phone,
                company: userDoc.company || mappedProfile.company,
                jobTitle: userDoc.jobTitle || mappedProfile.jobTitle,
                location: userDoc.location || mappedProfile.location,
                bio: userDoc.bio || mappedProfile.bio,
                avatarUrl: userDoc.avatarUrl || mappedProfile.avatarUrl,
                profileCompletedAt: userDoc.profileCompletedAt?.toDate?.()?.toISOString() || null,
                createdAt: userDoc.createdAt?.toDate?.()?.toISOString() || prev.createdAt,
              }),
              svpRole, // Add svpRole from user document
              updatedAt: new Date().toISOString(),
            }));
          } else {
            console.log("No linked Team member found for user:", firebaseUser.email);
            setLinkedTeammember(null);
            // Set profile from user document or Firebase Auth
            setProfile((prev) => ({
              ...prev,
              id: firebaseUser.uid,
              email: userDoc?.email || firebaseUser.email || "",
              firstName: userDoc?.firstName || firebaseUser.displayName?.split(" ")[0] || "",
              lastName: userDoc?.lastName || firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
              phone: userDoc?.phone || "",
              company: userDoc?.company || "",
              jobTitle: userDoc?.jobTitle || "",
              location: userDoc?.location || "",
              bio: userDoc?.bio || "",
              avatarUrl: userDoc?.avatarUrl || firebaseUser.photoURL || "",
              profileCompletedAt: userDoc?.profileCompletedAt?.toDate?.()?.toISOString() || null,
              createdAt: userDoc?.createdAt?.toDate?.()?.toISOString() || prev.createdAt,
              svpRole, // Add svpRole from user document
              updatedAt: new Date().toISOString(),
            }));
          }
        } catch (error) {
          console.error("Error fetching Team member:", error);
        }
      } else {
        setIsAuthenticated(false);
        setLinkedTeammember(null);
        setProfile(defaultProfile);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if profiles are synced (User Profile matches Team member)
  const profilesSynced = areProfilesSynced(profile, linkedTeammember);

  // Check if wizards should be shown after profile is loaded
  useEffect(() => {
    // Don't show wizard while loading or if not authenticated
    if (isLoading || !isAuthenticated) {
      return;
    }
    
    // Only show profile wizard if profiles are not synced (incomplete or mismatched)
    if (!profilesSynced) {
      setShowProfileWizard(true);
    } else if (needsOnboarding) {
      setShowAffiliateOnboarding(true);
    }
  }, [isLoading, isAuthenticated, profilesSynced, needsOnboarding, linkedTeammember]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const getDisplayName = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) return profile.firstName;
    if (profile.email) return profile.email.split("@")[0];
    return "User";
  };

  const getInitials = () => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile.firstName) return profile.firstName[0].toUpperCase();
    if (profile.email) return profile.email[0].toUpperCase();
    return "U";
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        profileCompletion,
        networkingCompletion,
        isComplete,
        needsOnboarding,
        showProfileWizard,
        setShowProfileWizard,
        showAffiliateOnboarding,
        setShowAffiliateOnboarding,
        getDisplayName,
        getInitials,
        isLoading,
        isAuthenticated,
        linkedTeammember,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
