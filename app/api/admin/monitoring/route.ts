import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { getSystemMetrics, getCurrentSystemHealth, getUptimeRecords } from "@/lib/monitoring";

/**
 * GET /api/admin/monitoring
 * Get system health metrics
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    if (claims.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const timeRange = (searchParams.get("timeRange") || "hour") as "hour" | "day" | "week" | "month";
    const includeUptime = searchParams.get("includeUptime") === "true";

    // Fetch metrics
    const [currentHealth, metrics, uptimeRecords] = await Promise.all([
      getCurrentSystemHealth(),
      getSystemMetrics(timeRange),
      includeUptime ? getUptimeRecords(30) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      currentHealth,
      metrics,
      uptimeRecords,
      timeRange,
    });
  } catch (error: any) {
    console.error("Error fetching monitoring data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch monitoring data" },
      { status: 500 }
    );
  }
}
