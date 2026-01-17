/**
 * Event Management System Types
 * Based on IAEOZ Summit Website Analysis
 * 
 * Comprehensive types for multi-day conferences with speakers,
 * sessions, sponsorship packages, ticket sales, and attendee management.
 */

import { Timestamp } from "firebase/firestore";

// ============================================================================
// Core Event Types
// ============================================================================

export type EventFormat = "in-person" | "virtual" | "hybrid";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface EventVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  mapUrl?: string;
  siteMapUrl?: string;
}

export interface EventOrganizer {
  name: string;
  logo?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface EventHotelInfo {
  name: string;
  bookingUrl: string;
  groupRate?: number;
  groupRateDeadline?: Timestamp;
  description?: string;
}

/** Enhanced Event document for comprehensive event management */
export interface EnhancedEventDoc {
  id: string;
  
  // Basic Info
  name: string;
  slug: string;
  tagline: string;
  description: string;
  shortDescription: string;
  
  // Dates
  startDate: Timestamp;
  endDate: Timestamp;
  timezone: string;
  
  // Location
  venue: EventVenue;
  format: EventFormat;
  virtualEventUrl?: string;
  livestreamUrl?: string;
  
  // Organizer
  organizer: EventOrganizer;
  
  // Media
  featuredImage: string;
  bannerImage?: string;
  gallery: string[];
  videoUrl?: string;
  
  // Hotel/Accommodation
  hotelInfo?: EventHotelInfo;
  
  // SEO & Social
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string;
  tags: string[];
  
  // Status
  status: EventStatus;
  featured: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================================================
// Speaker Types
// ============================================================================

export type SpeakerRole = "keynote" | "speaker" | "moderator" | "panelist" | "host" | "producer";
export type PresentationType = "live" | "pre-recorded" | "virtual";

export interface EventSpeakerDoc {
  id: string;
  eventId: string;
  
  // Personal Info
  name: string;
  title: string;
  organization: string;
  photo: string;
  bio: string;
  shortBio?: string;
  
  // Role
  role: SpeakerRole;
  featured: boolean;
  
  // Contact & Social
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  
  // Presentation
  presentationType?: PresentationType;
  
  // Display
  order: number;
  isVisible: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Schedule Types
// ============================================================================

export type SessionType = 
  | "keynote" 
  | "panel" 
  | "presentation" 
  | "workshop" 
  | "networking" 
  | "meal" 
  | "break" 
  | "registration" 
  | "entertainment" 
  | "closing";

export interface SessionSponsor {
  name: string;
  logo?: string;
}

export interface EventSessionDoc {
  id: string;
  dayId: string;
  eventId: string;
  
  // Timing
  startTime: string;
  endTime: string;
  duration: number;
  
  // Content
  title: string;
  description?: string;
  type: SessionType;
  
  // Location
  room?: string;
  location?: string;
  
  // People
  speakerIds: string[];
  moderatorIds?: string[];
  
  // Sponsorship
  sponsor?: SessionSponsor;
  
  // Virtual
  virtualLink?: string;
  recordingUrl?: string;
  
