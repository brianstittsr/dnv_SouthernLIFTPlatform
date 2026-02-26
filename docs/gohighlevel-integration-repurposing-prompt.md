# GoHighLevel Integration Repurposing Prompt

## Purpose
This document provides a comprehensive prompt for rebuilding the GoHighLevel (GHL) integration features from the All Pro Sports platform into another Next.js application. The integration is tightly coupled with Firebase Firestore for data persistence and uses OpenAI for AI-powered workflow generation.

---

## PROMPT FOR AI ASSISTANT

### Context
You are tasked with implementing a complete GoHighLevel CRM integration system for a Next.js application. The system should provide:

1. **Multi-integration management** - Support multiple GHL accounts/locations
2. **Bi-directional data sync** - Contacts, opportunities, calendars, pipelines, campaigns
3. **AI-powered workflow builder** - Generate GHL workflows from plain language descriptions
4. **Workflow import/export** - Import existing GHL workflows and convert to plain language
5. **Conversation management** - View and respond to GHL conversations
6. **Sync logging and monitoring** - Track all sync operations with detailed logs

---

## INFRASTRUCTURE REQUIREMENTS

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: Firebase Firestore
- **Authentication**: JWT-based admin auth (or your preferred auth system)
- **AI Provider**: OpenAI GPT-4 for workflow generation
- **HTTP Client**: Axios for GHL API calls
- **UI Framework**: Bootstrap 5 with Font Awesome icons

### Environment Variables Required
```env
# GoHighLevel API (can also be stored per-integration in database)
GOHIGHLEVEL_API_KEY=your_api_key
GOHIGHLEVEL_LOCATION_ID=your_location_id
GOHIGHLEVEL_FROM_EMAIL=noreply@yourdomain.com

# OpenAI for AI workflow generation
OPENAI_API_KEY=your_openai_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---

## DATABASE SCHEMA (Firebase Firestore)

### Collection: `gohighlevel_integrations`
```typescript
interface GoHighLevelIntegration {
  id: string;
  
  // API Configuration
  apiToken: string;           // Encrypted API token
  locationId: string;         // GHL Location ID
  agencyId?: string;          // GHL Agency ID (if applicable)
  
  // Integration Settings
  name: string;               // Friendly name for this integration
  description?: string;
  isActive: boolean;
  
  // Sync Settings
  syncContacts: boolean;
  syncOpportunities: boolean;
  syncCalendars: boolean;
  syncPipelines: boolean;
  syncCampaigns: boolean;
  
  // Mapping Configuration
  contactMapping: {
    [localField: string]: string;  // Maps local fields to GHL custom fields
  };
  
  // Pipeline Configuration
  defaultPipelineId?: string;
  defaultStageId?: string;
  
  // Webhook Configuration
  webhookUrl?: string;
  webhookSecret?: string;
  enableWebhooks: boolean;
  
  // Last Sync Information
  lastSyncAt?: Timestamp;
  lastSyncStatus: 'success' | 'error' | 'pending' | 'never';
  lastSyncError?: string;
  totalContactsSynced: nuemerging businessr;
  totalOpportunitiesSynced: nuemerging businessr;
  
  // Rate Limiting
  rateLimitRemaining?: nuemerging businessr;
  rateLimitReset?: Timestamp;
  
