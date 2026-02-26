# Proposal & Agreement Management System - AI Deployment Prompt

## Purpose
This prompt enables an AI assistant to deploy a **Document Analyzer, Proposal Creator, and Agreement Creator system** into a new web application. The AI will first analyze the target system's existing architecture, then integrate the proposal/agreement management components in a way that leverages existing dropdowns, data models, and UI patterns.

The system also generates **professional proposal/agreement submission documents** in both Markdown and branded PDF formats based on deliverables, with **DocuSeal integration** for digital signatures and automated document filing.

---

## SYSTEM OVERVIEW

You are deploying a comprehensive **Proposal & Agreement Management System** with three core modules:

### 1. Document Analyzer (AI-Powered Document Analysis)
- Uploads documents (PDF, Word, text) - grants, RFPs, RFIs, contracts
- Uses OpenAI GPT-4o to extract and structure information
- Auto-populates wizard steps with extracted data
- Generates forms, dashboards, and project plans

### 2. Proposal Creator Wizard (8-Step Process)
- Step 1: Basic Info & Document Upload
- Step 2: Entity Details (Collaborating Organizations)
- Step 3: Data Collection Methods
- Step 4: Project Milestones & Timeline
- Step 5: Review & Analysis
- Step 6: Form Generator
- Step 7: AI Dashboard Configuration
- Step 8: Export & Digital Signature (DocuSeal)

### 3. Agreement Creator Wizard
- Creates formal agreements between parties
- Generates contracts, MOUs, partnership agreements
- Integrates with DocuSeal for digital signatures
- Auto-files signed documents to appropriate folders

---

## PRE-DEPLOYMENT ANALYSIS

**CRITICAL: Before implementing, you MUST analyze the target system to understand:**

### 1. Existing Data Models
Ask the user or analyze the codebase for:
- User/Organization models (to link proposals/agreements)
- Existing form/survey systems (to integrate or replace)
- Dashboard/reporting infrastructure
- File storage configuration
- Document management system (for signed agreement storage)

### 2. Existing Dropdown Lists
Identify and catalog existing lists that should be reused:
```
- Organization types (nonprofit, government, foundation, etc.)
- User roles (admin, staff, viewer, etc.)
- Status values (draft, active, completed, etc.)
- Frequency options (daily, weekly, monthly, quarterly, annually)
- Geographic regions (states, counties, service areas)
- Service categories (health, education, housing, etc.)
- Funding sources (federal, state, foundation, corporate)
```

### 3. UI Component Library
Identify the target system's:
- UI framework (Material-UI, Chakra, Tailwind, Bootstrap, etc.)
- Form components (text fields, selects, date pickers)
- Table/data grid components
- Chart library (Recharts, Chart.js, D3, etc.)
- Modal/dialog patterns

### 4. Backend Architecture
Understand:
- Database type (Firebase, PostgreSQL, MongoDB, etc.)
- API pattern (REST, GraphQL, tRPC)
- Authentication system
- File upload handling

---

## DATA MODELS TO IMPLEMENT

### Proposal (Core Entity)
```typescript
interface Proposal {
  id: string;
  name: string;
  description: string;
  type: 'grant' | 'rfp_response' | 'rfi_response' | 'contract' | 'agreement' | 'mou';
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  fundingSource: string;       // Use existing funding source dropdown if available
  referenceNuemerging businessr: string;     // Grant nuemerging businessr, contract nuemerging businessr, etc.
  totalBudget: nuemerging businessr;
  status: 'draft' | 'pending_signature' | 'active' | 'inactive' | 'completed';
  organizationId: string;      // Link to existing organization model
  
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
  docuSealSubmissionId?: string;
  signatureStatus?: 'not_sent' | 'pending' | 'partially_signed' | 'completed' | 'declined';
  signedDocumentUrl?: string;
  signedAt?: Date;
}
```

### Agreement (Core Entity)
```typescript
interface Agreement {
  id: string;
  name: string;
  type: 'service_agreement' | 'partnership_mou' | 'subcontract' | 'vendor_agreement' | 'employment' | 'nda' | 'other';
  description: string;
  parties: AgreementParty[];
  effectiveDate: string;
  expirationDate?: string;
  terms: string;
  totalValue?: nuemerging businessr;
  status: 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
  linkedProposalId?: string;   // Optional link to parent proposal
  
  // Digital Signature
  docuSealSubmissionId?: string;
  signatureStatus: 'not_sent' | 'pending' | 'partially_signed' | 'completed' | 'declined';
  signers: Signer[];
  
  // Document Storage
  draftDocumentUrl?: string;
  signedDocumentUrl?: string;
  filedLocation?: string;      // Path in document management system
  filedUnderPersonId?: string; // Person this agreement is filed under
  
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
}

interface AgreementParty {
  id: string;
  name: string;
  role: 'primary' | 'secondary' | 'witness';
  organizationName?: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  signedAt?: Date;
  status: 'pending' | 'signed' | 'declined';
}
```