  // Display
  order: number;
  isVisible: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventDayDoc {
  id: string;
  eventId: string;
  
  date: Timestamp;
  dayNumber: number;
  dayName: string;
  theme?: string;
  
  // Sessions stored as subcollection or embedded
  sessions?: EventSessionDoc[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Ticket Types
// ============================================================================

export type TicketType = "general" | "vip" | "virtual" | "early-bird" | "group" | "student" | "speaker" | "sponsor";
export type AccessLevel = "all-access" | "main-sessions" | "virtual-only" | "networking-only";

export interface EventTicketTypeDoc {
  id: string;
  eventId: string;
  
  // Basic Info
  name: string;
  description: string;
  type: TicketType;
  
  // Pricing
  price: number;
  currency: string;
  originalPrice?: number;
  
  // Availability
  quantity?: number;
  sold: number;
  available: number;
  
  // Dates
  salesStart?: Timestamp;
  salesEnd?: Timestamp;
  
  // Access
  benefits: string[];
  accessLevel: AccessLevel;
  
  // Purchase
  purchaseUrl?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  
  // Display
  order: number;
  featured: boolean;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Sponsorship Types
// ============================================================================

export type SponsorshipTier = "titanium" | "platinum" | "gold" | "silver" | "bronze" | "custom";
export type BenefitCategory = "visibility" | "access" | "speaking" | "networking" | "media" | "data";

export interface SponsorBenefit {
  id: string;
  title: string;
  description: string;
  category: BenefitCategory;
}

export interface SponsorshipPackageDoc {
  id: string;
  eventId: string;
  
  // Basic Info
  name: string;
  tier: SponsorshipTier;
  tagline: string;
  description: string;
  
  // Pricing
  price: number;
  currency: string;
  
  // Benefits
  benefits: SponsorBenefit[];
  
  // Inventory
  quantity?: number;
  sold: number;
  
  // Purchase
  purchaseUrl?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  
  // Display
  order: number;
  featured: boolean;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type SponsorPaymentStatus = "pending" | "partial" | "paid" | "refunded";

export interface EventSponsorDoc {
  id: string;
  eventId: string;
  
  // Company Info
  companyName: string;
  logo: string;
  website?: string;
  description?: string;
  
  // Sponsorship
  packageId: string;
  tier: string;
  customBenefits?: string[];
  
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Payment
  amountPaid: number;
  paymentStatus: SponsorPaymentStatus;
  paymentDate?: Timestamp;
  invoiceId?: string;
  
  // Display
  featured: boolean;
  order: number;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Registration Types
// ============================================================================

export type RegistrationPaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type RegistrationStatus = "confirmed" | "cancelled" | "waitlist" | "no-show";

export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
}

export interface EventRegistrationDoc {
  id: string;
  eventId: string;
  ticketId: string;
  
  // Attendee Info
  attendee: AttendeeInfo;
  
  // Ticket Details
  ticketType: string;
  ticketPrice: number;
  quantity: number;
  totalAmount: number;
  
  // Promo/Discount
  promoCode?: string;
  discountAmount?: number;
  
  // Payment
  paymentStatus: RegistrationPaymentStatus;
  paymentMethod?: string;
  paymentId?: string;
  paymentDate?: Timestamp;
  
  // Check-in
  checkedIn: boolean;
  checkInTime?: Timestamp;
  badgePrinted: boolean;
  
  // Communication
  confirmationSent: boolean;
  remindersSent: number;
  
  // Additional
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  notes?: string;
  
  // Status
  status: RegistrationStatus;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Event News Types
// ============================================================================

export type NewsStatus = "draft" | "published";

export interface NewsAuthor {
  name: string;
  avatar?: string;
}

export interface EventNewsDoc {
  id: string;
  eventId: string;
  
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  
  author: NewsAuthor;
  
  category?: string;
  tags: string[];
  
  externalUrl?: string;
  
  status: NewsStatus;
  publishedAt?: Timestamp;
  featured: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Form Data Types (for Admin UI)
// ============================================================================

export interface EventFormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  timezone: string;
  format: EventFormat;
  virtualEventUrl: string;
  livestreamUrl: string;
  // Venue
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueCountry: string;
  venueMapUrl: string;
  // Organizer
  organizerName: string;
  organizerLogo: string;
  organizerWebsite: string;
  organizerEmail: string;
  organizerPhone: string;
  // Media
  featuredImage: string;
  bannerImage: string;
  videoUrl: string;
  // Hotel
  hotelName: string;
  hotelBookingUrl: string;
  hotelGroupRate: string;
  hotelGroupRateDeadline: string;
  hotelDescription: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  socialImage: string;
  tags: string;
  // Status
  status: EventStatus;
  featured: boolean;
}

export interface SpeakerFormData {
  name: string;
  title: string;
  organization: string;
  photo: string;
  bio: string;
  shortBio: string;
  role: SpeakerRole;
  featured: boolean;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  twitter: string;
  presentationType: PresentationType;
  order: number;
  isVisible: boolean;
}

export interface SessionFormData {
  title: string;
  description: string;
  type: SessionType;
  startTime: string;
  endTime: string;
  room: string;
  location: string;
  speakerIds: string[];
  moderatorIds: string[];
  sponsorName: string;
  sponsorLogo: string;
  virtualLink: string;
  order: number;
  isVisible: boolean;
}

export interface TicketFormData {
  name: string;
  description: string;
  type: TicketType;
  price: string;
  currency: string;
  originalPrice: string;
  quantity: string;
  salesStart: string;
  salesEnd: string;
  benefits: string;
  accessLevel: AccessLevel;
  purchaseUrl: string;
  order: number;
  featured: boolean;
  isVisible: boolean;
}

export interface SponsorshipFormData {
  name: string;
  tier: SponsorshipTier;
  tagline: string;
  description: string;
  price: string;
  currency: string;
  benefits: SponsorBenefit[];
  quantity: string;
  purchaseUrl: string;
  order: number;
  featured: boolean;
  isVisible: boolean;
}

// ============================================================================
// Collection Names
// ============================================================================

export const EVENT_COLLECTIONS = {
  EVENTS: "events",
  EVENT_SPEAKERS: "eventSpeakers",
  EVENT_DAYS: "eventDays",
  EVENT_SESSIONS: "eventSessions",
  EVENT_TICKET_TYPES: "eventTicketTypes",
  EVENT_SPONSORSHIP_PACKAGES: "eventSponsorshipPackages",
  EVENT_SPONSORS: "eventSponsors",
  EVENT_REGISTRATIONS: "eventRegistrations",
  EVENT_NEWS: "eventNews",
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_EVENT_FORM: EventFormData = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  shortDescription: "",
  startDate: "",
  endDate: "",
  timezone: "America/New_York",
  format: "hybrid",
  virtualEventUrl: "",
  livestreamUrl: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  venueState: "",
  venueCountry: "USA",
  venueMapUrl: "",
  organizerName: "KDM & Associates, LLC",
  organizerLogo: "",
  organizerWebsite: "https://kdm-assoc.com",
  organizerEmail: "info@kdm-assoc.com",
  organizerPhone: "202-469-3423",
  featuredImage: "",
  bannerImage: "",
  videoUrl: "",
  hotelName: "",
  hotelBookingUrl: "",
  hotelGroupRate: "",
  hotelGroupRateDeadline: "",
  hotelDescription: "",
  metaTitle: "",
  metaDescription: "",
  socialImage: "",
  tags: "",
  status: "draft",
  featured: false,
};

export const DEFAULT_SPEAKER_FORM: SpeakerFormData = {
  name: "",
  title: "",
  organization: "",
  photo: "",
  bio: "",
  shortBio: "",
  role: "speaker",
  featured: false,
  email: "",
  phone: "",
  website: "",
  linkedin: "",
  twitter: "",
  presentationType: "live",
  order: 0,
  isVisible: true,
};

export const DEFAULT_SESSION_FORM: SessionFormData = {
  title: "",
  description: "",
  type: "presentation",
  startTime: "09:00",
  endTime: "10:00",
  room: "",
  location: "",
  speakerIds: [],
  moderatorIds: [],
  sponsorName: "",
  sponsorLogo: "",
  virtualLink: "",
  order: 0,
  isVisible: true,
};

export const DEFAULT_TICKET_FORM: TicketFormData = {
  name: "",
  description: "",
  type: "general",
  price: "",
  currency: "USD",
  originalPrice: "",
  quantity: "",
  salesStart: "",
  salesEnd: "",
  benefits: "",
  accessLevel: "all-access",
  purchaseUrl: "",
  order: 0,
  featured: false,
  isVisible: true,
};

// ============================================================================
// Helper Functions
// ============================================================================

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  keynote: "Keynote",
  panel: "Panel Discussion",
  presentation: "Presentation",
  workshop: "Workshop",
  networking: "Networking",
  meal: "Meal/Refreshments",
  break: "Break",
  registration: "Registration",
  entertainment: "Entertainment",
  closing: "Closing",
};

export const SPEAKER_ROLE_LABELS: Record<SpeakerRole, string> = {
  keynote: "Keynote Speaker",
  speaker: "Speaker",
  moderator: "Moderator",
  panelist: "Panelist",
  host: "Host",
  producer: "Event Producer",
};

export const SPONSORSHIP_TIER_LABELS: Record<SponsorshipTier, string> = {
  titanium: "Titanium",
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  custom: "Custom",
};

export const SPONSORSHIP_TIER_COLORS: Record<SponsorshipTier, string> = {
  titanium: "bg-gradient-to-r from-slate-400 to-slate-600 text-white",
  platinum: "bg-gradient-to-r from-gray-300 to-gray-500 text-white",
  gold: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
  silver: "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800",
  bronze: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
  custom: "bg-gradient-to-r from-purple-400 to-purple-600 text-white",
};