  // Metadata
  createdBy: string;
  lastModifiedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `gohighlevel_sync_logs`
```typescript
interface GoHighLevelSyncLog {
  id: string;
  integrationId: string;
  
  // Sync Details
  syncType: 'contacts' | 'opportunities' | 'calendars' | 'pipelines' | 'campaigns' | 'full';
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  
  // Statistics
  recordsProcessed: nuemerging businessr;
  recordsSuccessful: nuemerging businessr;
  recordsFailed: nuemerging businessr;
  
  // Timing
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration?: nuemerging businessr;  // milliseconds
  
  // Errors
  errors: Array<{
    recordId?: string;
    error: string;
    details?: any;
  }>;
  
  // Summary
  summary?: {
    contactsCreated: nuemerging businessr;
    contactsUpdated: nuemerging businessr;
    opportunitiesCreated: nuemerging businessr;
    opportunitiesUpdated: nuemerging businessr;
  };
  
  // Metadata
  triggeredBy: string;
  triggerType: 'manual' | 'scheduled' | 'webhook' | 'event';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `ghl_workflows`
```typescript
interface GHLWorkflow {
  id: string;
  name: string;
  description: string;
  workflow: object;           // Complete workflow structure
  status: 'draft' | 'deployed' | 'archived';
  ghlWorkflowId?: string;     // Set when deployed to GHL
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deployedAt?: Timestamp;
}
```

### Collection: `ghl_imported_workflows`
```typescript
interface GHLImportedWorkflow {
  id: string;
  ghlWorkflowId: string;
  name: string;
  description: string;
  status: string;
  originalFormat: object;     // Complete original GHL workflow JSON
  trigger: object;
  actions: array;
  plainLanguagePrompt?: string;  // AI-generated description
  importedAt: Timestamp;
  convertedAt?: Timestamp;
  locationId: string;
}
```

---

## API ENDPOINTS TO IMPLEMENT

### Integration Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gohighlevel/integrations` | List all integrations |
| POST | `/api/gohighlevel/integrations` | Create new integration |
| PUT | `/api/gohighlevel/integrations/[id]` | Update integration |
| DELETE | `/api/gohighlevel/integrations/[id]` | Delete integration |
| POST | `/api/gohighlevel/test-connection/[id]` | Test GHL API connection |
| POST | `/api/gohighlevel/sync/[id]` | Trigger data sync |
| GET | `/api/gohighlevel/sync-logs` | Get sync history |

### Workflow Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ghl/workflows` | List saved workflows |
| POST | `/api/ghl/workflows` | Save new workflow |
| DELETE | `/api/ghl/workflows?id=xxx` | Delete workflow |
| GET | `/api/ghl/import-workflows` | Import workflows from GHL |
| GET | `/api/ghl/imported-workflows` | List imported workflows |
| POST | `/api/ghl/convert-workflow` | Convert GHL workflow to plain language |
| POST | `/api/ghl/create-workflow` | Deploy workflow to GHL |
| POST | `/api/ghl/generate-workflow` | AI-generate workflow from description |
| POST | `/api/ghl/workflow-conversation` | Conversational workflow builder |

---

## GOHIGHLEVEL API SERVICE CLASS

Create a service class that wraps all GHL API v2 calls:

```typescript
// lib/gohighlevel-service.ts

import axios, { AxiosInstance } from 'axios';

export class GoHighLevelService {
  private client: AxiosInstance;
  private locationId: string;

  constructor() {
    const apiKey = process.env.GOHIGHLEVEL_API_KEY || '';
    this.locationId = process.env.GOHIGHLEVEL_LOCATION_ID || '';
    
    this.client = axios.create({
      baseURL: 'https://services.leadconnectorhq.com',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'  // GHL API version header
      },
      timeout: 30000
    });
  }

  // Contact Management
  async upsertContact(contactData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) {
    return this.client.post('/contacts', {
      locationId: this.locationId,
      ...contactData
    });
  }

  async findContact(email?: string, phone?: string) {
    const query = email ? `email=${email}` : phone ? `phone=${phone}` : '';
    return this.client.get(`/contacts/lookup?${query}&locationId=${this.locationId}`);
  }

  async addTagsToContact(contactId: string, tags: string[]) {
    return this.client.post(`/contacts/${contactId}/tags`, { tags });
  }

  // Messaging
  async sendEmail(contactId: string, emailData: {
    subject: string;
    body: string;
    from?: string;
  }) {
    return this.client.post('/conversations/messages', {
      type: 'Email',
      contactId,
      locationId: this.locationId,
      subject: emailData.subject,
      html: emailData.body,
      emailFrom: emailData.from
    });
  }

  async sendSMS(contactId: string, message: string) {
    return this.client.post('/conversations/messages', {
      type: 'SMS',
      contactId,
      locationId: this.locationId,
      message
    });
  }

  // Opportunities/Leads
  async createOpportunity(data: {
    contactId: string;
    pipelineId: string;
    stageId: string;
    name: string;
    monetaryValue?: nuemerging businessr;
  }) {
    return this.client.post('/opportunities', {
      locationId: this.locationId,
      ...data
    });
  }

  // Pipelines
  async getPipelines() {
    return this.client.get(`/pipelines?locationId=${this.locationId}`);
  }

  // Workflows
  async getWorkflows() {
    return this.client.get('/workflows/', {
      params: { locationId: this.locationId }
    });
  }

  async createWorkflow(workflow: object) {
    return this.client.post('/workflows', {
      locationId: this.locationId,
      ...workflow
    });
  }

  async triggerWorkflow(workflowId: string, contactId: string) {
    return this.client.post(`/workflows/${workflowId}/trigger`, { contactId });
  }

  // Campaigns
  async createCampaign(campaignData: {
    name: string;
    type: 'email' | 'sms';
    messages: Array<{
      delay: nuemerging businessr;
      subject?: string;
      content: string;
    }>;
  }) {
    return this.client.post('/campaigns', {
      locationId: this.locationId,
      ...campaignData
    });
  }
}

export const ghlService = new GoHighLevelService();
```

---

## AI WORKFLOW GENERATOR

Create an AI-powered workflow generator that converts plain language to GHL workflows:

```typescript
// lib/ai-workflow-generator.ts

interface WorkflowRequest {
  description: string;
  type: 'email' | 'sms' | 'mixed' | 'nurture';
}

interface GeneratedWorkflow {
  name: string;
  description: string;
  trigger: {
    type: 'manual' | 'form_submission' | 'tag_added' | 'opportunity_created';
    config?: any;
  };
  steps: Array<{
    type: 'email' | 'sms' | 'wait' | 'condition' | 'tag';
    delay?: nuemerging businessr;      // hours
    subject?: string;    // for email
    content: string;
    condition?: string;
    tags?: string[];
  }>;
}

export class AIWorkflowGenerator {
  private openAIKey: string;

  constructor() {
    this.openAIKey = process.env.OPENAI_API_KEY || '';
  }

  async generateWorkflow(request: WorkflowRequest): Promise<GeneratedWorkflow> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating marketing automation workflows for GoHighLevel. 
            Convert user descriptions into structured workflows with emails, SMS, delays, and conditions.
            Always return valid JSON. Include personalization tokens like {{contact.first_name}}.`
          },
          {
            role: 'user',
            content: `Create a ${request.type} workflow: "${request.description}"`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  // Template-based generation
  async generateFromTemplate(template: string, customization: string): Promise<GeneratedWorkflow> {
    const templates: Record<string, string> = {
      'welcome': 'Create a welcome series for new contacts with 3 emails over 5 days',
      'abandoned_cart': 'Create an abandoned cart recovery sequence with 3 reminders',
      'event_reminder': 'Create an event reminder sequence with confirmations and follow-ups',
      'lead_nurture': 'Create a 7-day lead nurturing sequence',
      'onboarding': 'Create an onboarding sequence for new customers',
      're_engagement': 'Create a re-engagement campaign for inactive contacts'
    };

    const description = customization 
      ? `${templates[template]}. Additional: ${customization}`
      : templates[template];

    return this.generateWorkflow({ description, type: 'mixed' });
  }
}

