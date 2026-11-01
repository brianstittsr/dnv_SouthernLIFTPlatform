import JSZip from "jszip";
import * as fs from "fs";

const CODE_RE = /^[A-Z0-9]{4}$/;
const SKIP_RE = /^(Includes:|Excludes:|PSC|PSC Code|PSC Description|Description|Category|Note:|None)/i;

async function main() {
  const zip = await JSZip.loadAsync(fs.readFileSync("psc.docx"));
  const xml = await zip.file("word/document.xml")!.async("text");
  const text = xml
    .replace(/<w:tab[^>]*\/>/g, " | ")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  const lines = text.split("\n").map((l) => l.trim());

  const codes = new Map<string, string>();
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (!CODE_RE.test(line)) continue;
    const next = lines[i + 1];
    if (!next || SKIP_RE.test(next) || CODE_RE.test(next)) continue;
    if (!codes.has(line)) {
      // R&D descriptions look like "Top; Sub; Detail" — drop the repeated top
      // level so the label reads "Sub; Detail".
      const parts = next.split(";").map((p) => p.trim()).filter(Boolean);
      codes.set(line, parts.length > 1 ? parts.slice(1).join("; ") : next);
    }
  }

  const sorted = [...codes.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );
  console.log(`${sorted.length} codes`);
  console.log(sorted.slice(0, 10));
  console.log(sorted.filter(([c]) => c.startsWith("R42")).slice(0, 10));

  const body = sorted
    .map(([code, name]) => `  { code: ${JSON.stringify(code)}, name: ${JSON.stringify(name)} },`)
    .join("\n");
  fs.writeFileSync(
    "lib/onboarding/psc-codes.ts",
    `/**
 * Federal Product and Service Codes (PSC), extracted from the GSA PSC Manual,
 * April 2024 edition (acquisition.gov). Used by the LIFT onboarding wizard to
 * let clients tag products/services with the same codes agencies buy under.
 *
 * Regenerate: download the PSC Manual .docx and run scripts/extract-psc.ts.
 */
export interface PscCode {
  code: string;
  name: string;
}

export const PSC_CODES: PscCode[] = [
${body}
];
`
  );
}

main();
