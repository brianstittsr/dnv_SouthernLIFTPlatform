import { NextRequest, NextResponse } from "next/server";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { LOAN_PACKAGE_DOCUMENTS } from "@/lib/form-builder/lift-templates";
import { archiveGeneratedDocument } from "@/lib/documents/archive";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

interface ChecklistDef {
  title: string;
  subtitle: string;
  intro: string;
  items: string[];
  notes: string[];
}

const CHECKLISTS: Record<string, ChecklistDef> = {
  "capital-readiness": {
    title: "Capital Readiness Checklist",
    subtitle: "Loan Officer Meeting — Document Checklist",
    intro:
      "Bring the documents below to your loan officer meeting. Check off each item as you gather it, and note anything that does not apply to your business so your advisor can help you prepare.",
    items: LOAN_PACKAGE_DOCUMENTS,
    notes: [
      "Organize documents in the order listed — lenders move faster when the package is complete.",
      "If an item does not apply to your business, mark it N/A and bring a one-line explanation.",
      "Your LIFT advisor can review the package with you before the meeting.",
    ],
  },
};

function buildChecklistHtml(definition: ChecklistDef): string {
  const items = definition.items
    .map((item) => `<li><span class="box"></span><span>${escapeHtml(item)}</span></li>`)
    .join("");
  const notes = definition.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    @page { size: Letter; margin: 0.7in; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; color: #1f2933; }
    header { border-bottom: 3px solid #c9a227; padding-bottom: 10px; margin-bottom: 16px; }
    header h1 { margin: 0; color: #0b2545; font-size: 18pt; }
    header .sub { color: #134074; font-size: 11pt; font-weight: 600; margin-top: 2px; }
    .intro { color: #3d4752; margin-bottom: 14px; }
    ul.checklist { list-style: none; padding: 0; margin: 0; }
    ul.checklist li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #e6ebf2; }
    .box { display: inline-block; width: 14px; height: 14px; border: 1.5px solid #134074; border-radius: 3px; flex: none; }
    h2 { color: #134074; font-size: 12pt; margin: 20px 0 6px; }
    ul.notes { margin: 0; padding-left: 18px; color: #3d4752; }
    ul.notes li { padding: 3px 0; }
    .meta { margin-top: 22px; border-top: 1px solid #d6dde6; padding-top: 8px; font-size: 9pt; color: #5f6b7a; }
    .meta td { padding: 3px 12px 3px 0; }
    footer { margin-top: 14px; font-size: 8.5pt; color: #8a96a3; }
  </style></head><body>
    <header>
      <h1>Southern University LIFT Center</h1>
      <div class="sub">${escapeHtml(definition.title)} &middot; ${escapeHtml(definition.subtitle)}</div>
    </header>
    <p class="intro">${escapeHtml(definition.intro)}</p>
    <ul class="checklist">${items}</ul>
    <h2>Meeting tips</h2>
    <ul class="notes">${notes}</ul>
    <table class="meta"><tr>
      <td>Borrower: ______________________________</td>
      <td>Business: ______________________________</td>
      <td>Meeting date: ______________</td>
    </tr></table>
    <footer>The LIFT Center helps you prepare for third-party financing. Center and award funds are never used for loans, grants, or equity to businesses.</footer>
  </body></html>`;
}

/** GET /api/lift/checklists/[slug] — downloads a branded checklist PDF (any signed-in user). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const { slug } = await params;
    const definition = CHECKLISTS[slug];
    if (!definition) return jsonError("Checklist not found", 404);

    const pdf = await renderHtmlToPdf(buildChecklistHtml(definition));

    // File a copy in portal Documents (visible to all members; deduped by source).
    try {
      await archiveGeneratedDocument({
        buffer: pdf,
        fileName: `${slug}-checklist.pdf`,
        contentType: "application/pdf",
        category: "checklists",
        folder: "LIFT Resources",
        tags: ["LIFT", definition.title],
        allowedRoles: ["all"],
        uploadedBy: "LIFT Center",
        source: { type: "checklist", id: slug, label: definition.title },
      });
    } catch (archiveError) {
      console.error("Checklist archive failed:", archiveError);
    }

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-checklist.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, "Download LIFT checklist failed");
  }
}
