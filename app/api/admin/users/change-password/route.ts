import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/admin/users/change-password
 * Admin-forced password reset for a user
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    const claims = decodedToken as any;

    let isAdmin = claims.role === "platform_admin";
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();
      const userData = userDoc.data();
      isAdmin = userData?.role === "platform_admin" || userData?.svpRole === "platform_admin";
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields: userId, newPassword" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Prevent admins from accidentally changing their own password via this flow
    // (they should use the self-service change-password page)
    if (userId === decodedToken.uid) {
      return NextResponse.json(
        { error: "Use the Change Password page to update your own password" },
        { status: 400 }
      );
    }

    // Verify the target user exists before attempting update
    let userRecord;
    try {
      userRecord = await auth.getUser(userId);
    } catch (lookupError: any) {
      console.error("Failed to lookup user for password change:", lookupError);
      return NextResponse.json(
        { error: "User not found in Firebase Authentication" },
        { status: 404 }
      );
    }

    // Update the password in Firebase Auth
    await auth.updateUser(userId, { password: newPassword });

    // Mark the user as needing to change password on next sign-in if applicable
    await db.collection("users").doc(userId).set(
      {
        hasChangedPassword: false,
        isTempPassword: true,
        tempPassword: newPassword,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Log audit event
    await db.collection("auditLogs").add({
      userId: decodedToken.uid,
      action: "admin_password_changed",
      resource: "user",
      resourceId: userId,
      details: { targetEmail: userRecord.email },
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Error changing user password:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}
