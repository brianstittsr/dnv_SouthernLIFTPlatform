/**
 * PDF-to-Markdown Extraction Utility
 *
 * Extracts text content from PDF buffers and converts to structured markdown
 * for storage in Firestore. This enables AI to use attachment content as
 * context for SAM.gov RFI/RFP recommendations.
 */

export interface PdfExtractionResult {
  markdown: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * Extract text from a PDF buffer and convert to structured markdown.
 * Uses dynamic import of pdf-parse to avoid build issues if the package
 * is not installed in certain environments.
 */
export async function extractPdfMarkdown(buffer: Buffer): Promise<PdfExtractionResult> {
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(buffer);

    const rawText: string = data.text || "";
    const pageCount: number = data.numpages || 0;
    const info = data.info || {};

    const markdown = convertTextToMarkdown(rawText, pageCount);

    return {
      markdown,
      pageCount,
      metadata: {
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(
      `Failed to extract PDF text: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Convert raw PDF text into structured markdown.
 * - Splits on form-feed characters (page breaks)
 * - Detects potential headers (short lines, all caps, numbered sections)
 * - Preserves paragraph structure
 */
function convertTextToMarkdown(rawText: string, pageCount: number): string {
  if (!rawText.trim()) {
    return "[No extractable text found in this PDF. The document may be scanned images or contain only graphics.]";
  }

  // Split on form-feed (page break character \f or \x0c)
  const pages = rawText.split(/\f/);
  const markdownParts: string[] = [];

  pages.forEach((pageText, index) => {
    const trimmed = pageText.trim();
    if (!trimmed) return;

    if (index > 0) {
      markdownParts.push("\n---\n");
    }

    // Process lines to detect headers and structure
    const lines = trimmed.split("\n");
    const processedLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        processedLines.push("");
        continue;
      }

      // Detect all-caps headers (likely section titles)
      if (
        trimmedLine.length < 80 &&
        trimmedLine === trimmedLine.toUpperCase() &&
        /[A-Z]/.test(trimmedLine) &&
        !trimmedLine.endsWith(".") &&
        !trimmedLine.endsWith(",")
      ) {
        processedLines.push(`## ${trimmedLine}`);
        continue;
      }

      // Detect numbered section headers (e.g., "1. Introduction", "2.0 Scope")
      const numberedMatch = trimmedLine.match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
      if (
        numberedMatch &&
        trimmedLine.length < 100 &&
        !trimmedLine.endsWith(".") &&
        !trimmedLine.includes(";")
      ) {
        const level = (numberedMatch[1].match(/\./g) || []).length + 2;
        const prefix = "#".repeat(Math.min(level, 6));
        processedLines.push(`${prefix} ${numberedMatch[1]} ${numberedMatch[2]}`);
        continue;
      }

      processedLines.push(trimmedLine);
    }

    // Join lines and clean up excessive blank lines
    let pageMarkdown = processedLines.join("\n").replace(/\n{3,}/g, "\n\n");
    markdownParts.push(pageMarkdown);
  });

  const result = markdownParts.join("\n");

  // Truncate if extremely long (Firestore document limit is 1MB)
  const MAX_LENGTH = 900000;
  if (result.length > MAX_LENGTH) {
    return result.substring(0, MAX_LENGTH) + "\n\n[... Content truncated due to length limit ...]";
  }

  return result;
}

/**
 * Check if a file type is a PDF.
 */
export function isPdf(fileType: string, fileName: string): boolean {
  return (
    fileType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  );
}
