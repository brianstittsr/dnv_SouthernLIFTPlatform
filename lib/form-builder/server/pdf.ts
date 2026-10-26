import type { Browser } from "puppeteer-core";
import { fieldHasValue } from "../controls";
import type { FieldValue, LiftFormDoc, LiftFormSubmissionDoc, TableRow } from "../types";
import { getBucket } from "./context";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Formats an answer for display in the PDF. */
function formatValue(value: FieldValue | undefined, type: string): string {
  if (value === undefined || value === null || value === "") return '<span class="muted">Not answered</span>';
  if (type === "currency" && typeof value === "number") return escapeHtml(value.toLocaleString("en-US", { style: "currency", currency: "USD" }));
  if (type === "checkbox") return value === true ? "Yes" : "No";
  if (type === "yes_no") return value === "yes" ? "Yes" : "No";
  if (type === "repeating_table" && Array.isArray(value)) {
    const rows = value as TableRow[];
    if (!rows.length) return '<span class="muted">None</span>';
    const headers = Object.keys(rows[0]);
    return `<table class="inner"><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>${rows
      .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(String(row[header] ?? ""))}</td>`).join("")}</tr>`)
      .join("")}</table>`;
  }
  if (type === "file_upload" && Array.isArray(value)) {
    return (value as { fileName?: string }[]).map((file) => escapeHtml(file.fileName ?? "file")).join(", ") || '<span class="muted">None</span>';
  }
  if (Array.isArray(value)) return escapeHtml(value.map(String).join(", "));
  if (typeof value === "object") return escapeHtml((value as { typedName?: string }).typedName ?? "Signed");
  return escapeHtml(String(value)).replace(/\n/g, "<br/>");
}

/** Builds printable HTML for a submission. */
async function buildHtml(form: LiftFormDoc, submission: LiftFormSubmissionDoc, includeStaff: boolean): Promise<string> {
  const staffSections = new Set(form.sections.filter((section) => section.staffOnly).map((section) => section.id));
  const visibleFields = form.fields.filter(
    (field) => fieldHasValue(field.type) && (includeStaff || (!field.staffOnly && !(field.section && staffSections.has(field.section))))
  );

  const signatureImages = new Map<string, string>();
  for (const signature of submission.signatures ?? []) {
    if (!signature.storagePath) continue;
    try {
      const [buffer] = await getBucket().file(signature.storagePath).download();
      signatureImages.set(signature.fieldKey, `data:image/png;base64,${buffer.toString("base64")}`);
    } catch (error) {
      console.error("Signature image could not be loaded for PDF:", error);
    }
  }

  const sections = form.sections
    .filter((section) => includeStaff || !section.staffOnly)
    .map((section) => {
      const rows = visibleFields
        .filter((field) => (field.section ?? form.sections[0]?.id) === section.id && field.type !== "signature")
        .map((field) => `<tr><th>${escapeHtml(field.label)}</th><td>${formatValue(submission.values[field.key], field.type)}</td></tr>`)
        .join("");
      return rows ? `<h2>${escapeHtml(section.title)}</h2><table>${rows}</table>` : "";
    })
    .join("");

  const signatures = (submission.signatures ?? [])
    .map((signature) => {
      const image = signatureImages.get(signature.fieldKey);
      const mark = image ? `<img src="${image}" alt="Signature" />` : `<div class="typed">${escapeHtml(signature.typedName ?? signature.signedByName)}</div>`;
      return `<div class="signature">${mark}<div>${escapeHtml(signature.signedByName)} &middot; ${escapeHtml(new Date(signature.signedAt).toLocaleString("en-US"))}</div></div>`;
    })
    .join("");

  const consent = form.consentText ? `<h2>Terms accepted</h2><div class="consent">${escapeHtml(form.consentText).replace(/\n/g, "<br/>")}</div>` : "";

  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    @page { size: Letter; margin: 0.7in 0.7in 0.8in; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; color: #1f2933; }
    header { border-bottom: 3px solid #c9a227; padding-bottom: 8px; margin-bottom: 14px; }
    header h1 { margin: 0; color: #0b2545; font-size: 16pt; }
    header .sub { color: #5f6b7a; }
    h2 { color: #134074; font-size: 12pt; margin: 18px 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    th, td { text-align: left; vertical-align: top; border: 1px solid #d6dde6; padding: 5px 7px; }
    th { width: 40%; background: #f4f7fb; font-weight: 600; }
    table.inner th { width: auto; }
    .muted { color: #8a96a3; }
    .consent { font-size: 8.5pt; color: #3d4752; border: 1px solid #d6dde6; padding: 8px; }
    .signature { margin-top: 10px; }
    .signature img { height: 60px; border-bottom: 1px solid #1f2933; }
    .typed { font-family: "Brush Script MT", cursive; font-size: 20pt; border-bottom: 1px solid #1f2933; display: inline-block; min-width: 240px; }
    footer { margin-top: 20px; font-size: 8pt; color: #5f6b7a; border-top: 1px solid #d6dde6; padding-top: 6px; }
  </style></head><body>
    <header>
      <h1>${escapeHtml(form.pdfConfig?.headerTitle ?? "Southern University LIFT Center")}</h1>
      <div class="sub">${escapeHtml(form.pdfConfig?.headerSubtitle ?? form.title)}</div>
      <div class="sub">${escapeHtml(form.title)} &middot; Form version ${submission.formVersion}${form.ombControlNumber ? ` &middot; OMB Control No. ${escapeHtml(form.ombControlNumber)}` : ""}</div>
    </header>
    <table>
      <tr><th>Submitted by</th><td>${escapeHtml(submission.submittedByName)}${submission.submittedByEmail ? ` (${escapeHtml(submission.submittedByEmail)})` : ""}</td></tr>
      <tr><th>Submitted at</th><td>${escapeHtml(new Date(submission.createdAt).toLocaleString("en-US"))}</td></tr>
      <tr><th>Submission ID</th><td>${escapeHtml(submission.id)}</td></tr>
    </table>
    ${sections}
    ${consent}
    ${signatures ? `<h2>Signature</h2>${signatures}` : ""}
    <footer>${escapeHtml(form.pdfConfig?.footerText ?? "")}<br/>Content hash (SHA-256): ${escapeHtml(submission.contentHash)}</footer>
  </body></html>`;
}

/** Common local browser locations used when the bundled puppeteer browser is not installed. */
const LOCAL_BROWSERS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

/**
 * Launches Chromium: serverless build on Vercel, CHROME_PATH if set, the bundled
 * puppeteer browser, or a locally installed Chrome/Edge.
 */
async function launchBrowser(): Promise<Browser> {
  const puppeteerCore = await import("puppeteer-core");
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteerCore.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  }
  if (process.env.CHROME_PATH) return puppeteerCore.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    const puppeteer = await import("puppeteer");
    return (await puppeteer.default.launch({ headless: true })) as unknown as Browser;
  } catch (error) {
    const { existsSync } = await import("node:fs");
    const executablePath = LOCAL_BROWSERS.find((candidate) => existsSync(candidate));
    if (!executablePath) throw error;
    return puppeteerCore.launch({ executablePath, headless: true });
  }
}

/** Renders a submission to a PDF buffer. */
export async function renderSubmissionPdf(form: LiftFormDoc, submission: LiftFormSubmissionDoc, includeStaff: boolean): Promise<Buffer> {
  const html = await buildHtml(form, submission, includeStaff);
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: '<div style="width:100%;font-size:7pt;color:#5f6b7a;padding:0 0.7in;text-align:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
