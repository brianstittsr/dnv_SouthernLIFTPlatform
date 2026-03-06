/**
 * Transaction Schema for Firestore
 */

import { Timestamp } from "firebase/firestore";

export interface TransactionDoc {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  userId?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
} as const;
