---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/prd.md'
  - '_bmad-output/architecture.md'
lastStep: 4
workflowStatus: 'complete'
completedDate: '2026-01-17'
project_name: 'svp-platform'
user_name: 'Buyer'
date: '2026-01-17'
totalEpics: 10
totalStories: 66
totalFRsCovered: 64
---

# svp-platform - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for svp-platform, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Proof Pack Management (FR1-FR12):**
- FR1: SME users can create and edit Proof Pack documents in draft state
- FR2: SME users can upload documents to categorize within their Proof Pack
- FR3: SME users can submit Proof Packs for QA review
- FR4: SME users can view their Pack Health score (0-100 scale)
- FR5: SME users can view gap analysis identifying missing or expired documents
- FR6: SME users can track remediation progress toward Pack Health ≥70
- FR7: QA reviewers can access a queue of submitted Proof Packs awaiting review
- FR8: QA reviewers can approve or reject Proof Packs with comments
- FR9: QA reviewers can view Pack Health score calculation breakdown
- FR10: SME users can share published Proof Packs with buyers via secure links
- FR11: Buyers can view Proof Pack contents only after NDA acceptance
- FR12: System can track document expiration dates and flag upcoming expirations

**Lead & CRM Management (FR13-FR20):**
- FR13: System can capture leads from website forms and external sources
- FR14: System can automatically route leads to appropriate consortium partners based on vertical expertise
- FR15: Consortium partners can view all SME clients assigned to their vertical
- FR16: Consortium partners can manage lead assignments within their vertical
- FR17: Consortium partners can log activities and interactions with assigned SMEs
- FR18: System can detect and flag potential service overlaps when multiple partners are assigned to same SME
- FR19: Platform admins can manually override lead routing decisions
- FR20: Users can view lead pipeline stages (new → contacted → qualified → converted)

**Buyer Matching & Introductions (FR21-FR28):**
- FR21: Buyers can browse a directory of intro-eligible SMEs (Pack Health ≥70)
- FR22: Buyers can filter SME directory by industry, certifications, and capabilities
- FR23: Buyers can request warm introductions to specific SMEs
- FR24: System can generate introduction briefs with SME context for buyers
- FR25: SME users can accept or decline introduction requests
- FR26: Users can schedule meetings via integrated calendar system
- FR27: Consortium partners can track conversion stages (intro → meeting → RFQ → award)
- FR28: Buyers can provide feedback on introduction quality and relevance

**Revenue Attribution & Financial Management (FR29-FR36):**
- FR29: System can track revenue attribution by lead source, service delivery, and introductions
- FR30: Consortium partners can view their revenue contributions in real-time
- FR31: System can calculate revenue share distributions automatically
- FR32: Platform admins can configure revenue share percentages and rules
- FR33: SME users can manage subscription tier selection (Free, DIY, DWY, DFY)
- FR34: System can process payments for subscriptions, events, and cohorts
- FR35: Users can view payment history and download invoices
- FR36: System can handle partial payments with installment tracking

**CMMC Cohort Management (FR37-FR44):**
- FR37: CMMC instructors can create and configure cohort programs with curriculum
- FR38: SME users can enroll in CMMC cohorts with payment
- FR39: CMMC instructors can upload curriculum materials for each week
- FR40: System can automatically release curriculum modules based on schedule
- FR41: CMMC instructors can create and grade assessments
- FR42: Participants can track their progress through the 12-week program
- FR43: System can generate completion certificates for participants who pass assessments
- FR44: Participants can participate in cohort discussion boards

**Content & Marketing Management (FR45-FR51):**
- FR45: Marketing staff can create blog posts, landing pages, and social media content
- FR46: Marketing staff can use content wizard templates for common content types
- FR47: Marketing staff can schedule content publication across multiple channels
- FR48: System can apply co-branding for consortium partner content
- FR49: Marketing staff can view content performance analytics
- FR50: Users can browse educational resources and articles
- FR51: System can manage media library with upload and organization capabilities

**Event Management (FR52-FR57):**
- FR52: Consortium partners can create and configure events with registration
- FR53: Users can browse upcoming events and view event details
- FR54: Users can register for events with payment processing
- FR55: System can send event confirmation and reminder emails
- FR56: Consortium partners can track event attendance and engagement metrics
- FR57: System can manage event sponsorships and sponsor visibility

**Platform Administration & Monitoring (FR58-FR64):**
- FR58: Platform admins can create, suspend, and delete user accounts
- FR59: Platform admins can assign roles and permissions to users
- FR60: Platform admins can monitor system health metrics (uptime, response time, errors)
- FR61: Platform admins can view audit logs for all user activities
- FR62: Platform admins can configure system settings (industry mappings, routing rules)
- FR63: Platform admins can investigate and resolve payment disputes
- FR64: System can send automated alerts for performance degradation or errors

### Non-Functional Requirements

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
- Background job processing for heavy operations
- Lazy loading for large document lists
- Pagination (50 items per page)
- Caching for frequently accessed data
- Image optimization and compression

### Additional Requirements from Architecture

**Foundation Requirements:**
- Extend Firestore schema with 8 new collections (ProofPacks, Leads, Introductions, Cohorts, Content, RevenueAttribution, RoutingRules, AttributionEvents)
- Implement hybrid RBAC (Firebase Auth custom claims + Firestore permissions)
- Configure multi-tenant data isolation (tenant fields + Firestore Rules)
- Set up Vercel Cron + Firebase Cloud Functions for background jobs
- Implement base64 document storage with chunking for files >1MB

**Integration Requirements:**
- Extend existing Stripe integration for new subscription tiers
- Leverage existing email service (SendGrid/Resend) for new notification types
- Integrate Firestore real-time listeners for live dashboard updates
- Implement configuration-driven lead routing rules
- Set up event-based revenue attribution logging

**Testing Requirements:**
- Unit tests for Pack Health scoring algorithm
- Unit tests for revenue attribution calculations
- Unit tests for lead routing logic
- E2E tests for SME onboarding flow
- E2E tests for payment processing
- E2E tests for Proof Pack submission and QA review
- E2E tests for buyer introduction request

### FR Coverage Map

**Proof Pack Management:**
- FR1 → Epic 2: SME users can create and edit Proof Pack documents in draft state
- FR2 → Epic 2: SME users can upload documents to categorize within their Proof Pack
- FR3 → Epic 3: SME users can submit Proof Packs for QA review
- FR4 → Epic 2: SME users can view their Pack Health score (0-100 scale)
- FR5 → Epic 2: SME users can view gap analysis identifying missing or expired documents
- FR6 → Epic 2: SME users can track remediation progress toward Pack Health ≥70
- FR7 → Epic 3: QA reviewers can access a queue of submitted Proof Packs awaiting review
- FR8 → Epic 3: QA reviewers can approve or reject Proof Packs with comments
- FR9 → Epic 3: QA reviewers can view Pack Health score calculation breakdown
- FR10 → Epic 4: SME users can share published Proof Packs with buyers via secure links
- FR11 → Epic 4: Buyers can view Proof Pack contents only after NDA acceptance
- FR12 → Epic 2: System can track document expiration dates and flag upcoming expirations

**Lead & CRM Management:**
- FR13 → Epic 5: System can capture leads from website forms and external sources
- FR14 → Epic 5: System can automatically route leads to appropriate consortium partners based on vertical expertise
- FR15 → Epic 5: Consortium partners can view all SME clients assigned to their vertical
- FR16 → Epic 5: Consortium partners can manage lead assignments within their vertical
- FR17 → Epic 5: Consortium partners can log activities and interactions with assigned SMEs
- FR18 → Epic 5: System can detect and flag potential service overlaps when multiple partners are assigned to same SME
- FR19 → Epic 5: Platform admins can manually override lead routing decisions
- FR20 → Epic 5: Users can view lead pipeline stages (new → contacted → qualified → converted)

**Buyer Matching & Introductions:**
- FR21 → Epic 6: Buyers can browse a directory of intro-eligible SMEs (Pack Health ≥70)
- FR22 → Epic 6: Buyers can filter SME directory by industry, certifications, and capabilities
- FR23 → Epic 6: Buyers can request warm introductions to specific SMEs
- FR24 → Epic 6: System can generate introduction briefs with SME context for buyers
- FR25 → Epic 6: SME users can accept or decline introduction requests
- FR26 → Epic 6: Users can schedule meetings via integrated calendar system
- FR27 → Epic 6: Consortium partners can track conversion stages (intro → meeting → RFQ → award)
- FR28 → Epic 6: Buyers can provide feedback on introduction quality and relevance

