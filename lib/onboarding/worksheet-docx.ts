/**
 * Generates the LIFT client onboarding worksheet as a real .docx package
 * (raw OOXML via jszip) so we can embed Word content controls the `docx`
 * library doesn't support:
 *   - dropdown content controls for choice / yes-no fields
 *   - clickable w14 checkbox controls for multi-select lists
 *   - plain-text content controls for free-text fields
 * Layout mirrors the wizard: cover page, one page per wizard step (table of
 * labeled fields), and a NAICS reference appendix.
 *
 * The upload parser (app/api/onboarding/worksheet/route.ts + worksheet.ts)
 * reads control state back: dropdown/text selections surface as text after
 * the field label, and checkbox controls are pre-rendered as "[x]"/"[ ]"
 * markers consumed by coerceList.
 */
import JSZip from "jszip";
import { NAICS_OPTIONS } from "@/lib/form-builder/controls";
import { WORKSHEET_SECTIONS, type WorksheetField } from "./worksheet";
import { PSC_CODES } from "./psc-codes";

const esc = (v: string): string =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const PLACEHOLDER = "Choose an item.";
const TEXT_PLACEHOLDER = "Click or tap here to enter your answer.";

let nextSdtId = 1000;
const sdtId = () => String(++nextSdtId);

// ---------- low-level run/paragraph/table builders ----------

interface RunOpts {
  b?: boolean;
  i?: boolean;
  color?: string;
  sz?: number;
  font?: string;
}