### CollaboratingEntity
```typescript
interface CollaboratingEntity {
  id: string;
  name: string;
  role: 'lead' | 'partner' | 'evaluator' | 'stakeholder' | 'funder' | 'other';
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  responsibilities: string[];
}
```

### DataCollectionMethod
```typescript
interface DataCollectionMethod {
  id: string;
  name: string;
  description: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  responsibleEntity: string;   // Reference to CollaboratingEntity.name
  dataPoints: string[];        // What data to collect
  tools: string[];             // Platform tools to use
}
```

### ProjectMilestone
```typescript
interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;             // YYYY-MM-DD
  status: 'not_started' | 'in_progress' | 'delayed' | 'completed';
  responsibleParties: string[]; // Entity names
  dependencies: string[];       // Other milestone names
}
```

### FormTemplate
```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  purpose: 'intake' | 'progress' | 'assessment' | 'feedback' | 'reporting' | 'data';
  sections: FormSection[];
  entityResponsible: string;
  frequency?: string;
  datasetId?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;  // 75+ field types supported
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: FieldValidation;
}
```

### DashboardMetric
```typescript
interface DashboardMetric {
  id: string;
  name: string;
  description?: string;
  value: nuemerging businessr | string;
  target?: nuemerging businessr | string;
  unit?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  trend?: 'up' | 'down' | 'flat';
  linkedForm: string;          // Form that provides data
  datasetField: string;        // Field to visualize
  visualization: 'nuemerging businessr' | 'percentage' | 'currency' | 'ratio';
}
```

---

## INTEGRATION POINTS

### 1. Dropdown Integration
When implementing, map these fields to existing system dropdowns:

| Grant Field | Look For Existing List |
|-------------|----------------------|
| `fundingSource` | Funding sources, sponsor types |
| `status` | Project/grant statuses |
| `entity.role` | Organization roles, partner types |
| `frequency` | Reporting frequencies, schedule types |
| `milestone.status` | Task/project statuses |
| `form.purpose` | Form categories, document types |

**Implementation Pattern:**
```typescript
// Check if target system has existing constants
import { EXISTING_FUNDING_SOURCES } from '@/constants/organization';
import { EXISTING_STATUS_OPTIONS } from '@/constants/status';

// Use existing if available, otherwise use defaults
const FUNDING_SOURCES = EXISTING_FUNDING_SOURCES || [
  'Federal Government',
  'State Government', 
  'Private Foundation',
  'Corporate Sponsor',
  'Other'
];
```

### 2. Form Builder Integration
If target system has existing form builder:
- Extend it with grant-specific field types
- Add dataset auto-generation capability
- Link forms to data collection methods

If no form builder exists:
- Implement full FormBuilder component
- Include 75+ field types (see FIELD_TYPES constant)
- Add drag-and-drop reordering

### 3. Dashboard Integration
If target system has dashboard infrastructure:
- Add grant-specific widgets
- Integrate with existing chart library
- Use existing data refresh patterns

If no dashboard exists:
- Implement dashboard framework with Recharts
- Add KPI cards, charts, and data tables
- Include real-time refresh capability

---

## AI ANALYSIS API

### Endpoint: `/api/ai/analyze-document`

**Request:**
```typescript
POST /api/ai/analyze-document
Content-Type: multipart/form-data

{
  file: File;                  // PDF, DOCX, or TXT
  documentType?: 'grant' | 'rfp' | 'rfi' | 'contract' | 'agreement' | 'auto';  // 'auto' for AI detection
}
```

**Response:**
```typescript
{
  success: boolean;
  detectedType: string;        // AI-detected document type
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
```

### OpenAI Prompt Structure
The AI analysis uses a comprehensive prompt that:
1. Detects document type (grant, RFP, RFI, contract, agreement)
2. Extracts exact information from documents
3. Intelligently infers missing data
4. Maps requirements to platform capabilities
5. Generates forms with appropriate field types
6. Creates dashboard configurations linked to forms
7. Identifies signature requirements and parties

**Key AI Instructions:**
- Extract ONLY from document text (no fabrication)
- Use exact organization names as written
- Convert dates to YYYY-MM-DD format
- Convert budgets to nuemerging businessrs (remove $ and commas)
- Create 4-6 milestones spanning project period
- Generate 2-3 forms per proposal
- Link all dashboard elements to form datasets
- Identify all parties requiring signatures

---

## WIZARD COMPONENTS

### Step 1: Basic Info & Document Upload
```typescript
// Features:
// - File upload (PDF, DOCX, TXT)
// - Text paste option
// - Document type selection (grant, RFP, RFI, contract, agreement)
// - AI analysis trigger with auto-detection
// - Basic fields (name, description, dates, budget)
// - Progress indicator during analysis
```

### Step 2: Entity Details
```typescript
// Features:
// - Add/edit/remove collaborating entities
// - Role selection (lead, partner, evaluator, stakeholder, funder)
// - Contact information
// - Responsibilities list
// - Entity relationship visualization
```

### Step 3: Data Collection Methods
```typescript
// Features:
// - Define data collection methods
// - Set frequency (daily, weekly, monthly, quarterly, annually)
// - Assign responsible entity (from Step 2)
// - List data points to collect
// - Map to platform tools
```

