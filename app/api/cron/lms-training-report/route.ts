import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS, type LiftReportDoc } from "@/lib/schema";
import {
  getRequester,
  requireDb,
  serializeFirestore,
  stripUndefined,
  writeAudit,
} from "@/lib/form-builder/server/context";
import { collectPlatformDataPack } from "@/lib/reports/data-collector";
import { generateNarrative, headlineMetrics, reportTitle, resolvePeriod } from "@/lib/reports/generate";
import { buildReportHtml } from "@/lib/reports/report-html";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { sendEmail } from "@/lib/email";
import type { SerializedLiftReport } from "@/lib/reports/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const STAFF_ROLES = new Set(["admin", "platform_admin", "staff"]);

function isCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Staff/admin emails to receive the automated training report. */
async function staffRecipients(): Promise<string[]> {
  const configured = process.env.TRAINING_REPORT_RECIPIENTS;
  if (configured) {
    return configured.split(",").map((email) => email.trim()).filter(Boolean);
  }
  const db = requireDb();
  const snapshot = await db.collection(COLLECTIONS.USERS).get();
  const emails = new Set<string>();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const roles = [data.role, data.svpRole, ...(Array.isArray(data.svpRoles) ? data.svpRoles : [])];
    const email = typeof data.email === "string" ? data.email : null;
    if (email && roles.some((role) => typeof role === "string" && STAFF_ROLES.has(role))) {
      emails.add(email);
    }
  }
  return [...emails];
}

async function runReport(request: NextRequest): Promise<NextResponse> {
  if (!isCron(request)) {
    const requester = await getRequester();
    if (!requester || (!requester.isStaff && !requester.isAdmin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: requester ? 403 : 401 });
    }
  }

  const period = resolvePeriod({ type: "lms_training" });
  const pack = await collectPlatformDataPack(period);
  const generated = await generateNarrative({ type: "lms_training", period, pack });

  const stored = stripUndefined<Omit<LiftReportDoc, "id" | "createdAt"> & { createdAt: Timestamp }>({
    type: "lms_training",
    title: reportTitle("lms_training", period),
    periodStart: period.start?.toISOString().slice(0, 10),
    periodEnd: period.end?.toISOString().slice(0, 10),
    periodLabel: period.label,
    metrics: headlineMetrics("lms_training", pack),
    narrative: generated.narrative,
    dataPack: pack,
    source: generated.source,
    model: generated.model,
    tokensUsed: generated.tokensUsed,
    createdByUid: "system",
    createdByName: "Scheduled LMS training report",
    createdAt: Timestamp.now(),
  });
  const db = requireDb();
  const ref = await db.collection(COLLECTIONS.LIFT_REPORTS).add(stored);
  const serialized = serializeFirestore({ ...stored, id: ref.id }) as unknown as SerializedLiftReport;

  // Email the PDF to staff — this is the "no human intervention" delivery.
  const recipients = await staffRecipients();
  const result: Record<string, unknown> = { reportId: ref.id, title: stored.title, recipients: 0 };
  if (recipients.length > 0) {
    const pdf = await renderHtmlToPdf(buildReportHtml(serialized));
    const lms = (pack.lms ?? {}) as Record<string, unknown>;
    const summaryLines = [
      `Courses: ${lms.coursesTotal ?? 0} (${lms.coursesPublished ?? 0} published)`,
      `Enrollments: ${lms.enrollmentsTotal ?? 0} (${lms.enrollmentsInPeriod ?? 0} this period)`,
      `Completions: ${lms.completionsTotal ?? 0} (${lms.completionRate ?? 0}% rate)`,
      `Attendance minutes in period: ${lms.zoomMinutesInPeriod ?? 0}`,
      `Certificates issued in period: ${lms.certificatesInPeriod ?? 0}`,
      "",
      generated.narrative.executiveSummary,
    ].join("<br/>");
    const emailResult = await sendEmail({
      to: recipients,
      subject: `${stored.title} — automated LMS training report`,
      html: `<p>Automated weekly LMS training report for ${period.label}.</p><p>${summaryLines}</p><p>The full PDF is attached; the report is also saved under LIFT Reports.</p>`,
      attachments: [{ filename: `lms-training-report-${period.label.replace(/\s+/g, "_")}.pdf`, content: pdf, contentType: "application/pdf" }],
    });
    await ref.update({
      emailedTo: FieldValue.arrayUnion({ to: recipients, sentAt: new Date().toISOString(), via: "cron" }),
    });
    result.recipients = recipients.length;
    result.emailSuccess = emailResult.success;
  }

  await writeAudit("report.generated", ref.id, null, {
    type: "lms_training",
    period: period.label,
    source: generated.source,
    tokensUsed: generated.tokensUsed,
    via: "cron",
  });
  return NextResponse.json({ success: true, ...result });
}

export async function GET(request: NextRequest) {
  try {
    return await runReport(request);
  } catch (error) {
    console.error("[cron] lms-training-report error:", error);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
