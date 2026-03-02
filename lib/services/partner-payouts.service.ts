/**
 * Partner Payouts Service
 * 
 * Handles automated and manual payout processing for partner commissions
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';
import Stripe from 'stripe';
import {
  type ConsortiumPartnerId,
  type PartnerProfileDoc,
  type PayoutDoc,
  type PayoutStatus,
  type CommissionStatus,
  PARTNER_COLLECTIONS,
} from '@/lib/partner-commission-schema';
import { 
  updateCommissionStatus, 
  getPendingCommissions 
} from './partner-attribution.service';
import { 
  notifyPartners, 
  alertAdmins, 
  getPartnerById 
} from './partner-notifications.service';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// ============================================================================
// Payout Processing Functions
// ============================================================================

/**
 * Process payouts for all pending commissions
 */
export async function processPartnerPayouts(
  commissions: Array<{
    attributionId: string;
    partnerId: ConsortiumPartnerId;
    partnerName: string;
    amount: number;
    contributionType: string;
  }>
): Promise<void> {
  // Group commissions by partner
  const partnerCommissions = new Map<ConsortiumPartnerId, typeof commissions>();
  
  for (const commission of commissions) {
    const existing = partnerCommissions.get(commission.partnerId) || [];
    existing.push(commission);
    partnerCommissions.set(commission.partnerId, existing);
  }

  // Process each partner's commissions
  for (const [partnerId, partnerComms] of partnerCommissions) {
    // Skip platform fee
    if (partnerId === 'kdm-platform') continue;

    try {
      const partner = await getPartnerById(partnerId);
      
      if (!partner) {
        console.warn(`Partner not found: ${partnerId}`);
        continue;
      }

      // Check if auto-payout is enabled
      if (!partner.autoPayoutEnabled) {
        console.log(`Auto-payout disabled for partner: ${partnerId}`);
        // Just mark as notified
        for (const comm of partnerComms) {
          await updateCommissionStatus(comm.attributionId, partnerId, 'notified');
        }
        continue;
      }

      // Calculate total payout amount
      const totalAmount = partnerComms.reduce((sum, c) => sum + c.amount, 0);

      // Check minimum payout threshold
      if (totalAmount < partner.minimumPayoutAmount) {
        console.log(`Payout amount ${totalAmount} below minimum ${partner.minimumPayoutAmount} for partner: ${partnerId}`);
        continue;
      }

      // Create payout record
      const payoutId = await createPayoutRecord({
        partnerId,
        partnerName: partner.displayName,
        partnerProfileId: partner.id,
        amount: totalAmount,
        paymentMethod: partner.paymentMethod,
        commissionIds: partnerComms.map(c => c.attributionId),
        holdPeriodDays: partner.holdPeriodDays,
        requiresApproval: !partner.autoPayoutEnabled,
      });

      if (!payoutId) {
        console.error(`Failed to create payout record for partner: ${partnerId}`);
        continue;
      }

      // Process the payout based on payment method
      const success = await executePayoutByMethod(partner, totalAmount, payoutId);

      if (success) {
        // Update commission statuses
        for (const comm of partnerComms) {
          await updateCommissionStatus(comm.attributionId, partnerId, 'paid', { payoutId });
        }

        // Update payout status
        await updatePayoutStatus(payoutId, 'completed');

        // Notify partner
        await notifyPartners(
          partnerComms.map(c => ({
            partnerId: c.partnerId,
            partnerName: c.partnerName,
            contributionType: c.contributionType as any,
            percentage: 0,
            amount: c.amount,
            status: 'paid' as CommissionStatus,
            payoutId,
          })),
          'paid'
        );
      } else {
        // Mark as failed
        await updatePayoutStatus(payoutId, 'failed', 'Payment processing failed');
        
        for (const comm of partnerComms) {
          await updateCommissionStatus(comm.attributionId, partnerId, 'failed');
        }

        // Alert admins
        await alertAdmins(
          {
            partnerId,
            partnerName: partner.displayName,
            contributionType: 'service_delivery',
            percentage: 0,
            amount: totalAmount,
            status: 'failed',
          },
          new Error('Payout processing failed')
        );
      }
    } catch (error) {
      console.error(`Error processing payout for partner ${partnerId}:`, error);
    }
  }
}

