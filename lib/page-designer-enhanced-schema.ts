/**
 * Enhanced Page Designer Schema
 * Complete schema for the redesigned Page Designer with all features
 */

import { Timestamp } from 'firebase/firestore';

export interface PageButton {
  id: string;
  text: string;
  url: string;
  type: 'navigation' | 'checkout' | 'external' | 'modal';
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  position: {
    section: string;
    order: number;
  };
  isEnabled: boolean;
}

export interface PageElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'form' | 'card' | 'list' | 'divider' | 'spacer';
  content: any;
  styling: {
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: string;
    boxShadow?: string;
  };
  position: {
    section: string;
    order: number;
  };
  isVisible: boolean;
}

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  structuredData?: any;
}

export interface UXPrinciple {
  id: string;
  name: string;
  description: string;
  applied: boolean;
}

export interface EnhancedPageDesign {
  id?: string;
  pageId: string;
  pageName: string;
  pagePath: string;
  
  // Page Purpose & Strategy
  purpose: string; // 'lead-gen', 'sales', 'educate', 'brand', 'recruit', 'engage'
  targetAudience: string[];
  tone: string;
  
  // UX Principles
  uxPrinciples: UXPrinciple[];
  
  // Content
  pastedContent?: string; // Original pasted content
  rewrittenContent?: string; // AI-rewritten content
  sections: PageSection[];
  
  // Elements & Buttons
  elements: PageElement[];
  buttons: PageButton[];
  
  // Images
  images: PageImageAssignment[];
  
  // SEO
  seo: PageSEO;
  
  // Screenshot Analysis
  screenshotAnalysis?: {
    imageData: string;
    analysis: any;
    appliedAt: Timestamp;
  };
  
  // Styling
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    spacing: 'compact' | 'comfortable' | 'spacious';
    borderRadius: 'none' | 'small' | 'medium' | 'large';
  };
  
  // Metadata
  version: number;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface PageSection {
  id: string;
  name: string;
  type: string;
  order: number;
  content: {
    headline?: string;
    subheadline?: string;
    body?: string;
    items?: any[];
  };
  styling: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  isVisible: boolean;
}

export interface PageImageAssignment {
  id: string;
  imageId: string; // From Image Manager
  section: string;
  position: number;
  alt: string;
  caption?: string;
  styling: {
    width?: string;
    height?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    borderRadius?: string;
  };
}

export const UX_PRINCIPLES: UXPrinciple[] = [
  {
    id: 'clarity',
    name: 'Clarity',
    description: 'Clear, concise messaging that users understand immediately',
    applied: false,
  },
  {
    id: 'brevity',
    name: 'Brevity',
    description: 'Short, scannable content that respects user time',
    applied: false,
  },
  {
    id: 'visual-hierarchy',
    name: 'Visual Hierarchy',
    description: 'Clear information architecture with proper heading structure',
    applied: false,
  },
  {
    id: 'action-oriented',
    name: 'Action-Oriented',
    description: 'Strong calls-to-action that drive user behavior',
    applied: false,
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    description: 'Testimonials, reviews, and trust signals',
    applied: false,
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'WCAG compliant with proper contrast and alt text',
    applied: false,
  },
  {
    id: 'mobile-first',
    name: 'Mobile-First',
    description: 'Optimized for mobile devices and touch interactions',
    applied: false,
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Fast loading with optimized images and minimal code',
    applied: false,
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Uniform design patterns and brand elements',
    applied: false,
  },
  {
    id: 'white-space',
    name: 'White Space',
    description: 'Adequate breathing room between elements',
    applied: false,
  },
];

export const PAGE_PURPOSES = [
  {
    id: 'lead-gen',
    label: 'Generate Leads',
    description: 'Capture contact information from potential customers',
    icon: 'UserPlus',
    uxFocus: ['action-oriented', 'clarity', 'social-proof'],
  },
  {
    id: 'sales',
    label: 'Drive Sales',
    description: 'Convert visitors into paying customers',
    icon: 'DollarSign',
    uxFocus: ['action-oriented', 'social-proof', 'clarity'],
  },
  {
    id: 'educate',
    label: 'Educate',
    description: 'Inform and teach visitors about a topic',
    icon: 'GraduationCap',
    uxFocus: ['clarity', 'visual-hierarchy', 'brevity'],
  },
  {
    id: 'brand',
    label: 'Build Brand',
    description: 'Establish trust and brand authority',
    icon: 'Award',
    uxFocus: ['consistency', 'visual-hierarchy', 'social-proof'],
  },
  {
    id: 'recruit',
    label: 'Recruit',
    description: 'Attract and convert job candidates or partners',
    icon: 'Handshake',
    uxFocus: ['social-proof', 'clarity', 'action-oriented'],
  },
  {
    id: 'engage',
    label: 'Engage Users',
    description: 'Increase interaction and time on site',
    icon: 'Activity',
    uxFocus: ['action-oriented', 'mobile-first', 'performance'],
  },
];

export const BUTTON_TYPES = [
  { value: 'navigation', label: 'Navigation', description: 'Link to another page' },
  { value: 'checkout', label: 'Checkout', description: 'Start purchase flow' },
  { value: 'external', label: 'External Link', description: 'Link to external site' },
  { value: 'modal', label: 'Open Modal', description: 'Open popup or modal' },
];

export const BUTTON_STYLES = [
  { value: 'primary', label: 'Primary', description: 'Main call-to-action' },
  { value: 'secondary', label: 'Secondary', description: 'Secondary action' },
  { value: 'outline', label: 'Outline', description: 'Subtle button' },
  { value: 'ghost', label: 'Ghost', description: 'Minimal button' },
];

export const ELEMENT_TYPES = [
  { value: 'text', label: 'Text Block', icon: 'Type' },
  { value: 'image', label: 'Image', icon: 'Image' },
  { value: 'video', label: 'Video', icon: 'Video' },
  { value: 'form', label: 'Form', icon: 'FileText' },
  { value: 'card', label: 'Card', icon: 'Square' },
  { value: 'list', label: 'List', icon: 'List' },
  { value: 'divider', label: 'Divider', icon: 'Minus' },
  { value: 'spacer', label: 'Spacer', icon: 'Space' },
];

export const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', description: 'Formal, trustworthy, authoritative' },
  { id: 'friendly', label: 'Friendly', description: 'Approachable, warm, conversational' },
  { id: 'bold', label: 'Bold', description: 'Confident, direct, impactful' },
  { id: 'inspiring', label: 'Inspiring', description: 'Motivational, uplifting, aspirational' },
  { id: 'technical', label: 'Technical', description: 'Precise, detailed, expert-focused' },
  { id: 'casual', label: 'Casual', description: 'Relaxed, informal, personal' },
];

export const AUDIENCE_OPTIONS = [
  { id: 'sme-owners', label: 'SME Owners', description: 'Small business owners' },
  { id: 'partners', label: 'Partners', description: 'Business partners and collaborators' },
  { id: 'buyers', label: 'Buyers', description: 'Purchasing decision makers' },
  { id: 'investors', label: 'Investors', description: 'Financial stakeholders' },
  { id: 'job-seekers', label: 'Job Seekers', description: 'Potential employees' },
  { id: 'general-public', label: 'General Public', description: 'Broad audience' },
];
