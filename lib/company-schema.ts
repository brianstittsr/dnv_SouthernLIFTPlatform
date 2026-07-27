import type { Timestamp } from "firebase/firestore";

/**
 * Company Profile Schema
 *
 * A company profile is shared across multiple users.
 * Users reference a company via `companyId` on their user document.
 */

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface CompanyDoc {
  id: string;
  legalCompanyName: string;
  displayName?: string;
  companyDescription?: string;
  companyLogo?: string;
  website?: string;
  industry?: string;
  address: CompanyAddress;
  dunsNumber?: string;
  cageCode?: string;
  uei?: string;
  yearsInBusiness?: number;
  annualRevenueRange?: string;
  employeeCountRange?: string;
  naicsCodes?: string[];
  certifications?: string[];
  capabilities?: string[];
  /** User IDs of all users linked to this company */
  memberUserIds: string[];
  /** The user who first created / owns this company profile */
  ownerUserId: string;
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CompanyMember {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  jobTitle?: string;
  isOwner: boolean;
  joinedAt: Timestamp;
}

export const COMPANY_ROLES = [
  "owner",
  "admin",
  "member",
] as const;

export type CompanyRole = (typeof COMPANY_ROLES)[number];
