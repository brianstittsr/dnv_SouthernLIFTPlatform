import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/schema";
import { getBucket, getRequester, jsonError, requireDb, writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import type { LiftFormSubmissionDoc } from "@/lib/form-builder/types";

export const runtime = "nodejs";

/** GET /api/lift/submissions/[id]/files/[uploadId] - download an attached file (staff or the respondent). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string; uploadId: string }> }) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const { id, uploadId } = await params;
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).doc(id).get();
    const submission = snapshot.data() as LiftFormSubmissionDoc | undefined;
    if (!submission || (!requester.isStaff && submission.submittedByUid !== requester.uid)) return jsonError("File not found", 404);
    const file = submission.files?.find((item) => item.uploadId === uploadId);
    if (!file) return jsonError("File not found", 404);

    const [buffer] = await getBucket().file(file.storagePath).download();
    await writeAudit("submission.file_downloaded", id, requester, { uploadId });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleRouteError(error, "LIFT file download failed");
  }
}