export const aiWorkflowGenerator = new AIWorkflowGenerator();
```

---

## REACT COMPONENTS TO BUILD

### 1. GoHighLevelIntegration Component (Main Admin Interface)
A tabbed interface with:
- **Integrations Tab**: CRUD for GHL integrations, connection testing, sync triggers
- **Conversations Tab**: View and respond to GHL conversations
- **Import Workflows Tab**: Import existing GHL workflows, convert to plain language

### 2. AIWorkflowBuilder Component
Features:
- Template selection (welcome, abandoned cart, event reminder, etc.)
- Free-form description input
- Workflow type selector (email, SMS, mixed)
- Example prompts for inspiration
- Generated workflow preview with step-by-step visualization
- "Deploy to GoHighLevel" button

### 3. WorkflowBuilder Component (Optional)
Visual drag-and-drop workflow builder for manual workflow creation.

---

## ADMIN NAVIGATION INTEGRATION

Add to your admin sidebar:
```typescript
{
  title: 'GoHighLevel',
  icon: 'fa-plug',
  href: '/admin?tab=gohighlevel',
  children: [
    { title: 'Integrations', href: '/admin?tab=gohighlevel&section=integrations' },
    { title: 'Workflows', href: '/admin?tab=gohighlevel&section=workflows' },
    { title: 'AI Builder', href: '/admin?tab=gohighlevel&section=ai-builder' }
  ]
}
```

---

## KEY IMPLEMENTATION NOTES

### 1. Dynamic Imports for Build Safety
All Firebase and external service imports should use dynamic imports to prevent Vercel build errors:

```typescript
const { db } = await import('../lib/firebase').catch(() => ({ db: null }));

