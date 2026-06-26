# Business Context - KDM Consortium Platform

## Company Overview

**KDM & Associates** is a government contracting consulting firm based in Washington, D.C. that operates a consortium model connecting minority-owned and small businesses with federal procurement opportunities.

**Strategic Value Plus (V+)** is the technology partner that built and maintains the platform infrastructure, operating under a 50/50 revenue share model.

## Platform URL & Deployment

- **Production**: kdm-assoc.com (Vercel)
- **Staging**: ws-kdm-svp-site.vercel.app
- **Framework**: Next.js 14+ (App Router)
- **Database**: Firebase/Firestore
- **Authentication**: Firebase Auth
- **Payments**: Stripe (Connect + Subscriptions)
- **Hosting**: Vercel with global CDN

## Business Model

### Revenue Streams
1. **Consortium Membership**: $1,250/month (promotional: $650/month until April 30, 2026)
2. **CMMC Cohort Training**: 12-week programs with enrollment fees
3. **Event Ticketing**: Webinars, workshops, conferences, buyer briefings
4. **Proof Pack Publishing**: Document preparation and verification fees
5. **Buyer Introductions**: Facilitation fees for qualified introductions
6. **Sponsorships**: Event and platform sponsorship packages
7. **Training Courses**: LMS-delivered education content
8. **Marketplace Listings**: Discovery-only verified B2B marketplace

### Revenue Split
- 50% KDM & Associates (merchant of record)
- 50% Strategic Value Plus (platform provider)

### Target Market
- **Primary**: 477+ SMEs (148 DoD contractors, manufacturing firms, CMMC candidates, critical minerals suppliers)
- **Company Size**: 10-200 employees
- **Industries**: Logistics, cyber/zero trust, IT/data, training, engineering, energy resilience, manufacturing services
- **Certifications Served**: 8(a), WOSB, SDVOSB, HUBZone, NMSDC, MBE

## Consortium Partners (6 Verticals)

| Partner | Abbreviation | Focus Area |
|---------|-------------|------------|
| Strategic Value Plus | V+ | Manufacturing readiness, supplier qualification |
| ADA Consulting | ADA | Advisory and compliance services |
| E3S Solutions | E3S | Energy, engineering, environmental |
| LogiCore Corporation | LogiCore | Supply chain and logistics |
| KDM NMSDC Chapter | KDM-NMSDC | Minority business certification |
| nDemand Technologies | nDemand | IT/technology solutions |

### Revenue Attribution Model
- **Lead Generation**: 20% to referring partner
- **Service Delivery**: 50% to delivering partner
- **Introduction Facilitation**: 20% to introducing partner
- **Platform Fee**: 10% to KDM Platform

## Core Value Proposition

The "Proof Pack + Warm Introductions" model:
1. SMEs upload compliance documents into structured Proof Packs
2. System scores "Pack Health" (0-100) with gap analysis
3. Members remediate gaps with consortium partner support
4. At Pack Health >= 70, members become "intro-eligible"
5. Platform facilitates buyer introductions with decision-makers
6. Track conversion: intro -> meeting -> RFQ -> contract award

## Key Metrics (North Star)

- **Primary**: Contract awards facilitated (target: 50 Year 1, 150 Year 2)
- **Conversion Funnel**: 40% intro-to-meeting, 25% meeting-to-RFQ, 50% RFQ-to-award
- **Revenue Target**: $1.2M Year 1, $2.4M Year 2
- **Member Retention**: <15% annual churn
- **Partner Satisfaction**: >80% with coordination and revenue share

## Key Stakeholders

- **Keith Moore** - KDM & Associates Principal
- **Nelinia "Nel" Varenas** - CEO, Strategic Value Plus Solutions (technology partner)
- **Consortium Partners** - 6 vertical partner organizations
- **SME Members** - 477+ active client companies
- **Buyers** - DoD agencies, prime contractors, OEMs, government procurement officers

## Competitive Positioning

- **Market Gap**: Minority business CMMC certification services
- **Unique Advantage**: MBDA Federal Procurement Center partnership
- **Differentiators**: 
  - Evidence-based readiness gating (not open networking)
  - Consortium coordination with automated service overlap prevention
  - Dual-lane approach (Government + Commercial procurement)
  - Technology-enabled (AI matching, automated lead routing)

## Current Platform Status

### Fully Operational
- Marketing website with SEO-optimized content
- Firebase authentication and user management
- Stripe subscription billing with promotional pricing
- Admin dashboard with full CRUD operations
- Lead management with automated routing
- Partner attribution and revenue share tracking
- Event management system
- Proof Pack system with QA review workflow
- CMMC cohort management
- Blog/content management with LinkedIn imports
- AI-powered IntellEDGE assistant
- DocuSeal NDA/agreement workflows
- Email notification system (Azure SMTP)
- EOS/Traction operating system (Rocks, Scorecard, Issues, Todos)

### Integrations
- **Stripe Connect** - Payment processing and split payouts
- **Firebase** - Database, auth, storage
- **OpenAI** - AI assistant and content generation
- **DocuSeal** - E-signatures for NDAs and agreements
- **Mattermost** - Team communications
- **Go High Level** - Marketing automation (partial)
- **Apollo.io** - Lead enrichment (partial)
- **Calendly** - Meeting scheduling
- **Google Analytics 4** - Web analytics
