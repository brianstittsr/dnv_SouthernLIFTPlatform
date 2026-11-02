# LMS Integrations Setup

The LMS (Courses) module integrates with **Zoom** for live-session meetings and
attendance tracking, and **LinkedIn** for course announcements and certificate
sharing. This guide covers the required configuration.

---

## Zoom (Server-to-Server OAuth)

Zoom's older JWT app type is deprecated — the LMS uses a **Server-to-Server
OAuth** app.

### 1. Create the Zoom app

1. Sign in to the [Zoom Marketplace](https://marketplace.zoom.us) with the
   organization Zoom account.
2. **Develop → Build App → Server-to-Server OAuth → Create.**
3. Name it (e.g. "Southern LIFT LMS") and continue.
4. Copy the three credentials from the **App Credentials** tab:
   - **Account ID**
   - **Client ID**
   - **Client Secret**
5. Under **Scopes**, add:
   - `meeting:write:meeting` — create meetings (instructors)
   - `meeting:read:meeting` — read meeting details
   - `report:read:meeting_participants` (or the Meeting → "View past meeting
     participants" report scope) — pull attendee rosters for attendance sync
6. **Activate** the app.

### 2. Configure the platform

Portal → **Settings → Zoom Integration**:

- **Zoom Client ID** → the app's Client ID
- **Zoom Client Secret** → the app's Client Secret
- **Zoom Account ID** → the app's Account ID

(These are stored in `platformSettings/global` under the `zoom` key — the same
fields the previous JWT-style config used; the client ID/secret fields are
reused.)

Alternatively set environment variables: `ZOOM_CLIENT_ID`,
`ZOOM_CLIENT_SECRET`, `ZOOM_ACCOUNT_ID`.

### 3. How it's used

- Instructors open a course → **Curriculum** → hover a session → click the
  **video icon** to create a Zoom meeting. The session stores
  `zoomMeetingId` / `zoomJoinUrl` and the icon becomes a join link.
- Attendance is synced into the session (`zoomAttendeeCount`,
  `zoomTotalMinutes`, `zoomAttendees[]`) by:
  - the **"Sync attendance"** button on the curriculum page (force resync), or
  - `POST /api/lms/zoom/sync` (staff/admin or `CRON_SECRET` bearer) — wire this
    to a scheduler to run after live sessions.
- Zoom minutes roll up into the LMS Dashboard and the automated LMS training
  report.

---

## LinkedIn

Two touchpoints, both using the existing `linkedin_drafts` pipeline — **nothing
auto-posts to LinkedIn**; drafts must be published manually from the Content
area.

### Course announcements

When a course is published (`POST /api/courses` with `action: "publish"`), an
announcement draft is generated automatically in `linkedin_drafts`
(`source: "lms-course-announce"`). Staff review → publish from
**Marketing → LinkedIn**.

Manual re-generate: `POST /api/lms/courses/{courseId}/announce`
(staff/admin/instructor only; returns the existing draft if one already exists).

### Certificate sharing

On **My LIFT → Certificates**, each certificate offers:

- **Download PDF** — `/api/lms/certificates/{id}/pdf`
- **Verify** — public page `/verify/certificate/{certificateNumber}`
- **Add to LinkedIn profile** — pre-fills LinkedIn's *Licenses &
  Certifications* form with the credential name, issuer, and verification URL
- **Share to LinkedIn** — share-as-post URL pointing at the verification page

No LinkedIn API credentials are required for the certificate features — they
use LinkedIn's public `addTask`/`shareArticle` URL schemes. The announcement
draft pipeline uses whatever LinkedIn configuration already exists for the
content module.

---

## Automated LMS reporting

`GET|POST /api/cron/lms-training-report` (Vercel cron, Mondays 07:00 UTC):

1. Collects training metrics (courses, enrollments, completions, session
   attendance, Zoom minutes, certificates issued).
2. Generates an AI narrative summary (OpenAI via the platform reporting
   pipeline; falls back to a deterministic summary without a key).
3. Saves the report (`reports` collection, type `lms_training`) — visible in
   **LIFT Reports**.
4. Emails the PDF to all staff/admin users via Resend.

Required env: `CRON_SECRET` (already used by other crons), `OPENAI_API_KEY`
(optional — deterministic fallback), `RESEND_API_KEY` + `RESEND_FROM_*` for
delivery.
