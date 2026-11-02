/**
 * Generates the LIFT Platform Product Features Brief PDF.
 *
 * Usage: npx tsx scripts/generate-features-brief.ts
 * Output: docs/LIFT_Product_Features_Brief.pdf
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderHtmlToPdf } from "../lib/form-builder/server/pdf";

const BRAND_NAVY = "#1e3a5f";
const BRAND_GOLD = "#c9a227";
const INK = "#1f2937";
const MUTED = "#5f6b7a";
const LINE = "#d8dee7";

const TODAY = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ---------------------------------------------------------------------------
// Chart + diagram helpers (all static — puppeteer renders with JS disabled)
// ---------------------------------------------------------------------------

interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

function barChart(title: string, data: BarDatum[], note?: string): string {
  const max = Math.max(...data.map((d) => d.value), 1);
  const rowH = 26;
  const labelW = 150;
  const chartW = 480;
  const h = data.length * rowH + 10;
  const bars = data
    .map((d, i) => {
      const w = Math.max(4, (d.value / max) * (chartW - 50));
      const y = i * rowH + 6;
      return `
        <text x="${labelW - 8}" y="${y + 14}" text-anchor="end" font-size="10" fill="${INK}">${d.label}</text>
        <rect x="${labelW}" y="${y}" width="${w}" height="16" rx="3" fill="${d.color ?? BRAND_NAVY}"/>
        <text x="${labelW + w + 6}" y="${y + 13}" font-size="10" fill="${MUTED}">${d.value}</text>`;
    })
    .join("");
  return `
    <div class="chart-block">
      <h4>${title}</h4>
      <svg width="${labelW + chartW}" height="${h}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>
      ${note ? `<p class="chart-note">${note}</p>` : ""}
    </div>`;
}

interface JourneyStep {
  title: string;
  detail?: string;
  tone?: "start" | "step" | "decision" | "auto" | "end";
}

const TONE_COLORS: Record<NonNullable<JourneyStep["tone"]>, { bg: string; border: string; text: string }> = {
  start: { bg: "#e8f0fa", border: "#1e3a5f", text: "#1e3a5f" },
  step: { bg: "#ffffff", border: "#94a3b8", text: "#1f2937" },
  decision: { bg: "#fdf6e3", border: "#c9a227", text: "#7a6115" },
  auto: { bg: "#eef7ee", border: "#3a7d44", text: "#2d5f34" },
  end: { bg: "#1e3a5f", border: "#1e3a5f", text: "#ffffff" },
};

function journeyRow(steps: JourneyStep[]): string {
  const cells = steps
    .map((s, i) => {
      const tone = TONE_COLORS[s.tone ?? "step"];
      const arrow =
        i < steps.length - 1
          ? `<div class="j-arrow">&#8594;</div>`
          : "";
      return `
        <div class="j-node" style="background:${tone.bg};border-color:${tone.border};color:${tone.text}">
          <div class="j-title">${s.title}</div>
          ${s.detail ? `<div class="j-detail" style="color:${tone.text === "#ffffff" ? "#c8d4e4" : MUTED}">${s.detail}</div>` : ""}
        </div>${arrow}`;
    })
    .join("");
  return `<div class="journey-row">${cells}</div>`;
}

function swimlane(label: string, steps: JourneyStep[]): string {
  return `
    <div class="swimlane">
      <div class="swimlane-label">${label}</div>
      ${journeyRow(steps)}
    </div>`;
}

function featureTable(
  title: string,
  rows: { feature: string; detail: string; where: string }[]
): string {
  const body = rows
    .map(
      (r) => `
      <tr>
        <td class="f-name">${r.feature}</td>
        <td>${r.detail}</td>
        <td class="f-where">${r.where}</td>
      </tr>`
    )
    .join("");
  return `
    <h3>${title}</h3>
    <table>
      <thead><tr><th style="width:26%">Feature</th><th>What it does</th><th style="width:22%">Where</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

// ---------------------------------------------------------------------------
// Document content
// ---------------------------------------------------------------------------

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: ${INK}; margin: 0; font-size: 10.5pt; line-height: 1.45; }
  .page { padding: 0.55in 0.7in; }
  .cover { background: ${BRAND_NAVY}; color: #fff; height: 9.6in; display: flex; flex-direction: column; justify-content: center; padding: 0 0.9in; }
  .cover .eyebrow { color: ${BRAND_GOLD}; letter-spacing: 2.5px; font-size: 10pt; text-transform: uppercase; margin-bottom: 14px; }
  .cover h1 { font-size: 30pt; margin: 0 0 10px; line-height: 1.2; }
  .cover .sub { font-size: 13pt; color: #c8d4e4; max-width: 5.6in; }
  .cover .meta { margin-top: 46px; font-size: 10pt; color: #9fb0c6; border-top: 1px solid #3a5578; padding-top: 18px; }
  h2 { color: ${BRAND_NAVY}; font-size: 16pt; border-bottom: 2.5px solid ${BRAND_GOLD}; padding-bottom: 5px; margin: 0 0 14px; }
  h3 { color: ${BRAND_NAVY}; font-size: 12.5pt; margin: 18px 0 7px; }
  h4 { color: ${BRAND_NAVY}; font-size: 10.5pt; margin: 0 0 6px; }
  p { margin: 6px 0; }
  ul { margin: 4px 0 8px 18px; padding: 0; }
  li { margin-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; font-size: 8.8pt; margin: 4px 0 14px; }
  th { background: ${BRAND_NAVY}; color: #fff; text-align: left; padding: 5px 8px; font-weight: 600; }
  td { border-bottom: 1px solid ${LINE}; padding: 5px 8px; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f8fb; }
  .f-name { font-weight: 600; color: ${BRAND_NAVY}; }
  .f-where { color: ${MUTED}; font-size: 8.3pt; }
  .kpi-band { display: flex; gap: 10px; margin: 14px 0; }
  .kpi { flex: 1; border: 1px solid ${LINE}; border-top: 3px solid ${BRAND_GOLD}; border-radius: 6px; padding: 10px; text-align: center; }
  .kpi .num { font-size: 20pt; font-weight: 700; color: ${BRAND_NAVY}; }
  .kpi .lbl { font-size: 8.5pt; color: ${MUTED}; }
  .callout { background: #f0f5fb; border-left: 4px solid ${BRAND_NAVY}; padding: 9px 12px; margin: 12px 0; font-size: 9.5pt; border-radius: 0 4px 4px 0; }
  .callout.gold { background: #fdf8ea; border-left-color: ${BRAND_GOLD}; }
  .pagebreak { page-break-before: always; }
  .section-tag { font-size: 8.5pt; letter-spacing: 1.6px; text-transform: uppercase; color: ${BRAND_GOLD}; font-weight: 700; }
  .chart-block { margin: 10px 0 16px; }
  .chart-note { font-size: 8.3pt; color: ${MUTED}; margin: 4px 0 0; }
  .swimlane { display: flex; align-items: center; margin: 10px 0; }
  .swimlane-label { width: 88px; flex: 0 0 88px; font-size: 8.5pt; font-weight: 700; color: ${BRAND_NAVY}; text-transform: uppercase; letter-spacing: 0.6px; }
  .journey-row { display: flex; align-items: stretch; flex: 1; gap: 4px; }
  .j-node { flex: 1; border: 1.4px solid; border-radius: 6px; padding: 7px 8px; font-size: 8.2pt; min-height: 52px; }
  .j-title { font-weight: 700; font-size: 8.6pt; margin-bottom: 2px; }
  .j-detail { font-size: 7.6pt; line-height: 1.3; }
  .j-arrow { align-self: center; color: ${MUTED}; font-size: 12pt; flex: 0 0 12px; text-align: center; }
  .legend { display: flex; gap: 16px; font-size: 8.3pt; color: ${MUTED}; margin: 8px 0 14px; flex-wrap: wrap; }
  .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; border: 1.2px solid; }
  .diagram-title { font-size: 11pt; font-weight: 700; color: ${BRAND_NAVY}; margin: 16px 0 4px; }
  .two-col { display: flex; gap: 18px; }
  .two-col > div { flex: 1; }
  .pipeline { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 14px; }
  .pill { border: 1.4px solid ${BRAND_NAVY}; border-radius: 14px; padding: 4px 11px; font-size: 8.6pt; font-weight: 600; color: ${BRAND_NAVY}; }
  .pill.gold { border-color: ${BRAND_GOLD}; color: #8a6d17; background: #fdf8ea; }
  .role-grid { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }
  .role-chip { border: 1px solid ${LINE}; border-radius: 6px; padding: 6px 10px; font-size: 8.6pt; }
  .role-chip b { color: ${BRAND_NAVY}; display: block; font-size: 9pt; }
  .footer-note { font-size: 8.3pt; color: ${MUTED}; border-top: 1px solid ${LINE}; margin-top: 18px; padding-top: 8px; }
</style></head><body>

<!-- ============================ COVER ============================ -->
<div class="cover">
  <div class="eyebrow">Southern University &middot; MBDA LIFT Rural Business Center</div>
  <h1>Platform Product<br/>Features Brief</h1>
  <div class="sub">What has been built on the LIFT digital platform to date &mdash; for program staff, advisors, and administrators.</div>
  <div class="meta">
    Prepared ${TODAY}<br/>
    Audience: LIFT Center staff (internal)<br/>
    Status: Live on the production platform
  </div>
</div>

<!-- ======================= AT A GLANCE ======================= -->
<div class="page">
  <div class="section-tag">Section 1</div>
  <h2>Platform at a glance</h2>
  <p>The LIFT platform is the digital home of the Southern University MBDA LIFT Rural Business Center (award MBDA&#8209;OBC&#8209;2026&#8209;00003). It manages the full client journey for rural Louisiana small businesses &mdash; from first intake through advising, training, capital readiness, contracting support, and outcome reporting to MBDA.</p>

  <div class="kpi-band">
    <div class="kpi"><div class="num">14</div><div class="lbl">Lifecycle forms (B1&ndash;B10 templates)</div></div>
    <div class="kpi"><div class="num">9</div><div class="lbl">User roles with scoped access</div></div>
    <div class="kpi"><div class="num">10+</div><div class="lbl">Course&nbsp;* collections in the LMS</div></div>
    <div class="kpi"><div class="num">7</div><div class="lbl">Report types incl. automated LMS report</div></div>
    <div class="kpi"><div class="num">6</div><div class="lbl">Scheduled jobs (crons)</div></div>
  </div>

  <h3>Who the platform serves</h3>
  <div class="role-grid">
    <div class="role-chip"><b>LIFT Client</b>Rural business owners &mdash; onboarding, forms, courses, documents</div>
    <div class="role-chip"><b>LIFT Staff</b>Program team &mdash; reviews, member support, analytics, role preview</div>
    <div class="role-chip"><b>Instructor</b>Builds courses, runs sessions, issues certificates</div>
    <div class="role-chip"><b>Platform Admin</b>Full configuration, user management, Form Studio, monitoring</div>
  </div>
  <p class="chart-note">Additional RBAC roles exist for the shared codebase (buyer, consortium member/partner, QA reviewer, marketing staff) and can be assigned on invite.</p>

  <h3>Technology</h3>
  <table>
    <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
    <tbody>
      <tr><td>Application</td><td>Next.js 15 (App Router) + React 19 + TypeScript, hosted on Vercel</td></tr>
      <tr><td>Data</td><td>Firebase Auth, Firestore (client + Admin SDK), Storage, security rules</td></tr>
      <tr><td>AI</td><td>OpenAI &mdash; intake summaries, report narratives, form assist (rules-based fallbacks everywhere)</td></tr>
      <tr><td>Documents &amp; PDF</td><td>Puppeteer-rendered branded PDFs; Firestore/Storage-backed file store</td></tr>
      <tr><td>Integrations</td><td>Zoom Server-to-Server OAuth, LinkedIn, Resend/SendGrid/MS&nbsp;Graph email, Turnstile, UserWay, SAM.gov, Stripe</td></tr>
    </tbody>
  </table>

  <div class="callout">
    <b>How to read this brief:</b> every feature listed is implemented in the codebase and deployed. Items marked <i>"needs configuration"</i> are built but require third-party credentials to activate in production.
  </div>
</div>

<!-- ======================= FEATURE CATALOG ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Section 2</div>
  <h2>Feature catalog</h2>

  ${featureTable("Client experience", [
    { feature: "Guided onboarding", detail: "New clients land on My Profile and complete the LIFT onboarding wizard (profile, business info, interests, documents). Every field has an inline hint explaining how the answer feeds AI-powered contracting matchmaking.", where: "/portal/profile, onboarding wizard" },
    { feature: "Onboarding progress", detail: "Visual checklist of program steps so clients and staff see exactly where each client stands.", where: "/portal/onboarding-progress" },
    { feature: "My LIFT forms", detail: "All assigned lifecycle forms in one place with status (draft/submitted) and PDF copies.", where: "/portal/lift/forms" },
    { feature: "Company workspace", detail: "Users on the same company share a single company record &mdash; no duplicate data entry.", where: "companies collection" },
    { feature: "Certificates", detail: "Numbered completion certificates with PDF download, a public verification link, and one-click LinkedIn add-to-profile / share-as-post.", where: "/portal/sme/certificates" },
    { feature: "Help & documentation", detail: "In-app help center rewritten for LIFT: role-based quick starts, feature guide, LMS explainer, certificate verification.", where: "/portal/help" },
  ])}

  ${featureTable("LIFT forms engine (B1&ndash;B10 lifecycle)", [
    { feature: "Form Studio", detail: "Staff build/edit/publish forms with AI assist, preview, and versioning.", where: "/portal/admin/lift/forms" },
    { feature: "Rich controls", detail: "Standard + conversational (one-question) modes, conditional questions, signatures, file uploads, repeating tables, Likert/NPS/star ratings, calculated fields, staff-only fields, platform lookups (parishes, partners, events, clients).", where: "components/forms" },
    { feature: "Cross-walk prefill", detail: "Answers are indexed per client and prefill later forms; profile and registration data act as fallback sources.", where: "lib/form-builder/crosswalk" },
    { feature: "AI intake summary", detail: "B1 intake produces an AI needs assessment + recommended service plan, flagged 'pending staff review' &mdash; AI never decides eligibility.", where: "lib/form-builder/server" },
    { feature: "Integrity", detail: "Form versions, consent-text hashes, signature references, SHA-256 content hashes, audit events, branded PDFs.", where: "liftAudit, submissions" },
    { feature: "Worksheet QC", detail: "The Word onboarding worksheet is validated on upload with a staged correction dialog for fixable issues.", where: "worksheet upload flow" },
  ])}

  ${featureTable("Documents & files", [
    { feature: "Role-based visibility", detail: "Every upload chooses 'Everyone' or specific roles; enforced in Firestore rules, list queries, and file download &mdash; not just hidden in the UI.", where: "/portal/documents" },
    { feature: "Document types", detail: "Configurable type list including MOU and Partner Agreements; 'Other' prompts for a custom label.", where: "platformSettings" },
    { feature: "Company grouping", detail: "Staff can group the document list by client company; uploads carry companyId.", where: "/portal/documents" },
    { feature: "Private storage", detail: "Portal uploads are stored private; downloads authorize through /api/files/[id] against the document's allowed roles.", where: "/api/files/[id]" },
    { feature: "Baseline uploads", detail: "Baseline Assessment Summary uploads are stored as base64 plus extracted Markdown for AI analysis.", where: "onboarding" },
  ])}
</div>

<div class="page pagebreak">
  ${featureTable("Learning Management System (LMS)", [
    { feature: "Courses & curriculum", detail: "Courses contain modules and sessions (video, documents, live). Instructors build curricula, reorder content, and import SCORM packages.", where: "/portal/instructor/courses" },
    { feature: "Enrollment & progress", detail: "Clients browse the catalog, enroll, and progress is tracked per session; completion is automatic.", where: "/portal/sme/courses" },
    { feature: "Certificates", detail: "Issued automatically on completion with unique certificate numbers, PDF rendering, and public verification.", where: "/verify/certificate/[number]" },
    { feature: "Zoom meetings", detail: "Instructors create Zoom meetings directly on sessions (Server-to-Server OAuth). Attendance syncs attendee counts and minutes back onto the session.", where: "Curriculum page, /api/lms/zoom/*" },
    { feature: "LinkedIn", detail: "Publishing a course auto-drafts a LinkedIn announcement for staff review; certificates share to LinkedIn profiles/posts.", where: "linkedin_drafts pipeline" },
    { feature: "LMS dashboard", detail: "Staff analytics: enrollments by course, completion rate, Zoom attendance minutes, course status mix, certificate registry.", where: "/portal/admin/lms" },
    { feature: "Discussions & live trainings", detail: "Per-course discussion threads, live training scheduling, and registrations.", where: "course_discussions, course_live_trainings" },
  ])}

  ${featureTable("Reporting & analytics", [
    { feature: "LIFT reports", detail: "Six report types (monthly, quarterly, semi-annual MBDA, annual, freeform, client deep-dive) with AI narrative + deterministic fallback, PDF export, and email delivery.", where: "/portal/admin/lift/reports" },
    { feature: "Automated training report", detail: "Weekly cron collects LMS metrics, generates the AI narrative, saves the report, and emails the PDF to staff &mdash; zero human steps.", where: "/api/cron/lms-training-report" },
    { feature: "Deterministic metrics", detail: "All numbers come from Firestore aggregation; AI writes interpretation only.", where: "lib/reports/data-collector" },
  ])}

  ${featureTable("Team & administration", [
    { feature: "Role-aware invites", detail: "Invite with any role; 'LIFT Staff' creates the auth account, temp password, and a team-members record grouped under LIFT Staff.", where: "/portal/admin/team-members" },
    { feature: "Staff experience", detail: "Staff skip client onboarding, complete their profile, and get staff modules: role preview + people switchers, Team Members, grouped Documents/Opportunities, SVP partner/instructor/consortium views.", where: "Sidebar, firestore.rules" },
    { feature: "Opportunities", detail: "Pipeline tracking with company grouping for staff.", where: "/portal/opportunities" },
    { feature: "Submissions review", detail: "Staff review form answers, files, PDFs, and AI intake summaries.", where: "/portal/admin/lift/submissions" },
    { feature: "Audit trail", detail: "liftAudit events on form/report/submission actions.", where: "liftAudit collection" },
  ])}

  ${featureTable("Marketing site", [
    { feature: "LIFT branding", detail: "Southern University LIFT branding across the public site; 'no-cost' wording replaced with Help/Support Program language.", where: "app/(marketing)" },
    { feature: "Content", detail: "Award announcement press release, services/resources pages, LIFT events catalog, hero slides.", where: "press-releases, resources, events" },
    { feature: "Accessibility", detail: "UserWay widget planned on every page (needs NEXT_PUBLIC_USERWAY_ACCOUNT_ID).", where: "Site layout" },
  ])}
</div>

<!-- ======================= ARCHITECTURE ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Section 3</div>
  <h2>Security &amp; data model</h2>
  <ul>
    <li><b>API boundary:</b> the browser cannot touch <code>lift*</code> collections or <code>lift/**</code> storage paths &mdash; every read/write goes through server routes that check staff/owner access, validate with Zod, rate-limit, and audit.</li>
    <li><b>Firestore rules:</b> per-document role visibility on documents; staff read access to memberships, progress, opportunities, companies, and courses for analytics; owner-scoped writes elsewhere.</li>
    <li><b>Files:</b> portal document uploads are private by default; downloads check the linked document's allowed roles server-side.</li>
    <li><b>Public forms:</b> honeypot + optional Turnstile CAPTCHA; signed-out submissions still produce versioned, hashed records.</li>
    <li><b>Secrets:</b> Firebase Admin, Zoom, OpenAI, Resend, and cron secrets live in environment variables only.</li>
  </ul>

  <div class="diagram-title">Platform module map</div>
  <svg width="700" height="235" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial">
    <rect x="10" y="10" width="680" height="42" rx="8" fill="${BRAND_NAVY}"/>
    <text x="350" y="36" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="700">LIFT Platform &mdash; Next.js on Vercel</text>
    <g font-size="10" fill="${INK}">
      <rect x="10" y="72" width="128" height="58" rx="6" fill="#e8f0fa" stroke="${BRAND_NAVY}"/>
      <text x="74" y="95" text-anchor="middle" font-weight="700" fill="${BRAND_NAVY}">Client portal</text>
      <text x="74" y="112" text-anchor="middle" fill="${MUTED}" font-size="8.5">Onboarding &middot; My LIFT &middot; Docs</text>
      <rect x="148" y="72" width="128" height="58" rx="6" fill="#e8f0fa" stroke="${BRAND_NAVY}"/>
      <text x="212" y="95" text-anchor="middle" font-weight="700" fill="${BRAND_NAVY}">Forms engine</text>
      <text x="212" y="112" text-anchor="middle" fill="${MUTED}" font-size="8.5">B1&ndash;B10 &middot; prefill &middot; signatures</text>
      <rect x="286" y="72" width="128" height="58" rx="6" fill="#e8f0fa" stroke="${BRAND_NAVY}"/>
      <text x="350" y="95" text-anchor="middle" font-weight="700" fill="${BRAND_NAVY}">LMS</text>
      <text x="350" y="112" text-anchor="middle" fill="${MUTED}" font-size="8.5">Courses &middot; certs &middot; Zoom</text>
      <rect x="424" y="72" width="128" height="58" rx="6" fill="#e8f0fa" stroke="${BRAND_NAVY}"/>
      <text x="488" y="95" text-anchor="middle" font-weight="700" fill="${BRAND_NAVY}">Reporting</text>
      <text x="488" y="112" text-anchor="middle" fill="${MUTED}" font-size="8.5">AI narratives &middot; PDF &middot; email</text>
      <rect x="562" y="72" width="128" height="58" rx="6" fill="#e8f0fa" stroke="${BRAND_NAVY}"/>
      <text x="626" y="95" text-anchor="middle" font-weight="700" fill="${BRAND_NAVY}">Admin</text>
      <text x="626" y="112" text-anchor="middle" fill="${MUTED}" font-size="8.5">Invites &middot; Form Studio &middot; audit</text>
    </g>
    <g stroke="${MUTED}" stroke-width="1.4">
      <line x1="350" y1="52" x2="350" y2="68"/>
      <line x1="74" y1="58" x2="74" y2="68"/><line x1="212" y1="58" x2="212" y2="68"/>
      <line x1="488" y1="58" x2="488" y2="68"/><line x1="626" y1="58" x2="626" y2="68"/>
      <line x1="74" y1="58" x2="626" y2="58"/>
    </g>
    <rect x="10" y="150" width="680" height="34" rx="6" fill="#f0f5fb" stroke="${LINE}"/>
    <text x="350" y="171" text-anchor="middle" font-size="10.5" fill="${INK}">Firestore (auth, users, companies, lift*, course_*, documents) &middot; Storage &middot; Security rules</text>
    <line x1="350" y1="130" x2="350" y2="148" stroke="${MUTED}" stroke-width="1.4"/>
    <rect x="10" y="196" width="680" height="30" rx="6" fill="#fdf8ea" stroke="${BRAND_GOLD}"/>
    <text x="350" y="215" text-anchor="middle" font-size="10" fill="#7a6115">External: Zoom S2S OAuth &middot; LinkedIn &middot; OpenAI &middot; Resend email &middot; SAM.gov &middot; Stripe &middot; Turnstile &middot; UserWay</text>
    <line x1="350" y1="184" x2="350" y2="194" stroke="${MUTED}" stroke-width="1.4"/>
  </svg>

  ${barChart("Features delivered by domain (approximate count of distinct capabilities)", [
    { label: "LMS & certificates", value: 15 },
    { label: "Forms engine", value: 14 },
    { label: "Client experience", value: 11 },
    { label: "Admin & staff tools", value: 10 },
    { label: "Documents & files", value: 8 },
    { label: "Reporting & analytics", value: 7 },
    { label: "Marketing site", value: 6 },
    { label: "Integrations", value: 8, color: BRAND_GOLD },
  ], "Counts group related sub-features; intended to show coverage, not precision.")}

  ${barChart("Client lifecycle coverage (B1&ndash;B10 forms implemented)", [
    { label: "Intake & engagement", value: 3 },
    { label: "Eligibility & baseline", value: 2 },
    { label: "Service delivery", value: 4 },
    { label: "Capital & procurement", value: 3 },
    { label: "Outcomes & exit", value: 2 },
  ], "Every stage of the MBDA client lifecycle has at least one live form template.")}
</div>

<!-- ======================= USER JOURNEYS ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Section 4</div>
  <h2>User journeys</h2>
  <div class="legend">
    <span><i class="dot" style="background:#e8f0fa;border-color:${BRAND_NAVY}"></i> Entry / role</span>
    <span><i class="dot" style="background:#ffffff;border-color:#94a3b8"></i> User step</span>
    <span><i class="dot" style="background:#fdf6e3;border-color:${BRAND_GOLD}"></i> Decision / staff review</span>
    <span><i class="dot" style="background:#eef7ee;border-color:#3a7d44"></i> Automated</span>
    <span><i class="dot" style="background:${BRAND_NAVY};border-color:${BRAND_NAVY}"></i> Outcome</span>
  </div>

  <div class="diagram-title">Journey 1 &mdash; LIFT client onboarding</div>
  ${swimlane("Client", [
    { title: "Sign up", detail: "New LIFT Client card only; account created as lift_client", tone: "start" },
    { title: "Complete profile", detail: "Profile fields with AI-matching hints; required before portal unlocks" },
    { title: "Onboarding wizard", detail: "Business info, interests, document uploads (baseline stored as markdown for AI)" },
    { title: "LIFT forms", detail: "B1 intake, MBDA letter of engagement, eligibility, baseline &mdash; answers prefill from prior forms" },
    { title: "Program underway", detail: "Courses, documents, opportunities, advising", tone: "end" },
  ])}
  ${swimlane("System", [
    { title: "Account + users doc", detail: "role=lift_client; shared companies record linked", tone: "auto" },
    { title: "Cross-walk index", detail: "Each answer indexed for prefill on later forms", tone: "auto" },
    { title: "AI intake summary", detail: "B1 produces needs assessment", tone: "auto" },
    { title: "Staff review", detail: "Summary flagged pending review; staff see submissions queue", tone: "decision" },
    { title: "Service plan", detail: "Advisor sessions + records begin", tone: "end" },
  ])}

  <div class="diagram-title">Journey 2 &mdash; LIFT staff invite &amp; first login</div>
  ${journeyRow([
    { title: "Admin invites as LIFT Staff", detail: "Team Members &rarr; Invite &rarr; role dropdown", tone: "start" },
    { title: "Welcome email", detail: "Temporary password sent via email provider", tone: "auto" },
    { title: "Register &amp; change password", detail: "Temp-password flow sets their own password" },
    { title: "Complete profile", detail: "Required fields only; no client onboarding steps" },
    { title: "Staff workspace", detail: "Switchers, Team Members, grouped Docs/Opps, SVP sections, LMS dashboard", tone: "end" },
  ])}

  <div class="diagram-title">Journey 3 &mdash; Training &amp; certification</div>
  ${swimlane("Learner", [
    { title: "Browse catalog", detail: "Published courses at /portal/sme/courses/browse", tone: "start" },
    { title: "Enroll", detail: "Membership record created" },
    { title: "Complete sessions", detail: "Per-session progress; join Zoom live sessions" },
    { title: "Course complete", detail: "All required sessions done", tone: "end" },
  ])}
  ${swimlane("System", [
    { title: "Progress tracked", detail: "course_session_progress records", tone: "auto" },
    { title: "Certificate issued", detail: "Numbered cert in course_certificates", tone: "auto" },
    { title: "Learner notified", detail: "Certificate appears in My LIFT with PDF + LinkedIn actions", tone: "auto" },
  ])}
  ${swimlane("Instructor", [
    { title: "Build course", detail: "Modules &amp; sessions; optional SCORM import", tone: "start" },
    { title: "Add Zoom meetings", detail: "One click per session (S2S OAuth)" },
    { title: "Publish", detail: "Goes live + LinkedIn announcement drafted", tone: "auto" },
    { title: "Sync attendance", detail: "Zoom rosters &rarr; session minutes/attendees (button or 6-hour cron)", tone: "auto" },
  ])}
</div>

<!-- ======================= NOTIFICATIONS ======================= -->
<div class="page pagebreak">
  <div class="diagram-title">Journey 4 &mdash; Notifications &amp; automated reporting</div>
  <p class="chart-note">How events move through the platform without staff intervention. Email delivery uses the configured provider (Resend preferred; SendGrid, Microsoft Graph, or Azure SMTP also supported).</p>
  ${swimlane("Trigger", [
    { title: "Invite created", detail: "Admin sends invite", tone: "start" },
    { title: "Course published", detail: "Instructor/staff publishes", tone: "start" },
    { title: "Course completed", detail: "Last required session done", tone: "start" },
    { title: "Monday 07:00 UTC", detail: "Vercel cron", tone: "start" },
    { title: "Every 6 hours", detail: "Vercel cron", tone: "start" },
  ])}
  ${swimlane("Automated work", [
    { title: "Welcome email + temp password", detail: "Auth account provisioned", tone: "auto" },
    { title: "LinkedIn announcement draft", detail: "Staff review &amp; publish manually", tone: "auto" },
    { title: "Certificate issued", detail: "PDF + verify link + LinkedIn share ready", tone: "auto" },
    { title: "LMS training report", detail: "Metrics &rarr; AI narrative &rarr; saved report &rarr; PDF emailed to staff", tone: "auto" },
    { title: "Zoom attendance sync", detail: "Rosters &rarr; session minutes/counts", tone: "auto" },
  ])}
  ${swimlane("Recipient", [
    { title: "Invitee", detail: "Registers via link", tone: "end" },
    { title: "Marketing/staff", detail: "linkedin_drafts queue", tone: "end" },
    { title: "Learner + public", detail: "My LIFT + /verify page", tone: "end" },
    { title: "All staff", detail: "Inbox + LIFT Reports archive", tone: "end" },
    { title: "Instructors &amp; dashboard", detail: "Session + LMS analytics", tone: "end" },
  ])}

  <div class="callout gold">
    <b>Nothing posts externally without a human.</b> LinkedIn announcements land as drafts; the AI intake summary is flagged 'pending staff review'; reports are generated automatically but stored for audit.
  </div>

  <h3>LIFT lifecycle forms (B1&ndash;B10)</h3>
  <div class="pipeline">
    <span class="pill">B1 Intake</span><span class="pill">B2 MBDA LOE</span><span class="pill">B3 Rural eligibility</span><span class="pill">B4 Baseline</span><span class="pill">B5 Service plan</span><span class="pill">B5 Advisor log</span><span class="pill">B6 Workshop reg.</span><span class="pill">B6 Workshop feedback</span><span class="pill">B7 Capital readiness</span><span class="pill">B8 Capability library</span><span class="pill">B8 Proposal response</span><span class="pill">B9 Outcome check-in</span><span class="pill">B10 Impact consent</span><span class="pill">B10 Exit survey</span>
  </div>
</div>

<!-- ======================= STATUS / BACKLOG ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Section 5</div>
  <h2>Status &amp; open items</h2>
  <h3>Needs third-party configuration to activate</h3>
  <ul>
    <li><b>Zoom live calls</b> &mdash; built, but needs Server-to-Server OAuth credentials (Settings &rarr; Zoom Integration). Setup: docs/lms-integrations-setup.md.</li>
    <li><b>Resend/email</b> &mdash; keys are configured in the dashboard; verify first send.</li>
    <li><b>UserWay widget</b> &mdash; account ID env var is empty.</li>
    <li><b>OpenAI</b> &mdash; AI narratives/summaries; deterministic fallbacks run without it.</li>
  </ul>
  <h3>Known backlog</h3>
  <ul>
    <li>Legacy KDM marketing directories and blog content to be removed from this deployment's navigation.</li>
    <li>Staff access to a few admin-only actions on Team Members (welcome email resend, readiness scan) still requires platform_admin.</li>
    <li>First automated LMS report fires on the next Monday cron, or manually via GET /api/cron/lms-training-report with the cron secret.</li>
  </ul>
  <div class="callout">
    Questions or corrections: update this brief by regenerating it &mdash;
    <code>npx tsx scripts/generate-features-brief.ts</code> &mdash; the script
    renders to <code>docs/LIFT_Product_Features_Brief.pdf</code>.
  </div>
  <div class="footer-note">Generated ${TODAY} &middot; Southern University MBDA LIFT Rural Business Center platform &middot; Internal staff brief</div>
</div>

</body></html>`;

async function main(): Promise<void> {
  const pdf = await renderHtmlToPdf(html);
  const outDir = join(__dirname, "..", "docs");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "LIFT_Product_Features_Brief.pdf");
  writeFileSync(outPath, pdf);
  console.log(`Wrote ${outPath} (${(pdf.length / 1024).toFixed(0)} KB)`);
}

main().catch((error) => {
  console.error("PDF generation failed:", error);
  process.exit(1);
});
