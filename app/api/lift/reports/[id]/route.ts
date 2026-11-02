import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, type LiftReportDoc } from "@/lib/schema";
import { jsonError, requireDb, serializeFirestore, writeAudit } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";

/** GET /api/lift/reports/[id] - full report including the data pack (admin only). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_REPORTS).doc(id).get();
    if (!snapshot.exists) return jsonError("Report not found", 404);
    return NextResponse.json({ data: serializeFirestore({ ...(snapshot.data() as LiftReportDoc), id: snapshot.id }) });
  } catch (error) {
    return handleRouteError(error, "Get LIFT report failed");
  }
}

/** DELETE /api/lift/reports/[id] - remove a saved report (admin only). */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const { id } = await params;
    const ref = requireDb().collection(COLLECTIONS.LIFT_REPORTS).doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return jsonError("Report not found", 404);
    await ref.delete();
    await writeAudit("report.deleted", id, requester);
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return handleRouteError(error, "Delete LIFT report failed");
  }
}
