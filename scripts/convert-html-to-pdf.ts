import * as fs from "fs";
import * as path from "path";
import { generatePdfFromHtml } from "@/lib/pdf-utils";

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: pnpm exec tsx scripts/convert-html-to-pdf.ts <path-to-html>");
    process.exit(1);
  }

  const absoluteInput = path.resolve(inputPath);
  if (!fs.existsSync(absoluteInput)) {
    console.error(`File not found: ${absoluteInput}`);
    process.exit(1);
  }

  const html = fs.readFileSync(absoluteInput, "utf-8");
  const outputPath = absoluteInput.replace(/\.html$/i, ".pdf");

  console.log(`Converting ${absoluteInput} to PDF...`);

  const pdfBuffer = await generatePdfFromHtml({
    html,
    margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
  });

  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`PDF saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error("Conversion failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
