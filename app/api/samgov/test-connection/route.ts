import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { getSamGovConfig } from "@/lib/sam-gov-config";

/**
 * POST /api/samgov/test-connection
 *
 * Server-side connectivity test for the SAM.gov API Server. Runs a cheap
 * /api/naics lookup with the configured key and reports the real result.
 * Replaces the browser-side test, which produced false failures due to CORS
 * and exposed the API key in client-side requests.
 *
 * Auth: Firebase ID token of a platform admin.
 */
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

  // Allow testing unsaved values from the settings form; fall back to saved config
  const body = await request.json().catch(() => ({}));
  const override =
    body?.serverUrl && body?.apiKey
      ? { serverUrl: String(body.serverUrl).replace(/\/+$/, ""), apiKey: String(body.apiKey) }
      : null;

  const config = override ?? (await getSamGovConfig());
  if (!config) {
    return NextResponse.json({
      ok: false,
      configured: false,
      error: "SAM.gov integration is not configured. Enter the Server URL and API Key, save settings, then test again.",
    });
  }

  // Persist the outcome so Settings > Integrations shows real status
  const recordStatus = async (status: "connected" | "error") => {
    await db
      .collection("platformSettings")
      .doc("global")
      .set(
        { integrations: { samgov: { status, lastTestedAt: FieldValue.serverTimestamp() } } },
        { merge: true }
      )
      .catch(() => {});
  };

  const started = Date.now();
  try {
    const res = await fetch(`${config.serverUrl}/api/naics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({ q: "541511" }),
      signal: AbortSignal.timeout(20000),
    });
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      const errData = await res.json().catch(() => ({} as { error?: string }));
      await recordStatus("error");
      return NextResponse.json({
        ok: false,
        configured: true,
        status: res.status,
        latencyMs,
        error: errData.error || res.statusText,
      });
    }

    await recordStatus("connected");
    return NextResponse.json({ ok: true, configured: true, status: res.status, latencyMs });
  } catch (error: any) {
    await recordStatus("error");
    return NextResponse.json({
      ok: false,
      configured: true,
      latencyMs: Date.now() - started,
      error: `Could not reach ${config.serverUrl}: ${error.message}`,
    });
  }
}
