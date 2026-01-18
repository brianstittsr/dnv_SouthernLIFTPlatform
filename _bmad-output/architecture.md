---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - '_bmad-output/prd.md'
workflowType: 'architecture'
lastStep: 5
workflowStatus: 'complete'
completedDate: '2026-01-17'
project_name: 'svp-platform'
user_name: 'Buyer'
date: '2026-01-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The platform centers on 64 functional requirements across 8 capability areas, with the core workflow being the "Proof Pack + Warm Introductions" model:

1. **Proof Pack Management** (FR1-FR12): Document-centric workflow where SMEs create compliance documentation packages, submit for QA review, and achieve Pack Health scores ≥70 to become intro-eligible. Includes gap analysis, remediation tracking, and secure sharing with NDA gating.

2. **Lead & CRM Management** (FR13-FR20): Automated lead capture and routing to appropriate consortium partners based on vertical expertise, with service overlap detection and pipeline stage tracking (new → contacted → qualified → converted).

3. **Buyer Matching & Introductions** (FR21-FR28): Gated directory of vetted SMEs (Pack Health ≥70 only) with introduction request workflow, meeting scheduling integration, and conversion tracking through intro → meeting → RFQ → award stages.

4. **Revenue Attribution & Financial Management** (FR29-FR36): Complex revenue share model with 10% platform fee, automated attribution tracking across lead source/service delivery/introductions, subscription tier management (4 tiers: Free, DIY $99, DWY $299, DFY $599), and partial payment support.

5. **CMMC Cohort Management** (FR37-FR44): 12-week training program with curriculum scheduling, automated module release, assessment grading, progress tracking, and certificate generation.

6. **Content & Marketing Management** (FR45-FR51): Content wizard with templates, multi-channel scheduling, co-branding for consortium partners, analytics, and media library.

7. **Event Management** (FR52-FR57): Event creation, registration with payment, attendance tracking, and sponsorship management.

8. **Platform Administration** (FR58-FR64): User account management, role assignment, system health monitoring, audit logs, configuration management, and automated alerting.

**Non-Functional Requirements:**

**Performance:**
- API response time <500ms (95th percentile)
- Support 1,000+ concurrent users
- Handle 10,000+ Proof Pack documents
- Process 500+ events per year
- Manage 100+ CMMC cohorts simultaneously

**Security & Compliance:**
- CMMC Level 1 compliance (CUI handling)
- AES-256 encryption at rest for all documents
- TLS 1.3 encryption in transit
- Complete audit trail for document access and user activities
- NDA acceptance workflow before Proof Pack viewing
- Section 508 accessibility (WCAG 2.1 AA)
- GDPR-compliant data handling

**Reliability:**
- 99.9% uptime SLA
- Automated failover for critical services
- Database replication and backups
- CDN for static assets and documents
- Load balancing across multiple servers

**Scalability:**
- Background job processing for heavy operations (Pack Health scoring, email sending)
- Lazy loading for large document lists
- Pagination (50 items per page)
- Caching for frequently accessed data
- Image optimization and compression

**Scale & Complexity:**

- **Primary domain:** Full-stack web application (Next.js/React frontend, Node.js backend, Firestore database)
- **Complexity level:** Enterprise - High-complexity SaaS B2B platform with government compliance
- **Estimated architectural components:** 15-20 major components
  - Multi-tenant data isolation layer
  - RBAC authorization system
  - Proof Pack document management system
  - Pack Health scoring engine
  - Lead routing and CRM system
  - Revenue attribution and calculation engine
  - QA review workflow system
  - Buyer matching and introduction system
  - CMMC cohort and curriculum management
  - Event management system
  - Content management and marketing wizard
  - Payment processing and subscription management
  - Integration orchestration layer (5+ external services)
  - Audit logging and compliance reporting
  - Background job processing system

### Technical Constraints & Dependencies

**Existing Technology Stack:**
- **Frontend:** Next.js 16.0.7, React, shadcn/ui components, TailwindCSS
- **Backend:** Next.js API routes, Node.js
- **Database:** Firestore (existing collections: Transactions, PaymentPlans, Tickets, PromoCodes)
- **Hosting:** Vercel deployment
- **Payments:** Stripe integration (partial payment system already implemented)

