# Event Management System Development Prompt
## Database Schema & Admin Interface for KDM Platform

**Document Version:** 1.0  
**Date:** January 12, 2026  
**Based on:** IAEOZ Summit Website Analysis

---

## Development Prompt

### Objective
Build a comprehensive Event Management System for the KDM & Associates platform that enables administrators to create, manage, and publish events similar to the IAEOZ Summit. The system should support multi-day conferences with speakers, sessions, sponsorship packages, ticket sales, and attendee management.

---

## Database Schema (Firebase Firestore)

### Collection: `events`
```typescript
interface Event {
  id: string;
  
  // Basic Info
  name: string;
  slug: string; // URL-friendly identifier
  tagline: string;
  description: string; // Rich text/HTML
  shortDescription: string; // For cards/previews
  
  // Dates
  startDate: Timestamp;
  endDate: Timestamp;
  timezone: string; // e.g., "America/Puerto_Rico"
  
  // Location
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    mapUrl?: string;
    siteMapUrl?: string; // Venue floor plan
  };
  
  // Format
  format: 'in-person' | 'virtual' | 'hybrid';
  virtualEventUrl?: string;
  livestreamUrl?: string;
  
  // Organizer
  organizer: {
    name: string;
    logo?: string;
    website?: string;
    contactEmail: string;
    contactPhone?: string;
  };
  
  // Media
  featuredImage: string;
  bannerImage?: string;
  gallery: string[]; // Array of image URLs
  videoUrl?: string; // Promo video
  
  // Hotel/Accommodation
  hotelInfo?: {
    name: string;
    bookingUrl: string;
    groupRate?: number;
    groupRateDeadline?: Timestamp;
    description?: string;
  };
  
  // SEO & Social
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string;
  tags: string[];
  
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  featured: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
}
```

### Collection: `event_speakers`
```typescript
interface EventSpeaker {
  id: string;
  eventId: string;
  
  // Personal Info
  name: string;
  title: string;
  organization: string;
  photo: string;
  bio: string; // Rich text
  shortBio?: string; // For cards
  
  // Role
  role: 'keynote' | 'speaker' | 'moderator' | 'panelist' | 'host' | 'producer';
  featured: boolean;
  
  // Contact & Social
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  
  // Presentation
  presentationType?: 'live' | 'pre-recorded' | 'virtual';
  
  // Display
  order: number;
  isVisible: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `event_schedule`
```typescript
interface EventDay {
  id: string;
  eventId: string;
  
  date: Timestamp;
  dayNumber: number; // 1, 2, 3...
  dayName: string; // "Sunday", "Monday"...
  theme?: string; // "Summit Kickoff", "Growth & Capital"
  