### Step 4: Project Milestones
```typescript
// Features:
// - Timeline visualization
// - Add/edit milestones
// - Set due dates
// - Assign responsible parties
// - Define dependencies
// - Status tracking (not_started, in_progress, delayed, completed)
```

### Step 5: Review & Analysis
```typescript
// Features:
// - Summary of all entered data
// - AI-generated recommendations
// - Risk assessment
// - Entity relationship notes
// - Validation checks
```

### Step 6: Form Generator
```typescript
// Features:
// - Auto-generated forms from data collection methods
// - 75+ field types
// - Drag-and-drop field ordering
// - Validation configuration
// - Dataset structure preview
```

### Step 7: AI Dashboard
```typescript
// Features:
// - KPI cards with targets and trends
// - Charts (line, bar, pie, area, gauge)
// - Data tables with sorting/filtering
// - Real-time refresh configuration
// - All elements linked to form datasets
```

### Step 8: Export & Digital Signature
```typescript
// Features:
// - Preview generated documents
// - Configure branding options
// - Select export format (Markdown, PDF, both)
// - DocuSeal integration for digital signatures
// - Configure signers and signature order
// - Send for signature via email
// - Track signature status
// - Auto-file signed documents
```

---

## FIELD TYPES (75+ Types)

### Text Entry
- `text` - Single line text
- `textarea` - Multi-line text
- `email` - Email with validation
- `phone` - Phone nuemerging businessr
- `url` - Website URL
- `password` - Masked input

### Multiple Choice
- `radio` - Single selection
- `checkbox` - Multiple selection
- `select` - Dropdown
- `image-choice` - Image options
- `button-choice` - Button selection

### Matrix/Grid
- `matrix` - Grid questions
- `ranking` - Rank items
- `side-by-side` - Comparison

### Slider & Scale
- `likert` - Agreement scale
- `rating` - Star rating
- `nps` - Net Promoter Score
- `slider` - Numeric slider
- `visual-analog` - Visual scale

### Date & Time
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time
- `date-range` - Date range

### Numeric
- `nuemerging businessr` - Nuemerging businessr input
- `currency` - Money input
- `percentage` - Percentage
- `calculation` - Calculated field

### File & Media
- `file` - File upload
- `image` - Image upload
- `signature` - Signature capture

### Location
- `address` - Full address
- `city-state` - City and state
- `zipcode` - ZIP code
- `coordinates` - GPS coordinates

### Contact Info
- `full-name` - Name fields
- `contact-email` - Contact email
- `contact-phone` - Contact phone

### Specialized
- `consent` - Consent checkbox
- `demographics` - Demographic questions
- `health-assessment` - Health questions

---

## DEPLOYMENT CHECKLIST

### Phase 1: Analysis
- [ ] Analyze target system's tech stack
- [ ] Identify existing dropdown lists
- [ ] Map UI component library
- [ ] Understand database schema
- [ ] Review authentication system

### Phase 2: Data Layer
- [ ] Create Grant data model
- [ ] Create supporting models (Entity, Milestone, etc.)
- [ ] Set up database collections/tables
- [ ] Implement CRUD services

### Phase 3: API Layer
- [ ] Implement `/api/ai/analyze-document` endpoint
- [ ] Set up OpenAI integration
- [ ] Implement PDF text extraction
- [ ] Create proposal/agreement CRUD endpoints
- [ ] Implement DocuSeal API integration
- [ ] Create webhook endpoint for signature notifications

### Phase 4: UI Components
- [ ] Create ProposalWizard container
- [ ] Create AgreementWizard container
- [ ] Implement all 8 wizard steps
- [ ] Build FormBuilder component
- [ ] Create Dashboard components
- [ ] Build DocuSeal signature UI
- [ ] Integrate with existing UI library

### Phase 5: Integration
- [ ] Connect to existing auth system
- [ ] Link to organization model
- [ ] Integrate existing dropdowns
- [ ] Add navigation routes
- [ ] Implement permissions
- [ ] Configure DocuSeal webhooks
- [ ] Set up document filing automation

### Phase 6: Testing
- [ ] Test document upload/analysis
- [ ] Verify form generation
- [ ] Test dashboard rendering
- [ ] Validate data persistence
- [ ] Check dropdown integration
- [ ] Test DocuSeal signature flow
- [ ] Verify signed document auto-filing

---

## ENVIRONMENT VARIABLES

```env
# Required for AI Analysis
OPENAI_API_KEY=sk-...

# Database (example for Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=

# DocuSeal Integration (Digital Signatures)
DOCUSEAL_API_KEY=
DOCUSEAL_API_URL=https://api.docuseal.co
DOCUSEAL_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://your-app.com  # For webhook callbacks
```

---

## SAMPLE INTEGRATION CODE