**Revenue Attribution & Financial Management:**
- FR29 → Epic 7: System can track revenue attribution by lead source, service delivery, and introductions
- FR30 → Epic 7: Consortium partners can view their revenue contributions in real-time
- FR31 → Epic 7: System can calculate revenue share distributions automatically
- FR32 → Epic 7: Platform admins can configure revenue share percentages and rules
- FR33 → Epic 1: SME users can manage subscription tier selection (Free, DIY, DWY, DFY)
- FR34 → Epic 1: System can process payments for subscriptions, events, and cohorts
- FR35 → Epic 1: Users can view payment history and download invoices
- FR36 → Epic 1: System can handle partial payments with installment tracking

**CMMC Cohort Management:**
- FR37 → Epic 8: CMMC instructors can create and configure cohort programs with curriculum
- FR38 → Epic 8: SME users can enroll in CMMC cohorts with payment
- FR39 → Epic 8: CMMC instructors can upload curriculum materials for each week
- FR40 → Epic 8: System can automatically release curriculum modules based on schedule
- FR41 → Epic 8: CMMC instructors can create and grade assessments
- FR42 → Epic 8: Participants can track their progress through the 12-week program
- FR43 → Epic 8: System can generate completion certificates for participants who pass assessments
- FR44 → Epic 8: Participants can participate in cohort discussion boards

**Content & Marketing Management:**
- FR45 → Epic 9: Marketing staff can create blog posts, landing pages, and social media content
- FR46 → Epic 9: Marketing staff can use content wizard templates for common content types
- FR47 → Epic 9: Marketing staff can schedule content publication across multiple channels
- FR48 → Epic 9: System can apply co-branding for consortium partner content
- FR49 → Epic 9: Marketing staff can view content performance analytics
- FR50 → Epic 9: Users can browse educational resources and articles
- FR51 → Epic 9: System can manage media library with upload and organization capabilities

**Event Management:**
- FR52 → Epic 10: Consortium partners can create and configure events with registration
- FR53 → Epic 10: Users can browse upcoming events and view event details
- FR54 → Epic 10: Users can register for events with payment processing
- FR55 → Epic 10: System can send event confirmation and reminder emails
- FR56 → Epic 10: Consortium partners can track event attendance and engagement metrics
- FR57 → Epic 10: System can manage event sponsorships and sponsor visibility

**Platform Administration & Monitoring:**
- FR58 → Epic 0: Platform admins can create, suspend, and delete user accounts
- FR59 → Epic 0: Platform admins can assign roles and permissions to users
- FR60 → Epic 0: Platform admins can monitor system health metrics (uptime, response time, errors)
- FR61 → Epic 0: Platform admins can view audit logs for all user activities
- FR62 → Epic 0: Platform admins can configure system settings (industry mappings, routing rules)
- FR63 → Epic 7: Platform admins can investigate and resolve payment disputes
- FR64 → Epic 0: System can send automated alerts for performance degradation or errors

## Epic List

### Epic 0: Foundation & RBAC Setup
Platform admins can manage users, roles, and system configuration to enable all other platform features. This epic establishes the foundational infrastructure including multi-tenant data isolation, role-based access control, and system monitoring that all other epics depend upon.

**FRs covered:** FR58, FR59, FR60, FR61, FR62, FR64

### Epic 1: SME Onboarding & Profile Management
SME users can register, manage their profiles, and select subscription tiers to access platform features. This epic enables SMEs to join the platform, configure their company information, and choose the appropriate service level (Free, DIY, DWY, DFY) with full payment processing including partial payment support.

**FRs covered:** FR33, FR34, FR35, FR36

### Epic 2: Proof Pack Creation & Management
SME users can create, edit, and manage Proof Pack documents with document uploads and categorization. This epic delivers the core value proposition of transforming scattered compliance documents into organized, scored Proof Packs with Pack Health scoring, gap analysis, and remediation tracking.

**FRs covered:** FR1, FR2, FR4, FR5, FR6, FR12

### Epic 3: QA Review Workflow
SMEs can submit Proof Packs for review, and QA reviewers can approve or reject them with feedback. This epic implements the quality gate that ensures only vetted, high-quality Proof Packs (Pack Health ≥70) become visible to buyers, protecting buyer relationships and maintaining platform credibility.

**FRs covered:** FR3, FR7, FR8, FR9

### Epic 4: Proof Pack Sharing & Buyer Access
SMEs can share published Proof Packs with buyers, and buyers can view them after NDA acceptance. This epic enables the secure sharing of approved Proof Packs with potential buyers while maintaining compliance through NDA workflows and comprehensive audit trails.

**FRs covered:** FR10, FR11

### Epic 5: Lead Capture & Automated Routing
System captures leads and automatically routes them to appropriate consortium partners based on vertical expertise. This epic implements the intelligent lead distribution system that coordinates the 6 consortium partners, prevents service overlaps, and tracks the lead pipeline from capture through conversion.

**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20

### Epic 6: Buyer Directory & Warm Introductions
Buyers can discover vetted SMEs and request warm introductions, while SMEs can accept/decline and schedule meetings. This epic delivers the "warm introductions engine" that connects qualified buyers with intro-eligible SMEs (Pack Health ≥70), facilitates meeting scheduling, and tracks the conversion funnel (intro → meeting → RFQ → award).

**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28

### Epic 7: Revenue Attribution & Financial Tracking
System tracks revenue attribution across multiple touchpoints, and partners can view their contributions in real-time. This epic implements the transparent revenue tracking system that attributes value across lead generation, service delivery, and introductions, automatically calculating the 10% platform fee and generating quarterly settlement reports.

**FRs covered:** FR29, FR30, FR31, FR32, FR63

### Epic 8: CMMC Cohort Management
CMMC instructors can create training programs, and SMEs can enroll, participate, and earn completion certificates. This epic delivers the 12-week CMMC training program with automated curriculum release, assessment grading, progress tracking, discussion boards, and certificate generation.

**FRs covered:** FR37, FR38, FR39, FR40, FR41, FR42, FR43, FR44

### Epic 9: Content & Marketing Management
Marketing staff can create, schedule, and publish content across multiple channels with co-branding support. This epic provides the content creation and distribution system with wizard templates, multi-channel scheduling, co-branding for consortium partners, performance analytics, and media library management.

**FRs covered:** FR45, FR46, FR47, FR48, FR49, FR50, FR51

### Epic 10: Event Management & Sponsorships
Consortium partners can create events with registration and payment, while users can browse, register, and attend events. This epic extends the existing event management infrastructure with full registration workflows, payment processing, email notifications, attendance tracking, and sponsorship management.

**FRs covered:** FR52, FR53, FR54, FR55, FR56, FR57

---

## Epic 0: Foundation & RBAC Setup

Platform admins can manage users, roles, and system configuration to enable all other platform features. This epic establishes the foundational infrastructure including multi-tenant data isolation, role-based access control, and system monitoring that all other epics depend upon.

### Story 0.1: Extend Firestore Schema with New Collections

As a **platform developer**,
I want **to extend the Firestore schema with 8 new collections for the platform features**,
So that **the database structure supports all new functionality**.

**Acceptance Criteria:**

**Given** the existing Firestore schema in `lib/schema.ts`
**When** I extend the schema with new collection constants and document interfaces
**Then** the following collections are added to `COLLECTIONS`: `PROOF_PACKS`, `LEADS`, `INTRODUCTIONS`, `COHORTS`, `CONTENT`, `REVENUE_ATTRIBUTION`, `ROUTING_RULES`, `ATTRIBUTION_EVENTS`
**And** each collection has a corresponding TypeScript interface extending `BaseDocument`
**And** all new document interfaces include `tenantId`, `partnerId`, `smeId` fields for multi-tenant isolation
**And** all timestamp fields use Firebase `Timestamp` type, not JavaScript `Date`

### Story 0.2: Implement Hybrid RBAC System

As a **platform admin**,
I want **to assign roles to users with both Firebase Auth custom claims and Firestore permissions**,
So that **role-based access control is fast and flexible**.

**Acceptance Criteria:**

