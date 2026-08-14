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
  role: "admin" | "affiliate" | "customer" | "team_member" | "consortium_member";
  
  // SVP Platform role(s)
  svpRole?: "platform_admin" | "sme_user" | "partner_user" | "buyer" | "qa_reviewer" | "cmmc_instructor" | "consortium_member";
  svpRoles?: ("platform_admin" | "sme_user" | "partner_user" | "buyer" | "qa_reviewer" | "cmmc_instructor" | "consortium_member")[];
  
  // Onboarding fields
  isOnboardingComplete?: boolean;
  onboardingStatus?: "not_started" | "in_progress" | "completed" | "skipped";
  onboardingType?: "consortium" | "affiliate" | "founder";
  onboardingStartedAt?: string;
  onboardingCompletedAt?: string;
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
  
  // Company linkage
  companyId?: string;
  companyName?: string;

  // Government contracting readiness documents/entries
  readinessDocuments?: ReadinessDocumentRecord[];
  readinessScore?: number;
  readinessValidationStatus?: string;

  // Profile completion tracking
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Lightweight readiness document/entry shape (mirrors ReadinessDocEntry from
// components/portal/consortium-onboarding-wizard.tsx, duplicated here to avoid
// a circular import between that component and this context).
export interface ReadinessDocumentRecord {
  type: string;
  fileName?: string;
  fileUrl?: string;
  attachmentId?: string;
  textValue?: string;
  dataBase64?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: any;
  status?: string;
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
  actualProfile: UserProfile | null;
  isImpersonating: boolean;
  impersonatedUserId: string | null;
  setImpersonatedUserId: (id: string | null) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

/**
 * Load a profile for the given user ID. This fetches the user document and
 * attempts to link a team member record by UID or email.
 */
async function loadProfileForUser(userId: string): Promise<UserProfile> {
  if (!db) return { ...defaultProfile, id: userId };

  let userDoc: any = null;
  let svpRole: UserProfile["svpRole"] = undefined;
  let svpRoles: UserProfile["svpRoles"] = undefined;

  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      userDoc = userDocSnap.data();
      const savedRoles = userDoc.svpRoles;
      if (Array.isArray(savedRoles) && savedRoles.length > 0) {
        svpRoles = savedRoles.filter((r): r is NonNullable<typeof svpRole> => !!r);
        svpRole = svpRoles[0];
      } else if (userDoc.svpRole) {
        svpRole = userDoc.svpRole;
        svpRoles = [svpRole as NonNullable<typeof svpRole>];
      }
    }
  } catch (error) {
    console.error("Error fetching user document:", error);
  }

  const userEmail = userDoc?.email || "";

  // Try to find and link Team member by UID first, then by email
  let teammember: TeamMemberDoc | null = await getTeammemberByAuthUid(userId);
  if (!teammember && userEmail) {
    teammember = await findAndLinkTeammember(userEmail, userId);
  }

  // Readiness data is stored on the team member document (and mirrored to the
  // user document as a fallback). Cast to `any` since these fields aren't part
  // of the strict TeamMemberDoc type but are present in the raw Firestore data.
  const teammemberRaw = teammember as any;
  const readinessDocuments: ReadinessDocumentRecord[] | undefined =
    teammemberRaw?.readinessDocuments || userDoc?.readinessDocuments || undefined;
  const readinessScore: number | undefined =
    teammemberRaw?.readinessScore ?? userDoc?.readinessScore ?? undefined;
  const readinessValidationStatus: string | undefined =
    teammemberRaw?.readinessValidationStatus || userDoc?.readinessValidationStatus || undefined;

  if (teammember) {
    const mappedProfile = mapTeammemberToProfile(teammember);
    return {
      ...defaultProfile,
      ...mappedProfile,
      ...(userDoc && {
        firstName: userDoc.firstName || mappedProfile.firstName,
        lastName: userDoc.lastName || mappedProfile.lastName,
        phone: userDoc.phone || mappedProfile.phone,
        company: userDoc.company || mappedProfile.company,
        jobTitle: userDoc.jobTitle || mappedProfile.jobTitle,
        location: userDoc.location || mappedProfile.location,
        bio: userDoc.bio || mappedProfile.bio,
        avatarUrl: userDoc.avatarUrl || mappedProfile.avatarUrl,
        companyId: userDoc.companyId || undefined,
        companyName: userDoc.companyName || userDoc.company || undefined,
        profileCompletedAt: userDoc.profileCompletedAt?.toDate?.()?.toISOString() || null,
        createdAt: userDoc.createdAt?.toDate?.()?.toISOString() || defaultProfile.createdAt,
      }),
      svpRole,
      svpRoles,
      readinessDocuments,
      readinessScore,
      readinessValidationStatus,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...defaultProfile,
    id: userId,
    email: userEmail,
    firstName: userDoc?.firstName || "",
    lastName: userDoc?.lastName || "",
    phone: userDoc?.phone || "",
    company: userDoc?.company || "",
    jobTitle: userDoc?.jobTitle || "",
    location: userDoc?.location || "",
    bio: userDoc?.bio || "",
    avatarUrl: userDoc?.avatarUrl || "",
    companyId: userDoc?.companyId || undefined,
    companyName: userDoc?.companyName || userDoc?.company || undefined,
    profileCompletedAt: userDoc?.profileCompletedAt?.toDate?.()?.toISOString() || null,
    createdAt: userDoc?.createdAt?.toDate?.()?.toISOString() || defaultProfile.createdAt,
    svpRole,
    svpRoles,
    readinessDocuments,
    readinessScore,
    readinessValidationStatus,
    updatedAt: new Date().toISOString(),
  };
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [actualProfile, setActualProfile] = useState<UserProfile | null>(null);
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showAffiliateOnboarding, setShowAffiliateOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [linkedTeammember, setLinkedTeammember] = useState<TeamMemberDoc | null>(null);

  const profileCompletion = calculateProfileCompletion(profile);
  const networkingCompletion = calculateNetworkingCompletion(profile);
  const isComplete = isProfileComplete(profile);
  const needsOnboarding = needsAffiliateOnboarding(profile);
  const isImpersonating = !!impersonatedUserId && impersonatedUserId !== actualProfile?.id;

  // Listen to Firebase Auth state and load the actual user's profile
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

        const loadedProfile = await loadProfileForUser(firebaseUser.uid);
        setActualProfile(loadedProfile);
        setLinkedTeammember(await getTeammemberByAuthUid(firebaseUser.uid));
      } else {
        setIsAuthenticated(false);
        setLinkedTeammember(null);
        setActualProfile(null);
        setImpersonatedUserId(null);
        setProfile(defaultProfile);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load the impersonated user's profile whenever the target user changes
  useEffect(() => {
    if (!impersonatedUserId) {
      if (actualProfile) setProfile(actualProfile);
      return;
    }

    let isCancelled = false;
    const loadImpersonatedProfile = async () => {
      setIsLoading(true);
      const targetProfile = await loadProfileForUser(impersonatedUserId);
      if (!isCancelled) {
        const targetTeammember = await getTeammemberByAuthUid(impersonatedUserId);
        setProfile(targetProfile);
        setLinkedTeammember(targetTeammember);
        setIsLoading(false);
      }
    };

    loadImpersonatedProfile();
    return () => { isCancelled = true; };
  }, [impersonatedUserId, actualProfile]);

  // Check if profiles are synced (User Profile matches Team member)
  const profilesSynced = areProfilesSynced(profile, linkedTeammember);

  // Check if wizards should be shown after profile is loaded
  useEffect(() => {
    // Don't show wizard while loading or if not authenticated
    if (isLoading || !isAuthenticated) {
      return;
    }

    // Affiliates who have not completed onboarding see it first — including founding members
    // whose svpRole is "consortium_member".
    if (needsOnboarding) {
      setShowAffiliateOnboarding(true);
      return;
    }

    // Consortium members who are not affiliates use the consortium onboarding flow
    if (profile.svpRole === "consortium_member") {
      return;
    }

    // Only show profile wizard if profiles are not synced (incomplete or mismatched)
    if (!profilesSynced) {
      setShowProfileWizard(true);
    }
  }, [isLoading, isAuthenticated, profilesSynced, needsOnboarding, linkedTeammember, profile.svpRole]);

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
        actualProfile,
        isImpersonating,
        impersonatedUserId,
        setImpersonatedUserId,
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
