/**
 * Stripe Integration for KDM Consortium Platform
 * 
 * Handles payment processing, subscriptions, and revenue splitting
 * between KDM and V+ using Stripe Connect.
 */

import Stripe from 'stripe';

// Lazy initialization to allow build without STRIPE_SECRET_KEY
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Revenue split configuration (50/50 between KDM and V+)
 */
export const REVENUE_SPLIT = {
  KDM_PERCENTAGE: 50,
  VPLUS_PERCENTAGE: 50,
  RESERVE_PERCENTAGE: 5, // For refunds/chargebacks
} as const;

/**
 * Membership tier pricing
 */
export const MEMBERSHIP_TIERS = {
  'core-capture': {
    name: 'Core Capture Member',
    monthlyPrice: 175000, // $1,750.00 in cents
    annualPrice: 189000, // $1,890.00 in cents (10% discount)
    features: [
      'Opportunity matching',
      'Best-fit team assembly',
      'Proposal orchestration',
      'Concierge support',
      'Buyer briefings access',
      'Resource library access',
    ],
    conciergeHoursLimit: 5,
  },
  'pursuit-pack': {
    name: 'Pursuit Pack Add-on',
    price: 50000, // $500.00 per pursuit
    features: [
      'Complex proposal support',
      'Multiple volumes',
      'Pricing narratives',
      'Rapid turnaround',
    ],
  },
} as const;

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(params: {
  email: string;
  name: string;
  userId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  const customer = await getStripe().customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId,
      ...params.metadata,
    },
  });

  return customer;
}

/**
 * Create a subscription for a member
 */
export async function createMembershipSubscription(params: {
  customerId: string;
  tier: 'core-capture';
  billingCycle: 'monthly' | 'annual';
  trialDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  const tierConfig = MEMBERSHIP_TIERS[params.tier];
  const price = params.billingCycle === 'monthly' 
    ? tierConfig.monthlyPrice 
    : tierConfig.annualPrice;

  // Create a price for this subscription
  const stripePrice = await getStripe().prices.create({
    unit_amount: price,
    currency: 'usd',
    recurring: {
      interval: params.billingCycle === 'monthly' ? 'month' : 'year',
    },
    product_data: {
      name: tierConfig.name,
      metadata: {
        tier: params.tier,
      },
    },
  });

  // Create subscription with automatic payment splitting
  const subscription = await getStripe().subscriptions.create({
    customer: params.customerId,
    items: [{ price: stripePrice.id }],
    trial_period_days: params.trialDays,
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    metadata: {
      tier: params.tier,
      billingCycle: params.billingCycle,
      ...params.metadata,
    },
  });

  return subscription;
}

/**
 * Create a payment intent with automatic revenue splitting
 * Used for one-time payments like event tickets or pursuit packs
 */
export async function createPaymentIntentWithSplit(params: {
  amount: number; // in cents
  currency?: string;
  customerId?: string;
  description: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const { amount, currency = 'usd', customerId, description, metadata } = params;

  // Calculate splits (50/50 after reserve)
  const reserveAmount = Math.round(amount * (REVENUE_SPLIT.RESERVE_PERCENTAGE / 100));
  const netAmount = amount - reserveAmount;
  const kdmShare = Math.round(netAmount * (REVENUE_SPLIT.KDM_PERCENTAGE / 100));
  const vplusShare = netAmount - kdmShare;

  const paymentIntent = await getStripe().paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    description,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      ...metadata,
      reserveAmount: reserveAmount.toString(),
      kdmShare: kdmShare.toString(),
      vplusShare: vplusShare.toString(),
    },
  });

  return paymentIntent;
}

/**
 * Process refund with proper split reversal
 */
export async function processRefund(params: {
  paymentIntentId: string;
  amount?: number; // Optional partial refund
  reason?: Stripe.RefundCreateParams.Reason;
}): Promise<Stripe.Refund> {
  const refund = await getStripe().refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount,
    reason: params.reason,
  });

  return refund;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(params: {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
}): Promise<Stripe.Subscription> {
  const subscription = await getStripe().subscriptions.update(params.subscriptionId, {
    cancel_at_period_end: params.cancelAtPeriodEnd ?? true,
  });

  return subscription;
}

/**
 * Retrieve customer's payment methods
 */
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await getStripe().paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods.data;
}

/**
 * Create a Stripe Checkout session for membership enrollment
 */
