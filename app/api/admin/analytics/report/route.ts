import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { auth } from "@/lib/firebase-admin";

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
  }>>;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number }> {
  const cronSecret = process.env.CRON_SECRET;
  const providedCronSecret = request.headers.get("x-vercel-cron-secret") || request.nextUrl.searchParams.get("cronSecret");
  const isCronRequest = !!cronSecret && providedCronSecret === cronSecret;

  if (isCronRequest) {
    return { success: true };
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

  return { success: true };
}

async function generateAndSendReport(
  to: string,
  days: number,
  projectId: string
): Promise<{ success: true; messageId?: string; report: VercelAnalyticsData }> {
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
    environment: "production",
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

  const data = await response.json() as VercelAnalyticsAPIResponse;

  const totalVisitors = data.metrics?.find((m) => m.key === "visitors")?.value ?? 0;
  const totalPageviews = data.metrics?.find((m) => m.key === "pageviews")?.value ?? 0;
  const bounceRate = data.metrics?.find((m) => m.key === "bounce_rate")?.value ?? null;
  const avgSessionDuration = data.metrics?.find((m) => m.key === "duration")?.value ?? null;

  const report: VercelAnalyticsData = {
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

  const emailHtml = buildEmailHtml(report, projectId);
  const emailText = buildEmailText(report, projectId);

  const emailResult = await sendEmail({
    to,
    subject: `KDM Website Analytics Report — ${fromDateStr} to ${toDateStr}`,
    html: emailHtml,
    text: emailText,
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error || "Failed to send email");
  }

  return { success: true, messageId: emailResult.messageId, report };
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const body = await request.json();
    const { to = "brianstittsr@gmail.com", days = 7, projectId = process.env.VERCEL_PROJECT_ID } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Vercel project ID not configured" }, { status: 503 });
    }

    const result = await generateAndSendReport(to, days, projectId);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
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
    const to = searchParams.get("to") || "brianstittsr@gmail.com";
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (!projectId) {
      return NextResponse.json({ error: "Vercel project ID not configured" }, { status: 503 });
    }

    const result = await generateAndSendReport(to, days, projectId);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
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

function buildEmailHtml(report: VercelAnalyticsData, projectId: string): string {
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
        Generated by KDM Platform Analytics · Report covers the last 7 days of production traffic.
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
