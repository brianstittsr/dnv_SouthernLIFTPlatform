import { NextRequest, NextResponse } from "next/server";
import { runSamGovSync } from "@/lib/samgov-sync";

/**
 * GET /api/cron/samgov-sync
 *
 * Daily cron trigger for the SAM.gov opportunity pipeline. The actual work
 * lives in lib/samgov-sync.ts (shared with the admin sync-now route) and
 * includes concurrency locking, a stale-lock self-heal, and a persistent
 * run log in samgovSyncRuns.
 *
 * Auth: requires Authorization: Bearer $CRON_SECRET (the same header Vercel
 * Cron sends automatically when the env var is set). Fails closed — an
 * unset CRON_SECRET locks the endpoint rather than leaving it public.
 */

export const maxDuration = 300; // seconds — Vercel Pro max for cron routes

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured — endpoint disabled" },
      { status: 503 }
    );
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runSamGovSync("cron");
  const status = results.errors.length > 0 && results.opportunitiesFetched === 0 ? 502 : 200;
  return NextResponse.json(results, { status });
}