  sessions: EventSession[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface EventSession {
  id: string;
  dayId: string;
  eventId: string;
  
  // Timing
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  duration: number; // minutes
  
  // Content
  title: string;
  description?: string;
  type: 'keynote' | 'panel' | 'presentation' | 'workshop' | 'networking' | 'meal' | 'break' | 'registration' | 'entertainment' | 'closing';
  
  // Location
  room?: string;
  location?: string;
  
  // People
  speakerIds: string[]; // References to event_speakers
  moderatorIds?: string[];
  
  // Sponsorship
  sponsor?: {
    name: string;
    logo?: string;
  };
  
  // Virtual
  virtualLink?: string;
  recordingUrl?: string;
  
  // Display
  order: number;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `event_tickets`
```typescript
interface EventTicket {
  id: string;
  eventId: string;
  
  // Basic Info
  name: string;
  description: string;
  type: 'general' | 'vip' | 'virtual' | 'early-bird' | 'group' | 'student' | 'speaker' | 'sponsor';
  
  // Pricing
  price: number;
  currency: string; // "USD"
  originalPrice?: number; // For showing discounts
  
  // Availability
  quantity?: number; // null = unlimited
  sold: number;
  available: number;
  
  // Dates
  salesStart?: Timestamp;
  salesEnd?: Timestamp;
  
  // Access
  benefits: string[]; // What's included
  accessLevel: 'all-access' | 'main-sessions' | 'virtual-only' | 'networking-only';
  
  // Purchase
  purchaseUrl?: string; // External payment link
  stripeProductId?: string; // For Stripe integration
  stripePriceId?: string;
  
  // Display
  order: number;
  featured: boolean;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `event_sponsorships`
```typescript
interface SponsorshipPackage {
  id: string;
  eventId: string;
  
  // Basic Info
  name: string; // "Titanium Partnership Level"
  tier: 'titanium' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'custom';
  tagline: string; // "Elite Visibility — Lead. Influence. Impact."
  description: string;
  
  // Pricing
  price: number;
  currency: string;
  
  // Benefits
  benefits: SponsorBenefit[];
  
  // Inventory
  quantity?: number; // null = unlimited
  sold: number;
  
  // Purchase
  purchaseUrl?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  
  // Display
  order: number;
  featured: boolean;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SponsorBenefit {
  id: string;
  title: string;
  description: string;
  category: 'visibility' | 'access' | 'speaking' | 'networking' | 'media' | 'data';
}
```

### Collection: `event_sponsors`
```typescript
interface EventSponsor {
  id: string;
  eventId: string;
  
  // Company Info
  companyName: string;
  logo: string;
  website?: string;
  description?: string;
  
  // Sponsorship
  packageId: string; // Reference to sponsorship package
  tier: string;
  customBenefits?: string[]; // Any custom additions
  
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  
  // Payment
  amountPaid: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentDate?: Timestamp;
  invoiceId?: string;
  
  // Display
  featured: boolean;
  order: number;
  isVisible: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `event_registrations`
```typescript
interface EventRegistration {
  id: string;
  eventId: string;
  ticketId: string;
  
  // Attendee Info
  attendee: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    title?: string;
  };
  
  // Ticket Details
  ticketType: string;
  ticketPrice: number;
  quantity: number;
  totalAmount: number;
  
  // Promo/Discount
  promoCode?: string;
  discountAmount?: number;
  
  // Payment
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentId?: string; // Stripe payment ID
  paymentDate?: Timestamp;
  
  // Check-in
  checkedIn: boolean;
  checkInTime?: Timestamp;
  badgePrinted: boolean;
  
  // Communication
  confirmationSent: boolean;
  remindersSent: number;
  
  // Additional
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  notes?: string;
  
  // Status
  status: 'confirmed' | 'cancelled' | 'waitlist' | 'no-show';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `event_news`
```typescript
interface EventNews {
  id: string;
  eventId: string;
  
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Rich text/HTML
  featuredImage?: string;
  
  author: {
    name: string;
    avatar?: string;
  };
  
  category?: string;
  tags: string[];
  
  externalUrl?: string; // If linking to external article
  
  status: 'draft' | 'published';
  publishedAt?: Timestamp;
  featured: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Admin Interface Requirements

### 1. Events Dashboard (`/portal/admin/events`)
- **Event list** with status indicators
- **Quick stats**: Total events, upcoming, registrations
- **Create new event** button
- **Filter/search** by status, date, name
- **Bulk actions**: Publish, archive, delete

### 2. Event Editor (`/portal/admin/events/[id]`)
**Tabbed interface with:**

#### General Tab
- Event name, tagline, description (rich text editor)
- Date/time picker with timezone
- Format selector (in-person/virtual/hybrid)
- Status toggle (draft/published)
- Featured toggle

#### Location Tab
- Venue details form
- Google Maps integration
- Hotel/accommodation info
- Group rate management

#### Schedule Tab
- **Day manager**: Add/remove days
- **Session builder**: Drag-drop timeline
- **Session form**: Title, type, time, speakers, room
- **Speaker assignment**: Multi-select from speaker pool
- **Sponsor attribution**: Per-session sponsors

#### Speakers Tab
- **Speaker list** with photos
- **Add speaker** form with photo upload
- **Bio editor** (rich text)
- **Role assignment**: Keynote, speaker, moderator
- **Reorder** speakers (drag-drop)
- **Import** from existing speaker database

#### Tickets Tab
- **Ticket type manager**
- **Pricing configuration**
- **Quantity/availability settings**
- **Sales date controls**
- **Benefits list builder**
- **Stripe product linking**

#### Sponsorships Tab
- **Package builder** with tier system
- **Benefits checklist** builder
- **Pricing configuration**
- **Current sponsors** list
- **Add sponsor** with package assignment

#### Registrations Tab
- **Attendee list** with search/filter
- **Registration details** view
- **Check-in management**
- **Export to CSV**
- **Send communications**

#### News Tab
- **Related articles** list
- **Create/edit** news posts
- **Link external articles**

#### Settings Tab
- **SEO settings**
- **Social sharing image**
- **Email templates**
- **Notification settings**

### 3. Public Event Page (`/events/[slug]`)
- **Hero section** with event branding
- **About section** with description
- **Speakers grid** with expandable bios
- **Schedule tabs** by day
- **Tickets section** with purchase CTAs
- **Sponsorship packages** with benefits
- **Current sponsors** logo grid
- **Related news** articles
- **Contact/inquiry** form
- **Hotel booking** CTA

---

## API Endpoints

```typescript
// Events
GET    /api/events                    // List all events
GET    /api/events/[id]               // Get event details
POST   /api/events                    // Create event
PUT    /api/events/[id]               // Update event
DELETE /api/events/[id]               // Delete event

// Speakers
GET    /api/events/[id]/speakers      // List speakers
POST   /api/events/[id]/speakers      // Add speaker
PUT    /api/events/[id]/speakers/[sid] // Update speaker
DELETE /api/events/[id]/speakers/[sid] // Remove speaker

// Schedule
GET    /api/events/[id]/schedule      // Get full schedule
POST   /api/events/[id]/schedule/days // Add day
PUT    /api/events/[id]/schedule/days/[did] // Update day
POST   /api/events/[id]/schedule/sessions // Add session
PUT    /api/events/[id]/schedule/sessions/[sid] // Update session

// Tickets
GET    /api/events/[id]/tickets       // List tickets
POST   /api/events/[id]/tickets       // Create ticket type
PUT    /api/events/[id]/tickets/[tid] // Update ticket
DELETE /api/events/[id]/tickets/[tid] // Delete ticket

// Registrations
GET    /api/events/[id]/registrations // List registrations
POST   /api/events/[id]/register      // Register attendee
PUT    /api/events/[id]/registrations/[rid] // Update registration
POST   /api/events/[id]/registrations/[rid]/checkin // Check-in

// Sponsorships
GET    /api/events/[id]/sponsorships  // List packages
POST   /api/events/[id]/sponsorships  // Create package
GET    /api/events/[id]/sponsors      // List sponsors
POST   /api/events/[id]/sponsors      // Add sponsor
```

---

## Implementation Phases

### Phase 1: Core Event Management
- [ ] Event CRUD operations
- [ ] Basic event editor (general, location)
- [ ] Event listing page
- [ ] Public event page (basic)

### Phase 2: Speakers & Schedule
- [ ] Speaker management
- [ ] Schedule/day management
- [ ] Session builder
- [ ] Speaker-session linking

### Phase 3: Tickets & Registration
- [ ] Ticket type management
- [ ] Registration form
- [ ] Payment integration (Stripe)
- [ ] Confirmation emails

### Phase 4: Sponsorships
- [ ] Sponsorship package builder
- [ ] Sponsor management
- [ ] Sponsor showcase

### Phase 5: Advanced Features
- [ ] Check-in system
- [ ] Attendee communications
- [ ] Analytics dashboard
- [ ] Export/reporting

---

## UI Components Needed

```typescript
// Event Components
<EventCard />           // Event preview card
<EventHero />           // Hero section
<EventAbout />          // About section
<EventSchedule />       // Tabbed schedule
<EventSpeakers />       // Speaker grid
<EventTickets />        // Ticket cards
<EventSponsors />       // Sponsor logos
<EventNews />           // Related articles

// Admin Components
<EventEditor />         // Main editor container
<DayManager />          // Schedule day tabs
<SessionBuilder />      // Session timeline
<SpeakerForm />         // Speaker add/edit
<TicketForm />          // Ticket configuration
<SponsorshipBuilder />  // Package builder
<RegistrationTable />   // Attendee list
<CheckInScanner />      // QR code scanner
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Event creation time | < 30 minutes |
| Registration conversion | > 5% |
| Check-in speed | < 10 seconds |
| Admin satisfaction | > 4/5 rating |

---

*This prompt provides the complete specification for building the Event Management System. Use this as the foundation for development.*
