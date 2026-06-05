/**
 * Teaming Process Schema for KDM Platform
 * Defines data structures for teaming partnerships, recommendations, and workflow
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// Teaming Partnership Types
// ============================================================================

export interface TeamingPartnership {
  id: string;
  partnershipId: string;
  status: TeamingStatus;
  initiatorId: string;
  initiatorCompanyId: string;
  partnerId: string;
  partnerCompanyId: string;
  opportunityId?: string;
  opportunityTitle?: string;
  naicsCodes: string[];
  matchScore: number;
  
  // Partnership details
  role: TeamingRole;
  agreementType: TeamingAgreementType;
  proposedSplit: RevenueSplit;
  
  // Communication
  messages: TeamingMessage[];
  lastActivityAt: Timestamp;
  
  // Dates
  initiatedAt: Timestamp;
  respondedAt?: Timestamp;
  acceptedAt?: Timestamp;
  rejectedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export type TeamingStatus = 
  | "pending_invitation"
  | "invitation_sent"
  | "invitation_viewed"
  | "negotiating"
  | "agreement_pending"
  | "agreement_signed"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";

export type TeamingRole = 
  | "prime"
  | "subcontractor"
  | "joint_venture"
  | "mentor"
  | "mentee";

export type TeamingAgreementType = 
  | "teaming_agreement"
  | "joint_venture"
  | "subcontract"
  | "mentor_protege"
  | "consortium";

export interface RevenueSplit {
  initiatorPercentage: number;
  partnerPercentage: number;
  basis: "revenue" | "profit" | "hours";
  notes?: string;
}

// ============================================================================
// Teaming Messages
// ============================================================================

export interface TeamingMessage {
  id: string;
  partnershipId: string;
  senderId: string;
  senderCompanyId: string;
  recipientId: string;
  recipientCompanyId: string;
  message: string;
  messageType: "initial_invitation" | "negotiation" | "agreement" | "status_update" | "other";
  attachments?: TeamingAttachment[];
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

export interface TeamingAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Timestamp;
}

// ============================================================================
// Teaming Recommendations
// ============================================================================

export interface TeamingRecommendation {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  matchScore: number;
  matchReasons: MatchReason[];
  
  // Capability alignment
  sharedCapabilities: string[];
  complementaryCapabilities: string[];
  missingCapabilities: string[];
  
  // NAICS alignment
  naicsAlignment: NAICSAlignment;
  
  // Past performance
  pastPerformance: PastPerformance[];
  averageRating: number;
  
  // Contact info
  contactInfo: ContactInfo;
  
  // Certifications
  certifications: Certification[];
  
  // Teaming preferences
  teamingPreferences: TeamingPreferences;
  
  // Status
  isAvailable: boolean;
  currentPartnerships: number;
  maxPartnerships: number;
  
  // Metadata
  recommendedAt: Timestamp;
  opportunityId?: string;
}

export interface MatchReason {
  type: "naics_alignment" | "capability_complement" | "past_performance" | "certification" | "location" | "other";
  description: string;
  weight: number;
}

export interface NAICSAlignment {
  primaryMatches: string[];
  secondaryMatches: string[];
  alignmentScore: number;
}

export interface PastPerformance {
  contractId: string;
  contractTitle: string;
  agency: string;
  contractValue: number;
  completedDate: Timestamp;
  rating: number;
  naicsCodes: string[];
  partnerIds?: string[];
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
}

export interface Certification {
  id: string;
  type: string;
  level?: string;
  issuedBy: string;
  issuedDate: Timestamp;
  expiryDate?: Timestamp;
  verificationUrl?: string;
}

export interface TeamingPreferences {
  willingToPrime: boolean;
  willingToSub: boolean;
  seekingPartners: boolean;
  preferredContractTypes: string[];
  preferredRegions: string[];
  preferredContractSizes: ContractSize[];
  setAsidePreferences: SetAsideType[];
  notes?: string;
}

export type ContractSize = "small" | "medium" | "large" | "any";
export type SetAsideType = "8(a)" | "WOSB" | "SDVOSB" | "HUBZone" | "any";

// ============================================================================
// Teaming Requests
// ============================================================================

export interface TeamingRequest {
  id: string;
  partnershipId: string;
  requesterId: string;
  requesterCompanyId: string;
  recipientId: string;
  recipientCompanyId: string;
  opportunityId?: string;
  opportunityTitle?: string;
  
  // Request details
  role: TeamingRole;
  proposedAgreement: TeamingAgreementType;
  message: string;
  proposedSplit: RevenueSplit;
  
  // Status
  status: TeamingStatus;
  
  // Response
  responseMessage?: string;
  counterProposal?: CounterProposal;
  
  // Dates
  sentAt: Timestamp;
  viewedAt?: Timestamp;
  respondedAt?: Timestamp;
  expiresAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CounterProposal {
  proposedSplit: RevenueSplit;
  message: string;
  proposedAt: Timestamp;
}

// ============================================================================
// Teaming Agreements
// ============================================================================

export interface TeamingAgreement {
  id: string;
  partnershipId: string;
  agreementType: TeamingAgreementType;
  
  // Parties
  primeContractorId: string;
  primeContractorCompanyId: string;
  subcontractorId: string;
  subcontractorCompanyId: string;
  
  // Agreement details
  scopeOfWork: string;
  deliverables: string[];
  responsibilities: AgreementResponsibilities;
  paymentTerms: PaymentTerms;
  disputeResolution: string;
  terminationClause: string;
  
  // Signatures
  primeSignature: DigitalSignature;
  subcontractorSignature: DigitalSignature;
  
  // Documents
  agreementDocumentUrl: string;
  additionalDocuments: TeamingAttachment[];
  
  // Status
  status: "draft" | "pending_signature" | "signed" | "active" | "terminated";
  
  // Dates
  effectiveDate: Timestamp;
  expirationDate?: Timestamp;
  signedAt: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface AgreementResponsibilities {
  primeContractor: string[];
  subcontractor: string[];
  shared: string[];
}

export interface PaymentTerms {
  paymentSchedule: string;
  invoicingProcess: string;
  paymentMethod: string;
  latePaymentTerms: string;
}

export interface DigitalSignature {
  signedBy: string;
  signedAt: Timestamp;
  ipAddress: string;
  signatureUrl: string;
}

// ============================================================================
// Firestore Collection Names
// ============================================================================

export const TEAMING_COLLECTIONS = {
  PARTNERSHIPS: "teaming_partnerships",
  MESSAGES: "teaming_messages",
  RECOMMENDATIONS: "teaming_recommendations",
  REQUESTS: "teaming_requests",
  AGREEMENTS: "teaming_agreements",
  PREFERENCES: "teaming_preferences",
} as const;

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetTeamingRecommendationsRequest {
  opportunityId?: string;
  naicsCodes?: string[];
  capabilities?: string[];
  region?: string;
  contractSize?: ContractSize;
  setAside?: SetAsideType;
  limit?: number;
}

export interface GetTeamingRecommendationsResponse {
  recommendedPartners: TeamingRecommendation[];
  opportunity?: {
    id: string;
    title: string;
    agency: string;
    deadline: string;
    naicsCodes: string[];
  };
  totalResults: number;
}

export interface SendTeamingInvitationRequest {
  recipientId: string;
  recipientCompanyId: string;
  opportunityId?: string;
  role: TeamingRole;
  agreementType: TeamingAgreementType;
  message: string;
  proposedSplit: RevenueSplit;
}

export interface SendTeamingInvitationResponse {
  partnershipId: string;
  requestId: string;
  status: TeamingStatus;
}

export interface RespondToTeamingRequest {
  requestId: string;
  response: "accept" | "decline" | "counter";
  message?: string;
  counterProposal?: CounterProposal;
}

export interface UpdateTeamingPreferencesRequest {
  willingToPrime: boolean;
  willingToSub: boolean;
  seekingPartners: boolean;
  preferredContractTypes: string[];
  preferredRegions: string[];
  preferredContractSizes: ContractSize[];
  setAsidePreferences: SetAsideType[];
  notes?: string;
}
