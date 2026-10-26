import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/schema";
import { requireDb, serializeFirestore } from "@/lib/form-builder/server/context";
import { handleRouteError, requireStaffRequester } from "@/lib/form-builder/server/route-helpers";
import type { LiftFormSubmissionDoc } from "@/lib/form-builder/types";

/** GET /api/lift/submissions?formSlug=&liftClientId=&limit= - recent submissions (staff). */
export async function GET(request: NextRequest) {
  const requester = await requireStaffRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const params = request.nextUrl.searchParams;
    const limit = Math.min(Number(params.get("limit") ?? 100) || 100, 500);
    let query: FirebaseFirestore.Query = requireDb().collection(COLLECTIONS.LIFT_FORM_SUBMISSIONS);
    const formSlug = params.get("formSlug");
    const liftClientId = params.get("liftClientId");
    if (formSlug) query = query.where("formSlug", "==", formSlug);
    if (liftClientId) query = query.where("liftClientId", "==", liftClientId);
    const snapshot = await query.limit(limit).get();
    const data = snapshot.docs
      .map((doc) => serializeFirestore(doc.data() as LiftFormSubmissionDoc))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ values: _values, signatures: _signatures, ...summary }) => {
        void _values;
        void _signatures;
        return summary;
      });
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, "List LIFT submissions failed");
  }
}
