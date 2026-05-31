# KDM Consortium Member Pipeline - Implementation Guide

## Overview
Complete end-to-end pipeline for new KDM Consortium members from signup through professional proposal generation.

## Implementation Status

### ✅ Completed Components

| Component | Status | Files |
|-----------|--------|-------|
| **Database Schema** | ✅ Complete | `docs/KDM-PIPELINE-ARCHITECTURE.md` |
| **Signup & Payment** | ✅ Complete | `app/api/auth/signup-with-subscription/route.ts` |
| **Email Confirmation** | ✅ Complete | `app/api/auth/verify-temp-password/route.ts` |
| **Business Profile Wizard** | ✅ Complete | `components/onboarding/business-profile-wizard.tsx` |
| **Opportunity Matching** | ✅ Complete | `app/api/opportunities/matched/route.ts` |
| **Opportunity Dashboard** | ✅ Complete | `components/opportunities/opportunity-dashboard.tsx` |
| **Teaming Recommendations** | ✅ Complete | `components/opportunities/teaming-recommendations.tsx` |
| **Proposal Wizard** | ✅ Complete | `components/opportunities/proposal-wizard.tsx` |

### 🔄 In Progress Components

| Component | Status | Notes |
|-----------|--------|-------|
| **AI Document Processing** | 🔄 API stubs created | Need OpenAI integration |
| **Quality Check System** | 🔄 Framework ready | Need rule engine implementation |
| **Email Templates** | 🔄 Structure ready | Need SendGrid/Resend integration |

### ❌ Pending Components

| Component | Priority | Dependencies |
|-----------|----------|--------------|
| **AI Enhancement Engine** | High | OpenAI API keys |
| **Teaming Algorithm** | High | Collaborative filtering model |
| **Proposal Generation** | High | PDF generation library |
| **SAM.gov Integration** | Medium | API access credentials |
| **Quality Scoring** | Medium | Business rules definition |

---

## Pipeline Flow

```
1. User Signup → Stripe Payment → Account Creation
2. Email Confirmation → Temporary Password → First Login
3. Business Profile Wizard → NAICS/Certification Collection
4. Opportunity Dashboard → AI Matching → Selection
5. Teaming Partners → AI Recommendations → Partner Selection
6. Document Upload → AI Scoping → Content Creation
7. AI Enhancement → Quality Check → Proposal Generation
8. Download/Submit → Complete Response
```

---

## Technical Implementation Details

### 1. Authentication & Payment Flow

**API Endpoint**: `/api/auth/signup-with-subscription`
- Creates Stripe customer and subscription
- Generates temporary password (12-char hex)
- Sends welcome email with login instructions
- Creates user record with subscription details

**Email Template**:
```
Subject: Welcome to KDM Consortium - Your Account is Ready

Welcome to the KDM Consortium! Your account has been created successfully.

TEMPORARY LOGIN DETAILS:
Email: {email}
Password: {tempPassword}

NEXT STEPS:
1. Login with your temporary password
2. Complete your business profile
3. Start receiving matched opportunities

Your temporary password expires in 48 hours.
Please change it after your first login.

Questions? Contact us at support@kdm-assoc.com
```

### 2. Business Profile Collection

**5-Step Wizard**:
1. **Business Type Selection** - Contractor/Buyer/Supplier/OEM
2. **Company Information** - Name, SAM UEI, description
3. **NAICS Codes** - Primary/secondary with experience years
4. **Certifications** - CMMC, ISO, 8(a), WOSB, HUBZone
5. **Contact Information** - Primary contact details

**Key Features**:
- Real-time SAM.gov UEI validation
- NAICS code autocomplete with descriptions
- Certification date tracking with expiration alerts
- Progress indicator with step validation

### 3. Opportunity Matching Algorithm

**Match Scoring Formula**:
```
Base Score = Primary NAICS matches × 100 + Secondary NAICS matches × 50
Experience Bonus = Σ(min(experience_years × 5, 25) per matching NAICS)
Final Score = min(Base Score + Experience Bonus, 100)
```

