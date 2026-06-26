# Skills Roadmap - Hermes Platform Management via Telegram

## Current Skills (Ready to Implement)

### 1. Member Management
**Trigger**: `/member`, `/members`, `/onboard`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/member list` | List all consortium members | `GET /api/admin/members` |
| `/member search [name]` | Search members by name/company | `GET /api/admin/members?search=` |
| `/member status [id]` | Get member subscription status | `GET /api/subscription/status` |
| `/member onboard [email]` | Initiate onboarding flow | `POST /api/client-registrations` |
| `/member profile [id]` | View member profile summary | `GET /api/profile/[id]` |

### 2. Lead Management
**Trigger**: `/lead`, `/leads`, `/pipeline`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/lead new` | Show recent unassigned leads | `GET /api/leads?status=new` |
| `/lead assign [id] [partner]` | Assign lead to partner | `PUT /api/leads/[id]` |
| `/lead status [id]` | Get lead status and history | `GET /api/leads/[id]` |
| `/lead pipeline` | Pipeline summary by stage | `GET /api/dashboard` |
| `/lead route [id]` | Trigger automatic routing | `POST /api/leads` (routing logic) |

### 3. Financial Operations
**Trigger**: `/revenue`, `/billing`, `/payment`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/revenue summary` | Monthly revenue breakdown | `GET /api/admin/transactions` |
| `/revenue attribution` | Partner attribution report | `GET /api/revenue/attribution` |
| `/billing status [member]` | Check member billing status | `GET /api/subscription/status` |
| `/payment recent` | List recent payments | `GET /api/admin/transactions` |
| `/promo status` | Check active promotions | `GET /api/admin/pricing` |

### 4. Event Management
**Trigger**: `/event`, `/events`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/event list` | List upcoming events | `GET /api/events` |
| `/event create [title]` | Start event creation flow | `POST /api/events` |
| `/event registrations [id]` | Show event registrations | `GET /api/events/[id]/registrations` |
| `/event remind [id]` | Send event reminder | `POST /api/events/[id]/remind` |
| `/event cancel [id]` | Cancel an event | `PUT /api/events/[id]` |

### 5. Proof Pack Operations
**Trigger**: `/pack`, `/proofpack`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/pack status [member]` | Member's pack health score | `GET /api/proof-packs?smeId=` |
| `/pack pending` | Packs awaiting QA review | `GET /api/qa/pending` |
| `/pack approve [id]` | Approve a proof pack | `PUT /api/qa/[id]` |
| `/pack gaps [member]` | Show gap analysis summary | `GET /api/proof-packs/[id]/gaps` |
| `/pack eligible` | List intro-eligible members | `GET /api/proof-packs?minHealth=70` |

### 6. Consortium Coordination
**Trigger**: `/partner`, `/consortium`, `/overlap`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/partner status` | All partners activity summary | `GET /api/consortium/partners` |
| `/partner [name] leads` | Partner's assigned leads | `GET /api/leads?partnerId=` |
| `/overlap check` | Active service overlap alerts | `GET /api/consortium/overlaps` |
| `/overlap resolve [id]` | Mark overlap as resolved | `PUT /api/consortium/overlaps/[id]` |
| `/settlement preview` | Preview quarterly settlement | `GET /api/settlements/preview` |

### 7. Content & Blog Management
**Trigger**: `/blog`, `/content`, `/news`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/blog list` | Recent blog posts | `GET /api/blog` |
| `/blog publish [id]` | Publish a draft post | `PUT /api/blog/[id]` |
| `/blog draft [topic]` | Generate AI draft on topic | `POST /api/ai/generate` |
| `/news latest` | Latest press releases | `GET /api/admin/press-releases` |
| `/content schedule` | View content calendar | `GET /api/admin/content-schedule` |

### 8. EOS/Traction Operations
**Trigger**: `/eos`, `/rocks`, `/scorecard`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/rocks status` | Current quarter rock status | `GET /api/eos2/rocks` |
| `/rocks update [id] [%]` | Update rock progress | `PUT /api/eos2/rocks/[id]` |
| `/scorecard` | Weekly scorecard metrics | `GET /api/eos2/scorecard` |
| `/issues open` | Open issues list | `GET /api/eos2/issues` |
| `/todos mine` | Your open todos | `GET /api/eos2/todos` |

