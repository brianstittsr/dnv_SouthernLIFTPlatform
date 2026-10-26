import { NextRequest, NextResponse } from "next/server";
import { LOOKUP_SOURCES } from "@/lib/form-builder/controls";
import { getRequester, jsonError } from "@/lib/form-builder/server/context";
import { getLookupOptions } from "@/lib/form-builder/server/lookups";
import { handleRouteError } from "@/lib/form-builder/server/route-helpers";
import type { LookupSource } from "@/lib/form-builder/types";

/** GET /api/lift/forms/lookups/[source] - options for platform lookup fields. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ source: string }> }) {
  try {
    const { source } = await params;
    if (!LOOKUP_SOURCES.some((item) => item.value === source)) return jsonError("Unknown lookup source", 404);
    const requester = await getRequester();
    const options = await getLookupOptions(source as LookupSource, requester);
    return NextResponse.json({ data: options });
  } catch (error) {
    return handleRouteError(error, "LIFT lookup failed");
  }
}