**Matching Logic**:
- Query opportunities by user's NAICS codes
- Calculate match score for each opportunity
- Generate match reasons (top 3 factors)
- Update opportunity matches table
- Sort by score then posting date

### 4. Teaming Partner Recommendations

**AI Recommendation Factors**:
- **Complementary Capabilities** - Non-overlapping skills
- **Shared Experience** - Similar opportunity types
- **Past Performance** - Contract success rates
- **Geographic Proximity** - Location-based matching
- **Certification Alignment** - Complementary certifications

**Recommendation Scoring**:
```
Capability Score = 40% (complementary) + 30% (shared) + 20% (performance) + 10% (location)
```

### 5. Document Processing Pipeline

**Upload → Extract → Scope → Enhance → Generate**

**AI Scoping Process**:
1. **Document Analysis** - Extract text from PDF/DOC
2. **Requirement Extraction** - Identify key requirements
3. **Deliverable Identification** - List expected outputs
4. **Timeline Extraction** - Parse schedule/deadlines
5. **Budget Analysis** - Extract financial information
6. **Risk Assessment** - Identify potential issues

**Enhancement Features**:
- Bullet point → Professional paragraph conversion
- Passive voice → Active voice transformation
- Jargon simplification
- Structure improvement
- Grammar and style enhancement

### 6. Quality Check System

**Check Categories**:
- **Content Quality** - Completeness, clarity, relevance
- **Structure** - Logical flow, section organization
- **Compliance** - RFP requirement coverage
- **Professionalism** - Tone, formatting, grammar

**Scoring Algorithm**:
```
Content Score = 40% (completeness) + 30% (relevance) + 30% (clarity)
Structure Score = 50% (organization) + 50% (flow)
Compliance Score = 60% (requirement coverage) + 40% (formatting)
Overall Score = (Content × 0.4) + (Structure × 0.3) + (Compliance × 0.3)
```

**Recommendation Types**:
- **High Priority** - Missing critical requirements
- **Medium Priority** - Content improvements needed
- **Low Priority** - Minor formatting suggestions

---

## Database Collections Schema

### Core Collections

```typescript
// Users & Authentication
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
  samUEI: string
  naicsCodes: NAICSCode[]
  certifications: Certification[]
  capabilities: string[]
  contactInfo: ContactInfo
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Opportunities
opportunities: {
  id: string
  title: string
  description: string
  agency: string
  postedDate: Timestamp
  deadline: Timestamp
  budget: string
  naicsCodes: string[]
  status: 'active' | 'closed' | 'cancelled'
  documentUrl?: string
  aiScope?: ProjectScope
}

// Opportunity Matches
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

// Proposals
proposals: {
  id: string
  userId: string
  opportunityId: string
  teamingPartners: string[]
  sections: ProposalSection[]
  qualityScore: number
  recommendations: QualityRecommendation[]
  status: 'draft' | 'review' | 'final' | 'submitted'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup-with-subscription` - Create account + subscription
- `POST /api/auth/verify-temp-password` - Login with temp password
- `PUT /api/auth/complete-onboarding` - Mark onboarding complete

### Business Profile
- `GET /api/profile/business` - Get business profile
- `PUT /api/profile/business` - Update business profile
- `POST /api/profile/naics-codes` - Add NAICS codes
- `POST /api/profile/certifications` - Add certifications

### Opportunities
- `GET /api/opportunities/matched` - Get matched opportunities
- `POST /api/opportunities/select-for-response` - Select opportunities
- `POST /api/opportunities/teaming-recommendations` - Get teaming partners
- `POST /api/opportunities/upload-document` - Upload RFP document
- `POST /api/opportunities/ai-scope/{id}` - Generate AI scope
- `POST /api/opportunities/enhance-text` - Enhance text with AI

### Proposals
- `POST /api/proposals/create` - Create new proposal
- `PUT /api/proposals/{id}/sections` - Update sections
- `POST /api/proposals/{id}/quality-check` - Run quality check
- `GET /api/proposals/{id}/download` - Download proposal
- `POST /api/proposals/{id}/submit` - Submit proposal

---

## Integration Requirements

### External Services

