/**
 * Generic file store — persists file bytes in Firestore as base64 chunk
 * documents instead of Firebase Storage.
 *
 * Layout:
 *   fileBlobs/{fileId}          — metadata doc (no file contents)
 *   fileBlobs/{fileId}/chunks/{NNNN} — ordered base64 payload chunks
 *
 * Served to browsers through /api/files/{fileId}, which enforces the
 * `isPublic` / `ownerUid` access rules on the metadata doc.
 */

import { randomUUID, createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";

/** Raw bytes per chunk doc; base64 keeps each doc safely under the 1 MiB limit. */
const CHUNK_BYTES = 600 * 1024;
/** Firestore batches cap at 500 writes; leave headroom under that. */
const MAX_BATCH_OPS = 450;

export interface FileBlobDoc {
  fileId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  chunkCount: number;
  category: string;
  isPublic: boolean;
  ownerUid: string | null;
  createdAt: Timestamp;
}

export interface StoreFileOptions {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  category?: string;
  /** Public files are served by /api/files without a session. */
  isPublic?: boolean;
  ownerUid?: string | null;
}

export interface StoredFileRef {
  fileId: string;
  fileUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
}

function requireDb(): FirebaseFirestore.Firestore {
  if (!db) throw new Error("Database not initialized");
  return db;
}

/** Keeps a readable, filesystem-safe file name. */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return (cleaned || "file").slice(-120);
}

/** Public URL that streams this file back through the app. */
export function fileBlobUrl(fileId: string): string {
  return `/api/files/${fileId}`;
}

/** Writes a buffer into fileBlobs as a metadata doc plus base64 chunk docs. */
export async function storeFileBuffer(options: StoreFileOptions): Promise<StoredFileRef> {
  const firestore = requireDb();
  const fileId = randomUUID();
  const fileName = safeFileName(options.fileName);
  const chunkCount = Math.max(1, Math.ceil(options.buffer.length / CHUNK_BYTES));
  const docRef = firestore.collection(COLLECTIONS.FILE_BLOBS).doc(fileId);

  const meta: FileBlobDoc = {
    fileId,
    fileName,
    contentType: options.contentType || "application/octet-stream",
    sizeBytes: options.buffer.length,
    sha256: createHash("sha256").update(options.buffer).digest("hex"),
    chunkCount,
    category: options.category ?? "general",
    isPublic: options.isPublic ?? false,
    ownerUid: options.ownerUid ?? null,
    createdAt: Timestamp.now(),
  };

  // Write metadata + chunks in batches of <= 450 operations.
  let batch = firestore.batch();
  let ops = 0;
  const commits: Promise<FirebaseFirestore.WriteResult[]>[] = [];
  batch.set(docRef, meta);
  ops += 1;
  for (let index = 0; index < chunkCount; index += 1) {
    const chunk = options.buffer.subarray(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES);
    batch.set(docRef.collection("chunks").doc(String(index).padStart(4, "0")), {
      index,
      dataBase64: chunk.toString("base64"),
    });
    ops += 1;
    if (ops >= MAX_BATCH_OPS) {
      commits.push(batch.commit());
      batch = firestore.batch();
      ops = 0;
    }
  }
  commits.push(batch.commit());
  await Promise.all(commits);

  return {
    fileId,
    fileUrl: fileBlobUrl(fileId),
    fileName,
    contentType: meta.contentType,
    sizeBytes: meta.sizeBytes,
    sha256: meta.sha256,
  };
}

/** Reads a file's metadata doc; null when it does not exist. */
export async function getFileBlobMeta(fileId: string): Promise<FileBlobDoc | null> {
  const snapshot = await requireDb().collection(COLLECTIONS.FILE_BLOBS).doc(fileId).get();
  const data = snapshot.data();
  return data ? (data as FileBlobDoc) : null;
}

/** Reassembles file bytes from the chunk subcollection (or a legacy single-doc payload). */
export async function readFileBlob(fileId: string): Promise<{ buffer: Buffer; meta: FileBlobDoc } | null> {
  const collection = requireDb().collection(COLLECTIONS.FILE_BLOBS);
  const docRef = collection.doc(fileId);
  const snapshot = await docRef.get();
  const meta = snapshot.data() as (FileBlobDoc & { dataBase64?: string }) | undefined;
  if (!meta) return null;
  const chunks = await docRef.collection("chunks").orderBy("index").get();
  const buffer = chunks.empty && typeof meta.dataBase64 === "string"
    ? Buffer.from(meta.dataBase64, "base64")
    : Buffer.concat(chunks.docs.map((doc) => Buffer.from(doc.data().dataBase64 as string, "base64")));
  return { buffer, meta };
}

/** Deletes a file's metadata doc and all of its chunk docs. */
export async function deleteFileBlob(fileId: string): Promise<void> {
  const firestore = requireDb();
  const docRef = firestore.collection(COLLECTIONS.FILE_BLOBS).doc(fileId);
  const chunks = await docRef.collection("chunks").get();
  let batch = firestore.batch();
  let ops = 0;
  const commits: Promise<FirebaseFirestore.WriteResult[]>[] = [];
  for (const chunkDoc of chunks.docs) {
    batch.delete(chunkDoc.ref);
    ops += 1;
    if (ops >= MAX_BATCH_OPS) {
      commits.push(batch.commit());
      batch = firestore.batch();
      ops = 0;
    }
  }
  batch.delete(docRef);
  commits.push(batch.commit());
  await Promise.all(commits);
}
