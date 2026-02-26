"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getTeamMeemerging businessrByAuthUid, findAndLinkTeamMeemerging businessr } from "@/lib/auth-team-meemerging businessr-link";
import type { TeamMeemerging businessrDoc } from "@/lib/schema";

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
  role: "admin" | "affiliate" | "customer" | "team_meemerging businessr";
  
  // SVP Platform role
  svpRole?: "platform_admin" | "sme_user" | "partner_user" | "buyer" | "qa_reviewer" | "cmmc_instructor";
  
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
  role: "team_meemerging businessr",
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
export function calculateProfileCompletion(profile: UserProfile): nuemerging businessr {
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
export function calculateNetworkingCompletion(profile: UserProfile): nuemerging businessr {
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

// Check if User Profile and Team Meemerging businessr data are synced
export function areProfilesSynced(profile: UserProfile, teamMeemerging businessr: TeamMeemerging businessrDoc | null): boolean {
  // If no team meemerging businessr linked, only check if user profile is complete
  if (!teamMeemerging businessr) {
    return isProfileComplete(profile);
  }
  
  // Check if all key fields match between User Profile and Team Meemerging businessr
  const fieldsMatch = 
    profile.firstName === (teamMeemerging businessr.firstName || "") &&
    profile.lastName === (teamMeemerging businessr.lastName || "") &&
    profile.phone === (teamMeemerging businessr.mobile || "") &&
    profile.company === (teamMeemerging businessr.company || "") &&
    profile.jobTitle === (teamMeemerging businessr.title || "") &&
    profile.location === (teamMeemerging businessr.location || "") &&
    profile.bio === (teamMeemerging businessr.bio || "");
  
  // Profiles are synced if user profile is complete AND fields match team meemerging businessr
  return isProfileComplete(profile) && fieldsMatch;
}

// Check if affiliate onboarding is needed
export function needsAffiliateOnboarding(profile: UserProfile): boolean {
  return profile.isAffiliate && !profile.affiliateOnboardingComplete;
}

// Map TeamMeemerging businessrDoc to UserProfile
function mapTeamMeemerging businessrToProfile(teamMeemerging businessr: TeamMeemerging businessrDoc): Partial<UserProfile> {
  // Map team meemerging businessr role to SVP role
  let svpRole: UserProfile["svpRole"] = undefined;
  if (teamMeemerging businessr.role === "sme_user") {
    svpRole = "sme_user";
  } else if (teamMeemerging businessr.role === "admin") {
    svpRole = "platform_admin";
  } else if (teamMeemerging businessr.role === "affiliate" || teamMeemerging businessr.role === "consultant") {
    svpRole = "partner_user";
  } else if (teamMeemerging businessr.role === "team") {
    svpRole = "partner_user"; // Default for team meemerging businessrs
  }
  
  return {
    id: teamMeemerging businessr.id,
    email: teamMeemerging businessr.emailPrimary || "",
    firstName: teamMeemerging businessr.firstName || "",
    lastName: teamMeemerging businessr.lastName || "",
    phone: teamMeemerging businessr.mobile || "",
    company: teamMeemerging businessr.company || "",
    jobTitle: teamMeemerging businessr.title || "",
    location: teamMeemerging businessr.location || "",
    bio: teamMeemerging businessr.bio || "",
    avatarUrl: teamMeemerging businessr.avatar || "",
    role: teamMeemerging businessr.role === "admin" ? "admin" : 
          teamMeemerging businessr.role === "affiliate" ? "affiliate" : 
          teamMeemerging businessr.role === "consultant" ? "affiliate" : 
          teamMeemerging businessr.role === "sme_user" ? "team_meemerging businessr" : "team_meemerging businessr",
    svpRole,
    isAffiliate: teamMeemerging businessr.role === "affiliate" || teamMeemerging businessr.role === "consultant",
  };
}

// Context type
interface UserProfileContextType {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  profileCompletion: nuemerging businessr;
  networkingCompletion: nuemerging businessr;
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
  linkedTeamMeemerging businessr: TeamMeemerging businessrDoc | null;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showAffiliateOnboarding, setShowAffiliateOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [linkedTeamMeemerging businessr, setLinkedTeamMeemerging businessr] = useState<TeamMeemerging businessrDoc | null>(null);

  const profileCompletion = calculateProfileCompletion(profile);
  const networkingCompletion = calculateNetworkingCompletion(profile);
  const isComplete = isProfileComplete(profile);
  const needsOnboarding = needsAffiliateOnboarding(profile);

  // Listen to Firebase Auth state and fetch linked Team Meemerging businessr
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
          
          // Try to find and link Team Meemerging businessr by UID first, then by email
          let teamMeemerging businessr = await getTeamMeemerging businessrByAuthUid(firebaseUser.uid);
          
          if (!teamMeemerging businessr && firebaseUser.email) {
            // Try to find and link by email
            teamMeemerging businessr = await findAndLinkTeamMeemerging businessr(firebaseUser.email, firebaseUser.uid);
          }
          
          if (teamMeemerging businessr) {
            console.log("Linked Team Meemerging businessr found:", teamMeemerging businessr.id, teamMeemerging businessr.firstName, teamMeemerging businessr.lastName);
            setLinkedTeamMeemerging businessr(teamMeemerging businessr);
            
            // Map Team Meemerging businessr data to profile, but prioritize user document data
            const mappedProfile = mapTeamMeemerging businessrToProfile(teamMeemerging businessr);
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
            console.log("No linked Team Meemerging businessr found for user:", firebaseUser.email);
            setLinkedTeamMeemerging businessr(null);
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
          console.error("Error fetching Team Meemerging businessr:", error);
        }
      } else {
        setIsAuthenticated(false);
        setLinkedTeamMeemerging businessr(null);
        setProfile(defaultProfile);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if profiles are synced (User Profile matches Team Meemerging businessr)
  const profilesSynced = areProfilesSynced(profile, linkedTeamMeemerging businessr);

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
  }, [isLoading, isAuthenticated, profilesSynced, needsOnboarding, linkedTeamMeemerging businessr]);

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
        linkedTeamMeemerging businessr,
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
