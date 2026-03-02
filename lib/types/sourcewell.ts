import { Timestamp } from "firebase/firestore";

export type SolicitationStatus = "open" | "pending" | "awarded" | "cancelled";

export type SolicitationCategory = 
  | "construction"
  | "equipment"
  | "services"
  | "technology"
  | "vehicles"
  | "supplies"
  | "consulting"
  | "other";

export interface SourcewellSolicitationDoc {
  id: string;
  solicitationNumber: string;
  title: string;
  description: string;
  category: SolicitationCategory;
  status: SolicitationStatus;
  
  // Dates
  postedDate: Timestamp;
  dueDate?: Timestamp;
  awardedDate?: Timestamp;
  closedDate?: Timestamp;
  
  // Details
  estimatedValue?: string;
  contractTerm?: string;
  
  // Links and documents
  portalUrl?: string;
  documentUrls?: string[];
  
  // Contact information
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Additional details
  requirements?: string[];
  eligibility?: string;
  notes?: string;
  
  // Awarded information
  awardedVendors?: {
    name: string;
    contractNumber?: string;
    awardAmount?: string;
  }[];
  
  // Search and filtering
  keywords?: string[];
  tags?: string[];
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

export interface SolicitationSearchFilters {
  keyword?: string;
  status?: SolicitationStatus[];
  category?: SolicitationCategory[];
  postedAfter?: Date;
  postedBefore?: Date;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface SolicitationSearchResult {
  solicitations: SourcewellSolicitationDoc[];
  total: number;
  page: number;
  pageSize: number;
}
