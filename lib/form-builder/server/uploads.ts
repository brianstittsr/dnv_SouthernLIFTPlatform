import { randomUUID } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { ALLOWED_UPLOAD_TYPES, MAX_SIGNATURE_BYTES, MAX_UPLOAD_BYTES } from "../controls";
import { sha256 } from "../hash";
import type { FormField, StoredFile, UploadRef } from "../types";
import { requireDb, type Requester } from "./context";

const ZIP = [0x50, 0x4b, 0x03, 0x04];
const OLE = [0xd0, 0xcf, 0x11, 0xe0];
const SIGNATURES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [ZIP],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [ZIP],
  "application/msword": [OLE],
  "application/vnd.ms-excel": [OLE],
};

/** Raw bytes per Firestore chunk doc; base64 keeps each doc under the 1 MiB limit. */
const CHUNK_BYTES = 600 * 1024;

/** Confirms file bytes match the declared type (text/csv must not contain binary NUL bytes). */
function matchesDeclaredType(buffer: Buffer, contentType: string): boolean {
  if (contentType === "text/csv") return !buffer.subarray(0, 4096).includes(0);
  const signatures = SIGNATURES[contentType];
  return Boolean(signatures?.some((signature) => signature.every((byte, index) => buffer[index] === byte)));
}

/** Keeps a readable, storage-safe file name. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return (cleaned || "file").slice(-120);
}

/** Writes a buffer as base64 chunk docs under liftFormUploads/{uploadId}/chunks. */
async function writeFileRecord(options: {
  uploadId: string;
  formSlug: string | null;
  kind: "upload" | "signature";
  fileName: string;
  contentType: string;
  buffer: Buffer;
  ownerUid: string | null;
  ipHash: string;
  parentSubmissionId?: string;
  status: "pending" | "attached";
}): Promise<void> {
  const { uploadId, buffer, ...rest } = options;
  const db = requireDb();
  const docRef = db.collection(COLLECTIONS.LIFT_FORM_UPLOADS).doc(uploadId);
  const chunkCount = Math.ceil(buffer.length / CHUNK_BYTES);
  const batch = db.batch();
  batch.set(docRef, {
    uploadId,
    ...rest,
    sizeBytes: buffer.length,
    sha256: sha256(buffer),
    chunkCount,
    createdAt: Timestamp.now(),
  });
  for (let index = 0; index < chunkCount; index += 1) {
    const chunk = buffer.subarray(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES);
    batch.set(docRef.collection("chunks").doc(String(index).padStart(4, "0")), {
      index,
      dataBase64: chunk.toString("base64"),
    });
  }
  await batch.commit();
}

/** Reads a stored file back from its base64 chunk docs. */
export async function readUploadBytes(uploadId: string): Promise<Buffer> {
  const collection = requireDb().collection(COLLECTIONS.LIFT_FORM_UPLOADS);
  const snapshot = await collection.doc(uploadId).get();
  const data = snapshot.data();
  if (!data) throw new Error("File not found");
  const chunks = await collection.doc(uploadId).collection("chunks").orderBy("index").get();
  if (chunks.empty && typeof data.dataBase64 === "string") return Buffer.from(data.dataBase64, "base64");
  return Buffer.concat(chunks.docs.map((doc) => Buffer.from(doc.data().dataBase64 as string, "base64")));
}

/** Validates and stores an uploaded file as pending until a submission claims it. */
export async function storeUpload(options: {
  file: File;
  formSlug: string;
  requester: Requester | null;
  ipHash: string;
}): Promise<UploadRef> {
  const { file, formSlug, requester, ipHash } = options;
  const contentType = file.type;
  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(contentType)) throw new Error("This file type is not allowed");
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) throw new Error(`Files must be smaller than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesDeclaredType(buffer, contentType)) throw new Error("The file contents do not match its type");

  const uploadId = randomUUID();
  const fileName = safeFileName(file.name);
  await writeFileRecord({
    uploadId,
    formSlug,
    kind: "upload",
    fileName,
    contentType,
    buffer,
    ownerUid: requester?.uid ?? null,
    ipHash,
    status: "pending",
  });
  return { uploadId, fileName, contentType, sizeBytes: buffer.length };
}

/**
 * Verifies that upload references belong to this requester and form, and returns
 * their stored metadata. Uploads are marked attached by the submission transaction.
 */
export async function resolveUploads(options: {
  field: FormField;
  refs: UploadRef[];
  formSlug: string;
  requester: Requester | null;
  ipHash: string;
}): Promise<StoredFile[]> {
  const { field, refs, formSlug, requester, ipHash } = options;
  const collection = requireDb().collection(COLLECTIONS.LIFT_FORM_UPLOADS);
  const files: StoredFile[] = [];
  for (const ref of refs) {
    const snapshot = await collection.doc(ref.uploadId).get();
    const data = snapshot.data();
    if (!data || data.status !== "pending" || data.formSlug !== formSlug) throw new Error(`${field.label}: an uploaded file is missing or already used`);
    const sameOwner = requester ? data.ownerUid === requester.uid : !data.ownerUid && data.ipHash === ipHash;
    if (!sameOwner) throw new Error(`${field.label}: an uploaded file is not yours`);
    if (field.accept?.length && !field.accept.includes(data.contentType)) throw new Error(`${field.label}: this file type is not accepted`);
    files.push({
      fieldKey: field.key,
      uploadId: ref.uploadId,
      fileName: data.fileName,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      sha256: data.sha256,
    });
  }
  return files;
}

/** Stores a drawn signature PNG as an attached upload record. Returns its upload id and hash. */
export async function storeSignatureImage(dataUrl: string, submissionId: string, fieldKey: string): Promise<{ uploadId: string; sha256: string }> {
  const prefix = "data:image/png;base64,";
  if (!dataUrl.startsWith(prefix)) throw new Error("Signature must be a PNG image");
  const buffer = Buffer.from(dataUrl.slice(prefix.length), "base64");
  if (buffer.length === 0 || buffer.length > MAX_SIGNATURE_BYTES || !matchesDeclaredType(buffer, "image/png")) throw new Error("Signature image is invalid");
  const uploadId = randomUUID();
  await writeFileRecord({
    uploadId,
    formSlug: null,
    kind: "signature",
    fileName: `signature-${fieldKey}.png`,
    contentType: "image/png",
    buffer,
    ownerUid: null,
    ipHash: "signature",
    parentSubmissionId: submissionId,
    status: "attached",
  });
  return { uploadId, sha256: sha256(buffer) };
}
