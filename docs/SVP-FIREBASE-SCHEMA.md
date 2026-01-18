# SVP Platform Firebase Schema & Security Rules

## Overview

This document describes the Firebase Firestore schema and security rules for the SVP (Supplier Verification Platform) with role-based access control.

## SVP Platform Roles

| Role | Value | Description | Visible Sections |
|------|-------|-------------|------------------|
| **Platform Admin** | `platform_admin` | Full access to all SVP features | All 6 sections |
| **SME User** | `sme_user` | Manage Proof Packs, subscriptions | SVP - SME |
| **Partner User** | `partner_user` | Manage leads, introductions, revenue | SVP - Partner |
| **Buyer** | `buyer` | Browse SME directory, request intros | SVP - Buyer |
| **QA Reviewer** | `qa_reviewer` | Review Proof Pack submissions | SVP - QA Review |
| **CMMC Instructor** | `cmmc_instructor` | Create/manage training cohorts | SVP - Instructor, SVP - SME |

## Designated Platform Admin

**Email:** `bstitt@strategicvalueplus.com`

This user has been designated as the platform administrator with full access to all SVP features.

## User Document Schema

```typescript
// Collection: users/{userId}
interface UserDocument {
  uid: string;
  email: string;
  
  // Standard role (existing system)
  role: "admin" | "team_member" | "affiliate" | "customer";
  
  // SVP Platform role
  svpRole: "platform_admin" | "sme_user" | "partner_user" | "buyer" | "qa_reviewer" | "cmmc_instructor" | null;
  svpRoleUpdatedAt: Timestamp;
  svpRoleUpdatedBy: string;
  
  // SME-specific fields (for sme_user role)
  smeId?: string;
  companyName?: string;
  industry?: string;
  certifications?: string[];
  capabilities?: string[];
  subscriptionTier?: "free" | "basic" | "professional" | "enterprise";
  
  // Partner-specific fields (for partner_user role)
  partnerId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## SVP Collections Schema

### 1. Proof Packs

```typescript
// Collection: proofPacks/{packId}
interface ProofPack {
  smeId: string;
  tenantId: string;
  userId: string;
  
  name: string;
  industry: string;
  description: string;
  
  documents: Document[];
  
  packHealth: {
    overallScore: number;      // 0-100
    completeness: number;      // 40% weight
    expiration: number;        // 30% weight
    quality: number;           // 20% weight
    remediation: number;       // 10% weight
    isEligible: boolean;       // true if score >= 70
  };
  
  gaps: GapItem[];
  
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewComments?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Access Rules:
// - SME users: Read/write own packs
// - QA reviewers: Read all submitted, update status
// - Platform admins: Full access
```

### 2. Share Links

```typescript
// Collection: shareLinks/{linkId}
interface ShareLink {
  proofPackId: string;
  smeId: string;
  token: string;              // 32-byte hex token
  
  expiresAt: Timestamp;
  maxViews: number;
  viewCount: number;
  
  requireNDA: boolean;
  isActive: boolean;
  
  createdBy: string;
  createdAt: Timestamp;
  revokedAt?: Timestamp;
}

// Access Rules:
// - Public: Read (for token validation)
// - SME users: Create/update/delete own links
// - Platform admins: Full access
```

### 3. NDA Acceptances

```typescript
// Collection: ndaAcceptances/{acceptanceId}
interface NdaAcceptance {
  shareToken: string;
  proofPackId: string;
  smeId: string;
  
  buyerEmail: string;
  buyerCompany: string;
  buyerName: string;
  
  ipAddress: string;
  userAgent: string;
  
  acceptedAt: Timestamp;
}

// Access Rules:
// - Public: Create (buyers accepting NDA)
// - SME users: Read own
// - Platform admins: Full access
// - IMMUTABLE: No updates allowed
```

### 4. Leads

```typescript
// Collection: leads/{leadId}
interface Lead {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  serviceType: string;
  
  source: "website" | "event" | "api" | "manual";
  status: "new" | "contacted" | "qualified" | "converted";
  
  partnerId: string | null;
  assignedAt: Timestamp | null;
  tenantId: string;
  