if (!db) {
  return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
}
```

### 2. Date Serialization
Always convert Firestore Timestamps to ISO strings before sending to frontend:

```typescript
const data = doc.data();
return {
  ...data,
  createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
  updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
};
```

### 3. GHL API Version Header
Always include the version header in GHL API requests:
```typescript
headers: {
  'Authorization': `Bearer ${apiToken}`,
  'Version': '2021-07-28',
  'Content-Type': 'application/json'
}
```

### 4. Rate Limiting
GHL has rate limits. Track `rateLimitRemaining` and `rateLimitReset` from response headers and implement backoff.

### 5. Error Handling
Return empty arrays instead of errors for list endpoints to prevent UI crashes:
```typescript
catch (error) {
  return NextResponse.json({ success: true, workflows: [] });
}
```

### 6. API Token Security
In production, encrypt API tokens before storing in database. The current implementation stores them as plain text for development.

---

## INTEGRATION POINTS WITH YOUR APPLICATION

Adapt these integration points to your specific application:

1. **Contact Sync**: Map your user/customer model to GHL contacts
2. **Registration Events**: Trigger GHL workflows on user registration
3. **Payment Events**: Create opportunities on successful payments
4. **Tag Management**: Apply tags based on user actions/status
5. **SMS/Email Triggers**: Use GHL for transactional messaging

---

## TESTING CHECKLIST

- [ ] Create integration with valid GHL credentials
- [ ] Test connection returns location name
- [ ] Sync contacts creates/updates in GHL
- [ ] Import workflows fetches from GHL
- [ ] Convert workflow generates plain language description
- [ ] AI workflow builder generates valid workflow structure
- [ ] Deploy workflow creates in GHL
- [ ] Sync logs record all operations
- [ ] Error handling gracefully degrades

---

## REFERENCE FILES FROM SOURCE PROJECT

For complete implementation details, reference these files:
- `lib/gohighlevel-service.ts` - GHL API wrapper
- `lib/ai-workflow-generator.ts` - AI workflow generation
- `lib/firestore-schema.ts` - Database interfaces (lines 2061-2148)
- `components/GoHighLevelIntegration.tsx` - Main admin UI
- `components/AIWorkflowBuilder.tsx` - AI workflow builder UI
- `app/api/gohighlevel/*` - Integration management endpoints
- `app/api/ghl/*` - Workflow management endpoints

---

*Generated from All Pro Sports NC platform - Deceemerging businessr 2024*
