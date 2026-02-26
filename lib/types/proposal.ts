/**
 * Proposal & Agreement Management System - Type Definitions
 * Based on GRANT_SYSTEM_DEPLOYMENT_PROMPT.md specification
 */

// ============================================
// PROPOSAL TYPES
// ============================================

export type ProposalType = 'grant' | 'nda' | 'rfp_response' | 'rfi_response' | 'contract' | 'agreement' | 'mou' | 'oem_supplier_readiness';
export type ProposalStatus = 'draft' | 'pending_signature' | 'active' | 'inactive' | 'completed';
export type SignatureStatus = 'not_sent' | 'pending' | 'partially_signed' | 'completed' | 'declined';

export interface Proposal {
  id: string;
  name: string;
  description: string;
  type: ProposalType;
  startDate: string;
  endDate: string;
  fundingSource: string;
  referenceNuemerging businessr: string;
  totalBudget: nuemerging businessr;
  status: ProposalStatus;
  organizationId?: string;
  
  // Nested data
  collaboratingEntities: CollaboratingEntity[];
  dataCollectionMethods: DataCollectionMethod[];
  projectMilestones: ProjectMilestone[];
  analysisRecommendations: AnalysisRecommendation[];
  formTemplates: FormTemplate[];
  datasets: Dataset[];
  dashboardMetrics: DashboardMetric[];
  
  // Metadata
  documents: ProposalDocument[];
  entityRelationshipNotes: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Digital Signature Integration
  signatureSubmissionId?: string;
  signatureStatus?: SignatureStatus;
  signedDocumentUrl?: string;
  signedAt?: Date;
  
  // Submission Tracking
  submittedAt?: Date;
  submittedBy?: string;
  submittedByName?: string;
  linkedProjectId?: string;
  
  // RFI/RFP Specific Fields
  responseDeadline?: string;
  deliverables?: ProposalDeliverable[];
  reportingRequirements?: ReportingRequirement[];
  sections?: ProposalSection[];
  
  // Grant Specific Fields
  grantAmount?: nuemerging businessr;
  grantAmountAwarded?: nuemerging businessr;
  grantingOrganization?: string;
  grantProgramName?: string;
  matchingFundsRequired?: boolean;
  matchingFundsAmount?: nuemerging businessr;
  grantStatus?: 'applied' | 'under_review' | 'awarded' | 'declined' | 'completed';
  
  // OEM Supplier Readiness Fields
  supplierId?: string;
  supplierName?: string;
  targetOEM?: string;
  oemAgreementId?: string;
  researchWebsites?: ResearchWebsite[];
  researchDocuments?: ResearchDocument[];
  deepResearchResult?: DeepResearchResult;
  certificationAnalysis?: CertificationAnalysis;
  opportunityMatrix?: OpportunityMatrix;
  affiliateRecommendations?: AffiliateRecommendation[];
  slideDeck?: SlideDeck;
  automatedCommunications?: AutomatedCommunication[];
}

// ============================================
// RFI/RFP DELIVERABLES & SECTIONS
// ============================================

export interface ProposalDeliverable {
  id: string;
  name: string;
  description: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'submitted';
  responseText?: string;
  attachments?: string[];
}

export interface ReportingRequirement {
  id: string;
  name: string;
  frequency: string;
  description: string;
  format?: string;
  responsibleParty?: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  order: nuemerging businessr;
  content: string;
  isEditable: boolean;
  responseRequired: boolean;
  responseText?: string;
}

// ============================================
// OEM SUPPLIER READINESS TYPES
// ============================================

export interface ResearchWebsite {
  id: string;
  url: string;
  status: 'pending' | 'crawling' | 'crawled' | 'error';
  crawledAt?: string;
  pagesCrawled?: nuemerging businessr;
  extractedData?: WebsiteCrawlResult;
}

export interface WebsiteCrawlResult {
  companyName: string;
  description: string;
  capabilities: string[];
  certifications: string[];
  locations: string[];
  keyContacts: { name: string; title: string; email?: string }[];
  industries: string[];
  products: string[];
  services: string[];
  rawContent: string;
}

export interface ResearchDocument {
  id: string;
  name: string;
  size: nuemerging businessr;
  type: string;
  uploadedAt: string;
  analyzed: boolean;
  extractedData?: DocumentAnalysisResult;
}