### Context Provider
```typescript
// ProposalWizardContext.tsx
import { createContext, useContext, useState } from 'react';

interface ProposalWizardContextType {
  currentStep: nuemerging businessr;
  proposalData: Partial<Proposal>;
  updateProposalData: (data: Partial<Proposal>) => void;
  analyzeDocument: (file: File, type?: string) => Promise<AnalysisResult>;
  submitProposal: () => Promise<string>;
  sendForSignature: (signers: Signer[]) => Promise<SignatureResult>;
  // ... additional methods
}

export const ProposalWizardProvider = ({ children }) => {
  const [proposalData, setProposalData] = useState<Partial<Proposal>>({});
  
  const analyzeDocument = async (file: File, type?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('documentType', type);
    
    const response = await fetch('/api/ai/analyze-document', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    if (result.success) {
      setProposalData(prev => ({
        ...prev,
        name: result.data.title,
        type: result.detectedType,
        description: result.data.description,
        // ... map all fields
      }));
    }
    return result;
  };
  
  const sendForSignature = async (signers: Signer[]) => {
    const response = await fetch('/api/docuseal/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: proposalData.id,
        signers,
      }),
    });
    return response.json();
  };
  
  // ... rest of implementation
};
```

### Dropdown Integration Example
```typescript
// Use existing system dropdowns where available
import { useSystemConfig } from '@/hooks/useSystemConfig';

function EntityRoleSelect({ value, onChange }) {
  const { organizationRoles } = useSystemConfig();
  
  // Map system roles to proposal entity roles
  const roleOptions = organizationRoles?.length > 0
    ? organizationRoles.map(r => ({ value: r.id, label: r.name }))
    : [
        { value: 'lead', label: 'Lead Organization' },
        { value: 'partner', label: 'Partner' },
        { value: 'evaluator', label: 'Evaluator' },
        { value: 'stakeholder', label: 'Stakeholder' },
        { value: 'funder', label: 'Funder' },
      ];
  
  return (
    <Select value={value} onChange={onChange} options={roleOptions} />
  );
}

// Document type dropdown
function DocumentTypeSelect({ value, onChange }) {
  const documentTypes = [
    { value: 'grant', label: 'Grant Application' },
    { value: 'rfp_response', label: 'RFP Response' },
    { value: 'rfi_response', label: 'RFI Response' },
    { value: 'contract', label: 'Contract' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'mou', label: 'Memorandum of Understanding' },
  ];
  
  return (
    <Select value={value} onChange={onChange} options={documentTypes} />
  );
}
```

---

## QUESTIONS TO ASK BEFORE DEPLOYMENT

1. **What is your tech stack?** (Framework, UI library, database)
2. **Do you have existing organization/user models?**
3. **Do you have existing form builder functionality?**
4. **Do you have existing dashboard/reporting infrastructure?**
5. **What dropdown lists already exist in your system?**
6. **How do you handle file uploads?**
7. **What authentication system do you use?**
8. **Do you have an OpenAI API key configured?**
9. **What chart library do you prefer?**
10. **Are there any specific compliance requirements?**
11. **Do you have a DocuSeal account for digital signatures?**
12. **Where should signed agreements be stored?** (folder structure)
13. **How should signed documents be filed?** (by person, by project, by date)

---

## SUCCESS CRITERIA

The deployment is successful when:
1. ✅ Users can upload documents (grants, RFPs, contracts) and get AI analysis
2. ✅ All 8 wizard steps function correctly
3. ✅ Forms are generated with appropriate field types
4. ✅ Dashboard displays metrics linked to form data
5. ✅ Existing system dropdowns are integrated
6. ✅ Proposals/agreements are saved to the database
7. ✅ Navigation and permissions work correctly
8. ✅ UI matches the target system's design patterns
9. ✅ Markdown export generates complete documentation
10. ✅ Branded PDF submission documents are professionally formatted
11. ✅ DocuSeal integration sends documents for digital signature
12. ✅ Signed documents are automatically filed in correct location
13. ✅ Signature status is tracked and displayed in UI

---

## DOCUMENT GENERATION & DIGITAL SIGNATURES

### Overview
The system generates exportable documents and manages digital signatures:
1. **Markdown File** - Portable, version-controllable documentation
2. **Branded Professional PDF** - Funder-ready submission document
3. **DocuSeal Integration** - Digital signature workflow with auto-filing

### Document Generation API

#### Endpoint: `/api/documents/export`

**Request:**
```typescript
POST /api/documents/export
Content-Type: application/json

{
  documentId: string;          // Proposal or Agreement ID
  documentType: 'proposal' | 'agreement';
  format: 'markdown' | 'pdf' | 'both';
  branding?: {
    organizationName: string;
    logoUrl?: string;
    primaryColor?: string;      // Hex color for headers
    secondaryColor?: string;    // Hex color for accents
    contactInfo?: {
      address: string;
      phone: string;
      email: string;
      website: string;
    };
  };
  includeAppendices?: boolean;
  includeBudgetDetails?: boolean;
  prepareForSignature?: boolean;  // Generate signature-ready PDF
}
```

**Response:**
```typescript
{
  success: boolean;
  markdown?: string;           // Raw markdown content
  markdownUrl?: string;        // Download URL for .md file
  pdfUrl?: string;             // Download URL for branded PDF
  signatureReadyPdfUrl?: string; // PDF prepared for DocuSeal
  generatedAt: string;
}
```

