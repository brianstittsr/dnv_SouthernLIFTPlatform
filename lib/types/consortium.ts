import { Timestamp } from "firebase/firestore";

export type UserType = "buyer" | "supplier";
export type MembershipType = "consortium" | "regular";
export type OnboardingStatus = 
  | "signed_up" 
  | "profile_started" 
  | "profile_complete" 
  | "payment_complete" 
  | "active";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";
export type PlanType = "monthly" | "annual";

export interface ProfileData {
  companyName?: string;
  industry?: string;
  capabilities?: string[];
  certifications?: string[];
  contractTypes?: string[];
  annualSpend?: string;
}

export interface StripeData {
  customerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  plan?: PlanType;
  priceId?: string;
}

export interface ConsortiumUserDoc {
  id: string;
  firebaseUid: string;
  email: string;
  userType: UserType;
  membershipType: MembershipType;
  profileComplete: boolean;
  paymentComplete: boolean;
  onboardingStatus: OnboardingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attributionSource?: string;
  profileData?: ProfileData;
  stripe?: StripeData;
}

export interface ProfileFormData {
  companyName: string;
  industry: string;
  capabilities?: string;
  certifications?: string[];
  contractTypes?: string[];
  annualSpend?: string;
}

export interface CheckoutSessionRequest {
  plan: PlanType;
  userType: UserType;
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

export const BUYER_PRICING = {
  monthly: 299,
  annual: 2870,
} as const;

export const SUPPLIER_PRICING = {
  monthly: 199,
  annual: 1910,
} as const;

export const INDUSTRY_OPTIONS = [
  "Aerospace",
  "Defense",
  "Advanced Manufacturing",
  "Critical Minerals",
  "Technology",
  "Other",
] as const;

export const CONTRACT_TYPE_OPTIONS = [
  "Set-Aside",
  "Prime",
  "Subcontractor",
  "Teaming",
] as const;

export const CERTIFICATION_OPTIONS = [
  "CMMC Level 1",
  "CMMC Level 2",
  "CMMC Level 3",
  "SDVOSB",
  "WOSB",
  "8(a)",
  "HUBZone",
  "None",
] as const;

export const ANNUAL_SPEND_OPTIONS = [
  "$0-500K",
  "$500K-2M",
  "$2M-10M",
  "$10M+",
] as const;
