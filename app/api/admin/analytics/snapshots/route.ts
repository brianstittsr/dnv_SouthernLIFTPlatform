import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import type { Timestamp } from "firebase-admin/firestore";

async function authorize(request: NextRequest): Promise<{ success: boolean; error?: string; status?: number }> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { success: false, error: "Unauthorized", status: 401 };
  }

  const idToken = authorization.split("Bearer ")[1];
  let decoded: any;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    return { success: false, error: "Invalid token", status: 401 };
  }

  const isAdmin =
    decoded.admin === true ||
    decoded.role === "admin" ||
    decoded.role === "platform_admin" ||
    decoded.svpRole === "platform_admin" ||
    (Array.isArray(decoded.svpRoles) && decoded.svpRoles.includes("platform_admin")) ||
    decoded.email?.endsWith("@kdm-assoc.com");

  if (!isAdmin) {
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

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const snapshot = await db
      .collection(COLLECTIONS.ANALYTICS_SNAPSHOTS)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        projectId: data.projectId,
        environment: data.environment,
        from: data.from,
        to: data.to,
        totalVisitors: data.totalVisitors,
        totalPageviews: data.totalPageviews,
        bounceRate: data.bounceRate,
        avgSessionDuration: data.avgSessionDuration,
        topPages: data.topPages,
        topSources: data.topSources,
        fetchedBy: data.fetchedBy,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("Error fetching analytics snapshots:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch snapshots" },
      { status: 500 }
    );
  }
}
