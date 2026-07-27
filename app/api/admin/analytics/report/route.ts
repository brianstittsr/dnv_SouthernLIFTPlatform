import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import {
  fetchVercelAnalytics,
  sendAnalyticsReport,
} from "@/lib/analytics-report";
import type { VercelAnalyticsData } from "@/lib/analytics-report";
import type { Timestamp } from "firebase-admin/firestore";

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
