/** Builds the LIFT-branded printable HTML for a saved report (fed to renderHtmlToPdf). */
import type { SerializedLiftReport } from "./types";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const para = (text: string): string =>
  text.split(/\n{2,}/).map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`).join("");

const list = (items: string[]): string =>
  items.length ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : '<p class="muted">None identified.</p>';

/** Renders a saved report (serialized — Timestamps already ISO strings) as branded report HTML. */
export function buildReportHtml(report: SerializedLiftReport): string {
  const metricRows = report.metrics
    .map((m) => `<tr><th>${escapeHtml(m.label)}</th><td>${escapeHtml(m.value)}${m.note ? `<div class="muted">${escapeHtml(m.note)}</div>` : ""}</td></tr>`)
    .join("");
  const scopeLine = report.type === "client_deepdive"
    ? `Client: ${escapeHtml(report.clientName ?? report.liftClientId ?? "")}`
    : `Period: ${escapeHtml(report.periodLabel ?? "All time")}`;

  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    @page { size: Letter; margin: 0.7in 0.7in 0.8in; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; color: #1f2933; }
    header { border-bottom: 3px solid #c9a227; padding-bottom: 8px; margin-bottom: 14px; }
    header h1 { margin: 0; color: #0b2545; font-size: 16pt; }
    header .sub { color: #5f6b7a; }
    h2 { color: #134074; font-size: 12pt; margin: 18px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    th, td { text-align: left; vertical-align: top; border: 1px solid #d6dde6; padding: 5px 7px; }
    th { width: 42%; background: #f4f7fb; font-weight: 600; }
    ul { margin: 4px 0; padding-left: 18px; }
    li { margin-bottom: 3px; }
    p { margin: 6px 0; }
    .muted { color: #8a96a3; font-size: 8.5pt; }
    .badge { display: inline-block; border: 1px solid #c9a227; color: #0b2545; border-radius: 3px; padding: 1px 6px; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; }
    .prompt { border-left: 3px solid #c9a227; background: #fbf7ea; padding: 8px 10px; font-style: italic; }
    footer { margin-top: 20px; font-size: 8pt; color: #5f6b7a; border-top: 1px solid #d6dde6; padding-top: 6px; }
  </style></head><body>
    <header>
      <h1>Southern University LIFT Rural Business Center</h1>
      <div class="sub">MBDA Rural Business Center — Program Report</div>
      <div class="sub">${escapeHtml(report.title)}</div>
      <div class="sub">${scopeLine} &middot; Generated ${escapeHtml(report.createdAt.slice(0, 10))} by ${escapeHtml(report.createdByName)} &middot; <span class="badge">${report.source === "ai" ? "AI-assisted" : "Data summary"}</span></div>
    </header>
    ${report.prompt ? `<div class="prompt">Analysis focus: ${escapeHtml(report.prompt)}</div>` : ""}
    <h2>Key metrics</h2>
    <table>${metricRows}</table>
    <h2>Executive summary</h2>
    ${para(report.narrative.executiveSummary)}
    <h2>Analysis</h2>
    ${para(report.narrative.trendAnalysis)}
    <h2>Gaps &amp; risks</h2>
    ${list(report.narrative.gapsAndRisks)}
    <h2>Recommendations</h2>
    ${list(report.narrative.recommendations)}
    ${report.narrative.evidenceNotes ? `<h2>Data coverage &amp; limitations</h2>${para(report.narrative.evidenceNotes)}` : ""}
    <footer>
      Southern University LIFT Rural Business Center &middot; Confidential — for program staff and MBDA reporting use.<br/>
      Report ID: ${escapeHtml(report.id)}${report.model ? ` &middot; Model: ${escapeHtml(report.model)}` : ""} &middot; Figures are drawn from the platform data pack saved with this report; unverified claims are excluded from MBDA measures.
    </footer>
  </body></html>`;
}
