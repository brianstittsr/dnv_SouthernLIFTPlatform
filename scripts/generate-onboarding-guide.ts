/**
 * Generates the LIFT Platform Onboarding Visual Guide PDF — a
 * "visualize-learning" style walkthrough from first login to completed
 * onboarding, for staff and new clients.
 *
 * Usage: npx tsx scripts/generate-onboarding-guide.ts
 * Output: docs/LIFT_Onboarding_Visual_Guide.pdf
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { renderHtmlToPdf } from "../lib/form-builder/server/pdf";

const BRAND_NAVY = "#1e3a5f";
const BRAND_GOLD = "#c9a227";
const INK = "#1f2937";
const MUTED = "#5f6b7a";
const LINE = "#d8dee7";
const GREEN = "#3a7d44";

const TODAY = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ---------------------------------------------------------------------------
// Diagram helpers (all static — puppeteer renders with JS disabled)
// ---------------------------------------------------------------------------

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
      const arrow = i < steps.length - 1 ? `<div class="j-arrow">&#8594;</div>` : "";
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

interface StepCard {
  n: number;
  title: string;
  asks: string;
  fields: string[];
  why: string;
  required: string;
}

function stepCard(card: StepCard): string {
  const fieldChips = card.fields.map((f) => `<span class="field-chip">${f}</span>`).join("");
  return `
    <div class="step-card">
      <div class="step-head">
        <div class="step-num">${card.n}</div>
        <div>
          <div class="step-title">${card.title}</div>
          <div class="step-asks">${card.asks}</div>
        </div>
      </div>
      <div class="step-body">
        <div class="step-col">
          <div class="step-label">You'll be asked for</div>
          <div class="field-chips">${fieldChips}</div>
          <div class="step-label" style="margin-top:8px">Required to continue</div>
          <div class="step-required">${card.required}</div>
        </div>
        <div class="step-col why">
          <div class="step-label">Why LIFT asks</div>
          <p>${card.why}</p>
        </div>
      </div>
    </div>`;
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
  .cover .sub { font-size: 13pt; color: #c8d4e4; max-width: 5.8in; }
  .cover .meta { margin-top: 46px; font-size: 10pt; color: #9fb0c6; border-top: 1px solid #3a5578; padding-top: 18px; }
  h2 { color: ${BRAND_NAVY}; font-size: 16pt; border-bottom: 2.5px solid ${BRAND_GOLD}; padding-bottom: 5px; margin: 0 0 14px; }
  h3 { color: ${BRAND_NAVY}; font-size: 12.5pt; margin: 16px 0 7px; }
  h4 { color: ${BRAND_NAVY}; font-size: 10.5pt; margin: 0 0 6px; }
  p { margin: 6px 0; }
  ul { margin: 4px 0 8px 18px; padding: 0; }
  li { margin-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 4px 0 14px; }
  th { background: ${BRAND_NAVY}; color: #fff; text-align: left; padding: 5px 8px; font-weight: 600; }
  td { border-bottom: 1px solid ${LINE}; padding: 5px 8px; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f8fb; }
  code { font-family: Consolas, monospace; font-size: 8.6pt; background: #f0f2f5; padding: 1px 4px; border-radius: 3px; }
  .kpi-band { display: flex; gap: 10px; margin: 14px 0; }
  .kpi { flex: 1; border: 1px solid ${LINE}; border-top: 3px solid ${BRAND_GOLD}; border-radius: 6px; padding: 10px; text-align: center; }
  .kpi .num { font-size: 20pt; font-weight: 700; color: ${BRAND_NAVY}; }
  .kpi .lbl { font-size: 8.5pt; color: ${MUTED}; }
  .callout { background: #f0f5fb; border-left: 4px solid ${BRAND_NAVY}; padding: 9px 12px; margin: 12px 0; font-size: 9.5pt; border-radius: 0 4px 4px 0; }
  .callout.gold { background: #fdf8ea; border-left-color: ${BRAND_GOLD}; }
  .callout.green { background: #eef7ee; border-left-color: ${GREEN}; }
  .pagebreak { page-break-before: always; }
  .section-tag { font-size: 8.5pt; letter-spacing: 1.6px; text-transform: uppercase; color: ${BRAND_GOLD}; font-weight: 700; }
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
  .step-card { border: 1px solid ${LINE}; border-radius: 8px; margin: 0 0 12px; overflow: hidden; page-break-inside: avoid; }
  .step-head { display: flex; align-items: center; gap: 12px; background: #f0f5fb; padding: 8px 14px; border-bottom: 1px solid ${LINE}; }
  .step-num { width: 30px; height: 30px; border-radius: 50%; background: ${BRAND_NAVY}; color: #fff; font-weight: 700; font-size: 13pt; display: flex; align-items: center; justify-content: center; flex: 0 0 30px; }
  .step-title { font-weight: 700; color: ${BRAND_NAVY}; font-size: 11.5pt; }
  .step-asks { font-size: 8.6pt; color: ${MUTED}; }
  .step-body { display: flex; gap: 16px; padding: 10px 14px 12px; }
  .step-col { flex: 1.4; }
  .step-col.why { flex: 1; border-left: 1px solid ${LINE}; padding-left: 14px; font-size: 8.8pt; }
  .step-col.why p { font-size: 8.8pt; color: ${INK}; margin: 0; }
  .step-label { font-size: 7.6pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: ${BRAND_GOLD}; margin-bottom: 4px; }
  .field-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .field-chip { border: 1px solid ${LINE}; border-radius: 10px; padding: 2px 8px; font-size: 7.8pt; color: ${INK}; background: #fff; }
  .step-required { font-size: 8.4pt; color: ${MUTED}; }
  .step-required b { color: ${INK}; }
  .unlock-grid { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }
  .unlock-chip { border: 1px solid ${LINE}; border-radius: 6px; padding: 7px 11px; font-size: 8.6pt; flex: 0 0 31%; }
  .unlock-chip b { color: ${BRAND_NAVY}; display: block; font-size: 9.2pt; margin-bottom: 2px; }
  .footer-note { font-size: 8.3pt; color: ${MUTED}; border-top: 1px solid ${LINE}; margin-top: 18px; padding-top: 8px; }
</style></head><body>

<!-- ============================ COVER ============================ -->
<div class="cover">
  <div class="eyebrow">Southern University &middot; MBDA LIFT Rural Business Center</div>
  <h1>From First Login<br/>to a Complete Profile</h1>
  <div class="sub">A visual learning guide to the LIFT client onboarding journey &mdash; sign-in, the eight-step wizard, what happens to your answers, and what your profile unlocks.</div>
  <div class="meta">
    Prepared ${TODAY}<br/>
    Audience: LIFT clients, advisors, and program staff<br/>
    Companion to: LIFT Product Features Brief
  </div>
</div>

<!-- ======================= JOURNEY AT A GLANCE ======================= -->
<div class="page">
  <div class="section-tag">Part 1</div>
  <h2>The journey at a glance</h2>
  <p>Every new LIFT client follows the same path. Some steps are yours, some are automatic, and two are decision points where the platform chooses a route for you.</p>

  <div class="legend">
    <span><i class="dot" style="background:#e8f0fa;border-color:${BRAND_NAVY}"></i> Entry point</span>
    <span><i class="dot" style="background:#ffffff;border-color:#94a3b8"></i> You do this</span>
    <span><i class="dot" style="background:#fdf6e3;border-color:${BRAND_GOLD}"></i> Decision point</span>
    <span><i class="dot" style="background:#eef7ee;border-color:${GREEN}"></i> Happens automatically</span>
    <span><i class="dot" style="background:${BRAND_NAVY};border-color:${BRAND_NAVY}"></i> Milestone</span>
  </div>

  <div class="diagram-title">The whole trip &mdash; three lanes</div>
  ${swimlane("You", [
    { title: "Get invited or sign up", detail: "Welcome email with a link, or 'New LIFT Client' sign-up", tone: "start" },
    { title: "Sign in", detail: "Email + password at /sign-in" },
    { title: "Set your password", detail: "Invited users only: replace the temporary password" },
    { title: "Fill your profile basics", detail: "Name, company, contact info on My Profile" },
    { title: "Work through the wizard", detail: "8 guided steps on the Onboarding tab", tone: "decision" },
    { title: "Program underway", detail: "Full portal: forms, courses, documents, advising", tone: "end" },
  ])}
  ${swimlane("Platform", [
    { title: "Account created", detail: "Firebase Auth + users record, role: lift_client", tone: "auto" },
    { title: "Chooses your route", detail: "Password change? Onboarding done? Sends you to the right page", tone: "auto" },
    { title: "Links your company", detail: "Shared company record &mdash; teammates see one company, not copies", tone: "auto" },
    { title: "Saves as you go", detail: "Progress persists; you can leave and resume", tone: "auto" },
    { title: "Cross-walk index", detail: "Every answer indexed to prefill future forms &amp; AI matching", tone: "auto" },
    { title: "Profile unlocked", detail: "onboardingStatus = completed; full sidebar appears", tone: "end" },
  ])}
  ${swimlane("LIFT team", [
    { title: "Invite sent", detail: "Staff create your account with a temp password", tone: "start" },
    { title: "Sees you arrive", detail: "New client appears in Team Members &amp; submissions", tone: "auto" },
    { title: "Advisor assigned", detail: "Your needs &amp; goals inform who you work with", tone: "auto" },
    { title: "Reviews intake", detail: "AI intake summary is flagged 'pending staff review'", tone: "decision" },
    { title: "Service plan begins", detail: "Sessions, referrals, and resources follow", tone: "end" },
  ])}

  <div class="kpi-band">
    <div class="kpi"><div class="num">8</div><div class="lbl">Wizard steps, each with its own check</div></div>
    <div class="kpi"><div class="num">~25</div><div class="lbl">Minutes to complete, start to finish</div></div>
    <div class="kpi"><div class="num">2</div><div class="lbl">Decision points handled for you</div></div>
    <div class="kpi"><div class="num">1</div><div class="lbl">Signature &mdash; typed, on the Review step</div></div>
  </div>

  <div class="callout">
    <b>You can stop and come back.</b> The wizard saves progress against your account. Signing out mid-way and signing back in returns you to the Onboarding tab with your answers intact.
  </div>
</div>

<!-- ======================= GETTING IN ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Part 2</div>
  <h2>Getting in &mdash; how sign-in routes you</h2>
  <p>The sign-in page does more than check your password. After Firebase verifies you, the platform reads your user record and picks one of four destinations.</p>

  <div class="diagram-title">What the platform checks, in order</div>
  ${journeyRow([
    { title: "Password verified?", detail: "Firebase Auth; wrong password shows 'Invalid email or password'", tone: "decision" },
    { title: "Temp password?", detail: "hasChangedPassword is false &rarr; /change-password first", tone: "decision" },
    { title: "Onboarding done?", detail: "lift_client + not complete &rarr; Profile with wizard open", tone: "decision" },
    { title: "Portal home", detail: "Everyone else lands on /portal", tone: "end" },
  ])}

  <table>
    <thead><tr><th style="width:24%">Who signs in</th><th>Where they land</th><th style="width:34%">Why</th></tr></thead>
    <tbody>
      <tr><td><b>Invited user (any role)</b></td><td>/change-password &rarr; then normal routing</td><td>First login must replace the temporary password from the welcome email.</td></tr>
      <tr><td><b>New LIFT client</b></td><td>/portal/profile?onboarding=start</td><td>Profile tab first; the Onboarding tab auto-opens the wizard until finished.</td></tr>
      <tr><td><b>Consortium member</b></td><td>/portal/consortium/onboarding</td><td>Separate consortium onboarding flow.</td></tr>
      <tr><td><b>Staff / admin / other roles</b></td><td>/portal</td><td>No client onboarding &mdash; straight to the workspace.</td></tr>
      <tr><td><b>Returning client (done)</b></td><td>/portal</td><td>Wizard skipped; full portal is already unlocked.</td></tr>
    </tbody>
  </table>

  <h3>Two ways a client account begins</h3>
  <div class="two-col">
    <div>
      <h4>A &mdash; Staff invites you</h4>
      <ul>
        <li>Welcome email arrives with a <b>temporary password</b> and a "Log into the LIFT Platform" link.</li>
        <li>First sign-in forces a password change.</li>
        <li>Then straight into profile + wizard.</li>
      </ul>
    </div>
    <div>
      <h4>B &mdash; You sign up yourself</h4>
      <ul>
        <li>Sign-up shows a single preselected card: <b>"New LIFT Client"</b>.</li>
        <li>Account is created with <code>lift_client</code> / <code>sme_user</code>.</li>
        <li>Sign in &rarr; profile + wizard.</li>
      </ul>
    </div>
  </div>

  <div class="callout gold">
    <b>Can't open a document or form right after signing in?</b> Portal files authenticate with a server session, not just your Firebase login. If you see "Forbidden", reload the page once &mdash; the platform refreshes the session cookie automatically, then View/Download work.
  </div>
</div>

<!-- ======================= WIZARD PART 1 ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Part 3</div>
  <h2>The wizard &mdash; steps 1&ndash;4</h2>
  <p>The Onboarding tab walks you through eight cards. Each card validates before you can continue &mdash; if something's missing, a message tells you exactly what.</p>

  ${stepCard({
    n: 1,
    title: "Business Information",
    asks: "Tell us about your company",
    fields: ["Company name", "DBA (optional)", "Address / city / state / zip", "Entity type", "Business stage", "Employees", "Year established", "Website"],
    why: "Establishes your business identity — the name, location, and stage that appear on your client record and eligibility reviews. 'Not registered yet' is a valid answer.",
    required: "Company name (or 'not registered'), full address, entity type, stage, and employee range.",
  })}

  ${stepCard({
    n: 2,
    title: "Capabilities",
    asks: "Describe your products, services, and NAICS codes",
    fields: ["Products & services list", "Primary NAICS code", "Core capabilities", "Past performance", "Key differentiators", "Digital tools", "Capability statement upload"],
    why: "This is what the AI matching engine reads. Your NAICS codes and capabilities are what get you matched to contracting opportunities and flagged as a manufacturer for the Proof Pack.",
    required: "At least one product/service, one NAICS code, and a capabilities description.",
  })}

  ${stepCard({
    n: 3,
    title: "Government Contracting",
    asks: "Your GOVCON readiness — SAM.gov, UEI, and certifications",
    fields: ["GOVCON interest (yes/no)", "SAM.gov registration status", "UEI &amp; CAGE codes", "Certifications held", "Certifications planned", "Sold to government before?"],
    why: "Decides how much contracting-readiness support you need. SAM.gov status and certifications drive which readiness steps appear in your service plan.",
    required: "GOVCON interest answer; if yes, your SAM.gov registration status.",
  })}

  ${stepCard({
    n: 4,
    title: "Needs &amp; Goals",
    asks: "What your business needs most and where you're headed",
    fields: ["Seeking financing?", "Purpose &amp; amount", "Single most important need", "Barriers holding you back", "12-month goals", "Kinds of help wanted", "Top-5 business needs pick-list"],
    why: "The single most important step for your service plan. The top-5 pick-list uses the advisor-curated list of Louisiana business needs (5 Critical, 10 High) — your picks steer advisor assignment, trainings, and resources.",
    required: "Financing answer, top need, barriers, goals, at least one kind of help, and 1&ndash;5 business needs.",
  })}
</div>

<!-- ======================= WIZARD PART 2 ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Part 3 (continued)</div>
  <h2>The wizard &mdash; steps 5&ndash;8</h2>

  ${stepCard({
    n: 5,
    title: "Operations",
    asks: "How your business wins and delivers work",
    fields: ["How you get business today", "Open to teaming?", "Work out of state?", "In-house BD team?", "Resources to invest?"],
    why: "Four quick yes/no questions tell your advisor how mature your business development is — so recommendations are realistic rather than generic.",
    required: "Acquisition method and all four yes/no questions.",
  })}

  ${stepCard({
    n: 6,
    title: "Contact Information",
    asks: "How can your LIFT advisor reach you?",
    fields: ["Primary contact name", "Email &amp; phone", "Preferred contact method", "LinkedIn (or 'no LinkedIn')", "Owner ethnicity", "Additional contacts"],
    why: "Who your advisor contacts — and each additional contact you add can be invited to the platform with your company already linked.",
    required: "Name, email, phone, contact method, LinkedIn-or-checkbox, owner ethnicity.",
  })}

  ${stepCard({
    n: 7,
    title: "LIFT Program",
    asks: "Service areas, supporting documents, and consents",
    fields: ["LIFT service areas", "How you heard about us", "Referring organization", "AI disclosure", "Privacy notice", "Optional document uploads", "Email opt-in"],
    why: "Chooses which LIFT services you want (counseling, contracting, capital readiness, manufacturing program, digital/AI). Acknowledgments cover the AI assistant and data privacy — no signature needed here.",
    required: "At least one service area, referral source + organization, and both acknowledgments.",
  })}

  ${stepCard({
    n: 8,
    title: "Review",
    asks: "Check everything, certify, and sign",
    fields: ["Summary of every step", "Accuracy attestation", "Typed legal signature"],
    why: "One screen shows all your answers grouped by step. Certifying + typing your name creates a signed, auditable record — the same legal standing as a handwritten signature on the intake.",
    required: "Attestation checkbox and your typed full legal name.",
  })}

  <div class="callout green">
    <b>Pressing "Complete onboarding"</b> writes your profile to the platform in one pass, sends invites to any additional contacts you listed, and marks onboarding complete &mdash; your full portal unlocks immediately.
  </div>
</div>

<!-- ======================= BEHIND THE SCENES ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Part 4</div>
  <h2>Where your answers go</h2>
  <p>Onboarding isn't just paperwork — every field feeds a downstream system so you don't re-enter it later.</p>

  <div class="diagram-title">Answer lifecycle</div>
  ${swimlane("Capture", [
    { title: "Wizard answers", detail: "Saved to your users record as you complete", tone: "start" },
    { title: "Cross-walk index", detail: "Each answer stored under a key (e.g. needs.topNeeds, business.naics)", tone: "auto" },
    { title: "Prefill", detail: "B1 intake and later LIFT forms arrive already filled", tone: "auto" },
    { title: "AI summary", detail: "B1 submission generates an advisor-facing needs assessment", tone: "auto" },
    { title: "Service plan", detail: "Staff review + advisor assignment", tone: "end" },
  ])}

  <div class="diagram-title">Your profile unlocks these</div>
  <div class="unlock-grid">
    <div class="unlock-chip"><b>My LIFT forms</b>B1&ndash;B10 lifecycle forms, prefilled from onboarding</div>
    <div class="unlock-chip"><b>Documents</b>Upload, tag, and share files; role-based visibility</div>
    <div class="unlock-chip"><b>Courses (LMS)</b>Catalog, enrollment, progress, certificates</div>
    <div class="unlock-chip"><b>Opportunities</b>Contracting pipeline matched to your profile</div>
    <div class="unlock-chip"><b>Onboarding progress</b>Checklist of your program milestones</div>
    <div class="unlock-chip"><b>Full sidebar</b>Navigation gated until the profile is complete</div>
  </div>

  <h3>What staff see on their side</h3>
  <table>
    <thead><tr><th style="width:28%">Signal</th><th>Where it lands</th></tr></thead>
    <tbody>
      <tr><td>Wizard completion</td><td>Team Members list, profile marked complete</td></tr>
      <tr><td>Additional contacts</td><td>Invite emails sent automatically; contacts join linked to your company</td></tr>
      <tr><td>B1 intake submitted</td><td>Submissions queue + AI intake summary for advisor review</td></tr>
      <tr><td>Top-5 business needs</td><td>Stored on your client record; steers advisor match, trainings, resources</td></tr>
      <tr><td>Uploaded documents</td><td>Stored privately; visible to you and LIFT staff</td></tr>
    </tbody>
  </table>
</div>

<!-- ======================= TROUBLESHOOTING ======================= -->
<div class="page pagebreak">
  <div class="section-tag">Part 5</div>
  <h2>Stuck? Quick fixes</h2>
  <table>
    <thead><tr><th style="width:34%">What you see</th><th>What to do</th></tr></thead>
    <tbody>
      <tr><td>"Invalid email or password"</td><td>Check for typos; invited users should use the temporary password from the welcome email exactly as sent.</td></tr>
      <tr><td>Redirected to change-password every time</td><td>Finish the password change once — the platform won't let you proceed until the temp password is replaced.</td></tr>
      <tr><td>"Failed to complete onboarding"</td><td>Usually a required field on an earlier step. Go back through the steps — the wizard shows which validation failed.</td></tr>
      <tr><td>Portal sidebar only shows "My Profile"</td><td>Profile required fields aren't complete yet. Finish the profile fields the wizard asks for.</td></tr>
      <tr><td>"Forbidden" opening a document</td><td>Reload once — the server session refreshes on load and the file will open.</td></tr>
      <tr><td>Wizard closed before finishing</td><td>Sign back in — you're routed back to Profile &rarr; Onboarding with progress saved.</td></tr>
      <tr><td>Can't pick a 6th business need</td><td>The pick-list is capped at five by design — deselect one first. Choose the ones that matter most.</td></tr>
    </tbody>
  </table>

  <div class="callout">
    <b>For staff:</b> the same flow is documented in-app under <b>Help &amp; Documentation &rarr; LIFT Client guide</b>, and the full feature inventory is in the LIFT Product Features Brief (<code>docs/LIFT_Product_Features_Brief.pdf</code>).
  </div>

  <div class="footer-note">Generated ${TODAY} &middot; Southern University MBDA LIFT Rural Business Center platform &middot; Regenerate with <code>npx tsx scripts/generate-onboarding-guide.ts</code></div>
</div>

</body></html>`;

async function main(): Promise<void> {
  const pdf = await renderHtmlToPdf(html);
  const outDir = join(__dirname, "..", "docs");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "LIFT_Onboarding_Visual_Guide.pdf");
  writeFileSync(outPath, pdf);
  console.log(`Wrote ${outPath} (${(pdf.length / 1024).toFixed(0)} KB)`);
}

main().catch((error) => {
  console.error("PDF generation failed:", error);
  process.exit(1);
});