const run = (text: string, o: RunOpts = {}): string =>
  `<w:r><w:rPr>${o.b ? "<w:b/>" : ""}${o.i ? "<w:i/>" : ""}${o.color ? `<w:color w:val="${o.color}"/>` : ""}${o.sz ? `<w:sz w:val="${o.sz}"/>` : ""}${o.font ? `<w:rFonts w:ascii="${o.font}" w:eastAsia="${o.font}" w:hAnsi="${o.font}" w:hint="eastAsia"/>` : ""}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;

interface ParaOpts {
  style?: string;
  before?: number;
  after?: number;
  pageBreak?: boolean;
  keepNext?: boolean;
  shd?: string;
  align?: "center" | "right";
  borderBottom?: string;
}

const para = (runs: string | string[], o: ParaOpts = {}): string =>
  `<w:p><w:pPr>${o.pageBreak ? "<w:pageBreakBefore/>" : ""}${o.style ? `<w:pStyle w:val="${o.style}"/>` : ""}${o.keepNext ? "<w:keepNext/>" : ""}${o.align ? `<w:jc w:val="${o.align}"/>` : ""}${o.shd ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>` : ""}${o.borderBottom ? `<w:pBdr><w:bottom w:val="single" w:sz="18" w:space="4" w:color="${o.borderBottom}"/></w:pBdr>` : ""}<w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? 120}"/></w:pPr>${Array.isArray(runs) ? runs.join("") : runs}</w:p>`;

const cell = (content: string, width: number, shd?: string): string =>
  `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${shd ? `<w:shd w:val="clear" w:color="auto" w:fill="${shd}"/>` : ""}<w:vAlign w:val="center"/><w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${content}</w:tc>`;

const table = (rows: string[], colWidths: number[]): string =>
  `<w:tbl><w:tblPr><w:tblW w:w="${colWidths.reduce((a, b) => a + b, 0)}" w:type="dxa"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"]
    .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="D6DDE6"/>`)
    .join("")}</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${colWidths
    .map((w) => `<w:gridCol w:w="${w}"/>`)
    .join("")}</w:tblGrid>${rows.join("")}</w:tbl>`;

const row = (...cells: string[]): string => `<w:tr>${cells.join("")}</w:tr>`;

// ---------- Word content controls ----------

/** Plain-text content control the user can type into. */
const textCtl = (tag: string, placeholder = TEXT_PLACEHOLDER): string =>
  `<w:sdt><w:sdtPr><w:alias w:val="${esc(tag)}"/><w:tag w:val="${esc(tag)}"/><w:id w:val="${sdtId()}"/><w:showingPlcHdr/><w:text/></w:sdtPr><w:sdtContent>${run(placeholder, { color: "9AA5B1" })}</w:sdtContent></w:sdt>`;

/** Dropdown content control. */
const dropCtl = (tag: string, options: readonly string[]): string =>
  `<w:sdt><w:sdtPr><w:alias w:val="${esc(tag)}"/><w:tag w:val="${esc(tag)}"/><w:id w:val="${sdtId()}"/><w:showingPlcHdr/><w:dropDownList><w:listItem w:displayText="${PLACEHOLDER}" w:value="${PLACEHOLDER}"/>${options
    .map((o) => `<w:listItem w:displayText="${esc(o)}" w:value="${esc(o)}"/>`)
    .join("")}</w:dropDownList></w:sdtPr><w:sdtContent>${run(PLACEHOLDER, { color: "9AA5B1" })}</w:sdtContent></w:sdt>`;

/** Combo box content control — dropdown items, but the user can also type. */
const comboCtl = (tag: string, options: readonly string[]): string =>
  `<w:sdt><w:sdtPr><w:alias w:val="${esc(tag)}"/><w:tag w:val="${esc(tag)}"/><w:id w:val="${sdtId()}"/><w:showingPlcHdr/><w:comboBox><w:listItem w:displayText="${PLACEHOLDER}" w:value="${PLACEHOLDER}"/>${options
    .map((o) => `<w:listItem w:displayText="${esc(o)}" w:value="${esc(o)}"/>`)
    .join("")}</w:comboBox></w:sdtPr><w:sdtContent>${run(PLACEHOLDER, { color: "9AA5B1" })}</w:sdtContent></w:sdt>`;

/** Clickable checkbox content control (Word 2010+). */
const checkCtl = (): string =>
  `<w:sdt><w:sdtPr><w:id w:val="${sdtId()}"/><w14:checkbox><w14:checked w14:val="0"/><w14:checkedState w14:val="2612" w14:font="MS Gothic"/><w14:uncheckedState w14:val="2610" w14:font="MS Gothic"/></w14:checkbox></w:sdtPr><w:sdtContent><w:r><w:rPr><w:rFonts w:ascii="MS Gothic" w:eastAsia="MS Gothic" w:hAnsi="MS Gothic" w:hint="eastAsia"/></w:rPr><w:t>☐</w:t></w:r></w:sdtContent></w:sdt>`;

// ---------- field → answer-cell control ----------

const controlFor = (field: WorksheetField): string => {
  switch (field.kind) {
    case "yesno":
      return para([dropCtl(field.key, ["Yes", "No"])], { after: 0 });
    case "bool":
      return para([dropCtl(field.key, ["Yes", "No"])], { after: 0 });
    case "choice":
      return field.options ? para([dropCtl(field.key, field.options)], { after: 0 }) : para([textCtl(field.key)], { after: 0 });
    case "number":
      return para([textCtl(field.key, "Click or tap here to enter a dollar amount.")], { after: 0 });
    case "contacts":
      return para([textCtl(field.key, "One per line: Name, email")], { after: 0 });
    case "combo":
      return para([comboCtl(field.key, field.options ?? [])], { after: 0 });
    case "list":
      if (field.options) {
        return field.options
          .map((option) => para([checkCtl(), run(`  ${option}`)], { after: 60 }))
          .join("");
      }
      return para([textCtl(field.key)], { after: 0 });
    default:
      return para([textCtl(field.key)], { after: 0 });
  }
};

const fieldRow = (field: WorksheetField): string =>
  row(
    cell(
      para([run(`${field.label}: `, { b: true }), ...(field.hint ? [run(`(${field.hint})`, { i: true, color: "6B7280", sz: 18 })] : [])], { after: 0 }),
      3700,
      "F4F7FB",
    ),
    cell(controlFor(field), 6524),
  );

// ---------- document parts ----------

const COVER = [
  para("", { after: 600 }),
  para([run("Southern University LIFT Center", { b: true, color: "FFFFFF", sz: 32 })], { shd: "0B2545", before: 200, after: 40 }),
  para([run("MBDA Rural Business Center — powered by the U.S. Department of Commerce, Minority Business Development Agency", { color: "C9A227", sz: 20, b: true })], { shd: "0B2545", after: 240 }),
  para([run("Client Onboarding Worksheet", { b: true, sz: 52, color: "0B2545" })], { style: "Title", before: 240 }),
  para([run("Complete this worksheet in Microsoft Word — dropdowns, checkboxes, and text fields are built in. When you're finished, upload this document from the onboarding checklist and the platform will fill the online form for you — or copy and paste your answers manually.", { sz: 22, color: "3D4752" })], { after: 300 }),
  para([run("How to use this worksheet", { b: true, sz: 26, color: "134074" })], { keepNext: true }),
  para([run("•  Fields are organized into the same steps as the online wizard — one page per step.")], { after: 80 }),
  para([run("•  Click a shaded answer cell to type, choose from a dropdown, or tick checkboxes. The Products and services field lists every federal PSC code — pick codes from its dropdown or type your own.")], { after: 80 }),
  para([run("•  Anything you don't know can be left blank — required fields are marked.")], { after: 80 }),
  para([run("•  For checklists, tick every option that applies (for example, several NAICS codes or certifications).")], { after: 80 }),
  para([run("•  NAICS and PSC reference tables are included at the end of this document.")], { after: 300 }),
  table(
    [
      row(cell(para([run("Prepared by", { b: true })], { after: 0 }), 3700, "F4F7FB"), cell(para([textCtl("preparedBy")], { after: 0 }), 6524)),
      row(cell(para([run("Business name", { b: true })], { after: 0 }), 3700, "F4F7FB"), cell(para([textCtl("preparedBusiness")], { after: 0 }), 6524)),
      row(cell(para([run("Date", { b: true })], { after: 0 }), 3700, "F4F7FB"), cell(para([textCtl("preparedDate")], { after: 0 }), 6524)),
    ],
    [3700, 6524],
  ),
  para([run("The information you provide is used to match you with LIFT program services and, with your consent, may be summarized by an AI assistant for your advisor.", { i: true, color: "6B7280", sz: 18 })], { before: 300 }),
].join("");

const appendixPage = (): string => {
  const rows = NAICS_OPTIONS.map((option) => {
    const [code, ...rest] = option.split(" - ");
    return row(cell(para([run(code.trim(), { b: true, sz: 18 })], { after: 0 }), 1400, "F4F7FB"), cell(para([run(rest.join(" - ").trim(), { sz: 18 })], { after: 0 }), 8824));
  });
  return [
    para([run("Appendix — NAICS code reference", { b: true, color: "FFFFFF", sz: 28 })], { shd: "134074", pageBreak: true, before: 160, after: 200 }),
    para([run("Find the codes that best describe your business, then enter them (comma-separated) in the “NAICS code(s)” field on the “What you sell” page — or simply copy them from here.", { color: "3D4752" })]),
    table(rows, [1400, 8824]),
    para([run(" ", { sz: 8 })], { after: 0 }),
  ].join("");
};

const pscAppendixPage = (): string => {
  const rows = PSC_CODES.map((psc) =>
    row(cell(para([run(psc.code, { b: true, sz: 18 })], { after: 0 }), 1400, "F4F7FB"), cell(para([run(psc.name, { sz: 18 })], { after: 0 }), 8824)),
  );
  return [
    para([run("Appendix — PSC code reference", { b: true, color: "FFFFFF", sz: 28 })], { shd: "134074", pageBreak: true, before: 160, after: 200 }),
    para([run("Product and Service Codes (PSC) are the codes federal agencies use to buy. Find the codes that match what you sell, then pick them from the “Products and services” dropdown or type them (comma-separated) — e.g. R425, D302.", { color: "3D4752" })]),
    table(rows, [1400, 8824]),
    para([run(" ", { sz: 8 })], { after: 0 }),
  ].join("");
};

const sectionPage = (index: number, title: string, fields: WorksheetField[]): string =>
  [
    para([run(`Step ${index + 1} — ${title}`, { b: true, color: "FFFFFF", sz: 28 })], {
      shd: index % 2 === 0 ? "0B2545" : "134074",
      pageBreak: true,
      before: 160,
      after: 200,
      borderBottom: "C9A227",
    }),
    table(fields.map(fieldRow), [3700, 6524]),
  ].join("");

const buildDocumentXml = (): string => {
  const body = [
    COVER,
    ...WORKSHEET_SECTIONS.map((section, i) => sectionPage(i, section.title, section.fields)),
    para([run("END OF WORKSHEET", { b: true, color: "9AA5B1", sz: 16 })], { before: 300 }),
    appendixPage(),
    pscAppendixPage(),
  ].join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="w14">
<w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1008" w:right="1008" w:bottom="1008" w:left="1008"/></w:sectPr></w:body>
</w:document>`;
};

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI"/><w:sz w:val="20"/><w:color w:val="1F2933"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120"/></w:pPr></w:pPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="52"/><w:color w:val="0B2545"/></w:rPr></w:style>
</w:styles>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

const DOC_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

/** Builds the enhanced worksheet .docx and returns it as a Buffer. */
export async function buildWorksheetDocx(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES_XML);
  zip.folder("_rels")!.file(".rels", ROOT_RELS_XML);
  zip.folder("word")!.file("document.xml", buildDocumentXml());
  zip.folder("word")!.file("styles.xml", STYLES_XML);
  zip.folder("word")!.folder("_rels")!.file("document.xml.rels", DOC_RELS_XML);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
