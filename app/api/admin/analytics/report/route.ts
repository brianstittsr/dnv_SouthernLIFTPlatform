import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { auth, db } from "@/lib/firebase-admin";
import { generatePdfFromHtml } from "@/lib/pdf-utils";
import { COLLECTIONS } from "@/lib/schema";
import type { Timestamp } from "firebase-admin/firestore";

interface VercelAnalyticsData {
  totalVisitors: number;
  totalPageviews: number;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  topPages: { path: string; views: number; visitors: number }[];
  topSources: { source: string; visitors: number }[];
  dailyVisitors: { date: string; visitors: number; pageviews: number }[];
  from: string;
  to: string;
}

interface VercelAnalyticsAPIResponse {
  metrics: Array<{
    key: string;
    label: string;
    value: number;
    format?: string;
  }>;
  topPages?: Array<{
    path: string;
    value: number;
    visitors: number;
  }>;
  topSources?: Array<{
    source: string;
    value: number;
  }>;
}

interface ScheduledReportDoc {
  id: string;
  name: string;
  enabled: boolean;
  projectId: string;
  environment: string;
  days: number;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  includePdf: boolean;
  subject?: string;
  lastRunAt?: Timestamp | null;
  nextRunAt?: Timestamp | null;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number; isCron?: boolean }> {
  const cronSecret = process.env.CRON_SECRET;
  const providedCronSecret = request.headers.get("x-vercel-cron-secret") || request.nextUrl.searchParams.get("cronSecret");
  const isCronRequest = !!cronSecret && providedCronSecret === cronSecret;

  if (isCronRequest) {
    return { success: true, isCron: true };
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  const idToken = authorization.split("Bearer ")[1];
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { success: false, error: "Invalid token", status: 401 };
  }

  if (!decoded.admin && !decoded.email?.endsWith("@kdm-assoc.com")) {
    return { success: false, error: "Forbidden", status: 403 };
  }

  return { success: true, isCron: false };
}

async function fetchVercelAnalytics(
  projectId: string,
  days: number,
  environment: string,
): Promise<VercelAnalyticsData> {
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token || !projectId) {
    throw new Error("Vercel analytics not configured");
  }

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);
  const fromDateStr = formatDate(fromDate);
  const toDateStr = formatDate(toDate);

  const params = new URLSearchParams({
    from: fromDateStr,
    to: toDateStr,
    environment,
    projectId,
  });

  const response = await fetch(`https://api.vercel.com/v6/analytics?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vercel Analytics API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as VercelAnalyticsAPIResponse;

  const totalVisitors = data.metrics?.find((m) => m.key === "visitors")?.value ?? 0;
  const totalPageviews = data.metrics?.find((m) => m.key === "pageviews")?.value ?? 0;
  const bounceRate = data.metrics?.find((m) => m.key === "bounce_rate")?.value ?? null;
  const avgSessionDuration = data.metrics?.find((m) => m.key === "duration")?.value ?? null;

  return {
    totalVisitors,
    totalPageviews,
    bounceRate,
    avgSessionDuration,
    topPages: (data.topPages || []).slice(0, 10).map((p) => ({
      path: p.path,
      views: p.value,
      visitors: p.visitors || 0,
    })),
    topSources: (data.topSources || []).slice(0, 10).map((s) => ({
      source: s.source || "direct",
      visitors: s.value,
    })),
    dailyVisitors: [],
    from: fromDateStr,
    to: toDateStr,
  };
}

async function saveSnapshot(
  projectId: string,
  environment: string,
  report: VercelAnalyticsData,
  fetchedBy?: string,
): Promise<string> {
  if (!db) {
    throw new Error("Firebase Admin not initialized");
  }

  const docRef = await db.collection(COLLECTIONS.ANALYTICS_SNAPSHOTS).add({
    projectId,
    environment,
    from: report.from,
    to: report.to,
    totalVisitors: report.totalVisitors,
    totalPageviews: report.totalPageviews,
    bounceRate: report.bounceRate,
    avgSessionDuration: report.avgSessionDuration,
    topPages: report.topPages,
    topSources: report.topSources,
    dailyVisitors: report.dailyVisitors,
    rawMetrics: {},
    fetchedBy: fetchedBy || "system",
    createdAt: new Date(),
  });

  return docRef.id;
}

function buildReportHtml(report: VercelAnalyticsData, projectId: string): string {
  const topPagesRows = report.topPages
    .map(
      (p) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${p.path}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${p.visitors.toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${p.views.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const topSourcesRows = report.topSources
    .map(
      (s) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.source}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${s.visitors.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #333;">
      <h1 style="color: #111;">KDM Website Analytics Report</h1>
      <p style="color: #666;">${report.from} → ${report.to} · Project: <code>${projectId}</code></p>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${report.totalVisitors.toLocaleString()}</div>
          <div style="font-size: 14px; color: #666; margin-top: 4px;">Total Visitors</div>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #0066cc;">${report.totalPageviews.toLocaleString()}</div>
          <div style="font-size: 14px; color: #666; margin-top: 4px;">Total Pageviews</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0;">
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #111;">${report.bounceRate !== null ? `${(report.bounceRate * 100).toFixed(1)}%` : "N/A"}</div>
          <div style="font-size: 13px; color: #666; margin-top: 4px;">Bounce Rate</div>
        </div>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #111;">${report.avgSessionDuration !== null ? formatDuration(report.avgSessionDuration) : "N/A"}</div>
          <div style="font-size: 13px; color: #666; margin-top: 4px;">Avg. Session Duration</div>
        </div>
      </div>

      <h2 style="margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Top Pages</h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Path</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Visitors</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Views</th>
          </tr>
        </thead>
        <tbody>${topPagesRows || '<tr><td colspan="3" style="padding: 8px; border: 1px solid #ddd;">No top pages data available</td></tr>'}</tbody>
      </table>

      <h2 style="margin-top: 32px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Top Sources</h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Source</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Visitors</th>
          </tr>
        </thead>
        <tbody>${topSourcesRows || '<tr><td colspan="2" style="padding: 8px; border: 1px solid #ddd;">No source data available</td></tr>'}</tbody>
      </table>

      <p style="margin-top: 32px; font-size: 12px; color: #999;">
        Generated by KDM Platform Analytics.
      </p>
    </div>
  `;
}

