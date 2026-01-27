/**
 * Partner Commission & Revenue Sharing Schema
 * 
 * Defines types for the automated partner revenue sharing system
 * that tracks attributions, calculates commissions, and processes payouts.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Consortium Partners
// ============================================================================

export type ConsortiumPartnerId = 
  | 'vplus'
  | 'ada'
  | 'e3s'
  | 'logicore'
  | 'kdm-nmsdc'
  | 'ndemand'
  | 'kdm-platform';

export const CONSORTIUM_PARTNERS: Record<ConsortiumPartnerId, { name: string; displayName: string }> = {
  'vplus': { name: 'V+', displayName: 'Strategic Value Plus' },
  'ada': { name: 'ADA', displayName: 'ADA Consulting' },
  'e3s': { name: 'E3S', displayName: 'E3S Solutions' },
  'logicore': { name: 'LogiCore', displayName: 'LogiCore Corporation' },
  'kdm-nmsdc': { name: 'KDM-NMSDC', displayName: 'KDM NMSDC Chapter' },
  'ndemand': { name: 'nDemand', displayName: 'nDemand Technologies' },
  'kdm-platform': { name: 'KDM Platform', displayName: 'KDM Platform Fee' },
};

// ============================================================================
// Contribution Types & Default Percentages
// ============================================================================

export type ContributionType = 
  | 'lead_generation'
  | 'service_delivery'
  | 'introduction'
  | 'platform_fee';

export const DEFAULT_ATTRIBUTION_PERCENTAGES: Record<ContributionType, number> = {
  lead_generation: 20,
  service_delivery: 50,
  introduction: 20,
  platform_fee: 10,
};

export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string> = {
  lead_generation: 'Lead Generation',
  service_delivery: 'Service Delivery',
  introduction: 'Introduction',
  platform_fee: 'Platform Fee',
};

// ============================================================================
// Partner Profile Document
// ============================================================================

export type PaymentMethod = 'stripe_connect' | 'paypal' | 'bank_transfer' | 'manual';

export interface PartnerProfileDoc {
  id: string;
  partnerId: ConsortiumPartnerId;
  name: string;
  displayName: string;
  
  // Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Payment Configuration
  paymentMethod: PaymentMethod;
  stripeConnectAccountId?: string;
  paypalEmail?: string;
  bankAccountInfo?: {
    bankName: string;
    accountNumber: string; // Last 4 digits only for display
    routingNumber: string; // Last 4 digits only for display
  };
  
  // Payout Settings
  autoPayoutEnabled: boolean;
  minimumPayoutAmount: number; // Minimum amount before payout
  payoutFrequency: 'immediate' | 'weekly' | 'biweekly' | 'monthly';
  holdPeriodDays: number; // Days to hold before payout (default 7)
  
  // Commission Configuration
  commissionTierId?: string; // Reference to commission tier
  customCommissionRate?: number; // Override rate if set
  
  // Attribution Rules
  attributionRules: {
    contributionType: ContributionType;
    percentage: number;
    isActive: boolean;
  }[];
  
  // Statistics (denormalized for quick access)
  stats: {
    totalEarnings: number;
    pendingCommissions: number;
    paidCommissions: number;
    totalTransactions: number;
    lastPayoutDate?: Timestamp;
    lastPayoutAmount?: number;
  };
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Partner Attribution Document
// ============================================================================

export type CommissionStatus = 'pending' | 'notified' | 'approved' | 'paid' | 'failed' | 'disputed';

export interface PartnerAttributionItem {
  partnerId: ConsortiumPartnerId;
  partnerName: string;
  contributionType: ContributionType;
  percentage: number; // Attribution percentage
  amount: number; // Calculated commission amount
  status: CommissionStatus;
  notifiedAt?: Timestamp;
  paidAt?: Timestamp;
  payoutId?: string; // Reference to payout record
  notes?: string;
}

export interface PartnerAttributionDoc {
  id: string;
  
  // Transaction Reference
  transactionId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  
  // Client Information
  clientId: string;
  clientName: string;
  clientEmail: string;
  
  // Transaction Details
  transactionType: 'membership' | 'event_ticket' | 'sponsorship' | 'pursuit_pack' | 'cohort' | 'service' | 'other';
  totalAmount: number;
  currency: string;
  
  // Attributions
  attributions: PartnerAttributionItem[];
  
  // Totals
  totalCommissions: number;
  platformFee: number;
  netAmount: number;
  
  // Status
  overallStatus: 'pending' | 'partially_paid' | 'fully_paid';
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;
}

// ============================================================================
// Commission Tier Document
// ============================================================================

export interface CommissionTierDoc {
  id: string;
  name: string;
  tier: 'standard' | 'premium' | 'elite' | 'custom';
  
  // Rate Configuration
  baseRate: number; // Base commission rate percentage
  minRevenue: number; // Minimum revenue threshold
  maxRevenue: number | null; // Maximum revenue threshold (null = no limit)
  
  // Bonus Configuration
  bonusRate?: number; // Additional bonus rate for high performers
  bonusThreshold?: number; // Revenue threshold to qualify for bonus
  
  // Partner Assignments
  assignedPartnerIds: ConsortiumPartnerId[];
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Payout Document
// ============================================================================

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PayoutDoc {
  id: string;
  
  // Partner Reference
  partnerId: ConsortiumPartnerId;
  partnerName: string;
  partnerProfileId: string;
  
  // Payout Details
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  
  // Status
  status: PayoutStatus;
  
  // Payment Processing
  stripeTransferId?: string;
  paypalPayoutId?: string;
  bankTransferReference?: string;
  
  // Commission References
  commissionIds: string[]; // Attribution IDs included in this payout
  commissionCount: number;
  
  // Timing
  scheduledDate: Timestamp;
  processedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Error Handling
  failureReason?: string;
  retryCount: number;
  lastRetryAt?: Timestamp;
  
  // Approval (for manual payouts)
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Timestamp;
  
  // Metadata
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Revenue Sharing Configuration Document
// ============================================================================

export interface RevenueSharingConfigDoc {
  id: string;
  
  // Default Attribution Percentages
  defaultAttributionPercentages: Record<ContributionType, number>;
  
  // Platform Settings
  platformFeePercentage: number;
  minimumPayoutAmount: number;
  defaultHoldPeriodDays: number;
  
  // Payout Settings
  autoPayoutEnabled: boolean;
  payoutSchedule: 'immediate' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  payoutDayOfWeek?: number; // 0-6 for weekly
  payoutDayOfMonth?: number; // 1-31 for monthly
  
  // Notification Settings
  notifyOnPending: boolean;
  notifyOnPaid: boolean;
  notifyOnFailed: boolean;
  
  // Metadata
  updatedAt: Timestamp;
  updatedBy: string;
}

// ============================================================================
// Firestore Collection Names
// ============================================================================

export const PARTNER_COLLECTIONS = {
  PARTNER_PROFILES: 'partnerProfiles',
  PARTNER_ATTRIBUTIONS: 'partnerAttributions',
  PARTNER_COMMISSIONS: 'partnerCommissions',
  COMMISSION_TIERS: 'commissionTiers',
  PAYOUTS: 'payouts',
  PAYOUT_HISTORY: 'payoutHistory',
  REVENUE_SHARING_CONFIG: 'revenueSharingConfig',
} as const;

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_REVENUE_SHARING_CONFIG: Omit<RevenueSharingConfigDoc, 'id' | 'updatedAt' | 'updatedBy'> = {
  defaultAttributionPercentages: DEFAULT_ATTRIBUTION_PERCENTAGES,
  platformFeePercentage: 10,
  minimumPayoutAmount: 100,
  defaultHoldPeriodDays: 7,
  autoPayoutEnabled: false,
  payoutSchedule: 'weekly',
  payoutDayOfWeek: 5, // Friday
  notifyOnPending: true,
  notifyOnPaid: true,
  notifyOnFailed: true,
};

// ============================================================================
// Helper Types for API Responses
// ============================================================================

export interface CommissionSummary {
  partnerId: ConsortiumPartnerId;
  partnerName: string;
  totalPending: number;
  totalPaid: number;
  totalEarnings: number;
  transactionCount: number;
  lastPayoutDate?: Date;
}

export interface PayoutSummary {
  totalPending: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  upcomingPayouts: PayoutDoc[];
}
