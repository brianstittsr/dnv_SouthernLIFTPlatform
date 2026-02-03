# Implementation Prompt: Automated Partner Revenue Sharing & Commission System

## Objective
Implement an automated revenue sharing system that detects Stripe payments, identifies contributing consortium partners, calculates commissions based on configured tiers, processes payouts, and sends notifications—all integrated with the existing KDM Platform infrastructure.

## Context
The KDM Consortium Platform connects 6 vertical partners (V+, ADA, E3S, LogiCore, KDM-NMSDC, nDemand) who collaborate to serve 477+ clients. Partners contribute at various stages (lead generation, service delivery, introductions) and should be automatically compensated based on a multi-touch attribution model when clients make payments.

## Current State
- **Existing**: Stripe integration with full/partial payments, basic event management
- **Platform**: Next.js 16 + Firebase Firestore + Stripe webhooks
- **Missing**: Partner attribution tracking, automated commission calculation, payout processing, notification system

## Required Features

### 1. Partner Attribution System
Create a system to track which partner(s) contributed to each sale:

```typescript
// Add to Firestore schema
interface PartnerAttribution {
  transactionId: string;
  clientId: string;
  attributions: Array<{
    partnerId: string;
    partnerName: string; // V+, ADA, E3S, LogiCore, KDM-NMSDC, nDemand
    contributionType: 'lead_generation' | 'service_delivery' | 'introduction' | 'platform_fee';
    percentage: number; // Based on revenue share model
    amount: number; // Calculated commission
    status: 'pending' | 'notified' | 'paid' | 'failed';
  }>;
  totalAmount: number;
  stripePaymentIntentId: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
}
```

### 2. Commission Configuration Integration
Extend the existing Revenue Configuration UI to include:

- **Partner Selection**: Link commission tiers to specific consortium partners
- **Attribution Rules**: Define contribution types and default percentages
  - Lead Generation: 20%
  - Service Delivery: 50%
  - Introduction: 20%
  - Platform Fee: 10%
- **Payment Method**: Configure partner payout preferences (Stripe Connect, PayPal, manual)

### 3. Stripe Webhook Enhancement
Modify existing Stripe webhook handler to:

**On `payment_intent.succeeded` event:**
1. Retrieve payment metadata to identify client and transaction type
2. Query partner attribution records linked to the client/transaction
3. Calculate commission amounts based on configured tiers and attribution rules
4. Create payout records in Firestore
5. Trigger notification workflow
6. Initiate automated payout (if configured)

**Implementation Steps:**

```typescript
// app/api/webhooks/stripe/route.ts (enhance existing)

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // 1. Extract client/transaction context
  const clientId = paymentIntent.metadata.clientId;
  const transactionType = paymentIntent.metadata.transactionType; // membership, event, pack_publishing, etc.
  
  // 2. Retrieve partner attributions
  const attributions = await getPartnerAttributions(clientId, transactionType);
  
  // 3. Calculate commissions
  const commissions = calculateCommissions(
    paymentIntent.amount / 100, // Convert cents to dollars
    attributions
  );
  
  // 4. Save to Firestore
  await savePartnerCommissions({
    transactionId: generateId(),
    clientId,
    stripePaymentIntentId: paymentIntent.id,
    attributions: commissions,
    totalAmount: paymentIntent.amount / 100,
    createdAt: serverTimestamp(),
  });
  
  // 5. Send pre-notifications
  await notifyPartners(commissions, 'pending');
  
  // 6. Process payouts (if auto-payout enabled)
  await processPartnerPayouts(commissions);
}
```

### 4. Partner Attribution Lookup Logic
Create a service to determine partner contributions:

```typescript
// lib/services/partner-attribution.service.ts

export async function getPartnerAttributions(
  clientId: string,
  transactionType: string
): Promise<PartnerContribution[]> {
  const contributions: PartnerContribution[] = [];
  
  // Query lead source
  const leadDoc = await db.collection('leads').doc(clientId).get();
  if (leadDoc.exists) {
    const leadSource = leadDoc.data()?.partnerSource;
    if (leadSource) {
      contributions.push({
        partnerId: leadSource.partnerId,
        partnerName: leadSource.partnerName,
        contributionType: 'lead_generation',
        percentage: 20,
      });
    }
  }
  
  // Query service delivery (from proof packs, CMMC cohorts, etc.)
  const servicePartners = await getServiceDeliveryPartners(clientId, transactionType);
  contributions.push(...servicePartners);
  
  // Query introductions (if transaction resulted from intro)
  const introPartner = await getIntroductionPartner(clientId);
  if (introPartner) {
    contributions.push(introPartner);
  }
  
  // Add platform fee
  contributions.push({
    partnerId: 'kdm-platform',
    partnerName: 'KDM Platform',
    contributionType: 'platform_fee',
    percentage: 10,
  });
  
  return contributions;
}
```

### 5. Commission Calculation Engine
```typescript
function calculateCommissions(
  totalAmount: number,
  attributions: PartnerContribution[]
): CommissionRecord[] {
  return attributions.map(attr => {
    // Get partner's commission tier rate
    const tierRate = getPartnerCommissionRate(attr.partnerId, totalAmount);
    
    // Calculate base commission
    const baseAmount = totalAmount * (attr.percentage / 100);
    
    // Apply tier multiplier
    const finalAmount = baseAmount * (tierRate / 100);
    
    return {
      ...attr,
      amount: finalAmount,
      status: 'pending',
    };
  });
}
```