**Given** a user account exists in Firebase Auth
**When** an admin assigns a role (SME User, Consortium Partner, QA Reviewer, Buyer, CMMC Instructor, Marketing Staff, Platform Admin)
**Then** the primary role is stored in Firebase Auth custom claims
**And** detailed permissions are stored in the Firestore `users` collection
**And** API routes can check custom claims for fast authorization
**And** complex permissions (e.g., partner-specific SME assignments) are retrieved from Firestore
**And** the 7 roles are properly configured with their permission matrices

### Story 0.3: User Account Management Dashboard

As a **platform admin**,
I want **to create, suspend, and delete user accounts through an admin dashboard**,
So that **I can manage platform access and user lifecycle** (FR58).

**Acceptance Criteria:**

**Given** I am logged in as a platform admin
**When** I navigate to `/portal/admin/users`
**Then** I see a list of all user accounts with their roles and status
**And** I can create new user accounts with email and role assignment
**And** I can suspend user accounts (preventing login without deleting data)
**And** I can delete user accounts (with confirmation dialog)
**And** I can search and filter users by role, status, or email
**And** all actions are logged in the audit trail

### Story 0.4: Role Assignment Interface

As a **platform admin**,
I want **to assign and modify user roles through the admin interface**,
So that **users have appropriate permissions for their responsibilities** (FR59).

**Acceptance Criteria:**

**Given** I am viewing a user's profile in the admin dashboard
**When** I select a new role from the dropdown (SME User, Consortium Partner, QA Reviewer, Buyer, CMMC Instructor, Marketing Staff, Platform Admin)
**Then** the user's Firebase Auth custom claims are updated with the new role
**And** the user's Firestore permissions document is updated
**And** the user must re-authenticate to receive new permissions
**And** I can assign additional permissions beyond the base role (e.g., partner-specific SME access)
**And** role changes are logged in the audit trail

### Story 0.5: System Health Monitoring Dashboard

As a **platform admin**,
I want **to monitor system health metrics including uptime, response time, and errors**,
So that **I can ensure the platform meets the 99.9% uptime SLA** (FR60).

**Acceptance Criteria:**

**Given** I am logged in as a platform admin
**When** I navigate to `/portal/admin/monitoring`
**Then** I see real-time metrics for API response times (95th percentile)
**And** I see current uptime percentage and historical uptime data
**And** I see error rate and recent error logs
**And** I see concurrent user count and database query performance
**And** metrics are updated every 30 seconds using Firestore real-time listeners
**And** I can filter metrics by time range (last hour, day, week, month)

### Story 0.6: Audit Log Viewer

As a **platform admin**,
I want **to view comprehensive audit logs for all user activities**,
So that **I can investigate issues and ensure compliance** (FR61).

**Acceptance Criteria:**

**Given** I am logged in as a platform admin
**When** I navigate to `/portal/admin/audit-logs`
**Then** I see a paginated list of all user activities (50 items per page)
**And** each log entry shows: timestamp, user, action, resource, IP address, result
**And** I can filter logs by user, action type, date range, or resource
**And** I can export audit logs to CSV for compliance reporting
**And** sensitive actions (role changes, account deletions, payment disputes) are highlighted
**And** audit logs are immutable and cannot be deleted

### Story 0.7: System Configuration Management

As a **platform admin**,
I want **to configure system settings including industry mappings and routing rules**,
So that **the platform behavior can be adjusted without code deployments** (FR62).

**Acceptance Criteria:**

**Given** I am logged in as a platform admin
**When** I navigate to `/portal/admin/settings`
**Then** I can manage industry categories and mappings
**And** I can configure lead routing rules (stored in Firestore `routingRules` collection)
**And** I can set revenue share percentages and calculation rules
**And** I can configure Pack Health scoring thresholds (default: ≥70 for intro-eligibility)
**And** I can manage consortium partner vertical assignments
**And** all configuration changes are validated before saving
**And** configuration changes are logged in the audit trail

### Story 0.8: Automated Performance Alerts

As a **platform admin**,
I want **to receive automated alerts when system performance degrades**,
So that **I can respond quickly to issues before they impact users** (FR64).

**Acceptance Criteria:**

**Given** the system monitoring is active
**When** API response time exceeds 500ms (95th percentile) for 5 consecutive minutes
**Then** an alert email is sent to all platform admins
**And** when error rate exceeds 1% for 5 consecutive minutes, an alert is sent
**And** when uptime drops below 99.9%, an alert is sent
**And** when database query performance degrades significantly, an alert is sent
**And** alerts include relevant metrics and timestamps
**And** alerts are logged in the system for historical tracking
**And** admins can configure alert thresholds and notification preferences

## Epic 1: SME Onboarding & Profile Management

SME users can register, manage their profiles, and select subscription tiers to access platform features. This epic enables SMEs to join the platform, configure their company information, and choose the appropriate service level (Free, DIY, DWY, DFY) with full payment processing including partial payment support.

### Story 1.1: SME User Registration

As an **SME user**,
I want **to register for the platform with my company information**,
So that **I can access platform features and services**.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I submit my email, password, company name, and industry
**Then** a new user account is created in Firebase Auth
**And** a new SME tenant record is created in Firestore with `tenantId`, `smeId`
**And** the user is assigned the "SME User" role via custom claims
**And** a welcome email is sent to the user
**And** the user is automatically logged in and redirected to `/portal/dashboard`
**And** the user starts on the Free tier by default

### Story 1.2: Company Profile Management

As an **SME user**,
I want **to manage my company profile including certifications and capabilities**,
So that **my profile is accurate for buyer matching and introductions**.

**Acceptance Criteria:**

**Given** I am logged in as an SME user
**When** I navigate to `/portal/profile`
**Then** I can edit company information (name, industry, description, website)
**And** I can add/remove certifications (8(a), WOSB, SDVOSB, HUBZone, ISO, CMMC)
**And** I can add/remove capabilities and service offerings
**And** I can upload a company logo (base64 encoded, max 1MB)
**And** changes are saved to my Firestore user document
**And** the `updatedAt` timestamp is updated on save
**And** profile completeness percentage is displayed

### Story 1.3: Subscription Tier Selection

As an **SME user**,
I want **to select and change my subscription tier (Free, DIY, DWY, DFY)**,
So that **I can access the appropriate level of platform features** (FR33).

**Acceptance Criteria:**

**Given** I am logged in as an SME user
**When** I navigate to `/portal/subscription`
**Then** I see all 4 subscription tiers with pricing and features
**And** I can select a new tier (Free $0, DIY $99, DWY $299, DFY $599)
**And** when I select a paid tier, I am redirected to Stripe checkout
**And** after successful payment, my subscription tier is updated in Firestore
**And** my role permissions are updated to reflect new tier access
**And** I receive a confirmation email with subscription details
**And** I can upgrade or downgrade tiers at any time

### Story 1.4: Payment Processing Integration

As an **SME user**,
I want **to process payments for subscriptions, events, and cohorts using Stripe**,
So that **I can access paid platform features** (FR34).

**Acceptance Criteria:**

**Given** I am selecting a paid subscription tier, event registration, or cohort enrollment
**When** I proceed to checkout
**Then** a Stripe checkout session is created using the existing Stripe integration
**And** I can pay with credit card or other Stripe-supported methods
**And** I can choose full payment or partial payment (using existing partial payment system)
**And** payment success creates a transaction record in Firestore `Transactions` collection
**And** payment failure returns me to the selection page with error message
**And** webhook handles payment confirmation asynchronously
**And** successful payment triggers appropriate access grants

### Story 1.5: Payment History & Invoices

As an **SME user**,
I want **to view my payment history and download invoices**,
So that **I can track my spending and maintain financial records** (FR35).

**Acceptance Criteria:**

**Given** I am logged in as an SME user
**When** I navigate to `/portal/billing`
**Then** I see a paginated list of all my transactions (50 items per page)
**And** each transaction shows: date, description, amount, status, payment method
**And** I can filter transactions by type (subscription, event, cohort) and date range
**And** I can download PDF invoices for each transaction
**And** I can see my current subscription status and next billing date
**And** I can update my payment method through Stripe
**And** I can view upcoming payments and scheduled charges

### Story 1.6: Partial Payment Management

As an **SME user**,
I want **to make partial payments with installment tracking**,
So that **I can manage cash flow while accessing platform features** (FR36).

**Acceptance Criteria:**

