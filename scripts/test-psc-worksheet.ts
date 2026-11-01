import JSZip from "jszip";
import { buildWorksheetDocx } from "../lib/onboarding/worksheet-docx";
import { parseWorksheetText } from "../lib/onboarding/worksheet";

async function main() {
  const buf = await buildWorksheetDocx();
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file("word/document.xml")!.async("text");

  const comboCount = (xml.match(/<w:comboBox>/g) ?? []).length;
  const checkboxCount = (xml.match(/w14:checkbox/g) ?? []).length;
  console.log("comboBox controls:", comboCount, "| total checkboxes:", checkboxCount);
  console.log("docx size:", Math.round(buf.length / 1024), "KB");

  // Simulate Word filling the combo boxes: PSC pick + typed text for
  // productsServices; codes + a keyword for NAICS.
  let filled = xml.replace(
    /<w:sdt>(?:(?!<\/w:sdt>)[\s\S])*?<w:tag w:val="productsServices"\/>[\s\S]*?<\/w:sdt>/,
    (block) =>
      block.replace(
        /<w:sdtContent>[\s\S]*?<\/w:sdtContent>/,
        "<w:sdtContent><w:r><w:t>R425 — Support- Professional: Engineering/Technical, custom fabrication services</w:t></w:r></w:sdtContent>",
      ),
  );
  filled = filled.replace(
    /<w:sdt>(?:(?!<\/w:sdt>)[\s\S])*?<w:tag w:val="primaryNaics"\/>[\s\S]*?<\/w:sdt>/,
    (block) =>
      block.replace(
        /<w:sdtContent>[\s\S]*?<\/w:sdtContent>/,
        "<w:sdtContent><w:r><w:t>541511, food manufacturing</w:t></w:r></w:sdtContent>",
      ),
  );

  const resolved = filled.replace(/<w:sdt\b[^>]*>[\s\S]*?<\/w:sdt>/g, (block) => {
    if (/<w14:checkbox|<w:checkBox/.test(block)) {
      return /<w14:checked w14:val="1"|<w:checked w:val="(?:1|true|on)"/.test(block) ? "[x] " : "[ ] ";
    }
    const content = block.match(/<w:sdtContent>[\s\S]*?<\/w:sdtContent>/)?.[0] ?? "";
    return content.replace(/<[^>]+>/g, "");
  });
  const text = resolved
    .split(/<\/w:p>/)
    .map((p) => p.replace(/<[^>]+>/g, ""))
    .join("\n");

  const answers = parseWorksheetText(text);
  console.log("productsServices:", JSON.stringify(answers.productsServices, null, 2));
  console.log("primaryNaics:", JSON.stringify(answers.primaryNaics, null, 2));
}

main();
