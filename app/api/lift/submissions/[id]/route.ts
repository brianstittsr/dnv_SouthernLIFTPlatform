import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { COLLECTIONS } from "@/lib/schema";
import { getRequester, jsonError, requireDb, serializeFirestore, writeAudit } from "@/lib/form-builder/server/context";
import { getFormVersion } from "@/lib/form-builder/server/forms-repo";
import { handleRouteError, requireStaffRequester } from "@/lib/form-builder/server/route-helpers";
import type { LiftFormSubmissionDoc } from "@/lib/form-builder/types";

type Params = { params: Promise<{ id: string }> };

/** GET /api/lift/submissions/[id] - submission detail for staff or the respondent who submitted it. */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const requester = await getRequester();
    if (!requester) return jsonError("Authentication required", 401);
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).doc((await params).id).get();
    if (!snapshot.exists) return jsonError("Submission not found", 404);
    const submission = serializeFirestore(snapshot.data() as LiftFormSubmissionDoc);
    if (!requester.isStaff && submission.submittedByUid !== requester.uid) return jsonError("Submission not found", 404);

    const form = await getFormVersion(submission.formId, submission.formVersion);
    const staffSections = new Set((form?.sections ?? []).filter((section) => section.staffOnly).map((section) => section.id));
    const hiddenKeys = new Set(
      (form?.fields ?? []).filter((field) => !requester.isStaff && (field.staffOnly || (field.section && staffSections.has(field.section)))).map((field) => field.key)
    );
    const values = Object.fromEntries(Object.entries(submission.values).filter(([key]) => !hiddenKeys.has(key)));
    return NextResponse.json({
      data: {
        submission: { ...submission, values, aiSummary: requester.isStaff ? submission.aiSummary : undefined },
        form: form ? { title: form.title, sections: form.sections, fields: form.fields.map(({ mappings: _mappings, ...field }) => field) } : null,
      },
    });
  } catch (error) {
    return handleRouteError(error, "Get LIFT submission failed");
  }
}

const reviewSchema = z.object({
  status: z.enum(["submitted", "accepted", "rejected"]).optional(),
  aiSummaryStatus: z.enum(["pending_staff_review", "confirmed", "rejected"]).optional(),
  reviewNote: z.string().max(2000).optional(),
});

/** PATCH /api/lift/submissions/[id] - staff review: accept/reject, confirm the intake AI summary. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const requester = await requireStaffRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid review", 400);
    const ref = requireDb().collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return jsonError("Submission not found", 404);
    const update: Record<string, unknown> = { reviewedByUid: requester.uid, reviewedByName: requester.name, reviewedAt: Timestamp.now() };
    if (parsed.data.status) update.status = parsed.data.status;
    if (parsed.data.reviewNote !== undefined) update.reviewNote = parsed.data.reviewNote;
    if (parsed.data.aiSummaryStatus && snapshot.data()?.aiSummary) update["aiSummary.status"] = parsed.data.aiSummaryStatus;
    await ref.update(update);
    await writeAudit("submission.reviewed", id, requester, parsed.data);
    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    return handleRouteError(error, "Review LIFT submission failed");
  }
}
