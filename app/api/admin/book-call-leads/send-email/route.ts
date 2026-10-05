import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/auth/server-auth";

interface SendLeadEmailRequest {
  to: string[];
  subject: string;
  body: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/admin/book-call-leads/send-email
 *
 * Sends an admin-composed (or canned) email to one or more book-call leads.
 * Each recipient gets an individual message so replies stay private.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body: SendLeadEmailRequest = await request.json();
    const recipients = Array.isArray(body.to)
      ? [...new Set(body.to.map((e) => e.trim().toLowerCase()).filter(Boolean))]
      : [];

    if (recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 });
    }
    const invalid = recipients.filter((e) => !EMAIL_REGEX.test(e));
    if (invalid.length > 0) {
      return NextResponse.json({ error: `Invalid email(s): ${invalid.join(", ")}` }, { status: 400 });
    }
    if (!body.subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!body.body?.trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="padding: 24px;">
          ${escapeHtml(body.body).replace(/\n/g, "<br>")}
        </div>
        <p style="font-size: 12px; color: #666; padding: 0 24px 16px;">
          Sent from the KDM &amp; Associates team
        </p>
      </div>
    `;

    const results = await Promise.all(
      recipients.map(async (to) => {
        const result = await sendEmail({
          to,
          subject: body.subject.trim(),
          html,
          text: body.body,
        });
        return { to, ...result };
      })
    );

    const failed = results.filter((r) => !r.success);
    if (failed.length === recipients.length) {
      return NextResponse.json(
        { error: failed[0].error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sent: results.length - failed.length,
      failed: failed.map((f) => ({ to: f.to, error: f.error })),
    });
  } catch (error) {
    console.error("Error sending lead email:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
