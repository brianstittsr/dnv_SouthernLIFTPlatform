/**
 * Header & Footer Navigation Schema
 * Manages site navigation structure and animations
 */

import { Timestamp } from 'firebase/firestore';

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  type: 'link' | 'dropdown' | 'megamenu' | 'button';
  icon?: string;
  description?: string;
  order: number;
  isEnabled: boolean;
  openInNewTab?: boolean;
  children?: NavigationSubItem[];
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'ghost';
  badge?: {
    text: string;
    color: string;
  };
}

export interface NavigationSubItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  description?: string;
  order: number;
  isEnabled: boolean;
  openInNewTab?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

export interface HeaderConfig {
  id?: string;
  name: string;
  isActive: boolean;
  logo: {
    imageUrl?: string;
    text?: string;
    height?: number;
  };
  navigation: NavigationItem[];
  style: {
    backgroundColor: string;
    textColor: string;
    hoverColor: string;
    position: 'fixed' | 'sticky' | 'static';
    transparent: boolean;
    blur: boolean;
    shadow?: boolean;
  };
  animation: {
    type: 'fade' | 'slide' | 'scale' | 'none';
    duration: number; // in ms
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    dropdownAnimation: 'fade' | 'slide-down' | 'scale' | 'flip' | 'none';
    hoverEffect: 'underline' | 'background' | 'scale' | 'glow' | 'none';
  };
  mobileMenu: {
    breakpoint: number; // in px
    animation: 'slide-left' | 'slide-right' | 'slide-down' | 'fade' | 'scale';
    overlayColor: string;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FooterConfig {
  id?: string;
  name: string;
  isActive: boolean;
  columns: FooterColumn[];
  style: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    linkHoverColor: string;
  };
  social: {
    enabled: boolean;
    platforms: SocialPlatform[];
    animation: 'bounce' | 'scale' | 'rotate' | 'pulse' | 'none';
  };
  copyright: {
    text: string;
    year: 'auto' | number;
  };
  newsletter: {
    enabled: boolean;
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FooterColumn {
  id: string;
  title: string;
  order: number;
  isEnabled: boolean;
  links: FooterLink[];
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  order: number;
  isEnabled: boolean;
  openInNewTab?: boolean;
  icon?: string;
}

export interface SocialPlatform {
  id: string;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'github' | 'custom';
  url: string;
  isEnabled: boolean;
  customIcon?: string;
  customLabel?: string;
}

export const ANIMATION_TYPES = [
  { value: 'fade', label: 'Fade', description: 'Smooth opacity transition' },
  { value: 'slide', label: 'Slide', description: 'Slide in from side' },
  { value: 'scale', label: 'Scale', description: 'Grow from center' },
  { value: 'none', label: 'None', description: 'No animation' },
] as const;

export const DROPDOWN_ANIMATIONS = [
  { value: 'fade', label: 'Fade In', description: 'Smooth fade in' },
  { value: 'slide-down', label: 'Slide Down', description: 'Slide from top' },
  { value: 'scale', label: 'Scale Up', description: 'Scale from small' },
  { value: 'flip', label: 'Flip', description: '3D flip effect' },
  { value: 'none', label: 'None', description: 'Instant appearance' },
] as const;

export const HOVER_EFFECTS = [
  { value: 'underline', label: 'Underline', description: 'Animated underline' },
  { value: 'background', label: 'Background', description: 'Background color change' },
  { value: 'scale', label: 'Scale', description: 'Slightly enlarge' },
  { value: 'glow', label: 'Glow', description: 'Glowing effect' },
  { value: 'none', label: 'None', description: 'No hover effect' },
] as const;

export const MOBILE_ANIMATIONS = [
  { value: 'slide-left', label: 'Slide from Left', description: 'Menu slides in from left' },
  { value: 'slide-right', label: 'Slide from Right', description: 'Menu slides in from right' },
  { value: 'slide-down', label: 'Slide Down', description: 'Menu slides down from top' },
  { value: 'fade', label: 'Fade In', description: 'Menu fades in' },
  { value: 'scale', label: 'Scale Up', description: 'Menu scales up' },
] as const;

export const SOCIAL_ANIMATIONS = [
  { value: 'bounce', label: 'Bounce', description: 'Bounces on hover' },
  { value: 'scale', label: 'Scale', description: 'Grows on hover' },
  { value: 'rotate', label: 'Rotate', description: 'Rotates on hover' },
  { value: 'pulse', label: 'Pulse', description: 'Pulses on hover' },
  { value: 'none', label: 'None', description: 'No animation' },
] as const;

export const DEFAULT_HEADER_CONFIG: Omit<HeaderConfig, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
  name: 'Default Header',
  isActive: true,
  logo: {
    text: 'KDM & Associates',
    height: 40,
  },
  navigation: [
    {
      id: '1',
      label: 'Services',
      url: '/services',
      type: 'dropdown',
      order: 1,
      isEnabled: true,
      children: [
        { id: '1-1', label: 'Business Development', url: '/services/business-development', order: 1, isEnabled: true },
        { id: '1-2', label: 'Government Contracting', url: '/services/government-contracting', order: 2, isEnabled: true },
        { id: '1-3', label: 'Consulting', url: '/services/consulting', order: 3, isEnabled: true },
      ],
    },
    {
      id: '2',
      label: 'Company',
      url: '/company',
      type: 'dropdown',
      order: 2,
      isEnabled: true,
      children: [
        { id: '2-1', label: 'About Us', url: '/about', order: 1, isEnabled: true },
        { id: '2-2', label: 'Team', url: '/team', order: 2, isEnabled: true },
        { id: '2-3', label: 'Careers', url: '/jobs', order: 3, isEnabled: true },
      ],
    },
    {
      id: '3',
      label: 'Resources',
      url: '/resources',
      type: 'dropdown',
      order: 3,
      isEnabled: true,
      children: [
        { id: '3-1', label: 'Blog', url: '/blog', order: 1, isEnabled: true },
        { id: '3-2', label: 'Events', url: '/events', order: 2, isEnabled: true },
        { id: '3-3', label: 'Newsletter', url: '/newsletter', order: 3, isEnabled: true },
        { id: '3-4', label: 'What Works', url: '/what-works', order: 4, isEnabled: true },
      ],
    },
    {
      id: '4',
      label: 'Contact',
      url: '/contact',
      type: 'link',
      order: 4,
      isEnabled: true,
    },
    {
      id: '5',
      label: 'Sign In',
      url: '/portal',
      type: 'button',
      order: 5,
      isEnabled: true,
      buttonStyle: 'primary',
    },
  ],
  style: {
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    hoverColor: '#4f46e5',
    position: 'sticky',
    transparent: false,
    blur: false,
  },
  animation: {
    type: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    dropdownAnimation: 'slide-down',
    hoverEffect: 'underline',
  },
  mobileMenu: {
    breakpoint: 768,
    animation: 'slide-right',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
  },
};

export const DEFAULT_FOOTER_CONFIG: Omit<FooterConfig, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
  name: 'Default Footer',
  isActive: true,
  columns: [
    {
      id: '1',
      title: 'Company',
      order: 1,
      isEnabled: true,
      links: [
        { id: '1-1', label: 'About Us', url: '/about', order: 1, isEnabled: true },
        { id: '1-2', label: 'Team', url: '/team', order: 2, isEnabled: true },
        { id: '1-3', label: 'Careers', url: '/jobs', order: 3, isEnabled: true },
        { id: '1-4', label: 'Contact', url: '/contact', order: 4, isEnabled: true },
      ],
    },
    {
      id: '2',
      title: 'Services',
      order: 2,
      isEnabled: true,
      links: [
        { id: '2-1', label: 'Business Development', url: '/services/business-development', order: 1, isEnabled: true },
        { id: '2-2', label: 'Government Contracting', url: '/services/government-contracting', order: 2, isEnabled: true },
        { id: '2-3', label: 'Consulting', url: '/services/consulting', order: 3, isEnabled: true },
      ],
    },
    {
      id: '3',
      title: 'Resources',
      order: 3,
      isEnabled: true,
      links: [
        { id: '3-1', label: 'Blog', url: '/blog', order: 1, isEnabled: true },
        { id: '3-2', label: 'Events', url: '/events', order: 2, isEnabled: true },
        { id: '3-3', label: 'Newsletter', url: '/newsletter', order: 3, isEnabled: true },
        { id: '3-4', label: 'Press Releases', url: '/press-releases', order: 4, isEnabled: true },
      ],
    },
    {
      id: '4',
      title: 'Legal',
      order: 4,
      isEnabled: true,
      links: [
        { id: '4-1', label: 'Privacy Policy', url: '/privacy', order: 1, isEnabled: true },
        { id: '4-2', label: 'Terms of Service', url: '/terms', order: 2, isEnabled: true },
      ],
    },
  ],
  style: {
    backgroundColor: '#111827',
    textColor: '#9ca3af',
    linkColor: '#d1d5db',
    linkHoverColor: '#ffffff',
  },
  social: {
    enabled: true,
    platforms: [
      { id: '1', platform: 'facebook', url: 'https://facebook.com/kdmassociates', isEnabled: true },
      { id: '2', platform: 'twitter', url: 'https://twitter.com/kdmassociates', isEnabled: true },
      { id: '3', platform: 'linkedin', url: 'https://linkedin.com/company/kdmassociates', isEnabled: true },
    ],
    animation: 'scale',
  },
  copyright: {
    text: 'KDM & Associates. All rights reserved.',
    year: 'auto',
  },
  newsletter: {
    enabled: true,
    title: 'Subscribe to our newsletter',
    description: 'Get the latest insights and opportunities delivered to your inbox.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
};
