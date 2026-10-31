import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-auth";
import { listCaptures } from "@/lib/rea/captures";

/** GET /api/admin/rea/captures — list saved REA captures (admin only). */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const captures = await listCaptures();
  return NextResponse.json(
    captures.map((c) => ({
      id: c.id,
      url: c.url,
      finalUrl: c.finalUrl,
      evidenceId: c.evidenceId,
      status: c.status,
      artifactsRequested: c.artifactsRequested,
      screenshotUrl: c.screenshotUrl,
      domUrl: c.domUrl,
      stepCount: c.steps.length,
      durationMs: c.durationMs,
      environments: c.environments,
      scriptExports: c.scriptExports,
      createdAt: c.createdAt?.toDate?.().toISOString() ?? null,
    }))
  );
}