**Required Integrations:**
- Stripe (subscription billing, event tickets, partial payments, revenue share calculations)
- Go High Level (marketing automation, email sequences, SMS campaigns, lead scoring)
- Calendly (meeting scheduling, calendar sync, automated reminders)
- Google Analytics 4 / Mixpanel (conversion funnel tracking, user behavior, A/B testing)
- Transactional Email Service (welcome emails, notifications, receipts, alerts)

**Future Integrations (Post-MVP):**
- SAM.gov API (government contractor verification)
- LinkedIn API (company profile enrichment)
- DocuSign (NDA and contract signing)
- Zoom (virtual event hosting)
- Slack (consortium partner communication)

**Data Migration Requirements:**
- Import 477 existing SME clients from JotForm/spreadsheets
- Migrate kdm-assoc.com website content and media
- Preserve SEO with 301 redirects
- Historical event data import

**Deployment Constraints:**
- US-based hosting required for government compliance
- Must support phased rollout (Phase 0-4 over 52 weeks)
- Zero-downtime deployment capability needed

### Cross-Cutting Concerns Identified

**1. Multi-Tenancy & Data Isolation**
- Hierarchical 3-tier tenancy (Partners → SMEs → Buyers)
- Vertical isolation (partners cannot see other verticals' SMEs)
- SME data isolation by default
- Buyer access limited to vetted SMEs only (Pack Health ≥70)
- Platform admin cross-tenant visibility with audit logging

**2. Role-Based Access Control (RBAC)**
- 7 distinct roles with granular permissions
- Permission matrix spans 7 functional areas (Proof Packs, Leads, Revenue, Events, Cohorts, Content, System)
- Role-based UI rendering and API authorization
- Cannot impersonate users (view-only for admin support)

**3. Document Management & Security**
- Secure document storage with access logging
- Document expiration tracking and automated flagging
- NDA acceptance workflow before viewing
- Document categorization within Proof Packs
- Media library with upload and organization

**4. Audit Logging & Compliance**
- Complete audit trail for all document access
- Revenue share calculation transparency
- Lead routing decision logging
- User activity tracking
- Quarterly compliance reports for consortium partners

**5. Background Job Processing**
- Pack Health score calculation (complex algorithm)
- Automated email sending (welcome, notifications, reminders, receipts)
- Lead routing automation
- Revenue attribution calculations
- Document expiration checks
- Payment reminder scheduling

**6. Real-Time Coordination**
- Service overlap detection when multiple partners assigned to same SME
- Automated lead routing based on vertical expertise
- Revenue attribution tracking across multiple touchpoints
- QA review queue management
- Conversion stage tracking (intro → meeting → RFQ → award)

**7. Payment Processing & Subscription Management**
- Subscription billing for 4 SME tiers
- Partial payment support with installment tracking
- Payment failure handling and retry logic
- Revenue share calculations (10% platform fee)
- Invoice generation and payment history
- Event ticket sales and cohort enrollment fees

**8. Integration Orchestration**
- Webhook handling for Stripe events
- Bidirectional contact sync with Go High Level
- Calendly widget embedding and calendar sync
- Analytics event tracking (GA4/Mixpanel)
- Email service API calls for transactional emails

## Existing Technology Stack (Extension Approach)

### Project Context

**This is NOT a greenfield project.** The svp-platform is an existing Next.js application that requires architectural expansion to support new features (Proof Pack system, CRM, CMMC cohorts, buyer matching, revenue attribution).

**Approach:** Extend existing architecture rather than start from scratch.

### Current Technology Decisions

**Frontend Framework: Next.js 16.0.7 with App Router**

**Rationale:** Already established with App Router architecture providing:
- File-based routing with route groups `(marketing)` and `(portal)`
- Server Components by default for performance
- API routes co-located with application code
- Built-in image optimization and SEO features
- Vercel deployment optimization

**UI Component Library: shadcn/ui (Radix UI + TailwindCSS)**

**Rationale:** Already integrated with 62 components built on:
- Radix UI primitives (accessible, unstyled components)
- TailwindCSS 4 for styling
- Class Variance Authority for component variants
- Lucide React for icons
- Provides: Dialog, Dropdown, Tabs, Tables, Forms, Accordion, Avatar, Progress, Tooltip, etc.

**Database: Firebase Firestore**

**Rationale:** Already implemented with:
- Comprehensive schema in `lib/schema.ts` (2046 lines)
- Existing collections: Users, Organizations, Opportunities, Projects, Meetings, ActionItems, Rocks, Transactions, PaymentPlans, Tickets, PromoCodes
- Timestamp handling utilities
- Collection references and type safety
- Firestore rules configured (22KB rules file)
- Firestore indexes defined (9.7KB index file)

**State Management: Multiple Strategies**

**Rationale:** Hybrid approach already in use:
- **TanStack Query** (React Query 5.90.12) - Server state, caching, data fetching
- **Zustand** (5.0.9) - Client-side global state
- **React Context** - Authentication and theme state
- **React Hook Form** (7.68.0) - Form state with Zod validation

**Payment Processing: Stripe**

**Rationale:** Already integrated with:
- Stripe SDK 20.1.0 (backend) + @stripe/stripe-js 8.6.0 (frontend)
- Partial payment system implemented
- Webhook handling for payment events
- Subscription billing infrastructure
- Payment plan tracking in Firestore

**Email Services: Dual Provider**

**Rationale:** Already configured:
- **SendGrid** 8.1.6 - Transactional emails
- **Resend** 6.6.0 - Alternative email provider
- Email templates in `lib/email.ts` (14.4KB)

**External Integrations Already Implemented:**
- **Go High Level** - Marketing automation (`lib/gohighlevel-service.ts`, 18KB)
- **Mailchimp** - Email marketing (`lib/mailchimp.ts`, 9.4KB)
- **Microsoft Graph** - Calendar integration (`lib/microsoft-graph.ts`, 21.6KB)
- **Calendly** - Meeting scheduling (`lib/calendar-integration.ts`, 11.7KB)
- **OpenAI** - AI workflow generation (`lib/ai-workflow-generator.ts`, 18KB)

**Development Tools:**
- TypeScript 5 with strict mode
- ESLint 9 with Next.js config
- PostCSS with TailwindCSS
- React DevTools support

**Deployment Infrastructure:**
- Vercel hosting (configured in `vercel.json`)
- Firebase backend services
- Security headers (X-Frame-Options, CSP, etc.)
- Image optimization (AVIF, WebP formats)
- Static asset caching (31536000s)
- SEO metadata and sitemaps

### Existing Project Structure

```
svp-platform/
├── app/
│   ├── (marketing)/          # Public pages (21 items)
│   ├── (portal)/              # Authenticated pages (68 items)
│   ├── api/                   # API routes (56 endpoints)
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/                # UI components (62 components)
├── lib/                       # Business logic (40+ files)
│   ├── schema.ts              # Firestore schema (2046 lines)
│   ├── firebase.ts            # Firebase config
│   ├── stripe.ts              # Stripe integration
│   ├── email.ts               # Email templates
│   ├── gohighlevel-service.ts # Marketing automation
│   ├── calendar-integration.ts # Calendly integration
│   └── [other services]
├── contexts/                  # React contexts
├── hooks/                     # Custom hooks
├── types/                     # TypeScript types
├── public/                    # Static assets (78 items)
├── content/                   # Content files (12 items)
└── docs/                      # Documentation (29 items)
```

### Architecture Extension Strategy

**New Features to Add:**
1. **Proof Pack Management System** - New Firestore collections, document upload, Pack Health scoring
2. **Lead & CRM System** - Lead routing, vertical assignment, service overlap detection
3. **Buyer Matching & Introductions** - Gated directory, introduction workflow, conversion tracking
4. **Revenue Attribution Engine** - Multi-stakeholder tracking, automated calculations
5. **CMMC Cohort Management** - 12-week program, curriculum scheduling, progress tracking
6. **Content & Marketing Wizard** - Template system, multi-channel scheduling
7. **Event Management** - Registration, payment, attendance tracking
8. **Enhanced Admin Dashboard** - System monitoring, audit logs, configuration

**Integration Points with Existing Code:**
- Extend `lib/schema.ts` with new Firestore collections (ProofPacks, Leads, Introductions, Cohorts, etc.)
- Add new API routes in `app/api/` for new features
- Create new portal pages in `app/(portal)/` for new functionality
- Reuse existing Stripe integration for new subscription tiers
- Leverage existing email service for new notification types
- Extend existing auth context for new role-based permissions

**No Starter Template Needed:** The existing Next.js architecture provides all necessary foundations. New features will be built as extensions to the current codebase.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Document storage strategy (base64 in Firestore)
- Multi-tenant data isolation (hybrid approach)
- RBAC implementation (custom claims + Firestore)
- Background job infrastructure (Vercel cron + Firebase Functions)
- Pack Health scoring algorithm (server-side with caching)

**Important Decisions (Shape Architecture):**
- API route organization (feature-based)
- Real-time updates (Firestore listeners)
- Lead routing algorithm (configuration-driven)
- Revenue attribution tracking (event-based + aggregated)

**Deferred Decisions (Post-MVP):**
- Advanced error tracking (Sentry) - start with Vercel logs
- Comprehensive test coverage - start with pragmatic testing

### Data Architecture

**Decision 1.1: Firestore Collection Design**
- **Approach:** Extend existing schema patterns with new collections
- **New Collections:** ProofPacks, Leads, Introductions, Cohorts, Content, RevenueAttribution, RoutingRules, AttributionEvents
- **Pattern:** Top-level collections with reference IDs (consistent with existing 11 collections)
- **Rationale:** Maintains consistency with existing codebase, easier for AI agents to understand

**Decision 1.2: Document Storage Strategy**
- **Approach:** Base64-encoded binary files stored directly in Firestore documents
- **Implementation:** 
  - Fields: `fileData` (base64 string), `fileName`, `mimeType`, `fileSize`
  - Document size limit: 1MB per Firestore document
  - Chunking strategy for files >1MB (split into multiple documents with references)
  - Compression before base64 encoding for larger files
- **Rationale:** Single database for all data, simplified backup/restore, no separate storage service costs
- **Trade-offs:** Document size limits require chunking, but acceptable for compliance documents

### Authentication & Security

**Decision 2.1: Multi-Tenant Data Isolation**
- **Approach:** Hybrid - Top-level collections with tenant fields + Firestore Rules
- **Implementation:**
  - Add `tenantId`, `partnerId`, `smeId` fields to all new collections
  - Firestore security rules enforce data isolation at database level
  - Application-level filtering in queries for additional safety
  - Admin queries can access cross-tenant data with audit logging
- **Rationale:** Enables admin dashboards and revenue attribution across tenants while maintaining security
- **Isolation Rules:**
  - SMEs can only access their own data
  - Partners can only access SMEs assigned to their vertical
  - Buyers can only access vetted SMEs (Pack Health ≥70)
  - Platform admins have cross-tenant visibility with audit trail

**Decision 2.2: RBAC Implementation**
- **Approach:** Hybrid - Firebase Auth Custom Claims + Firestore permissions
- **Implementation:**
  - Primary role stored in Firebase Auth custom claims (fast authorization checks)
  - Detailed permissions matrix stored in Firestore `users` collection
  - API routes check custom claims first, then Firestore for complex permissions
  - Support for partner-specific SME assignments and vertical isolation
- **7 Roles:** SME User, Consortium Partner, QA Reviewer, Buyer, CMMC Instructor, Marketing Staff, Platform Admin
- **Rationale:** Fast role checks via custom claims, flexible permission management via Firestore

### Background Job Processing

**Decision 3.1: Background Job Infrastructure**
- **Approach:** Hybrid - Vercel Cron Jobs + Firebase Cloud Functions
- **Implementation:**
  - Vercel cron jobs (in `vercel.json`) trigger Firebase Cloud Functions for heavy processing
  - Vercel handles scheduling reliability (10-second execution limit)
  - Firebase Functions handle complex calculations (9-minute execution limit)
- **Use Cases:**
  - Pack Health score calculation (complex algorithm, triggered by document changes)
  - Automated lead routing (triggered by new lead creation)
  - Revenue attribution calculations (triggered by conversion events)
  - Email sending (reminders, notifications, receipts)
  - Document expiration checks (daily cron)
  - Payment reminder scheduling (daily cron)
- **Rationale:** Leverages existing Vercel + Firebase architecture, supports long-running calculations

### API Architecture

**Decision 4.1: API Route Organization**
- **Approach:** Feature-based organization
- **Structure:**
  - `/api/proofpacks/` - Proof Pack management endpoints
  - `/api/leads/` - Lead capture and routing endpoints
  - `/api/introductions/` - Buyer-SME matching endpoints
  - `/api/cohorts/` - CMMC training program endpoints
  - `/api/revenue/` - Revenue attribution endpoints
  - `/api/content/` - Marketing wizard endpoints
- **Rationale:** Clear separation of concerns, easy navigation for AI agents, consistent with existing 56 API routes

**Decision 4.2: API Error Handling**
- **Standard Response Format:**
  ```typescript
  { success: boolean, data?: any, error?: string, code?: string }
  ```
- **HTTP Status Codes:** 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)
- **Error Logging:** Console.error for critical errors, structured error objects

