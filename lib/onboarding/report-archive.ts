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
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { storeFileBuffer } from "@/lib/file-store";

/** Roles allowed to see archived onboarding reports in portal Documents. */
const REPORT_ALLOWED_ROLES = ["staff", "platform_admin"];

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

function humanSize(sizeBytes: number): string {
  return sizeBytes >= 1024 * 1024
    ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

/**
 * Stores the report PDF in fileBlobs and records it in the documents
 * collection with tags for document type, owner, and date created so it can
 * be found quickly from portal Documents.
 */
export async function archiveOnboardingReportPdf(
  options: ArchiveOnboardingReportOptions,
): Promise<ArchivedReportRef> {
  if (!db) throw new Error("Database not initialized");
  const { pdf, fileName, ownerName, ownerUid, companyId, companyName } = options;

  const stored = await storeFileBuffer({
    buffer: pdf,
    fileName,
    contentType: "application/pdf",
    category: "onboarding-reports",
    isPublic: false,
    ownerUid,
  });

  // Tags: document type, owner, and date created (ISO), plus the company name
  // for search. Mirrored on the parseTags conventions in /api/upload-file.
  const createdDate = new Date().toISOString().slice(0, 10);
  const tags = [
    "Onboarding Report",
    "LIFT",
    ownerName,
    companyName ?? "",
    createdDate,
  ].filter((tag, index, all): tag is string => {
    const trimmed = tag.trim();
    return Boolean(trimmed) && all.findIndex((t) => t.trim().toLowerCase() === trimmed.toLowerCase()) === index;
  });

  const docRef = await db.collection(COLLECTIONS.DOCUMENTS).add({
    name: fileName,
    type: "pdf",
    size: humanSize(stored.sizeBytes),
    sizeBytes: stored.sizeBytes,
    folder: "Onboarding Report",
    uploadedBy: ownerName,
    uploaderUid: ownerUid,
    companyId: companyId ?? null,
    allowedRoles: REPORT_ALLOWED_ROLES,
    tags,
    uploadedAt: Timestamp.now(),
    shared: false,
    fileId: stored.fileId,
    downloadUrl: stored.fileUrl,
  });

  return { documentId: docRef.id, fileId: stored.fileId };
}
