# LIFT Database Schema (Firestore)

Southern University MBDA LIFT Rural Business Center Platform.
Project: `southernliftplatform` (separate from the KDM `svp-platform-c348a` project).

All `lift*` collections are server-only: Firestore rules deny client SDK access,
and every read/write goes through the `app/api/lift/*` routes, which enforce
session auth, role checks, rate limiting, and server-side Zod validation.
TypeScript interfaces live in `lib/schema.ts` and `lib/form-builder/types.ts`.

## Access model

| Collection | Client | Staff | Notes |
| --- | --- | --- | --- |
| All `lift*` | Denied (rules) | Server routes only | Admin SDK bypasses rules; routes enforce roles |

## Collections

### Form Builder

| Collection | Doc | Purpose |
| --- | --- | --- |
| `liftForms` | form | Form definition (draft + published version); staff-only fields stripped from public copies |
| `liftForms/{id}/versions/{n}` | snapshot | Immutable published definitions; submissions bind to an exact version |
| `liftFormSubmissions` | submission | Validated answers, signature blobs (hashed), upload refs, review state |
| `liftFormDrafts` | draft | Save-and-finish-later partial answers per user/slug |
| `liftFormUploads` | upload | File metadata + sha256; bytes in Storage under `lift/` |
| `liftClientProfiles` | profile | Durable cross-form record; `mappings` on fields write here |
| `liftAudit` | event | Actor, action, entity for submission/review/publish events |

### Client lifecycle (target records written by form submissions)

| Collection | Source form | Purpose |
| --- | --- | --- |
| `liftClients` | B1/B2 | Enrolled/prospect client; ownerUid, UEI, eligibility.rural, enrollment |
| `liftBaselines` | B4 | Revenue, jobs, payroll, capital, contracts baseline (immutable snapshot) |
| `liftServicePlans` | B5 | Goals, services, referrals |
| `liftSessions` | B5 log | Advisor session entries |
| `liftTrainingAttendance` | B6 | Workshop registrations/check-ins |
| `liftFeedback` | B6 | Workshop feedback incl. NPS |
| `liftCapitalPackages` | B7 | Capital readiness checklist state |
| `liftCapabilityLibraries` | B8 | Verified past performance/certs keyed by liftClientId |
| `liftProposalResponses` | B8 | SAM.gov notice responses, go/no-go, award outcome |
| `liftOutcomeClaims` | B9 | One claimed outcome per doc; status → verified by staff |
| `liftImpactConsents` | B10 | Story-use consent + withdrawal |
| `liftExits` | B10 | Exit survey and reason |

### Program management modules

| Collection | Purpose |
| --- | --- |
| `liftKpiTargets` | Versioned KPI target sets; `flagConflicts` keeps the 150/20/10 vs 100/10/5 disagreement visible until resolved |
| `liftKpiPeriods` | Reporting-period snapshots feeding MBDA reports |
| `liftStaffAssignments` | Advisor ↔ client assignments |
| `liftPartnerAgreements` | MOU/subaward/LOC tracking for the Q1 80% milestone, with doc hashes |
| `liftInvoices` | Quarterly grant invoices and evidence paths |
| `liftTrainingContent` | LIFT-curated course/library items by service area |
| `liftImpactStories` | Published stories; requires a matching consent submission |

## Deployment

```bash
firebase deploy --only firestore --project southernliftplatform
firebase deploy --only storage --project southernliftplatform   # after Storage is enabled in Console
```
