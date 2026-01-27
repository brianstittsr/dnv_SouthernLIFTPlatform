/**
 * Partner Attribution Service
 * 
 * Handles partner attribution lookup, commission calculation,
 * and attribution tracking for the revenue sharing system.
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
import { COLLECTIONS } from '@/lib/schema';
import {
  type ConsortiumPartnerId,
  type ContributionType,
  type PartnerAttributionDoc,
  type PartnerAttributionItem,
  type PartnerProfileDoc,
  type CommissionTierDoc,
  type CommissionStatus,
  CONSORTIUM_PARTNERS,
  DEFAULT_ATTRIBUTION_PERCENTAGES,
  PARTNER_COLLECTIONS,
} from '@/lib/partner-commission-schema';

// ============================================================================
// Partner Contribution Interface
// ============================================================================

export interface PartnerContribution {
  partnerId: ConsortiumPartnerId;
  partnerName: string;
  contributionType: ContributionType;
  percentage: number;
}

// ============================================================================
// Attribution Lookup Functions
// ============================================================================

/**
 * Get partner attributions for a client/transaction
 */
export async function getPartnerAttributions(
  clientId: string,
  transactionType: string
): Promise<PartnerContribution[]> {
  if (!db) return getDefaultAttributions();

  const contributions: PartnerContribution[] = [];

  try {
    // 1. Query lead source to find lead generation partner
    const leadsRef = collection(db, COLLECTIONS.LEADS);
    const leadQuery = query(leadsRef, where('smeId', '==', clientId));
    const leadSnapshot = await getDocs(leadQuery);

    if (!leadSnapshot.empty) {
      const leadData = leadSnapshot.docs[0].data();
      if (leadData.assignedTo) {
        const leadPartner = await getPartnerFromAssignment(leadData.assignedTo);
        if (leadPartner) {
          contributions.push({
            partnerId: leadPartner.partnerId,
            partnerName: leadPartner.name,
            contributionType: 'lead_generation',
            percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.lead_generation,
          });
        }
      }
    }

    // 2. Query service delivery partners based on transaction type
    const servicePartners = await getServiceDeliveryPartners(clientId, transactionType);
    contributions.push(...servicePartners);

    // 3. Query introductions
    const introPartner = await getIntroductionPartner(clientId);
    if (introPartner) {
      contributions.push(introPartner);
    }

    // 4. Always add platform fee
    contributions.push({
      partnerId: 'kdm-platform',
      partnerName: CONSORTIUM_PARTNERS['kdm-platform'].displayName,
      contributionType: 'platform_fee',
      percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.platform_fee,
    });

    // If no partners found (except platform), use default V+ as service delivery
    if (contributions.length === 1) {
      contributions.unshift({
        partnerId: 'vplus',
        partnerName: CONSORTIUM_PARTNERS['vplus'].displayName,
        contributionType: 'service_delivery',
        percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery,
      });
    }

    return contributions;
  } catch (error) {
    console.error('Error getting partner attributions:', error);
    return getDefaultAttributions();
  }
}

/**
 * Get default attributions when no specific partners are found
 */
function getDefaultAttributions(): PartnerContribution[] {
  return [
    {
      partnerId: 'vplus',
      partnerName: CONSORTIUM_PARTNERS['vplus'].displayName,
      contributionType: 'service_delivery',
      percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery,
    },
    {
      partnerId: 'kdm-platform',
      partnerName: CONSORTIUM_PARTNERS['kdm-platform'].displayName,
      contributionType: 'platform_fee',
      percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.platform_fee,
    },
  ];
}

/**
 * Get partner from team member assignment
 */
