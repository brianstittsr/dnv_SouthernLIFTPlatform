import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/schema";
import { getRequester, jsonError, requireDb, serializeFirestore, writeAudit } from "@/lib/form-builder/server/context";
import { getFormVersion } from "@/lib/form-builder/server/forms-repo";
import { renderSubmissionPdf } from "@/lib/form-builder/server/pdf";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import type { LiftFormSubmissionDoc } from "@/lib/form-builder/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** GET /api/lift/submissions/[id]/pdf - branded PDF of a submission (staff or the respondent). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const { id } = await params;
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).doc(id).get();
    if (!snapshot.exists) return jsonError("Submission not found", 404);
    const submission = serializeFirestore(snapshot.data() as LiftFormSubmissionDoc);
    if (!requester.isStaff && submission.submittedByUid !== requester.uid) return jsonError("Submission not found", 404);
    const form = await getFormVersion(submission.formId, submission.formVersion);
    if (!form) return jsonError("Form not found", 404);

    const pdf = await renderSubmissionPdf(form, submission, requester.isStaff);
    await writeAudit("submission.pdf_exported", id, requester);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${form.slug}-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, "LIFT submission PDF failed");
  }
}