  notes: string;
  followUpDate: Timestamp | null;
  lastActivityAt: Timestamp;
  
  routingScore: number;
  routingReason: string;
  
  capturedAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollection: leads/{leadId}/activities/{activityId}
interface LeadActivity {
  activityType: "call" | "email" | "meeting" | "note";
  details: string;
  outcome: string;
  activityDate: Timestamp;
  attachments: string[];
  loggedBy: string;
  createdAt: Timestamp;
}

// Access Rules:
// - Partner users: Read/write assigned leads
// - Platform admins: Full access
```

### 5. Introductions

```typescript
// Collection: introductions/{introId}
interface Introduction {
  buyerId: string;
  buyerCompany: string;
  buyerEmail: string;
  
  smeId: string;
  smeUserId: string;
  smeCompany: string;
  smeEmail: string;
  partnerId: string | null;
  
  projectDescription: string;
  timeline: string | null;
  budgetRange: string | null;
  preferredContactMethod: "email" | "phone" | "video";
  
  status: "pending" | "accepted" | "declined";
  stage: "intro" | "meeting_scheduling" | "meeting_held" | "rfq_sent" | "proposal_submitted" | "award";
  
  declineReason?: string;
  smeContactInfo?: object;
  meetingDate?: Timestamp;
  estimatedValue?: number;
  
  stageHistory: StageTransition[];
  
  requestedAt: Timestamp;
  respondedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Access Rules:
// - Buyers: Create, read/update own
// - SME users: Read/update where they are the SME
// - Partner users: Read/update where they are the partner
// - Platform admins: Full access
```

### 6. Attribution Events

```typescript
// Collection: attributionEvents/{eventId}
interface AttributionEvent {
  partnerId: string;
  smeId: string;
  buyerId: string | null;
  
  eventType: "lead_generated" | "service_delivered" | "introduction_facilitated" | "conversion_completed";
  revenueAmount: number;
  attributionPercentage: number;
  
  source: string | null;
  dealId: string | null;
  notes: string | null;
  
  settlementStatus: "pending" | "settled";
  settlementId: string | null;
  
  createdAt: Timestamp;
  createdBy: string;
  isImmutable: true;
}

// Access Rules:
// - Partner users: Read own, create
// - Platform admins: Read all
// - IMMUTABLE: No updates or deletes
```

### 7. Revenue Settlements

```typescript
// Collection: revenueSettlements/{settlementId}
interface RevenueSettlement {
  partnerId: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  
  grossRevenue: number;
  platformFeePercentage: number;  // 10%
  platformFeeAmount: number;
  netRevenue: number;
  
  eventCount: number;
  eventIds: string[];
  eventsByType: object;
  
  status: "calculated" | "paid";
  settlementDate: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
}

// Access Rules:
// - Partner users: Read own
// - Platform admins: Full access
// - IMMUTABLE: No deletes
```

### 8. Cohorts (CMMC Training)

```typescript
// Collection: cohorts/{cohortId}
interface Cohort {
  title: string;
  description: string;
  instructorId: string;
  
  startDate: Timestamp;
  duration: number;           // 12 weeks
  endDate: Timestamp;
  
  maxParticipants: number;
  enrolledCount: number;
  participants: string[];
  
  pricing: {
    fullPayment: number;
    partialPayment: number | null;
  };
  
  syllabus: string | null;    // base64
  curriculum: Week[];         // 12 weeks
  
  status: "draft" | "published" | "in_progress" | "completed";
  publishedAt: Timestamp | null;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Access Rules:
// - CMMC instructors: Create, read/update own
// - SME users: Read published cohorts
// - Platform admins: Full access
```

### 9. Cohort Enrollments

```typescript
// Collection: cohortEnrollments/{enrollmentId}
interface CohortEnrollment {
  cohortId: string;
  userId: string;
  paymentType: "full" | "partial";
  stripeSessionId: string | null;
  
  progress: {
    completedWeeks: number[];
    assessmentScores: Record<number, number>;
    overallCompletion: number;
  };
  
