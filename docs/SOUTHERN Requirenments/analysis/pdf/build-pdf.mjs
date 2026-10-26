/**
 * Builds branded PDFs for the Southern LIFT analysis documents.
 *
 * The build tools are installed outside the repository so project dependencies stay unchanged:
 *   npm install --prefix "%TEMP%\lift-pdf-tools" --ignore-scripts marked@15.0.12 puppeteer-core@24.10.0 pdf-lib@1.17.1
 *
 * Usage (from the repository root):
 *   node "docs/SOUTHERN Requirenments/analysis/pdf/build-pdf.mjs"
 *
 * Optional environment variables:
 *   LIFT_PDF_TOOLS  Folder containing the tools above (default: %TEMP%\lift-pdf-tools)
 *   CHROME_PATH     Chrome or Edge executable (default: installed Google Chrome)
 */
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const pdfDir = path.dirname(fileURLToPath(import.meta.url));
const analysisDir = path.resolve(pdfDir, "..");
const toolsDir = process.env.LIFT_PDF_TOOLS ?? path.join(tmpdir(), "lift-pdf-tools");
const toolsRequire = createRequire(path.join(toolsDir, "package.json"));

const markedModule = await import(pathToFileURL(toolsRequire.resolve("marked")).href);
const marked = markedModule.marked ?? markedModule.default?.marked;
const puppeteerModule = await import(pathToFileURL(toolsRequire.resolve("puppeteer-core")).href);
const puppeteer = puppeteerModule.default ?? puppeteerModule;
const pdfLibModule = await import(pathToFileURL(toolsRequire.resolve("pdf-lib")).href);
const { PDFDocument } = pdfLibModule.default ?? pdfLibModule;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));

/** @type {{ source: string; output: string; eyebrow: string; title: string; subtitle: string }[]} */
const documents = [
  {
    source: "LIFT_Gap_Analysis.md",
    output: "LIFT_Gap_Analysis.pdf",
    eyebrow: "Platform Gap Analysis",
    title: "Southern University LIFT Rural Business Center",
    subtitle:
      "Assessment of the existing platform against MBDA Rural LIFT program requirements, including the AI Interview Tool, Proposal Generator, and Form Builder.",
  },
  {
    source: "LIFT_System_Design.md",
    output: "LIFT_System_Design.pdf",
    eyebrow: "Platform System Design",
    title: "Southern University LIFT Rural Business Center",
    subtitle:
      "Architecture and module specifications for the new and extended capabilities that close the identified platform gaps.",
  },
];

const BADGES = ["READY", "CONFIGURE", "EXTEND", "BUILD"];

/**
 * Converts a heading's text into a stable anchor id.
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Renders Markdown to HTML and returns the body plus a table of contents.
 * @param {string} markdown
 * @returns {{ body: string; toc: string }}
 */