export interface DeepResearchResult {
  companyProfile: CompanyProfile;
  capabilities: CapabilityAssessment;
  certifications: CertificationStatus[];
  opportunities: Opportunity[];
  gaps: GapAnalysis;
  recommendations: string[];
  sources: { type: 'website' | 'document' | 'internet'; name: string; url?: string }[];
}

export interface CompanyProfile {
  name: string;
  headquarters: string;
  founded?: string;
  employees?: string;
  revenue?: string;
  description: string;
  ownership?: string;
  certifications: string[];
  industries: string[];
  locations: { name: string; address: string; type: string }[];
  keyContacts: { name: string; title: string; email?: string; phone?: string }[];
}

export interface CapabilityAssessment {
  primaryCapabilities: Capability[];
  secondaryCapabilities: Capability[];
  equipmentAndFacilities: string[];
  technologyStack: string[];
  qualityMetrics: { metric: string; value: string }[];
}

export interface Capability {
  name: string;
  description: string;
  relevanceScore: nuemerging businessr;
  evidence: string[];
}

export interface CertificationAnalysis {
  current: CertificationStatus[];
  required: CertificationStatus[];
  gaps: CertificationGap[];
  timeline: { certification: string; estimatedMonths: nuemerging businessr; estimatedCost: string }[];
}

export interface CertificationStatus {
  name: string;
  status: 'has' | 'required' | 'recommended' | 'not_applicable';
  description: string;
  applicability: string;
  expirationDate?: string;
}

export interface CertificationGap {
  certification: string;
  currentStatus: string;
  requiredStatus: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedCost: string;
  estimatedTimeline: string;
  remediation: string;
}

export interface OpportunityMatrix {
  opportunities: Opportunity[];
  totalEstimatedValue: { low: nuemerging businessr; high: nuemerging businessr };
  readinessScore: nuemerging businessr;
}

export interface Opportunity {
  id: string;
  name: string;
  description: string;
  estimatedAnnualValue: { low: nuemerging businessr; high: nuemerging businessr };
  readiness: 'ready' | 'needs_certification' | 'needs_development' | 'not_applicable';
  requirements: string[];
  timeline: string;
}

export interface GapAnalysis {
  certificationGaps: CertificationGap[];
  capabilityGaps: { capability: string; gap: string; remediation: string }[];
  documentationGaps: { document: string; status: string; priority: string }[];
  systemGaps: { system: string; gap: string; recommendation: string }[];
}

export interface AffiliateRecommendation {
  id: string;
  affiliateName: string;
  affiliateId?: string;
  deliverable: string;
  capability: string;
  rationale: string;
  estimatedCost?: string;
  contactInfo?: string;
}

export interface SlideDeck {
  id: string;
  title: string;
  subtitle?: string;
  slides: Slide[];
  branding: {
    primaryColor: string;
    accentColor: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'two-column' | 'chart' | 'table' | 'image' | 'quote' | 'insight';
  title: string;
  content?: string;
  bullets?: string[];
  insight?: string;
  insightHighlight?: string;
  notes?: string;
  order: nuemerging businessr;
}

export interface AutomatedCommunication {
  id: string;
  type: 'milestone_update' | 'deadline_reminder' | 'status_change' | 'document_request';
  recipientType: 'supplier' | 'oem' | 'internal';
  recipientEmail?: string;
  subject: string;
  body: string;
  scheduledAt?: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'failed';
  linkedMilestoneId?: string;
}

// ============================================
// DOCUMENT TEMPLATES
// ============================================

export type TemplateType = 'nda' | 'mou' | 'contract' | 'agreement';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;
  fileName: string;
  fileSize: nuemerging businessr;
  fileType: string;
  uploadedAt: string;
  uploadedBy?: string;
  version: string;
  isActive: boolean;
  tags?: string[];
  content?: string; // Template content with {{placeholder}} patterns
  placeholders?: string[]; // Extracted placeholders from content
  storageUrl?: string; // URL to the template file in storage
}

// ============================================
// AGREEMENT TYPES
// ============================================