**Given** I am purchasing an event ticket or cohort enrollment
**When** I select the partial payment option
**Then** I can choose how much to pay now (minimum 25% of total)
**And** a payment plan is created in Firestore `PaymentPlans` collection
**And** I see my remaining balance and due date
**And** I receive email reminders before payment due dates
**And** I can make additional payments toward my balance at any time
**And** I can view all my active payment plans in `/portal/billing`
**And** when balance is paid in full, the payment plan status changes to "completed"
**And** overdue payments are flagged and access may be restricted

## Epic 2: Proof Pack Creation & Management

SME users can create, edit, and manage Proof Pack documents with document uploads and categorization. This epic delivers the core value proposition of transforming scattered compliance documents into organized, scored Proof Packs with Pack Health scoring, gap analysis, and remediation tracking.

### Story 2.1: Create New Proof Pack

As an **SME user**,
I want **to create a new Proof Pack document in draft state**,
So that **I can begin organizing my compliance documents** (FR1).

**Acceptance Criteria:**

**Given** I am logged in as an SME user
**When** I navigate to `/portal/proofpacks` and click "Create New Proof Pack"
**Then** a new Proof Pack document is created in Firestore `PROOF_PACKS` collection
**And** the Proof Pack is assigned a unique ID and set to "draft" status
**And** the Proof Pack includes `smeId`, `partnerId`, `tenantId` for multi-tenant isolation
**And** I can enter a title and description for the Proof Pack
**And** the Proof Pack is initialized with empty document categories
**And** I am redirected to the Proof Pack editor page
**And** the Pack Health score is initialized to 0

### Story 2.2: Upload and Categorize Documents

As an **SME user**,
I want **to upload documents and categorize them within my Proof Pack**,
So that **my compliance documents are organized for buyer review** (FR2).

**Acceptance Criteria:**

**Given** I am editing a Proof Pack in draft state
**When** I upload a document file (PDF, DOC, DOCX, JPG, PNG)
**Then** the file is converted to base64 encoding
**And** if the file is >1MB, it is chunked into multiple Firestore documents
**And** the document is stored with fields: `fileName`, `fileData` (base64), `mimeType`, `fileSize`, `uploadedAt`
**And** I can assign the document to a category (Certifications, Financial, Past Performance, Technical, Quality, Safety, Security, Other)
**And** I can add metadata: expiration date, document type, notes
**And** the document appears in the Proof Pack document list
**And** I can delete documents from the Proof Pack
**And** all document operations update the `updatedAt` timestamp

### Story 2.3: Pack Health Score Calculation

As an **SME user**,
I want **to view my Pack Health score (0-100 scale)**,
So that **I understand the completeness and quality of my Proof Pack** (FR4).

**Acceptance Criteria:**

**Given** I have a Proof Pack with uploaded documents
**When** the Pack Health score is calculated (via Firebase Cloud Function)
**Then** the score is based on: completeness (40%), expiration status (30%), document quality (20%), gap remediation (10%)
**And** the score is cached in the Proof Pack Firestore document as `packHealthScore`
**And** the score is displayed prominently in the Proof Pack editor
**And** the score updates automatically when documents are added/removed/updated
**And** a background job recalculates scores daily for all Proof Packs
**And** the score calculation breakdown is stored for QA reviewer visibility
**And** scores ≥70 make the Proof Pack eligible for buyer introductions

### Story 2.4: Gap Analysis Dashboard

As an **SME user**,
I want **to view gap analysis identifying missing or expired documents**,
So that **I know what documents I need to add or update** (FR5).

**Acceptance Criteria:**

**Given** I am viewing my Proof Pack
**When** I navigate to the "Gap Analysis" tab
**Then** I see a list of missing required documents by category
**And** I see a list of expired documents with expiration dates
**And** I see a list of documents expiring within 30 days (warning)
**And** each gap item shows: category, document type, priority level, recommendation
**And** I can mark gaps as "acknowledged" or "not applicable"
**And** the gap analysis updates in real-time as I add documents
**And** the gap analysis contributes to the Pack Health score calculation

### Story 2.5: Remediation Progress Tracking

As an **SME user**,
I want **to track my remediation progress toward Pack Health ≥70**,
So that **I can systematically improve my Proof Pack to become intro-eligible** (FR6).

**Acceptance Criteria:**

**Given** I have a Proof Pack with Pack Health score <70
**When** I view the remediation dashboard
**Then** I see my current Pack Health score and target score (70)
**And** I see a progress bar showing percentage toward target
**And** I see prioritized action items to improve the score (sorted by impact)
**And** each action item shows: description, estimated score impact, effort level
**And** I can mark action items as "completed" when I address them
**And** the dashboard updates in real-time as I make improvements
**And** I receive a notification when my score reaches ≥70 (intro-eligible)

### Story 2.6: Document Expiration Tracking

As an **SME user**,
I want **the system to track document expiration dates and flag upcoming expirations**,
So that **my Proof Pack remains current and compliant** (FR12).

**Acceptance Criteria:**

**Given** I have uploaded documents with expiration dates
**When** a document is within 30 days of expiration
**Then** the document is flagged with a "warning" status in the Proof Pack
**And** I receive an email notification about the upcoming expiration
**And** when a document expires, it is flagged with an "expired" status
**And** expired documents reduce the Pack Health score
**And** a background job runs daily to check all document expiration dates
**And** I can update the expiration date by uploading a renewed document
**And** the expiration tracking dashboard shows all documents by expiration status

### Story 2.7: Edit Proof Pack Details

As an **SME user**,
I want **to edit my Proof Pack title, description, and metadata**,
So that **my Proof Pack accurately represents my company** (FR1).

**Acceptance Criteria:**

**Given** I have a Proof Pack in draft state
**When** I edit the Proof Pack details
**Then** I can update the title and description
**And** I can add/edit tags for categorization
**And** I can set the Proof Pack visibility (private, partner-only, buyer-ready)
**And** changes are saved to Firestore with updated `updatedAt` timestamp
**And** I can save as draft or submit for QA review
**And** all edits are tracked in the Proof Pack version history

## Epic 3: QA Review Workflow

SMEs can submit Proof Packs for review, and QA reviewers can approve or reject them with feedback. This epic implements the quality gate that ensures only vetted, high-quality Proof Packs (Pack Health ≥70) become visible to buyers, protecting buyer relationships and maintaining platform credibility.

### Story 3.1: Submit Proof Pack for QA Review

As an **SME user**,
I want **to submit my Proof Pack for QA review**,
So that **it can be approved for buyer visibility** (FR3).

**Acceptance Criteria:**

**Given** I have a Proof Pack in draft state with Pack Health score ≥70
**When** I click "Submit for QA Review"
**Then** the Proof Pack status changes from "draft" to "submitted"
**And** the Proof Pack is added to the QA review queue
**And** I receive a confirmation email that my Proof Pack has been submitted
**And** I can no longer edit the Proof Pack while it's under review
**And** I can view the submission timestamp and current review status
**And** if Pack Health score is <70, submission is blocked with explanation

### Story 3.2: QA Review Queue Dashboard

As a **QA reviewer**,
I want **to access a queue of submitted Proof Packs awaiting review**,
So that **I can efficiently review and approve Proof Packs** (FR7).

**Acceptance Criteria:**

**Given** I am logged in as a QA reviewer
**When** I navigate to `/portal/qa/queue`
**Then** I see a list of all Proof Packs with "submitted" status
**And** the queue is sorted by submission date (oldest first)
**And** each queue item shows: SME name, Proof Pack title, submission date, Pack Health score
**And** I can filter the queue by Pack Health score range, industry, or submission date
**And** I can claim a Proof Pack for review (assigns it to me)
**And** the queue updates in real-time using Firestore listeners
**And** I can see which Proof Packs are currently being reviewed by other QA reviewers

### Story 3.3: Review and Approve/Reject Proof Pack

As a **QA reviewer**,
I want **to approve or reject Proof Packs with comments**,
So that **only high-quality Proof Packs become buyer-visible** (FR8).

**Acceptance Criteria:**

**Given** I have claimed a Proof Pack for review
**When** I review the Proof Pack contents
**Then** I can view all uploaded documents and their metadata
**And** I can view the Pack Health score calculation breakdown
**And** I can add review comments for the SME
**And** I can approve the Proof Pack (changes status to "approved")
**And** I can reject the Proof Pack with required feedback (changes status to "rejected")
**And** when I approve, the SME receives an approval email
**And** when I reject, the SME receives a rejection email with my comments
**And** rejected Proof Packs return to draft state for SME edits
**And** all review actions are logged in the audit trail

