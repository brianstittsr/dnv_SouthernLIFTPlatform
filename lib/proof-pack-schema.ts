/**
 * Proof Pack Schema
 * Comprehensive business profile and capability documentation
 */

import { Timestamp } from 'firebase/firestore';

export interface ProofPack {
  id?: string;
  userId: string;
  
  // Submission Metadata
  submissionMetadata: {
    submissionDate: Timestamp;
    lastUpdateDate: Timestamp;
    version: number;
    status: 'draft' | 'submitted' | 'approved' | 'needs_revision';
  };

  // Ownership Information
  ownershipInfo: {
    prefix?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    professionalHeadshot?: {
      imageId?: string;
      imageUrl?: string;
      isTemporary?: boolean;
    };
  };

  // Professional Identity
  professionalIdentity: {
    title: string;
    companyOwnerEthnicity: string[];
    minorityBusinessCertification: string[];
    linkedInPageUrl?: string;
  };

  // Company Basics
  companyBasics: {
    companyName: string;
    streetAddress: string;
    streetAddressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Contact Details
  contactDetails: {
    mobilePhone: string;
    companyPhone: string;
    companyEmail: string;
    websiteUrl?: string;
  };

  // Business Identifiers
  businessIdentifiers: {
    samNumber?: string;
    cageCode?: string;
    dunsNumber?: string;
    primaryNaicsCode?: string;
    primaryNaicsDefinition?: string;
  };

  // Financials & Capacity
  financialsCapacity: {
    approximateAnnualRevenue: string;
    applyingAs: string;
    ableToPerformOutsideState: boolean;
  };

  // Business Development
  businessDevelopment: {
    hasInHouseBDTeam: boolean;
    howCurrentlyGetBusiness: string[];
    referredBy?: string;
    howFoundMBDAFPC?: string;
  };

  // Strategy & Assets
  strategyAssets: {
    capabilityStatementUrl?: string;
    openToTeamingArrangement: boolean;
    hasResourcesToInvest: boolean;
  };

  // Needs & Interests
  needsInterests: {
    helpLookingFor: string[];
    servicesInterestedIn: string[];
    numberOneNeed?: string;
    certificationsLoansInterested: string[];
  };

  // Targeting
  targeting: {
    agenciesTargeting: string[];
  };

  // Administrative
  administrative: {
    mbdaFPCRepAssigned?: string;
    notes?: string;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProofPackFormData {
  // Ownership Information
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  professionalHeadshot?: File | string;
  useTemporaryHeadshot?: boolean;

  // Professional Identity
  title: string;
  companyOwnerEthnicity: string[];
  minorityBusinessCertification: string[];
  linkedInPageUrl?: string;

  // Company Basics
  companyName: string;
  streetAddress: string;
  streetAddressLine2?: string;
  city: string;
  state: string;
  zipCode: string;

  // Contact Details
  mobilePhone: string;
  companyPhone: string;
  companyEmail: string;
  websiteUrl?: string;

  // Business Identifiers
  samNumber?: string;
  cageCode?: string;
  dunsNumber?: string;
  primaryNaicsCode?: string;

  // Financials & Capacity
  approximateAnnualRevenue: string;
  applyingAs: string;
  ableToPerformOutsideState: boolean;

  // Business Development
  hasInHouseBDTeam: boolean;
  howCurrentlyGetBusiness: string[];
  referredBy?: string;
  howFoundMBDAFPC?: string;

  // Strategy & Assets
  capabilityStatement?: File | string;
  openToTeamingArrangement: boolean;
  hasResourcesToInvest: boolean;

  // Needs & Interests
  helpLookingFor: string[];
  servicesInterestedIn: string[];
  numberOneNeed?: string;
  certificationsLoansInterested: string[];

  // Targeting
  agenciesTargeting: string[];
}

// Field Options
export const PREFIX_OPTIONS = [
  'Mr.',
  'Mrs.',
  'Ms.',
  'Dr.',
  'Prof.',
];

export const ETHNICITY_OPTIONS = [
  'African American',
  'Asian American',
  'Hispanic American',
  'Native American',
  'Pacific Islander',
  'Subcontinent Asian American',
  'Other',
];

export const CERTIFICATION_OPTIONS = [
  '8(a) Business Development',
  'HUBZone',
  'Women-Owned Small Business (WOSB)',
  'Economically Disadvantaged WOSB (EDWOSB)',
  'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
  'Veteran-Owned Small Business (VOSB)',
  'Small Disadvantaged Business (SDB)',
  'Minority Business Enterprise (MBE)',
  'Disadvantaged Business Enterprise (DBE)',
  'None',
  'Other',
];

export const REVENUE_RANGES = [
  'Under $100,000',
  '$100,000 - $250,000',
  '$250,000 - $500,000',
  '$500,000 - $1,000,000',
  '$1,000,000 - $5,000,000',
  '$5,000,000 - $10,000,000',
  '$10,000,000 - $25,000,000',
  '$25,000,000 - $50,000,000',
  'Over $50,000,000',
];

export const APPLYING_AS_OPTIONS = [
  'Prime Contractor',
  'Subcontractor',
  'Both Prime and Subcontractor',
];

export const BUSINESS_SOURCES = [
  'Direct Marketing',
  'Referrals',
  'Networking Events',
  'Online Platforms',
  'Government Portals (SAM.gov, etc.)',
  'Trade Shows',
  'Cold Calling',
  'Social Media',
  'Partnerships',
  'Other',
];

export const MBDA_FPC_SOURCES = [
  'Google Search',
  'Social Media',
  'Referral from Business Associate',
  'MBDA Website',
  'Event/Conference',
  'Email Campaign',
  'Other',
];

export const SERVICES_INTERESTED = [
  'Business Planning',
  'Market Research',
  'Proposal Development',
  'Capability Statement Review',
  'Teaming Opportunities',
  'Contract Financing',
  'Certification Assistance',
  'Training & Workshops',
  'One-on-One Consulting',
  'Matchmaking with Buyers',
];

export const HELP_LOOKING_FOR = [
  'Finding Contract Opportunities',
  'Understanding Government Contracting',
  'Building Capability Statement',
  'Teaming Partner Identification',
  'Proposal Writing Support',
  'Certification Guidance',
  'Financial Planning',
  'Marketing Strategy',
  'Compliance Support',
  'Other',
];

export const CERTIFICATIONS_LOANS_OPTIONS = [
  '8(a) Certification',
  'HUBZone Certification',
  'WOSB/EDWOSB Certification',
  'SDVOSB Certification',
  'SBA Loan',
  'Line of Credit',
  'Equipment Financing',
  'Working Capital Loan',
  'None at this time',
];

export const FEDERAL_AGENCIES = [
  'Department of Defense (DOD)',
  'Department of Homeland Security (DHS)',
  'Department of Veterans Affairs (VA)',
  'Department of Energy (DOE)',
  'Department of Health and Human Services (HHS)',
  'Department of Transportation (DOT)',
  'Department of Agriculture (USDA)',
  'Department of Commerce',
  'Department of Education',
  'Department of Interior',
  'Department of Justice (DOJ)',
  'Department of Labor',
  'Department of State',
  'Department of Treasury',
  'Environmental Protection Agency (EPA)',
  'General Services Administration (GSA)',
  'National Aeronautics and Space Administration (NASA)',
  'Small Business Administration (SBA)',
  'Social Security Administration (SSA)',
  'Other',
];

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
];

// NAICS Code interface for lookup
export interface NAICSCode {
  code: string;
  title: string;
  description: string;
}

// Sample NAICS codes (in production, this would be a complete database)
export const COMMON_NAICS_CODES: NAICSCode[] = [
  {
    code: '541330',
    title: 'Engineering Services',
    description: 'This industry comprises establishments primarily engaged in applying physical laws and principles of engineering in the design, development, and utilization of machines, materials, instruments, structures, processes, and systems.',
  },
  {
    code: '541511',
    title: 'Custom Computer Programming Services',
    description: 'This industry comprises establishments primarily engaged in writing, modifying, testing, and supporting software to meet the needs of a particular customer.',
  },
  {
    code: '541512',
    title: 'Computer Systems Design Services',
    description: 'This industry comprises establishments primarily engaged in planning and designing computer systems that integrate computer hardware, software, and communication technologies.',
  },
  {
    code: '541611',
    title: 'Administrative Management and General Management Consulting Services',
    description: 'This industry comprises establishments primarily engaged in providing operating advice and assistance to businesses and other organizations on administrative management issues.',
  },
  {
    code: '541618',
    title: 'Other Management Consulting Services',
    description: 'This industry comprises establishments primarily engaged in providing management consulting services (except administrative and general management consulting; human resources consulting; marketing consulting; or process, physical distribution, and logistics consulting).',
  },
  {
    code: '561110',
    title: 'Office Administrative Services',
    description: 'This industry comprises establishments primarily engaged in providing a range of day-to-day office administrative services, such as financial planning, billing and recordkeeping, personnel, and physical distribution and logistics.',
  },
  {
    code: '561320',
    title: 'Temporary Help Services',
    description: 'This industry comprises establishments primarily engaged in supplying workers to clients\' businesses for limited periods of time to supplement the working force of the client.',
  },
  {
    code: '561621',
    title: 'Security Systems Services (except Locksmiths)',
    description: 'This industry comprises establishments primarily engaged in selling security systems, such as burglar and fire alarms and locking devices, along with installation, repair, or monitoring services.',
  },
  {
    code: '562910',
    title: 'Remediation Services',
    description: 'This industry comprises establishments primarily engaged in one or more of the following: (1) remediation and cleanup of contaminated buildings, mine sites, soil, or ground water; (2) integrated mine reclamation activities.',
  },
  {
    code: '611430',
    title: 'Professional and Management Development Training',
    description: 'This industry comprises establishments primarily engaged in offering an array of short duration courses and seminars for management and professional development.',
  },
];

export const PROOF_PACK_CATEGORIES = [
  { id: 'submission', label: 'Submission Metadata', icon: 'Calendar' },
  { id: 'ownership', label: 'Ownership Information', icon: 'User' },
  { id: 'professional', label: 'Professional Identity', icon: 'Briefcase' },
  { id: 'company', label: 'Company Basics', icon: 'Building2' },
  { id: 'contact', label: 'Contact Details', icon: 'Phone' },
  { id: 'identifiers', label: 'Business Identifiers', icon: 'Hash' },
  { id: 'financials', label: 'Financials & Capacity', icon: 'DollarSign' },
  { id: 'development', label: 'Business Development', icon: 'TrendingUp' },
  { id: 'strategy', label: 'Strategy & Assets', icon: 'Target' },
  { id: 'needs', label: 'Needs & Interests', icon: 'Heart' },
  { id: 'targeting', label: 'Targeting', icon: 'Crosshair' },
  { id: 'administrative', label: 'Administrative', icon: 'FileText' },
] as const;