function buildEmailText(report: VercelAnalyticsData, projectId: string): string {
  const topPages = report.topPages
    .map((p) => `  - ${p.path}: ${p.visitors.toLocaleString()} visitors, ${p.views.toLocaleString()} views`)
    .join("\n");

  const topSources = report.topSources
    .map((s) => `  - ${s.source}: ${s.visitors.toLocaleString()} visitors`)
    .join("\n");

  return `KDM Website Analytics Report
${report.from} → ${report.to}
Project: ${projectId}

Summary
- Total Visitors: ${report.totalVisitors.toLocaleString()}
- Total Pageviews: ${report.totalPageviews.toLocaleString()}
- Bounce Rate: ${report.bounceRate !== null ? `${(report.bounceRate * 100).toFixed(1)}%` : "N/A"}
- Avg. Session Duration: ${report.avgSessionDuration !== null ? formatDuration(report.avgSessionDuration) : "N/A"}

Top Pages
${topPages || "  No top pages data available"}

Top Sources
${topSources || "  No source data available"}

Generated by KDM Platform Analytics
`;
}

async function sendAnalyticsReport(
  recipients: string[],
  report: VercelAnalyticsData,
  projectId: string,
  includePdf: boolean,
  customSubject?: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const emailHtml = buildReportHtml(report, projectId);
  const emailText = buildEmailText(report, projectId);

  const attachments = [];
  if (includePdf) {
    try {
      const pdfBuffer = await generatePdfFromHtml({ html: emailHtml });
      attachments.push({
        filename: `kdm-analytics-report-${report.from}-to-${report.to}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
    }
  }

  const emailResult = await sendEmail({
    to: recipients,
    subject: customSubject || `KDM Website Analytics Report — ${report.from} to ${report.to}`,
    html: emailHtml,
    text: emailText,
    attachments,
  });

  return emailResult;
}

async function generateAndSendReport(
  recipients: string[],
  days: number,
  projectId: string,
  environment: string,
  options: {
    includePdf?: boolean;
    subject?: string;
    saveSnapshot?: boolean;
    fetchedBy?: string;
  } = {}
): Promise<{ success: true; messageId?: string; report: VercelAnalyticsData; snapshotId?: string }> {
  const report = await fetchVercelAnalytics(projectId, days, environment);

  let snapshotId: string | undefined;
  if (options.saveSnapshot) {
    snapshotId = await saveSnapshot(projectId, environment, report, options.fetchedBy);
  }

  const emailResult = await sendAnalyticsReport(
    recipients,
    report,
    projectId,
    options.includePdf ?? false,
    options.subject
  );

  if (!emailResult.success) {
    throw new Error(emailResult.error || "Failed to send email");
  }

  return { success: true, messageId: emailResult.messageId, report, snapshotId };
}

function computeNextRunAt(frequency: string, dayOfWeek?: number, dayOfMonth?: number): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 0, 0, 0);

  if (frequency === "daily") {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (frequency === "weekly") {
    const targetDay = typeof dayOfWeek === "number" ? dayOfWeek % 7 : 1; // default Monday
    const daysUntilTarget = (targetDay + 7 - now.getDay()) % 7 || 7;
    next.setDate(now.getDate() + daysUntilTarget);
    return next;
  }

  if (frequency === "monthly") {
    const targetDay = typeof dayOfMonth === "number" ? Math.min(Math.max(dayOfMonth, 1), 31) : 1;
    next.setDate(targetDay);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  return next;
}

async function runScheduledReports(): Promise<{ ran: number; errors: string[] }> {
  if (!db) {
    throw new Error("Firebase Admin not initialized");
  }

  const now = new Date();
  const snapshot = await db
    .collection(COLLECTIONS.ANALYTICS_SCHEDULED_REPORTS)
    .where("enabled", "==", true)
    .get();

  const errors: string[] = [];
  let ran = 0;

  for (const doc of snapshot.docs) {
    const schedule = { id: doc.id, ...doc.data() } as ScheduledReportDoc;
    const nextRun = schedule.nextRunAt ? (schedule.nextRunAt as Timestamp).toDate() : null;

    if (nextRun && nextRun > now) {
      continue;
    }

    try {
      await generateAndSendReport(
        schedule.recipients,
        schedule.days,
        schedule.projectId,
        schedule.environment || "production",
        {
          includePdf: schedule.includePdf,
          subject: schedule.subject,
          saveSnapshot: true,
          fetchedBy: `scheduled:${schedule.id}`,
        }
      );

      const nextRunAt = computeNextRunAt(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth);
      await doc.ref.update({
        lastRunAt: new Date(),
        nextRunAt,
      });
      ran++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Schedule ${schedule.id}: ${message}`);
    }
  }

  return { ran, errors };
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const body = await request.json();
    const {
      to = "brianstittsr@gmail.com",
      days = 7,
      projectId = process.env.VERCEL_PROJECT_ID,
      environment = "production",
      includePdf = false,
      saveSnapshot = true,
      subject,
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Vercel project ID not configured" }, { status: 503 });
    }

    const recipients = Array.isArray(to) ? to : [to];

    const result = await generateAndSendReport(recipients, days, projectId, environment, {
      includePdf,
      subject,
      saveSnapshot,
      fetchedBy: authResult.isCron ? "cron" : "manual",
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      snapshotId: result.snapshotId,
      report: result.report,
    });
  } catch (error) {
    console.error("Analytics report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || process.env.VERCEL_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json({ error: "Vercel project ID not configured" }, { status: 503 });
    }

    if (authResult.isCron) {
      const result = await runScheduledReports();
      return NextResponse.json({ success: true, ...result });
    }

    const to = searchParams.get("to") || "brianstittsr@gmail.com";
    const days = parseInt(searchParams.get("days") || "7", 10);
    const environment = searchParams.get("environment") || "production";
    const includePdf = searchParams.get("includePdf") === "true";
    const saveSnapshot = searchParams.get("saveSnapshot") !== "false";

    const recipients = to.split(",").map((email) => email.trim()).filter(Boolean);

    const result = await generateAndSendReport(recipients, days, projectId, environment, {
      includePdf,
      saveSnapshot,
      fetchedBy: "manual",
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      snapshotId: result.snapshotId,
      report: result.report,
    });
  } catch (error) {
    console.error("Analytics report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