async function getPartnerFromAssignment(assignedTo: string): Promise<{ partnerId: ConsortiumPartnerId; name: string } | null> {
  if (!db) return null;

  try {
    // Check if assignedTo is a partner profile ID
    const partnerRef = doc(db, PARTNER_COLLECTIONS.PARTNER_PROFILES, assignedTo);
    const partnerSnap = await getDoc(partnerRef);
    
    if (partnerSnap.exists()) {
      const data = partnerSnap.data() as PartnerProfileDoc;
      return { partnerId: data.partnerId, name: data.displayName };
    }

    // Check team members collection
    const teamMemberRef = doc(db, COLLECTIONS.TEAM_MEMBERS, assignedTo);
    const teamMemberSnap = await getDoc(teamMemberRef);
    
    if (teamMemberSnap.exists()) {
      const data = teamMemberSnap.data();
      // Map team member to partner based on company/role
      const partnerId = mapTeamMemberToPartner(data);
      if (partnerId) {
        return { partnerId, name: CONSORTIUM_PARTNERS[partnerId].displayName };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting partner from assignment:', error);
    return null;
  }
}

/**
 * Map team member to consortium partner
 */
function mapTeamMemberToPartner(teamMember: any): ConsortiumPartnerId | null {
  const company = (teamMember.company || '').toLowerCase();
  const expertise = (teamMember.expertise || '').toLowerCase();

  if (company.includes('strategic value') || company.includes('v+') || company.includes('vplus')) {
    return 'vplus';
  }
  if (company.includes('ada')) {
    return 'ada';
  }
  if (company.includes('e3s')) {
    return 'e3s';
  }
  if (company.includes('logicore')) {
    return 'logicore';
  }
  if (company.includes('nmsdc') || company.includes('kdm-nmsdc')) {
    return 'kdm-nmsdc';
  }
  if (company.includes('ndemand')) {
    return 'ndemand';
  }

  // Default to V+ for service delivery
  return 'vplus';
}

/**
 * Get service delivery partners based on transaction type
 */
async function getServiceDeliveryPartners(
  clientId: string,
  transactionType: string
): Promise<PartnerContribution[]> {
  if (!db) return [];

  const partners: PartnerContribution[] = [];

  try {
    switch (transactionType) {
      case 'cohort':
      case 'cmmc_training':
        // CMMC training is delivered by V+
        partners.push({
          partnerId: 'vplus',
          partnerName: CONSORTIUM_PARTNERS['vplus'].displayName,
          contributionType: 'service_delivery',
          percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery,
        });
        break;

      case 'proof_pack':
      case 'pursuit_pack':
        // Proof packs may have assigned partners
        const proofPacksRef = collection(db, COLLECTIONS.PROOF_PACKS);
        const ppQuery = query(proofPacksRef, where('smeId', '==', clientId));
        const ppSnapshot = await getDocs(ppQuery);
        
        if (!ppSnapshot.empty) {
          const ppData = ppSnapshot.docs[0].data();
          if (ppData.partnerId) {
            const partner = await getPartnerFromAssignment(ppData.partnerId);
            if (partner) {
              partners.push({
                partnerId: partner.partnerId,
                partnerName: partner.name,
                contributionType: 'service_delivery',
                percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery,
              });
            }
          }
        }
        break;

      case 'membership':
      case 'event_ticket':
      case 'sponsorship':
      default:
        // Default service delivery to V+
        partners.push({
          partnerId: 'vplus',
          partnerName: CONSORTIUM_PARTNERS['vplus'].displayName,
          contributionType: 'service_delivery',
          percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.service_delivery,
        });
        break;
    }

    return partners;
  } catch (error) {
    console.error('Error getting service delivery partners:', error);
    return [];
  }
}

/**
 * Get introduction partner if transaction resulted from an introduction
 */
async function getIntroductionPartner(clientId: string): Promise<PartnerContribution | null> {
  if (!db) return null;

  try {
    const introsRef = collection(db, COLLECTIONS.INTRODUCTIONS);
    const introQuery = query(
      introsRef, 
      where('smeId', '==', clientId),
      where('status', 'in', ['meeting_held', 'RFQ_sent', 'proposal_submitted', 'award'])
    );
    const introSnapshot = await getDocs(introQuery);

    if (!introSnapshot.empty) {
      const introData = introSnapshot.docs[0].data();
      if (introData.partnerId) {
        const partner = await getPartnerFromAssignment(introData.partnerId);
        if (partner) {
          return {
            partnerId: partner.partnerId,
            partnerName: partner.name,
            contributionType: 'introduction',
            percentage: DEFAULT_ATTRIBUTION_PERCENTAGES.introduction,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting introduction partner:', error);
    return null;
  }
}

// ============================================================================
// Commission Calculation Functions
// ============================================================================

/**
 * Calculate commissions for all attributed partners
 */
export function calculateCommissions(
  totalAmount: number,
  attributions: PartnerContribution[],
  commissionTiers?: CommissionTierDoc[]
): PartnerAttributionItem[] {
  return attributions.map(attr => {
    // Get partner's commission tier rate if available
    const tierRate = getPartnerCommissionRate(attr.partnerId, totalAmount, commissionTiers);
    
    // Calculate base commission based on attribution percentage
    const baseAmount = totalAmount * (attr.percentage / 100);
    
    // Apply tier multiplier if available (for non-platform fees)
    const finalAmount = attr.contributionType === 'platform_fee' 
      ? baseAmount 
      : baseAmount * (tierRate / 100);

    return {
      partnerId: attr.partnerId,
      partnerName: attr.partnerName,
      contributionType: attr.contributionType,
      percentage: attr.percentage,
      amount: Math.round(finalAmount * 100) / 100, // Round to 2 decimal places
      status: 'pending' as CommissionStatus,
    };
  });
}

/**
 * Get partner's commission rate based on tier
 */
function getPartnerCommissionRate(
  partnerId: ConsortiumPartnerId,
  totalAmount: number,
  commissionTiers?: CommissionTierDoc[]
): number {
  if (!commissionTiers || commissionTiers.length === 0) {
    return 100; // Default to 100% of attributed amount
  }

  // Find tier that matches the partner and revenue range
  const matchingTier = commissionTiers.find(tier => 
    tier.isActive &&
    tier.assignedPartnerIds.includes(partnerId) &&
    totalAmount >= tier.minRevenue &&
    (tier.maxRevenue === null || totalAmount <= tier.maxRevenue)
  );

  if (matchingTier) {
    // Check if bonus applies
    if (matchingTier.bonusRate && matchingTier.bonusThreshold && totalAmount >= matchingTier.bonusThreshold) {
      return matchingTier.baseRate + matchingTier.bonusRate;
    }
    return matchingTier.baseRate;
  }

  return 100; // Default rate
}

// ============================================================================
// Attribution Storage Functions
// ============================================================================

/**
 * Save partner commissions to Firestore
 */
export async function savePartnerCommissions(data: {
  transactionId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  transactionType: string;
  totalAmount: number;
  currency: string;
  attributions: PartnerAttributionItem[];
}): Promise<string | null> {
  if (!db) return null;

  try {
    const totalCommissions = data.attributions.reduce((sum, a) => sum + a.amount, 0);
    const platformFee = data.attributions.find(a => a.contributionType === 'platform_fee')?.amount || 0;

    const attributionDoc: Omit<PartnerAttributionDoc, 'id'> = {
      transactionId: data.transactionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      stripeCustomerId: data.stripeCustomerId,
      clientId: data.clientId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      transactionType: data.transactionType as any,
      totalAmount: data.totalAmount,
      currency: data.currency,
      attributions: data.attributions,
      totalCommissions,
      platformFee,
      netAmount: data.totalAmount - totalCommissions,
      overallStatus: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS),
      attributionDoc
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving partner commissions:', error);
    return null;
  }
}

/**
 * Update commission status for a specific partner attribution
 */
export async function updateCommissionStatus(
  attributionId: string,
  partnerId: ConsortiumPartnerId,
  status: CommissionStatus,
  additionalData?: {
    payoutId?: string;
    notes?: string;
  }
): Promise<boolean> {
  if (!db) return false;

  try {
    const docRef = doc(db, PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS, attributionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;

    const data = docSnap.data() as PartnerAttributionDoc;
    const updatedAttributions = data.attributions.map(attr => {
      if (attr.partnerId === partnerId) {
        return {
          ...attr,
          status,
          ...(status === 'notified' && { notifiedAt: Timestamp.now() }),
          ...(status === 'paid' && { paidAt: Timestamp.now() }),
          ...(additionalData?.payoutId && { payoutId: additionalData.payoutId }),
          ...(additionalData?.notes && { notes: additionalData.notes }),
        };
      }
      return attr;
    });

    // Determine overall status
    const allPaid = updatedAttributions.every(a => a.status === 'paid');
    const somePaid = updatedAttributions.some(a => a.status === 'paid');
    const overallStatus = allPaid ? 'fully_paid' : somePaid ? 'partially_paid' : 'pending';

    await updateDoc(docRef, {
      attributions: updatedAttributions,
      overallStatus,
      updatedAt: Timestamp.now(),
      ...(allPaid && { processedAt: Timestamp.now() }),
    });

    return true;
  } catch (error) {
    console.error('Error updating commission status:', error);
    return false;
  }
}

/**
 * Get pending commissions for a partner
 */
export async function getPendingCommissions(
  partnerId: ConsortiumPartnerId
): Promise<PartnerAttributionDoc[]> {
  if (!db) return [];

  try {
    const attributionsRef = collection(db, PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS);
    const q = query(attributionsRef, where('overallStatus', 'in', ['pending', 'partially_paid']));
    const snapshot = await getDocs(q);

    const results: PartnerAttributionDoc[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = { id: doc.id, ...doc.data() } as PartnerAttributionDoc;
      // Filter to only include attributions for this partner that are pending
      const hasPendingForPartner = data.attributions.some(
        a => a.partnerId === partnerId && a.status === 'pending'
      );
      if (hasPendingForPartner) {
        results.push(data);
      }
    });

    return results;
  } catch (error) {
    console.error('Error getting pending commissions:', error);
    return [];
  }
}

/**
 * Get all commissions for a partner
 */
export async function getPartnerCommissions(
  partnerId: ConsortiumPartnerId,
  options?: {
    status?: CommissionStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<PartnerAttributionDoc[]> {
  if (!db) return [];

  try {
    const attributionsRef = collection(db, PARTNER_COLLECTIONS.PARTNER_ATTRIBUTIONS);
    // Note: Firestore doesn't support array-contains with other conditions well,
    // so we fetch all and filter client-side
    const snapshot = await getDocs(attributionsRef);

    let results: PartnerAttributionDoc[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = { id: doc.id, ...doc.data() } as PartnerAttributionDoc;
      const hasPartner = data.attributions.some(a => a.partnerId === partnerId);
      if (hasPartner) {
        results.push(data);
      }
    });

    // Apply filters
    if (options?.status) {
      results = results.filter(r => 
        r.attributions.some(a => a.partnerId === partnerId && a.status === options.status)
      );
    }

    if (options?.startDate) {
      results = results.filter(r => r.createdAt.toDate() >= options.startDate!);
    }

    if (options?.endDate) {
      results = results.filter(r => r.createdAt.toDate() <= options.endDate!);
    }

    // Sort by date descending
    results.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  } catch (error) {
    console.error('Error getting partner commissions:', error);
    return [];
  }
}