### Story 3.4: Pack Health Score Breakdown View

As a **QA reviewer**,
I want **to view the Pack Health score calculation breakdown**,
So that **I understand how the score was calculated** (FR9).

**Acceptance Criteria:**

**Given** I am reviewing a Proof Pack
**When** I view the Pack Health score breakdown
**Then** I see the overall score (0-100)
**And** I see the completeness score (40% weight) with details
**And** I see the expiration status score (30% weight) with details
**And** I see the document quality score (20% weight) with details
**And** I see the gap remediation score (10% weight) with details
**And** I can see which specific factors increased or decreased the score
**And** I can see recommendations for score improvement
**And** the breakdown helps me make informed approval decisions

## Epic 4: Proof Pack Sharing & Buyer Access

SMEs can share published Proof Packs with buyers, and buyers can view them after NDA acceptance. This epic enables the secure sharing of approved Proof Packs with potential buyers while maintaining compliance through NDA workflows and comprehensive audit trails.

### Story 4.1: Generate Secure Proof Pack Link

As an **SME user**,
I want **to share my published Proof Pack with buyers via secure links**,
So that **buyers can view my compliance documents** (FR10).

**Acceptance Criteria:**

**Given** I have an approved Proof Pack (status = "approved", Pack Health ≥70)
**When** I click "Generate Share Link"
**Then** a unique, secure URL is generated for the Proof Pack
**And** the link includes a cryptographically secure token
**And** the link is displayed for me to copy
**And** I can set link expiration (7 days, 30 days, 90 days, no expiration)
**And** I can revoke the link at any time
**And** I can generate multiple links for different buyers
**And** each link access is tracked in the audit log

### Story 4.2: NDA Acceptance Workflow

As a **buyer**,
I want **to view Proof Pack contents only after accepting an NDA**,
So that **confidential information is protected** (FR11).

**Acceptance Criteria:**

**Given** I have received a secure Proof Pack link
**When** I click the link and am not logged in
**Then** I am prompted to create a buyer account or log in
**And** after login, I am presented with an NDA acceptance page
**And** the NDA text is displayed with clear terms
**And** I must check "I accept the terms" and click "Accept NDA"
**And** my NDA acceptance is recorded in Firestore with timestamp and IP address
**And** only after NDA acceptance can I view the Proof Pack contents
**And** if I decline the NDA, I cannot access the Proof Pack
**And** NDA acceptance is required only once per buyer-SME relationship

### Story 4.3: Buyer Proof Pack Viewer

As a **buyer**,
I want **to view Proof Pack contents after NDA acceptance**,
So that **I can evaluate the SME's compliance and capabilities**.

**Acceptance Criteria:**

**Given** I have accepted the NDA for a Proof Pack
**When** I view the Proof Pack
**Then** I see the SME company information and Proof Pack title
**And** I see all uploaded documents organized by category
**And** I can download individual documents (base64 decoded to original format)
**And** I can see document metadata (type, expiration date, upload date)
**And** I see the Pack Health score
**And** I cannot edit or modify any Proof Pack content
**And** my viewing activity is logged in the audit trail
**And** I can request a warm introduction to the SME from this page

### Story 4.4: Proof Pack Access Audit Trail

As an **SME user**,
I want **to see who has accessed my Proof Pack**,
So that **I can track buyer interest and maintain security**.

**Acceptance Criteria:**

**Given** I have shared my Proof Pack with buyers
**When** I navigate to the Proof Pack access log
**Then** I see a list of all access events (NDA acceptance, views, downloads)
**And** each event shows: buyer name/email, timestamp, action type, IP address
**And** I can filter the log by buyer, action type, or date range
**And** I can see which documents were downloaded by which buyers
**And** I receive email notifications when a new buyer accesses my Proof Pack
**And** the audit trail is immutable and cannot be deleted
**And** I can export the access log to CSV for my records

## Epic 5: Lead Capture & Automated Routing

System captures leads and automatically routes them to appropriate consortium partners based on vertical expertise. This epic implements the intelligent lead distribution system that coordinates the 6 consortium partners, prevents service overlaps, and tracks the lead pipeline from capture through conversion.

### Story 5.1: Lead Capture from Multiple Sources

As a **platform system**,
I want **to capture leads from website forms and external sources**,
So that **all leads are centralized in the CRM system** (FR13).

**Acceptance Criteria:**

**Given** a lead submission occurs from any source
**When** the lead data is received
**Then** a new lead document is created in Firestore `LEADS` collection
**And** the lead includes fields: name, email, phone, company, industry, service_type, source, captured_at
**And** the lead is assigned `tenantId` for multi-tenant isolation
**And** the lead status is set to "new"
**And** lead sources include: website contact form, event registration, external API, manual entry
**And** duplicate detection runs based on email address
**And** all lead captures are logged in the audit trail

### Story 5.2: Configuration-Driven Lead Routing

As a **platform system**,
I want **to automatically route leads to appropriate consortium partners based on vertical expertise**,
So that **leads are handled by the most qualified partners** (FR14).

**Acceptance Criteria:**

**Given** a new lead is captured
**When** the lead routing algorithm runs
**Then** routing rules are retrieved from Firestore `ROUTING_RULES` collection
**And** the lead is matched to partners based on: industry, service_type, vertical_expertise, partner_capacity
**And** the best-match partner is assigned to the lead
**And** the lead's `partnerId` field is updated with the assigned partner
**And** the assigned partner receives an email notification
**And** if no matching partner is found, the lead is assigned to the default admin queue
**And** routing decisions are logged with rationale

### Story 5.3: Partner Lead Dashboard

As a **consortium partner**,
I want **to view all SME clients assigned to my vertical**,
So that **I can manage my lead pipeline effectively** (FR15).

**Acceptance Criteria:**

**Given** I am logged in as a consortium partner
**When** I navigate to `/portal/partner/leads`
**Then** I see all leads assigned to me (filtered by my `partnerId`)
**And** leads are organized by status (new, contacted, qualified, converted)
**And** I can filter leads by industry, service_type, or date range
**And** I can search leads by company name or contact name
**And** each lead shows: company, contact, industry, service_type, status, assigned_date
**And** the dashboard updates in real-time using Firestore listeners
**And** I can see lead count by status

### Story 5.4: Lead Assignment Management

As a **consortium partner**,
I want **to manage lead assignments within my vertical**,
So that **I can optimize lead distribution among my team** (FR16).

**Acceptance Criteria:**

**Given** I am viewing my lead dashboard
**When** I select a lead
**Then** I can reassign the lead to another team member within my organization
**And** I can change the lead status (new → contacted → qualified → converted)
**And** I can add notes and activity logs to the lead
**And** I can set follow-up reminders for the lead
**And** reassignments are logged in the audit trail
**And** the new assignee receives a notification
**And** I can bulk-update lead statuses

### Story 5.5: Lead Activity Logging

As a **consortium partner**,
I want **to log activities and interactions with assigned SMEs**,
So that **I maintain a complete history of engagement** (FR17).

**Acceptance Criteria:**

**Given** I am working with an assigned lead
**When** I log an activity
**Then** I can record activity type (call, email, meeting, note)
**And** I can add activity details, date/time, and outcome
**And** I can attach documents to the activity log
**And** activities are stored in a subcollection under the lead document
**And** I can view the complete activity timeline for the lead
**And** activities are displayed in chronological order
**And** I can filter activities by type or date range

### Story 5.6: Service Overlap Detection

As a **platform system**,
I want **to detect and flag potential service overlaps when multiple partners are assigned to the same SME**,
So that **we prevent duplicate services and maintain consortium coordination** (FR18).

**Acceptance Criteria:**

**Given** a lead is being assigned to a partner
**When** the SME already has an active relationship with another partner
**Then** the system detects the potential overlap
**And** both partners receive an alert notification
**And** the overlap is flagged in the lead record with details
**And** partners can view all overlaps in a dedicated dashboard
**And** partners can coordinate to resolve overlaps (claim, defer, collaborate)
**And** platform admins can view all service overlaps across the consortium
**And** overlap resolution is logged in the audit trail

### Story 5.7: Admin Lead Routing Override

