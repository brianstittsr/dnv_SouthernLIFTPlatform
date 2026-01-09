/**
 * KDM Consortium Branding Configuration
 * 
 * This file centralizes all KDM-specific branding elements.
 * Update these values to customize the platform appearance.
 */

export const KDM_BRANDING = {
  // Company Information
  company: {
    name: 'KDM Consortium',
    legalName: 'KDM Associates, LLC',
    tagline: 'Empowering Small Businesses to Win Government Contracts',
    description: 'A membership-based consortium helping small businesses compete for and win government contracts through collaborative teaming and expert support.',
  },

  // Contact Information
  contact: {
    email: 'info@kdmassociates.com',
    supportEmail: 'support@kdmassociates.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Business Center Drive',
      suite: 'Suite 400',
      city: 'Washington',
      state: 'DC',
      zip: '20001',
    },
  },

  // Social Media Links
  social: {
    linkedin: 'https://linkedin.com/company/kdm-associates',
    twitter: 'https://twitter.com/kdmassociates',
    youtube: 'https://youtube.com/@kdmassociates',
  },

  // Brand Colors (Tailwind CSS classes)
  colors: {
    primary: {
      light: 'blue-500',
      DEFAULT: 'blue-600',
      dark: 'blue-700',
    },
    secondary: {
      light: 'slate-400',
      DEFAULT: 'slate-600',
      dark: 'slate-800',
    },
    accent: {
      light: 'amber-400',
      DEFAULT: 'amber-500',
      dark: 'amber-600',
    },
  },

  // CSS Variables for theming
  cssVariables: {
    '--kdm-primary': '#2563eb', // blue-600
    '--kdm-primary-light': '#3b82f6', // blue-500
    '--kdm-primary-dark': '#1d4ed8', // blue-700
    '--kdm-secondary': '#475569', // slate-600
    '--kdm-accent': '#f59e0b', // amber-500
  },

  // Logo paths
  logos: {
    primary: '/images/kdm-logo.svg',
    white: '/images/kdm-logo-white.svg',
    icon: '/images/kdm-icon.svg',
    favicon: '/favicon.ico',
  },

  // SEO Metadata
  seo: {
    title: 'KDM Consortium | Government Contracting for Small Business',
    description: 'Join the KDM Consortium to access government contracting opportunities, expert proposal support, and collaborative teaming with other small businesses.',
    keywords: [
      'government contracting',
      'small business',
      'federal contracts',
      'proposal support',
      'teaming agreements',
      'SBA',
      '8(a)',
      'HUBZone',
      'SDVOSB',
      'WOSB',
    ],
    ogImage: '/images/kdm-og-image.png',
  },

  // Membership Tiers
  membership: {
    tiers: {
      'core-capture': {
        name: 'Core Capture',
        shortName: 'Core',
        badge: 'Member',
        color: 'blue',
      },
      'pursuit-pack': {
        name: 'Pursuit Pack',
        shortName: 'Pursuit',
        badge: 'Add-on',
        color: 'purple',
      },
      'custom': {
        name: 'Enterprise',
        shortName: 'Enterprise',
        badge: 'Custom',
        color: 'amber',
      },
    },
  },

  // Navigation Labels
  navigation: {
    portal: {
      dashboard: 'Dashboard',
      pursuits: 'Pursuit Board',
      members: 'Member Directory',
      resources: 'Resource Library',
      events: 'Events',
      membership: 'My Membership',
    },
    admin: {
      dashboard: 'KDM Dashboard',
      memberships: 'Memberships',
      settlements: 'Settlements',
      events: 'Events',
    },
  },

  // Email Templates
  email: {
    fromName: 'KDM Consortium',
    fromEmail: 'noreply@kdmassociates.com',
    replyTo: 'support@kdmassociates.com',
    templates: {
      welcome: 'Welcome to KDM Consortium',
      membershipConfirmation: 'Your KDM Membership is Active',
      eventRegistration: 'Event Registration Confirmed',
      pursuitNotification: 'New Pursuit Opportunity',
    },
  },

  // Footer Content
  footer: {
    copyright: `© ${new Date().getFullYear()} KDM Associates, LLC. All rights reserved.`,
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
} as const;

// Type exports for TypeScript
export type KDMBranding = typeof KDM_BRANDING;
export type MembershipTier = keyof typeof KDM_BRANDING.membership.tiers;