### Real-Time Features

**Decision 5.1: Real-Time Updates Strategy**
- **Approach:** Firestore Real-time Listeners
- **Implementation:**
  - Client subscribes to document/collection changes using Firestore `onSnapshot`
  - Automatic updates when data changes (no polling needed)
  - TanStack Query integration for cache invalidation
- **Use Cases:**
  - QA review queue updates (real-time queue status)
  - Service overlap detection alerts (instant notifications)
  - Revenue attribution tracking (live dashboard updates)
  - Lead routing notifications (immediate assignment alerts)
- **Rationale:** Built-in to Firestore, no additional infrastructure, perfect for dashboard requirements

### Business Logic Architecture

**Decision 6.1: Pack Health Scoring Algorithm**
- **Approach:** Hybrid - Server-side calculation with Firestore caching
- **Implementation:**
  - Firebase Cloud Function calculates Pack Health score (0-100 scale)
  - Score cached in `packHealthScore` field in ProofPacks document
  - Recalculate on document changes (Firestore trigger)
  - Background job recalculates all scores daily (data consistency)
  - Client displays cached value (fast performance)
- **Scoring Factors:**
  - Document completeness (required documents present)
  - Document expiration status (no expired documents)
  - Document quality (QA review feedback)
  - Gap remediation progress (improvement over time)
