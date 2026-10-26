# Southern University LIFT Rural Business Center Platform

The digital platform for the **Southern University LIFT (Louisiana Innovation for Thriving Rural Business) Center**, an MBDA Rural Business Center (MBDA-OBC-2026-00003). It is built on the `svp-platform` codebase (Next.js + Firebase) and adds the LIFT client lifecycle: intake, signed MBDA engagement, eligibility, baseline, services, training, capital readiness, procurement support, and outcome reporting.

The same codebase still runs the KDM & Associates / Strategic Value+ site. LIFT-specific wording and behavior are switched on with `NEXT_PUBLIC_BRANDING_MODE=lift` (see [Branding mode](#branding-mode)).

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui (Radix), Lucide icons, Sonner toasts
- **Data:** Firebase Auth, Firestore, and Storage (Firebase Admin SDK on the server)
- **Validation:** Zod
- **AI:** OpenAI (intake summaries, form generation, SAM.gov analysis)
- **PDF:** Puppeteer (`@sparticuz/chromium` on Vercel)
- **Package manager:** pnpm

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A Firebase project (Auth, Firestore, Storage) and a service account

### Installation

```bash
pnpm install --frozen-lockfile   # set CI=true in non-interactive shells
cp .env.example .env.local       # then fill in the values below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
# Firebase client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server only - required for all /api/lift routes)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# LIFT deployment
NEXT_PUBLIC_BRANDING_MODE=lift          # omit or "kdm" for the KDM site

# AI (optional - a rules-based fallback is used without it)
OPENAI_API_KEY=
LIFT_AI_MODEL=gpt-4o-mini

# CAPTCHA for signed-out form submissions (optional)
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# PDF export outside Vercel (optional - otherwise bundled or installed Chrome/Edge)
CHROME_PATH=
```

Never commit `.env*` files or service-account JSON. They are listed in `.gitignore`.

## LIFT Form Builder

A form builder built from `docs/svp-kdm-features/formbuilder/Adams form builder.md`, with LIFT security changes. It delivers the Part B client lifecycle forms defined in `docs/SOUTHERN Requirenments/analysis/LIFT_Onboarding_Questions.txt`.

### Where to find it

| Area | Route | Who |
| --- | --- | --- |
| Form Studio (build, preview, publish, AI assist) | `/portal/admin/lift/forms` | Admins |
| Submissions review (answers, files, PDFs, intake summary) | `/portal/admin/lift/submissions` | Staff |
| My LIFT Forms | `/portal/lift/forms` | Signed-in clients |
| Public forms (intake, workshop registration and feedback) | `/forms/[slug]` | Anyone |

### Lifecycle forms (B1-B10)

| Ref | Form | Slug | Audience |
| --- | --- | --- | --- |
| B1 | LIFT Center Intake (with AI summary) | `lift-intake` | Public |
| B2 | MBDA Client Intake & Letter of Engagement (signed) | `mbda-intake-loe` | Client |
| B3 | Rural Eligibility Attestation | `rural-eligibility` | Client |
| B4 | Baseline Assessment Survey | `baseline-survey` | Client |
| B5 | Client Service Plan / Advisor Session Log | `service-plan`, `advisor-session-log` | Staff |
| B6 | Workshop Registration / Workshop Feedback | `workshop-registration`, `workshop-feedback` | Public |
| B7 | Capital Readiness Checklist | `capital-readiness` | Client |
| B8 | Capability Library / SAM.gov Opportunity Response | `capability-library`, `proposal-response` | Client |
| B9 | Outcome Check-in (6 and 12 months) | `outcome-checkin` | Client |
| B10 | Impact Story Consent / Program Exit Survey | `impact-consent`, `program-exit` | Client |

**Seeding:** sign in as an admin, open the Form Studio, and click **Seed LIFT forms (B1-B10)** (or `POST /api/lift/forms/seed`; add `?overwrite=true` to republish the templates). All wording, options, and mappings remain editable in the Studio.

### Capabilities

- **Controls:** standard and conversational (one question at a time) modes, conditional questions, staff-only fields and sections, signatures, file uploads, repeating tables, Likert/NPS/star ratings, calculated fields, and platform lookups (parishes, events, partners, advisors, clients).
- **Records:** each answer can write to a LIFT record such as clients, baselines, sessions, capital packages, or outcome claims. Outcome check-ins create individual outcome claims for staff verification.
- **Prefill (cross-walk):** answers are indexed per client and prefill later forms. Existing client registrations and portal profiles are used as fallback sources.
- **Intake summary:** the B1 intake gets an AI needs assessment and recommended service plan, marked "pending staff review". AI never decides eligibility.
- **Integrity:** forms are versioned. Each submission records its form version, consent-text hash, signature references, and a SHA-256 content hash. Branded PDFs are available to staff and to the respondent.

### Security model

- The browser has no direct access to `lift*` Firestore collections or `lift/**` Storage paths (see `firestore.rules` and `storage.rules`).
- All reads and writes go through `app/api/lift/**`. These routes check staff or owner access, validate input with Zod, rate-limit, and write `liftAudit` events.
- Uploads are checked against their real file contents, stored in Storage, and kept only as references and hashes on submissions.
- Public submissions use a honeypot field and an optional Turnstile CAPTCHA.

### Code layout

```
lib/form-builder/            # shared logic: types, controls, validation, mapping, cross-walk, templates
lib/form-builder/server/     # server only: context/auth, repos, submission pipeline, uploads, PDF, AI summary
components/forms/            # form runner and controls (signature, file upload, tables, lookups)
components/forms/form-studio # Form Studio property editor
app/api/lift/                # LIFT API routes
app/forms/[slug]             # public runner
app/(portal)/portal/lift     # client portal
app/(portal)/portal/admin/lift  # Form Studio and submissions
scripts/verify-form-builder.ts  # logic checks
```

## Branding mode

`lib/branding.ts` controls wording in the shared onboarding flows. Setting `NEXT_PUBLIC_BRANDING_MODE=lift`:

- Replaces KDM, SVP, and "5 Pillars" wording with LIFT wording (Appendix 3 of the onboarding questions document).
- Shows LIFT service areas instead of the KDM 5 Pillars.
- Skips the paid-membership redirect and hides the affiliate wizard.
- Relabels DUNS as "UEI (formerly DUNS)".

The default (`kdm`) leaves the KDM site unchanged.

## Development

```bash
pnpm dev                                  # development server
pnpm type-check                           # TypeScript
pnpm lint                                 # ESLint (repo has pre-existing errors; lint changed files)
pnpm build                                # production build
npx tsx scripts/verify-form-builder.ts    # LIFT Form Builder logic checks
```

Deploy Firebase rules after changes:

```bash
firebase deploy --only firestore:rules,storage
```

See `AGENTS.md` for detailed agent and contributor notes.

## Project documentation

`docs/SOUTHERN Requirenments/analysis/`:

- `LIFT_Gap_Analysis.md` / `.pdf` - platform gap analysis against program requirements
- `LIFT_System_Design.md` / `.pdf` - system design for the LIFT modules
- `LIFT_Onboarding_Questions.txt` - every question from onboarding to program exit, plus implementation status
- `LIFT_Implementation_Pitch_Deck.pptx` - implementation pitch deck

## Deployment

Deploy to Vercel (`npx vercel` or GitHub integration). Set the environment variables above in the Vercel project, including `NEXT_PUBLIC_BRANDING_MODE=lift` for the LIFT site.

## License

Proprietary. All rights reserved.
