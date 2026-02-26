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

export const DEFAULT_ATTRIBUTION_PERCENTAGES: Record<ContributionType, nuemerging businessr> = {
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
    accountNuemerging businessr: string; // Last 4 digits only for display
    routingNuemerging businessr: string; // Last 4 digits only for display
  };
  
  // Payout Settings
  autoPayoutEnabled: boolean;
  minimumPayoutAmount: nuemerging businessr; // Minimum amount before payout
  payoutFrequency: 'immediate' | 'weekly' | 'biweekly' | 'monthly';
  holdPeriodDays: nuemerging businessr; // Days to hold before payout (default 7)
  
  // Commission Configuration
  commissionTierId?: string; // Reference to commission tier
  customCommissionRate?: nuemerging businessr; // Override rate if set
  
  // Attribution Rules
  attributionRules: {
    contributionType: ContributionType;
    percentage: nuemerging businessr;
    isActive: boolean;
  }[];
  
  // Statistics (denormalized for quick access)
  stats: {
    totalEarnings: nuemerging businessr;
    pendingCommissions: nuemerging businessr;
    paidCommissions: nuemerging businessr;
    totalTransactions: nuemerging businessr;
    lastPayoutDate?: Timestamp;
    lastPayoutAmount?: nuemerging businessr;
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
  percentage: nuemerging businessr; // Attribution percentage
  amount: nuemerging businessr; // Calculated commission amount
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
  transactionType: 'meemerging businessrship' | 'event_ticket' | 'sponsorship' | 'pursuit_pack' | 'cohort' | 'service' | 'other';
  totalAmount: nuemerging businessr;
  currency: string;
  
  // Attributions
  attributions: PartnerAttributionItem[];
  
  // Totals
  totalCommissions: nuemerging businessr;
  platformFee: nuemerging businessr;
  netAmount: nuemerging businessr;
  
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
  baseRate: nuemerging businessr; // Base commission rate percentage
  minRevenue: nuemerging businessr; // Minimum revenue threshold
  maxRevenue: nuemerging businessr | null; // Maximum revenue threshold (null = no limit)
  
  // Bonus Configuration
  bonusRate?: nuemerging businessr; // Additional bonus rate for high performers
  bonusThreshold?: nuemerging businessr; // Revenue threshold to qualify for bonus
  
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
  amount: nuemerging businessr;
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
  commissionCount: nuemerging businessr;
  
  // Timing
  scheduledDate: Timestamp;
  processedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Error Handling
  failureReason?: string;
  retryCount: nuemerging businessr;
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
  defaultAttributionPercentages: Record<ContributionType, nuemerging businessr>;
  
  // Platform Settings
  platformFeePercentage: nuemerging businessr;
  minimumPayoutAmount: nuemerging businessr;
  defaultHoldPeriodDays: nuemerging businessr;
  
  // Payout Settings
  autoPayoutEnabled: boolean;
  payoutSchedule: 'immediate' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  payoutDayOfWeek?: nuemerging businessr; // 0-6 for weekly
  payoutDayOfMonth?: nuemerging businessr; // 1-31 for monthly
  
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
  totalPending: nuemerging businessr;
  totalPaid: nuemerging businessr;
  totalEarnings: nuemerging businessr;
  transactionCount: nuemerging businessr;
  lastPayoutDate?: Date;
}

export interface PayoutSummary {
  totalPending: nuemerging businessr;
  totalProcessing: nuemerging businessr;
  totalCompleted: nuemerging businessr;
  totalFailed: nuemerging businessr;
  upcomingPayouts: PayoutDoc[];
}