- **Rationale:** Ensures consistency across all users, secure business logic, performant display

**Decision 7.1: Lead Routing Algorithm**
- **Approach:** Configuration-driven routing
- **Implementation:**
  - Routing rules stored in Firestore `routingRules` collection
  - Rules based on: industry, service type, vertical expertise, partner capacity
  - Admin UI for modifying rules without code deployments
  - Fallback to manual assignment if no rules match
  - Audit log for all routing decisions
- **Rule Structure:**
  ```typescript
  {
    id: string,
    priority: number,
    conditions: { industry?: string[], serviceType?: string[] },
    partnerId: string,
    active: boolean
  }
  ```
- **Rationale:** Flexible, admin-configurable, no code deployments for rule changes

**Decision 7.2: Revenue Attribution Tracking**
- **Approach:** Hybrid - Event-based logging + Aggregated summaries
- **Implementation:**
  - `attributionEvents` collection logs every touchpoint (full audit trail)
  - `revenueAttribution` documents maintain aggregated summaries (fast queries)
  - Events capture: lead source, service delivery, introduction facilitation
  - Automated 10% platform fee calculation
  - Quarterly settlement reports generated from events
- **Event Types:**
  - `lead_generated` - Lead source attribution
  - `service_delivered` - Partner service attribution
  - `introduction_facilitated` - Warm introduction attribution
  - `conversion_completed` - Contract award attribution
