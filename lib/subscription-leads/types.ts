/**
 * Subscription Lead Types and Schema
 * 
 * Defines the data structure for DWY/DFY subscription leads
 * that are pushed to Strategic Value Plus for follow-up.
 */

export type SubscriptionTier = "diy" | "dwy" | "dfy";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
export type LeadSource = "subscription_checkout" | "proof_pack" | "manual" | "book_call";

export interface SubscriptionLead {
  id: string;
  
  // User Information
  userId: string;
  email: string;
  companyName: string;
  industry: string;
  userType: "sme" | "buyer";
  roleTag: string;
  
  // Subscription Information
  tier: SubscriptionTier;
  tierName: string;
  price: number;
  subscriptionStatus: "pending" | "active" | "cancelled" | "past_due";
  
  // Contact Information
  contactInfo: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
    website?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  };
  
  // Lead Management
  status: LeadStatus;
  source: LeadSource;
  priority: "high" | "medium" | "low";
  assignedTo?: string;
  
  // Proof Pack Context (if available)
  proofPackContext?: {
    packId?: string;
    packName?: string;
    packHealth?: number;
    capabilities: string[];
    certifications: string[];
    naicsCodes?: string[];
  };
  
  // Strategic Value Plus Integration
  svpSync: {
    pushedAt?: string;
    svpLeadId?: string;
    lastSyncedAt?: string;
    syncStatus: "pending" | "synced" | "failed";
    errorMessage?: string;
  };
  
  // Follow-up Tracking
  followUp: {
    emailsSent: number;
    lastContactedAt?: string;
    nextFollowUpAt?: string;
    notes: LeadNote[];
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
}

export interface LeadNote {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  type: "general" | "call" | "email" | "meeting" | "status_change";
}

export interface CreateLeadRequest {
  userId: string;
  tier: SubscriptionTier;
  source?: LeadSource;
  proofPackContext?: SubscriptionLead["proofPackContext"];
}

export interface UpdateLeadRequest {
  status?: LeadStatus;
  assignedTo?: string;
  priority?: "high" | "medium" | "low";
  contactInfo?: Partial<SubscriptionLead["contactInfo"]>;
  addNote?: {
    content: string;
    type: LeadNote["type"];
    author: string;
    authorId: string;
  };
}

export interface LeadFilterOptions {
  status?: LeadStatus | LeadStatus[];
  tier?: SubscriptionTier | SubscriptionTier[];
  source?: LeadSource;
  assignedTo?: string;
  priority?: "high" | "medium" | "low";
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface LeadListItem {
  id: string;
  companyName: string;
  email: string;
  tier: SubscriptionTier;
  tierName: string;
  status: LeadStatus;
  priority: "high" | "medium" | "low";
  createdAt: string;
  assignedTo?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  syncStatus: "pending" | "synced" | "failed";
  userType: "sme" | "buyer";
}

// SVP API Integration Types
export interface SVPLeadPayload {
  externalId: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  contactFirstName?: string;
  contactLastName?: string;
  jobTitle?: string;
  website?: string;
  industry: string;
  source: string;
  tier: string;
  monthlyValue: number;
  status: string;
  notes?: string;
  capabilities?: string[];
  certifications?: string[];
  userType: string;
  createdAt: string;
}

export interface SVPApiResponse {
  success: boolean;
  leadId?: string;
  error?: string;
}

// Email notification types
export interface LeadEmailData {
  leadId: string;
  companyName: string;
  contactEmail: string;
  tier: string;
  tierName: string;
  price: number;
  industry: string;
  userType: string;
  proofPackHealth?: number;
  capabilities?: string[];
  certifications?: string[];
  createdAt: string;
}
