import { NextRequest, NextResponse } from "next/server";
import { assignUserRole, USER_ROLES, UserRole } from "@/lib/rbac";
import { auth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    // Verify the requesting user is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    // Parse request body
    const body = await req.json();
    const { userId, role, tenantId, additionalPermissions = [] } = body;

    // Validate inputs
    if (!userId || !role || !tenantId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, role, tenantId" },
        { status: 400 }
      );
    }

    if (!Object.keys(USER_ROLES).includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${Object.keys(USER_ROLES).join(", ")}` },
        { status: 400 }
      );
    }

    // Assign the role
    await assignUserRole(userId, role as UserRole, tenantId, additionalPermissions);

    return NextResponse.json({
      success: true,
      message: `Role ${USER_ROLES[role as UserRole]} assigned to user ${userId}`,
      data: {
        userId,
        role,
        tenantId,
        additionalPermissions,
      },
    });
  } catch (error: any) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign role" },
      { status: 500 }
    );
  }
}
