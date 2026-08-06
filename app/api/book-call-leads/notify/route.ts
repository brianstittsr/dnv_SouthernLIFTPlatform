import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const NOTIFY_RECIPIENTS = ["kmoore@kdm-assoc.com", "mhundal@mbdafpcenter.com"];

interface BookCallLeadNotification {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  industry?: string;
  source?: string;
}

/**
 * POST /api/book-call-leads/notify
 * Sends a "New Book a Call Lead" notification email to the KDM team
 * whenever a lead is captured via the contact page or site-wide popup.
 */
export async function POST(request: NextRequest) {
  try {
    const body: BookCallLeadNotification = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: "Missing lead email" }, { status: 400 });
    }

    const fullName = `${body.firstName || ""} ${body.lastName || ""}`.trim() || "Unknown";

    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #c9a227 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 22px;">New Book a Call Lead</h1>
        </div>
        <div style="padding: 24px; background: #f9f9f9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.company || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Job Title</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.jobTitle || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Date</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.preferredDate || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Time</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.preferredTime || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Industry</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.industry || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.message || "No message provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Source</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${body.source || "Unknown"}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Please follow up with this lead as soon as possible.</p>
        </div>
      </div>
    `;

    const text = `New Book a Call Lead\n\nName: ${fullName}\nEmail: ${body.email}\nPhone: ${body.phone || "Not provided"}\nCompany: ${body.company || "Not provided"}\nJob Title: ${body.jobTitle || "Not provided"}\nPreferred Date: ${body.preferredDate || "Not specified"}\nPreferred Time: ${body.preferredTime || "Not specified"}\nIndustry: ${body.industry || "Not provided"}\nMessage: ${body.message || "No message provided"}\nSource: ${body.source || "Unknown"}`;

    const result = await sendEmail({
      to: NOTIFY_RECIPIENTS,
      subject: `New Book a Call Lead: ${fullName}`,
      html,
      text,
    });

    if (!result.success) {
      console.error("Failed to send book-call-lead notification:", result.error);
      return NextResponse.json({ error: result.error || "Failed to send notification" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending book-call-lead notification:", error);
    const message = error instanceof Error ? error.message : "Failed to send notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
