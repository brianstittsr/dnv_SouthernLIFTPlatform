# Platform Architecture - KDM Consortium

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | Full-stack web application |
| UI | shadcn/ui + Tailwind CSS | Component library and styling |
| Icons | Lucide React | Consistent iconography |
| State | Zustand + React Query | Client and server state |
| Database | Firebase Firestore | NoSQL document database |
| Auth | Firebase Authentication | User identity management |
| Storage | Firebase Storage | File/media uploads |
| Payments | Stripe Connect | Subscriptions, one-time, splits |
| AI | OpenAI (GPT-4) | IntellEDGE assistant, content generation |
| E-Signatures | DocuSeal | NDAs, teaming agreements |
| Communications | Mattermost | Internal team messaging |
| Email | Azure SMTP (Nodemailer) | Transactional email delivery |
| Hosting | Vercel | Deployment, CDN, serverless |
| Analytics | Google Analytics 4 | Web analytics and tracking |

## Application Structure

```
svp-platform/
├── app/
│   ├── (marketing)/          # Public pages (SEO-optimized)
│   │   ├── page.tsx          # Homepage with hero carousel
│   │   ├── about/            # Company information
│   │   ├── blog/             # SEO content hub
│   │   ├── consortium/       # Membership information
│   │   ├── cmmc/             # CMMC training pages
│   │   ├── events/           # Public event listings
│   │   ├── industries/       # Industry vertical pages
│   │   ├── news/             # Press releases
│   │   ├── pricing/          # Membership pricing
│   │   ├── services/         # Service descriptions
│   │   └── webinars/         # Webinar archive
│   │
│   ├── (portal)/             # Authenticated member portal
│   │   └── portal/
│   │       ├── admin/        # Admin controls (85 items)
│   │       ├── buyer/        # Buyer-facing features
│   │       ├── command-center/ # Main dashboard
│   │       ├── consortium/   # Consortium management
│   │       ├── dashboard/    # Member dashboard
│   │       ├── deals/        # Deal tracking
│   │       ├── eos2/         # EOS/Traction system
│   │       ├── instructor/   # LMS instructor tools
│   │       ├── marketplace/  # B2B discovery marketplace
│   │       ├── networking/   # Member networking features
│   │       ├── opportunities/ # Contract opportunities
│   │       ├── partner/      # Partner management
│   │       ├── proof-packs/  # Document verification
│   │       ├── proposals/    # Proposal management
│   │       ├── pursuits/     # Pursuit tracking
│   │       ├── sme/          # SME-specific tools
│   │       └── subscription/ # Billing management
│   │
│   └── api/                  # 60+ API route groups
│       ├── admin/            # Admin operations
│       ├── ai/               # AI/ML endpoints
│       ├── auth/             # Authentication
│       ├── billing/          # Billing operations
│       ├── checkout/         # Payment checkout
│       ├── cohorts/          # CMMC cohort management
│       ├── consortium/       # Consortium operations
│       ├── events/           # Event CRUD
│       ├── introductions/    # Buyer introductions
│       ├── leads/            # Lead management
│       ├── payments/         # Payment processing
│       ├── proof-packs/      # Proof Pack operations
│       ├── revenue/          # Revenue tracking
│       ├── settlements/      # Partner settlements
│       ├── stripe/           # Stripe webhooks
│       ├── subscription/     # Subscription management
│       └── teaming/          # Teaming agreements
│
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── marketing/            # Public site components
│   ├── portal/               # Portal components
│   └── shared/               # Cross-cutting components
│
├── lib/                      # Business logic & utilities
│   ├── firebase.ts           # Client Firebase init
│   ├── firebase-admin.ts     # Server Firebase Admin
│   ├── schema.ts             # Firestore document types
│   ├── partner-commission-schema.ts  # Revenue share types
│   ├── pricing-utils.ts      # Promotional pricing logic
│   ├── ai-matching.ts        # AI opportunity matching
│   ├── cohort-lifecycle.ts   # Cohort state management
│   ├── email.ts              # Email sending utility
│   └── services/             # Business service layer
│       └── partner-attribution.service.ts
│
├── firestore.rules           # Database security rules
├── firestore.indexes.json    # Composite indexes
└── storage.rules             # Storage security rules
```

