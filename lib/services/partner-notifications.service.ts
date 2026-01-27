/**
 * Partner Notifications Service
 * 
 * Handles email notifications to partners for commission events
 */

import { sendTemplatedEmail } from '@/lib/email';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  type PartnerAttributionItem,
  type PartnerProfileDoc,
  type ConsortiumPartnerId,
  PARTNER_COLLECTIONS,
  CONTRIBUTION_TYPE_LABELS,
} from '@/lib/partner-commission-schema';

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'pending' | 'approved' | 'paid' | 'failed';

// ============================================================================
// Partner Lookup
// ============================================================================

/**
 * Get partner profile by ID
 */
export async function getPartnerById(partnerId: ConsortiumPartnerId): Promise<PartnerProfileDoc | null> {
  if (!db) return null;

  try {
    // First try to find by partnerId field
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const profilesRef = collection(db, PARTNER_COLLECTIONS.PARTNER_PROFILES);
    const q = query(profilesRef, where('partnerId', '==', partnerId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PartnerProfileDoc;
    }

    return null;
  } catch (error) {
    console.error('Error getting partner by ID:', error);
    return null;
  }
}

// ============================================================================
// Email Notification Functions
// ============================================================================

/**
 * Notify partners about commission status changes
 */
export async function notifyPartners(
  commissions: PartnerAttributionItem[],
  status: NotificationType,
  transactionDetails?: {
    transactionId: string;
    clientName: string;
    totalAmount: number;
  }
): Promise<void> {
  for (const commission of commissions) {
    // Skip platform fee notifications
    if (commission.partnerId === 'kdm-platform') continue;

    try {
      const partner = await getPartnerById(commission.partnerId);
      
      if (!partner || !partner.contactEmail) {
        console.warn(`No contact email for partner: ${commission.partnerId}`);
        continue;
      }

      switch (status) {
        case 'pending':
          await sendCommissionPendingEmail(partner, commission, transactionDetails);
          break;
        case 'approved':
          await sendCommissionApprovedEmail(partner, commission, transactionDetails);
          break;
        case 'paid':
          await sendCommissionPaidEmail(partner, commission, transactionDetails);
          break;
        case 'failed':
          await sendCommissionFailedEmail(partner, commission, transactionDetails);
          break;
      }
    } catch (error) {
      console.error(`Error notifying partner ${commission.partnerId}:`, error);
    }
  }
}

/**
 * Send commission pending notification
 */
async function sendCommissionPendingEmail(
  partner: PartnerProfileDoc,
  commission: PartnerAttributionItem,
  transactionDetails?: {
    transactionId: string;
    clientName: string;
    totalAmount: number;
  }
): Promise<void> {
  const expectedPayoutDate = new Date();
  expectedPayoutDate.setDate(expectedPayoutDate.getDate() + (partner.holdPeriodDays || 7));

  await sendTemplatedEmail('partnerCommissionPending', partner.contactEmail, {
    partnerName: partner.contactName || partner.displayName,
    clientName: transactionDetails?.clientName || 'Client',
    amount: formatCurrency(commission.amount),
    contributionType: CONTRIBUTION_TYPE_LABELS[commission.contributionType],
    percentage: commission.percentage,
    totalTransactionAmount: transactionDetails ? formatCurrency(transactionDetails.totalAmount) : 'N/A',
    expectedPayoutDate: expectedPayoutDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    transactionId: transactionDetails?.transactionId || 'N/A',
    dashboardUrl: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/portal/partner/revenue`,
  });
}

/**
 * Send commission approved notification
 */
async function sendCommissionApprovedEmail(
  partner: PartnerProfileDoc,
  commission: PartnerAttributionItem,
  transactionDetails?: {
    transactionId: string;
    clientName: string;
    totalAmount: number;
  }
): Promise<void> {
  await sendTemplatedEmail('partnerCommissionApproved', partner.contactEmail, {
    partnerName: partner.contactName || partner.displayName,
    amount: formatCurrency(commission.amount),
    contributionType: CONTRIBUTION_TYPE_LABELS[commission.contributionType],
    transactionId: transactionDetails?.transactionId || 'N/A',
    paymentMethod: getPaymentMethodLabel(partner.paymentMethod),
    dashboardUrl: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/portal/partner/revenue`,
  });
}

/**
 * Send commission paid notification
 */
async function sendCommissionPaidEmail(
  partner: PartnerProfileDoc,
  commission: PartnerAttributionItem,
  transactionDetails?: {
    transactionId: string;
    clientName: string;
    totalAmount: number;
  }
): Promise<void> {
  await sendTemplatedEmail('partnerCommissionPaid', partner.contactEmail, {
    partnerName: partner.contactName || partner.displayName,
    amount: formatCurrency(commission.amount),
    contributionType: CONTRIBUTION_TYPE_LABELS[commission.contributionType],
    transactionId: transactionDetails?.transactionId || 'N/A',
    paymentMethod: getPaymentMethodLabel(partner.paymentMethod),
    payoutId: commission.payoutId || 'N/A',
    dashboardUrl: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/portal/partner/revenue`,
  });
}

/**
 * Send commission failed notification
 */
async function sendCommissionFailedEmail(
  partner: PartnerProfileDoc,
  commission: PartnerAttributionItem,
  transactionDetails?: {
    transactionId: string;
    clientName: string;
    totalAmount: number;
  }
): Promise<void> {
  await sendTemplatedEmail('partnerCommissionFailed', partner.contactEmail, {
    partnerName: partner.contactName || partner.displayName,
    amount: formatCurrency(commission.amount),
    transactionId: transactionDetails?.transactionId || 'N/A',
    supportEmail: 'support@kdmassociates.com',
    dashboardUrl: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/portal/partner/revenue`,
  });
}

// ============================================================================
// Admin Notifications
// ============================================================================

/**
 * Alert admins about payout failures
 */
export async function alertAdmins(
  commission: PartnerAttributionItem,
  error: Error
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kdmassociates.com';

  try {
    await sendTemplatedEmail('adminPayoutAlert', adminEmail, {
      partnerId: commission.partnerId,
      partnerName: commission.partnerName,
      amount: formatCurrency(commission.amount),
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000'}/portal/admin/revenue-config`,
    });
  } catch (emailError) {
    console.error('Failed to send admin alert:', emailError);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    stripe_connect: 'Stripe Connect',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    manual: 'Manual Payment',
  };
  return labels[method] || method;
}
