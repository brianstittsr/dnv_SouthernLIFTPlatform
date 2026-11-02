import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type LiftReportDoc } from "@/lib/schema";
import { jsonError, requireDb, serializeFirestore, writeAudit } from "@/lib/form-builder/server/context";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";
import { buildReportHtml } from "@/lib/reports/report-html";
import type { SerializedLiftReport } from "@/lib/reports/types";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const emailSchema = z.object({
  to: z.array(z.string().trim().email()).min(1).max(10),
});

const escapeHtml = (value: string): string => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** POST /api/lift/reports/[id]/email - email the report PDF to entered recipients (admin only). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const body = emailSchema.safeParse(await request.json());
    if (!body.success) return jsonError("Enter at least one valid recipient email", 400);
    const { id } = await params;
    const ref = requireDb().collection(COLLECTIONS.LIFT_REPORTS).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return jsonError("Report not found", 404);
    const report = serializeFirestore({ ...(snapshot.data() as LiftReportDoc), id: snapshot.id }) as unknown as SerializedLiftReport;

    const pdf = await renderHtmlToPdf(buildReportHtml(report));
    const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "lift-report"}.pdf`;
    const result = await sendEmail({
      to: body.data.to,
      subject: `LIFT Report: ${report.title}`,
      html: [
        `<h2>${escapeHtml(report.title)}</h2>`,
        `<p>${escapeHtml(report.narrative.executiveSummary.slice(0, 1200))}</p>`,
        `<p>The full report is attached as a PDF. It was generated on the Southern University LIFT platform by ${escapeHtml(report.createdByName)}${report.periodLabel ? ` for period ${escapeHtml(report.periodLabel)}` : ""}.</p>`,
        `<p style="color:#5f6b7a;font-size:12px">Confidential — for program staff and MBDA reporting use. Unverified claims are excluded from MBDA measures.</p>`,
      ].join(""),
      attachments: [{ filename, content: pdf, contentType: "application/pdf" }],
    });
    if (!result.success) return jsonError(result.error ?? "Email could not be sent", 502);

    const entry = { to: body.data.to, sentAt: Timestamp.now(), ...(result.messageId ? { messageId: result.messageId } : {}) };
    await ref.update({ emailedTo: FieldValue.arrayUnion(entry) });
    await writeAudit("report.emailed", id, requester, { recipients: body.data.to.length });
    return NextResponse.json({ data: { sent: true, messageId: result.messageId } });
  } catch (error) {
    return handleRouteError(error, "Email LIFT report failed");
  }
}
