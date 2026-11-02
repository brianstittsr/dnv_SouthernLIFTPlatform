import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, type LiftReportDoc } from "@/lib/schema";
import { jsonError, requireDb, serializeFirestore, writeAudit } from "@/lib/form-builder/server/context";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { buildReportHtml } from "@/lib/reports/report-html";
import type { SerializedLiftReport } from "@/lib/reports/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** GET /api/lift/reports/[id]/pdf - branded PDF of a saved report (admin only). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_REPORTS).doc(id).get();
    if (!snapshot.exists) return jsonError("Report not found", 404);
    const report = serializeFirestore({ ...(snapshot.data() as LiftReportDoc), id: snapshot.id }) as unknown as SerializedLiftReport;
    const pdf = await renderHtmlToPdf(buildReportHtml(report));
    await writeAudit("report.pdf_exported", id, requester);
    const filename = report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "lift-report";
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, "LIFT report PDF failed");
  }
}