  enrolledAt: Timestamp;
  status: "active" | "completed" | "dropped";
  certificateGenerated: boolean;
  certificateUrl: string | null;
}

// Access Rules:
// - SME users: Create, read/update own
// - CMMC instructors: Read for their cohorts
// - Platform admins: Full access
```

### 10. Audit Logs

```typescript
// Collection: auditLogs/{logId}
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: object;
  timestamp: Timestamp;
  createdAt: Timestamp;
}

// Access Rules:
// - Platform admins: Read only
// - System: Create
// - IMMUTABLE: No updates or deletes
```

## Security Rules Summary

### Helper Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Get user's SVP role from Firestore
function getSvpRole() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.svpRole;
}

// Check if user is platform admin
function isSvpPlatformAdmin() {
  return isAuthenticated() && getSvpRole() == 'platform_admin';
}

// Check specific SVP roles
function isSvpSmeUser() { return isAuthenticated() && getSvpRole() == 'sme_user'; }
function isSvpPartnerUser() { return isAuthenticated() && getSvpRole() == 'partner_user'; }
function isSvpBuyer() { return isAuthenticated() && getSvpRole() == 'buyer'; }
function isSvpQaReviewer() { return isAuthenticated() && getSvpRole() == 'qa_reviewer'; }
function isSvpCmmcInstructor() { return isAuthenticated() && getSvpRole() == 'cmmc_instructor'; }
```

### Access Matrix

| Collection | Platform Admin | SME User | Partner User | Buyer | QA Reviewer | Instructor |
|------------|----------------|----------|--------------|-------|-------------|------------|
| proofPacks | Full | Own | - | - | Read/Review | - |
| shareLinks | Full | Own | - | - | - | - |
| ndaAcceptances | Full | Own | - | Create | - | - |
| leads | Full | - | Assigned | - | - | - |
| introductions | Full | Own | Own | Own | - | - |
| attributionEvents | Read | - | Own | - | - | - |
| revenueSettlements | Full | - | Own | - | - | - |
| cohorts | Full | Read Published | - | - | - | Own |
| cohortEnrollments | Full | Own | - | - | - | Read |
| auditLogs | Read | - | - | - | - | - |

## Setup Instructions

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Initialize Platform Admin

After deploying, the designated platform admin (`bstitt@strategicvalueplus.com`) should:

1. Sign in to the platform
2. Navigate to `/portal/admin/svp-dashboard`
3. Call the setup endpoint: `POST /api/admin/setup-svp-admin`

This will:
- Set the `svpRole` to `platform_admin` in Firestore
- Set custom claims for the user
- Log the action in audit logs

### 3. Assign SVP Roles to Users

Platform admins can assign SVP roles via:
- API: `PUT /api/admin/svp-roles`
- Admin UI: SVP Role Management page

## API Endpoints

### Admin Setup
- `POST /api/admin/setup-svp-admin` - Initialize platform admin
- `GET /api/admin/setup-svp-admin` - Check admin status

### SVP Role Management
- `GET /api/admin/svp-roles` - List all users with SVP roles
- `PUT /api/admin/svp-roles` - Update user's SVP role

## Components

### RequireAuth Component

Protect pages with authentication and role requirements:

```tsx
import { RequireAuth, RequireSvpAdmin, RequireSvpRole } from "@/components/auth/require-auth";

// Require any authentication
<RequireAuth>
  <ProtectedPage />
</RequireAuth>

// Require platform admin
<RequireSvpAdmin>
  <AdminPage />
</RequireSvpAdmin>

// Require specific SVP roles
<RequireSvpRole roles={["qa_reviewer", "platform_admin"]}>
  <QAPage />
</RequireSvpRole>
```

### SVP Role Switcher Component

For platform admins to preview the platform as different roles:

```tsx
import { SvpRoleSwitcher } from "@/components/portal/svp-role-switcher";

<SvpRoleSwitcher 
  onRoleChange={(role) => console.log("Preview role:", role)}
  showPreviewMode={true}
/>
```

## Testing Permissions

Platform admins can test permissions by:

1. Using the "Preview as Role" dropdown in the sidebar
2. Using the SVP Role Switcher component
3. The sidebar will show only sections visible to the selected role

This allows admins to verify that security rules are working correctly without needing to create test accounts for each role.
