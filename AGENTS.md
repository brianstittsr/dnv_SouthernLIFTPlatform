# AGENTS.md

Project notes for coding agents working in `svp-platform` (Next.js 15 App Router, React 19, TypeScript, Firebase).

## Setup and verification

- Package manager: **pnpm** (`pnpm-lock.yaml`). If `node_modules` is broken, run `pnpm install --frozen-lockfile` (set `CI=true` in non-interactive shells).
- Type-check: `pnpm type-check` (clean baseline).
- Lint: `pnpm lint` reports many pre-existing errors across the repo. Lint only the files you changed, e.g. `npx eslint lib/form-builder components/forms app/api/lift`.
- Build: `pnpm build`.
- No test runner is configured. LIFT Form Builder logic checks: `npx tsx scripts/verify-form-builder.ts` (exits non-zero on failure).

## LIFT Form Builder (Southern University LIFT Rural Business Center)

Built from `docs/svp-kdm-features/formbuilder/Adams form builder.md`, hardened for LIFT. Part B lifecycle forms are documented in `docs/SOUTHERN Requirenments/analysis/LIFT_Onboarding_Questions.txt`.

- Core logic (shared client/server): `lib/form-builder/` (`types`, `controls`, `logic`, `validation`, `mapping`, `crosswalk`, `form-schema`, `lift-templates`).
- Server-only code: `lib/form-builder/server/` (Firebase Admin, Storage, OpenAI, puppeteer PDFs). Do not import it from client components.
- UI: `components/forms/` (runner and controls) and `components/forms/form-studio/`.
- APIs: `app/api/lift/**`. Pages: `/portal/admin/lift/forms` (Form Studio, admin), `/portal/admin/lift/submissions` (staff), `/portal/lift/forms` (clients), `/forms/[slug]` (public forms).
- Seed the 14 lifecycle forms (B1-B10): sign in as an admin, open the Form Studio, and click "Seed LIFT forms" (or `POST /api/lift/forms/seed`; add `?overwrite=true` to replace existing definitions and publish a new version). Script equivalent: `npx tsx --env-file=.env.local scripts/reseed-lift-forms.ts`. **Templates change without bumping seeded docs** — after editing `lift-templates.ts`, re-seed or the wizard's payloads won't match the stored schema (this caused a production failure where the onboarding wizard submitted arrays/fields the stale v1 form rejected). Check parity with `npx tsx scripts/verify-intake-payload.ts`.
- Security model: all `lift*` Firestore collections and `lift/**` Storage paths deny client SDK access; every read and write goes through the server API routes, which check staff or owner access, validate with Zod, rate-limit, and write `liftAudit` events. Files and signatures are stored in Storage; submissions keep references plus SHA-256 hashes.
- Environment variables:
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (or `FIREBASE_STORAGE_BUCKET`) for uploads and signatures.
  - `OPENAI_API_KEY` (or the platform settings key) enables the B1 intake AI summary and Form Studio AI assist; without it, a rules-based summary is used. Optional `LIFT_AI_MODEL` (default `gpt-4o-mini`).
  - Optional `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` require a CAPTCHA on signed-out submissions.
  - PDF export uses `@sparticuz/chromium` on Vercel, `CHROME_PATH` if set, otherwise the bundled `puppeteer` browser.

## LIFT AI Reports (admin-only)

- `/portal/admin/lift/reports` — generate fixed (monthly/quarterly/semi-annual/annual), free-form, and client deep-dive reports; view saved reports, export PDF, email delivery.
- `lib/reports/` — `data-collector.ts` aggregates a PII-redacted data pack (counts/distributions only; `member_attachments.markdownContent` excerpts are capped and treated as untrusted data in prompts). `generate.ts` writes the narrative via `createOpenAIClient()` + `LIFT_AI_MODEL`, Zod-validated, deterministic fallback without a key. `report-html.ts` renders the branded PDF layout. `types.ts` is the only file client components may import.
- APIs: `app/api/lift/reports/**` — all behind `requireAdminRequester()` (staff cannot access). Reports are saved to `liftReports` with their data pack for reproducibility; `report.*` events go to `liftAudit`.
- Smoke test without writes: `npx tsx --env-file=.env.local scripts/test-reports.ts`.

## Branding mode

- `NEXT_PUBLIC_BRANDING_MODE=lift` switches the shared onboarding flows to LIFT wording (`lib/branding.ts`), replaces the KDM 5 Pillars with LIFT service areas, skips the paid-membership redirect, and hides the affiliate wizard. The default (unset or `kdm`) keeps the KDM site unchanged.
