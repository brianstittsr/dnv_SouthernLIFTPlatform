import { Timestamp } from "firebase-admin/firestore";

export interface TestimonialDoc {
  id?: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  companyName: string;
  companyIndustry: string;
  companyLogoUrl?: string;
  rating?: number; // 1-5 stars
  featured?: boolean;
  isActive: boolean;
  displayOrder?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
}

export const TESTIMONIALS_COLLECTION = "testimonials";
