import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";

export interface PdfGenerationOptions {
  html: string;
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Launch a headless browser suitable for the current environment.
 * Uses @sparticuz/chromium in production and local Chrome during development.
 */
async function getBrowser() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 1600 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const possiblePaths =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        ]
      : process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];

  let executablePath = possiblePaths[0];
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      executablePath = path;
      break;
    }
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

/**
 * Generate a PDF buffer from HTML content using Puppeteer.
 */
export async function generatePdfFromHtml(options: PdfGenerationOptions): Promise<Buffer> {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(options.html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      landscape: options.landscape ?? false,
      margin: {
        top: options.margin?.top ?? "0.5in",
        right: options.margin?.right ?? "0.5in",
        bottom: options.margin?.bottom ?? "0.5in",
        left: options.margin?.left ?? "0.5in",
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
