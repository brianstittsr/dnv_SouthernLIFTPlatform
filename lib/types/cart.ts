/**
 * Cart and Product Type Definitions
 */

export type ProductType = 'consortium' | 'cmmc-cohort';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  billingPeriod?: 'monthly' | 'annual' | 'one-time';
  features: string[];
  stripePriceId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export const PRODUCTS: Record<ProductType, Product> = {
  'consortium': {
    id: 'kdm-consortium-membership',
    type: 'consortium',
    name: 'KDM Consortium Membership',
    description: 'Join our exclusive network of government contractors and suppliers',
    price: 650,
    billingPeriod: 'monthly',
    features: [
      'Curated federal opportunity alerts',
      'Team assembly & partner matching',
      'Proposal development support',
      'Monthly buyer briefings',
      'Resource library access',
      'Member directory listing',
      'Compliance badge verification',
      '2 hours concierge support/month',
      'Priority pursuit notifications',
      'Private workspace access',
      'Networking events access',
      'CMMC readiness assessment'
    ]
  },
  'cmmc-cohort': {
    id: 'cmmc-cohort-training',
    type: 'cmmc-cohort',
    name: 'CMMC Cohort Training',
    description: 'Intensive 12-week program to achieve CMMC certification readiness',
    price: 7500,
    billingPeriod: 'one-time',
    features: [
      '12-week guided certification program',
      'Expert-led training sessions',
      'CMMC 2.0 Level 2 preparation',
      'Documentation templates & tools',
      'Mock assessments & gap analysis',
      '1-on-1 mentor sessions (4 hours)',
      'Access to certified RPOs',
      'Ongoing alumni support group',
      'Certification exam preparation',
      'Compliance roadmap development',
      'Policy & procedure creation',
      'C3PAO referral network'
    ]
  }
};
