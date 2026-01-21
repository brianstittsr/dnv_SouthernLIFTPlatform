/**
 * Press Release Schema
 * Firestore schema for press releases with logo support
 */

import { Timestamp } from 'firebase/firestore';

export interface PressRelease {
  id: string;
  title: string;
  subtitle?: string;
  location: string; // e.g., "WASHINGTON, D.C."
  releaseDate: Timestamp;
  content: string; // Main press release content
  boilerplate?: string; // About the company section
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  logos: {
    id: string;
    url: string;
    name: string;
    position: 'header' | 'footer' | 'inline';
  }[];
  tags: string[];
  category: 'Partnership' | 'Award' | 'Contract Win' | 'Event' | 'Announcement' | 'Other';
  status: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  featured?: boolean;
}

export interface PressReleaseFormData {
  title: string;
  subtitle?: string;
  location: string;
  releaseDate: Date;
  bulletPoints?: string; // Raw bullet points for AI enhancement
  content: string;
  boilerplate?: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  logos: {
    id: string;
    url: string;
    name: string;
    position: 'header' | 'footer' | 'inline';
  }[];
  tags: string[];
  category: PressRelease['category'];
  status: PressRelease['status'];
}

export const PRESS_RELEASE_BEST_PRACTICES = {
  title: [
    'Keep it under 100 characters',
    'Include key information (who, what, when)',
    'Make it newsworthy and attention-grabbing',
    'Avoid jargon and marketing speak',
    'Use active voice'
  ],
  structure: [
    'Start with location and date',
    'Lead paragraph answers: Who, What, When, Where, Why',
    'Second paragraph provides supporting details',
    'Third paragraph includes quotes from key stakeholders',
    'Include company boilerplate at the end',
    'Add contact information for media inquiries'
  ],
  content: [
    'Write in third person',
    'Use AP Style formatting',
    'Keep paragraphs short (2-3 sentences)',
    'Include relevant statistics and data',
    'Add quotes from executives or stakeholders',
    'Focus on newsworthy information, not marketing',
    'Proofread carefully for errors'
  ],
  length: [
    'Ideal length: 400-600 words',
    'Maximum: 800 words',
    'One page is best for distribution'
  ],
  formatting: [
    'Use ### for immediate release or embargo date',
    'Bold the headline',
    'Include dateline (CITY, State)',
    'Use standard fonts (Arial, Times New Roman)',
    'Double-space between paragraphs',
    'End with ### or -30- to indicate end'
  ]
};

export const DEFAULT_BOILERPLATE = `About KDM & Associates

KDM & Associates is a business development, government affairs, and public relations firm focused on helping clients navigate the government procurement process and win government contracts. We help our clients not only win more contracts, but help firms provide more effective and efficient solutions to their clients and customers.

The MBDA Federal Procurement Center (FPC) operations have transitioned to KDM & Associates, LLC, bringing new leadership, fresh initiatives, and stronger partnerships to better support the escalating demand for shovel-ready, small and emerging businesses to address the Nation's supply chain requirements.`;

export const PRESS_RELEASE_CATEGORIES = [
  'Partnership',
  'Award',
  'Contract Win',
  'Event',
  'Announcement',
  'Other'
] as const;