function renderMarkdown(markdown) {
  const withoutTitle = markdown.replace(/^# .*\r?\n/, "");
  let html = marked.parse(withoutTitle, { gfm: true, async: false });

  for (const badge of BADGES) {
    html = html.replaceAll(
      `[${badge}]`,
      `<span class="badge badge-${badge.toLowerCase()}">${badge}</span>`
    );
  }

  const tocItems = [];
  let h2Count = 0;
  html = html.replace(/<h([23])>(.*?)<\/h\1>/g, (_match, level, inner) => {
    const id = slugify(inner);
    tocItems.push({ level: Number(level), id, text: inner.replace(/<[^>]+>/g, "") });
    const breakClass = level === "2" && h2Count++ > 0 && /^(\d+\.|Appendix)/.test(inner) ? ' class="section-break"' : "";
    return `<h${level} id="${id}"${breakClass}>${inner}</h${level}>`;
  });

  const firstTableEnd = html.indexOf("</table>");
  if (html.trimStart().startsWith("<table") && firstTableEnd > -1) {
    const end = firstTableEnd + "</table>".length;
    html = `<div class="doc-control">${html.slice(0, end)}</div>${html.slice(end)}`;
  }

  const toc = tocItems
    .filter((item) => item.level === 2 || /^\d+\.\d+|^M\d+\./.test(item.text))
    .map((item) => `<li class="l${item.level}"><a href="#${item.id}">${item.text}</a></li>`)
    .join("");

  return { body: html, toc };
}

/**
 * Wraps content in a printable HTML page.
 * @param {(typeof documents)[number]} doc
 * @param {string} css
 * @param {string} content
 * @param {string} [extraCss]
 * @returns {string}
 */
function htmlPage(doc, css, content, extraCss = "") {
  const baseHref = pathToFileURL(analysisDir + path.sep).href;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<base href="${baseHref}" />
<title>${doc.eyebrow} - ${doc.title}</title>
<style>${css}${extraCss}</style>
</head>
<body>${content}</body>
</html>`;
}

/**
 * Builds the cover page HTML (printed without running header and footer).
 * @param {(typeof documents)[number]} doc
 * @param {string} css
 * @returns {string}
 */
function buildCoverHtml(doc, css) {
  return htmlPage(
    doc,
    css,
    `<section class="cover">
  <div class="logos">
    <div class="logo-slot">Southern University<br/>LIFT Center Logo</div>
    <div class="logo-slot">MBDA Logo<br/>(per current branding guide)</div>
  </div>
  <div class="eyebrow">${doc.eyebrow}</div>
  <h1>${doc.title}</h1>
  <div class="subtitle">${doc.subtitle}</div>
  <div class="rule"></div>
  <div class="meta">
    <div><strong>Program:</strong> MBDA Rural Business Center Program · MBDA-OBC-2026-00003</div>
    <div><strong>Recipient:</strong> Southern University and A&amp;M College, College of Business</div>
    <div><strong>Prepared with:</strong> KDM &amp; Associates, LLC — Program Management &amp; Platform</div>
    <div><strong>Version:</strong> 1.0 Draft · October 25, 2026</div>
  </div>
  <div class="footer-note">Confidential draft for internal review. Logo placeholders will be replaced once the current MBDA branding guide is confirmed. This project is supported by the U.S. Department of Commerce, Minority Business Development Agency.</div>
</section>`,
    "@page { margin: 0; }"
  );
}

/**
 * Builds the contents page and document body HTML.
 * @param {(typeof documents)[number]} doc
 * @param {string} css
 * @returns {Promise<string>}
 */
async function buildBodyHtml(doc, css) {
  const markdown = await readFile(path.join(analysisDir, doc.source), "utf8");
  const { body, toc } = renderMarkdown(markdown);
  return htmlPage(
    doc,
    css,
    `<section class="toc">
  <h2>Contents</h2>
  <ol>${toc}</ol>
</section>
<main>${body}</main>`
  );
}

/**
 * Prints an HTML file to a PDF buffer.
 * @param {import("puppeteer-core").Browser} browser
 * @param {string} htmlPath
 * @param {import("puppeteer-core").PDFOptions} options
 * @returns {Promise<Uint8Array>}
 */
async function printPdf(browser, htmlPath, options) {
  const page = await browser.newPage();
  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    return await page.pdf({ format: "Letter", printBackground: true, ...options });
  } finally {
    await page.close();
  }
}

/**
 * Renders every configured document to PDF.
 * @returns {Promise<void>}
 */
async function main() {
  const css = await readFile(path.join(pdfDir, "lift-report.css"), "utf8");
  const workDir = await mkdtemp(path.join(tmpdir(), "lift-pdf-"));
  if (!chromePath) throw new Error("Chrome or Edge not found; set CHROME_PATH.");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ["--allow-file-access-from-files"],
  });

  try {
    for (const doc of documents) {
      const baseName = doc.source.replace(/\.md$/, "");
      const coverPath = path.join(workDir, `${baseName}-cover.html`);
      const bodyPath = path.join(workDir, `${baseName}-body.html`);
      await writeFile(coverPath, buildCoverHtml(doc, css), "utf8");
      await writeFile(bodyPath, await buildBodyHtml(doc, css), "utf8");

      const coverPdf = await printPdf(browser, coverPath, {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        pageRanges: "1",
      });
      const bodyPdf = await printPdf(browser, bodyPath, {
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="width:100%;font-size:7.5pt;color:#5f6b7a;padding:0 0.75in;display:flex;justify-content:space-between;font-family:Segoe UI,Arial,sans-serif;"><span>Southern University LIFT Center · ${doc.eyebrow}</span><span>Confidential Draft</span></div>`,
        footerTemplate: `<div style="width:100%;font-size:7.5pt;color:#5f6b7a;padding:0 0.75in;display:flex;justify-content:space-between;font-family:Segoe UI,Arial,sans-serif;"><span>MBDA-OBC-2026-00003 · Version 1.0</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
      });

      const merged = await PDFDocument.create();
      merged.setTitle(`${doc.eyebrow} - ${doc.title}`);
      merged.setAuthor("KDM & Associates, LLC for Southern University LIFT Center");
      merged.setSubject("MBDA Rural Business Center Program - MBDA-OBC-2026-00003");
      for (const source of [coverPdf, bodyPdf]) {
        const sourceDoc = await PDFDocument.load(source);
        const pages = await merged.copyPages(sourceDoc, sourceDoc.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      await writeFile(path.join(analysisDir, doc.output), await merged.save());
      console.log(`Created ${doc.output} (${merged.getPageCount()} pages)`);
    }
  } finally {
    await browser.close();
    await rm(workDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("PDF build failed:", error);
  process.exitCode = 1;
});
