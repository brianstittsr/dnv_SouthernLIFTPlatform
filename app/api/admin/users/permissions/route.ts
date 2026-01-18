import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";

/**
 * GET /api/admin/users/permissions
 * Get user permissions from Firestore
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

    // Get userId from query params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    // Fetch permissions from Firestore
    const permissionsDoc = await db
      .collection("userPermissions")
      .doc(userId)
      .get();

    if (!permissionsDoc.exists) {
      return NextResponse.json({
        basePermissions: [],
        customPermissions: [],
      });
    }

    const permissions = permissionsDoc.data();

    return NextResponse.json({
      basePermissions: permissions?.basePermissions || [],
      customPermissions: permissions?.customPermissions || [],
    });
  } catch (error: any) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
