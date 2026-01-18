import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/admin/audit-logs/export
 * Export audit logs to CSV
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

    // Get query parameters (same filters as main endpoint)
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const resource = searchParams.get("resource");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    let query = db.collection("auditLogs").orderBy("timestamp", "desc");

    // Apply filters
    if (userId) {
      query = query.where("userId", "==", userId) as any;
    }

    if (action) {
      query = query.where("action", "==", action) as any;
    }

    if (resource) {
      query = query.where("resource", "==", resource) as any;
    }

    if (startDate) {
      const start = Timestamp.fromDate(new Date(startDate));
      query = query.where("timestamp", ">=", start) as any;
    }

    if (endDate) {
      const end = Timestamp.fromDate(new Date(endDate));
      query = query.where("timestamp", "<=", end) as any;
    }

    // Fetch all matching logs (limit to 10000 for safety)
    const logsSnapshot = await query.limit(10000).get();

    // Convert to CSV
    const logs = logsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp?.toDate().toISOString() || "",
        userId: data.userId || "",
        action: data.action || "",
        resource: data.resource || "",
        resourceId: data.resourceId || "",
        ipAddress: data.ipAddress || "",
        details: JSON.stringify(data.details || {}),
      };
    });

    // Generate CSV content
    const headers = [
      "ID",
      "Timestamp",
      "User ID",
      "Action",
      "Resource",
      "Resource ID",
      "IP Address",
      "Details",
    ];

    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.id,
          log.timestamp,
          log.userId,
          log.action,
          log.resource,
          log.resourceId,
          log.ipAddress,
          `"${log.details.replace(/"/g, '""')}"`, // Escape quotes in JSON
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting audit logs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export audit logs" },
      { status: 500 }
    );
  }
}
