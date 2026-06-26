# Hermes - KDM Consortium Platform Agent

## Overview

Hermes is the intelligent operations agent for the KDM & Associates Consortium Platform. It provides Telegram-based management capabilities for monitoring, operating, and coordinating the multi-tenant B2B SaaS platform.

## Documentation Structure

| File | Purpose |
|------|---------|
| `soul.md` | Agent identity, personality, operating principles |
| `business-context.md` | Business model, stakeholders, competitive positioning |
| `skills-roadmap.md` | Command capabilities by phase with API mappings |
| `platform-architecture.md` | Technical stack, database schema, deployment |
| `telegram-commands.md` | Full command reference with examples |
| `operational-workflows.md` | Business process workflows and escalation paths |
| `api-reference.md` | API endpoints available for Hermes integration |
| `knowledge-base.md` | Domain knowledge for intelligent responses |

## Quick Setup

### 1. Create Telegram Bot
```
1. Message @BotFather on Telegram
2. /newbot -> Name: "KDM Hermes" -> Username: @KDMHermesBot
3. Save the bot token
```

### 2. Environment Variables
Add to `.env.local`:
```env
TELEGRAM_BOT_TOKEN=<bot-token-from-botfather>
TELEGRAM_WEBHOOK_SECRET=<generate-random-32-char-string>
TELEGRAM_ADMIN_CHAT_IDS=<your-telegram-user-id>
TELEGRAM_NOTIFICATIONS_CHAT_ID=<admin-group-chat-id>
```

### 3. Set Webhook
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://kdm-assoc.com/api/telegram/webhook", "secret_token": "<WEBHOOK_SECRET>"}'
```

### 4. Implement Webhook Handler
Create `app/api/telegram/webhook/route.ts` to receive and process Telegram updates.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Telegram   │────▶│  /api/telegram/  │────▶│  Command Router │
│  User/Admin │◀────│  webhook         │◀────│  & Handlers     │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                              ┌─────────────────────────┤
                              ▼                         ▼
                    ┌──────────────────┐     ┌──────────────────┐
                    │  Firebase Admin  │     │  Existing API    │
                    │  (Firestore)     │     │  Routes          │
                    └──────────────────┘     └──────────────────┘
```

## Security Model

- **Admin commands**: Restricted to whitelisted Telegram chat IDs
- **Partner commands**: Require Telegram-to-Firebase account linking
- **Member commands**: Read-only access to own data
- **Mutations**: All logged to Firestore audit trail
- **Sensitive data**: Never displayed in group chats (DM only)

## Development Roadmap

### Phase 1 (Now)
- Bot creation and webhook setup
- Basic dashboard and status commands
- Lead management commands
- Revenue/billing queries
- Notification system for key events

### Phase 2 (3-6 Months)
- Interactive workflows with inline keyboards
- Automated daily/weekly digests
- Partner-specific command access
- Event management from Telegram
- Proof Pack review workflow

### Phase 3 (6-12 Months)
- AI-powered natural language queries
- Predictive alerts (churn risk, opportunity matches)
- Full CRUD operations via conversational interface
- Multi-bot architecture (separate bots for members vs admin)
- Voice message transcription and command parsing
