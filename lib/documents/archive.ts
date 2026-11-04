/**
 * Shared server-side archive for generated outputs.
 *
 * Stores a generated file (PDF, DOCX, CSV, HTML, ...) in fileBlobs and
 * records it in the portal Documents module with folder, tags, role-based
 * visibility (allowedRoles) and per-member visibility (visibleToUids).
 *
 * A `source` ref ({type, id}) gives every archived output a traceable
 * origin and powers dedupe: archiving the same source twice returns the
 * existing document instead of creating a duplicate.
 *
 * Server-only — imports Firebase Admin.
 */
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { storeFileBuffer } from "@/lib/file-store";

/** Roles that can see restricted generated documents in portal Documents. */
export const STAFF_ONLY_ROLES = ["staff", "platform_admin"];
/** Admin-only visibility for sensitive generated documents. */
export const ADMIN_ONLY_ROLES = ["platform_admin"];

/** Identifies the record a generated output came from — enables dedupe. */
export interface DocumentSource {
  /** Generator kind, e.g. "sent-email", "form-submission", "certificate". */
  type: string;
  /** Source record id (submission id, session id, message id, ...). */
  id: string;
  /** Human-readable label shown as a badge in Documents. */
  label?: string;
}

export interface ArchiveGeneratedDocumentOptions {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  /** fileBlobs category (lowercase, hyphenated) — defaults to "generated". */
  category?: string;
  /** Documents folder — groups the output in the sidebar. */
  folder: string;
  /** Extra tags; the folder name and creation date are added automatically. */
  tags?: string[];
  /** Role keys allowed to see the record; defaults to staff/admin. */
  allowedRoles?: string[];
  /** Individual Firebase uids that can also see + open the document. */
  visibleToUids?: string[];
  /** Display name recorded as uploadedBy. */
  uploadedBy: string;
  /** uid recorded as uploaderUid + fileBlobs ownerUid. */
  uploaderUid?: string | null;
  companyId?: string | null;
  /** Origin record for traceability + dedupe. Omit for one-off outputs. */
  source?: DocumentSource;
}

export interface ArchivedDocumentRef {
  documentId: string;
  fileId: string;
  /** True when a matching source document already existed (no new record). */
  alreadyArchived: boolean;
}

function humanSize(sizeBytes: number): string {
  return sizeBytes >= 1024 * 1024
    ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

/** Documents-page file-kind grouping, mirrored from /api/upload-file. */
export function fileKindForName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "document";
  if (["ppt", "pptx"].includes(ext)) return "presentation";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "image";
  return "other";
}

/** Deduped, trimmed tag list — folder label + ISO date are always included. */
function buildTags(folder: string, extra?: string[]): string[] {
  const createdDate = new Date().toISOString().slice(0, 10);
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of [folder, ...extra ?? [], createdDate]) {
    const tag = raw.trim();
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

/** Finds an existing archived document for the same source, if any. */
export async function findArchivedDocument(
  source: DocumentSource,
): Promise<{ documentId: string; fileId?: string } | null> {
  if (!db) return null;
  const snapshot = await db
    .collection(COLLECTIONS.DOCUMENTS)
    .where("sourceType", "==", source.type)
    .where("sourceId", "==", source.id)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { documentId: doc.id, fileId: doc.data().fileId as string | undefined };
}

/**
 * Stores a generated output in fileBlobs and records it in the documents
 * collection. When `source` is set and a record for that source already
 * exists, the existing reference is returned without storing a duplicate.
 */
export async function archiveGeneratedDocument(
  options: ArchiveGeneratedDocumentOptions,
): Promise<ArchivedDocumentRef> {
  if (!db) throw new Error("Database not initialized");
  const {
    buffer,
    fileName,
    contentType,
    folder,
    tags,
    allowedRoles = STAFF_ONLY_ROLES,
    visibleToUids,
    uploadedBy,
    uploaderUid,
    companyId,
    source,
  } = options;

  if (source) {
    const existing = await findArchivedDocument(source);
    if (existing?.fileId) {
      return { documentId: existing.documentId, fileId: existing.fileId, alreadyArchived: true };
    }
  }

  const stored = await storeFileBuffer({
    buffer,
    fileName,
    contentType,
    category: options.category ?? "generated",
    isPublic: false,
    ownerUid: uploaderUid ?? null,
  });

  const docRef = await db.collection(COLLECTIONS.DOCUMENTS).add({
    name: fileName,
    type: fileKindForName(fileName),
    size: humanSize(stored.sizeBytes),
    sizeBytes: stored.sizeBytes,
    folder,
    uploadedBy,
    uploaderUid: uploaderUid ?? null,
    companyId: companyId ?? null,
    allowedRoles,
    ...(visibleToUids?.length ? { visibleToUids } : {}),
    tags: buildTags(folder, tags),
    uploadedAt: Timestamp.now(),
    shared: false,
    fileId: stored.fileId,
    downloadUrl: stored.fileUrl,
    ...(source ? { sourceType: source.type, sourceId: source.id, ...(source.label ? { sourceLabel: source.label } : {}) } : {}),
  });

  return { documentId: docRef.id, fileId: stored.fileId, alreadyArchived: false };
}
