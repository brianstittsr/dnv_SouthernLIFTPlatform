import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/auth/server-auth";

interface ReportLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  preferredDate?: string;
  preferredTime?: string;
  timezone?: string;
  message?: string;
  source?: string;
  status?: string;
  assignedToName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SendReportRequest {
  to: string;
  toName: string;
  leads: ReportLead[];
  filterStatus?: string;
}

function escapeHtml(text: string | undefined | null): string {
  if (text === undefined || text === null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body: SendReportRequest = await request.json();
    const { to, toName, leads, filterStatus } = body;

    if (!to || !leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "Missing recipient or leads" }, { status: 400 });
    }

    const statusLabel = filterStatus && filterStatus !== "all" ? ` (${filterStatus})` : "";
    const generatedAt = new Date().toLocaleString("en-US");

    const rows = leads.map((lead) => {
      const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "-";
      const message = lead.message ? escapeHtml(lead.message).replace(/\n/g, "<br>") : "-";
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(name)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.email)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.phone) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.company) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.jobTitle) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.preferredDate) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.preferredTime) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.timezone) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.status) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.assignedToName) || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(lead.createdAt)}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #c9a227 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">Book a Call Leads Report</h1>
          <p style="margin: 8px 0 0; font-size: 14px;">Generated: ${generatedAt} | Filter: ${escapeHtml(filterStatus || "all")}</p>
        </div>
        <div style="padding: 24px; background: #f9f9f9;">
          <p style="margin-top: 0;">Hi ${escapeHtml(toName) || "there"},</p>
          <p>Please follow up with the ${leads.length} book-a-call lead${leads.length === 1 ? "" : "s"} below.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: white; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #1e3a5f; color: white; text-align: left;">
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Name</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Email</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Phone</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Company</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Job Title</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Preferred Date</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Preferred Time</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Timezone</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Message</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Status</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Assigned To</th>
                <th style="padding: 8px; border: 1px solid #1e3a5f;">Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This report was generated from the KDM & Associates SVP admin portal.</p>
        </div>
      </div>
    `;

    const textLeads = leads.map((lead) => {
      const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "-";
      return [
        `Name: ${name}`,
        `Email: ${lead.email || "-"}`,
        `Phone: ${lead.phone || "-"}`,
        `Company: ${lead.company || "-"}`,
        `Job Title: ${lead.jobTitle || "-"}`,
        `Preferred: ${lead.preferredDate || "-"} ${lead.preferredTime || ""} ${lead.timezone || ""}`,
        `Message: ${lead.message || "-"}`,
        `Status: ${lead.status || "-"}`,
        `Submitted: ${formatDate(lead.createdAt)}`,
      ].join("\n");
    }).join("\n\n---\n\n");

    const text = `Book a Call Leads Report\nGenerated: ${generatedAt}\nFilter: ${filterStatus || "all"}\n\nHi ${toName || "there"},\n\nPlease follow up with the ${leads.length} lead${leads.length === 1 ? "" : "s"} below.\n\n${textLeads}\n\nThis report was generated from the KDM & Associates SVP admin portal.`;

    const result = await sendEmail({
      to,
      subject: `Book a Call Leads Report${statusLabel} — ${leads.length} lead${leads.length === 1 ? "" : "s"}`,
      html,
      text,
      replyTo: "no-reply@kdm-assoc.com",
    });

    if (!result.success) {
      console.error("Failed to send book-call-leads report:", result.error);
      return NextResponse.json({ error: result.error || "Failed to send report" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending book-call-leads report:", error);
    const message = error instanceof Error ? error.message : "Failed to send report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