### 6. Partner Notification System
Create email templates and notification service:

```typescript
// lib/services/partner-notifications.service.ts

export async function notifyPartners(
  commissions: CommissionRecord[],
  status: 'pending' | 'paid'
) {
  for (const commission of commissions) {
    const partner = await getPartnerById(commission.partnerId);
    
    if (status === 'pending') {
      await sendEmail({
        to: partner.email,
        subject: 'Commission Pending - Client Payment Received',
        template: 'partner-commission-pending',
        data: {
          partnerName: partner.name,
          clientName: commission.clientName,
          amount: commission.amount,
          contributionType: commission.contributionType,
          expectedPayoutDate: addDays(new Date(), 7), // 7-day settlement
        },
      });
    }
    
    if (status === 'paid') {
      await sendEmail({
        to: partner.email,
        subject: 'Commission Paid - Payment Processed',
        template: 'partner-commission-paid',
        data: {
          partnerName: partner.name,
          amount: commission.amount,
          transactionId: commission.transactionId,
          paymentMethod: partner.paymentMethod,
        },
      });
    }
  }
}
```

### 7. Automated Payout Processing
Implement Stripe Connect or PayPal integration for automated payouts:

```typescript
// lib/services/partner-payouts.service.ts

export async function processPartnerPayouts(commissions: CommissionRecord[]) {
  for (const commission of commissions) {
    const partner = await getPartnerById(commission.partnerId);
    
    if (partner.autoPayoutEnabled) {
      try {
        if (partner.paymentMethod === 'stripe_connect') {
          await stripeTransfer(commission.amount, partner.stripeAccountId);
        } else if (partner.paymentMethod === 'paypal') {
          await paypalPayout(commission.amount, partner.paypalEmail);
        }
        
        // Update status
        await updateCommissionStatus(commission.id, 'paid');
        
        // Send confirmation
        await notifyPartners([commission], 'paid');
      } catch (error) {
        console.error('Payout failed:', error);
        await updateCommissionStatus(commission.id, 'failed');
        await alertAdmins(commission, error);
      }
    }
  }
}
```

### 8. Admin Dashboard Enhancements
Add to the existing Revenue Configuration page:

**Partner Commission Management Tab:**
- List of all pending/paid commissions
- Filter by partner, date range, status
- Manual payout approval for non-automated partners
- Export to CSV for accounting

**Partner Configuration:**
- Partner profile with payment preferences
- Commission tier assignment
- Auto-payout toggle
- Payment history

### 9. Client/Transaction Metadata Requirements
Update all payment flows to include attribution metadata:

```typescript
// When creating Stripe Checkout Session
const session = await stripe.checkout.sessions.create({
  // ... existing config
  metadata: {
    clientId: user.id,
    transactionType: 'membership' | 'event_registration' | 'pack_publishing',
    leadPartnerId: user.leadSource?.partnerId,
    servicePartnerIds: JSON.stringify(getServicePartnerIds(user)),
  },
});
```

## Technical Requirements

### Database Collections
```typescript
// Add to Firebase schema
COLLECTIONS = {
  // ... existing collections
  PARTNER_ATTRIBUTIONS: 'partner_attributions',
  PARTNER_COMMISSIONS: 'partner_commissions',
  PARTNER_PROFILES: 'partner_profiles',
  PAYOUT_HISTORY: 'payout_history',
};
```

### Environment Variables
```env
# Add to .env.local
STRIPE_CONNECT_CLIENT_ID=your_connect_client_id
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
REVENUE_SHARE_ENABLED=true
AUTO_PAYOUT_ENABLED=true
```

### API Routes
```
app/api/
├── webhooks/stripe/route.ts (enhance existing)
├── admin/
│   ├── commissions/route.ts (list, filter)
│   ├── commissions/[id]/approve/route.ts
│   └── partners/[id]/payout-settings/route.ts
└── partners/
    ├── commissions/route.ts (partner's own commissions)
    └── payout-history/route.ts
```

## Implementation Checklist

- [ ] Create partner attribution data model and Firestore collections
- [ ] Build partner attribution lookup service
- [ ] Implement commission calculation engine
- [ ] Enhance Stripe webhook to trigger commission workflow
- [ ] Create partner notification email templates
- [ ] Build automated payout service (Stripe Connect/PayPal)
- [ ] Add partner commission management to Revenue Config UI
- [ ] Create admin dashboard for commission approval
- [ ] Add partner-facing commission history page
- [ ] Update all payment flows to include attribution metadata
- [ ] Write unit tests for commission calculation logic
- [ ] Document revenue share model in admin guide

## Success Criteria
- ✅ Stripe payment automatically triggers partner commission calculation
- ✅ Partners receive email notification within 5 minutes of payment
- ✅ Commissions calculated correctly based on attribution rules (20/50/20/10)
- ✅ Automated payouts process within 7 days (or manual approval)
- ✅ Admin can view/approve/export all commissions
- ✅ Partners can view their commission history
- ✅ Zero manual data entry required for standard transactions

## Priority
**CRITICAL** - This feature enables the core consortium business model and partner monetization strategy outlined in the project brief.

---

**Next Steps**: Review this implementation plan, then proceed with building the partner attribution system first, followed by commission calculation, webhook enhancement, and finally the payout automation.