---

---

## DOCUSEAL INTEGRATION

### Overview
DocuSeal provides digital signature capabilities for proposals and agreements. The integration supports:
- Sending documents for signature via email
- Multiple signers with defined order
- Real-time signature status tracking
- Webhook notifications for signature events
- Automatic filing of signed documents

### DocuSeal API Endpoints

#### 1. Create Submission (Send for Signature)

**Endpoint:** `/api/docuseal/send`

**Request:**
```typescript
POST /api/docuseal/send
Content-Type: application/json

{
  documentId: string;          // Proposal or Agreement ID
  documentType: 'proposal' | 'agreement';
  templateId?: string;         // Optional DocuSeal template ID
  signers: Array<{
    name: string;
    email: string;
    role: string;              // e.g., "Client", "Contractor", "Witness"
    order?: nuemerging businessr;            // Signing order (1, 2, 3...)
  }>;
  message?: string;            // Custom email message
  expiresIn?: nuemerging businessr;          // Days until expiration
  sendEmail?: boolean;         // Default: true
}
```

**Response:**
```typescript
{
  success: boolean;
  submissionId: string;        // DocuSeal submission ID
  signingUrls: Array<{         // Direct signing URLs (if sendEmail: false)
    email: string;
    url: string;
  }>;
  status: 'pending';
}
```

#### 2. Check Signature Status

**Endpoint:** `/api/docuseal/status/[submissionId]`

**Response:**
```typescript
{
  success: boolean;
  submissionId: string;
  status: 'pending' | 'partially_signed' | 'completed' | 'declined' | 'expired';
  signers: Array<{
    name: string;
    email: string;
    status: 'pending' | 'signed' | 'declined';
    signedAt?: string;
  }>;
  completedAt?: string;
  documentUrl?: string;        // Signed document URL (when completed)
}
```

#### 3. Webhook Handler

**Endpoint:** `/api/docuseal/webhook`

Handles DocuSeal webhook events:
- `submission.completed` - All parties have signed
- `submission.partially_signed` - Some parties have signed
- `submission.declined` - A party declined to sign
- `submission.expired` - Submission expired

```typescript
// Webhook payload
{
  event: 'submission.completed' | 'submission.partially_signed' | 'submission.declined' | 'submission.expired';
  data: {
    submission_id: string;
    status: string;
    completed_at?: string;
    documents: Array<{
      name: string;
      url: string;
    }>;
    submitters: Array<{
      email: string;
      status: string;
      completed_at?: string;
    }>;
  };
}
```

### DocuSeal Service Implementation

```typescript
// services/DocuSealService.ts
import axios from 'axios';

const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || 'https://api.docuseal.co';
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY;

export class DocuSealService {
  private static headers = {
    'X-Auth-Token': DOCUSEAL_API_KEY,
    'Content-Type': 'application/json',
  };

  // Create a submission from a PDF
  static async createSubmission(params: {
    pdfUrl: string;
    signers: Array<{ name: string; email: string; role: string; order?: nuemerging businessr }>;
    message?: string;
    expiresIn?: nuemerging businessr;
  }) {
    const response = await axios.post(
      `${DOCUSEAL_API_URL}/submissions`,
      {
        template_id: null,  // Using PDF directly
        send_email: true,
        submitters: params.signers.map((signer, index) => ({
          name: signer.name,
          email: signer.email,
          role: signer.role,
          order: signer.order || index + 1,
        })),
        message: params.message,
        expire_at: params.expiresIn 
          ? new Date(Date.now() + params.expiresIn * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        documents: [{ url: params.pdfUrl }],
      },
      { headers: this.headers }
    );
    return response.data;
  }

  // Get submission status
  static async getSubmissionStatus(submissionId: string) {
    const response = await axios.get(
      `${DOCUSEAL_API_URL}/submissions/${submissionId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  // Download signed document
  static async downloadSignedDocument(submissionId: string): Promise<Buffer> {
    const response = await axios.get(
      `${DOCUSEAL_API_URL}/submissions/${submissionId}/documents/download`,
      { headers: this.headers, responseType: 'arraybuffer' }
    );
    return Buffer.from(response.data);
  }
}
```

---

## SIGNED DOCUMENT AUTO-FILING

### Overview
When a document is signed via DocuSeal, the system automatically:
1. Downloads the signed PDF
2. Stores it in the document management system
3. Files it under the appropriate person/project
4. Updates the proposal/agreement record

### Filing Structure

```
Documents/
├── Incoming Signed Agreements/
│   ├── [Year]/
│   │   ├── [Month]/
│   │   │   ├── [PersonName]_[AgreementType]_[Date].pdf
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── Proposals/
│   ├── [Year]/
│   │   ├── Grants/
│   │   ├── RFP_Responses/
│   │   └── Contracts/
│   └── ...
└── Agreements/
    ├── Active/
    ├── Expired/
    └── Terminated/
```

### Auto-Filing Service

```typescript
// services/DocumentFilingService.ts