/**
 * Execute payout based on partner's payment method
 */
async function executePayoutByMethod(
  partner: PartnerProfileDoc,
  amount: number,
  payoutId: string
): Promise<boolean> {
  try {
    switch (partner.paymentMethod) {
      case 'stripe_connect':
        return await processStripeConnectPayout(partner, amount, payoutId);
      
      case 'paypal':
        return await processPayPalPayout(partner, amount, payoutId);
      
      case 'bank_transfer':
        // Bank transfers require manual processing
        console.log(`Bank transfer payout requires manual processing: ${payoutId}`);
        await updatePayoutStatus(payoutId, 'pending', 'Awaiting manual bank transfer');
        return false;
      
      case 'manual':
        // Manual payouts require admin approval
        console.log(`Manual payout requires admin approval: ${payoutId}`);
        await updatePayoutStatus(payoutId, 'pending', 'Awaiting admin approval');
        return false;
      
      default:
        console.error(`Unknown payment method: ${partner.paymentMethod}`);
        return false;
    }
  } catch (error) {
    console.error('Error executing payout:', error);
    return false;
  }
}

/**
 * Process Stripe Connect transfer
 */
async function processStripeConnectPayout(
  partner: PartnerProfileDoc,
  amount: number,
  payoutId: string
): Promise<boolean> {
  if (!partner.stripeConnectAccountId) {
    console.error('No Stripe Connect account ID for partner:', partner.partnerId);
    return false;
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: partner.stripeConnectAccountId,
      metadata: {
        payoutId,
        partnerId: partner.partnerId,
        partnerName: partner.displayName,
      },
    });

    // Update payout with Stripe transfer ID
    if (db) {
      const payoutRef = doc(db, PARTNER_COLLECTIONS.PAYOUTS, payoutId);
      await updateDoc(payoutRef, {
        stripeTransferId: transfer.id,
        processedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    console.log(`Stripe transfer created: ${transfer.id}`);
    return true;
  } catch (error: any) {
    console.error('Stripe transfer failed:', error);
    
    if (db) {
      const payoutRef = doc(db, PARTNER_COLLECTIONS.PAYOUTS, payoutId);
      await updateDoc(payoutRef, {
        failureReason: error.message,
        updatedAt: Timestamp.now(),
      });
    }
    
    return false;
  }
}

/**
 * Process PayPal payout
 */
async function processPayPalPayout(
  partner: PartnerProfileDoc,
  amount: number,
  payoutId: string
): Promise<boolean> {
  if (!partner.paypalEmail) {
    console.error('No PayPal email for partner:', partner.partnerId);
    return false;
  }

  // PayPal integration would go here
  // For now, mark as pending manual processing
  console.log(`PayPal payout pending implementation: ${payoutId}`);
  
  if (db) {
    const payoutRef = doc(db, PARTNER_COLLECTIONS.PAYOUTS, payoutId);
    await updateDoc(payoutRef, {
      status: 'pending',
      failureReason: 'PayPal integration pending - requires manual processing',
      updatedAt: Timestamp.now(),
    });
  }

  return false;
}

// ============================================================================
// Payout Record Management
// ============================================================================

/**
 * Create a payout record
 */
async function createPayoutRecord(data: {
  partnerId: ConsortiumPartnerId;
  partnerName: string;
  partnerProfileId: string;
  amount: number;
  paymentMethod: string;
  commissionIds: string[];
  holdPeriodDays: number;
  requiresApproval: boolean;
}): Promise<string | null> {
  if (!db) return null;

  try {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + data.holdPeriodDays);

    const payout: Omit<PayoutDoc, 'id'> = {
      partnerId: data.partnerId,
      partnerName: data.partnerName,
      partnerProfileId: data.partnerProfileId,
      amount: data.amount,
      currency: 'USD',
      paymentMethod: data.paymentMethod as any,
      status: 'pending',
      commissionIds: data.commissionIds,
      commissionCount: data.commissionIds.length,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      retryCount: 0,
      requiresApproval: data.requiresApproval,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, PARTNER_COLLECTIONS.PAYOUTS), payout);
    return docRef.id;
  } catch (error) {
    console.error('Error creating payout record:', error);
    return null;
  }
}