- **Rationale:** Auditability for compliance + performance for dashboards

### Infrastructure & Deployment

**Decision 8.1: Error Handling & Logging**
- **Approach:** Start with Vercel logs, plan for Sentry in Phase 2
- **MVP Implementation:**
  - Vercel logs (built-in, free, 1-day retention on Hobby plan)
  - Console.error for critical errors
  - Console.log for debugging
  - Structured error responses from API routes
- **Phase 2 Enhancement:**
  - Add Sentry for advanced error tracking
  - User session replay
  - Performance monitoring
- **Rationale:** Fast MVP launch, upgrade when budget allows

**Decision 8.2: Testing Strategy**
- **Approach:** Pragmatic testing - critical paths only
- **Unit Tests (Jest):**
  - Pack Health scoring algorithm
  - Revenue attribution calculations
  - Lead routing logic
  - Subscription tier validation
- **E2E Tests (Playwright):**
  - SME onboarding flow
  - Payment processing (Stripe integration)
  - Proof Pack submission and QA review
  - Buyer introduction request
- **Manual QA:**
  - UI/UX features
  - Dashboard visualizations
  - Email templates
- **Rationale:** Balance development speed with quality, add more tests as features stabilize

### Decision Impact Analysis

**Implementation Sequence:**
1. **Phase 0 (Foundation):** Extend Firestore schema, add new collections, implement RBAC
2. **Phase 1 (Core Features):** Proof Pack management, Pack Health scoring, document storage
3. **Phase 2 (CRM & Routing):** Lead capture, automated routing, service overlap detection
4. **Phase 3 (Matching & Revenue):** Buyer matching, introductions, revenue attribution
5. **Phase 4 (Advanced Features):** CMMC cohorts, marketing wizard, enhanced analytics

