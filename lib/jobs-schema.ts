/**
 * Jobs Schema
 * Firestore schema for job postings and applications with resume storage
 */

import { Timestamp } from 'firebase/firestore';

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  locationType: 'Remote' | 'Hybrid' | 'On-site';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  applicationDeadline?: Timestamp;
  status: 'draft' | 'published' | 'closed' | 'filled';
  postedDate: Timestamp;
  slug: string;
  tags: string[];
  contactEmail: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  applicationCount?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  resume: {
    type: 'upload' | 'paste';
    fileName?: string;
    fileSize?: number;
    base64Data?: string; // Compressed resume as base64
    textContent?: string; // Pasted resume text
  };
  coverLetter?: string;
  answers?: {
    question: string;
    answer: string;
  }[];
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  notes?: string;
}

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  locationType: JobPosting['locationType'];
  employmentType: JobPosting['employmentType'];
  experienceLevel: JobPosting['experienceLevel'];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  applicationDeadline?: Date;
  status: JobPosting['status'];
  tags: string[];
  contactEmail: string;
}

export interface ApplicationFormData {
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeType: 'upload' | 'paste';
  resumeFile?: File;
  resumeText?: string;
  coverLetter?: string;
  answers?: {
    question: string;
    answer: string;
  }[];
}

export const JOB_CREATION_BEST_PRACTICES = {
  title: [
    'Be specific and clear about the role',
    'Include seniority level if applicable',
    'Avoid internal jargon or acronyms',
    'Keep it concise (under 80 characters)',
    'Use standard job titles for better searchability'
  ],
  description: [
    'Start with a compelling overview of the role',
    'Explain how the role contributes to the organization',
    'Highlight what makes this opportunity unique',
    'Keep paragraphs short and scannable',
    'Use bullet points for easy reading'
  ],
  responsibilities: [
    'List 5-8 key responsibilities',
    'Start each with an action verb',
    'Be specific about day-to-day tasks',
    'Prioritize most important duties first',
    'Avoid vague statements'
  ],
  qualifications: [
    'Separate required from preferred qualifications',
    'Be realistic about requirements',
    'Include both technical and soft skills',
    'Specify years of experience needed',
    'Mention required certifications or education'
  ],
  benefits: [
    'Highlight unique perks and benefits',
    'Include professional development opportunities',
    'Mention work-life balance initiatives',
    'Be transparent about compensation structure',
    'Showcase company culture'
  ],
  general: [
    'Use inclusive language',
    'Avoid discriminatory requirements',
    'Proofread for errors',
    'Keep the tone professional yet welcoming',
    'Update regularly to keep fresh'
  ]
};

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
export const LOCATION_TYPES = ['Remote', 'Hybrid', 'On-site'] as const;
export const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'] as const;
export const APPLICATION_STATUS = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'] as const;

export const COMMON_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'Human Resources',
  'Legal',
  'Business Development',
  'Consulting',
  'Other'
];

export const COMMON_BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  '401(k) Matching',
  'Paid Time Off',
  'Remote Work Options',
  'Flexible Schedule',
  'Professional Development',
  'Tuition Reimbursement',
  'Life Insurance',
  'Disability Insurance',
  'Commuter Benefits',
  'Gym Membership',
  'Employee Assistance Program'
];
