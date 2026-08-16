import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { fetchVercelAnalytics } from "@/lib/analytics-report";

export const dynamic = "force-dynamic";

async function authorize(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  const idToken = authorization.split("Bearer ")[1];
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { success: false, error: "Invalid token", status: 401 };
  }

  if (!decoded.admin && !decoded.email?.endsWith("@kdm-assoc.com")) {
    return { success: false, error: "Forbidden", status: 403 };
  }

  return { success: true };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorize(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId =
      searchParams.get("projectId") ||
      process.env.VERCEL_PROJECT_ID ||
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json({ error: "Vercel project ID not configured" }, { status: 503 });
    }

    const days = parseInt(searchParams.get("days") || "7", 10);
    const environment = searchParams.get("environment") || "production";

    const data = await fetchVercelAnalytics(projectId, days, environment);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Live analytics error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch live analytics" },
      { status: 500 }
    );
  }
}
