import { sendEmail } from "@/lib/email";
import { generatePdfFromHtml } from "@/lib/pdf-utils";

export interface VercelAnalyticsData {
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

interface VercelAggregateRow {
  route?: string;
  requestPath?: string;
  referrerHostname?: string;
  source?: string;
  timestamp?: string;
  pageviews?: number;
  visitors?: number;
  count?: number;
}

interface VercelAggregateResponse {
  data: VercelAggregateRow[];
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function toISO(date: Date): string {
  return date.toISOString();
}

function getVercelToken(): string {
  const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) {
    throw new Error("Vercel API token not configured. Set VERCEL_TOKEN or VERCEL_ANALYTICS_TOKEN.");
  }
  return token;
}

function getProjectId(projectId?: string): string {
  return projectId || process.env.VERCEL_PROJECT_ID || process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID || "";
}

async function fetchAggregate(
  projectId: string,
  since: string,
  until: string,
  environment: string,
  by: string[],
  limit?: number
): Promise<VercelAggregateResponse> {
  const params = new URLSearchParams();
  params.set("projectId", projectId);
  params.set("since", since);
  params.set("until", until);
  by.forEach((dimension) => params.append("by", dimension));
  if (limit) params.set("limit", String(limit));
  if (environment) {
    params.set("filter", `environment eq '${environment}'`);
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  if (teamId) params.set("teamId", teamId);

  const url = `https://api.vercel.com/v1/query/web-analytics/visits/aggregate?${params.toString()}`;
  const token = getVercelToken();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vercel Web Analytics API error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as VercelAggregateResponse;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export async function fetchVercelAnalytics(
  projectId: string,
  days: number,
  environment: string
): Promise<VercelAnalyticsData> {
  const effectiveProjectId = getProjectId(projectId);
  if (!effectiveProjectId) {
    throw new Error("Vercel project ID not configured. Set VERCEL_PROJECT_ID or NEXT_PUBLIC_VERCEL_PROJECT_ID.");
  }

  const until = new Date();
  const since = new Date();
  since.setDate(until.getDate() - days);
  const sinceStr = toISO(since);
  const untilStr = toISO(until);
  const fromDateStr = formatDate(since);
  const toDateStr = formatDate(until);

  const [daily, byRoute, byReferrer] = await Promise.all([
    fetchAggregate(effectiveProjectId, sinceStr, untilStr, environment, ["day"]),
    fetchAggregate(effectiveProjectId, sinceStr, untilStr, environment, ["route"], 10),
    fetchAggregate(effectiveProjectId, sinceStr, untilStr, environment, ["referrerHostname"], 10),
  ]);

  const dailyVisitors: { date: string; visitors: number; pageviews: number }[] = (daily.data || [])
    .map((row) => {
      const date = row.timestamp ? row.timestamp.split("T")[0] : fromDateStr;
      const pageviews = row.pageviews ?? row.count ?? 0;
      const visitors = row.visitors ?? 0;
      return { date, visitors, pageviews };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalVisitors = dailyVisitors.reduce((sum, d) => sum + d.visitors, 0);
  const totalPageviews = dailyVisitors.reduce((sum, d) => sum + d.pageviews, 0);

  const topPages = (byRoute.data || []).map((row) => {
    const path = row.route || row.requestPath || "/";
    const pageviews = row.pageviews ?? row.count ?? 0;
    const visitors = row.visitors ?? 0;
    return { path, views: pageviews, visitors };
  });

  const topSources = (byReferrer.data || []).map((row) => {
    const source = row.referrerHostname || row.source || "direct";
    const visitors = row.visitors ?? row.count ?? 0;
    return { source, visitors };
  });

  return {
    totalVisitors,
    totalPageviews,
    bounceRate: null,
    avgSessionDuration: null,
    topPages,
    topSources,
    dailyVisitors,
    from: fromDateStr,
    to: toDateStr,
  };
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

export async function sendAnalyticsReport(
  recipients: string[],
  report: VercelAnalyticsData,
  projectId: string,
  includePdf: boolean,
  customSubject?: string
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

  return sendEmail({
    to: recipients,
    subject: customSubject || `KDM Website Analytics Report — ${report.from} to ${report.to}`,
    html: emailHtml,
    text: emailText,
    attachments,
  });
}

export async function generateAndSendReport(
  recipients: string[],
  days: number,
  projectId: string,
  environment: string,
  options: {
    includePdf?: boolean;
    subject?: string;
  } = {}
): Promise<{ success: true; messageId?: string; report: VercelAnalyticsData }> {
  const report = await fetchVercelAnalytics(projectId, days, environment);

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

  return { success: true, messageId: emailResult.messageId, report };
}
