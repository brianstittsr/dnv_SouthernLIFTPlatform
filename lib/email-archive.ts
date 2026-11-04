/**
 * Sent-email archive — renders each outgoing email to a branded PDF and
 * files it in the portal Documents "Sent Emails" folder.
 *
 * Called from lib/email.ts after a successful send. Attachments are listed
 * but not embedded (they are archived separately by their own generators).
 * Visibility is staff/admin only — recipients never see these records.
 *
 * Server-only — imports Firebase Admin and puppeteer.
 */
import { db } from "@/lib/firebase-admin";
import { archiveGeneratedDocument } from "@/lib/documents/archive";
import { renderHtmlToPdf } from "@/lib/form-builder/server/pdf";
import type { EmailParams } from "@/lib/email";

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function list(value?: string | string[]): string {
  if (!value) return "—";
  return (Array.isArray(value) ? value : [value]).map(escapeHtml).join(", ");
}

function sizeLabel(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Printable HTML for an archived email: a metadata header block, the
 * message body, and an attachment manifest.
 */
export function buildEmailArchiveHtml(
  params: EmailParams,
  meta: { provider: string; messageId?: string; sentAt: string },
): string {
  const from = params.from
    ? `${escapeHtml(params.from.name)} &lt;${escapeHtml(params.from.email)}&gt;`
    : "Platform default sender";
  const attachmentRows = (params.attachments ?? [])
    .map(
      (att) =>
        `<tr><td>${escapeHtml(att.filename)}</td><td>${escapeHtml(att.contentType ?? "application/octet-stream")}</td><td>${sizeLabel(att.content.length)}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><style>
    @page { size: Letter; margin: 0.7in; }
    body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; color: #1f2933; }
    header { border-bottom: 3px solid #c9a227; padding-bottom: 8px; margin-bottom: 14px; }
    header h1 { margin: 0; color: #0b2545; font-size: 15pt; }
    header .sub { color: #5f6b7a; font-size: 9pt; }
    table.meta { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    table.meta th, table.meta td { text-align: left; vertical-align: top; border: 1px solid #d6dde6; padding: 5px 8px; font-size: 9.5pt; }
    table.meta th { width: 110px; background: #f4f7fb; font-weight: 600; }
    .body { border: 1px solid #d6dde6; padding: 12px 14px; }
    .body img { max-width: 100%; }
    h2 { color: #134074; font-size: 11pt; margin: 18px 0 6px; }
    table.att { width: 100%; border-collapse: collapse; }
    table.att th, table.att td { border: 1px solid #d6dde6; padding: 5px 8px; font-size: 9pt; text-align: left; }
    table.att th { background: #f4f7fb; }
    .notice { color: #8a96a3; font-size: 8.5pt; margin-top: 16px; border-top: 1px solid #d6dde6; padding-top: 6px; }
  </style></head><body>
    <header>
      <h1>Sent Email</h1>
      <div class="sub">Archived copy of an outgoing platform email — internal record.</div>
    </header>
    <table class="meta">
      <tr><th>From</th><td>${from}</td></tr>
      <tr><th>To</th><td>${list(params.to)}</td></tr>
      ${params.cc?.length ? `<tr><th>Cc</th><td>${list(params.cc)}</td></tr>` : ""}
      ${params.bcc?.length ? `<tr><th>Bcc</th><td>${list(params.bcc)}</td></tr>` : ""}
      <tr><th>Subject</th><td>${escapeHtml(params.subject)}</td></tr>
      <tr><th>Sent</th><td>${escapeHtml(meta.sentAt)}</td></tr>
      <tr><th>Provider</th><td>${escapeHtml(meta.provider)}</td></tr>
      ${meta.messageId ? `<tr><th>Message ID</th><td>${escapeHtml(meta.messageId)}</td></tr>` : ""}
      ${params.replyTo ? `<tr><th>Reply-To</th><td>${escapeHtml(params.replyTo)}</td></tr>` : ""}
    </table>
    <div class="body">${params.html}</div>
    ${attachmentRows ? `<h2>Attachments (listed, not embedded)</h2><table class="att"><tr><th>File</th><th>Type</th><th>Size</th></tr>${attachmentRows}</table>` : ""}
    <div class="notice">Archived by the platform Documents module. Staff/admin visibility only.</div>
  </body></html>`;
}

/**
 * Renders a sent email to PDF and files it in Documents under
 * "Sent Emails". Best-effort — callers wrap in try/catch.
 */
export async function archiveSentEmail(
  params: EmailParams,
  meta: { provider: string; messageId?: string },
): Promise<{ documentId: string; fileId: string } | null> {
  // Skip early (before paying for a PDF render) in scripts without admin creds.
  if (!db) return null;
  const sentAt = new Date().toISOString();
  const html = buildEmailArchiveHtml(params, { ...meta, sentAt });
  const pdf = await renderHtmlToPdf(html);
  const recipients = Array.isArray(params.to) ? params.to : [params.to];
  const firstRecipient = recipients[0] ?? "recipient";
  const slug = params.subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "email";
  const fileName = `Email-${slug}-${sentAt.slice(0, 16).replace(/[:T]/g, "-")}.pdf`;

  const archived = await archiveGeneratedDocument({
    buffer: pdf,
    fileName,
    contentType: "application/pdf",
    category: "sent-emails",
    folder: "Sent Emails",
    tags: [
      "Sent Email",
      recipients.length > 1 ? `${recipients.length} recipients` : firstRecipient,
      meta.provider,
    ],
    uploadedBy: "Platform email service",
    uploaderUid: null,
    source: meta.messageId
      ? { type: "sent-email", id: meta.messageId, label: params.subject.slice(0, 80) }
      : undefined,
  });
  return { documentId: archived.documentId, fileId: archived.fileId };
}
