# Prompt: Implement KDM Consortium Slides as Website Features with CRUD Admin

Based on the KDM-Consortium-Slides-v2.html content, implement the following features on the KDM Website and Admin Portal with full CRUD capabilities:

---

## 🎯 OVERVIEW

Convert the 6-slide consortium presentation into a dynamic, database-driven website experience with an admin panel for content management.

---

## 📊 SLIDE 1: Platform Launch Announcement

**Slide Content:**
- Badge: "WORLD DEBUT // PLATFORM LAUNCH"
- Title: "KDM Consortium Digital Platform"
- Date: "May 6, 2026"
- Description: Free virtual launch event during National Small Business Week
- CTA: "Learn More" → `/kdm-launch`

**Implementation Requirements:**

### Database Schema (Firestore)
```typescript
interface PlatformLaunchDoc {
  id: string;
  isActive: boolean;
  badge: string;
  title: string;
  eventDate: Timestamp;
  description: string;
  eventDetails: {
    type: string; // "Free Virtual Event"
    dateTime: string; // "May 6, 2026 at 11:30 AM ET"
    audience: string; // "Open to All SMBs & Manufacturers"
  };
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Public Website Components
- Hero carousel slide with space/Earth background
- Countdown timer to event date
- Event registration form integration

### Admin CRUD Features
- **List View:** All launch announcements with status toggle
- **Create:** Add new launch events with date picker, image upload
- **Edit:** Modify event details, toggle active status
- **Delete:** Archive or permanently delete events
- **Preview:** Live preview of hero slide appearance

---

## 📊 SLIDE 2: $9 Trillion Manufacturing Boom (News Article)

**Slide Content:**
- Badge: "FEDERAL CONTRACTING OPPORTUNITY"
- Title: "$9 Trillion Manufacturing Boom"
- Description: Major corporations committed $9T to U.S. manufacturing
- CTA: "Learn More" → News article page

**Implementation Requirements:**

### Database Schema (Firestore)
```typescript
interface NewsArticleDoc {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  category: "news-blog" | "federal-contracting" | "manufacturing";
  featured: boolean;
  publishDate: Timestamp;
  sourceUrl?: string;
  heroSlideConfig: {
    isActive: boolean;
    subtitle: string;
    description: string;
    backgroundImage: string;
    backgroundColor: string;
    ctaText: string;
    order: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Public Website Components
- Hero carousel slide with Pexels manufacturing image
- Full article page at `/news/{slug}`
- Related articles section
- Social share buttons

### Admin CRUD Features
- **Rich Text Editor:** Markdown/WYSIWYG for article content
- **SEO Management:** Meta tags, keywords, slug customization
- **Hero Slide Toggle:** Enable/disable from carousel
- **Image Upload:** Featured image and inline article images
- **Scheduling:** Publish immediately or schedule for later
- **Category Management:** Create/edit article categories

---

## 📊 SLIDE 3: Selective Network Overview

**Slide Content:**
- Badge: "SELECTIVE NETWORK"
- Title: "Join an Exclusive Network of Government Contracting Experts"
- Description: "12-50 Expert Companies. One Mission: Winning Together."
- Benefits: 12-50 curated members, Hand-picked by capability fit, High-touch not mass market
- CTA: "Learn More" → `/consortium`

**Implementation Requirements:**

### Database Schema (Firestore)
```typescript
interface ConsortiumOverviewDoc {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  stats: {
    memberCount: string; // "12-50"
    selectionCriteria: string;
    serviceModel: string;
  };
  pillars: ConsortiumPillar[];
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  isActive: boolean;
  order: number;
}

interface ConsortiumPillar {
  id: string;
  icon: string; // emoji or icon name
  title: string;
  description: string;
  color: string; // hex code
}
```

### Public Website Components
- Hero carousel slide
- `/consortium` landing page with all pillars
- Interactive member capacity calculator

### Admin CRUD Features
- **Pillar Management:** Add/edit/delete the 5 strategic pillars
- **Benefits List:** Reorder, add, remove benefit bullets
- **Stats Editor:** Update member count range, service model
- **Color Picker:** Customize background gradient colors
- **Icon Selector:** Choose Lucide icons or emoji for each pillar

---

## 📊 SLIDE 4: User Profile / Government Contracting Readiness

**Slide Content:**
- Badge: "GOVERNMENT CONTRACTING READY"
- Title: "Your Manufacturing Profile for Federal Contracts"
- Description: Complete verified capability profile to match with opportunities
- Benefits: 500+ NAICS codes, CMMC certification levels (1-3), Set-aside certifications (8(a), WOSB, SDVOSB, HUBZone)
- CTA: "Complete Profile" → `/portal/profile`

**Implementation Requirements:**

### Database Schema (Firestore) - Extend Existing
```typescript
interface EnhancedUserProfileDoc {
  // Existing fields...
  
  // New Manufacturing-Specific Fields
  manufacturingCapabilities: {
    naicsCodes: string[]; // 500+ options
    cmmcLevel: 1 | 2 | 3 | null;
    setAsideCertifications: Array<"8(a)" | "WOSB" | "SDVOSB" | "HUBZone" | "MBE">;
    productionCapacity: {
      maxContractValue: number;
      geographicCoverage: string[];
      equipmentList: string[];
    };
    pastPerformance: PastPerformanceEntry[];
    certifications: Certification[];
  };
  profileCompleteness: number; // 0-100%
  isVerified: boolean;
  verifiedAt: Timestamp;
}

interface PastPerformanceEntry {
  id: string;
  contractNumber: string;
  agency: string;
  contractValue: number;
  completionDate: Timestamp;
  description: string;
  outcome: "success" | "partial" | "ongoing";
}
```

### Public Website Components
- Hero carousel slide
- Enhanced profile wizard with progress steps
- NAICS code searchable selector (500+ codes)
- CMMC certification upload and verification
- Set-aside certification document upload

### Admin CRUD Features
- **NAICS Code Management:** Import/update 500+ NAICS codes with descriptions
- **Certification Templates:** Define required docs for each certification type
- **Verification Queue:** Review and approve submitted certifications
- **Profile Completeness Rules:** Configure what fields count toward 100%
- **Export Profiles:** Download member profiles as CSV/PDF

---

## 📊 SLIDE 5: Smart Matching & AI Opportunity Delivery

**Slide Content:**
- Badge: "INTELLIGENT OPPORTUNITY DELIVERY"
- Title: "Smart Matching for Government Opportunities"
- Description: AI-powered matching connects you with federal contracts and teaming partners
- Benefits: Personalized opportunity feed, AI-suggested teaming partners, Real-time contract alerts
- 3-Step Process: AI identifies contract & gaps → Match with compatible members → Submit winning proposal together
- Features: In-Platform Messaging, 2-5x Larger Contracts, 80% Faster Response, 100% Vetted Teammates

**Implementation Requirements:**

### Database Schema (Firestore) - Extend Existing
```typescript
interface AIMatchingConfigDoc {
  id: string;
  matchingWeights: {
    naicsMatch: number;
    certificationMatch: number;
    capacityMatch: number;
    geographicMatch: number;
    pastPerformance: number;
  };
  matchingRules: {
    minMatchScore: number; // 0-100
    maxSuggestionsPerUser: number;
    refreshFrequency: "realtime" | "daily" | "weekly";
  };
  notificationSettings: {
    emailAlerts: boolean;
    inAppNotifications: boolean;
    smsAlerts: boolean;
  };
  isActive: boolean;
  updatedAt: Timestamp;
}

interface OpportunityMatchDoc {
  id: string;
  userId: string;
  opportunityId: string;
  matchScore: number;
  matchReasons: string[];
  suggestedTeammates: Array<{
    userId: string;
    compatibilityScore: number;
    complementaryCapabilities: string[];
  }>;
  status: "pending" | "viewed" | "saved" | "passed";
  createdAt: Timestamp;
}
```

### Public Website Components
- Hero carousel slide with team collaboration image
- AI Matching dashboard at `/portal/opportunities`
- Opportunity cards with match scores
- Teammate suggestion carousel
- In-platform messaging system

### Admin CRUD Features
- **Matching Algorithm Config:** Adjust match score weights
- **Opportunity Management:** Add/edit federal contract opportunities
- **Matching Rules:** Configure min scores, suggestion limits
- **Notification Settings:** Manage alert preferences globally
- **Match Analytics:** View match success rates, user engagement

---

## 📊 SLIDE 6: Why Join - Membership Benefits Summary

**Slide Content:**
- Badge: "WHY JOIN KDM CONSORTIUM"
- Title: "The 'What Works' Approach to Winning Government Contracts"
- 4 Feature Cards:
  1. **Intelligent Opportunity Discovery** (Orange) - No more daily SAM.gov searches
  2. **Pre-Vetted Teaming Network** (Green) - Access 12-50 hand-picked manufacturers
  3. **Rapid Response Infrastructure** (Blue) - Built-in tools for faster proposals
  4. **Verified B2B Marketplace** (Purple) - Showcase capabilities to DoD primes
- What Works Structure: 4-step process (Complete Profile → Receive Matches → Respond Rapidly → Win & Deliver)
- Stats: $650/month promo, 12-50 vetted members, 5 strategic pillars

**Implementation Requirements:**

### Database Schema (Firestore)
```typescript
interface MembershipBenefitsDoc {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  featureCards: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string; // border/accent color
    gradient: string; // background gradient
  }>;
  processSteps: Array<{
    step: number;
    title: string;
    description: string;
    color: string;
  }>;
  stats: {
    pricing: {
      promotional: number;
      regular: number;
      unit: string;
    };
    memberRange: string;
    pillarsCount: number;
  };
  isActive: boolean;
  order: number;
}
```

### Public Website Components
- Hero carousel slide (Summary/Why Join)
- Dedicated `/consortium/why-join` page with all features
- Interactive process flow visualization
- Membership pricing comparison table

### Admin CRUD Features
- **Feature Card Manager:** Add/edit/remove benefit cards
- **Color Theme Editor:** Customize gradient colors for each card
- **Process Step Editor:** Modify the 4-step "What Works" structure
- **Pricing Editor:** Update promotional vs regular pricing
- **Stats Editor:** Modify member range, pillar count
- **Drag & Drop Reorder:** Reorder feature cards and process steps

---

## 🛠️ TECHNICAL IMPLEMENTATION GUIDE

### 1. Firestore Collections Structure
```
consortiumContent/
  ├── platformLaunches/     (Slide 1)
  ├── newsArticles/         (Slide 2)
  ├── consortiumOverviews/  (Slide 3)
  ├── aiMatchingConfig/     (Slide 5)
  ├── membershipBenefits/   (Slide 6)
  └── heroSlides/          (Aggregated for carousel)

userProfiles/
  └── {userId}/
      └── manufacturingCapabilities (Slide 4)

opportunities/
  ├── opportunities/
  └── opportunityMatches/
```

### 2. API Routes (Next.js)
```typescript
// Admin CRUD Routes
/api/admin/content/launches        [GET, POST, PUT, DELETE]
/api/admin/content/news            [GET, POST, PUT, DELETE]
/api/admin/content/benefits        [GET, POST, PUT, DELETE]
/api/admin/matching/config         [GET, PUT]
/api/admin/profiles/verify         [POST]
/api/admin/naics-codes             [GET, POST, PUT, DELETE]

// Public Routes
/api/content/hero-slides           [GET]
/api/content/news                  [GET]
/api/content/benefits              [GET]
/api/opportunities/matches         [GET, POST]
/api/profile/manufacturing         [GET, PUT]
```

### 3. Admin Panel Pages Structure
```
/portal/admin/
  ├── content/
  │   ├── hero-slides/       (Manage all 6 slides)
  │   ├── news-articles/     (CRUD for articles)
  │   ├── launches/          (Platform launch events)
  │   └── benefits/          (Membership benefits)
  ├── users/
  │   ├── profiles/          (Verify manufacturing profiles)
  │   └── certifications/    (Review uploaded docs)
  ├── matching/
  │   ├── config/            (AI algorithm settings)
  │   └── analytics/         (Match success rates)
  └── data/
      └── naics-codes/       (Manage 500+ NAICS codes)
```

### 4. Key UI Components Needed

**Shared Components:**
- `HeroCarousel` - Dynamic carousel with Firebase data
- `ContentEditor` - Rich text editor for articles
- `ImageUploader` - Drag-drop with Firebase Storage
- `ColorPicker` - Gradient/hex color selection
- `IconSelector` - Lucide icon picker
- `DraggableList` - Reorder items with drag-drop

**Admin Components:**
- `LaunchEventForm` - Date picker, event details
- `NewsArticleForm` - SEO fields, scheduling
- `BenefitCardEditor` - Feature card builder
- `MatchingConfigPanel` - Algorithm weight sliders
- `NAICSCodeManager` - Bulk import, search, edit
- `ProfileVerificationQueue` - Approve/reject certifications

**Public Components:**
- `CountdownTimer` - For launch events
- `MatchScoreBadge` - Display AI match percentages
- `TeammateSuggestionCard` - Show compatible members
- `ProfileCompletenessBar` - Visual progress indicator
- `ProcessStepVisualizer` - Animated step flow

### 5. Implementation Order (Priority)

**Phase 1: Foundation**
1. Firestore schema definitions
2. API routes for hero slides (GET)
3. Dynamic HeroCarousel component
4. Admin content management layout

**Phase 2: Content Management**
5. CRUD for Platform Launch (Slide 1)
6. CRUD for News Articles (Slide 2)
7. CRUD for Membership Benefits (Slide 6)

**Phase 3: User Features**
8. Enhanced profile manufacturing section
9. NAICS code selector (500+ codes)
10. Certification upload/verification

**Phase 4: AI Matching**
11. Opportunity matching algorithm
12. Teammate suggestion engine
13. In-platform messaging

**Phase 5: Polish**
14. Analytics dashboard
15. SEO optimization
16. Performance optimization

---

## 📝 CONTENT MIGRATION NOTES

### From HTML Slides to Database

1. **Extract Current Content:**
   - Badge text
   - Titles and subtitles
   - Descriptions
   - Benefit lists
   - CTA buttons
   - Colors and images

2. **Create Initial Seed Data:**
   ```typescript
   // Seed script to populate Firestore
   const seedSlides = async () => {
     // Slide 1: Platform Launch
     await addDoc(collection(db, "platformLaunches"), {
       badge: "WORLD DEBUT // PLATFORM LAUNCH",
       title: "KDM Consortium Digital Platform",
       eventDate: Timestamp.fromDate(new Date("2026-05-06")),
       // ... rest of fields
     });
     
     // Slide 2: Manufacturing Boom Article
     // ... seed news article
     
     // ... seed remaining slides
   };
   ```

3. **Image Assets:**
   - Download Unsplash/Pexels images used in slides
   - Upload to Firebase Storage
   - Update database records with storage URLs

---

## 🎨 DESIGN SPECIFICATIONS

### Color Palette (From Slides)
- **Primary Navy:** #1e3a5f
- **Accent Gold:** #f59e0b
- **Success Green:** #22c55e
- **Info Blue:** #3b82f6
- **Premium Purple:** #a855f7
- **Dark Background:** #0d1f33
- **Text Light:** #94a3b8

### Typography
- Headings: Inter, bold, 24-48px
- Body: Inter, regular, 14-18px
- Stats: Inter, bold, 24px with colored text

### Card Styles
- Border radius: 12-16px
- Padding: 15-20px
- Border-left accent: 4px solid color
- Background: rgba(255,255,255,0.05) to gradients

---

## ✅ ACCEPTANCE CRITERIA

### Public Website
- [ ] Hero carousel displays all 6 slides dynamically from Firestore
- [ ] Each slide has correct badge, title, description, CTA
- [ ] Images load from Firebase Storage or external URLs
- [ ] Responsive design matches HTML slide layouts
- [ ] Countdown timer works for launch events

### Admin Panel
- [ ] Can CRUD all 6 slide types
- [ ] Rich text editor for article content
- [ ] Image upload with preview
- [ ] Drag-drop reordering of slides
- [ ] Toggle active/inactive status
- [ ] Live preview before publishing
- [ ] Role-based access (admin only)

### User Features
- [ ] Profile shows manufacturing capabilities section
- [ ] NAICS code selector with 500+ options
- [ ] Certification upload with status tracking
- [ ] AI matching shows opportunity scores
- [ ] Teammate suggestions display correctly

---

## 📚 ADDITIONAL RESOURCES

- Source File: `docs/KDM-Consortium-Slides-v2.html`
- Existing Config: `lib/consortium-config.ts` (defaultHeroSlides)
- Admin Route: `/portal/admin/consortium/hero` (existing)
- Component: `components/marketing/hero-carousel.tsx`
