# API Reference - Hermes Integration Points

## Base Configuration

```
Base URL: https://kdm-assoc.com/api
Authentication: Bearer token (Firebase ID token)
Content-Type: application/json
```

## Core API Routes Available for Hermes

### Authentication
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/verify` | Verify Firebase token |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user |

### Leads
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/leads` | List leads (filterable by status, partner) |
| POST | `/api/leads` | Create new lead + auto-route |
| GET | `/api/leads/[id]` | Get single lead detail |
| PUT | `/api/leads/[id]` | Update lead (status, assignment, notes) |
| DELETE | `/api/leads/[id]` | Delete lead |

**Query Parameters:**
- `status`: `new` | `contacted` | `qualified` | `converted` | `lost`
- `partnerId`: Filter by assigned partner
- `source`: Filter by lead source

### Members / Subscriptions
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/subscription/status` | Member subscription status |
| GET | `/api/subscription/portal` | Generate Stripe billing portal URL |
| POST | `/api/subscription/cancel` | Cancel subscription |
| GET | `/api/memberships` | List all memberships |
| GET | `/api/memberships/[id]` | Get membership detail |

### Billing & Payments
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/transactions` | Transaction history |
| GET | `/api/admin/pricing` | Pricing tiers and promotions |
| POST | `/api/admin/pricing/tiers` | Create pricing tier |
| PUT | `/api/admin/pricing/tiers` | Update pricing tier |
| POST | `/api/admin/pricing/promotions` | Create promotion |
| GET | `/api/payments/history` | Payment history |
| POST | `/api/checkout/create-session` | Create Stripe checkout |

### Revenue & Settlements
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/revenue/summary` | Revenue summary by period |
| GET | `/api/revenue/attribution` | Partner attribution report |
| GET | `/api/revenue/partners` | Revenue by partner |
| GET | `/api/settlements` | Settlement history |
| POST | `/api/settlements/calculate` | Calculate next settlement |

### Events
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/events` | List events |
| POST | `/api/events` | Create event |
| GET | `/api/events/[id]` | Event detail |
| PUT | `/api/events/[id]` | Update event |
| DELETE | `/api/events/[id]` | Delete event |
| GET | `/api/events/[id]/registrations` | Event registrations |

### Proof Packs
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/proof-packs` | List proof packs |
| POST | `/api/proof-packs` | Create proof pack |
| GET | `/api/proof-packs/[id]` | Pack detail with documents |
| PUT | `/api/proof-packs/[id]` | Update pack |
| GET | `/api/proof-packs/[id]/share` | Get shareable link |
| POST | `/api/proof-packs/[id]/publish` | Publish pack |

### QA Review
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/qa/pending` | Packs awaiting review |
| PUT | `/api/qa/[id]` | Submit review decision |

### Introductions
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/introductions` | List introductions |
| POST | `/api/introductions` | Create introduction |
| GET | `/api/introductions/[id]` | Introduction detail |
| POST | `/api/introductions/[id]/respond` | Log response/outcome |

### Consortium / Partners
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/consortium/partners` | List consortium partners |
| GET | `/api/consortium/overlaps` | Service overlap alerts |
| PUT | `/api/consortium/overlaps/[id]` | Resolve overlap |
| GET | `/api/consortium/attribution` | Attribution dashboard |

### CMMC Cohorts
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/cohorts` | List cohorts |
| POST | `/api/cohorts` | Create cohort |
| GET | `/api/cohorts/[id]` | Cohort detail |
| POST | `/api/cohorts/[id]/enroll` | Enroll member |
| GET | `/api/cohorts/[id]/progress` | Progress report |

### Blog / Content
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/blog` | List posts |
| POST | `/api/blog` | Create post |
| GET | `/api/blog/[slug]` | Get post by slug |
| PUT | `/api/blog/[slug]` | Update post |
| DELETE | `/api/blog/[slug]` | Delete post |

### AI / Intelligence
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ai/chat` | IntellEDGE conversation |
| POST | `/api/ai/generate` | Content generation |
| POST | `/api/ai/match` | Opportunity matching |

### EOS/Traction
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/eos2/rocks` | List rocks |
| PUT | `/api/eos2/rocks/[id]` | Update rock |
| GET | `/api/eos2/scorecard` | Get scorecard metrics |
| GET | `/api/eos2/issues` | List issues |
| POST | `/api/eos2/todos` | Create todo |

### Dashboard / Metrics
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/dashboard` | Aggregated dashboard data |
| GET | `/api/admin/transactions` | Financial metrics |

### Notifications
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/mattermost/send` | Send Mattermost notification |
| POST | `/api/contact` | Process contact form |

---

## Webhook Endpoints (Inbound)

### Stripe Webhooks
- `POST /api/stripe/webhook` - All Stripe events
- `POST /api/webhooks/stripe` - Secondary Stripe handler

### External Webhooks
- `POST /api/gohighlevel/webhook` - GoHighLevel events
- `POST /api/webhooks/eos2` - EOS2 integration events

---

## Telegram Bot Webhook (To Be Created)

```
POST /api/telegram/webhook
```

**Expected payload:** Telegram Update object

**Security:**
- Verify `X-Telegram-Bot-Api-Secret-Token` header
- Match against `TELEGRAM_WEBHOOK_SECRET` env var
- Validate chat_id against allowlist

**Response:** Always return 200 OK (per Telegram requirements)

---

## Error Response Format

```json
{
  "error": "Human-readable error message",
  "status": 400
}
```

## Success Response Format

```json
{
  "data": { ... },
  "success": true
}
```

---

## Rate Limits

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Read operations | 100 req | 1 minute |
| Write operations | 30 req | 1 minute |
| AI endpoints | 10 req | 1 minute |
| Webhook endpoints | Unlimited | - |
| File uploads | 5 req | 1 minute |

---

## Firestore Direct Access (Admin SDK)

For operations not covered by API routes, Hermes can use Firebase Admin SDK directly:

```typescript
// Collections available for direct query
const COLLECTIONS = {
  USERS: 'users',
  TEAM_MEMBERS: 'teamMembers',
  LEADS: 'leads',
  OPPORTUNITIES: 'opportunities',
  PROJECTS: 'projects',
  ORGANIZATIONS: 'organizations',
  EVENTS: 'events',
  DOCUMENTS: 'documents',
  ACTIVITIES: 'activities',
  MEETINGS: 'meetings',
  ROCKS: 'rocks',
  SERVICES: 'services',
  CUSTOMERS: 'customers',
  CONSORTIUM_MEMBERS: 'consortium_members',
  PRICING_TIERS: 'pricing_tiers',
  PROMOTIONAL_PRICES: 'promotional_prices',
  AUDIT_LOGS: 'auditLogs',
  EMAIL_QUEUE: 'emailQueue',
};
```