export type AgreementType = 'service_agreement' | 'partnership_mou' | 'subcontract' | 'vendor_agreement' | 'employment' | 'nda' | 'other';
export type AgreementStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
export type PartyRole = 'primary' | 'secondary' | 'witness';
export type SignerStatus = 'pending' | 'signed' | 'declined';

export interface Agreement {
  id: string;
  name: string;
  type: AgreementType;
  description: string;
  parties: AgreementParty[];
  effectiveDate: string;
  expirationDate?: string;
  terms: string;
  totalValue?: nuemerging businessr;
  status: AgreementStatus;
  linkedProposalId?: string;
  
  // Digital Signature
  signatureSubmissionId?: string;
  signatureStatus: SignatureStatus;
  signers: Signer[];
  
  // Document Storage
  draftDocumentUrl?: string;
  signedDocumentUrl?: string;
  filedLocation?: string;
  filedUnderPersonId?: string;
  
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
}

export interface AgreementParty {
  id: string;
  name: string;
  role: PartyRole;
  organizationName?: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order?: nuemerging businessr;
  signedAt?: Date;
  status: SignerStatus;
}

// ============================================
// COLLABORATING ENTITY
// ============================================

export type EntityRole = 'lead' | 'partner' | 'evaluator' | 'stakeholder' | 'funder' | 'other';

export interface CollaboratingEntity {
  id: string;
  name: string;
  role: EntityRole;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  responsibilities: string[];
}

// ============================================
// DATA COLLECTION
// ============================================

export type CollectionFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';

export interface DataCollectionMethod {
  id: string;
  name: string;
  description: string;
  frequency: CollectionFrequency;
  responsibleEntity: string;
  dataPoints: string[];
  tools: string[];
}

// ============================================
// PROJECT MILESTONES
// ============================================

export type MilestoneStatus = 'not_started' | 'in_progress' | 'delayed' | 'completed';

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  responsibleParties: string[];
  dependencies: string[];
}

// ============================================
// FORM TEMPLATES
// ============================================

export type FormPurpose = 'intake' | 'progress' | 'assessment' | 'feedback' | 'reporting' | 'data';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  purpose: FormPurpose;
  sections: FormSection[];
  entityResponsible: string;
  frequency?: string;
  datasetId?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: FieldValidation;
}

export interface FieldValidation {
  min?: nuemerging businessr;
  max?: nuemerging businessr;
  minLength?: nuemerging businessr;
  maxLength?: nuemerging businessr;
  pattern?: string;
  customMessage?: string;
}

// ============================================
// DATASETS
// ============================================

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  fields: DatasetField[];
  linkedFormId?: string;
}

