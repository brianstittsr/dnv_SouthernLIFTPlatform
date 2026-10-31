import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server-auth";
import { findChromeExecutable, runRea } from "@/lib/rea/runner";

/** GET /api/admin/rea/status — REA version, Chrome detection, admin-gated. */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const chromePath = findChromeExecutable();
  let version: string | null = null;
  let ready = false;
  try {
    const out = await runRea(["--version"], 20_000);
    const match = out.stdout.match(/(\d+\.\d+\.\d+(?:[-+][\w.-]*)?)/);
    version = match?.[1] ?? out.stdout.trim() ?? null;
    ready = out.exitCode === 0;
  } catch {
    // leave version null
  }

  return NextResponse.json({
    ready,
    version,
    chromePath,
    chromeFound: chromePath !== null,
  });
}
