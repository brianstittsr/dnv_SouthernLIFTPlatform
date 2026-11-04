/**
 * Archives a completed interview session (transcript + evaluation) as a
 * branded PDF in the portal Documents "Interview Transcripts" folder.
 *
 * Staff/admin always see the record; when the respondent is a platform
 * member (matched invite), they see it under their own Documents via
 * visibleToUids.
 *
 * Server-only — imports Firebase Admin and puppeteer.
 */
import { archiveGeneratedDocument } from "@/lib/documents/archive";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import type {
  LiftInterviewDoc,
  LiftInterviewInviteDoc,
  LiftInterviewSessionDoc,
} from "../types";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function formatClock(seconds?: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/** Printable HTML for a session transcript + its evaluation. */
export function buildTranscriptHtml(
  interview: LiftInterviewDoc,
  session: LiftInterviewSessionDoc,
): string {
  const turns = session.messages
    .map(
      (message) => `
      <div class="turn ${message.role}">
        <div class="who">${message.role === "assistant" ? "Interviewer" : escapeHtml(session.respondentName)}</div>
        <div class="what">${escapeHtml(message.content).replace(/\n/g, "<br/>")}</div>
      </div>`,
    )
    .join("");

  const evaluation = session.evaluation;
  const rubricRows = (evaluation?.rubricScores ?? [])
    .map(
      (score) =>
        `<tr><td>${escapeHtml(score.criterion)}</td><td>${score.score}/${score.maxScore}</td><td>${escapeHtml(score.note)}</td></tr>`,
    )
    .join("");
  const insights = (evaluation?.insights ?? []).map((i) => `<li>${escapeHtml(i)}</li>`).join("");
  const steps = (evaluation?.recommendedNextSteps ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    @page { size: Letter; margin: 0.7in; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; color: #1f2933; }
    header { border-bottom: 3px solid #c9a227; padding-bottom: 8px; margin-bottom: 14px; }
    header h1 { margin: 0; color: #0b2545; font-size: 15pt; }
    header .sub { color: #5f6b7a; font-size: 9pt; }
    table.meta { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    table.meta th, table.meta td { text-align: left; vertical-align: top; border: 1px solid #d6dde6; padding: 5px 8px; font-size: 9.5pt; }
    table.meta th { width: 120px; background: #f4f7fb; font-weight: 600; }
    .turn { margin-bottom: 10px; padding: 8px 10px; border: 1px solid #d6dde6; border-radius: 4px; }
    .turn.assistant { background: #f4f7fb; }
    .turn .who { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #5f6b7a; margin-bottom: 3px; }
    h2 { color: #134074; font-size: 12pt; margin: 20px 0 8px; border-bottom: 1px solid #d6dde6; padding-bottom: 4px; }
    table.scores { width: 100%; border-collapse: collapse; }
    table.scores th, table.scores td { border: 1px solid #d6dde6; padding: 5px 8px; font-size: 9pt; text-align: left; vertical-align: top; }
    table.scores th { background: #f4f7fb; }
    .eval { border: 1px solid #d6dde6; padding: 10px 14px; }
    ul { margin: 6px 0; padding-left: 18px; }
    .notice { color: #8a96a3; font-size: 8.5pt; margin-top: 16px; border-top: 1px solid #d6dde6; padding-top: 6px; }
  </style></head><body>
    <header>
      <h1>Interview Transcript</h1>
      <div class="sub">${escapeHtml(interview.title)} — recorded by the LIFT AI Interview Tool</div>
    </header>
    <table class="meta">
      <tr><th>Interview</th><td>${escapeHtml(interview.title)}</td></tr>
      <tr><th>Respondent</th><td>${escapeHtml(session.respondentName)}${session.respondentEmail ? ` &lt;${escapeHtml(session.respondentEmail)}&gt;` : ""}</td></tr>
      <tr><th>Mode</th><td>${escapeHtml(interview.mode)} &middot; source: ${escapeHtml(session.source)}</td></tr>
      <tr><th>Started</th><td>${escapeHtml(new Date(session.startedAt).toLocaleString("en-US"))}</td></tr>
      <tr><th>Duration</th><td>${formatClock(session.completionSeconds)}</td></tr>
      <tr><th>Session</th><td>${escapeHtml(session.id)} &middot; interview v${session.interviewVersion}</td></tr>
    </table>
    ${evaluation ? `
    <h2>Evaluation${evaluation.source === "fallback" ? " (rules-based)" : ""}</h2>
    <div class="eval">
      <p><strong>Summary</strong></p><p>${escapeHtml(evaluation.summary)}</p>
      ${typeof evaluation.overallScore === "number" ? `<p><strong>Overall score:</strong> ${evaluation.overallScore}/100</p>` : ""}
      ${insights ? `<p><strong>Key insights</strong></p><ul>${insights}</ul>` : ""}
      ${rubricRows ? `<table class="scores"><tr><th>Criterion</th><th>Score</th><th>Note</th></tr>${rubricRows}</table>` : ""}
      ${steps ? `<p><strong>Recommended next steps</strong></p><ul>${steps}</ul>` : ""}
    </div>` : ""}
    <h2>Transcript</h2>
    ${turns}
    <div class="notice">Archived by the platform Documents module. Respondent-visible only when invited as a platform member.</div>
  </body></html>`;
}

/**
 * Renders a completed session's transcript + evaluation to PDF and files it
 * in Documents. Returns the document reference, or null when db is absent.
 */
export async function archiveInterviewTranscript(
  interview: LiftInterviewDoc,
  session: LiftInterviewSessionDoc,
  invite?: LiftInterviewInviteDoc | null,
): Promise<{ documentId: string; fileId: string } | null> {
  const html = buildTranscriptHtml(interview, session);
  const pdf = await renderHtmlToPdf(html);
  const nameSlug = session.respondentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "respondent";
  const archived = await archiveGeneratedDocument({
    buffer: pdf,
    fileName: `Interview-Transcript-${nameSlug}-${session.id.slice(0, 8)}.pdf`,
    contentType: "application/pdf",
    category: "interview-transcripts",
    folder: "Interview Transcripts",
    tags: ["Interview Transcript", interview.title, session.respondentName],
    visibleToUids: invite?.recipientUid ? [invite.recipientUid] : undefined,
    uploadedBy: session.respondentName,
    uploaderUid: invite?.recipientUid ?? null,
    source: { type: "interview-transcript", id: session.id, label: interview.title.slice(0, 80) },
  });
  return { documentId: archived.documentId, fileId: archived.fileId };
}
