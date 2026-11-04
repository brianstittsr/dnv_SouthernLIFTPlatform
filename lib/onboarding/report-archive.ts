/**
 * Server-side helper that archives the LIFT client onboarding completion
 * report PDF into the portal Documents module for quick reference.
 *
 * The documents record is restricted to staff/platform admins (the report
 * contains internal service-gap analysis); the file blob is private but the
 * completing user can still open it via /api/files as its ownerUid.
 *
 * Imported by app/api/onboarding/completion-report and
 * scripts/rerun-onboarding-report.ts — keep server-only.
 */
import { archiveGeneratedDocument } from "@/lib/documents/archive";

export interface ArchiveOnboardingReportOptions {
  pdf: Buffer;
  fileName: string;
  /** Display name of the user who completed onboarding. */
  ownerName: string;
  /** Firebase Auth uid of the user who completed onboarding. */
  ownerUid: string;
  companyId?: string | null;
  /** Company name — added as a tag for search. */
  companyName?: string;
}

export interface ArchivedReportRef {
  documentId: string;
  fileId: string;
}

/**
 * Stores the report PDF in fileBlobs and records it in the documents
 * collection with tags for document type, owner, and date created so it can
 * be found quickly from portal Documents.
 */
export async function archiveOnboardingReportPdf(
  options: ArchiveOnboardingReportOptions,
): Promise<ArchivedReportRef> {
  const archived = await archiveGeneratedDocument({
    buffer: options.pdf,
    fileName: options.fileName,
    contentType: "application/pdf",
    category: "onboarding-reports",
    folder: "Onboarding Report",
    tags: ["LIFT", options.ownerName, options.companyName ?? ""],
    uploadedBy: options.ownerName,
    uploaderUid: options.ownerUid,
    companyId: options.companyId,
  });
  return { documentId: archived.documentId, fileId: archived.fileId };
}
