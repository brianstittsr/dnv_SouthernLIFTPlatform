/**
 * Generate the KDM Homepage Redesign & Growth Strategy PDF report.
 *
 * Renders reports/homepage-redesign-report.html with headless Chrome
 * (puppeteer, channel:"chrome" — uses installed Chrome so no Chromium
 * download is required; falls back to the bundled/browser fetch if
 * Chrome isn't found) and writes reports/KDM-Homepage-Redesign-Proposal.pdf.
 *
 * Usage:
 *   npx tsx scripts/generate-homepage-report.ts
 */

import * as fs from "fs";
import * as path from "path";

const REPORT_DIR = path.resolve(process.cwd(), "reports");
const HTML_PATH = path.join(REPORT_DIR, "homepage-redesign-report.html");
const PDF_PATH = path.join(REPORT_DIR, "KDM-Homepage-Redesign-Proposal.pdf");

async function main() {
  if (!fs.existsSync(HTML_PATH)) {
    console.error(`Report HTML not found: ${HTML_PATH}`);
    process.exit(1);
  }

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const html = fs.readFileSync(HTML_PATH, "utf-8").replace("<!--DATE-->", date);

  const puppeteer = (await import("puppeteer")).default;

  let browser;
  try {
    browser = await puppeteer.launch({ channel: "chrome" });
  } catch {
    console.log("System Chrome not found — falling back to puppeteer's bundled browser.");
    browser = await puppeteer.launch();
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: PDF_PATH,
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:7px;width:100%;padding:0 40px;color:#94a3b8;font-family:Arial">
        <span>KDM &amp; Associates</span><span style="float:right">Homepage Redesign &amp; Growth Strategy</span>
      </div>`,
      footerTemplate: `<div style="font-size:7px;width:100%;padding:0 40px;color:#94a3b8;font-family:Arial">
        <span>Internal — For Keith Moore's Review</span>
        <span style="float:right">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
      margin: { top: "46px", bottom: "52px", left: "42px", right: "42px" },
    });
  } finally {
    await browser.close();
  }

  const kb = Math.round(fs.statSync(PDF_PATH).size / 1024);
  console.log(`✅ Report generated: ${PDF_PATH} (${kb} KB)`);
}

main().catch((err) => {
  console.error("Failed to generate report:", err);
  process.exit(1);
});
