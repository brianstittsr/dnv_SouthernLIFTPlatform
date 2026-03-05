import { Timestamp } from "firebase/firestore";

export type WebinarStatus = "draft" | "published" | "scheduled" | "archived";

export interface WebinarBenefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface WebinarSpeaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
}

export interface WebinarAgendaItem {
  id: string;
  time: string;
  title: string;
  description?: string;
}

export interface WebinarFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Webinar {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: WebinarStatus;
  
  // Schedule
  startTime: string; // ISO string or format like "2024-03-20T14:00:00Z"
  duration: number; // in minutes
  timezone: string;
  
  // Landing Page Content
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImage?: string;
    videoPreviewUrl?: string;
  };
  
  about: {
    title: string;
    content: string;
    image?: string;
  };
  
  benefits: WebinarBenefit[];
  speakers: WebinarSpeaker[];
  agenda: WebinarAgendaItem[];
  faqs: WebinarFAQ[];
  
  // Registration & Integration
  registration: {
    type: "external" | "internal";
    externalUrl?: string;
    buttonText: string;
  };
  
  ghlIntegration?: {
    enabled: boolean;
    apiKey?: string;
    locationId?: string;
    formId?: string;
    tags?: string[];
  };
  
  // Confirmation Page
  confirmation: {
    title: string;
    message: string;
    videoUrl?: string;
    nextStepsTitle?: string;
    nextSteps: string[];
    calendarLinks?: {
      google?: string;
      outlook?: string;
      ical?: string;
    };
  };
  
  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  
  // Metadata
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  publishedAt?: string; // ISO string
}

export type WebinarDoc = Omit<Webinar, "createdAt" | "updatedAt" | "publishedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
};

export const getDefaultWebinar = (): Partial<Webinar> => ({
  status: "draft",
  timezone: "America/New_York",
  hero: {
    headline: "",
    subheadline: "",
    ctaText: "Register Now",
  },
  about: {
    title: "About This Webinar",
    content: "",
  },
  benefits: [],
  speakers: [],
  agenda: [],
  faqs: [],
  registration: {
    type: "internal",
    buttonText: "Register Now",
  },
  confirmation: {
    title: "Registration Confirmed!",
    message: "Thank you for registering. You will receive an email with the joining details shortly.",
    nextSteps: ["Check your inbox for confirmation", "Add the event to your calendar"],
  },
  seo: {
    title: "",
    description: "",
    keywords: [],
  },
});
