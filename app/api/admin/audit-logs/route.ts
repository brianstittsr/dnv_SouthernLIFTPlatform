import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filtering and pagination
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
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

    // Get total count (for pagination)
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const logsSnapshot = await query.limit(limit).offset(offset).get();

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
