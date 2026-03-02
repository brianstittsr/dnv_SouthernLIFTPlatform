/**
 * Stripe Payment Integration
 * 
 * Handles Stripe payment processing for event tickets and sponsorships
 * Requires STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variables
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key (server-side only)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
}) : null;

// Types
export interface CreateCheckoutSessionParams {
  eventId: string;
  eventName: string;
  items: {
    name: string;
    description?: string;
    price: number; // in cents
    quantity: number;
    metadata?: Record<string, string>;
  }[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

// Helper functions
export function formatAmountForStripe(amount: number, currency: string = 'usd'): number {
  // Stripe expects amounts in smallest currency unit (cents for USD)
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number, currency: string = 'usd'): number {
  const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }
  return amount / 100;
}

// Stripe API functions
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    console.error('Stripe not initialized');
    return null;
  }

  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          metadata: item.metadata,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      metadata: {
        eventId: params.eventId,
        eventName: params.eventName,
        ...params.metadata,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    console.error('Stripe not initialized');
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'usd',
      description: params.description,
      metadata: params.metadata,
      receipt_email: params.customerEmail,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) return null;

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return null;
  }
}

export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;

  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
}

export async function createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer | null> {
  if (!stripe) return null;

  try {
    return await stripe.customers.create({
      email,
      name,
      metadata,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return null;
  }
}

export async function createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund | null> {
  if (!stripe) return null;

  try {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

export async function listPayments(limit: number = 100, startingAfter?: string): Promise<Stripe.PaymentIntent[]> {
  if (!stripe) return [];

  try {
    const params: Stripe.PaymentIntentListParams = { limit };
    if (startingAfter) params.starting_after = startingAfter;
    
    const result = await stripe.paymentIntents.list(params);
    return result.data;
  } catch (error) {
    console.error('Error listing payments:', error);
    return [];
  }
}

// Webhook signature verification
export function constructWebhookEvent(payload: string | Buffer, signature: string, webhookSecret: string): Stripe.Event | null {
  if (!stripe) return null;

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return null;
  }
}