### 9. CMMC Cohort Management
**Trigger**: `/cmmc`, `/cohort`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/cohort active` | Active cohorts with enrollment | `GET /api/cohorts` |
| `/cohort progress [id]` | Cohort completion rates | `GET /api/cohorts/[id]/progress` |
| `/cohort enroll [member] [id]` | Enroll member in cohort | `POST /api/cohorts/[id]/enroll` |
| `/cmmc status [member]` | Member's CMMC readiness | `GET /api/cohorts/member/[id]` |

### 10. AI & Intelligence
**Trigger**: `/ask`, `/ai`, `/intel`

| Command | Action | API Endpoint |
|---------|--------|-------------|
| `/ask [question]` | Query IntellEDGE AI | `POST /api/ai/chat` |
| `/ai match [member]` | AI opportunity matching | `POST /api/ai/match` |
| `/ai draft [type] [topic]` | Generate content draft | `POST /api/ai/generate` |
| `/intel opportunities` | New matched opportunities | `GET /api/opportunities` |

---

## Phase 2 Skills (3-6 Months)

### 11. Buyer Relationship Management
- `/buyer list` - Active buyer contacts
- `/buyer intro [sme] [buyer]` - Initiate introduction workflow
- `/buyer feedback [intro-id]` - Log buyer feedback
- `/buyer schedule [buyer]` - View buyer meeting schedule

### 12. Automated Notifications & Alerts
- Daily digest of new leads and pipeline changes
- Payment failure alerts
- Pack Health milestone celebrations
- Service overlap warnings
- Event registration milestones
- Contract award announcements

### 13. Reporting & Analytics
- `/report weekly` - Weekly KPI summary
- `/report monthly` - Monthly financial report
- `/report partner [name]` - Partner performance report
- `/report funnel` - Conversion funnel analysis
- `/report churn` - Churn risk analysis

### 14. Marketing Automation
- `/campaign status` - Active email campaigns
- `/campaign launch [id]` - Trigger campaign
- `/social schedule [post]` - Schedule social media post
- `/newsletter send` - Trigger newsletter distribution

---

## Phase 3 Skills (6-12 Months)

### 15. Advanced AI Workflows
- Automated Proof Pack gap analysis from uploaded documents
- AI-powered bid/no-bid recommendations
- Automated RFP response drafting
- Predictive member churn scoring
- Smart opportunity matching with confidence scores

### 16. Integration Orchestration
- GoHighLevel campaign management
- Apollo.io contact enrichment triggers
- ThomasNet supplier search coordination
- Calendly meeting scheduling via chat
- Mattermost channel notifications

### 17. Admin Operations
- `/deploy status` - Check deployment health
- `/deploy trigger` - Trigger Vercel deployment
- `/db backup` - Initiate Firestore backup
- `/logs errors` - Recent error log summary
- `/health check` - Platform health dashboard

---

## Technical Implementation Notes

### Telegram Bot Architecture
```
Telegram Bot API
    |
    v
Webhook Endpoint: /api/telegram/webhook (Next.js API route)
    |
    v
Command Parser -> Route to appropriate handler
    |
    v
Firebase Admin SDK -> Firestore operations
    |
    v
Response formatter -> Telegram markdown/HTML response
```

### Required Environment Variables
```env
TELEGRAM_BOT_TOKEN=<from @BotFather>
TELEGRAM_WEBHOOK_SECRET=<random string for verification>
TELEGRAM_ADMIN_CHAT_IDS=<comma-separated admin chat IDs>
TELEGRAM_NOTIFICATIONS_CHAT_ID=<group chat for notifications>
```

### Security Model
- Admin commands restricted to whitelisted Telegram chat IDs
- Read-only queries available to verified consortium partners
- Member-facing commands require Telegram-to-Firebase UID linking
- All mutations logged to Firestore audit trail
- Rate limiting: 30 commands/minute per user

### Message Formatting
- Use Telegram MarkdownV2 for rich responses
- Inline keyboards for multi-step workflows
- Callback queries for confirmation dialogs
- Photo/document messages for reports and exports