interface FilingOptions {
  documentType: 'proposal' | 'agreement';
  documentId: string;
  signedPdfBuffer: Buffer;
  filedUnderPersonId?: string;
  filedUnderPersonName?: string;
}

export class DocumentFilingService {
  // File a signed document
  static async fileSignedDocument(options: FilingOptions): Promise<string> {
    const { documentType, documentId, signedPdfBuffer, filedUnderPersonId, filedUnderPersonName } = options;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dateStr = now.toISOString().split('T')[0];
    
    // Determine file path
    let filePath: string;
    let fileName: string;
    
    if (documentType === 'agreement') {
      const agreement = await AgreementService.getById(documentId);
      const personName = filedUnderPersonName || 'Unknown';
      const sanitizedName = personName.replace(/[^a-zA-Z0-9]/g, '_');
      
      fileName = `${sanitizedName}_${agreement.type}_${dateStr}.pdf`;
      filePath = `Documents/Incoming Signed Agreements/${year}/${month}/${fileName}`;
    } else {
      const proposal = await ProposalService.getById(documentId);
      const typeFolder = proposal.type === 'grant' ? 'Grants' 
        : proposal.type === 'rfp_response' ? 'RFP_Responses' 
        : 'Contracts';
      
      fileName = `${proposal.referenceNuemerging businessr || proposal.id}_signed_${dateStr}.pdf`;
      filePath = `Documents/Proposals/${year}/${typeFolder}/${fileName}`;
    }
    
    // Upload to storage (Firebase, S3, etc.)
    const downloadUrl = await StorageService.uploadFile(filePath, signedPdfBuffer, 'application/pdf');
    
    // Update the document record
    if (documentType === 'agreement') {
      await AgreementService.update(documentId, {
        signedDocumentUrl: downloadUrl,
        filedLocation: filePath,
        filedUnderPersonId,
        signedAt: now,
        status: 'active',
        signatureStatus: 'completed',
      });
    } else {
      await ProposalService.update(documentId, {
        signedDocumentUrl: downloadUrl,
        signedAt: now,
        signatureStatus: 'completed',
      });
    }
    
    return downloadUrl;
  }
}
```

### Webhook Handler for Auto-Filing

```typescript
// app/api/docuseal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocuSealService } from '@/services/DocuSealService';
import { DocumentFilingService } from '@/services/DocumentFilingService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-DocuSeal-Signature');
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.DOCUSEAL_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const payload = JSON.parse(body);
  
  if (payload.event === 'submission.completed') {
    const submissionId = payload.data.submission_id;
    
    // Find the associated document
    const document = await findDocumentBySubmissionId(submissionId);
    
    if (document) {
      // Download the signed PDF
      const signedPdf = await DocuSealService.downloadSignedDocument(submissionId);
      
      // Auto-file the document
      await DocumentFilingService.fileSignedDocument({
        documentType: document.type,
        documentId: document.id,
        signedPdfBuffer: signedPdf,
        filedUnderPersonId: document.primaryContactId,
        filedUnderPersonName: document.primaryContactName,
      });
      
      console.log(`✅ Signed document filed: ${document.id}`);
    }
  }
  
  return NextResponse.json({ received: true });
}
```

---

## SIGNATURE UI COMPONENT

```typescript
// components/SignatureManager.tsx
import { useState, useEffect } from 'react';

interface SignatureManagerProps {
  documentId: string;
  documentType: 'proposal' | 'agreement';
  onSignatureComplete?: (signedUrl: string) => void;
}

