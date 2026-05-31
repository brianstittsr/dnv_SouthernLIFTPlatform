# KDM Platform User Journeys

This document describes the end-to-end user journeys for both Consortium Members and Founder Members on the KDM Strategic Value Plus platform.

---

## Table of Contents

- [Consortium Member Journey](#consortium-member-journey)
- [Founder Member Journey](#founder-member-journey)
- [Key Differences](#key-differences)
- [Shared Features](#shared-features)

---

## Consortium Member Journey

### 1. Discovery & Interest

**Entry Points:**
- Visits KDM Consortium marketing page (`/consortium`)
- Clicks on CTA to join the consortium
- Referred by existing member or partner
- Attends KDM event or webinar

**Information Gathered:**
- Membership tiers (Core Capture, Elite, Standard)
- Pricing information (with promotional discounts)
- Benefits and features
- Success stories and testimonials

### 2. Registration

**Step 1: Account Creation**
- Navigates to signup page (`/membership/signup`)
- Completes signup form with:
  - First name, last name
  - Email address
  - Phone number
  - Company name
  - Job title
- Submits form to create account

**Step 2: Authentication**
- Receives welcome email with temporary credentials
- Email contains:
  - Auto-generated username
  - Temporary password
  - Login URL
- Logs in to portal for first time

**Step 3: Membership Selection**
- Selects membership tier (Core Capture, Elite, Standard)
- Views pricing with applicable promotional discounts
- Proceeds to Stripe checkout

**Step 4: Payment**
- Completes Stripe checkout process
- Payment processed via subscription
- Webhook triggers credential generation and welcome email

### 3. Onboarding

**Step 1: Profile Completion**
- Redirected to onboarding page (`/portal/onboarding`)
- Completes SME or Buyer profile:
  - Company information
  - NAICS codes (up to 5)
  - Certifications
  - Core capabilities
  - Past performance
  - Contact preferences
  - Geographic preferences

**Step 2: Consortium-Specific Onboarding**
- Completes consortium onboarding wizard:
  - Company description
  - CEO biography
  - Company logo upload
  - Consortium pillar focus selection
  - Marketplace seller profile setup
  - Government contracting profile (CAGE code, UEI, SAM registration)

**Step 3: Dashboard Access**
- Onboarding completion confirmed
- Redirected to consortium dashboard (`/portal/consortium`)
- Can now access all consortium features

### 4. Platform Usage

**Marketplace Activities:**
- **Create Listings:**
  - Navigate to `/portal/marketplace/my-listings`
  - Click "Create New Listing"
  - Fill in listing details (product/service/capability)
  - Add categories, NAICS codes, certifications
  - Set geographic service area
  - Set visibility (public/consortium-only/OEM-only)
  - Publish listing

- **Manage Listings:**
  - View all listings in dashboard
  - Edit existing listings
  - Track views and inquiries
  - Archive old listings

- **Browse Marketplace:**
  - View other consortium member listings
  - Filter by category, certification, location
  - Send inquiries to sellers
  - Track favorite listings

**Opportunity Search:**
- **AI-Powered SAM.gov Search:**
  - Navigate to `/portal/opportunities/sam-search`
  - System automatically matches opportunities based on:
    - NAICS codes from onboarding
    - Certifications from profile
    - Geographic preferences
  - View matched opportunities with match scores
  - Filter by set-aside type, urgency, match score
  - Click through to SAM.gov for full details
  - Track opportunities of interest

**Networking:**
- **1-to-1 Meetings:**
  - Browse consortium member directory
  - Request 1-to-1 meetings with other members
  - Schedule meetings through calendar integration
  - Track meeting history and follow-ups

- **Events:**
  - View upcoming consortium events
  - Register for events
  - Access event materials and recordings

**Resources:**
- Access consortium resources and documents
- View pursuit briefs and templates
- Participate in forums and discussions
- Access training materials

### 5. Ongoing Engagement

**Account Management:**
- Update profile information
- Manage subscription (upgrade/downgrade)
- View payment history
- Update payment methods

**Support:**
- Submit support tickets
- Access help documentation
- Contact consortium support team

**Renewal:**
- Receive renewal reminders
- Review membership benefits
- Renew subscription for continued access

---

## Founder Member Journey

### 1. Discovery & Interest

**Entry Points:**
- Invited by KDM leadership
- Referred by existing founder
- Meets KDM at networking event
- Expresses interest in partnership

**Information Gathered:**
- Founder role and responsibilities
- Equity/partnership structure
- Commitment expectations
- Growth opportunities

### 2. Registration

**Step 1: Invitation Acceptance**
- Receives invitation from KDM
- Accepts invitation via link
- Completes registration form

**Step 2: Account Creation**
- Submits registration with:
  - Personal information
  - Company information
  - Professional background
  - Areas of expertise

**Step 3: Credential Generation**
- System generates temporary credentials
- Welcome email sent with:
  - Username
  - Temporary password
  - Login instructions
- Added to team members collection with "founder" tag

### 3. Onboarding

**Step 1: Profile Completion**
- Logs in to portal for first time
- Redirected to onboarding page (`/portal/onboarding`)
- Completes profile:
  - Professional background
  - Expertise areas
  - Contact information
  - Company details

**Step 2: Team Member Setup**
- Profile added to team members collection
- Role set as "affiliate" with "founder" tag
- Access to team member features enabled

**Step 3: Dashboard Access**
- Onboarding completion confirmed
- Redirected to team member dashboard (`/portal/team`)
- Can now access team member features

### 4. Platform Usage

**Team Management:**
- **Team Directory:**
  - View all team members
  - Access member profiles
  - Manage team structure

- **Scheduling:**
  - Manage team member availability
  - Schedule team meetings
  - Track team activities

**Affiliate Activities:**
- **Networking:**
  - Access affiliate networking features
  - Manage contact spheres
  - Track previous customers
  - View AI match suggestions

- **1-to-1 Meetings:**
  - Request meetings with other affiliates
  - Manage meeting queue
  - Track meeting history

**Consortium Oversight:**
- **Consortium Member Management:**
  - Access consortium members admin page (`/portal/admin/consortium-members`)
  - View all consortium members
  - Manage member status
  - Resend welcome emails to members
  - Review member profiles

- **Marketplace Oversight:**
  - Review marketplace listings
  - Monitor marketplace activity
  - Access marketplace analytics

**Leadership Activities:**
- **Strategic Planning:**
  - Access EOS VTO (Vision, Traction, Organization)
  - Participate in strategic planning
  - Review company goals

- **Performance Tracking:**
  - View traction scorecard
  - Track rocks (90-day goals)
  - Review meeting outcomes

**Administrative Functions:**
- **Admin Access:**
  - Access admin panel (`/portal/admin`)
  - Manage platform settings
  - Review platform analytics
  - Manage pricing and promotions

### 5. Ongoing Engagement

**Account Management:**
- Update profile information
- Manage team member permissions
- Review performance metrics

**Leadership Activities:**
- Participate in leadership meetings
- Review strategic initiatives
- Guide platform direction

**Support:**
- Access founder-specific resources
- Contact leadership support
- Participate in founder forums

---

## Key Differences

| Aspect | Consortium Member | Founder Member |
|--------|------------------|----------------|
| **Entry Point** | Public signup via marketing page | Invitation from KDM leadership |
| **Collection** | `consortiumMembers` | `teamMembers` (with "founder" tag) |
| **Membership Type** | Subscription-based (paid tiers) | Partnership/equity-based |
| **Onboarding Focus** | Consortium-specific, marketplace, government contracting | Team/affiliate onboarding |
| **Primary Dashboard** | `/portal/consortium` | `/portal/team` |
| **Marketplace Access** | Can create and browse listings | Oversight role, can review activity |
| **Opportunity Search** | Full access to AI-powered SAM.gov search | Oversight access |
| **Admin Access** | Limited to own listings/profile | Full admin panel access |
| **Networking** | Consortium member directory | Affiliate networking + team management |
| **Pricing** | Monthly/annual subscription fees | No subscription (founder status) |
| **Member Management** | Cannot manage other members | Can manage consortium members |
| **Support** | General consortium support | Founder-specific support |

---

## Shared Features

Both Consortium Members and Founder Members have access to:

### Authentication & Security
- Secure login with Firebase Auth
- Temporary password with forced change on first login
- Password reset functionality
- Session management

### Profile Management
- Personal profile editing
- Company information management
- Contact preferences
- Avatar/profile picture upload

### Communication
- In-platform messaging
- Email notifications
- Meeting scheduling
- Calendar integration

### Resources
- Access to documentation
- Training materials
- Templates and tools
- Help center

### Analytics
- Personal dashboard metrics
- Activity tracking
- Performance reports
- Usage analytics

---

## User Journey Maps

### Consortium Member Flowchart

```
Discovery → Signup → Payment → Welcome Email → Login → Onboarding → Dashboard
                                                              ↓
                                    Marketplace ← Opportunity Search ← Networking
```

### Founder Member Flowchart

```
Invitation → Accept → Registration → Welcome Email → Login → Onboarding → Dashboard
                                                              ↓
                    Team Management ← Consortium Oversight ← Leadership
```

---

## Success Metrics

### Consortium Member Success
- Onboarding completion rate
- Marketplace listing creation rate
- Opportunity search utilization
- Meeting participation rate
- Subscription renewal rate
- Member satisfaction score

### Founder Member Success
- Onboarding completion rate
- Team management activity
- Consortium member oversight activity
- Strategic planning participation
- Leadership engagement
- Platform contribution rate

---

## Support & Resources

### Consortium Member Support
- Email: support@kdm-assoc.com
- Documentation: `/docs/consortium-member-guide`
- Help Center: `/help/consortium`
- Training: `/training/consortium`

### Founder Member Support
- Email: founders@kdm-assoc.com
- Documentation: `/docs/founder-guide`
- Help Center: `/help/founders`
- Training: `/training/founders`

---

## Future Enhancements

### Planned for Consortium Members
- Advanced marketplace analytics
- Proposal collaboration tools
- Teaming recommendation engine
- Grant opportunity matching
- Certification tracking

### Planned for Founder Members
- Equity management dashboard
- Investor relations portal
- Advanced team analytics
- Strategic planning tools
- Performance benchmarking

---

*Document Version: 1.0*
*Last Updated: May 31, 2026*
*Maintained by: KDM Platform Team*