As a **platform admin**,
I want **to manually override lead routing decisions**,
So that **I can handle exceptions and optimize partner assignments** (FR19).

**Acceptance Criteria:**

**Given** I am logged in as a platform admin
**When** I view any lead in the system
**Then** I can manually reassign the lead to any consortium partner
**And** I can override automatic routing rules
**And** I can add a note explaining the override reason
**And** the override is logged in the audit trail
**And** both the old and new partners receive notifications
**And** I can view a history of all routing overrides
**And** overrides do not affect future automatic routing

### Story 5.8: Lead Pipeline Tracking

As a **user** (partner or admin),
I want **to view lead pipeline stages (new → contacted → qualified → converted)**,
So that **I can track lead progression and conversion rates** (FR20).

**Acceptance Criteria:**

**Given** I am viewing the lead pipeline dashboard
**When** I access the pipeline view
**Then** I see leads organized by stage: new, contacted, qualified, converted
**And** I see lead counts and percentages for each stage
**And** I can drag-and-drop leads between stages
**And** I can view conversion rates between stages
**And** I can filter the pipeline by partner, industry, or date range
**And** I can see average time-in-stage metrics
**And** stage transitions are logged with timestamps

## Epic 6: Buyer Directory & Warm Introductions

Buyers can discover vetted SMEs and request warm introductions, while SMEs can accept/decline and schedule meetings. This epic delivers the "warm introductions engine" that connects qualified buyers with intro-eligible SMEs (Pack Health ≥70), facilitates meeting scheduling, and tracks the conversion funnel (intro → meeting → RFQ → award).

### Story 6.1: Buyer SME Directory

As a **buyer**,
I want **to browse a directory of intro-eligible SMEs (Pack Health ≥70)**,
So that **I can discover qualified vendors for my needs** (FR21).

**Acceptance Criteria:**

**Given** I am logged in as a buyer
**When** I navigate to `/portal/buyer/directory`
**Then** I see a list of SMEs with approved Proof Packs (Pack Health ≥70)
**And** each SME listing shows: company name, industry, certifications, Pack Health score, capabilities summary
**And** the directory is paginated (50 SMEs per page)
**And** I can view SME profile details by clicking on a listing
**And** SMEs with Pack Health <70 are not visible in the directory
**And** the directory updates in real-time as new SMEs become intro-eligible
**And** I can save SMEs to a favorites list

### Story 6.2: SME Directory Filtering

As a **buyer**,
I want **to filter the SME directory by industry, certifications, and capabilities**,
So that **I can quickly find SMEs matching my requirements** (FR22).

**Acceptance Criteria:**

**Given** I am viewing the SME directory
**When** I apply filters
**Then** I can filter by industry (aerospace, defense, IT, manufacturing, etc.)
**And** I can filter by certifications (8(a), WOSB, SDVOSB, HUBZone, ISO, CMMC)
**And** I can filter by capabilities and service offerings
**And** I can filter by Pack Health score range
**And** I can combine multiple filters
**And** the directory updates immediately as I adjust filters
**And** I can save filter presets for future searches
**And** I can see the count of matching SMEs for each filter

### Story 6.3: Request Warm Introduction

As a **buyer**,
I want **to request warm introductions to specific SMEs**,
So that **I can connect with qualified vendors through trusted channels** (FR23).

**Acceptance Criteria:**

**Given** I am viewing an SME profile in the directory
**When** I click "Request Introduction"
**Then** I can enter my introduction request details (project description, timeline, budget range)
**And** I can specify my preferred contact method (email, phone, video call)
**And** the introduction request is created in Firestore `INTRODUCTIONS` collection
**And** the request status is set to "pending"
**And** the SME receives a notification of the introduction request
**And** the consortium partner (if applicable) receives a notification
**And** I receive a confirmation email
**And** I can track the status of my introduction requests

### Story 6.4: Generate Introduction Brief

As a **platform system**,
I want **to generate introduction briefs with SME context for buyers**,
So that **buyers have relevant information to evaluate the introduction** (FR24).

**Acceptance Criteria:**

**Given** an introduction request is created
**When** the introduction brief is generated
**Then** the brief includes: SME company overview, certifications, capabilities, Pack Health score, past performance highlights
**And** the brief includes relevant Proof Pack excerpts (non-confidential)
**And** the brief includes consortium partner endorsement (if applicable)
**And** the brief is formatted as a professional PDF document
**And** the brief is attached to the introduction request
**And** both buyer and SME can access the brief
**And** brief generation is automated using a template system

### Story 6.5: SME Accept/Decline Introduction

As an **SME user**,
I want **to accept or decline introduction requests**,
So that **I control which buyer relationships I pursue** (FR25).

**Acceptance Criteria:**

**Given** I have received an introduction request
**When** I view the request details
**Then** I can see the buyer's company information and project description
**And** I can accept the introduction (changes status to "accepted")
**And** I can decline the introduction with an optional reason (changes status to "declined")
**And** when I accept, the buyer receives an acceptance notification with my contact information
**And** when I decline, the buyer receives a polite decline notification
**And** I can set my introduction preferences (auto-accept, manual review, industries of interest)
**And** accepted introductions move to the meeting scheduling phase

### Story 6.6: Integrated Meeting Scheduling

As a **user** (buyer or SME),
I want **to schedule meetings via integrated calendar system**,
So that **we can easily coordinate introductory meetings** (FR26).

**Acceptance Criteria:**

**Given** an introduction has been accepted
**When** I initiate meeting scheduling
**Then** I am redirected to the Calendly integration
**And** I can select available time slots from the other party's calendar
**And** I can choose meeting type (phone, video call, in-person)
**And** meeting confirmation is sent to both parties via email
**And** the meeting is added to both parties' calendars
**And** the introduction status is updated to "meeting_scheduled"
**And** meeting reminders are sent 24 hours and 1 hour before the meeting
**And** the meeting details are stored in the introduction record

### Story 6.7: Conversion Stage Tracking

As a **consortium partner**,
I want **to track conversion stages (intro → meeting → RFQ → award)**,
So that **I can measure introduction effectiveness and revenue potential** (FR27).

**Acceptance Criteria:**

**Given** I am managing introductions for my SME clients
**When** I view the conversion tracking dashboard
**Then** I see all introductions organized by stage: intro, meeting_scheduled, meeting_held, RFQ_sent, proposal_submitted, award
**And** I can update the stage as the relationship progresses
**And** I can add notes and documents at each stage
**And** I can see conversion rates between stages
**And** I can filter by SME, buyer, or date range
**And** I can see estimated deal value and timeline
**And** stage transitions are logged with timestamps and trigger revenue attribution events

### Story 6.8: Introduction Quality Feedback

As a **buyer**,
I want **to provide feedback on introduction quality and relevance**,
So that **the platform can improve matching and recommendations** (FR28).

**Acceptance Criteria:**

**Given** I have completed an introduction meeting
**When** I am prompted for feedback
**Then** I can rate the introduction quality (1-5 stars)
**And** I can rate the SME's relevance to my needs (1-5 stars)
**And** I can provide written feedback comments
**And** I can indicate if I plan to pursue the relationship
**And** feedback is stored in the introduction record
**And** feedback is visible to consortium partners (not to SMEs)
**And** aggregate feedback scores are used to improve matching algorithms
**And** I receive a thank-you message after submitting feedback

## Epic 7: Revenue Attribution & Financial Tracking

System tracks revenue attribution across multiple touchpoints, and partners can view their contributions in real-time. This epic implements the transparent revenue tracking system that attributes value across lead generation, service delivery, and introductions, automatically calculating the 10% platform fee and generating quarterly settlement reports.

### Story 7.1: Event-Based Revenue Attribution Logging

As a **platform system**,
I want **to track revenue attribution by lead source, service delivery, and introductions**,
So that **all revenue contributions are accurately recorded** (FR29).

**Acceptance Criteria:**

**Given** a revenue-generating event occurs
**When** the event is logged
**Then** an attribution event is created in Firestore `ATTRIBUTION_EVENTS` collection
**And** event types include: lead_generated, service_delivered, introduction_facilitated, conversion_completed
**And** each event includes: partnerId, smeId, buyerId, event_type, revenue_amount, attribution_percentage, timestamp
**And** events are immutable (cannot be edited or deleted)
**And** events include metadata: source, deal_id, notes
**And** events trigger real-time dashboard updates
**And** events are used to calculate quarterly settlements

