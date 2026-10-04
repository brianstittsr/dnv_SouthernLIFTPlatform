import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { runSamGovSync } from "@/lib/samgov-sync";

/**
 * POST /api/admin/samgov/sync-now
 *
 * Manual trigger for the SAM.gov sync pipeline — same code path as the cron,
 * including the concurrency lock and run log. Lets admins verify/fix the
 * integration without waiting for the daily run.
 *
 * GET returns the most recent samgovSyncRuns entries for the monitor UI.
 *
 * Auth: Firebase ID token of a platform admin.
 */

export const maxDuration = 300;

async function authorizeAdmin(request: NextRequest): Promise<boolean> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const idToken = authorization.split("Bearer ")[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    const claims = decoded as { role?: string; admin?: boolean };
    if (claims.role === "platform_admin" || claims.admin === true) return true;

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    const userData = userDoc.data();
    return userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
  }
  if (!(await authorizeAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await runSamGovSync("admin");
  return NextResponse.json(results);
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
  }
  if (!(await authorizeAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const runsSnap = await db
    .collection(COLLECTIONS.SAMGOV_SYNC_RUNS)
    .orderBy("startedAt", "desc")
    .limit(10)
    .get();

  const runs = runsSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      triggeredBy: data.triggeredBy,
      status: data.status,
      startedAt: data.startedAt?.toDate?.().toISOString() ?? null,
      finishedAt: data.finishedAt?.toDate?.().toISOString() ?? null,
      results: data.results ?? null,
    };
  });

  return NextResponse.json({ runs });
}