export function SignatureManager({ documentId, documentType, onSignatureComplete }: SignatureManagerProps) {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [status, setStatus] = useState<string>('not_sent');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
  // Add a signer
  const addSigner = () => {
    setSigners([...signers, { id: generateId(), name: '', email: '', role: '', order: signers.length + 1 }]);
  };
  
  // Send for signature
  const sendForSignature = async () => {
    const response = await fetch('/api/docuseal/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        documentType,
        signers,
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      setSubmissionId(result.submissionId);
      setStatus('pending');
    }
  };
  
  // Poll for status updates
  useEffect(() => {
    if (!submissionId || status === 'completed') return;
    
    const interval = setInterval(async () => {
      const response = await fetch(`/api/docuseal/status/${submissionId}`);
      const result = await response.json();
      
      setStatus(result.status);
      setSigners(result.signers);
      
      if (result.status === 'completed' && result.documentUrl) {
        onSignatureComplete?.(result.documentUrl);
        clearInterval(interval);
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [submissionId, status]);
  
  return (
    <div className="signature-manager">
      <h3>Digital Signature</h3>
      
      {status === 'not_sent' && (
        <>
          <div className="signers-list">
            {signers.map((signer, index) => (
              <SignerRow
                key={signer.id}
                signer={signer}
                onChange={(updated) => updateSigner(index, updated)}
                onRemove={() => removeSigner(index)}
              />
            ))}
          </div>
          
          <Button onClick={addSigner}>Add Signer</Button>
          <Button onClick={sendForSignature} disabled={signers.length === 0}>
            Send for Signature
          </Button>
        </>
      )}
      
      {status !== 'not_sent' && (
        <SignatureStatusDisplay
          status={status}
          signers={signers}
          submissionId={submissionId}
        />
      )}
    </div>
  );
}
```

---

### Markdown Export Structure

The generated Markdown file follows this structure:

```markdown
# [Document Title]

## Executive Summary
[AI-generated summary of grant purpose, goals, and expected outcomes]

## Grant Information
| Field | Value |
|-------|-------|
| Grant Nuemerging businessr | [grantNuemerging businessr] |
| Funding Source | [fundingSource] |
| Total Budget | $[totalBudget] |
| Project Period | [startDate] to [endDate] |
| Status | [status] |

## Project Description
[Full grant description]

## Collaborating Organizations

### Lead Organization
- **Name:** [entity.name]
- **Contact:** [entity.contactName] ([entity.contactEmail])
- **Responsibilities:** [entity.responsibilities]

### Partner Organizations
[Repeat for each partner]

## Project Timeline & Milestones

| Milestone | Due Date | Status | Responsible Parties |
|-----------|----------|--------|--------------------|
| [name] | [dueDate] | [status] | [responsibleParties] |

### Milestone Details
#### [Milestone 1 Name]
- **Description:** [description]
- **Dependencies:** [dependencies]
- **Deliverables:** [extracted deliverables]

## Data Collection Plan

### [Method 1 Name]
- **Description:** [description]
- **Frequency:** [frequency]
- **Responsible Entity:** [responsibleEntity]
- **Data Points:** [dataPoints]
- **Tools/Methods:** [tools]

## Reporting Requirements

| Report Type | Frequency | Due Date | Description |
|-------------|-----------|----------|-------------|
| [type] | [frequency] | [dueDate] | [description] |

## Budget Summary

| Category | Amount | Percentage |
|----------|--------|------------|
| Personnel | $X | X% |
| Equipment | $X | X% |
| Supplies | $X | X% |
| Travel | $X | X% |
| Other | $X | X% |
| **Total** | **$[totalBudget]** | **100%** |

## Performance Metrics & KPIs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| [name] | [target] | [value] | [status] |

## Risk Assessment
[AI-generated risk analysis based on grant data]

## Appendices
- Appendix A: Detailed Budget Breakdown
- Appendix B: Staff Qualifications
- Appendix C: Letters of Support
- Appendix D: Data Collection Forms

## Signature Block

| Party | Role | Status | Signed Date |
|-------|------|--------|-------------|
| [signer.name] | [signer.role] | [signer.status] | [signer.signedAt] |

---
*Generated on [date] | Proposal & Agreement Management System*
```

---

### Branded Professional PDF Format

The PDF export creates a funder-ready submission document with:

#### Cover Page
```
┌─────────────────────────────────────────────┐
│                                             │
│              [ORGANIZATION LOGO]            │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│            [GRANT TITLE]                    │
│                                             │
│     A Proposal Submitted to:                │
│        [FUNDING SOURCE]                     │
│                                             │
│     Grant Nuemerging businessr: [GRANT NUemerging businessR]            │
│                                             │
│     Project Period:                         │
│     [START DATE] - [END DATE]               │
│                                             │
│     Total Budget Request: $[BUDGET]         │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│     Submitted by:                           │
│     [LEAD ORGANIZATION NAME]                │
│     [ADDRESS]                               │
│     [PHONE] | [EMAIL]                       │
│     [WEBSITE]                               │
│                                             │
│     Submission Date: [DATE]                 │
│                                             │
└─────────────────────────────────────────────┘
```

#### Document Sections

1. **Table of Contents** (auto-generated with page nuemerging businessrs)

2. **Executive Summary** (1 page)
   - Project overview
   - Key objectives
   - Expected outcomes
   - Budget summary

3. **Organizational Capacity** (1-2 pages)
   - Lead organization background
   - Partner organizations
   - Relevant experience
   - Staff qualifications

4. **Statement of Need** (1-2 pages)
   - Problem description
   - Target population
   - Geographic scope
   - Supporting data

5. **Project Description** (3-5 pages)
   - Goals and objectives
   - Activities and methods
   - Timeline with milestones
   - Deliverables matrix

6. **Evaluation Plan** (1-2 pages)
   - Data collection methods
   - Performance metrics
   - Reporting schedule
   - Quality assurance

7. **Budget Narrative** (2-3 pages)
   - Line item justification
   - Cost allocation
   - In-kind contributions
   - Sustainability plan

8. **Appendices**
   - Detailed budget tables
   - Organizational chart
   - Letters of commitment
   - Resumes/CVs
   - Data collection instruments

#### PDF Styling Options

```typescript
interface PDFBrandingConfig {
  // Header/Footer
  headerLogo: string;           // URL to logo image
  headerHeight: nuemerging businessr;         // pixels
  footerText: string;           // e.g., "Confidential - [Org Name]"
  pageNuemerging businessrs: boolean;
  
  // Colors
  primaryColor: string;         // Section headers
  secondaryColor: string;       // Subheaders, accents
  accentColor: string;          // Highlights, callouts
  
  // Typography
  headingFont: string;          // e.g., "Georgia", "Arial"
  bodyFont: string;             // e.g., "Times New Roman", "Calibri"
  fontSize: nuemerging businessr;             // Base font size (pt)
  
  // Layout
  margins: {
    top: nuemerging businessr;
    bottom: nuemerging businessr;
    left: nuemerging businessr;
    right: nuemerging businessr;
  };
  
  // Sections to include
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
  includeAppendices: boolean;
}
```

---

### Deliverables Matrix Generation

The system auto-generates a deliverables matrix from milestones:

```typescript
interface Deliverable {
  id: string;
  name: string;
  description: string;
  milestone: string;            // Linked milestone
  dueDate: string;
  responsibleParty: string;
  verificationMethod: string;   // How completion is verified
  status: 'pending' | 'in_progress' | 'submitted' | 'approved';
  submissionDate?: string;
  approvalDate?: string;
  notes?: string;
}

// Auto-generated from milestones
function generateDeliverablesMatrix(grant: Grant): Deliverable[] {
  return grant.projectMilestones.map(milestone => ({
    id: generateId(),
    name: milestone.name,
    description: milestone.description,
    milestone: milestone.name,
    dueDate: milestone.dueDate,
    responsibleParty: milestone.responsibleParties.join(', '),
    verificationMethod: inferVerificationMethod(milestone),
    status: mapMilestoneStatus(milestone.status),
  }));
}
```

#### Deliverables Table in Export

| # | Deliverable | Description | Due Date | Responsible | Verification | Status |
|---|-------------|-------------|----------|-------------|--------------|--------|
| 1 | Program Launch | Complete setup and begin services | 2024-03-31 | Lead Org | Launch report | Pending |
| 2 | Q1 Report | First quarterly progress report | 2024-04-15 | Lead Org | Submitted report | Pending |
| 3 | Mid-Year Evaluation | Program assessment at 6 months | 2024-07-31 | Evaluator | Evaluation report | Pending |

---

### Export UI Component

```typescript
// GrantExportDialog.tsx
interface GrantExportDialogProps {
  grant: Grant;
  onExport: (options: ExportOptions) => Promise<void>;
}

function GrantExportDialog({ grant, onExport }: GrantExportDialogProps) {
  const [format, setFormat] = useState<'markdown' | 'pdf' | 'both'>('both');
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeAppendices, setIncludeAppendices] = useState(true);
  
  return (
    <Dialog>
      <DialogTitle>Export Grant Document</DialogTitle>
      <DialogContent>
        {/* Format Selection */}
        <FormControl>
          <FormLabel>Export Format</FormLabel>
          <RadioGroup value={format} onChange={setFormat}>
            <Radio value="markdown" label="Markdown (.md)" />
            <Radio value="pdf" label="Branded PDF" />
            <Radio value="both" label="Both Formats" />
          </RadioGroup>
        </FormControl>
        
        {/* Branding Options (for PDF) */}
        {format !== 'markdown' && (
          <BrandingOptions
            enabled={includeBranding}
            onToggle={setIncludeBranding}
          />
        )}
        
        {/* Content Options */}
        <FormControlLabel
          control={<Checkbox checked={includeAppendices} />}
          label="Include Appendices"
        />
        
        {/* Preview */}
        <DocumentPreview grant={grant} format={format} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onExport({ format, includeBranding, includeAppendices })}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

### PDF Generation Libraries

Recommended libraries for PDF generation:

| Library | Use Case | Notes |
|---------|----------|-------|
| **@react-pdf/renderer** | React-based PDF generation | Best for complex layouts |
| **pdfmake** | Declarative PDF creation | Good for tables and forms |
| **puppeteer** | HTML to PDF conversion | Best for exact styling |
| **jsPDF** | Client-side generation | Lightweight, basic features |

**Recommended Approach:**
```typescript
// Server-side PDF generation with Puppeteer
import puppeteer from 'puppeteer';

async function generateBrandedPDF(grant: Grant, branding: BrandingConfig): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Generate HTML from grant data
  const html = renderGrantToHTML(grant, branding);
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'Letter',
    margin: branding.margins,
    displayHeaderFooter: true,
    headerTemplate: generateHeader(branding),
    footerTemplate: generateFooter(branding),
  });
  
  await browser.close();
  return pdf;
}
```

---

### Wizard Step 8: Export & Digital Signature (ENHANCED)

The final wizard step for document generation and signature:

```typescript
// Step 8: Export & Digital Signature
// Features:
// - Preview generated documents
// - Configure branding options
// - Select export format (Markdown, PDF, both)
// - Download generated files
// - DocuSeal integration for digital signatures
// - Add signers with roles and order
// - Send for signature via email
// - Track signature status in real-time
// - Auto-file signed documents
```

**Step 8 UI:**
- Document preview panel
- Branding configuration (logo, colors, fonts)
- Export format selection
- Deliverables checklist
- Download buttons
- **Signature Section:**
  - Signer management (add/remove/reorder)
  - Role assignment for each signer
  - Custom email message
  - Expiration date setting
  - "Send for Signature" button
  - Real-time signature status tracker
  - Signed document download
  - Filing location indicator