### Story 7.2: Partner Revenue Dashboard

As a **consortium partner**,
I want **to view my revenue contributions in real-time**,
So that **I can track my earnings and performance** (FR30).

**Acceptance Criteria:**

**Given** I am logged in as a consortium partner
**When** I navigate to `/portal/partner/revenue`
**Then** I see my total revenue contributions (current month, quarter, year)
**And** I see revenue broken down by type (leads, services, introductions)
**And** I see my pending revenue (not yet settled)
**And** I see my settled revenue (paid out)
**And** I can view detailed attribution events in a timeline
**And** the dashboard updates in real-time using Firestore listeners
**And** I can filter revenue by date range or SME client
**And** I can export revenue reports to CSV

### Story 7.3: Automated Revenue Share Calculation

As a **platform system**,
I want **to calculate revenue share distributions automatically**,
So that **settlements are accurate and transparent** (FR31).

**Acceptance Criteria:**

**Given** attribution events exist for a settlement period
**When** the revenue calculation runs (quarterly)
**Then** all attribution events for the period are aggregated
**And** the 10% platform fee is calculated and deducted from total revenue
**And** remaining revenue is distributed to partners based on attribution percentages
**And** calculations account for multi-touch attribution (multiple partners contributing to one deal)
**And** settlement summaries are created in Firestore `REVENUE_ATTRIBUTION` collection
**And** partners receive settlement notifications via email
**And** all calculations are logged for audit purposes

### Story 7.4: Revenue Share Configuration

As a **platform admin**,
I want **to configure revenue share percentages and rules**,
So that **the attribution model can be adjusted as needed** (FR32).

**Acceptance Criteria:**

**Given** I am logged in as a platform admin
**When** I navigate to `/portal/admin/revenue-config`
**Then** I can set the platform fee percentage (default: 10%)
**And** I can configure attribution rules for different event types
**And** I can set revenue share splits for multi-touch scenarios
**And** I can define minimum payout thresholds
**And** I can configure settlement frequency (monthly, quarterly)
**And** configuration changes are validated before saving
**And** changes are logged in the audit trail
**And** changes apply to future settlements only (not retroactive)

### Story 7.5: Payment Dispute Resolution

As a **platform admin**,
I want **to investigate and resolve payment disputes**,
So that **revenue attribution conflicts are handled fairly** (FR63).

**Acceptance Criteria:**

**Given** a payment dispute is raised
**When** I investigate the dispute
**Then** I can view all attribution events related to the disputed transaction
**And** I can view the complete audit trail for the deal
**And** I can see all partners involved and their claimed contributions
**And** I can adjust attribution percentages manually with justification
**And** I can add notes and supporting documentation
**And** I can approve or reject the dispute resolution
**And** all parties receive notification of the resolution
**And** dispute resolution is logged in the audit trail

## Epic 8: CMMC Cohort Management

CMMC instructors can create training programs, and SMEs can enroll, participate, and earn completion certificates. This epic delivers the 12-week CMMC training program with automated curriculum release, assessment grading, progress tracking, discussion boards, and certificate generation.

### Story 8.1: Create CMMC Cohort Program

As a **CMMC instructor**,
I want **to create and configure cohort programs with curriculum**,
So that **I can deliver structured CMMC training to SME participants** (FR37).

**Acceptance Criteria:**

**Given** I am logged in as a CMMC instructor
**When** I create a new cohort program
**Then** a new cohort document is created in Firestore `COHORTS` collection
**And** I can set cohort details: title, description, start_date, duration (12 weeks), max_participants
**And** I can configure the curriculum structure (12 weekly modules)
**And** I can set pricing and payment options (full or partial payment)
**And** I can upload a cohort syllabus (base64 encoded)
**And** the cohort status is set to "draft" until I publish it
**And** I can preview the cohort before publishing
**And** published cohorts appear in the enrollment catalog

### Story 8.2: SME Cohort Enrollment

As an **SME user**,
I want **to enroll in CMMC cohorts with payment**,
So that **I can receive CMMC training and certification** (FR38).

**Acceptance Criteria:**

**Given** I am viewing available CMMC cohorts
**When** I select a cohort to enroll in
**Then** I can view cohort details (curriculum, schedule, instructor, pricing)
**And** I can proceed to payment via Stripe checkout
**And** I can choose full payment or partial payment option
**And** after successful payment, my enrollment is created in the cohort
**And** I receive a confirmation email with cohort access details
**And** I am added to the cohort participant list
**And** I can access the cohort dashboard
**And** enrollment is limited by max_participants capacity

### Story 8.3: Upload Curriculum Materials

As a **CMMC instructor**,
I want **to upload curriculum materials for each week**,
So that **participants can access learning content** (FR39).

**Acceptance Criteria:**

**Given** I am managing a cohort program
**When** I upload curriculum materials for a week
**Then** I can upload multiple file types (PDF, DOCX, video links, presentations)
**And** files are converted to base64 and stored in Firestore
**And** I can organize materials by week (Week 1-12)
**And** I can add descriptions and learning objectives for each module
**And** I can set release dates for each week's materials
**And** I can update or replace materials before they are released
**And** materials are organized in the cohort document structure

### Story 8.4: Automated Curriculum Release

As a **platform system**,
I want **to automatically release curriculum modules based on schedule**,
So that **participants receive content at the appropriate time** (FR40).

**Acceptance Criteria:**

**Given** a cohort is in progress
**When** a module's release date arrives
**Then** a background job (Vercel Cron) checks for modules to release
**And** the module status changes from "locked" to "available"
**And** participants receive email notifications of new content
**And** participants can access the newly released module
**And** previously released modules remain accessible
**And** future modules remain locked until their release date
**And** the release schedule follows the cohort start_date + week offset

### Story 8.5: Create and Grade Assessments

As a **CMMC instructor**,
I want **to create and grade assessments**,
So that **I can evaluate participant learning and progress** (FR41).

**Acceptance Criteria:**

**Given** I am managing a cohort
**When** I create an assessment
**Then** I can add multiple question types (multiple choice, true/false, short answer, essay)
**And** I can assign point values to each question
**And** I can set passing score threshold (e.g., 70%)
**And** I can schedule assessment availability (start and end dates)
**And** participants can submit assessments within the availability window
**And** multiple choice and true/false questions are auto-graded
**And** I can manually grade short answer and essay questions
**And** participants receive their scores and feedback
**And** assessment results are stored in the cohort participant records

### Story 8.6: Participant Progress Tracking

As an **SME participant**,
I want **to track my progress through the 12-week program**,
So that **I can monitor my completion status** (FR42).

**Acceptance Criteria:**

**Given** I am enrolled in a cohort
**When** I view my progress dashboard
**Then** I see my overall completion percentage
**And** I see completion status for each week (completed, in-progress, locked)
**And** I see my assessment scores and grades
**And** I see upcoming modules and their release dates
**And** I can view my attendance record for live sessions (if applicable)
**And** I can see time remaining until cohort completion
**And** the dashboard updates in real-time as I complete activities

### Story 8.7: Certificate Generation

As a **platform system**,
I want **to generate completion certificates for participants who pass assessments**,
So that **participants receive recognized credentials** (FR43).

**Acceptance Criteria:**

**Given** a participant has completed all 12 weeks and passed all assessments
**When** the certificate generation runs
**Then** the system verifies all completion requirements are met
**And** a certificate PDF is generated with: participant name, cohort title, completion date, instructor signature
**And** the certificate is stored in Firestore (base64 encoded)
**And** the participant receives an email with the certificate attached
**And** the participant can download the certificate from their dashboard
**And** certificates include a unique verification code
**And** certificate generation is logged in the audit trail

### Story 8.8: Cohort Discussion Boards

As a **participant**,
I want **to participate in cohort discussion boards**,
So that **I can engage with peers and instructors** (FR44).

**Acceptance Criteria:**

**Given** I am enrolled in a cohort
**When** I access the discussion board
**Then** I can view discussion threads organized by week/topic
**And** I can create new discussion threads
**And** I can reply to existing threads
**And** I can upvote helpful posts
**And** I can attach files to my posts (base64 encoded)
**And** the instructor can pin important threads
**And** I receive notifications when someone replies to my threads
**And** the discussion board updates in real-time using Firestore listeners