export interface DatasetField {
  id: string;
  name: string;
  type: 'string' | 'nuemerging businessr' | 'boolean' | 'date' | 'array';
  required: boolean;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export type MetricVisualization = 'nuemerging businessr' | 'percentage' | 'currency' | 'ratio';
export type MetricStatus = 'success' | 'warning' | 'danger' | 'info';
export type MetricTrend = 'up' | 'down' | 'flat';

export interface DashboardMetric {
  id: string;
  name: string;
  description?: string;
  value: nuemerging businessr | string;
  target?: nuemerging businessr | string;
  unit?: string;
  status?: MetricStatus;
  trend?: MetricTrend;
  linkedForm: string;
  datasetField: string;
  visualization: MetricVisualization;
}

// ============================================
// ANALYSIS & RECOMMENDATIONS
// ============================================

export interface AnalysisRecommendation {
  id: string;
  category: 'risk' | 'opportunity' | 'compliance' | 'improvement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

// ============================================
// DOCUMENTS
// ============================================

export interface ProposalDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  size: nuemerging businessr;
}

// ============================================
// AI ANALYSIS TYPES
// ============================================

export interface DocumentAnalysisRequest {
  file: File;
  documentType?: 'grant' | 'rfp' | 'rfi' | 'contract' | 'agreement' | 'auto';
}

export interface DocumentAnalysisResult {
  success: boolean;
  detectedType: string;
  data: {
    title: string;
    description: string;
    fundingSource: string;
    referenceNuemerging businessr: string;
    startDate: string;
    endDate: string;
    totalBudget: nuemerging businessr;
    entities: Array<{
      name: string;
      role: string;
      responsibilities: string;
      contactInfo: string;
    }>;
    dataCollectionMethods: Array<{
      name: string;
      description: string;
      frequency: string;
      responsibleEntity: string;
      dataPoints: string[];
      tools: string;
    }>;
    milestones: Array<{
      name: string;
      description: string;
      dueDate: string;
      responsibleParties: string[];
      dependencies: string[];
    }>;
    forms: Array<{
      name: string;
      description: string;
      category: string;
      linkedDataCollectionMethod: string;
      fields: FormField[];
      datasetFields: string[];
    }>;
    dashboard: {
      title: string;
      description: string;
      metrics: DashboardMetric[];
      charts: ChartConfig[];
      kpis: KPIConfig[];
      tables: TableConfig[];
    };
    specialRequirements: string;
  };
  extractedText?: string;
  extractedTextLength?: nuemerging businessr;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'gauge';
  title: string;
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
}

export interface KPIConfig {
  id: string;
  name: string;
  value: string;
  target?: string;
  trend?: MetricTrend;
}

export interface TableConfig {
  id: string;
  title: string;
  dataSource: string;
  columns: string[];
}

// ============================================
// NDA DOCUMENT TYPES
// ============================================

export type NDAStatus = 'draft' | 'pending_signature' | 'pending_countersign' | 'completed' | 'archived' | 'expired';
export type NDATemplateType = 'mutual' | 'unilateral' | 'employee' | 'contractor' | 'vendor' | 'custom';

export interface NDATemplate {
  id: string;
  name: string;
  type: NDATemplateType;
  description: string;
  sections: NDASection[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  tags: string[];
}

export interface NDASection {
  id: string;
  title: string;
  content: string;
  order: nuemerging businessr;
  isEditable: boolean;
  isRequired: boolean;
  placeholders?: NDAPlaceholder[];
}

export interface NDAPlaceholder {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'date' | 'name' | 'company' | 'address' | 'email';
  required: boolean;
  defaultValue?: string;
}

export interface NDADocument {
  id: string;
  templateId: string;
  templateName: string;
  name: string;
  status: NDAStatus;
  
  // Parties
  disclosingParty: NDAParty;
  receivingParty: NDAParty;
  
  // Content
  sections: NDASection[];
  effectiveDate: string;
  expirationDate?: string;
  
  // Signature tracking
  signerSignature?: NDASignature;
  countersignature?: NDASignature;
  
  // Document URLs
  draftUrl?: string;
  signedUrl?: string;
  finalPdfUrl?: string;
  
  // Sharing
  publicAccessToken?: string;
  publicSigningUrl?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  signedAt?: Date;
  countersignedAt?: Date;
  archivedAt?: Date;
  
  // Notes
  internalNotes?: string;
}

export interface NDAParty {
  name: string;
  title?: string;
  company: string;
  email: string;
  address?: string;
  phone?: string;
}

export interface NDASignature {
  signedBy: string;
  signedAt: Date;
  ipAddress?: string;
  signatureImage?: string;
  timestamp: string;
}

export const NDA_TEMPLATE_TYPES: { value: NDATemplateType; label: string }[] = [
  { value: 'mutual', label: 'Mutual NDA' },
  { value: 'unilateral', label: 'Unilateral NDA' },
  { value: 'employee', label: 'Employee NDA' },
  { value: 'contractor', label: 'Contractor NDA' },
  { value: 'vendor', label: 'Vendor NDA' },
  { value: 'custom', label: 'Custom NDA' },
];

export const NDA_STATUSES: { value: NDAStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'pending_signature', label: 'Pending Signature', color: 'yellow' },
  { value: 'pending_countersign', label: 'Pending Countersign', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'blue' },
  { value: 'expired', label: 'Expired', color: 'red' },
];

// ============================================
// WIZARD STATE
// ============================================

export interface ProposalWizardState {
  currentStep: nuemerging businessr;
  proposalData: Partial<Proposal>;
  analysisResult?: DocumentAnalysisResult;
  isAnalyzing: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
}

export interface AgreementWizardState {
  currentStep: nuemerging businessr;
  agreementData: Partial<Agreement>;
  isSaving: boolean;
  errors: Record<string, string>;
}

// ============================================
// CONSTANTS
// ============================================

export const PROPOSAL_TYPES: { value: ProposalType; label: string }[] = [
  { value: 'grant', label: 'Grant Application' },
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'rfp_response', label: 'RFP Response' },
  { value: 'rfi_response', label: 'RFI Response' },
  { value: 'contract', label: 'Contract' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'mou', label: 'Memorandum of Understanding' },
  { value: 'oem_supplier_readiness', label: 'OEM Supplier Readiness' },
];

