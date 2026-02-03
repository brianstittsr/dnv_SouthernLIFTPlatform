# KDM Consortium Page Development Prompt

## Overview

Create a comprehensive marketing/landing page for the **KDM Consortium** that serves as the primary entry point for Subject Matter Experts (SMEs) and Government Buyers to learn about and join the consortium. The page should be visually compelling, informative, and drive conversions through strategic CTAs.

---

## Page Location

- **Route**: `/consortium` (under marketing layout)
- **File**: `app/(marketing)/consortium/page.tsx`

---

## Logo

Use the KDM Consortium logo located at:
```
/KDM_Consortium_Logo.png
```

The logo features a pentagon shape with interconnected nodes representing collaboration across industries (manufacturing, technology, energy, agriculture, etc.).

---

## 1. Rotating Carousel Hero Section

### Requirements
- Full-width hero section with rotating carousel (auto-advance every 6 seconds)
- Manual navigation controls (dots/arrows)
- **Backend-controlled content** via Firestore collection `consortiumHeroSlides`

### Carousel Slide Schema (Firestore)
```typescript
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: "light" | "dark";
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Default Slides Content

**Slide 1: Main Value Proposition**
- Title: "Connect. Collaborate. Win."
- Subtitle: "The KDM Consortium"
- Description: "A curated network connecting certified small businesses with government buyers and prime contractors for federal contracting opportunities."
- CTA: "Join the Consortium" → `/register`

**Slide 2: For SMEs**
- Title: "Grow Your Government Business"
- Subtitle: "For Subject Matter Experts"
- Description: "Get discovered by government buyers, access exclusive opportunities, and build your proof pack to demonstrate your capabilities."
- CTA: "Register as an SME" → `/register?type=sme`

**Slide 3: For Buyers**
- Title: "Find Qualified Small Businesses"
- Subtitle: "For Government Buyers"
- Description: "Access a vetted directory of certified small businesses ready to support your mission requirements."
- CTA: "Register as a Buyer" → `/register?type=buyer`

**Slide 4: Training & Certification**
- Title: "CMMC & Compliance Training"
- Subtitle: "Expert-Led Cohorts"
- Description: "Prepare your business for government contracting with our instructor-led certification programs."
- CTA: "Explore Training" → `/training`

### Admin Management
Create admin page at `/portal/admin/consortium/hero` to manage carousel slides with:
- Add/Edit/Delete slides
- Drag-and-drop reordering
- Toggle active/inactive
- Preview functionality

---

## 2. Features & Benefits Section

### Section Title
"Why Join the KDM Consortium?"

### Features Grid (3 columns on desktop, 1 on mobile)

#### For Subject Matter Experts (SMEs)

| Feature | Description | Icon |
|---------|-------------|------|
| **Government Introductions** | Get matched with government buyers actively seeking your capabilities | Handshake |
| **Proof Pack Builder** | Create compelling capability statements with compliance documentation | FileCheck |
| **Opportunity Intelligence** | Receive curated opportunity alerts matching your NAICS codes and certifications | Target |
| **Performance Tracking** | Monitor your introduction success rate, revenue, and profile views | TrendingUp |
| **Certification Support** | Access training for 8(a), WOSB, SDVOSB, HUBZone, and CMMC certifications | Award |
| **Networking Events** | Connect with buyers and primes at exclusive consortium events | Calendar |

#### For Government Buyers

| Feature | Description | Icon |
|---------|-------------|------|
| **Vetted SME Directory** | Browse pre-qualified small businesses by capability, certification, and past performance | Search |
| **Proof Pack Access** | Review comprehensive capability documentation before introductions | FolderOpen |
| **Introduction Requests** | Request warm introductions to SMEs that match your requirements | Send |
| **Favorites & Lists** | Save and organize SMEs for current and future procurements | Star |
| **Compliance Verification** | Access verified certifications and compliance documentation | ShieldCheck |
| **Streamlined Procurement** | Reduce time-to-award with pre-vetted, ready-to-perform contractors | Clock |

#### For Instructors

| Feature | Description | Icon |
|---------|-------------|------|
| **Cohort Management** | Lead training cohorts with built-in curriculum and progress tracking | BookOpen |
| **Student Assessments** | Create and grade assessments with automated scoring | ClipboardCheck |
| **Certificate Issuance** | Issue completion certificates to successful participants | GraduationCap |
| **Revenue Sharing** | Earn commissions on cohort enrollments and certifications | DollarSign |

---

## 3. Who Is This Built For? Section

### Section Title
"Built for Government Contracting Success"

### Target Audience Cards

#### Card 1: Small Business Owners
- **Heading**: "8(a), WOSB, SDVOSB, HUBZone & MBE Certified Businesses"
- **Description**: "If you're a certified small business looking to break into or expand your government contracting portfolio, the KDM Consortium provides the connections, training, and support you need to win contracts."
- **Ideal For**:
  - First-time government contractors
  - Businesses seeking prime contractor partnerships
  - Companies pursuing CMMC certification
  - SMEs wanting to expand their federal footprint
- **CTA**: "Start Your SME Journey" → `/register?type=sme`

#### Card 2: Government Procurement Officers
- **Heading**: "Federal, State & Local Government Buyers"
- **Description**: "Streamline your small business sourcing with access to a curated directory of pre-vetted, certified contractors ready to support your mission."
- **Ideal For**:
  - Contracting Officers (COs/KOs)
  - Small Business Specialists
  - Program Managers
  - Prime Contractor Subcontracting Managers
- **CTA**: "Access the Directory" → `/register?type=buyer`

#### Card 3: Industry Experts & Trainers
- **Heading**: "CMMC, Compliance & Business Development Instructors"
- **Description**: "Share your expertise and help small businesses succeed in government contracting. Lead cohorts, issue certifications, and earn revenue."
- **Ideal For**:
  - CMMC Registered Practitioners
  - Government Contracting Consultants
  - Business Development Trainers
  - Compliance Specialists
- **CTA**: "Become an Instructor" → `/contact?subject=instructor`

---

## 4. How It Works Section

### Section Title
"Your Path to Government Contracting Success"

### SME Journey (Stepper/Timeline)

1. **Register & Verify**
   - Create your account and verify your business certifications
   - Icon: UserPlus

2. **Build Your Profile**
   - Complete your SME profile with capabilities, past performance, and NAICS codes
   - Icon: FileEdit

3. **Create Proof Pack**
   - Upload compliance documents, capability statements, and references
   - Icon: FolderPlus

4. **Get Discovered**
   - Buyers browse the directory and request introductions
   - Icon: Search

5. **Connect & Win**
   - Respond to introductions, schedule meetings, and win contracts
   - Icon: Trophy

### Buyer Journey (Stepper/Timeline)

1. **Register & Verify**
   - Create your buyer account with agency/organization details
   - Icon: UserPlus

2. **Complete Buyer Profile**
   - Specify your procurement interests, NAICS codes, and requirements
   - Icon: FileEdit

3. **Browse SME Directory**
   - Search and filter certified small businesses by capability
   - Icon: Search

4. **Review Proof Packs**
   - Access comprehensive capability documentation
   - Icon: FolderOpen

5. **Request Introductions**
   - Connect with qualified SMEs for your requirements
   - Icon: Handshake

---

## 5. Call-to-Action Section

### Primary CTA Block
- **Background**: Gradient or brand color
- **Heading**: "Ready to Transform Your Government Contracting Journey?"
- **Subheading**: "Join hundreds of small businesses and government buyers already succeeding with the KDM Consortium."

### Dual CTA Buttons
- **Primary**: "Register as an SME" → `/register?type=sme`
- **Secondary**: "Register as a Buyer" → `/register?type=buyer`

### Trust Indicators
- "500+ Certified Small Businesses"
- "50+ Government Agencies"
- "$100M+ in Facilitated Contracts"
- "98% Satisfaction Rate"

---

## 6. Onboarding Wizard Specification

### Purpose
Guide new users through completing essential profile information based on their user type (SME or Buyer) to prepare them for government introductions.

### Wizard Location
- **Route**: `/portal/onboarding`
- **Trigger**: Automatically shown after first login if profile is incomplete
- **Can be dismissed**: Yes, with reminder to complete later

### SME Onboarding Wizard Steps

#### Step 1: Business Information
- Company Name *
- DUNS/UEI Number *
- CAGE Code
- Business Address *
- Website
- Year Established
- Number of Employees

#### Step 2: Certifications
- Certification Type (multi-select): 8(a), WOSB, EDWOSB, SDVOSB, HUBZone, MBE, Other
- Certification Numbers
- Expiration Dates
- Upload Certification Documents

#### Step 3: Capabilities
- Primary NAICS Codes (up to 5) *
- Secondary NAICS Codes
- Core Capabilities (text)
- Past Performance Summary
- Key Differentiators

#### Step 4: Contact Information
- Primary Contact Name *
- Primary Contact Email *
- Primary Contact Phone *
- Secondary Contact (optional)
- Preferred Contact Method

#### Step 5: Proof Pack Setup
- Upload Capability Statement *
- Upload W-9
- Upload Insurance Certificate
- Upload Past Performance References
- Upload Additional Documents

#### Step 6: Profile Review
- Preview how profile appears to buyers
- Confirm all information is accurate
- Submit for verification

### Buyer Onboarding Wizard Steps

#### Step 1: Agency/Organization Information
- Agency/Organization Name *
- Agency Type (Federal, State, Local, Prime Contractor)
- Office/Division
- Address

#### Step 2: Role & Responsibilities
- Job Title *
- Role Type (Contracting Officer, Small Business Specialist, Program Manager, Other)
- Procurement Authority Level
- Annual Procurement Budget Range

#### Step 3: Procurement Interests
- NAICS Codes of Interest *
- Certification Preferences (8(a), WOSB, SDVOSB, HUBZone, etc.)
- Geographic Preferences
- Contract Types (FFP, T&M, IDIQ, BPA, etc.)

#### Step 4: Contact Preferences
- Preferred Contact Method
- Availability for Introductions
- Meeting Preferences (Virtual, In-Person, Phone)

#### Step 5: Profile Review
- Preview buyer profile
- Confirm information
- Activate account

### Wizard UI/UX Requirements
- Progress indicator showing current step and completion percentage
- Save progress automatically (can resume later)
- Skip optional fields but show completion percentage
- Validation on required fields before advancing
- Mobile-responsive design
- Estimated time to complete each step

### Wizard Data Storage
- Store wizard progress in user document: `users/{uid}/onboardingProgress`
- Track completion status: `isOnboardingComplete: boolean`
- Track last step completed: `lastOnboardingStep: number`

---

## 7. Technical Requirements

### Components to Create
1. `components/consortium/hero-carousel.tsx` - Rotating hero with Firestore integration
2. `components/consortium/features-grid.tsx` - Features & benefits grid
3. `components/consortium/audience-cards.tsx` - Target audience section
4. `components/consortium/how-it-works.tsx` - Journey stepper
5. `components/consortium/cta-section.tsx` - Call-to-action block
6. `components/onboarding/wizard.tsx` - Multi-step onboarding wizard
7. `components/onboarding/sme-wizard-steps.tsx` - SME-specific steps
8. `components/onboarding/buyer-wizard-steps.tsx` - Buyer-specific steps

### Admin Pages to Create
1. `app/(portal)/portal/admin/consortium/hero/page.tsx` - Manage hero slides
2. `app/(portal)/portal/admin/consortium/stats/page.tsx` - Manage trust indicators/stats

### Firestore Collections
1. `consortiumHeroSlides` - Hero carousel content
2. `consortiumStats` - Trust indicator statistics
3. Update `users` collection with onboarding fields

### Dependencies
- `embla-carousel-react` for carousel functionality
- Existing shadcn/ui components
- Lucide icons

---

## 8. SEO & Accessibility

### Meta Tags
- Title: "KDM Consortium | Connect Small Businesses with Government Buyers"
- Description: "Join the KDM Consortium to connect certified small businesses with government procurement opportunities. Access training, networking, and contract support."
- Keywords: government contracting, small business, 8(a), WOSB, SDVOSB, HUBZone, federal contracts

### Accessibility
- All images have alt text
- Carousel has pause button for motion sensitivity
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Color contrast meets WCAG AA standards

---

## 9. Mobile Responsiveness

- Hero carousel: Full-width, stacked content on mobile
- Features grid: Single column on mobile
- Audience cards: Stacked vertically
- CTAs: Full-width buttons on mobile
- Wizard: Single-column layout with larger touch targets

---

## 10. Analytics & Tracking

Track the following events:
- `consortium_page_view` - Page load
- `hero_slide_view` - Each slide impression
- `hero_cta_click` - CTA clicks from hero
- `feature_section_view` - Scroll to features
- `cta_section_click` - Main CTA clicks
- `registration_started` - Registration initiated
- `onboarding_step_completed` - Each wizard step
- `onboarding_completed` - Full wizard completion
- `onboarding_abandoned` - Wizard exit without completion

---

## Implementation Priority

1. **Phase 1**: Consortium landing page with static content
2. **Phase 2**: Hero carousel with Firestore integration
3. **Phase 3**: Admin management for carousel
4. **Phase 4**: Onboarding wizard for SMEs
5. **Phase 5**: Onboarding wizard for Buyers
6. **Phase 6**: Analytics integration

---

## Design References

- Use existing marketing page styles from `/about`, `/services`, `/contact`
- Match KDM brand colors: Navy (#1e3a5f), Gold (#c9a227), White
- Use the KDM Consortium logo prominently in hero and footer
- Maintain consistency with portal dashboard designs for wizard

---

## Success Metrics

- Conversion rate from page view to registration
- Onboarding completion rate (target: 80%+)
- Time to complete onboarding (target: <10 minutes)
- SME profile completeness score
- Buyer engagement with SME directory after onboarding