**Cross-Component Dependencies:**
- RBAC implementation affects all API routes and UI components
- Pack Health scoring depends on document storage and background jobs
- Revenue attribution depends on lead routing and introduction tracking
- Real-time updates depend on Firestore listeners across all features

## Implementation Patterns & Consistency Rules

### Pattern Analysis from Existing Codebase

Based on analysis of your existing Next.js application, the following patterns are already established and must be followed by all AI agents implementing new features.

### Naming Conventions

**Database/Firestore Naming:**
- **Collections:** PascalCase singular (e.g., `COLLECTIONS.EVENTS`, `COLLECTIONS.USERS`)
- **Collection constants:** SCREAMING_SNAKE_CASE in `lib/schema.ts` (e.g., `COLLECTIONS.PROOF_PACKS`)
- **Document interfaces:** PascalCase with `Doc` suffix (e.g., `EventDoc`, `ProofPackDoc`)
- **Field names:** camelCase (e.g., `userId`, `createdAt`, `packHealthScore`)
- **Reference fields:** camelCase with `Id` suffix (e.g., `ownerId`, `partnerId`, `smeId`)
- **Timestamp fields:** Use Firebase `Timestamp` type, not JavaScript `Date`

**API Route Naming:**
- **Endpoint structure:** Feature-based folders (e.g., `/api/events/`, `/api/proofpacks/`)
- **Route files:** `route.ts` for API endpoints
- **HTTP methods:** Export async functions named after HTTP methods (e.g., `export async function GET()`, `export async function POST()`)
- **Query parameters:** camelCase (e.g., `?status=active&category=training`)
- **Path parameters:** Folder-based dynamic routes (e.g., `/api/events/[id]/route.ts`)

**Component & File Naming:**
- **Components:** PascalCase (e.g., `EventCard`, `ProofPackManager`)
- **Component files:** PascalCase with `.tsx` extension (e.g., `EventCard.tsx`)
- **Utility files:** kebab-case (e.g., `pack-health-calculator.ts`, `lead-router.ts`)
- **Service files:** kebab-case (e.g., `gohighlevel-service.ts`, `payments-service.ts`)
- **Hook files:** camelCase with `use` prefix (e.g., `useAuth.ts`, `useProofPack.ts`)

**Code Naming:**
- **Functions:** camelCase (e.g., `calculatePackHealth`, `routeLead`)
- **Variables:** camelCase (e.g., `packHealthScore`, `leadRoutingRules`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `PACK_HEALTH_THRESHOLD`)
- **Types/Interfaces:** PascalCase (e.g., `ProofPackDoc`, `LeadRoutingRule`)
- **Enums:** PascalCase for enum name, SCREAMING_SNAKE_CASE for values