export async function createCheckoutSession(params: {
  customerId: string;
  tier: 'core-capture';
  billingCycle: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  const tierConfig = MEMBERSHIP_TIERS[params.tier];
  const price = params.billingCycle === 'monthly' 
    ? tierConfig.monthlyPrice 
    : tierConfig.annualPrice;

  // Create a price for checkout
  const stripePrice = await getStripe().prices.create({
    unit_amount: price,
    currency: 'usd',
    recurring: {
      interval: params.billingCycle === 'monthly' ? 'month' : 'year',
    },
    product_data: {
      name: tierConfig.name,
    },
  });

  const session = await getStripe().checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [
      {
        price: stripePrice.id,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      trial_period_days: params.trialDays,
      metadata: {
        tier: params.tier,
        billingCycle: params.billingCycle,
      },
    },
  });

  return session;
}

/**
 * Create a checkout session for event tickets
 */
export async function createTicketCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  eventId: string;
  ticketType: string;
  price: number; // in cents
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  promoCode?: string;
}): Promise<Stripe.Checkout.Session> {
  const session = await getStripe().checkout.sessions.create({
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: params.price,
          product_data: {
            name: `Event Ticket - ${params.ticketType}`,
            metadata: {
              eventId: params.eventId,
              ticketType: params.ticketType,
            },
          },
        },
        quantity: params.quantity,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      eventId: params.eventId,
      ticketType: params.ticketType,
    },
    ...(params.promoCode && {
      discounts: [{ coupon: params.promoCode }],
    }),
  });

  return session;
}

/**
 * Create a checkout session for partial payments/installments
 */
export async function createPartialPaymentCheckoutSession(params: {
  customerId?: string;
  customerEmail: string;
  entityType: "event" | "sponsorship" | "membership" | "other";
  entityId: string;
  entityName: string;
  totalAmount: number; // total cost in cents
  paymentAmount: number; // amount to pay now in cents
  successUrl: string;
  cancelUrl: string;
  paymentPlanId?: string; // link to existing plan if this is a subsequent payment
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const session = await getStripe().checkout.sessions.create({
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: params.paymentAmount,
          product_data: {
            name: `Partial Payment - ${params.entityName}`,
            description: `Total amount: $${(params.totalAmount / 100).toFixed(2)}. This payment: $${(params.paymentAmount / 100).toFixed(2)}`,
            metadata: {
              entityType: params.entityType,
              entityId: params.entityId,
            },
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      ...params.metadata,
      entityType: params.entityType,
      entityId: params.entityId,
      totalAmount: params.totalAmount.toString(),
      paymentAmount: params.paymentAmount.toString(),
      paymentPlanId: params.paymentPlanId || '',
      isPartial: 'true',
    },
  });

  return session;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

/**
 * Calculate revenue split for settlement reporting
 */
export function calculateRevenueSplit(params: {
  programRevenues: number;
  processorFees: number;
  chargebacks: number;
  refunds: number;
  fraudLosses: number;
  thirdPartyCosts: number;
  platformRunCostAllowance: number;
  costRecoveryPool?: number;
}): {
  directProgramCosts: number;
  netProgramRevenue: number;
  kdmShare: number;
  vplusShare: number;
} {
  const directProgramCosts =
    params.processorFees +
    params.chargebacks +
    params.refunds +
    params.fraudLosses +
    params.thirdPartyCosts;

  const netProgramRevenue =
    params.programRevenues -
    directProgramCosts -
    params.platformRunCostAllowance -
    (params.costRecoveryPool || 0);

  const kdmShare = Math.round(netProgramRevenue * (REVENUE_SPLIT.KDM_PERCENTAGE / 100));
  const vplusShare = netProgramRevenue - kdmShare;

  return {
    directProgramCosts,
    netProgramRevenue,
    kdmShare,
    vplusShare,
  };
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await getStripe().subscriptions.retrieve(subscriptionId);
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription> {
  return await getStripe().subscriptions.update(subscriptionId, params);
}

/**
 * Retrieve customer
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  return await getStripe().customers.retrieve(customerId) as Stripe.Customer;
}

/**
 * Create a coupon for discounts
 */
export async function createCoupon(params: {
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  maxRedemptions?: number;
  expiresAt?: number; // Unix timestamp
}): Promise<Stripe.Coupon> {
  const coupon = await getStripe().coupons.create({
    percent_off: params.percentOff,
    amount_off: params.amountOff,
    currency: params.currency || 'usd',
    max_redemptions: params.maxRedemptions,
    redeem_by: params.expiresAt,
  });

  return coupon;
}
