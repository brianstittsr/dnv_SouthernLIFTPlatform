import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester, requireStaffRequester } from "@/lib/form-builder/server/route-helpers";
import { getInterview, incrementInterviewCounter, listInvites } from "@/lib/interview/server/repo";
import { sendInvites } from "@/lib/interview/server/invites";
import { emailTemplates } from "@/lib/email";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import { archiveGeneratedDocument } from "@/lib/documents/archive";
import { buildEmailArchiveHtml } from "@/lib/email-archive";
import type { InviteSendResult } from "@/lib/interview/server/invites";
import type { LiftInterviewDoc } from "@/lib/interview/types";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Archives one "Sent Emails" record per invite batch: the delivery table plus
 * a rendered copy of the invite email (per-recipient links are not included —
 * they live on the invite records).
 */
async function archiveInviteBatch(
  interview: LiftInterviewDoc,
  results: InviteSendResult[],
  senderName: string,
): Promise<void> {
  const sample = emailTemplates.interviewInvite({
    name: "Recipient",
    interviewTitle: interview.title,
    description: interview.description,
    estimatedMinutes: interview.estimatedMinutes,
    senderName,
    interviewUrl: "(unique tracked link per recipient)",
  });
  const rows = results
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.email)}</td><td>${r.emailSent ? "sent" : `failed — ${escapeHtml(r.error ?? "send error")}`}</td><td>${r.onPlatform ? "yes" : "no"}</td></tr>`,
    )
    .join("");
  const html = buildEmailArchiveHtml(
    { to: results.map((r) => r.email), subject: sample.subject, html: `${sample.html}<h3>Delivery</h3><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:9pt"><tr><th>Recipient</th><th>Email</th><th>On platform</th></tr>${rows}</table>` },
    { provider: "invite-batch", sentAt: new Date().toISOString() },
  );
  const pdf = await renderHtmlToPdf(html);
  await archiveGeneratedDocument({
    buffer: pdf,
    fileName: `Interview-Invites-${interview.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.pdf`,
    contentType: "application/pdf",
    category: "sent-emails",
    folder: "Sent Emails",
    tags: ["Sent Email", "Invite batch", interview.title, `${results.length} recipients`],
    uploadedBy: senderName,
  });
}

const sendSchema = z.object({
  recipients: z
    .array(
      z.object({
        name: z.string().max(200).default(""),
        email: z.string().email().max(320),
      })
    )
    .min(1)
    .max(50),
});

/** GET /api/lift/interviews/[id]/invites - invite delivery status (staff). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireStaffRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    return NextResponse.json({ data: await listInvites(id) });
  } catch (error) {
    return handleRouteError(error, "List invites failed");
  }
}

/** POST /api/lift/interviews/[id]/invites - create + send interview invites (admin). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const interview = await getInterview(id);
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    if (interview.status !== "published") {
      return NextResponse.json({ error: "Publish the interview before sending invites" }, { status: 400 });
    }

    const parsed = sendSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid recipients — provide 1-50 {name, email} entries" }, { status: 400 });

    const results = await sendInvites(interview, parsed.data.recipients, requester);
    await incrementInterviewCounter(id, "invitesSent", results.length);
    await writeAudit("interview.invitesSent", id, requester, { count: results.length, failed: results.filter((r) => !r.emailSent).length });

    // One "Sent Emails" record per batch — per-invite sends opt out of the
    // automatic email archive to avoid N PDF renders. Best-effort.
    try {
      await archiveInviteBatch(interview, results, requester.name);
    } catch (archiveError) {
      console.error("Invite batch archive failed:", archiveError);
    }
    return NextResponse.json({ data: results }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "Send invites failed");
  }
}