## Firestore Collections

### Core Collections
| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | User accounts | email, role, organization, subscription |
| `teamMembers` | Internal team | name, role, category, GWC scores |
| `leads` | Sales leads | company, status, partnerId, source |
| `opportunities` | Sales pipeline | stage, value, owner, closeDate |
| `projects` | Active engagements | team, milestones, status |
| `organizations` | Company profiles | certifications, capabilities |

### Consortium Collections
| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `consortium_members` | Member registry | tier, status, subscription |
| `partner_profiles` | Partner config | payment, attribution rules |
| `partner_attributions` | Revenue attribution | partnerId, contribution, amount |
| `serviceOverlaps` | Overlap detection | company, partners, status |
| `routingRules` | Lead routing config | industries, serviceTypes, capacity |
| `settlements` | Quarterly payouts | period, partner, amount, status |

### Operations Collections
| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `events` | Event management | title, date, type, registrations |
| `proof_packs` | Document verification | smeId, health, status, documents |
| `cohorts` | CMMC training cohorts | curriculum, enrollments, progress |
| `introductions` | Buyer introductions | smeId, buyerId, status, outcome |
| `pricing_tiers` | Subscription tiers | monthlyPrice, stripeProductId |
| `promotional_prices` | Time-limited promos | tierId, validFrom, validUntil |

### EOS/Traction Collections
| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `traction_rocks` | 90-day priorities | title, owner, progress, quarter |
| `traction_scorecard` | Weekly metrics | name, goal, actual, trend |
| `traction_issues` | IDS issues | title, priority, status |
| `traction_todos` | Weekly todos | title, owner, dueDate, status |
| `traction_meetings` | L10 meetings | date, rating, issuesSolved |

### Audit & Activity
| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `activities` | Activity feed | entityType, entityId, action |
| `auditLogs` | Security audit trail | userId, action, resource, details |
| `emailQueue` | Outbound email queue | to, subject, body, status |

## Authentication & Roles

### User Roles
- **super_admin** - Full platform access (V+ team)
- **admin** - KDM admin access
- **partner_admin** - Consortium partner admin
- **partner_member** - Consortium partner staff
- **member** - SME consortium member
- **buyer** - Government/OEM buyer
- **instructor** - LMS course instructor
- **public** - Unauthenticated visitor

### Auth Flow
1. Firebase Auth (email/password, Google SSO)
2. Custom claims for role-based access
3. Server-side token verification via Firebase Admin SDK
4. Client-side auth context with role checks
5. API middleware validates Bearer tokens

## Payment Architecture

```
Member Checkout
    |
    v
Stripe Checkout Session (metadata: membershipType, plan, firebaseUid)
    |
    v
Stripe Webhook -> /api/stripe/webhook
    |
    ├── checkout.session.completed
    │   ├── Create/resolve Firebase Auth user
    │   ├── Create Firestore user document
    │   ├── Create team member record
    │   ├── Send welcome email with credentials
    │   └── Log to audit trail
    │
    ├── invoice.payment_succeeded -> Confirm subscription active
    ├── invoice.payment_failed -> Alert + grace period
    └── customer.subscription.deleted -> Deactivate member
```

## Deployment

- **Platform**: Vercel (automatic from GitHub)
- **Environment**: Production + Preview deployments
- **Domain**: kdm-assoc.com (custom domain)
- **SSL**: Automatic via Vercel
- **CDN**: Vercel Edge Network (global)
- **Serverless Functions**: Vercel Functions (API routes)
- **Build**: Next.js static + dynamic rendering
