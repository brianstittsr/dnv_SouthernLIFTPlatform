import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, type LiftClientRecord } from "@/lib/schema";
import { requireDb } from "@/lib/form-builder/server/context";
import { handleRouteError, requireAdminRequester } from "@/lib/form-builder/server/route-helpers";

/** GET /api/lift/reports/clients - client picker options for deep-dive reports (admin only). */
export async function GET(_request: NextRequest) {
  const requester = await requireAdminRequester();
  if (requester instanceof NextResponse) return requester;
  try {
    const snapshot = await requireDb().collection(COLLECTIONS.LIFT_CLIENTS).limit(500).get();
    const data = snapshot.docs
      .map((doc) => {
        const client = doc.data() as LiftClientRecord;
        return { id: doc.id, legalName: client.legalName, status: client.status };
      })
      .sort((a, b) => a.legalName.localeCompare(b.legalName));
    return NextResponse.json({ data });
  } catch (error) {
    return handleRouteError(error, "List LIFT clients failed");
  }
}
