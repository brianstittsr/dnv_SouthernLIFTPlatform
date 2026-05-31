# KDM Consortium Member Pipeline Architecture

## Database Schema Design

### Collections Overview

```typescript
// User Management
users: {
  uid: string
  email: string
  tempPassword: string
  isTempPassword: boolean
  profileComplete: boolean
  onboardingStep: number
  subscription: Subscription
  createdAt: Timestamp
}

// Business Profiles
businessProfiles: {
  userId: string
  businessType: 'contractor' | 'buyer' | 'supplier' | 'oem'
  companyName: string
  samGovData: SAMGovData
  certifications: Certification[]
  naicsCodes: NAICSCode[]
  capabilities: Capability[]
  pastPerformance: PastPerformance[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Opportunity Matching
opportunityMatches: {
  userId: string
  opportunityId: string
  matchScore: number
  matchReasons: string[]
  status: 'new' | 'viewed' | 'interested' | 'responding' | 'responded'
  matchedAt: Timestamp
}

// Teaming Recommendations
teamingRecommendations: {
  userId: string
  opportunityId: string
  recommendedPartners: RecommendedPartner[]
  generatedAt: Timestamp
}

// Proposal Generation
proposals: {
  id: string
  userId: string
  opportunityId: string
  teamingPartners: string[]
  scope: ProjectScope
  sections: ProposalSection[]
  qualityScore: number
  recommendations: QualityRecommendation[]
  status: 'draft' | 'review' | 'final' | 'submitted'
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Opportunity Documents
opportunityDocuments: {
  opportunityId: string
  originalUrl: string
  extractedText: string
  aiScope: ProjectScope
  processedAt: Timestamp
}
```

### Key Data Structures

```typescript
interface SAMGovData {
  uei: string
  samRegistration: {
    status: 'active' | 'expired'
    expires: Timestamp
    poc: PointOfContact
  }
  naicsCodes: {
    primary: string[]
    secondary: string[]
  }
  capabilities: string[]
}

interface Certification {
  type: 'CMMC' | 'ISO' | '8(a)' | 'WOSB' | 'HUBZone' | 'Other'
  level?: string
  issuedBy: string
  issuedDate: Timestamp
  expiresDate?: Timestamp
  documentUrl?: string
}

interface NAICSCode {
  code: string
  description: string
  relevance: 'primary' | 'secondary'
  experience: number // years
}

interface ProjectScope {
  summary: string
  requirements: string[]
  deliverables: string[]
  timeline: string
  budget: string
  riskFactors: string[]
  aiGenerated: boolean
}

interface RecommendedPartner {
  userId: string
  companyName: string
  matchScore: number
  sharedCapabilities: string[]
  complementaryCapabilities: string[]
  pastPerformance: PastPerformance[]
  contactInfo: ContactInfo
}
```

## API Endpoints Structure

### Authentication & Onboarding
```
POST /api/auth/signup-with-subscription
POST /api/auth/verify-temp-password
PUT  /api/auth/complete-onboarding
GET  /api/auth/onboarding-status
```

### Business Profile Management
```
GET    /api/profile/business
PUT    /api/profile/business
POST   /api/profile/naics-codes
POST   /api/profile/certifications
POST   /api/profile/capabilities
```

### Opportunity Matching
```
GET    /api/opportunities/matched
POST   /api/opportunities/select-for-response
GET    /api/opportunities/teaming-recommendations/{opportunityId}
```

### Document Processing
```
POST   /api/opportunities/upload-document
POST   /api/opportunities/ai-scope/{opportunityId}
POST   /api/opportunities/enhance-text
```

### Proposal Generation
```
POST   /api/proposals/create
PUT    /api/proposals/{id}/sections
POST   /api/proposals/{id}/quality-check
GET    /api/proposals/{id}/download
POST   /api/proposals/{id}/submit
```

## Integration Requirements

### External Services
- **Stripe**: Recurring subscription management
- **SendGrid/Resend**: Email notifications
- **OpenAI**: Document analysis and text enhancement
- **SAM.gov API**: Real-time UEI validation
- **FedSpending.gov**: Opportunity data aggregation

### AI/ML Components
- **NAICS Code Matching**: Cosine similarity on business capabilities
- **Teaming Partner Recommendations**: Collaborative filtering + content-based
- **Document Scoping**: NLP extraction from RFP documents
- **Quality Assessment**: Rule-based + ML scoring system

## Security Considerations
- Temporary passwords expire after 48 hours
- Business profile data encryption at rest
- Document upload virus scanning
- Rate limiting on AI endpoints
- Audit logging for all proposal activities

## Performance Optimization
- Opportunity matching cached for 24 hours
- Teaming recommendations pre-computed
- Document processing async with webhooks
- Proposal generation queued for high-volume periods
