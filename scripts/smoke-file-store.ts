/**
 * Round-trip smoke test for lib/file-store.ts against the configured project.
 * Stores a test file, reads it back, verifies sha256, then deletes it.
 */
import { createHash } from "node:crypto";
import { storeFileBuffer, readFileBlob, getFileBlobMeta, deleteFileBlob } from "../lib/file-store";

async function main(): Promise<void> {
  const payload = Buffer.from(`fileBlobs smoke test — ${new Date().toISOString()}\n`.repeat(60000));
  const expectedSha = createHash("sha256").update(payload).digest("hex");

  const stored = await storeFileBuffer({
    buffer: payload,
    fileName: "smoke-test.txt",
    contentType: "text/plain",
    category: "smoke-test",
    isPublic: false,
    ownerUid: "smoke-test-user",
  });
  console.log("STORED", stored.fileId, stored.fileUrl, stored.sizeBytes, "bytes");

  const meta = await getFileBlobMeta(stored.fileId);
  console.log("META", meta ? { fileName: meta.fileName, chunkCount: meta.chunkCount, isPublic: meta.isPublic } : null);

  const file = await readFileBlob(stored.fileId);
  if (!file) throw new Error("read-back returned null");
  const actualSha = createHash("sha256").update(file.buffer).digest("hex");
  console.log("READ", file.buffer.length, "bytes; sha256 match:", actualSha === expectedSha);
  if (actualSha !== expectedSha || file.buffer.length !== payload.length) throw new Error("INTEGRITY MISMATCH");

  await deleteFileBlob(stored.fileId);
  const after = await getFileBlobMeta(stored.fileId);
  console.log("DELETED; meta after delete:", after === null ? "null (ok)" : "STILL PRESENT");
  console.log("DONE");
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
