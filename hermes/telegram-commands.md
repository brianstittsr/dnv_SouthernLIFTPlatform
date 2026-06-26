# Telegram Command Reference - Hermes Bot

## Quick Start

Send any command to `@KDMHermesBot` in Telegram. Admin commands are restricted to whitelisted chat IDs.

---

## Command Categories

### General
| Command | Description |
|---------|-------------|
| `/start` | Welcome message and onboarding |
| `/help` | List available commands |
| `/status` | Platform health summary |
| `/whoami` | Show your linked account info |
| `/link [email]` | Link Telegram to KDM account |

### Dashboard (Admin)
| Command | Description |
|---------|-------------|
| `/dashboard` | Daily KPI snapshot |
| `/metrics` | Key business metrics |
| `/alerts` | Unresolved alerts and warnings |
| `/activity` | Recent platform activity feed |

### Members
| Command | Description |
|---------|-------------|
| `/member list` | All active members |
| `/member search [query]` | Find member by name/company |
| `/member [id] status` | Member detail view |
| `/member [id] subscription` | Billing status |
| `/member [id] pack` | Proof Pack health |
| `/member count` | Total member count by tier |

### Leads & Pipeline
| Command | Description |
|---------|-------------|
| `/leads new` | Unassigned leads |
| `/leads today` | Leads received today |
| `/leads assign [id] [partner]` | Assign to partner |
| `/leads pipeline` | Pipeline stage counts |
| `/leads hot` | High-value qualified leads |
| `/leads overdue` | Leads needing follow-up |

### Revenue & Billing
| Command | Description |
|---------|-------------|
| `/revenue today` | Today's revenue |
| `/revenue week` | This week's revenue |
| `/revenue month` | Monthly revenue summary |
| `/revenue ytd` | Year-to-date totals |
| `/billing failures` | Failed payment alerts |
| `/billing upcoming` | Upcoming renewals |
| `/promo active` | Active promotional prices |

### Events
| Command | Description |
|---------|-------------|
| `/events upcoming` | Next 5 events |
| `/events [id] info` | Event details |
| `/events [id] attendees` | Registration list |
| `/events [id] remind` | Send reminder blast |
| `/events create` | Start event creation wizard |

### Proof Packs
| Command | Description |
|---------|-------------|
| `/packs pending` | Awaiting QA review |
| `/packs ready` | Intro-eligible packs (>=70) |
| `/packs [id] review` | Start QA review |
| `/packs [member] gaps` | Gap analysis summary |
| `/packs stats` | Pack Health distribution |

### Consortium Partners
| Command | Description |
|---------|-------------|
| `/partners status` | All partner activity |
| `/partners [name]` | Specific partner detail |
| `/partners leads [name]` | Partner's lead queue |
| `/partners attribution` | Attribution summary |
| `/overlaps` | Service overlap alerts |
| `/settlement preview` | Next settlement preview |

### CMMC Cohorts
| Command | Description |
|---------|-------------|
| `/cohorts active` | Running cohorts |
| `/cohorts [id] progress` | Cohort completion rates |
| `/cohorts enrollment` | Enrollment numbers |
| `/cmmc [member]` | Member CMMC progress |

### Content
| Command | Description |
|---------|-------------|
| `/blog recent` | Last 5 published posts |
| `/blog drafts` | Unpublished drafts |
| `/blog publish [id]` | Publish a draft |
| `/news` | Latest press releases |
| `/ai draft [topic]` | Generate content with AI |

### EOS/Traction
| Command | Description |
|---------|-------------|
| `/rocks` | Current quarter rocks |
| `/rocks [id] update [%]` | Update rock progress |
| `/scorecard` | This week's scorecard |
| `/issues` | Open issues |
| `/todos` | Your open todos |
| `/l10 prep` | Pre-meeting summary |

### Introductions
| Command | Description |
|---------|-------------|
| `/intros pending` | Pending introductions |
| `/intros [id] status` | Introduction outcome |
| `/intros match [member]` | AI-suggested buyer matches |
| `/intros funnel` | Conversion funnel stats |

### System (Super Admin)
| Command | Description |
|---------|-------------|
| `/deploy status` | Vercel deployment status |
| `/errors recent` | Recent API errors |
| `/users online` | Currently active users |
| `/cache clear` | Clear platform caches |
| `/maintenance on/off` | Toggle maintenance mode |

---

## Interactive Workflows

### Lead Assignment Flow
```
User: /leads new
Bot: 📋 3 unassigned leads:
     1. Apex Manufacturing (Defense, CMMC) - 2h ago
     2. Greenfield Energy (Energy, ISO) - 5h ago  
     3. ProTech Solutions (IT, Cyber) - 1d ago
     [Assign] [Details] [Skip]

User: [taps Assign on #1]
Bot: Assign Apex Manufacturing to:
     [V+] [ADA] [E3S] [LogiCore] [nDemand]

User: [taps V+]
Bot: ✅ Assigned Apex Manufacturing to V+ (Strategic Value Plus)
     Auto-notification sent to partner.
```

### Proof Pack Review Flow
```
User: /packs pending
Bot: 📝 2 packs awaiting QA:
     1. TechForce Inc - Score: 78 (submitted 2d ago)
     2. Blue Ridge Mfg - Score: 72 (submitted 4d ago)
     [Review] [Details]

User: [taps Review on #1]
Bot: TechForce Inc Proof Pack:
     ✅ ISO 9001 (valid)
     ✅ Capability Statement (current)
     ⚠️ Past Performance (2 of 3 required)
     ✅ CMMC Self-Assessment
     
     Score: 78/100
     [Approve] [Request Revision] [Reject]
```

### Daily Digest (Automated)
```
Bot: 🌅 Good morning! Here's your KDM daily digest:

📊 Yesterday's Numbers:
• New leads: 3
• Revenue: $4,850
• Active members: 142
• Pack submissions: 2

⚠️ Needs Attention:
• 1 failed payment (ProTech Solutions)
• 2 leads unassigned >24h
• 1 service overlap detected

📅 Today:
• 2:00 PM - CMMC Cohort #4 Session
• 4:00 PM - Buyer Briefing (Navy SPAWAR)

[View Dashboard] [Handle Alerts]
```

---

## Notification Events (Outbound)

Hermes proactively sends notifications for:

| Event | Channel | Priority |
|-------|---------|----------|
| New lead received | Admin group | Normal |
| Payment received | Admin group | Normal |
| Payment failed | Admin group + DM | High |
| Member signed up | Admin group | Normal |
| Pack Health >= 70 | Admin group | Normal |
| Service overlap detected | Affected partners | High |
| Contract award reported | All partners | Celebration |
| Event registration milestone | Admin group | Normal |
| Cohort session reminder | Enrolled members | Normal |
| Settlement ready for review | Partners | Normal |
| System error spike | Super admin | Critical |

---

## Response Formatting

### Status Indicators
- ✅ Healthy / Complete / Active
- ⚠️ Warning / Needs attention
- ❌ Error / Failed / Blocked
- 🔄 In progress / Processing
- 📊 Metrics / Data
- 💰 Financial / Revenue
- 📋 List / Queue
- 🎯 Target / Goal
- 🏆 Achievement / Win

### Number Formatting
- Currency: `$1,250.00`
- Percentages: `78%`
- Counts: `142 members`
- Dates: `Jun 20, 2026`
- Times: `2:00 PM ET`
