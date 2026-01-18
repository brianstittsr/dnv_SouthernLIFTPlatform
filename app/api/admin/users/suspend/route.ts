import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { suspendUser, reactivateUser } from "@/lib/rbac";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/admin/users/suspend
 * Suspend or reactivate a user account
 */
export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json();
    const { userId, suspend } = body;

    if (!userId || typeof suspend !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: userId, suspend (boolean)" },
        { status: 400 }
      );
    }

    // Prevent self-suspension
    if (userId === decodedToken.uid) {
      return NextResponse.json(
        { error: "Cannot suspend your own account" },
        { status: 400 }
      );
    }

    // Suspend or reactivate user
    if (suspend) {
      await suspendUser(userId);
      await auth.updateUser(userId, { disabled: true });
    } else {
      await reactivateUser(userId);
      await auth.updateUser(userId, { disabled: false });
    }

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: suspend ? "user_suspended" : "user_reactivated",
      resource: "user",
      resourceId: userId,
      details: { suspend },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: suspend
        ? "User suspended successfully"
        : "User reactivated successfully",
    });
  } catch (error: any) {
    console.error("Error suspending/reactivating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user status" },
      { status: 500 }
    );
  }
}