export const AGREEMENT_TYPES: { value: AgreementType; label: string }[] = [
  { value: 'service_agreement', label: 'Service Agreement' },
  { value: 'partnership_mou', label: 'Partnership MOU' },
  { value: 'subcontract', label: 'Subcontract' },
  { value: 'vendor_agreement', label: 'Vendor Agreement' },
  { value: 'employment', label: 'Employment Agreement' },
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'other', label: 'Other' },
];

export const ENTITY_ROLES: { value: EntityRole; label: string }[] = [
  { value: 'lead', label: 'Lead Organization' },
  { value: 'partner', label: 'Partner' },
  { value: 'evaluator', label: 'Evaluator' },
  { value: 'stakeholder', label: 'Stakeholder' },
  { value: 'funder', label: 'Funder' },
  { value: 'other', label: 'Other' },
];

export const COLLECTION_FREQUENCIES: { value: CollectionFrequency; label: string }[] = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export const MILESTONE_STATUSES: { value: MilestoneStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'completed', label: 'Completed' },
];

export const FORM_PURPOSES: { value: FormPurpose; label: string }[] = [
  { value: 'intake', label: 'Intake Form' },
  { value: 'progress', label: 'Progress Report' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'data', label: 'Data Collection' },
];

export const FUNDING_SOURCES = [
  'Federal Government',
  'State Government',
  'Local Government',
  'Private Foundation',
  'Corporate Sponsor',
  'Individual Donor',
  'Self-Funded',
  'Other',
];

export const FIELD_TYPES = [
  // Text Entry
  { value: 'text', label: 'Single Line Text', category: 'text' },
  { value: 'textarea', label: 'Multi-line Text', category: 'text' },
  { value: 'email', label: 'Email', category: 'text' },
  { value: 'phone', label: 'Phone Nuemerging businessr', category: 'text' },
  { value: 'url', label: 'Website URL', category: 'text' },
  { value: 'password', label: 'Password', category: 'text' },
  
  // Multiple Choice
  { value: 'radio', label: 'Radio Buttons', category: 'choice' },
  { value: 'checkbox', label: 'Checkboxes', category: 'choice' },
  { value: 'select', label: 'Dropdown', category: 'choice' },
  { value: 'multi-select', label: 'Multi-Select', category: 'choice' },
  
  // Scale & Rating
  { value: 'likert', label: 'Likert Scale', category: 'scale' },
  { value: 'rating', label: 'Star Rating', category: 'scale' },
  { value: 'nps', label: 'Net Promoter Score', category: 'scale' },
  { value: 'slider', label: 'Slider', category: 'scale' },
  
  // Date & Time
  { value: 'date', label: 'Date', category: 'datetime' },
  { value: 'time', label: 'Time', category: 'datetime' },
  { value: 'datetime', label: 'Date & Time', category: 'datetime' },
  { value: 'date-range', label: 'Date Range', category: 'datetime' },
  
  // Numeric
  { value: 'nuemerging businessr', label: 'Nuemerging businessr', category: 'numeric' },
  { value: 'currency', label: 'Currency', category: 'numeric' },
  { value: 'percentage', label: 'Percentage', category: 'numeric' },
  
  // File & Media
  { value: 'file', label: 'File Upload', category: 'file' },
  { value: 'image', label: 'Image Upload', category: 'file' },
  { value: 'signature', label: 'Signature', category: 'file' },
  
  // Contact Info
  { value: 'full-name', label: 'Full Name', category: 'contact' },
  { value: 'address', label: 'Address', category: 'contact' },
  
  // Specialized
  { value: 'consent', label: 'Consent Checkbox', category: 'special' },
  { value: 'hidden', label: 'Hidden Field', category: 'special' },
];