| Service | Purpose | Implementation Status |
|---------|---------|----------------------|
| **Stripe** | Subscription billing | ✅ Complete |
| **SendGrid/Resend** | Email notifications | 🔄 Templates ready |
| **OpenAI** | Document analysis & enhancement | ❌ API keys needed |
| **SAM.gov API** | UEI validation | ❌ Access needed |
| **FedSpending.gov** | Opportunity data | ❌ API access needed |

### AI/ML Components

| Component | Technology | Status |
|-----------|-------------|---------|
| **NAICS Matching** | Cosine similarity | ✅ Implemented |
| **Teaming Algorithm** | Collaborative filtering | 🔄 Framework ready |
| **Document Extraction** | OCR + NLP | ❌ OpenAI needed |
| **Text Enhancement** | GPT-4 | ❌ OpenAI needed |
| **Quality Scoring** | Rule-based + ML | 🔄 Rules defined |

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with 7-day expiration
- Role-based access control
- Temporary password expiration (48 hours)
- Session management with refresh tokens

### Data Protection
- Business profile encryption at rest
- Document upload virus scanning
- PII data masking in logs
- GDPR compliance considerations

### Rate Limiting
- API endpoint rate limiting
- Document processing limits
- AI enhancement quotas
- Proposal generation limits

---

## Performance Optimization

### Caching Strategy
- Opportunity matches cached 24 hours
- Teaming recommendations cached 12 hours
- Document processing results cached
- User profile data cached

### Async Processing
- Document upload processing via webhooks
- AI enhancement queued processing
- Proposal generation background jobs
- Email notification batching

### Database Optimization
- Composite indexes on NAICS codes
- Partitioning by user regions
- Query optimization for matching
- Connection pooling

---

## Monitoring & Analytics

### Key Metrics
- User onboarding completion rate
- Opportunity match accuracy
- Proposal generation success rate
- Teaming partner acceptance rate

### Monitoring Tools
- Firebase Performance Monitoring
- Stripe webhook monitoring
- API response time tracking
- Error rate alerting

### Analytics Events
- User journey tracking
- Feature usage analytics
- Conversion funnel analysis
- A/B testing framework

---

## Deployment Checklist

### Environment Variables Required
```
# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Email
SENDGRID_API_KEY or RESEND_API_KEY

# AI Services
OPENAI_API_KEY

# Firebase
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL

# External APIs
SAM_GOV_API_KEY
FEDSPENDING_API_KEY
```

### Firestore Rules Updates
- Add business profile collection rules
- Update opportunity matching permissions
- Add proposal access controls
- Implement teaming partner visibility

### Firebase Indexes Required
- Composite index on opportunity matches (userId, status)
- NAICS code matching indexes
- Proposal query optimization indexes
- Teaming recommendation indexes

---

## Next Steps

### Immediate (1-2 weeks)
1. **Complete AI Integration** - Add OpenAI API keys
2. **Email Templates** - Complete SendGrid integration
3. **Quality Rules** - Define business rule engine
4. **Testing Suite** - Add comprehensive testing

### Short Term (3-4 weeks)
1. **SAM.gov Integration** - UEI validation API
2. **Proposal Generation** - PDF library integration
3. **Teaming Algorithm** - ML model training
4. **Performance Testing** - Load testing framework

### Medium Term (1-2 months)
1. **Mobile App** - React Native development
2. **Advanced Analytics** - Custom dashboard
3. **API Marketplace** - Third-party integrations
4. **International Expansion** - Multi-language support

---

## Success Metrics

### User Experience
- **Onboarding Completion**: Target 85%
- **Time to First Match**: < 24 hours
- **Proposal Generation**: < 30 minutes
- **User Satisfaction**: > 4.5/5

### Business Impact
- **Member Engagement**: 3+ opportunities/month
- **Teaming Success**: 40% acceptance rate
- **Proposal Quality**: 90% pass quality check
- **Revenue per Member**: $1,500+ avg monthly value

### Technical Performance
- **API Response Time**: < 200ms (95th percentile)
- **Document Processing**: < 2 minutes
- **System Uptime**: 99.9%
- **Error Rate**: < 0.1%

---

*Last Updated: May 28, 2026*
*Version: 1.0*