## Epic 9: Content & Marketing Management

Marketing staff can create, schedule, and publish content across multiple channels with co-branding support. This epic provides the content creation and distribution system with wizard templates, multi-channel scheduling, co-branding for consortium partners, performance analytics, and media library management.

### Story 9.1: Create Content with Wizard Templates

As a **marketing staff member**,
I want **to create blog posts, landing pages, and social media content using wizard templates**,
So that **I can efficiently produce consistent, high-quality content** (FR45, FR46).

**Acceptance Criteria:**

**Given** I am logged in as marketing staff
**When** I create new content
**Then** I can select content type (blog post, landing page, social media post, email)
**And** I am presented with a wizard template for the selected type
**And** the wizard guides me through required fields (title, body, images, CTA, SEO metadata)
**And** I can use pre-built templates for common content types (event announcement, case study, product feature, thought leadership)
**And** I can save content as draft or publish immediately
**And** content is stored in Firestore `CONTENT` collection
**And** I can preview content before publishing

### Story 9.2: Multi-Channel Content Scheduling

As a **marketing staff member**,
I want **to schedule content publication across multiple channels**,
So that **I can coordinate content releases efficiently** (FR47).

**Acceptance Criteria:**

**Given** I have created content
**When** I schedule publication
**Then** I can select target channels (website blog, LinkedIn, Twitter, email newsletter)
**And** I can set publication date and time for each channel
**And** I can schedule different publication times for different channels
**And** scheduled content is queued in Firestore with publication timestamps
**And** a background job (Vercel Cron) publishes content at scheduled times
**And** I receive confirmation when content is published
**And** I can view a calendar of scheduled content
**And** I can edit or cancel scheduled publications

### Story 9.3: Co-Branding for Consortium Partners

As a **marketing staff member**,
I want **to apply co-branding for consortium partner content**,
So that **partner content maintains brand consistency** (FR48).

**Acceptance Criteria:**

**Given** I am creating content for a consortium partner
**When** I select co-branding options
**Then** I can choose which partner's branding to apply
**And** the partner's logo, colors, and fonts are automatically applied
**And** I can customize co-branding elements (primary/secondary logos, taglines)
**And** co-branded content includes both platform and partner branding
**And** I can preview co-branded content before publishing
**And** co-branding settings are stored per partner in Firestore
**And** partners can review co-branded content before publication (optional approval workflow)

### Story 9.4: Content Performance Analytics

As a **marketing staff member**,
I want **to view content performance analytics**,
So that **I can measure content effectiveness and optimize strategy** (FR49).

**Acceptance Criteria:**

**Given** I have published content
**When** I view the analytics dashboard
**Then** I see performance metrics: views, clicks, shares, conversions, engagement rate
**And** I can filter analytics by content type, channel, date range, or author
**And** I can see top-performing content ranked by engagement
**And** I can view traffic sources and referrers
**And** I can export analytics reports to CSV
**And** analytics integrate with Google Analytics 4 or Mixpanel
**And** metrics update daily via background job

### Story 9.5: Educational Resources Library

As a **user**,
I want **to browse educational resources and articles**,
So that **I can learn about compliance, certifications, and best practices** (FR50).

**Acceptance Criteria:**

**Given** I am on the platform
**When** I navigate to `/resources`
**Then** I see a library of educational content organized by category
**And** categories include: CMMC, certifications, compliance, government contracting, case studies
**And** I can search resources by keyword
**And** I can filter resources by category, topic, or content type
**And** each resource shows: title, description, author, publish date, read time
**And** I can bookmark resources for later reading
**And** resources are accessible to all user types (no login required for public content)

### Story 9.6: Media Library Management

As a **marketing staff member**,
I want **to manage a media library with upload and organization capabilities**,
So that **I can reuse images, videos, and documents across content** (FR51).

**Acceptance Criteria:**

**Given** I am logged in as marketing staff
**When** I access the media library
**Then** I can upload media files (images, videos, PDFs, documents)
**And** files are converted to base64 and stored in Firestore
**And** I can organize media into folders by category or campaign
**And** I can tag media with keywords for easy searching
**And** I can search and filter media by name, tag, type, or upload date
**And** I can preview media before inserting into content
**And** I can delete or replace media files
**And** media usage is tracked (which content pieces use which media)

## Epic 10: Event Management & Sponsorships

Consortium partners can create events with registration and payment, while users can browse, register, and attend events. This epic extends the existing event management infrastructure with full registration workflows, payment processing, email notifications, attendance tracking, and sponsorship management.

### Story 10.1: Create and Configure Events

As a **consortium partner**,
I want **to create and configure events with registration**,
So that **I can host training sessions, webinars, and networking events** (FR52).

**Acceptance Criteria:**

**Given** I am logged in as a consortium partner
**When** I create a new event
**Then** I can set event details: title, description, date/time, location (physical or virtual), capacity
**And** I can set registration options: open, invite-only, waitlist
**And** I can set pricing (free or paid) and payment options
**And** I can upload event images and materials (base64 encoded)
**And** I can configure registration fields (name, email, company, custom questions)
**And** the event is stored in the existing Firestore events collection
**And** I can publish the event to make it visible for registration

### Story 10.2: Browse and View Event Details

As a **user**,
I want **to browse upcoming events and view event details**,
So that **I can discover relevant events to attend** (FR53).

**Acceptance Criteria:**

**Given** I am on the platform
**When** I navigate to `/events`
**Then** I see a list of upcoming events sorted by date
**And** I can filter events by type (training, webinar, networking, conference)
**And** I can filter events by date range or location
**And** I can search events by keyword
**And** each event listing shows: title, date, location, price, available seats
**And** I can click on an event to view full details
**And** event details include: description, agenda, speakers, sponsors, registration information

### Story 10.3: Event Registration with Payment

As a **user**,
I want **to register for events with payment processing**,
So that **I can secure my spot at paid events** (FR54).

**Acceptance Criteria:**

**Given** I am viewing an event
**When** I click "Register"
**Then** I complete the registration form with required information
**And** if the event is paid, I am redirected to Stripe checkout
**And** I can choose full payment or partial payment (using existing system)
**And** after successful payment, my registration is confirmed
**And** I receive a confirmation email with event details and calendar invite
**And** my registration is stored in Firestore
**And** the available seats count decreases
**And** if the event is full, I can join the waitlist

### Story 10.4: Event Confirmation and Reminders

As a **platform system**,
I want **to send event confirmation and reminder emails**,
So that **participants are informed and prepared for events** (FR55).

**Acceptance Criteria:**

**Given** a user has registered for an event
**When** registration is confirmed
**Then** a confirmation email is sent immediately with event details and calendar invite
**And** a reminder email is sent 7 days before the event
**And** a reminder email is sent 24 hours before the event
**And** a reminder email is sent 1 hour before the event (for virtual events)
**And** emails include event details, access links (for virtual), and any pre-event materials
**And** emails are sent using the existing email service (SendGrid/Resend)
**And** email sending is handled by background jobs

### Story 10.5: Attendance and Engagement Tracking

As a **consortium partner**,
I want **to track event attendance and engagement metrics**,
So that **I can measure event success and participant engagement** (FR56).

**Acceptance Criteria:**

**Given** I am managing an event
**When** I view the event dashboard
**Then** I see total registrations, confirmed attendees, and no-shows
**And** I can mark attendees as "attended" or "no-show"
**And** I can view engagement metrics (for virtual events): join time, duration, questions asked, polls answered
**And** I can export attendee lists and engagement reports to CSV
**And** I can see conversion rates (registrations → attendance)
**And** I can view post-event survey responses (if configured)
**And** attendance data is stored in the event document

### Story 10.6: Event Sponsorship Management

As a **consortium partner**,
I want **to manage event sponsorships and sponsor visibility**,
So that **sponsors receive appropriate recognition and value** (FR57).

**Acceptance Criteria:**

**Given** I am creating or managing an event
**When** I add sponsors
**Then** I can add sponsor details: name, logo, tier (platinum, gold, silver, bronze), website
**And** I can set sponsor visibility options (logo on event page, email mentions, booth space)
**And** sponsor logos appear on the event details page based on tier
**And** sponsor information is included in event confirmation emails
**And** I can track sponsor-specific metrics (logo impressions, link clicks)
**And** sponsors can access event attendee reports (with privacy controls)
**And** sponsor data is stored in the event document