/**
 * Update payout status
 */
async function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
  failureReason?: string
): Promise<boolean> {
  if (!db) return false;

  try {
    const payoutRef = doc(db, PARTNER_COLLECTIONS.PAYOUTS, payoutId);
    
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === 'completed') {
      updateData.completedAt = Timestamp.now();
    }

    if (status === 'processing') {
      updateData.processedAt = Timestamp.now();
    }

    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    await updateDoc(payoutRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating payout status:', error);
    return false;
  }
}

/**
 * Approve a manual payout
 */
export async function approveManualPayout(
  payoutId: string,
  approvedBy: string
): Promise<boolean> {
  if (!db) return false;

  try {
    const payoutRef = doc(db, PARTNER_COLLECTIONS.PAYOUTS, payoutId);
    const payoutSnap = await getDoc(payoutRef);

    if (!payoutSnap.exists()) {
      console.error('Payout not found:', payoutId);
      return false;
    }

    const payout = payoutSnap.data() as PayoutDoc;

    await updateDoc(payoutRef, {
      status: 'completed',
      approvedBy,
      approvedAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update all associated commission statuses
    for (const commissionId of payout.commissionIds) {
      await updateCommissionStatus(commissionId, payout.partnerId, 'paid', { payoutId });
    }

    return true;
  } catch (error) {
    console.error('Error approving payout:', error);
    return false;
  }
}

/**
 * Get pending payouts
 */
export async function getPendingPayouts(): Promise<PayoutDoc[]> {
  if (!db) return [];

  try {
    const payoutsRef = collection(db, PARTNER_COLLECTIONS.PAYOUTS);
    const q = query(payoutsRef, where('status', 'in', ['pending', 'processing']));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutDoc));
  } catch (error) {
    console.error('Error getting pending payouts:', error);
    return [];
  }
}

/**
 * Get payout history for a partner
 */
export async function getPartnerPayoutHistory(
  partnerId: ConsortiumPartnerId,
  limit?: number
): Promise<PayoutDoc[]> {
  if (!db) return [];

  try {
    const payoutsRef = collection(db, PARTNER_COLLECTIONS.PAYOUTS);
    const q = query(payoutsRef, where('partnerId', '==', partnerId));
    const snapshot = await getDocs(q);

    let payouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutDoc));
    
    // Sort by date descending
    payouts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    if (limit) {
      payouts = payouts.slice(0, limit);
    }

    return payouts;
  } catch (error) {
    console.error('Error getting partner payout history:', error);
    return [];
  }
}

/**
 * Retry a failed payout
 */
export async function retryFailedPayout(payoutId: string): Promise<boolean> {
  if (!db) return false;

  try {
    const payoutRef = doc(db, PARTNER_COLLECTIONS.PAYOUTS, payoutId);
    const payoutSnap = await getDoc(payoutRef);

    if (!payoutSnap.exists()) {
      console.error('Payout not found:', payoutId);
      return false;
    }

    const payout = { id: payoutSnap.id, ...payoutSnap.data() } as PayoutDoc;

    if (payout.status !== 'failed') {
      console.error('Payout is not in failed status:', payoutId);
      return false;
    }

    // Update retry count
    await updateDoc(payoutRef, {
      status: 'processing',
      retryCount: payout.retryCount + 1,
      lastRetryAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Get partner and retry payout
    const partner = await getPartnerById(payout.partnerId);
    if (!partner) {
      await updatePayoutStatus(payoutId, 'failed', 'Partner not found');
      return false;
    }

    const success = await executePayoutByMethod(partner, payout.amount, payoutId);

    if (success) {
      await updatePayoutStatus(payoutId, 'completed');
      
      // Update commission statuses
      for (const commissionId of payout.commissionIds) {
        await updateCommissionStatus(commissionId, payout.partnerId, 'paid', { payoutId });
      }
    } else {
      await updatePayoutStatus(payoutId, 'failed', 'Retry failed');
    }

    return success;
  } catch (error) {
    console.error('Error retrying payout:', error);
    return false;
  }
}