### Project Structure Patterns

**Directory Organization:**
- **API routes:** `/app/api/{feature}/route.ts` (feature-based folders)
- **Page routes:** `/app/(portal)/portal/{feature}/page.tsx` for authenticated pages
- **Marketing pages:** `/app/(marketing)/{page}/page.tsx` for public pages
- **Components:** `/components/{feature}/{ComponentName}.tsx` (organized by feature)
- **UI components:** `/components/ui/{component-name}.tsx` (shadcn/ui components)
- **Business logic:** `/lib/{service-name}.ts` (services and utilities)
- **Database schema:** `/lib/schema.ts` (all Firestore types and collections)
- **Types:** `/types/index.ts` (application-wide TypeScript types)
- **Contexts:** `/contexts/{ContextName}.tsx` (React context providers)
- **Hooks:** `/hooks/{hookName}.ts` (custom React hooks)

**Test Organization:**
- **Unit tests:** Co-located with source files as `{filename}.test.ts`
- **E2E tests:** `/tests/e2e/{feature}.spec.ts`
- **Test utilities:** `/tests/utils/` (shared test helpers)

### API Response Patterns

**Standard Response Format:**
```typescript
// Success response
{
  success: true,
  data: any
}

// Error response
{
  success: false,
  error: string,
  code?: string
}
```

**HTTP Status Codes:**
- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

**Error Handling Pattern:**
```typescript
try {
  // API logic
  return NextResponse.json({ success: true, data: result });
} catch (error: unknown) {
  console.error('Error in API:', error);
  return NextResponse.json(
    { success: false, error: 'Error message' },
    { status: 500 }
  );
}
```

### Database Patterns

**Firestore Document Structure:**
```typescript
interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// All documents extend BaseDocument
interface ProofPackDoc extends BaseDocument {
  smeId: string;
  partnerId: string;
  tenantId: string;
  packHealthScore: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  // ... other fields
}
```

**Collection References:**
```typescript
import { COLLECTIONS } from '@/lib/schema';

const proofPacksRef = collection(db, COLLECTIONS.PROOF_PACKS);
const proofPackDoc = doc(db, COLLECTIONS.PROOF_PACKS, packId);
```

**Query Patterns:**
```typescript
// Always check if db exists
if (!db) {
  return NextResponse.json(
    { error: 'Database not initialized' },
    { status: 500 }
  );
}

// Build queries with constraints array
const constraints: any[] = [];
if (status) {
  constraints.push(where('status', '==', status));
}
constraints.push(orderBy('createdAt', 'desc'));

const q = query(collectionRef, ...constraints);
const snapshot = await getDocs(q);
```

### Component Patterns

**React Component Structure:**
```typescript
'use client'; // Only if client component needed

import { useState, useEffect } from 'react';
import { ComponentProps } from '@/types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<Type>(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
}
```

**Styling Pattern:**
- Use TailwindCSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui component patterns for consistency

### State Management Patterns

**TanStack Query (Server State):**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Queries
const { data, isLoading, error } = useQuery({
  queryKey: ['proofpacks', smeId],
  queryFn: () => fetchProofPacks(smeId),
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => createProofPack(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['proofpacks'] });
  },
});
```

**Zustand (Client State):**
```typescript
import { create } from 'zustand';

interface StoreState {
  value: Type;
  setValue: (value: Type) => void;
}

export const useStore = create<StoreState>((set) => ({
  value: initialValue,
  setValue: (value) => set({ value }),
}));
```

**React Context (Auth/Theme):**
```typescript
'use client';

import { createContext, useContext, useState } from 'react';

const Context = createContext<ContextType | undefined>(undefined);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Type>(initialValue);
  
  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  );
}

export const useContextHook = () => {
  const context = useContext(Context);
  if (!context) throw new Error('useContextHook must be used within ContextProvider');
  return context;
};
```

### Firebase Cloud Functions Patterns

**Function Structure:**
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const functionName = functions.firestore
  .document('collection/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    try {
      // Function logic
      await admin.firestore().collection('collection').doc('id').update({
        field: value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error in function:', error);
      throw error;
    }
  });
```

**Scheduled Functions (Cron):**
```typescript
export const scheduledFunction = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('America/New_York')
  .onRun(async (context) => {
    // Scheduled logic
  });
```

### Authentication & Authorization Patterns

**API Route Authorization:**
```typescript
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  // Get auth token from header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify token and get custom claims
    const decodedToken = await auth.verifyIdToken(token);
    const { role, partnerId, smeId } = decodedToken;
    
    // Check role authorization
    if (!['admin', 'partner'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Proceed with authorized logic
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

**Client-Side Auth Check:**
```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

export function ProtectedComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) redirect('/sign-in');
  
  return <div>Protected content</div>;
}
```

### Data Validation Patterns

**Zod Schema Validation:**
```typescript
import { z } from 'zod';

const ProofPackSchema = z.object({
  smeId: z.string().min(1),
  title: z.string().min(1).max(200),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']),
  documents: z.array(z.object({
    fileName: z.string(),
    fileData: z.string(), // base64
    mimeType: z.string(),
    fileSize: z.number().max(1048576), // 1MB limit
  })),
});

// In API route
const validationResult = ProofPackSchema.safeParse(requestData);
if (!validationResult.success) {
  return NextResponse.json(
    { success: false, error: validationResult.error.message },
    { status: 400 }
  );
}
```

### Logging & Error Handling Patterns

**Structured Logging:**
```typescript
// Error logging
console.error('[API Error]', {
  endpoint: '/api/proofpacks',
  error: error.message,
  userId: user?.id,
  timestamp: new Date().toISOString(),
});

// Info logging
console.log('[API Info]', {
  action: 'create_proofpack',
  userId: user.id,
  packId: newPack.id,
});
```

**Error Boundaries (React):**
```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### Critical Consistency Rules for AI Agents

**MUST FOLLOW:**
1. **Always check `if (!db)` before Firestore operations**
2. **Use `Timestamp` from Firebase, never JavaScript `Date` in Firestore documents**
3. **Add `tenantId`, `partnerId`, `smeId` fields to all multi-tenant collections**
4. **Export HTTP method functions (GET, POST, PUT, DELETE) from API route files**
5. **Use `'use client'` directive only when necessary (hooks, browser APIs, interactivity)**
6. **Import from `@/` alias, not relative paths (e.g., `@/lib/firebase`, not `../../../lib/firebase`)**
7. **Wrap async operations in try-catch with proper error responses**
8. **Use `NextResponse.json()` for all API responses**
9. **Validate input with Zod schemas before processing**
10. **Update `updatedAt` timestamp on all document updates**
11. **Use TanStack Query for server state, Zustand for client state**
12. **Follow existing naming conventions exactly (camelCase fields, PascalCase components)**
13. **Organize imports: React → Next.js → Third-party → Local (`@/`)**
14. **Use shadcn/ui components from `/components/ui/` for consistency**
15. **Base64 encode binary files before storing in Firestore**

### Implementation Sequence for New Features

**Step 1: Define Schema**
- Add collection constant to `COLLECTIONS` in `lib/schema.ts`
- Define TypeScript interface extending `BaseDocument`
- Add tenant isolation fields (`tenantId`, `partnerId`, `smeId`)

**Step 2: Create API Routes**
- Create feature folder in `/app/api/{feature}/`
- Implement `route.ts` with GET, POST, PUT, DELETE as needed
- Add authorization checks and input validation
- Follow standard response format

**Step 3: Create Components**
- Create feature folder in `/components/{feature}/`
- Build components using shadcn/ui primitives
- Use TanStack Query for data fetching
- Follow existing component patterns

**Step 4: Add Pages**
- Create page in `/app/(portal)/portal/{feature}/page.tsx`
- Add authentication checks
- Integrate components and API calls

**Step 5: Update Firestore Rules**
- Add security rules for new collections in `firestore.rules`
- Enforce tenant isolation at database level

**Step 6: Add Tests**
- Unit tests for business logic
- E2E tests for critical user flows

